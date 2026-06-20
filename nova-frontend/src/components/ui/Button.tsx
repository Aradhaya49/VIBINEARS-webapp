import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> & {
  variant?: 'neon' | 'ghost' | 'danger' | 'gold' | 'cyan' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  glow?: boolean;
  children?: ReactNode;
};

const variants = {
  neon: 'relative text-white font-semibold overflow-hidden bg-gradient-to-r from-neon-purple to-neon-blue hover:shadow-neon-purple',
  ghost: 'text-white/80 border border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-white',
  danger: 'text-white font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:shadow-neon-red',
  gold: 'text-bg-black font-bold bg-gradient-to-r from-neon-gold to-amber-400 hover:shadow-neon-gold',
  cyan: 'text-bg-black font-semibold bg-gradient-to-r from-neon-cyan to-neon-blue hover:shadow-neon-cyan',
  outline: 'text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/10 hover:border-neon-purple',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'neon', size = 'md', loading, glow, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -1 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer select-none',
          variants[variant],
          sizes[size],
          glow && variant === 'neon' && 'shadow-neon-purple',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
