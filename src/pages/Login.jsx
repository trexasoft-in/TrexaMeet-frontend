import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getSession();
    if (existing?.accessToken && existing?.user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const appUrl = window.location.origin;
    const returnTo = encodeURIComponent(appUrl);
    const authBase = (import.meta.env.VITE_CENTRAL_AUTH_URL || "").replace(/\/$/, "");

    if (!authBase) {
      navigate("/landing", { replace: true });
      return;
    }

    window.location.href = `${authBase}/auth/login?returnTo=${returnTo}`;
  }, [navigate]);

  return (
    <div className="auth-loading">
      <div className="auth-loading-inner">
        <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />
        <p>Redirecting to sign in...</p>
      </div>
    </div>
  );
}
