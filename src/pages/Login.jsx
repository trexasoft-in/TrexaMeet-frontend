import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { setSession, setRefreshToken, getSession } from '../lib/auth'
import useAuthStore from '../store/auth.store'
import Button from '../components/common/Button'

export default function Login() {
  const navigate        = useNavigate()
  const setStoreSession = useAuthStore((s) => s.setSession)
  const user            = useAuthStore((s) => s.user)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // ── If already logged in, skip login page entirely ──────────────────────
  useEffect(() => {
    // Check Zustand store first (populated after previous login in same session)
    if (user) { navigate('/dashboard', { replace: true }); return }
    // Check sessionStorage (survives same-tab reload)
    const existing = getSession()
    if (existing?.accessToken && existing?.user) {
      setStoreSession(existing)
      navigate('/dashboard', { replace: true })
    }
  }, []) // eslint-disable-line

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const base = (import.meta.env.VITE_CENTRAL_AUTH_URL || '').replace(/\/$/, '')
      const { data } = await axios.post(`${base}/api/auth/login`, { email, password })

      const token =
        data?.accesstoken ||
        data?.accessToken ||
        data?.access_token

      const refresh =
        data?.refreshtoken ||
        data?.refreshToken ||
        data?.refresh_token

      const userId =
        data?.user?.user_id ||
        data?.user?.userid ||
        data?.user?.id

      if (!token) {
        throw new Error('CentralAuth did not return an access token')
      }

      const session = {
        accessToken: token,
        user: {
          user_id: userId,
          userid:  userId,
          name:    data?.user?.name,
          email:   data?.user?.email,
        },
      }

      setSession(session)                        // → sessionStorage + memorySession
      setRefreshToken(refresh)                   // → persists refresh token
      setStoreSession(session)                   // → Zustand (React components)
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-loading">
      <div className="auth-form-card">
        <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />
        <h2>Sign in to TrexaMeet</h2>
        <form className="form-grid" onSubmit={handleLogin}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
