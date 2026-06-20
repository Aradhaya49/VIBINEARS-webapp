import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'pink' | 'cyan' | 'gold' | 'red' | 'green' | 'ghost';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const variants = {
  purple: 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30',
  blue: 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30',
  pink: 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30',
  cyan: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30',
  gold: 'bg-neon-gold/20 text-neon-gold border border-neon-gold/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  green: 'bg-green-500/20 text-green-400 border border-green-500/30',
  ghost: 'bg-white/5 text-white/60 border border-white/10',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-3 py-1 text-xs rounded-lg',
};

export function Badge({ children, variant = 'purple', size = 'md', pulse, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', variants[variant], sizes[size], className)}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            variant === 'green' ? 'bg-green-400' : 'bg-current'
          )} />
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5',
            variant === 'green' ? 'bg-green-400' : 'bg-current'
          )} />
        </span>
      )}
      {children}
    </span>
  );
}
