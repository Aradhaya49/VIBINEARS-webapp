import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { RegisterPayload } from '@/types';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/services/auth.service';

export function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addNotification } = useUIStore();
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Min 3 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.password2) e.password2 = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Omit phone entirely if empty — backend model doesn't accept empty string
      const payload: RegisterPayload = {
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      };

      const data = await authService.register(payload);
      setAuth(data.user, data.access_token, data.refresh_token);
      addNotification({ type: 'success', title: 'Welcome to Nova!', message: 'Your account is ready 🚀' });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      if (errData && typeof errData === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.entries(errData).forEach(([k, v]) => {
          if (k === 'non_field_errors') {
            // Show non-field errors as a toast
            const msg = Array.isArray(v) ? v[0] : String(v);
            addNotification({ type: 'error', title: 'Registration failed', message: msg });
          } else {
            fieldErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
          }
        });
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      } else {
        addNotification({ type: 'error', title: 'Registration failed', message: 'Could not reach the server. Is the backend running?' });
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  });

  return (
    <div className="min-h-screen bg-bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField count={30} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-neon-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-neon-purple/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center mx-auto mb-4 shadow-neon-pink"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white">Join Nova</h1>
          <p className="text-white/50 mt-1">Create your account and enter the future</p>
        </div>

        <GlassCard className="p-8" animate={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="cyberpunk_user"
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
              {...field('username')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              {...field('email')}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+1 234 567 8900"
              icon={<Phone className="w-4 h-4" />}
              autoComplete="tel"
              {...field('phone')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              icon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="new-password"
              {...field('password')}
            />
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              {...field('password2')}
            />

            <Button type="submit" variant="neon" size="lg" loading={loading} glow className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-neon-purple hover:text-neon-blue transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
