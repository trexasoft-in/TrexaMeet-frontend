import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { goToCentralSignup, getTrexaMeetBase } from '../lib/centralAuth';

export default function Signup() {
  const location = useLocation();

  useEffect(() => {
    const returnTo = `${getTrexaMeetBase()}${location.state?.returnTo || '/dashboard'}`;
    goToCentralSignup(returnTo);
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
