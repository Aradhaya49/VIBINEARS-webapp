import { motion } from 'framer-motion';
import { Menu, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { useSocialStore } from '@/store/social.store';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { toggleSidebar, isWSConnected } = useUIStore();
  const { user } = useAuthStore();
  const { pendingConnections } = useSocialStore();

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-bg-dark/60 backdrop-blur-xl sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h2 className="font-display font-semibold text-white text-lg">{title}</h2>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* WS status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
          {isWSConnected ? (
            <Wifi className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className={`text-xs ${isWSConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isWSConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Search */}
        <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-5 h-5" />
          {pendingConnections.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-4 h-4 bg-neon-pink rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            >
              {pendingConnections.length}
            </motion.span>
          )}
        </button>

        {/* Avatar */}
        {user && (
          <Avatar
            src={user.avatar_url}
            name={user.username}
            size="sm"
            isOnline
            isVip={user.is_vip}
          />
        )}
      </div>
    </header>
  );
}
