import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface WaveformProps {
  isActive?: boolean;
  audioLevel?: number; // 0-1
  bars?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { height: 'h-4', barWidth: 'w-0.5', gap: 'gap-0.5' },
  md: { height: 'h-8', barWidth: 'w-1', gap: 'gap-1' },
  lg: { height: 'h-16', barWidth: 'w-1.5', gap: 'gap-1.5' },
};

export function Waveform({
  isActive = false,
  audioLevel = 0,
  bars = 12,
  color = '#8B5CF6',
  size = 'md',
  className,
}: WaveformProps) {
  const { height, barWidth, gap } = sizeMap[size];

  return (
    <div className={cn('flex items-center', gap, height, className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const baseDelay = (i / bars) * 0.8;
        const amplitude = isActive ? 0.3 + audioLevel * 0.7 : 0.15;
        const randomHeight = 0.2 + Math.sin(i * 1.5) * 0.3 + Math.cos(i * 0.8) * 0.2;

        return (
          <motion.div
            key={i}
            className={cn('rounded-full flex-shrink-0', barWidth)}
            style={{ backgroundColor: color, opacity: isActive ? 0.9 : 0.3 }}
            animate={
              isActive
                ? {
                    scaleY: [
                      randomHeight * amplitude,
                      (0.5 + Math.random() * 0.5) * amplitude,
                      randomHeight * amplitude,
                    ],
                  }
                : { scaleY: 0.15 }
            }
            transition={
              isActive
                ? {
                    duration: 0.4 + Math.random() * 0.4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: baseDelay,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </div>
  );
}
