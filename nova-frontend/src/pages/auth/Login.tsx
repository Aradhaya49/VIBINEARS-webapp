import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/services/auth.service';

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addNotification } = useUIStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authService.login(form);
      setAuth(data.user, data.access_token, data.refresh_token);
      addNotification({ type: 'success', title: 'Welcome back!', message: `Hey ${data.user.username} 👋` });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const msg =
        (errData?.non_field_errors as string[] | undefined)?.[0] ??
        (errData?.detail as string | undefined) ??
        'Invalid email or password';
      addNotification({ type: 'error', title: 'Login failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField count={30} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-neon-purple/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center mx-auto mb-4 shadow-neon-purple"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white">Welcome back</h1>
          <p className="text-white/50 mt-1">Sign in to your Nova account</p>
        </div>

        <GlassCard className="p-8" animate={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" variant="neon" size="lg" loading={loading} glow className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-neon-purple hover:text-neon-blue transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </GlassCard>

        <p className="text-center text-white/20 text-xs mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
