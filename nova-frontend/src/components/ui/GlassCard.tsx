import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'purple' | 'blue' | 'pink' | 'cyan' | 'gold' | 'red';
  onClick?: () => void;
  animate?: boolean;
  delay?: number;
}

const glowMap = {
  purple: 'hover:shadow-neon-purple hover:border-neon-purple/30',
  blue: 'hover:shadow-neon-blue hover:border-neon-blue/30',
  pink: 'hover:shadow-neon-pink hover:border-neon-pink/30',
  cyan: 'hover:shadow-neon-cyan hover:border-neon-cyan/30',
  gold: 'hover:shadow-neon-gold hover:border-neon-gold/30',
  red: 'hover:shadow-neon-red hover:border-red-500/30',
};

export function GlassCard({
  children,
  className,
  hover,
  glow,
  onClick,
  animate = true,
  delay = 0,
}: GlassCardProps) {
  const Component = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
      }
    : {};

  return (
    <Component
      {...animProps}
      onClick={onClick}
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]',
        hover && 'transition-all duration-300 hover:bg-white/8 cursor-pointer',
        glow && hover && glowMap[glow],
        className
      )}
    >
      {children}
    </Component>
  );
}
