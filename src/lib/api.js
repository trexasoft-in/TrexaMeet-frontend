import axios from 'axios';
import { getSession, clearSession, getRefreshToken, setSession } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(config => {
  const session = getSession();
  const token = session?.accessToken || session?.accesstoken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — try one silent refresh, then give up
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearSession();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const base = import.meta.env.VITE_CENTRAL_AUTH_URL.replace(/\/$/, '');
        const { data } = await axios.post(`${base}/api/auth/refresh`, { refreshtoken: refreshToken });
        const newToken = data?.accesstoken || data?.accessToken;

        if (!newToken) throw new Error('No token in refresh response');

        const stored = getSession();
        setSession({ accessToken: newToken, user: stored?.user });

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error?.response?.status === 403) {
      clearSession();
    }

    return Promise.reject(error);
  }
);

export default api;
