import { create } from 'zustand';
import type { Notification } from '@/types';

interface UIState {
  notifications: Notification[];
  isSidebarOpen: boolean;
  isWSConnected: boolean;
  theme: 'dark' | 'light';

  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setWSConnected: (connected: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  notifications: [],
  isSidebarOpen: false,
  isWSConnected: false,
  theme: 'dark',

  addNotification: (n) => {
    const id = Math.random().toString(36).slice(2);
    const notification: Notification = { ...n, id };
    set((s) => ({ notifications: [...s.notifications, notification] }));
    const duration = n.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => get().removeNotification(id), duration);
    }
  },

  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  setWSConnected: (isWSConnected) => set({ isWSConnected }),

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
}));
