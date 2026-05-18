import { useState, useRef, useCallback } from 'react';
import { VideoTrack, AudioTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { MicOffIcon, ScreenShareIcon } from './icons';

function ExpandIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function CollapseIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  );
}

function FullscreenIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ExitFullscreenIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export default function VideoTile({
  trackRef,
  variant = 'tile',
  onExpand,
  onCollapse,
  isExpanded = false,
}) {
  const articleRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const participant = trackRef?.participant;
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare;
  const cameraEnabled = participant?.isCameraEnabled;
  const microphoneEnabled = participant?.isMicrophoneEnabled;

  const hasVideo = isScreenShare
    ? !!trackRef?.publication?.isSubscribed
    : !!(trackRef?.publication?.isSubscribed && trackRef?.publication?.track && cameraEnabled);

  const audioPublication = participant?.getTrackPublication?.(Track.Source.Microphone);
  const hasAudio = !!(audioPublication?.isSubscribed && audioPublication?.track && microphoneEnabled);

  const isSpeaking = participant?.isSpeaking;
  const isMuted = !microphoneEnabled;
  const isLocal = participant?.isLocal;

  const rawName = participant?.name || participant?.identity;
  const initials = rawName
    ? rawName
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const displayName = participant?.name || participant?.identity || 'Connecting';
  const nameReady = Boolean(participant?.name || participant?.identity);
  const objectFit = isScreenShare ? 'contain' : 'cover';

  const toggleFullscreen = useCallback(() => {
    const el = articleRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement === articleRef.current));
  }, []);

  const attachRef = useCallback(
    el => {
      if (articleRef.current) {
        articleRef.current.removeEventListener('fullscreenchange', handleFullscreenChange);
      }
      articleRef.current = el;
      if (el) {
        el.addEventListener('fullscreenchange', handleFullscreenChange);
      }
    },
    [handleFullscreenChange]
  );

  return (
    <article
      ref={attachRef}
      className={[
        'vtile',
        `vtile--${variant}`,
        isSpeaking ? 'is-speaking' : '',
        !hasVideo ? 'is-novideo' : '',
      ].filter(Boolean).join(' ')}
      aria-label={`${displayName}${isLocal ? ' (you)' : ''}`}
    >
      {hasVideo ? (
        <VideoTrack trackRef={trackRef} className="vtile-track" style={{ objectFit }} />
      ) : (
        <div className="vtile-avatar-bg">
          <div className="vtile-avatar">{initials}</div>
        </div>
      )}

      {!isLocal && !isScreenShare && hasAudio ? (
        <AudioTrack trackRef={{ participant, source: Track.Source.Microphone }} />
      ) : null}

      <div className="vtile-actions">
        {isExpanded ? (
          <button
            type="button"
            className="vtile-action-btn"
            onClick={onCollapse}
            aria-label="Exit expanded view"
            title="Exit expanded view"
          >
            <CollapseIcon size={12} />
          </button>
        ) : onExpand ? (
          <button
            type="button"
            className="vtile-action-btn"
            onClick={onExpand}
            aria-label="Expand to main stage"
            title="Expand view"
          >
            <ExpandIcon size={12} />
          </button>
        ) : null}

        <button
          type="button"
          className="vtile-action-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <ExitFullscreenIcon size={12} /> : <FullscreenIcon size={12} />}
        </button>
      </div>

      <div className="vtile-bar">
        <div className="vtile-name-row">
          {isMuted ? (
            <span className="vtile-mute-icon" aria-label="Microphone off">
              <MicOffIcon size={13} />
            </span>
          ) : null}
          {nameReady ? (
            <span className="vtile-name">
              {displayName}
              {isLocal ? ' (You)' : ''}
            </span>
          ) : (
            <span className="vtile-name-skeleton" aria-hidden="true" />
          )}
        </div>

        {isScreenShare ? (
          <span className="vtile-badge vtile-badge--screen">
            <ScreenShareIcon size={12} />
            Presenting
          </span>
        ) : null}
      </div>
    </article>
  );
}
