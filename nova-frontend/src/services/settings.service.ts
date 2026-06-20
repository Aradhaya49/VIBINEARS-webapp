import apiClient from './api';

export const settingsService = {
  getProfile: () =>
    apiClient.get('/auth/settings/profile/'),

  updateProfile: (data: unknown) =>
    apiClient.put('/auth/settings/profile/', data),

  changePassword: (data: {
    old_password: string;
    new_password: string;
  }) =>
    apiClient.post(
      '/auth/settings/change-password/',
      data
    ),

  getMFA: () =>
    apiClient.get('/auth/settings/mfa/'),

  updateMFA: (enabled: boolean) =>
    apiClient.post('/auth/settings/mfa/', {
      enabled,
    }),

  getDevices: () =>
    apiClient.get('/auth/settings/devices/'),

  disableAccount: () =>
    apiClient.post('/auth/settings/disable/', {
      confirm: true,
    }),

  deleteAccount: (password: string) =>
    apiClient.post('/auth/settings/delete/', {
      password,
    }),
};

