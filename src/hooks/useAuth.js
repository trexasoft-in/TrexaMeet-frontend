import { useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/auth.store';
import {
  bootstrapCentralAuthSession,
  getSession,
  getRefreshToken,
  setSession,
  clearSession,
} from '../lib/auth';

export default function useAuth() {
  const user = useAuthStore(s => s.user);
  const hydrated = useAuthStore(s => s.hydrated);
  const accessToken = useAuthStore(s => s.accessToken);
  const setStoreSession = useAuthStore(s => s.setSession);
  const setHydrated = useAuthStore(s => s.setHydrated);

  useEffect(() => {
    const init = async () => {
      // Step 1 — Token arriving from CentralAuth redirect via URL params
      const fromUrl = bootstrapCentralAuthSession();
      if (fromUrl?.accessToken && fromUrl?.user) {
        setStoreSession(fromUrl);
        return;
      }

      // Step 2 — Rehydrate from localStorage (survives browser restart)
      const stored = getSession();
      if (stored?.accessToken && stored?.user) {
        // Check if access token is still valid by decoding expiry
        try {
          const { jwtDecode } = await import('jwt-decode');
          const { exp } = jwtDecode(stored.accessToken);
          const isExpired = exp && (Date.now() / 1000 > exp - 30);

          if (!isExpired) {
            // Token still valid — restore session directly
            setStoreSession(stored);
            return;
          }
        } catch {
          // jwtDecode failed — treat as expired, try refresh
        }

        // Step 3 — Access token expired, try refresh token
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const base = import.meta.env.VITE_CENTRAL_AUTH_URL.replace(/\/$/, '');
            const { data } = await axios.post(`${base}/api/auth/refresh`, { refreshtoken: refreshToken });
            const newToken = data?.accesstoken || data?.accessToken;

            if (newToken) {
              const refreshed = { accessToken: newToken, user: stored.user };
              setSession(refreshed);
              setStoreSession(refreshed);
              return;
            }
          } catch {
            // Refresh token expired or invalid — force logout
            clearSession();
            setHydrated(true);
            return;
          }
        }

        // No refresh token available — clear and require login
        clearSession();
        setHydrated(true);
        return;
      }

      // Step 4 — Truly no session
      setHydrated(true);
    };

    init();
  }, []); // eslint-disable-line

  return { user, hydrated, accessToken };
}
