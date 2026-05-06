import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

export default function Home() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-stack">
      <div className="home-header">
        <h2>{greeting}</h2>
        <p>Ready to connect? Start a meeting or jump into an existing one.</p>
      </div>

      <div>
        <p className="section-label">Start or Join</p>
        <div className="card-grid">

          {/* New Meeting */}
          <div className="action-card">
            <div className="action-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="action-card-badge badge-group-pill">Meeting</div>
            <h3>New Meeting</h3>
            <p>Create a room, get a code, and share it with your team.</p>
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <Link to="/dashboard/new" style={{ display: 'block' }}>
                <Button style={{ width: '100%' }}>Create Meeting</Button>
              </Link>
            </div>
          </div>

          {/* Join Meeting */}
          <div className="action-card">
            <div className="action-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div className="action-card-badge badge-join-pill">Join</div>
            <h3>Join by Code</h3>
            <p>Enter a code like <code style={{ fontSize: 12 }}>TRX-XXXXXXX</code> to join any room.</p>
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <Link to="/dashboard/join" style={{ display: 'block' }}>
                <Button style={{ width: '100%' }}>Join Meeting</Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
