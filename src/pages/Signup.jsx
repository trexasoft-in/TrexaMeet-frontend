import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Button from '../components/common/Button'

// Consistent env var name: VITE_CENTRAL_AUTH_URL
const centralAuth = import.meta.env.VITE_CENTRAL_AUTH_URL

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep]         = useState('signup')  // 'signup' | 'verify'
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]           = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Robust URL construction
  const base = (centralAuth || '').replace(/\/$/, '')

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`${base}/api/auth/signup`, { name, email, password })
      setStep('verify')
    } catch (err) {
      setError(err?.response?.data?.error || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`${base}/api/auth/verify-email`, { email, otp })
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.error || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-loading">
      <div className="auth-form-card">
        <img src="/logo.png" alt="TrexaMeet" className="app-boot-logo" />

        {step === 'signup' ? (
          <>
            <h2>Create your account</h2>
            <form className="form-grid" onSubmit={handleSignup}>
              <div>
                <label className="label">Name</label>
                <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
            </form>
            <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
              Already have an account? <a href="/login" style={{ color: 'var(--primary)' }}>Sign in</a>
            </p>
          </>
        ) : (
          <>
            <h2>Verify your email</h2>
            <p className="muted">We sent a 6-digit OTP to {email}</p>
            <form className="form-grid" onSubmit={handleVerify}>
              <div>
                <label className="label">OTP Code</label>
                <input className="input" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <Button type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify email'}</Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
