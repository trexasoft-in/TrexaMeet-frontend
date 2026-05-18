import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/auth.store";
import {
  bootstrapCentralAuthSession,
  getSession,
  getRefreshToken,
  setSession,
  clearSession,
} from "../lib/auth";
import Loader from "../components/common/Loader";

export default function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setStoreSession = useAuthStore((s) => s.setSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const navigate = useNavigate();

  useEffect(() => {
    // Already hydrated — just route
    if (hydrated) {
      navigate(user ? "/dashboard" : "/landing", { replace: true });
      return;
    }

    const init = async () => {
      // 1. CentralAuth redirect handoff
      const fromUrl = bootstrapCentralAuthSession();
      if (fromUrl?.accessToken && fromUrl?.user) {
        setStoreSession(fromUrl);
        navigate("/dashboard", { replace: true });
        return;
      }

      // 2. Valid stored session
      const stored = getSession();
      if (stored?.accessToken && stored?.user) {
        try {
          const { jwtDecode } = await import("jwt-decode");
          const { exp } = jwtDecode(stored.accessToken);
          const isExpired = exp ? Date.now() / 1000 > exp - 30 : false;
          if (!isExpired) {
            setStoreSession(stored);
            navigate("/dashboard", { replace: true });
            return;
          }
        } catch {
          // malformed token, fall through
        }
      }

      // 3. Refresh via CentralAuth API backend (NOT the frontend host)
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const base = (import.meta.env.VITE_CENTRAL_AUTH_API_URL || "").replace(/\/$/, "");
          const { data } = await axios.post(`${base}/api/auth/refresh`, {
            refreshtoken: refreshToken,
          });
          // CentralAuth backend returns { accesstoken } at top level
          const newToken = data?.accesstoken || data?.accessToken;
          if (newToken && stored?.user) {
            const refreshed = { accessToken: newToken, user: stored.user };
            setSession(refreshed);
            setStoreSession(refreshed);
            navigate("/dashboard", { replace: true });
            return;
          }
        } catch {
          clearSession();
        }
      } else {
        clearSession();
      }

      setHydrated(true);
      navigate("/landing", { replace: true });
    };

    init();
  }, [hydrated, navigate, setHydrated, setStoreSession, user]);

  return (
    <div className="auth-loading">
      <div className="auth-loading-inner">
        <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />
        <Loader />
      </div>
    </div>
  );
}
