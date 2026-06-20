import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white/5 rounded-lg overflow-hidden relative',
        'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent',
        'after:animate-shimmer after:bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function UserCardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-8 w-full rounded-xl" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}>
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-36')} />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}
