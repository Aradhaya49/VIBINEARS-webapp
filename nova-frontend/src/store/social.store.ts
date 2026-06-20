import { create } from 'zustand';
import type { NearbyUser, Connection } from '@/types';

interface SocialState {
  nearbyUsers: NearbyUser[];
  onlineUsers: Set<number>;
  openToTalkUsers: Set<number>;
  pendingConnections: Connection[];

  setNearbyUsers: (users: NearbyUser[]) => void;
  setUserOnline: (userId: number, isOnline: boolean) => void;
  setUserOpenToTalk: (userId: number, isOpen: boolean) => void;
  addPendingConnection: (conn: Connection) => void;
  removePendingConnection: (connId: number) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  nearbyUsers: [],
  onlineUsers: new Set(),
  openToTalkUsers: new Set(),
  pendingConnections: [],

  setNearbyUsers: (nearbyUsers) => set({ nearbyUsers }),

  setUserOnline: (userId, isOnline) =>
    set((s) => {
      const onlineUsers = new Set(s.onlineUsers);
      isOnline ? onlineUsers.add(userId) : onlineUsers.delete(userId);
      return { onlineUsers };
    }),

  setUserOpenToTalk: (userId, isOpen) =>
    set((s) => {
      const openToTalkUsers = new Set(s.openToTalkUsers);
      isOpen ? openToTalkUsers.add(userId) : openToTalkUsers.delete(userId);
      return { openToTalkUsers };
    }),

  addPendingConnection: (conn) =>
    set((s) => ({ pendingConnections: [...s.pendingConnections, conn] })),

  removePendingConnection: (connId) =>
    set((s) => ({ pendingConnections: s.pendingConnections.filter((c) => c.id !== connId) })),
}));
