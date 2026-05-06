import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth.store'
import Loader from '../components/common/Loader'

export default function AuthGuard({ children }) {
  const user     = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const navigate = useNavigate()

  useEffect(() => {
    if (hydrated && !user) {
      navigate('/landing', { replace: true })
    }
  }, [hydrated, user, navigate])

  if (!hydrated) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-inner">
          <div className="brand-mark">TM</div>
          <p className="muted">Starting TrexaMeet…</p>
          <Loader />
        </div>
      </div>
    )
  }

  if (!user) return null

  return children
}

