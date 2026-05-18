import { useEffect } from "react";
import axios from "axios";
import useAuthStore from "../store/auth.store";
import {
  bootstrapCentralAuthSession,
  getSession,
  getRefreshToken,
  setSession,
  clearSession,
} from "../lib/auth";

export default function useAuth() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setStoreSession = useAuthStore((s) => s.setSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    const init = async () => {
      // 1. Check if CentralAuth redirected back with tokens in URL
      const fromUrl = bootstrapCentralAuthSession();
      if (fromUrl?.accessToken && fromUrl?.user) {
        setStoreSession(fromUrl);
        return;
      }

      // 2. Check existing valid session in localStorage
      const stored = getSession();
      if (stored?.accessToken && stored?.user) {
        try {
          const { jwtDecode } = await import("jwt-decode");
          const { exp } = jwtDecode(stored.accessToken);
          const isExpired = exp ? Date.now() / 1000 > exp - 30 : false;
          if (!isExpired) {
            setStoreSession(stored);
            return;
          }
        } catch {
          // malformed token, fall through to refresh
        }
      }

      // 3. Try to refresh using CentralAuth API backend (not frontend!)
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const base = (import.meta.env.VITE_CENTRAL_AUTH_API_URL || "").replace(/\/$/, "");
          const { data } = await axios.post(`${base}/api/auth/refresh`, {
            refreshtoken: refreshToken,
          });
          const newToken = data?.accesstoken || data?.accessToken;
          if (newToken && stored?.user) {
            const refreshed = { accessToken: newToken, user: stored.user };
            setSession(refreshed);
            setStoreSession(refreshed);
            return;
          }
        } catch {
          clearSession();
          setHydrated(true);
          return;
        }
      }

      clearSession();
      setHydrated(true);
    };

    init();
  }, [setHydrated, setStoreSession]);

  return { user, hydrated, accessToken };
}
