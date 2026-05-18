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
    if (hydrated) {
      navigate(user ? "/dashboard" : "/landing", { replace: true });
      return;
    }

    const init = async () => {
      const fromUrl = bootstrapCentralAuthSession();
      if (fromUrl?.accessToken && fromUrl?.user) {
        setStoreSession(fromUrl);
        navigate("/dashboard", { replace: true });
        return;
      }

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
        } catch {}
      }

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const base = (import.meta.env.VITE_CENTRAL_AUTH_URL || "").replace(/\/$/, "");
          const data = await axios.post(`${base}/api/auth/refresh`, {
            refreshtoken: refreshToken,
          });

          const newToken = data?.data?.accesstoken || data?.data?.accessToken;
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
