import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Users, Bot, Shield, MapPin, Trophy, ArrowRight, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { Waveform } from '@/components/ui/Waveform';
import { Badge } from '@/components/ui/Badge';

const features = [
  { icon: Users, title: 'Nearby Discovery', desc: 'Find open-to-talk people within meters of you in real time', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
  { icon: Bot, title: 'AI Nova Assistant', desc: 'Voice-powered AI that understands intent and suggests icebreakers', color: 'text-neon-pink', bg: 'bg-neon-pink/10' },
  { icon: MapPin, title: 'Spatial Audio Notes', desc: 'Leave geo-tagged voice notes that others discover nearby', color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
  { icon: Trophy, title: 'VIP Gamification', desc: 'Earn XP, unlock tiers, and climb the party leaderboard', color: 'text-neon-gold', bg: 'bg-neon-gold/10' },
  { icon: Shield, title: 'SOS Safety', desc: 'One-tap emergency alerts with live location to your contacts', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Zap, title: 'Real-time Everything', desc: 'WebSocket-powered presence, chat, and live notifications', color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Connections Made' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<50ms', label: 'Latency' },
];

export function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-bg-black overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleField count={60} />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/5 rounded-full blur-3xl pointer-events-none" />

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">NOVA</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="neon" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </nav>

        {/* Hero content */}
        <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="purple" className="mb-6 mx-auto">
              <Zap className="w-3 h-3" />
              AI-Powered Social Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl text-white leading-none mb-6"
          >
            The Future of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink animate-gradient-shift bg-[length:200%_auto]">
              Social
            </span>
            <br />
            Is Here
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover people nearby, connect through AI-powered icebreakers, and experience
            real-time social audio in a cyberpunk-inspired world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="neon" size="xl" glow onClick={() => navigate('/register')}>
              Enter Nova
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="xl" onClick={() => navigate('/login')}>
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </motion.div>

          {/* AI Preview widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-md mx-auto"
          >
            <GlassCard className="p-5" animate={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Nova AI</p>
                  <p className="text-xs text-white/40">Listening...</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="pink" size="sm" pulse>Live</Badge>
                </div>
              </div>
              <Waveform isActive bars={20} color="#EC4899" size="md" className="justify-center" />
              <p className="text-xs text-white/50 text-center mt-3 italic">
                "Find me someone open to talk nearby"
              </p>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display font-bold text-3xl sm:text-4xl gradient-text">{s.value}</p>
                <p className="text-sm text-white/50 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="cyan" className="mb-4 mx-auto">Features</Badge>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Everything you need to{' '}
              <span className="gradient-text">connect</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              A complete social platform built for the next generation of human connection.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <GlassCard className="p-6 h-full" hover glow="purple" animate={false}>
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-neon-gold fill-neon-gold" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl text-white/80 font-light italic mb-6">
            "Nova completely changed how I meet people at events. The AI icebreakers are
            genuinely brilliant — I've made more real connections in a week than in a year."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink" />
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Alex Chen</p>
              <p className="text-xs text-white/40">Early Access User</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-pink/20 rounded-3xl blur-xl" />
            <GlassCard className="relative p-12" animate={false}>
              <h2 className="font-display font-bold text-4xl text-white mb-4">
                Ready to enter the future?
              </h2>
              <p className="text-white/50 mb-8">
                Join thousands already experiencing the next generation of social connection.
              </p>
              <Button variant="neon" size="xl" glow onClick={() => navigate('/register')}>
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-white/30 text-sm">
        <p>© 2026 Nova Platform. Built for the future.</p>
      </footer>
    </div>
  );
}
