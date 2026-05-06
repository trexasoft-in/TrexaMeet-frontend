import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Save whatever was set before
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;

    // Enable scroll for landing page
    html.style.overflow = 'auto';
    body.style.overflow = 'auto';
    html.style.height = 'auto';
    body.style.height = 'auto';

    return () => {
      // Restore exactly what was there before — so MeetingRoom/Room stays unaffected
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
    };
  }, []);

  return (
    <div className="landing-page">

      {/* NAV */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-brand">
          <img src="/logo.png" alt="TrexaMeet" className="lp-nav-logo-img" />
          <span className="lp-nav-brand-name">TrexaMeet</span>
        </Link>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How it works</a>
          <Link to="/login" className="lp-nav-link">Sign in</Link>
          <Link to="/signup" className="lp-nav-cta">Get started free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-badge">
          <span className="lp-hero-badge-dot"></span>
          No downloads. No installs. Just meet.
        </div>
        <h1 className="lp-hero-title">
          Video meetings that<br />
          <em className="lp-hero-title-em">actually just work</em>
        </h1>
        <p className="lp-hero-sub">
          TrexaMeet lets anyone join a call instantly — with or without an account.
          HD video, in-call chat, screen sharing, and more. All in your browser.
        </p>
        <div className="lp-hero-actions">
          <Link to="/signup" className="lp-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14"/>
              <rect x="2" y="7" width="13" height="10" rx="2"/>
            </svg>
            Start a meeting free
          </Link>
          <Link to="/join" className="lp-btn-outline">
            Join with a code
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        </div>

        {/* Mock meeting preview */}
        <div className="lp-mock-ui">
          <div className="lp-mock-titlebar">
            <div className="lp-mock-dots">
              <span style={{background:'#ff5f57'}}></span>
              <span style={{background:'#febc2e'}}></span>
              <span style={{background:'#28c840'}}></span>
            </div>
            <span className="lp-mock-url">TrexaMeet · TRX-K4M9XPL</span>
          </div>
          <div className="lp-mock-grid">
            {[
              { initials: 'AK', name: 'Arjun K.', color: '#8B00C9', speaking: true },
              { initials: 'SM', name: 'Sneha M.', color: '#5B0085', speaking: false },
              { initials: 'RV', name: 'Raj V.', color: '#7000A3', speaking: false },
            ].map((p, i) => (
              <div key={i} className="lp-mock-tile">
                <div
                  className={`lp-mock-avatar${p.speaking ? ' lp-mock-avatar--speaking' : ''}`}
                  style={{ background: p.color }}
                >
                  {p.initials}
                </div>
                <span className="lp-mock-name">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="lp-mock-dock">
            {[
              <svg key="mic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
              <svg key="cam" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
              <svg key="scr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
              <svg key="cht" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
            ].map((icon, i) => (
              <div key={i} className="lp-mock-dock-btn">{icon}</div>
            ))}
            <div className="lp-mock-dock-divider"></div>
            <div className="lp-mock-dock-btn lp-mock-dock-btn--leave">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <div className="lp-proof-strip">
        {['No account needed to join', 'HD video & audio', 'Works in any browser', 'Instant room creation'].map((text, i) => (
          <div key={i} className="lp-proof-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {text}
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="lp-section" id="features">
        <div className="lp-section-eyebrow">Features</div>
        <h2 className="lp-section-heading">Everything you need for productive meetings</h2>
        <p className="lp-section-desc">Built for teams, open to everyone. Whether you have a Trexa account or not, TrexaMeet gets you in the room.</p>
        <div className="lp-features-grid">
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Guest Joining', desc: 'Anyone can join by just entering their name. No sign-up, no downloads, no friction.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, title: 'HD Video & Audio', desc: 'Crystal-clear video and audio powered by LiveKit. Adaptive quality for any connection.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M9 9l3-3 3 3M12 6v8"/></svg>, title: 'Screen Sharing', desc: 'Share your screen, a window, or a tab with one click. Perfect for presentations.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'In-call Chat', desc: 'Send messages and links to everyone without interrupting the conversation.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, title: 'Instant Share Link', desc: 'Get a shareable room link in one click. Send it anywhere — anyone can join.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Call History', desc: 'Signed-in users get a full history of past meetings with duration and timestamps.' },
          ].map((f, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-steps-section" id="how-it-works">
        <div className="lp-section">
          <div className="lp-section-eyebrow">How it works</div>
          <h2 className="lp-section-heading">From zero to meeting in under 30 seconds</h2>
          <p className="lp-section-desc">No setup. No configuration. Just a link and a name.</p>
          <div className="lp-steps-grid">
            {[
              { n: '1', title: 'Create a room', desc: 'Sign in and create a meeting room — get a unique code and shareable link instantly.' },
              { n: '2', title: 'Share the link', desc: 'Copy the link or room code and send it by message, email, or calendar invite.' },
              { n: '3', title: 'Anyone can join', desc: "Recipients click the link, enter their name, and they're in. No account needed." },
              { n: '4', title: 'You stay in control', desc: "Mute participants, share your screen, chat, and end the meeting when you're done." },
            ].map((s, i) => (
              <div key={i} className="lp-step-card">
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="lp-cta-strip">
        <div className="lp-cta-strip-inner">
          <img src="/logo.png" alt="TrexaMeet" className="lp-cta-logo" />
          <h2 className="lp-cta-heading">Ready to start meeting?</h2>
          <p className="lp-cta-sub">Create a free account and host your first meeting in seconds.</p>
          <div className="lp-hero-actions" style={{justifyContent:'center'}}>
            <Link to="/signup" className="lp-btn-primary lp-btn-primary--white">Create free account</Link>
            <Link to="/login" className="lp-btn-outline lp-btn-outline--white">Sign in</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <img src="/logo.png" alt="TrexaMeet" className="lp-footer-logo" />
          <span className="lp-footer-name">TrexaMeet</span>
          <span className="lp-footer-copy">· © 2026 TSK DigitalWorks</span>
        </div>
        <div className="lp-footer-links">
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Sign up</Link>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </div>
      </footer>

    </div>
  );
}
