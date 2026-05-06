import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import logoImg from '/logo.png'

const titleMap = {
  '/dashboard':         { title: 'Dashboard',    sub: 'Start or join a meeting' },
  '/dashboard/new':     { title: 'New Meeting',  sub: 'Create a meeting' },
  '/dashboard/join':    { title: 'Join Meeting', sub: 'Enter a room code to join' },
  '/dashboard/history': { title: 'Call History', sub: 'Your past meetings and calls' },
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const page     = titleMap[location.pathname] || { title: 'TrexaMeet', sub: '' }
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="app-shell">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <img src={logoImg} alt="" width={28} height={28} style={{ borderRadius: 7, objectFit: 'cover' }} />
          TrexaMeet
        </div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{page.title}</h1>
            <p>{page.sub}</p>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
