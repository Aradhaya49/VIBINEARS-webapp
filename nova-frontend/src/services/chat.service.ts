import apiClient from './api';
import type { Conversation, Message, PaginatedResponse, ApiPaginatedResponse} from '@/types';

export const chatService = {
 getConversations: () =>apiClient
    .get<ApiPaginatedResponse<Conversation>>('/chat/conversations/')
    .then((r) => r.data.results || []),

  createConversation: (userId: number) =>
    apiClient.post<Conversation>('/chat/conversations/create/', { user_id: userId }).then((r) => r.data),

  getMessages: (conversationId: number, page = 1) =>
    apiClient
      .get<PaginatedResponse<Message>>(`/chat/conversations/${conversationId}/messages/`, {
        params: { page },
      })
      .then((r) => r.data),

  sendMessage: (
    conversationId: number,
    payload: { content: string; message_type?: string; audio_url?: string; metadata?: Record<string, unknown> }
  ) =>
    apiClient
      .post<Message>(`/chat/conversations/${conversationId}/messages/`, payload)
      .then((r) => r.data),

  getSuggestedReplies: (conversationId: number) =>
    apiClient
      .get<{ suggestions: string[] }>('/chat/suggest-reply/', { params: { conversationId } })
      .then((r) => r.data),
};
