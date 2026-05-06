import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'

export default function JoinMeeting() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

  const handleContinue = (event) => {
    event.preventDefault()
    if (!roomCode.trim()) return
    navigate(`/prejoin/${roomCode.trim().toUpperCase()}`)
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <form className="form-grid" onSubmit={handleContinue}>
        <div>
          <label className="label">Room code</label>
          <input
            className="input"
            placeholder="TRX-K4M9XPL"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
        </div>
        <Button type="submit">Continue to join</Button>
      </form>
    </div>
  )
}
