import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  // Do NOT set withCredentials — the backend uses JWT in headers, not cookies.
  // withCredentials causes CORS preflight failures on unauthenticated endpoints.
});

// ─── Token helpers ───────────────────────────────────────────────────────────

export const getAccessToken = () => localStorage.getItem('nova_access_token');
export const getRefreshToken = () => localStorage.getItem('nova_refresh_token');
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('nova_access_token', access);
  localStorage.setItem('nova_refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('nova_access_token');
  localStorage.removeItem('nova_refresh_token');
};

// ─── Request interceptor — attach Bearer token ───────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — auto-refresh on 401 ──────────────────────────────

// These endpoints don't use auth tokens — never try to refresh for them
const AUTH_ENDPOINTS = ['/auth/login/', '/auth/register/', '/auth/refresh/'];

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for auth endpoints or non-401 errors
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) =>
      originalRequest?.url?.includes(ep)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh });
        const newAccess = data.access;
        setTokens(newAccess, refresh);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
