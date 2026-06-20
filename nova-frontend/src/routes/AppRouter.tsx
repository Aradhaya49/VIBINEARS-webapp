import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Nearby } from '@/pages/Nearby';
import { Chat } from '@/pages/Chat';
import { AIAssistant } from '@/pages/AIAssistant';
import { SOS } from '@/pages/SOS';
import { Gamification } from '@/pages/Gamification';
import { SpatialMap } from '@/pages/SpatialMap';
import { Memory } from '@/pages/Memory';
import { Settings } from '@/pages/Settings';

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nearby" element={<Nearby />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/map" element={<SpatialMap />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
