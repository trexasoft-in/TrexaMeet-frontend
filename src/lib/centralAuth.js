const stripTrailingSlash = (url = '') => url.replace(/\/+$/, '');

export const getCentralAuthBase = () =>
  stripTrailingSlash(import.meta.env.VITE_CENTRAL_AUTH_URL || '');

export const getTrexaMeetBase = () =>
  stripTrailingSlash(import.meta.env.VITE_APP_URL || window.location.origin);

export const buildCentralAuthUrl = (path, returnTo) => {
  const base = getCentralAuthBase();
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  url.searchParams.set('returnTo', returnTo || getTrexaMeetBase());
  return url.toString();
};

export const goToCentralLogin = (returnTo) => {
  window.location.href = buildCentralAuthUrl('/auth/login', returnTo);
};

export const goToCentralSignup = (returnTo) => {
  window.location.href = buildCentralAuthUrl('/auth/signup', returnTo);
};

export const goToCentralForgotPassword = (returnTo) => {
  window.location.href = buildCentralAuthUrl('/auth/forgot-password', returnTo);
};
