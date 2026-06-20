import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, ShoppingCart, Star, Crown, Flame, TrendingUp, Package, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NeonProgress } from '@/components/ui/NeonProgress';
import { TopBar } from '@/components/layout/TopBar';
import { gamificationService } from '@/services/gamification.service';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency, formatTimeAgo, getTierColor, getTierGradient, getTierPoints } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { VipTier } from '@/types';

const TIERS: { tier: VipTier; label: string; points: number; perks: string[] }[] = [
  { tier: 'BRONZE', label: 'Bronze', points: 0, perks: ['Basic access', 'Standard chat'] },
  { tier: 'SILVER', label: 'Silver', points: 500, perks: ['Priority discovery', 'AI icebreakers', 'Extended radius'] },
  { tier: 'GOLD', label: 'Gold', points: 2000, perks: ['VIP badge', 'Exclusive venues', 'AI memory', 'Priority support'] },
  { tier: 'PLATINUM', label: 'Platinum', points: 5000, perks: ['All Gold perks', 'Concierge AI', 'Unlimited everything', 'Exclusive events'] },
];

const TIER_ICONS: Record<VipTier, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
};

function TierCard({ tier, currentTier, currentPoints }: { tier: typeof TIERS[0]; currentTier: VipTier; currentPoints: number }) {
  const isActive = tier.tier === currentTier;
  const isUnlocked = currentPoints >= tier.points;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'relative p-5 rounded-2xl border transition-all duration-300',
        isActive
          ? 'border-neon-gold/50 bg-neon-gold/5 shadow-neon-gold'
          : isUnlocked
          ? 'border-white/10 bg-white/5'
          : 'border-white/5 bg-white/2 opacity-60'
      )}
    >
      {isActive && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <Badge variant="gold" size="sm">Current</Badge>
        </div>
      )}
      <div className="text-center mb-4">
        <span className="text-3xl">{TIER_ICONS[tier.tier]}</span>
        <h3 className={cn('font-display font-bold text-lg mt-1', getTierColor(tier.tier))}>
          {tier.label}
        </h3>
        <p className="text-xs text-white/40">{tier.points.toLocaleString()} pts</p>
      </div>
      <ul className="space-y-1.5">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2 text-xs text-white/60">
            <span className={cn('w-1 h-1 rounded-full', isUnlocked ? 'bg-neon-green' : 'bg-white/20')} />
            {perk}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function OrderModal({ onClose }: { onClose: () => void }) {
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();
  const [venueId, setVenueId] = useState('club-nexus');
  const [items, setItems] = useState([{ name: 'Signature Cocktail', price: 18 }]);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const orderMutation = useMutation({
    mutationFn: () =>
      gamificationService.placeOrder({
        venue_id: venueId,
        items,
        total_amount: total.toFixed(2),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addNotification({ type: 'success', title: 'Order placed!', message: `+${total} VIP points earned` });
      onClose();
    },
    onError: () => addNotification({ type: 'error', title: 'Order failed' }),
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
          <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-neon-gold" />
            Place Order
          </h3>

          <div className="space-y-3 mb-4">
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="club-nexus">Club Nexus</option>
              <option value="neon-lounge">Neon Lounge</option>
              <option value="cyber-bar">Cyber Bar</option>
            </select>

            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                <span className="flex-1 text-sm text-white">{item.name}</span>
                <span className="text-sm font-medium text-neon-gold">${item.price}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-neon-gold/5 border border-neon-gold/20">
            <span className="text-sm text-white/60">Total</span>
            <span className="font-bold text-neon-gold">{formatCurrency(total)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="neon" size="md" className="flex-1" onClick={() => orderMutation.mutate()} loading={orderMutation.isPending}>
              Confirm Order
            </Button>
            <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export function Gamification() {
  const [showOrder, setShowOrder] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['gamification-stats'],
    queryFn: gamificationService.getStats,
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: gamificationService.getOrders,
  });

  const tierInfo = stats ? getTierPoints(stats.tier) : null;
  const tierProgress = tierInfo && stats
    ? Math.min(100, ((stats.vip_points - tierInfo.current) / Math.max(1, tierInfo.next - tierInfo.current)) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="VIP & Gamification" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Hero stats */}
        {isLoading ? (
          <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        ) : stats ? (
          <GlassCard className="p-6 relative overflow-hidden" animate={false}>
            <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-white/50 text-sm mb-1">Your VIP Status</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{TIER_ICONS[stats.tier]}</span>
                    <div>
                      <h2 className={cn('font-display font-bold text-3xl', getTierColor(stats.tier))}>
                        {stats.tier}
                      </h2>
                      <p className="text-white/40 text-sm">{stats.vip_points.toLocaleString()} points</p>
                    </div>
                  </div>
                </div>
                <Button variant="gold" size="sm" onClick={() => setShowOrder(true)}>
                  <ShoppingCart className="w-4 h-4" />
                  Order
                </Button>
              </div>

              <NeonProgress
                value={stats.vip_points}
                max={tierInfo?.next ?? 500}
                color="gold"
                size="lg"
                label={`${stats.vip_points} / ${tierInfo?.next} pts → ${tierInfo?.label}`}
                showValue
              />

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <Flame className="w-5 h-5 text-neon-pink mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{stats.party_streak}</p>
                  <p className="text-xs text-white/40">Day Streak</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <TrendingUp className="w-5 h-5 text-neon-green mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{formatCurrency(stats.total_spent)}</p>
                  <p className="text-xs text-white/40">Total Spent</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <Star className="w-5 h-5 text-neon-gold mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{stats.badges.length}</p>
                  <p className="text-xs text-white/40">Badges</p>
                </div>
              </div>
            </div>
          </GlassCard>
        ) : null}

        {/* Badges */}
        {stats && stats.badges.length > 0 && (
          <GlassCard className="p-5" animate={false}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-neon-gold" />
              Badges Earned
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {stats.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={badge.name}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-neon-gold/10 border border-neon-gold/20 flex items-center justify-center shadow-neon-gold">
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} className="w-7 h-7" />
                    ) : (
                      <Trophy className="w-6 h-6 text-neon-gold" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 text-center leading-tight">{badge.name}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Tier progression */}
        <GlassCard className="p-5" animate={false}>
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-neon-gold" />
            VIP Tiers
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((t) => (
              <TierCard
                key={t.tier}
                tier={t}
                currentTier={stats?.tier ?? 'BRONZE'}
                currentPoints={stats?.vip_points ?? 0}
              />
            ))}
          </div>
        </GlassCard>

        {/* Order history */}
        {orders && orders.length > 0 && (
          <GlassCard className="p-5" animate={false}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-neon-blue" />
              Order History
            </h3>
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-9 h-9 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-neon-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{order.venue_id}</p>
                    <p className="text-xs text-white/40">{order.items.length} items · {formatTimeAgo(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neon-gold">{formatCurrency(order.total_amount)}</p>
                    <Badge
                      variant={order.status === 'DELIVERED' ? 'green' : order.status === 'CANCELLED' ? 'red' : 'blue'}
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      <AnimatePresence>
        {showOrder && <OrderModal onClose={() => setShowOrder(false)} />}
      </AnimatePresence>
    </div>
  );
}
