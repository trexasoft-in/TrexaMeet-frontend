import { useEffect } from 'react';
import Loader from '../components/common/Loader';
import useAuthStore from '../store/auth.store';
import { goToCentralLogin } from '../lib/centralAuth';

export default function AuthGuard({ children }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !user) {
      goToCentralLogin(window.location.href);
    }
  }, [hydrated, user]);

  if (!hydrated) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-inner">
          <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />
          <Loader />
        </div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
