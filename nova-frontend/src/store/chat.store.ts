import { create } from 'zustand';
import type { Conversation, Message } from '@/types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Record<number, Message[]>;
  typingUsers: Record<number, Set<number>>; // conversationId -> Set<userId>

  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: number | null) => void;
  setMessages: (conversationId: number, messages: Message[]) => void;
  addMessage: (conversationId: number, message: Message) => void;
  prependMessages: (conversationId: number, messages: Message[]) => void;
  setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;
  updateConversationLastMessage: (conversationId: number, message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  setMessages: (conversationId, messages) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: messages } })),

  addMessage: (conversationId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), message],
      },
    })),

  prependMessages: (conversationId, messages) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...messages, ...(s.messages[conversationId] ?? [])],
      },
    })),

  setTyping: (conversationId, userId, isTyping) =>
    set((s) => {
      const current = new Set(s.typingUsers[conversationId] ?? []);
      isTyping ? current.add(userId) : current.delete(userId);
      return { typingUsers: { ...s.typingUsers, [conversationId]: current } };
    }),

  updateConversationLastMessage: (conversationId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, last_message: message } : c
      ),
    })),
}));
