import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './pages/AuthGuard';
import AppLayout from './components/layout/AppLayout';
import IncomingCall from './pages/IncomingCall';
import Home from './pages/Home';
import NewMeeting from './pages/NewMeeting';
import JoinMeeting from './pages/JoinMeeting';
import PreJoin from './pages/PreJoin';
import Room from './pages/Room';
import WebinarRoom from './pages/WebinarRoom';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import MeetingEnded from './pages/MeetingEnded';
import useAuth from './hooks/useAuth';
import useIncomingCall from './hooks/useIncomingCall';

function DashboardRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="new" element={<NewMeeting />} />
        <Route path="join" element={<JoinMeeting />} />
        <Route path="history" element={<History />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppLayout>
  );
}

function ProtectedShell() {
  useAuth();
  useIncomingCall();
  return (
    <AuthGuard>
      <IncomingCall />
      <Routes>
        {/* Dashboard routes still require auth */}
        <Route path="/*" element={<DashboardRoutes />} />
      </Routes>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ✅ Public routes — no auth required */}
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/prejoin/:roomCode" element={<PreJoin />} />
      <Route path="/room/:roomCode" element={<Room />} />
      <Route path="/webinar/:roomCode" element={<WebinarRoom />} />
      <Route path="/meeting-ended/:roomCode" element={<MeetingEnded />} />

      {/* Protected dashboard */}
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}
