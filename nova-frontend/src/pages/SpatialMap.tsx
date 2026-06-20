import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mic, MicOff, Plus, Radio, Navigation, Volume2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Waveform } from '@/components/ui/Waveform';
import { TopBar } from '@/components/layout/TopBar';
import { locationService } from '@/services/location.service';
import { socialService } from '@/services/social.service';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useVoice } from '@/hooks/useVoice';
import { useSocialStore } from '@/store/social.store';
import { useUIStore } from '@/store/ui.store';
import { formatDistance, formatTimeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { GeoNote, NearbyUser } from '@/types';

// Simulated map using CSS/canvas since we don't have a map library
function MapCanvas({
  center,
  geoNotes,
  nearbyUsers,
  onNoteClick,
}: {
  center: { lat: number; lng: number } | null;
  geoNotes: GeoNote[];
  nearbyUsers: NearbyUser[];
  onNoteClick: (note: GeoNote) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Center user
    const cx = w / 2;
    const cy = h / 2;

    // Radius rings
    [80, 160, 240].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139,92,246,${0.08 - i * 0.02})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Nearby users (scattered around center)
    nearbyUsers.slice(0, 8).forEach((u, i) => {
      const angle = (i / nearbyUsers.length) * Math.PI * 2;
      const dist = 60 + (u.distance_meters / 500) * 160;
      const ux = cx + Math.cos(angle) * dist;
      const uy = cy + Math.sin(angle) * dist;

      // Pulse ring
      ctx.beginPath();
      ctx.arc(ux, uy, 14, 0, Math.PI * 2);
      ctx.fillStyle = u.is_open_to_talk ? 'rgba(34,211,238,0.1)' : 'rgba(139,92,246,0.1)';
      ctx.fill();

      // User dot
      ctx.beginPath();
      ctx.arc(ux, uy, 8, 0, Math.PI * 2);
      ctx.fillStyle = u.is_open_to_talk ? '#22D3EE' : '#8B5CF6';
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(u.username.slice(0, 8), ux, uy + 20);
    });

    // Geo notes
    geoNotes.slice(0, 6).forEach((note, i) => {
      const angle = (i / Math.max(geoNotes.length, 1)) * Math.PI * 2 + Math.PI / 4;
      const dist = 50 + Math.random() * 120;
      const nx = cx + Math.cos(angle) * dist;
      const ny = cy + Math.sin(angle) * dist;

      ctx.beginPath();
      ctx.arc(nx, ny, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236,72,153,0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#EC4899';
      ctx.fill();
    });

    // Center user (you)
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139,92,246,0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    grad.addColorStop(0, '#8B5CF6');
    grad.addColorStop(1, '#3B82F6');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', cx, cy + 4);

  }, [geoNotes, nearbyUsers]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: 'crosshair' }}
    />
  );
}

export function SpatialMap() {
  const { latitude, longitude, updateLocation } = useGeolocation();
  const { nearbyUsers } = useSocialStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<GeoNote | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [noteTranscript, setNoteTranscript] = useState('');

  const { isListening, audioLevel, toggleListening, transcript } = useVoice((text) => {
    setNoteTranscript(text);
  });

  const { data: geoNotes } = useQuery({
    queryKey: ['geo-notes', latitude, longitude],
    queryFn: () => locationService.getNearbyGeoNotes(latitude!, longitude!, 500),
    enabled: !!latitude && !!longitude,
    refetchInterval: 30000,
  });

  const { data: nearby } = useQuery({
    queryKey: ['nearby'],
    queryFn: () => socialService.getNearbyUsers({ lat: latitude ?? undefined, lng: longitude ?? undefined }),
    enabled: !!latitude && !!longitude,
    refetchInterval: 30000,
  });

  const createNoteMutation = useMutation({
    mutationFn: () =>
      locationService.createGeoNote({
        latitude: latitude!,
        longitude: longitude!,
        transcript: noteTranscript,
        radius_meters: 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-notes'] });
      setNoteTranscript('');
      setIsRecording(false);
      addNotification({ type: 'success', title: 'Voice note dropped!', message: 'Others nearby can discover it' });
    },
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Spatial Map" />
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapCanvas
            center={latitude && longitude ? { lat: latitude, lng: longitude } : null}
            geoNotes={geoNotes ?? []}
            nearbyUsers={nearby ?? nearbyUsers}
            onNoteClick={setSelectedNote}
          />

          {/* Map overlay controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={updateLocation}
              className="bg-bg-dark/80 backdrop-blur-xl"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-dark/80 backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-purple" />
              <span className="text-xs text-white/60">You</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-dark/80 backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
              <span className="text-xs text-white/60">Open to Talk</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-dark/80 backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-pink" />
              <span className="text-xs text-white/60">Voice Notes</span>
            </div>
          </div>

          {/* No location warning */}
          {!latitude && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-black/60 backdrop-blur-sm">
              <GlassCard className="p-6 text-center max-w-xs" animate={false}>
                <MapPin className="w-8 h-8 text-neon-purple mx-auto mb-3" />
                <p className="text-white font-medium mb-2">Location Required</p>
                <p className="text-white/50 text-sm mb-4">Enable location to see the spatial map</p>
                <Button variant="neon" size="sm" onClick={updateLocation}>Enable Location</Button>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-80 border-l border-white/5 bg-bg-dark/60 backdrop-blur-xl flex flex-col overflow-hidden hidden lg:flex">
          {/* Drop voice note */}
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-neon-pink" />
              Drop Voice Note
            </h3>

            <div className="flex flex-col items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                  isListening
                    ? 'bg-neon-pink shadow-neon-pink'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                )}
              >
                {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white/60" />}
              </motion.button>

              {isListening && (
                <Waveform isActive audioLevel={audioLevel} bars={12} color="#EC4899" size="sm" />
              )}

              {noteTranscript && (
                <div className="w-full p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/70 italic">"{noteTranscript}"</p>
                </div>
              )}

              {noteTranscript && (
                <Button
                  variant="neon"
                  size="sm"
                  className="w-full"
                  onClick={() => createNoteMutation.mutate()}
                  loading={createNoteMutation.isPending}
                >
                  <MapPin className="w-4 h-4" />
                  Drop Note Here
                </Button>
              )}
            </div>
          </div>

          {/* Nearby notes */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-neon-cyan" />
              Nearby Notes ({geoNotes?.length ?? 0})
            </h3>

            {!geoNotes || geoNotes.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">
                <Radio className="w-6 h-6 mx-auto mb-2 opacity-50" />
                No voice notes nearby
              </div>
            ) : (
              <div className="space-y-3">
                {geoNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    whileHover={{ x: 2 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-pink/20 cursor-pointer transition-all"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-neon-pink" />
                      <span className="text-xs text-white/40">{formatTimeAgo(note.created_at)}</span>
                      <Badge variant="pink" size="sm" className="ml-auto">{note.radius_meters}m</Badge>
                    </div>
                    {note.transcript && (
                      <p className="text-xs text-white/70 italic line-clamp-2">"{note.transcript}"</p>
                    )}
                    {note.audio_url && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Volume2 className="w-3 h-3 text-neon-cyan" />
                        <span className="text-xs text-neon-cyan">Audio note</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
