import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../lib/api';
import useAuth from '../hooks/useAuth';
import {
  MicOnIcon,
  MicOffIcon,
  CameraOnIcon,
  CameraOffIcon,
  RefreshIcon,
} from '../components/meeting/icons';
import Button from '../components/common/Button';
import useRoomStore from '../store/room.store';

export default function PreJoin() {
  const { roomCode: code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuth();

  const setRoomPayload = useRoomStore(s => s.setRoomPayload);
  const updatePreJoin = useRoomStore(s => s.updatePreJoin);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const [selAudio, setSelAudio] = useState('');
  const [selVideo, setSelVideo] = useState('');
  const [stream, setStream] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');

  const isGuest = !user?.user;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;

    html.style.overflow = 'auto';
    body.style.overflow = 'auto';
    html.style.height = 'auto';
    body.style.height = 'auto';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream]);

  const stopCurrentStream = useCallback(() => {
    streamRef.current?.getTracks()?.forEach(track => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const loadDevices = useCallback(async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    const audio = list.filter(d => d.kind === 'audioinput');
    const video = list.filter(d => d.kind === 'videoinput');
    setDevices({ audio, video });
    return { audio, video };
  }, []);

  const startStream = useCallback(
    async (audioId, videoId, micEnabled = micOn, camEnabled = camOn) => {
      try {
        stopCurrentStream();

        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: micEnabled
            ? (audioId ? { deviceId: { exact: audioId } } : true)
            : false,
          video: camEnabled
            ? (videoId ? { deviceId: { exact: videoId } } : true)
            : false,
        });

        streamRef.current = newStream;
        setStream(newStream);
        setError('');

        newStream.getAudioTracks().forEach(track => {
          track.enabled = micEnabled;
        });

        newStream.getVideoTracks().forEach(track => {
          track.enabled = camEnabled;
        });
      } catch (err) {
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera or microphone access was denied. Please allow permissions and try again.'
            : 'Unable to access camera or microphone.'
        );
      }
    },
    [camOn, micOn, stopCurrentStream]
  );

  useEffect(() => {
    let cancelled = false;

    const initMedia = async () => {
      try {
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        permissionStream.getTracks().forEach(track => track.stop());

        if (cancelled) return;

        const { audio, video } = await loadDevices();
        if (cancelled) return;

        const aId = audio[0]?.deviceId || '';
        const vId = video[0]?.deviceId || '';

        setSelAudio(aId);
        setSelVideo(vId);

        updatePreJoin({
          selectedMicId: aId,
          selectedCameraId: vId,
          micEnabled: true,
          camEnabled: true,
        });

        await startStream(aId, vId, true, true);
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera or microphone access was denied. Please allow permissions to continue.'
            : 'Unable to access camera or microphone.'
        );

        try {
          const { audio, video } = await loadDevices();
          if (cancelled) return;
          setSelAudio(audio[0]?.deviceId || '');
          setSelVideo(video[0]?.deviceId || '');
        } catch {
          // ignore
        }
      }
    };

    initMedia();

    return () => {
      cancelled = true;
      stopCurrentStream();
    };
  }, [loadDevices, startStream, stopCurrentStream, updatePreJoin]);

  const handleToggleMic = async () => {
    const next = !micOn;
    setMicOn(next);
    updatePreJoin({
      micEnabled: next,
      camEnabled: camOn,
      selectedMicId: selAudio,
      selectedCameraId: selVideo,
    });
    await startStream(selAudio, selVideo, next, camOn);
  };

  const handleToggleCam = async () => {
    const next = !camOn;
    setCamOn(next);
    updatePreJoin({
      micEnabled: micOn,
      camEnabled: next,
      selectedMicId: selAudio,
      selectedCameraId: selVideo,
    });
    await startStream(selAudio, selVideo, micOn, next);
  };

  const handleAudioChange = async e => {
    const next = e.target.value;
    setSelAudio(next);
    updatePreJoin({
      selectedMicId: next,
      selectedCameraId: selVideo,
      micEnabled: micOn,
      camEnabled: camOn,
    });
    await startStream(next, selVideo, micOn, camOn);
  };

  const handleVideoChange = async e => {
    const next = e.target.value;
    setSelVideo(next);
    updatePreJoin({
      selectedMicId: selAudio,
      selectedCameraId: next,
      micEnabled: micOn,
      camEnabled: camOn,
    });
    await startStream(selAudio, next, micOn, camOn);
  };

  const handleRefresh = async () => {
    await startStream(selAudio, selVideo, micOn, camOn);
  };

  const handleJoin = async () => {
    if (isGuest && !guestName.trim()) {
      setError('Please enter your name to join.');
      return;
    }

    setJoining(true);
    setError('');

    try {
      updatePreJoin({
        micEnabled: micOn,
        camEnabled: camOn,
        selectedMicId: selAudio,
        selectedCameraId: selVideo,
      });

      streamRef.current?.getTracks()?.forEach(t => t.stop());

      if (location.state?.livekittoken) {
        setRoomPayload(location.state);
        navigate(`/room/${code}`, { state: location.state });
        return;
      }

      const data = await api.post(`/api/rooms/${code}/join`, {
        guestName: isGuest ? guestName.trim() : undefined,
      });

      setRoomPayload(data);
      navigate(`/room/${code}`, { state: data });
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to join the meeting. Please try again.');
      setJoining(false);
    }
  };

  const initials = isGuest
    ? (guestName.trim().charAt(0) || 'G').toUpperCase()
    : (user?.user?.name || user?.user?.email || 'U')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

  return (
    <div className="prejoin-page">
      <div className="prejoin-card">
        <div className="prejoin-preview">
          <video
            ref={videoRef}
            className="prejoin-video"
            style={{ display: camOn ? 'block' : 'none' }}
            autoPlay
            muted
            playsInline
          />

          {!camOn && (
            <div className="prejoin-novideo">
              <div className="prejoin-avatar">{initials}</div>
            </div>
          )}

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
              onClick={handleRefresh}
              aria-label="Refresh camera feed"
              title="Refresh camera"
            >
              <RefreshIcon size={17} />
            </button>
          </div>
        </div>

        <div className="prejoin-info">
          <div className="prejoin-meta">
            <h1>Ready to join?</h1>
            <p>
              Joining as <strong>{isGuest ? guestName || 'Guest' : (user?.user?.name || user?.user?.email)}</strong>
            </p>
          </div>

          {error && (
            <div className="prejoin-error" role="alert">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form
            className="form-grid"
            onSubmit={e => {
              e.preventDefault();
              handleJoin();
            }}
          >
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

            <div className="prejoin-devices">
              <div className="prejoin-device-row">
                <span className="pj-device-label">
                  <MicOnIcon size={13} /> Microphone
                </span>
                <select
                  className="pj-select"
                  value={selAudio}
                  onChange={handleAudioChange}
                  aria-label="Select microphone"
                >
                  {devices.audio.length === 0 ? (
                    <option value="">Default microphone</option>
                  ) : (
                    devices.audio.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="prejoin-device-row">
                <span className="pj-device-label">
                  <CameraOnIcon size={13} /> Camera
                </span>
                <select
                  className="pj-select"
                  value={selVideo}
                  onChange={handleVideoChange}
                  aria-label="Select camera"
                >
                  {devices.video.length === 0 ? (
                    <option value="">Default camera</option>
                  ) : (
                    devices.video.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

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

            <div className="row" style={{ marginTop: 8 }}>
              <Button type="submit" disabled={joining} style={{ flex: 1 }}>
                {joining ? 'Joining...' : 'Join Now'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
