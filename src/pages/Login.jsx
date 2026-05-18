import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { goToCentralLogin, getTrexaMeetBase } from '../lib/centralAuth';

export default function Login() {
  const location = useLocation();

  useEffect(() => {
    const returnTo = `${getTrexaMeetBase()}${location.state?.returnTo || '/dashboard'}`;
    goToCentralLogin(returnTo);
  }, [location]);

  return (
    <div className="auth-loading">
      <div className="auth-loading-inner">
        <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />
        <Loader />
      </div>
    </div>
  );
}
