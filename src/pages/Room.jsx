import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LiveKitRoom } from '@livekit/components-react'
import api from '../lib/api'
import useRoomStore from '../store/room.store'
import MeetingRoom from '../components/meeting/MeetingRoom'

export default function Room() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const setRoomPayload = useRoomStore(s => s.setRoomPayload)
  const resetRoom      = useRoomStore(s => s.resetRoom)
  const preJoin        = useRoomStore(s => s.preJoin)
  const room           = useRoomStore(s => s.room)
  const myRole         = useRoomStore(s => s.myRole)
  const livekitToken   = useRoomStore(s => s.livekitToken)
  const livekitUrl     = useRoomStore(s => s.livekitUrl)

  const leavingRef = useRef(false)

  useEffect(() => {
    if (location.state) {
      setRoomPayload(location.state);
      return;
    }
    // No state = direct URL visit, try to join
    (async () => {
      try {
        const data = await api.post(`/api/rooms/${roomCode}/join`);
        setRoomPayload(data);
      } catch (err) {
        // If unauthenticated, redirect to prejoin so they can enter their name
        navigate(`/prejoin/${roomCode}`, { replace: true });
      }
    })();
  }, [roomCode]); // eslint-disable-line

  const handleLeave = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const isGuest = room?.isGuest;

    // Only call /leave for authenticated users — guests have no DB row
    if (!isGuest) {
      api.post(`/api/rooms/${roomCode}/leave`).catch(() => {});
    }

    resetRoom();
    navigate(`/meeting-ended/${roomCode}`, { replace: true });
  };

  if (!livekitToken || !livekitUrl) {
    return <div className="card">Connecting to room…</div>
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
  )
}
