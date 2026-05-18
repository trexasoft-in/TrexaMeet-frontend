import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LiveKitRoom } from '@livekit/components-react';
import api from '../lib/api';
import useRoomStore from '../store/room.store';
import MeetingRoom from '../components/meeting/MeetingRoom';

export default function Room() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const setRoomPayload = useRoomStore(s => s.setRoomPayload);
  const resetRoom = useRoomStore(s => s.resetRoom);
  const preJoin = useRoomStore(s => s.preJoin);
  const room = useRoomStore(s => s.room);
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
        navigate(`/prejoin/${roomCode}`, { replace: true });
      }
    })();
  }, [location.state, roomCode, navigate, setRoomPayload]);

  const handleLeave = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const isGuest = room?.isGuest;

    if (!isGuest) {
      api.post(`/api/rooms/${roomCode}/leave`).catch(() => {});
    }

    resetRoom();
    navigate(`/meeting-ended/${roomCode}`, { replace: true });
  };

  if (!livekitToken || !livekitUrl) {
    return <div className="card">Connecting to room...</div>;
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={livekitToken}
      connect={true}
      video={preJoin?.camEnabled}
      audio={preJoin?.micEnabled}
      onDisconnected={handleLeave}
    >
      <MeetingRoom roomCode={roomCode} room={room} onLeave={handleLeave} />
    </LiveKitRoom>
  );
}
