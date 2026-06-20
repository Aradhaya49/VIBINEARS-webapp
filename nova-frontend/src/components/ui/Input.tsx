import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-white/70">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-300',
              'focus:border-neon-purple/60 focus:bg-white/8 focus:ring-2 focus:ring-neon-purple/15',
              icon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/15',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
