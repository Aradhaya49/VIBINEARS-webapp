import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, MessageCircle, Bot, AlertTriangle, Trophy, Map,
  LogOut, Settings, Zap, Brain, X
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import wsService from '@/services/websocket.service';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home', color: 'text-neon-purple' },
  { to: '/nearby', icon: Users, label: 'Nearby', color: 'text-neon-cyan' },
  { to: '/chat', icon: MessageCircle, label: 'Chat', color: 'text-neon-blue' },
  { to: '/ai', icon: Bot, label: 'AI Nova', color: 'text-neon-pink' },
  { to: '/memory', icon: Brain, label: 'Memory', color: 'text-purple-400' },
  { to: '/gamification', icon: Trophy, label: 'VIP', color: 'text-neon-gold' },
  { to: '/map', icon: Map, label: 'Map', color: 'text-green-400' },
  { to: '/sos', icon: AlertTriangle, label: 'SOS', color: 'text-red-400' },
  { to: '/settings', icon: Settings, label: 'Settings', color: 'text-white/70', },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, isWSConnected } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    wsService.disconnect();
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon-purple">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">NOVA</h1>
            <p className="text-xs text-white/40 mt-0.5">Social Platform</p>
          </div>
          <div className="ml-auto">
            <Badge variant={isWSConnected ? 'green' : 'ghost'} size="sm" pulse={isWSConnected}>
              {isWSConnected ? 'Live' : 'Off'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => isSidebarOpen && toggleSidebar()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-neon-purple/15 border border-neon-purple/30 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5 transition-colors', isActive ? color : 'text-current')} />
                <span className="text-sm font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-purple"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      {user && (
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar_url}
              name={`${user.first_name} ${user.last_name}` || user.username}
              size="sm"
              isOnline
              isVip={user.is_vip}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-bg-dark/80 backdrop-blur-xl border-r border-white/5 fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-bg-dark border-r border-white/5 z-50 lg:hidden"
            >
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
