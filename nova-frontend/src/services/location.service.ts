import apiClient from './api';
import type { GeoNote } from '@/types';

export const locationService = {
  getNearbyGeoNotes: (lat: number, lng: number, radius = 200) =>
    apiClient
      .get<GeoNote[]>('/location/voice-notes/nearby/', { params: { lat, lng, radius } })
      .then((r) => r.data),

  createGeoNote: (payload: {
    latitude: number;
    longitude: number;
    audio_url?: string;
    transcript?: string;
    radius_meters?: number;
    expires_at?: string;
  }) => apiClient.post<GeoNote>('/location/voice-notes/', payload).then((r) => r.data),
};
