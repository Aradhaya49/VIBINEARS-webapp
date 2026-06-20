import apiClient from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User, EmergencyContact } from '@/types';

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login/', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register/', payload).then((r) => r.data),

  logout: (refresh: string) =>
    apiClient.post('/auth/logout/', { refresh }),

  getProfile: () =>
    apiClient.get<User>('/auth/profile/').then((r) => r.data),

  updateProfile: (data: Partial<User> | FormData) =>
    apiClient.patch<User>('/auth/profile/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then((r) => r.data),

  getEmergencyContacts: () =>
    apiClient.get<EmergencyContact[]>('/auth/emergency-contacts/').then((r) => r.data),

  createEmergencyContact: (data: Omit<EmergencyContact, 'id' | 'created_at'>) =>
    apiClient.post<EmergencyContact>('/auth/emergency-contacts/', data).then((r) => r.data),

  deleteEmergencyContact: (id: number) =>
    apiClient.delete(`/auth/emergency-contacts/${id}/`),
};
