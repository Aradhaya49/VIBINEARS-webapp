import apiClient from './api';
import type { SosEvent, SosTriggerType } from '@/types';

export const sosService = {
  triggerSOS: (payload: {
    latitude: number;
    longitude: number;
    trigger_type: SosTriggerType;
    audio_url?: string;
    notes?: string;
  }) => apiClient.post<SosEvent>('/sos/trigger/', payload).then((r) => r.data),

  resolveSOS: (id: number) =>
    apiClient.put<SosEvent>(`/sos/${id}/resolve/`).then((r) => r.data),

  getSOSHistory: () =>
    apiClient.get<SosEvent[]>('/sos/history/').then((r) => r.data),
};
