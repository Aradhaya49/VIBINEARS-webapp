import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/utils/cn';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  info: <Info className="w-4 h-4 text-neon-cyan" />,
};

const borders = {
  success: 'border-green-500/30',
  error: 'border-red-500/30',
  warning: 'border-yellow-500/30',
  info: 'border-neon-cyan/30',
};

export function NotificationToast() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'glass-card p-4 flex items-start gap-3 pointer-events-auto',
              'border', borders[n.type]
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[n.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{n.title}</p>
              {n.message && <p className="text-xs text-white/60 mt-0.5">{n.message}</p>}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
