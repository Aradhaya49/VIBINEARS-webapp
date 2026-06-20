import apiClient from './api';
import type { NearbyUser, Connection, IcebreakerResponse } from '@/types';

export const socialService = {
  getNearbyUsers: (params?: { lat?: number; lng?: number; radius?: number }) =>
    apiClient.get<NearbyUser[]>('/social/nearby/', { params }).then((r) => r.data),

  toggleOpenToTalk: (is_open: boolean) =>
    apiClient.put('/social/open-to-talk/', { is_open }).then((r) => r.data),

  updateLocation: (latitude: number, longitude: number) =>
    apiClient.put('/social/location/', { latitude, longitude }).then((r) => r.data),

  sendConnectionRequest: (userId: number) =>
    apiClient.post<Connection>(`/social/connect/${userId}/`).then((r) => r.data),

  respondToConnection: (pk: number, action: 'accept' | 'reject') =>
    apiClient.put<Connection>(`/social/connect/${pk}/respond/`, { action }).then((r) => r.data),

  getIcebreaker: (userId: number) =>
    apiClient.get<IcebreakerResponse>(`/social/icebreaker/${userId}/`).then((r) => r.data),
};
