import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  isVip?: boolean;
  isOpenToTalk?: boolean;
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const dotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

export function Avatar({ src, name, size = 'md', isOnline, isVip, isOpenToTalk, className }: AvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold',
          sizes[size],
          isVip
            ? 'ring-2 ring-neon-gold shadow-neon-gold'
            : isOpenToTalk
            ? 'ring-2 ring-neon-cyan shadow-neon-cyan'
            : 'ring-1 ring-white/10'
        )}
        style={{
          background: src ? undefined : 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
        }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white">{getInitials(name)}</span>
        )}
      </div>

      {/* Online indicator */}
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-bg-black',
            dotSizes[size],
            isOnline ? 'bg-neon-green' : 'bg-gray-500'
          )}
        >
          {isOnline && (
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          )}
        </span>
      )}

      {/* VIP crown */}
      {isVip && (
        <span className="absolute -top-1 -right-1 text-xs">👑</span>
      )}
    </div>
  );
}
