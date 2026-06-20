import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface NeonProgressProps {
  value: number; // 0-100
  max?: number;
  color?: 'purple' | 'blue' | 'pink' | 'cyan' | 'gold' | 'red' | 'green';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const colorMap = {
  purple: { bar: 'from-neon-purple to-neon-blue', glow: 'rgba(139,92,246,0.5)' },
  blue: { bar: 'from-neon-blue to-neon-cyan', glow: 'rgba(59,130,246,0.5)' },
  pink: { bar: 'from-neon-pink to-neon-purple', glow: 'rgba(236,72,153,0.5)' },
  cyan: { bar: 'from-neon-cyan to-neon-blue', glow: 'rgba(34,211,238,0.5)' },
  gold: { bar: 'from-neon-gold to-amber-400', glow: 'rgba(250,204,21,0.5)' },
  red: { bar: 'from-red-500 to-red-400', glow: 'rgba(239,68,68,0.5)' },
  green: { bar: 'from-green-500 to-emerald-400', glow: 'rgba(34,197,94,0.5)' },
};

const sizeMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function NeonProgress({
  value,
  max = 100,
  color = 'purple',
  size = 'md',
  label,
  showValue,
  animated = true,
  className,
}: NeonProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const { bar, glow } = colorMap[color];

  return (
    <div className={cn('w-full space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs text-white/60">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-white/5 rounded-full overflow-hidden', sizeMap[size])}>
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', bar)}
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ boxShadow: `0 0 8px ${glow}` }}
        />
      </div>
    </div>
  );
}
