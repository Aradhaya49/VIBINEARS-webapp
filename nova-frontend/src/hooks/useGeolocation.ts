import { useState, useEffect, useCallback } from 'react';
import { socialService } from '@/services/social.service';

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(autoUpdate = false) {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setState({ latitude, longitude, error: null, loading: false });
        try {
          await socialService.updateLocation(latitude, longitude);
        } catch {
          // non-critical
        }
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (autoUpdate) {
      updateLocation();
      const interval = setInterval(updateLocation, 60000); // update every minute
      return () => clearInterval(interval);
    }
  }, [autoUpdate, updateLocation]);

  return { ...state, updateLocation };
}
