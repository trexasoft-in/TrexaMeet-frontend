import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LiveKitRoom } from '@livekit/components-react';
import api from '../lib/api';
import useRoomStore from '../store/room.store';
import WebinarStage from '../components/webinar/WebinarStage';

export default function WebinarRoom() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const setRoomPayload = useRoomStore(s => s.setRoomPayload);
  const resetRoom = useRoomStore(s => s.resetRoom);
  const preJoin = useRoomStore(s => s.preJoin);
  const room = useRoomStore(s => s.room);
  const myRole = useRoomStore(s => s.myRole);
  const livekitToken = useRoomStore(s => s.livekitToken);
  const livekitUrl = useRoomStore(s => s.livekitUrl);

  const leavingRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.height = '100%';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
    };
  }, []);

  useEffect(() => {
    if (location.state) {
      setRoomPayload(location.state);
      return;
    }

    (async () => {
      try {
        const data = await api.post(`/api/rooms/${roomCode}/join`);
        setRoomPayload(data);
      } catch (err) {
        console.error('TrexaMeet webinar join failed', err);
        navigate('/join', { replace: true });
      }
    })();
  }, [location.state, roomCode, navigate, setRoomPayload]);

  const handleLeave = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    api.post(`/api/rooms/${roomCode}/leave`).catch(() => {});
    resetRoom();
    navigate(`/meeting-ended/${roomCode}`, { replace: true });
  };

  if (!livekitToken || !livekitUrl) {
    return <div className="card">Connecting to webinar...</div>;
  }

  const publishVideo = myRole !== 'audience' && preJoin?.camEnabled;
  const publishAudio = myRole !== 'audience' && preJoin?.micEnabled;

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={livekitToken}
      connect={true}
      video={publishVideo}
      audio={publishAudio}
      onDisconnected={handleLeave}
    >
      <WebinarStage roomCode={roomCode} room={room} myRole={myRole} onLeave={handleLeave} />
    </LiveKitRoom>
  );
}
