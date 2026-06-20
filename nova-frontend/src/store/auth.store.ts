import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokens, clearTokens } from '@/services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, access, refresh) => {
        setTokens(access, refresh);
        set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'nova-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
