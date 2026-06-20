import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy, Zap, TrendingUp, MapPin, Bot, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useSocialStore } from '@/store/social.store';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NeonProgress } from '@/components/ui/NeonProgress';
import { Waveform } from '@/components/ui/Waveform';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { socialService } from '@/services/social.service';
import { gamificationService } from '@/services/gamification.service';
import { chatService } from '@/services/chat.service';
import { formatDistance, getTierColor, getTierPoints, formatCurrency } from '@/utils/format';
import wsService from '@/services/websocket.service';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { nearbyUsers, onlineUsers } = useSocialStore();

  const { data: nearby, isLoading: nearbyLoading } = useQuery({
    queryKey: ['nearby'],
    queryFn: () => socialService.getNearbyUsers(),
    refetchInterval: 30000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['gamification-stats'],
    queryFn: gamificationService.getStats,
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
  });

const displayNearby = nearby ?? nearbyUsers;

const tierInfo = stats ? getTierPoints(stats.tier) : null;

const tierProgress = tierInfo
  ? ((stats!.vip_points - tierInfo.current) /
      (tierInfo.next - tierInfo.current)) *
    100
  : 0;

  const handleToggleOpenToTalk = async () => {
    if (!user) return;
    try {
      await socialService.toggleOpenToTalk(!user.is_open_to_talk);
      wsService.sendPresence(!user.is_open_to_talk);
    } catch { /* ignore */ }
  };


  const unreadCount =
  conversations?.reduce((acc, c) => acc + c.unread_count, 0) ?? 0;

  console.log("Dashboard rendered")
  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Hey, {user?.first_name || user?.username} 👋
            </h1>
            <p className="text-white/50 mt-1">
              {onlineUsers.size} people online nearby
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={user?.is_open_to_talk ? 'cyan' : 'ghost'}
              size="sm"
              onClick={handleToggleOpenToTalk}
            >
              <span className={`w-2 h-2 rounded-full ${user?.is_open_to_talk ? 'bg-bg-black' : 'bg-neon-cyan'}`} />
              {user?.is_open_to_talk ? 'Open to Talk' : 'Go Open'}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Quick stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Nearby', value: displayNearby.length, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', action: () => navigate('/nearby') },
            { icon: MessageCircle, label: 'Unread', value: unreadCount, color: 'text-neon-blue', bg: 'bg-neon-blue/10', action: () => navigate('/chat') },
            { icon: Trophy, label: 'VIP Points', value: stats?.vip_points ?? 0, color: 'text-neon-gold', bg: 'bg-neon-gold/10', action: () => navigate('/gamification') },
            { icon: Zap, label: 'Streak', value: `${stats?.party_streak ?? 0}🔥`, color: 'text-neon-pink', bg: 'bg-neon-pink/10', action: () => navigate('/gamification') },
          ].map((s) => (
            statsLoading ? (
              <StatCardSkeleton key={s.label} />
            ) : (
              <GlassCard
                key={s.label}
                className="p-5 cursor-pointer"
                hover
                glow="purple"
                onClick={s.action}
                animate={false}
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </GlassCard>
            )
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Nearby users */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="p-5" animate={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neon-cyan" />
                  Nearby Now
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/nearby')}>
                  See all <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {nearbyLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                      <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-white/5 rounded animate-pulse w-24" />
                        <div className="h-2.5 bg-white/5 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayNearby.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No one nearby right now</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayNearby.slice(0, 5).map((u) => (
                    <motion.div
                      key={u.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                      onClick={() => navigate('/nearby')}
                    >
                      <Avatar
                        src={u.avatar_url}
                        name={u.username}
                        size="md"
                        isOnline={onlineUsers.has(u.id)}
                        isVip={u.is_vip}
                        isOpenToTalk={u.is_open_to_talk}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{u.username}</p>
                          {u.is_open_to_talk && (
                            <Badge variant="cyan" size="sm">Open</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/40">{formatDistance(u.distance_meters)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* VIP Progress */}
          <motion.div variants={itemVariants} className="space-y-4">
            {statsLoading ? (
              <StatCardSkeleton />
            ) : stats ? (
              <GlassCard className="p-5" animate={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-neon-gold" />
                    VIP Status
                  </h3>
                  <span className={`text-sm font-bold ${getTierColor(stats.tier)}`}>
                    {stats.tier}
                  </span>
                </div>

                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-white">{stats.vip_points}</p>
                  <p className="text-xs text-white/40">VIP Points</p>
                </div>

                <NeonProgress
                  value={stats.vip_points}
                  max={tierInfo?.next ?? 500}
                  color="gold"
                  size="md"
                  label={`→ ${tierInfo?.label}`}
                  showValue
                />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-lg font-bold text-neon-pink">{stats.party_streak}</p>
                    <p className="text-xs text-white/40">Streak 🔥</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-lg font-bold text-neon-green">{formatCurrency(stats.total_spent)}</p>
                    <p className="text-xs text-white/40">Spent</p>
                  </div>
                </div>

                {stats.badges.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-white/40 mb-2">Badges</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stats.badges.slice(0, 6).map((b) => (
                        <div key={b.id} title={b.name} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">
                          {b.icon_url ? <img src={b.icon_url} alt={b.name} className="w-5 h-5" /> : '🏆'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            ) : null}

            {/* AI Widget */}
            <GlassCard
              className="p-5 cursor-pointer"
              hover
              glow="pink"
              onClick={() => navigate('/ai')}
              animate={false}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-neon-pink" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Nova AI</p>
                  <p className="text-xs text-white/40">Ready to assist</p>
                </div>
                <Badge variant="pink" size="sm" pulse className="ml-auto">Live</Badge>
              </div>
              <Waveform isActive={false} bars={16} color="#EC4899" size="sm" className="justify-center" />
              <p className="text-xs text-white/40 text-center mt-2">Tap to activate voice</p>
            </GlassCard>

            {/* Trending */}
            <GlassCard className="p-5" animate={false}>
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-neon-purple" />
                Trending Venues
              </h3>
              {['Club Nexus', 'Neon Lounge', 'Cyber Bar'].map((v, i) => (
                <div key={v} className="flex items-center gap-3 py-2">
                  <span className="text-xs font-mono text-white/30 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{v}</p>
                    <p className="text-xs text-white/40">{Math.floor(Math.random() * 50 + 10)} people</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                </div>
              ))}
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
