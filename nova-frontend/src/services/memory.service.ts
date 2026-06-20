import apiClient from './api';
import type { Memory } from '@/types';

export const memoryService = {
  searchMemories: (query: string) =>
    apiClient
      .get<{ memories: Memory[] }>('/memory/search/', { params: { query } })
      .then((r) => r.data.memories),

  storeMemory: (content: string, tags: string[] = []) =>
    apiClient.post<Memory>('/memory/store/', { content, tags }).then((r) => r.data),
};
