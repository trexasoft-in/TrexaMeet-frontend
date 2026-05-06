import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/auth.store'
import Avatar from '../common/Avatar'
import logoImg from '/logo.png'

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const clearStoreSession = useAuthStore((s) => s.clearSession)

  const handleLogout = () => {
    clearStoreSession() // clears Zustand + localStorage via auth.store
    navigate('/login', { replace: true })
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="brand">
        <img src={logoImg} alt="TrexaMeet" className="brand-logo-img" />
        <div className="brand-text">
          <strong>TrexaMeet</strong>
          <span>Video &amp; Calls</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav-links">
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </NavLink>

        <NavLink to="/dashboard/new" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14"/>
            <rect x="2" y="7" width="13" height="10" rx="2"/>
          </svg>
          New Meeting
        </NavLink>

        <NavLink to="/dashboard/join" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Join
        </NavLink>

        <NavLink to="/dashboard/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          History
        </NavLink>
      </nav>

      {/* User footer */}
      <footer className="sidebar-footer">
        <div className="user-row">
          <Avatar name={user?.name} />
          <div className="user-info">
            <strong>{user?.name || 'Trexa User'}</strong>
            <span>{user?.email}</span>
          </div>
        </div>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </footer>
    </aside>
  )
}
