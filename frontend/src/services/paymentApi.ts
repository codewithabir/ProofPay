import { apiClient } from './api';
import { Payment } from '../types';

export interface OrderCreateResponse {
  order_id: string;
  status: string;
  approve_url?: string;
  milestone_id: string;
  amount: number;
  currency: string;
}

export const paymentApi = {
  createOrder: async (milestoneId: string): Promise<OrderCreateResponse> => {
    const res = await apiClient.post<OrderCreateResponse>(`/payments/${milestoneId}/create-order`);
    return res.data;
  },

  authorizePayment: async (milestoneId: string, orderId: string): Promise<Payment> => {
    const res = await apiClient.post<Payment>(`/payments/${milestoneId}/authorize`, {
      order_id: orderId,
    });
    return res.data;
  },

  capturePayment: async (paymentId: string, note?: string): Promise<Payment> => {
    const res = await apiClient.post<Payment>(`/payments/${paymentId}/capture`, { note });
    return res.data;
  },

  refundPayment: async (paymentId: string, reason: string, amount?: number): Promise<Payment> => {
    const res = await apiClient.post<Payment>(`/payments/${paymentId}/refund`, {
      reason,
      amount,
    });
    return res.data;
  },

  getHistory: async (): Promise<Payment[]> => {
    const res = await apiClient.get<Payment[]>('/payments/history');
    return res.data;
  },
};
