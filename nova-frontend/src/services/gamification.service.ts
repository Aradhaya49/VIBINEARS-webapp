import apiClient from './api';
import type { GamificationStats, Order, OrderItem } from '@/types';

export const gamificationService = {
  getStats: () =>
    apiClient.get<GamificationStats>('/gamification/stats/').then((r) => r.data),

  placeOrder: (payload: { venue_id: string; items: OrderItem[]; total_amount: string }) =>
    apiClient.post<Order>('/gamification/order/', payload).then((r) => r.data),

  getOrders: () =>
    apiClient.get<Order[]>('/gamification/orders/').then((r) => r.data),
};
