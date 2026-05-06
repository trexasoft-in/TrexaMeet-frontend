import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import api from '../lib/api'
import useAuth from '../hooks/useAuth'
import {
  MicOnIcon, MicOffIcon,
  CameraOnIcon, CameraOffIcon,
  RefreshIcon
} from '../components/meeting/icons'
import Button from '../components/common/Button'
import useRoomStore from '../store/room.store'

export default function PreJoin() {
  const { roomCode: code } = useParams()
  const navigate    = useNavigate()
  const location    = useLocation()
  const user = useAuth()
  const setRoomPayload = useRoomStore((s) => s.setRoomPayload)
  const updatePreJoin  = useRoomStore((s) => s.updatePreJoin)

  const videoRef    = useRef(null)
  const streamRef   = useRef(null)

  const [micOn,     setMicOn]     = useState(true)
  const [camOn,     setCamOn]     = useState(true)
  const [devices,   setDevices]   = useState({ audio: [], video: [] })
  const [selAudio,  setSelAudio]  = useState('')
  const [selVideo,  setSelVideo]  = useState('')
  const [stream,    setStream]    = useState(null)   // ← tracked as state
  const [joining,   setJoining]   = useState(false)
  const [error,     setError]     = useState('')

  const isGuest = !user?.user; // user hook returns { user, hydrated, accessToken }
  const [guestName, setGuestName] = useState('');

  // ── FIX 1: srcObject must be set imperatively, NOT as a JSX prop ──
  // Every time `stream` state changes, assign it to the video element
  useEffect(() => {
    const el = videoRef.current
    if (!el || !stream) return
    el.srcObject = stream
    el.play().catch(() => {
      // Autoplay blocked (e.g. in some browsers until user gesture)
      // Adding muted + playsinline in JSX already covers most cases
    })
  }, [stream])

  const startStream = useCallback(async (audioId, videoId) => {
    try {
      // Stop previous tracks before requesting new ones
      streamRef.current?.getTracks().forEach((t) => t.stop())

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: audioId ? { deviceId: { exact: audioId } } : true,
        video: videoId ? { deviceId: { exact: videoId } } : true
      })

      streamRef.current = newStream
      setStream(newStream)   // triggers the useEffect above
      setError('')
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera or microphone access was denied. Allow access in browser settings.'
          : 'Unable to access camera or microphone.'
      )
    }
  }, [])

  // ── Enumerate devices on mount, then start stream ────────────────
  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices.enumerateDevices().then((list) => {
      if (cancelled) return
      const audio = list.filter((d) => d.kind === 'audioinput')
      const video = list.filter((d) => d.kind === 'videoinput')
      setDevices({ audio, video })

      const aId = audio[0]?.deviceId || ''
      const vId = video[0]?.deviceId || ''
      setSelAudio(aId)
      setSelVideo(vId)
      startStream(aId, vId)
    })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [startStream])

  // ── Toggle mic ───────────────────────────────────────────────────
  const handleToggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setMicOn((v) => !v)
  }

  // ── Toggle cam ───────────────────────────────────────────────────
  const handleToggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setCamOn((v) => !v)
  }

  // ── FIX 2: Correct initial from user name ────────────────────────
  const initials = isGuest
    ? (guestName.trim().charAt(0) || 'G').toUpperCase()
    : (user?.user?.name || user?.user?.email || 'User')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

  // ── Join ─────────────────────────────────────────────────────────
  const handleJoin = async () => {
    // Guest name validation
    if (isGuest && !guestName.trim()) {
      setError('Please enter your name to join.');
      return;
    }

    setJoining(true);
    setError('');

    try {
      updatePreJoin({ micEnabled: micOn, camEnabled: camOn });
      streamRef.current?.getTracks().forEach(t => t.stop());

      // Creator coming from NewMeeting (always authenticated)
      if (location.state?.livekittoken) {
        setRoomPayload(location.state);
        navigate(`/room/${code}`, { state: location.state });
        return;
      }

      // Pass guestName in body — backend ignores it for authenticated users
      const data = await api.post(`/api/rooms/${code}/join`, {
        guestName: guestName.trim() || undefined,
      });

      setRoomPayload(data);
      navigate(`/room/${code}`, { state: data });
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to join the meeting. Please try again.');
      setJoining(false);
    }
  };

  return (
    <div className="prejoin-page">
      <div className="prejoin-card">

        {/* ── Preview ───────────────────────────────── */}
        <div className="prejoin-preview">

          {/*
            FIX 1 — video element always rendered;
            visibility toggled via CSS so the ref is always attached.
            srcObject is assigned imperatively in the useEffect above.
          */}
          <video
            ref={videoRef}
            className="prejoin-video"
            style={{ display: camOn ? 'block' : 'none' }}
            autoPlay
            muted
            playsInline
          />

          {/* Avatar shown only when cam is off */}
          {!camOn && (
            <div className="prejoin-novideo">
              <div className="prejoin-avatar">{initials}</div>
            </div>
          )}

          {/* Overlay controls */}
          <div className="prejoin-overlay-btns">
            <button
              type="button"
              className={`pj-icon-btn ${!micOn ? 'pj-icon-btn--off' : ''}`}
              onClick={handleToggleMic}
              aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? <MicOnIcon size={17} /> : <MicOffIcon size={17} />}
            </button>

            <button
              type="button"
              className={`pj-icon-btn ${!camOn ? 'pj-icon-btn--off' : ''}`}
              onClick={handleToggleCam}
              aria-label={camOn ? 'Stop video' : 'Start video'}
              title={camOn ? 'Stop video' : 'Start video'}
            >
              {camOn ? <CameraOnIcon size={17} /> : <CameraOffIcon size={17} />}
            </button>

            <button
              type="button"
              className="pj-icon-btn"
              onClick={() => startStream(selAudio, selVideo)}
              aria-label="Refresh camera feed"
              title="Refresh camera"
            >
              <RefreshIcon size={17} />
            </button>
          </div>
        </div>

        {/* ── Info + join ───────────────────────────── */}
        <div className="prejoin-info">

          <div className="prejoin-meta">
            <h1>Ready to join?</h1>
            <p>Joining as <strong>{isGuest ? (guestName || 'Guest') : (user?.user?.name || user?.user?.email)}</strong></p>
          </div>

          {error && (
            <div className="prejoin-error" role="alert">
              <svg fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12"   y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); handleJoin(); }}>
            {/* Guest name field — only shown when not signed in */}
            {isGuest && (
              <div className="prejoin-guest-name">
                <label className="label">Your name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  maxLength={40}
                  required
                  autoFocus
                />
              </div>
            )}
            {/* Device pickers */}
            <div className="prejoin-devices">
              <div className="prejoin-device-row">
                <span className="pj-device-label">
                  <MicOnIcon size={13} /> Microphone
                </span>
                <select
                  className="pj-select"
                  value={selAudio}
                  onChange={(e) => {
                    setSelAudio(e.target.value)
                    startStream(e.target.value, selVideo)
                  }}
                  aria-label="Select microphone"
                >
                  {devices.audio.length === 0
                    ? <option value="">Default microphone</option>
                    : devices.audio.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                        </option>
                      ))
                  }
                </select>
              </div>

              <div className="prejoin-device-row">
                <span className="pj-device-label">
                  <CameraOnIcon size={13} /> Camera
                </span>
                <select
                  className="pj-select"
                  value={selVideo}
                  onChange={(e) => {
                    setSelVideo(e.target.value)
                    startStream(selAudio, e.target.value)
                  }}
                  aria-label="Select camera"
                >
                  {devices.video.length === 0
                    ? <option value="">Default camera</option>
                    : devices.video.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                        </option>
                      ))
                  }
                </select>
              </div>
            </div>

            {/* State chips */}
            <div className="prejoin-state-row">
              <span className={`pj-state-chip ${micOn ? 'pj-state-chip--on' : 'pj-state-chip--off'}`}>
                {micOn ? <MicOnIcon size={12} /> : <MicOffIcon size={12} />}
                {micOn ? 'Microphone on' : 'Microphone off'}
              </span>
              <span className={`pj-state-chip ${camOn ? 'pj-state-chip--on' : 'pj-state-chip--off'}`}>
                {camOn ? <CameraOnIcon size={12} /> : <CameraOffIcon size={12} />}
                {camOn ? 'Camera on' : 'Camera off'}
              </span>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row" style={{ marginTop: 8 }}>
              <Button type="submit" disabled={joining} style={{ flex: 1 }}>
                {joining ? 'Joining…' : 'Join Now'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.history.back()} style={{ flex: 1 }}>
                Cancel
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
