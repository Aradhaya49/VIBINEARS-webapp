import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Shield,
} from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TopBar } from '@/components/layout/TopBar';

import { sosService } from '@/services/sos.service';
import { authService } from '@/services/auth.service';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useUIStore } from '@/store/ui.store';

import { formatTimeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

import type { SosEvent } from '@/types';

function SOSTriggerButton({
  onTrigger,
}: {
  onTrigger: () => void;
}) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timer, setTimer] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  const startCountdown = () => {
    setCountdown(3);

    const t = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(t);
          setTimer(null);

          if (c === 1) onTrigger();

          return null;
        }

        return c - 1;
      });
    }, 1000);

    setTimer(t);
  };

  const cancel = () => {
    if (timer) clearInterval(timer);

    setTimer(null);
    setCountdown(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {countdown !== null && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500/50"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full border border-red-400/30"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.3,
              }}
            />
          </>
        )}

        <motion.button
          whileHover={{
            scale: countdown === null ? 1.05 : 1,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={
            countdown === null
              ? startCountdown
              : cancel
          }
          className={cn(
            'relative w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 font-bold text-white',
            countdown !== null
              ? 'bg-gradient-to-br from-red-600 to-red-500 shadow-[0_0_60px_rgba(239,68,68,0.8)]'
              : 'bg-gradient-to-br from-red-700 to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)]'
          )}
        >
          <AlertTriangle className="w-10 h-10" />

          {countdown !== null ? (
            <span className="text-4xl font-mono">
              {countdown}
            </span>
          ) : (
            <span className="text-sm">
              HOLD SOS
            </span>
          )}
        </motion.button>
      </div>

      {countdown !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={cancel}
          >
            Cancel
          </Button>
        </motion.div>
      )}

      <p className="text-xs text-white/40 text-center max-w-xs">
        {countdown !== null
          ? 'Sending SOS in...'
          : 'Hold to trigger emergency alert. Your location will be shared with emergency contacts.'}
      </p>
    </div>
  );
}

export function SOS() {
  const { addNotification } = useUIStore();

  const { latitude, longitude } =
    useGeolocation();

  const queryClient = useQueryClient();

  const [activeEvent, setActiveEvent] =
    useState<SosEvent | null>(null);

  const [showAddContact, setShowAddContact] =
    useState(false);

  const [newContact, setNewContact] =
    useState({
      name: '',
      phone: '',
      relation: '',
    });

  const { data: history = [] } = useQuery({
    queryKey: ['sos-history'],
    queryFn: sosService.getSOSHistory,
  });

  const {
    data: contacts = [],
    refetch: refetchContacts,
  } = useQuery({
    queryKey: ['emergency-contacts'],
    queryFn: authService.getEmergencyContacts,
  });

  const triggerMutation = useMutation({
    mutationFn: () =>
      sosService.triggerSOS({
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        trigger_type: 'MANUAL',
        notes: 'Emergency triggered from app',
      }),

    onSuccess: (event) => {
      setActiveEvent(event);

      queryClient.invalidateQueries({
        queryKey: ['sos-history'],
      });

      addNotification({
        type: 'error',
        title: '🚨 SOS Triggered',
        message:
          'Emergency contacts notified',
        duration: 0,
      });
    },

    onError: () =>
      addNotification({
        type: 'error',
        title: 'SOS Failed',
        message: 'Could not trigger SOS',
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) =>
      sosService.resolveSOS(id),

    onSuccess: () => {
      setActiveEvent(null);

      queryClient.invalidateQueries({
        queryKey: ['sos-history'],
      });

      addNotification({
        type: 'success',
        title: 'SOS Resolved',
        message: 'Emergency resolved',
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: () =>
      authService.createEmergencyContact(
        newContact
      ),

    onSuccess: () => {
      refetchContacts();

      setShowAddContact(false);

      setNewContact({
        name: '',
        phone: '',
        relation: '',
      });

      addNotification({
        type: 'success',
        title: 'Contact added',
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) =>
      authService.deleteEmergencyContact(id),

    onSuccess: () => refetchContacts(),
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="SOS Safety" />

      <AnimatePresence>
        {activeEvent && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="bg-red-500/20 border-b border-red-500/30 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

              <span className="text-sm font-semibold text-red-400">
                SOS ACTIVE — Emergency contacts
                notified
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                resolveMutation.mutate(
                  activeEvent.id
                )
              }
              loading={resolveMutation.isPending}
              className="text-green-400 border-green-500/30 hover:bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <GlassCard
          className="p-8 flex flex-col items-center"
          animate={false}
        >
          <div className="mb-6 text-center">
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              Emergency SOS
            </h2>

            <p className="text-white/50 text-sm">
              Instantly alert your emergency
              contacts
            </p>
          </div>

          <SOSTriggerButton
            onTrigger={() =>
              triggerMutation.mutate()
            }
          />
        </GlassCard>
      </div>
    </div>
  );
}