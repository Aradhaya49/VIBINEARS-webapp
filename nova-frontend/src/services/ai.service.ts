import apiClient from './api';
import type { IntentResponse, TranslateResponse, SuggestResponse } from '@/types';

export const aiService = {
  processIntent: (transcript: string, context?: Record<string, unknown>) =>
    apiClient
      .post<IntentResponse>('/ai/intent/', { transcript, context: context ?? {} })
      .then((r) => r.data),

  translate: (text: string, target_language = 'en') =>
    apiClient
      .post<TranslateResponse>('/ai/translate/', { text, target_language })
      .then((r) => r.data),

  getSuggestions: (messages: Array<{ role: string; content: string }>, context?: Record<string, unknown>) =>
    apiClient
      .post<SuggestResponse>('/ai/suggest/', { messages, context: context ?? {} })
      .then((r) => r.data),
};
