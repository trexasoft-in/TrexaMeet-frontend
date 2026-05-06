import { jwtDecode } from 'jwt-decode';

const SESSION_KEY = 'trexa_session';
const REFRESH_KEY = 'trexa_refresh';

// ─── Storage helpers — localStorage persists across browser restarts ──────────
const read = (k) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

const write = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

const erase = (k) => {
  try { localStorage.removeItem(k); } catch {}
};

// ─── In-memory cache — avoids JSON.parse on every API call ───────────────────
let memorySession = null;

// ─── Check if a JWT access token is expired ──────────────────────────────────
export const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    // Give a 30s buffer so we refresh slightly before hard expiry
    return Date.now() / 1000 > exp - 30;
  } catch { return true; }
};

// ─── URL cleaner (CentralAuth redirect params) ────────────────────────────────
const cleanUrlParams = () => {
  const url = new URL(window.location.href);
  const keys = ['accesstoken', 'refreshtoken', 'userid', 'name', 'email'];
  let changed = false;
  keys.forEach(k => {
    if (url.searchParams.has(k)) { url.searchParams.delete(k); changed = true; }
  });
  if (changed) window.history.replaceState({}, '', url.toString());
};

// ─── Bootstrap from CentralAuth redirect URL params ──────────────────────────
export const bootstrapCentralAuthSession = () => {
  const url = new URL(window.location.href);
  const rawToken = url.searchParams.get('accesstoken');
  if (!rawToken) return null;

  const rawRefresh = url.searchParams.get('refreshtoken');
  const userid = url.searchParams.get('userid');
  const name = url.searchParams.get('name');
  const email = url.searchParams.get('email');

  let user = null;
  try {
    const d = jwtDecode(rawToken);
    user = {
      userid: d.userid || d.user_id || userid,
      name: d.name || name || 'User',
      email: d.email || email,
    };
  } catch {
    user = { userid, name: name || 'User', email };
  }

  const session = { accessToken: rawToken, user };
  memorySession = session;
  write(SESSION_KEY, session);
  if (rawRefresh) write(REFRESH_KEY, rawRefresh);
  cleanUrlParams();
  return session;
};

// ─── Get current session — memory first, then localStorage ───────────────────
export const getSession = () => {
  // 1. Memory hit — fastest path
  if (memorySession) {
    return memorySession;
  }

  // 2. localStorage — survives browser restarts
  const stored = read(SESSION_KEY);
  if (stored?.accessToken && stored?.user) {
    memorySession = stored; // repopulate cache
    return memorySession;
  }

  return null;
};

// ─── Save session ─────────────────────────────────────────────────────────────
export const setSession = (session) => {
  const token = session?.accessToken || session?.accesstoken;
  const user = session?.user;
  if (!token || !user) return null;

  memorySession = { accessToken: token, user };
  write(SESSION_KEY, memorySession);
  return memorySession;
};

// ─── Refresh token helpers ────────────────────────────────────────────────────
export const setRefreshToken = (token) => { if (token) write(REFRESH_KEY, token); };
export const getRefreshToken = () => read(REFRESH_KEY);

// ─── Clear everything (voluntary sign-out only) ───────────────────────────────
export const clearSession = () => {
  memorySession = null;
  erase(SESSION_KEY);
  erase(REFRESH_KEY);
};
