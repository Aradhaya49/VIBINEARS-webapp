import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, MessageCircle, UserPlus, Sparkles, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NeonProgress } from '@/components/ui/NeonProgress';
import { UserCardSkeleton } from '@/components/ui/Skeleton';
import { TopBar } from '@/components/layout/TopBar';
import { socialService } from '@/services/social.service';
import { chatService } from '@/services/chat.service';
import { useUIStore } from '@/store/ui.store';
import { useSocialStore } from '@/store/social.store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance, formatTimeAgo } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import type { NearbyUser } from '@/types';


function IcebreakerModal({ user, onClose }: { user: NearbyUser; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['icebreaker', user.id],
    queryFn: () => socialService.getIcebreaker(user.id),
  });

  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-6" animate={false}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <p className="font-semibold text-white">AI Icebreaker</p>
              <p className="text-xs text-white/40">For {user.username}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-pink/30 hover:bg-neon-pink/5 cursor-pointer transition-all text-sm text-white/80"
                >
                  "{s}"
                </motion.div>
              ))}
            </div>
          )}

          <Button variant="ghost" size="sm" className="w-full mt-4" onClick={onClose}>
            Close
          </Button>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function UserCard({ user }: { user: NearbyUser }) {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  const { onlineUsers } = useSocialStore();
  const queryClient = useQueryClient();
  const [showIcebreaker, setShowIcebreaker] = useState(false);

  const connectMutation = useMutation({
    mutationFn: () => socialService.sendConnectionRequest(user.id),
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Request sent!', message: `Connection request sent to ${user.username}` });
      queryClient.invalidateQueries({ queryKey: ['nearby'] });
    },
    onError: () => addNotification({ type: 'error', title: 'Failed', message: 'Could not send request' }),
  });

  const chatMutation = useMutation({
    mutationFn: () => chatService.createConversation(user.id),
    onSuccess: (conv) => navigate(`/chat/${conv.id}`),
  });

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-5 h-full" animate={false}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar
              src={user.avatar_url}
              name={user.username}
              size="lg"
              isOnline={onlineUsers.has(user.id)}
              isVip={user.is_vip}
              isOpenToTalk={user.is_open_to_talk}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white">{user.username}</p>
                {user.is_vip && <span className="vip-badge">VIP</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-neon-cyan" />
                <span className="text-xs text-neon-cyan font-medium">{formatDistance(user.distance_meters)}</span>
              </div>
              {user.is_open_to_talk && (
                <Badge variant="cyan" size="sm" pulse className="mt-1.5">Open to Talk</Badge>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-white/60 mb-4 line-clamp-2">{user.bio}</p>
          )}

          {/* Streak */}
          {user.party_streak > 0 && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-neon-pink/5 border border-neon-pink/10">
              <span className="text-sm">🔥</span>
              <span className="text-xs text-neon-pink font-medium">{user.party_streak} day streak</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIcebreaker(true)}
              className="flex-col gap-1 h-auto py-2"
            >
              <Sparkles className="w-4 h-4 text-neon-pink" />
              <span className="text-[10px]">Break Ice</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              loading={chatMutation.isPending}
              onClick={() => chatMutation.mutate()}
              className="flex-col gap-1 h-auto py-2"
            >
              <MessageCircle className="w-4 h-4 text-neon-blue" />
              <span className="text-[10px]">Chat</span>
            </Button>
            <Button
              variant="neon"
              size="sm"
              loading={connectMutation.isPending}
              onClick={() => connectMutation.mutate()}
              className="flex-col gap-1 h-auto py-2"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-[10px]">Connect</span>
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {showIcebreaker && (
          <IcebreakerModal user={user} onClose={() => setShowIcebreaker(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export function Nearby() {
  const [radius, setRadius] = useState(500);
  const [filter, setFilter] = useState<'all' | 'open'>('all');
  const { latitude, longitude } = useGeolocation();

  const { data: nearby, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['nearby', radius],
    queryFn: () => socialService.getNearbyUsers({
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      radius,
    }),
    refetchInterval: 30000,
  });

  const filtered = (nearby ?? []).filter((u) => filter === 'all' || u.is_open_to_talk);
  const [viewMode, setViewMode] = useState<'cards' | 'radar'>('cards');

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Nearby" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
            {(['all', 'open'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f ? 'bg-neon-purple text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Nearby' : 'Open to Talk'}
              </button>
            ))}
          </div>
          

          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-4 h-4 text-white/40" />
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            >
              <option value={100}>100m</option>
              <option value={250}>250m</option>
              <option value={500}>500m</option>
              <option value={1000}>1km</option>
              <option value={2000}>2km</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => refetch()} loading={isFetching}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode((v) => v === 'cards' ? 'radar' : 'cards')}>
              {viewMode === 'cards'
                ? 'Radar View'
                : 'Card View'}
            </Button>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-white/60">
            {filtered.length} {filter === 'open' ? 'open to talk' : 'people'} within {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
          </span>
        </div>


{/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-white/20" />
          </div>

          <p className="text-white/50 text-lg font-medium">
            No one nearby
          </p>

          <p className="text-white/30 text-sm mt-1">
            Try increasing the radius or check back later
          </p>

          <Button
            variant="neon"
            size="md"
            className="mt-6"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((u) => (
              <UserCard
                key={u.id}
                user={u}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <RadarView users={filtered} />
      )}

      </div>
    </div>
  );

}


interface Props {
  users: NearbyUser[];
}
interface RadarUser {
  id: number;
  username: string;
  distance?: number;
}

export function RadarView({ users }: Props) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="relative w-[420px] h-[420px] rounded-full overflow-hidden border border-cyan-500/20 bg-[#071018]">

        {/* Rings */}
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-cyan-500/10"
            style={{
              width: `${ring * 25}%`,
              height: `${ring * 25}%`,
              left: `${50 - (ring * 25) / 2}%`,
              top: `${50 - (ring * 25) / 2}%`,
            }}
          />
        ))}

        {/* Cross */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/10" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/10" />

        {/* Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: 'linear',
          }}
          className="absolute left-1/2 top-1/2 origin-top"
          style={{
            width: '2px',
            height: '50%',
            background:
              'linear-gradient(to bottom, rgba(0,255,255,0.8), transparent)',
          }}
        />

        {/* Center */}
        <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-cyan-400 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_cyan]" />

        {/* Users */}
        {users.map((user, i) => {
          const angle =
            (i / users.length) * Math.PI * 2;

          const radius =
            60 + ((user.distance_meters?? 100) / 500) * 120;

          const x =
            Math.cos(angle) * radius;

          const y =
            Math.sin(angle) * radius;

          return (
            <motion.div
              key={user.id}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                repeat: Infinity,
                duration: 3,
              }}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.9)]" />

              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                {user.username}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
