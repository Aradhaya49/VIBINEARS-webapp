import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGeolocation } from '@/hooks/useGeolocation';

export function AppLayout() {
  // Initialize WebSocket connection
  useWebSocket();
  // Auto-update geolocation
  useGeolocation(true);

  return (
    <div className="min-h-screen bg-bg-black flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <NotificationToast />
    </div>
  );
}
