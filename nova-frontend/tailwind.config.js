/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary neon palette
        neon: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          pink: '#EC4899',
          cyan: '#22D3EE',
          gold: '#FACC15',
          red: '#EF4444',
          green: '#22C55E',
        },
        // Background
        bg: {
          black: '#09090B',
          dark: '#18181B',
          card: 'rgba(255,255,255,0.05)',
          glass: 'rgba(255,255,255,0.08)',
        },
        // Text
        text: {
          white: '#FAFAFA',
          muted: '#A1A1AA',
          dim: '#71717A',
        },
        // Border
        border: {
          glass: 'rgba(255,255,255,0.1)',
          neon: 'rgba(139,92,246,0.5)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #EC4899 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FACC15 0%, #F59E0B 100%)',
        'danger-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.2)',
        'neon-blue': '0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.2)',
        'neon-pink': '0 0 20px rgba(236,72,153,0.5), 0 0 40px rgba(236,72,153,0.2)',
        'neon-cyan': '0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.2)',
        'neon-gold': '0 0 20px rgba(250,204,21,0.5), 0 0 40px rgba(250,204,21,0.2)',
        'neon-red': '0 0 20px rgba(239,68,68,0.5), 0 0 40px rgba(239,68,68,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'inner-glow': 'inset 0 0 20px rgba(139,92,246,0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'particle': 'particle 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139,92,246,0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(139,92,246,0.9), 0 0 60px rgba(139,92,246,0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(2)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(100px)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
