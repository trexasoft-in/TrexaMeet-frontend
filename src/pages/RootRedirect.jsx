import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/auth.store';
import {
  bootstrapCentralAuthSession,
  getSession,
  getRefreshToken,
  setSession,
  clearSession,
} from '../lib/auth';
import Loader from '../components/common/Loader';
import { getCentralAuthBase } from '../lib/centralAuth';

export default function RootRedirect() {
  const user = useAuthStore(s => s.user);
  const hydrated = useAuthStore(s => s.hydrated);
  const setStoreSession = useAuthStore(s => s.setSession);
  const setHydrated = useAuthStore(s => s.setHydrated);
  const navigate = useNavigate();

  useEffect(() => {
    // If already hydrated (e.g. hot reload), just redirect immediately
    if (hydrated) {
      navigate(user ? '/dashboard' : '/landing', { replace: true });
      return;
    }

    const init = async () => {
      // Step 1: Token arriving from CentralAuth redirect via URL params
      const fromUrl = bootstrapCentralAuthSession();
      if (fromUrl?.accessToken && fromUrl?.user) {
        setStoreSession(fromUrl);
        navigate('/dashboard', { replace: true });
        return;
      }

      // Step 2: Rehydrate from localStorage
      const stored = getSession();
      if (stored?.accessToken && stored?.user) {
        try {
          const { jwtDecode } = await import('jwt-decode');
          const { exp } = jwtDecode(stored.accessToken);
          const isExpired = exp ? Date.now() / 1000 > exp - 30 : false;
          if (!isExpired) {
            setStoreSession(stored);
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch {
          // jwtDecode failed, try refresh
        }

        // Step 3: Token expired — try refresh
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const base = getCentralAuthBase();
            const { data } = await axios.post(`${base}/api/auth/refresh`, { refreshtoken: refreshToken });
            const newToken = data?.accesstoken || data?.accessToken;
            if (newToken) {
              const refreshed = { accessToken: newToken, user: stored.user };
              setSession(refreshed);
              setStoreSession(refreshed);
              navigate('/dashboard', { replace: true });
              return;
            }
          } catch {
            clearSession();
          }
        } else {
          clearSession();
        }
      }

      // Step 4: No valid session — go to landing
      setHydrated(true);
      navigate('/landing', { replace: true });
    };

    init();
  }, []); // eslint-disable-line

  return (
    <div className="auth-loading">
      <div className="auth-loading-inner">
        <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />
        <Loader />
      </div>
    </div>
  );
}
