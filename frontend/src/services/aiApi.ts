import { apiClient } from './api';
import { VerificationReport, Dispute, NotificationItem } from '../types';

export const aiApi = {
  verifyMilestone: async (milestoneId: string): Promise<VerificationReport> => {
    const res = await apiClient.post<VerificationReport>(`/milestones/${milestoneId}/verify`);
    return res.data;
  },

  getVerificationReport: async (milestoneId: string): Promise<VerificationReport> => {
    const res = await apiClient.get<VerificationReport>(`/milestones/${milestoneId}/report`);
    return res.data;
  },

  createDispute: async (milestoneId: string, clientReason: string): Promise<Dispute> => {
    const res = await apiClient.post<Dispute>('/disputes', {
      milestone_id: milestoneId,
      client_reason: clientReason,
    });
    return res.data;
  },

  getDispute: async (disputeId: string): Promise<Dispute> => {
    const res = await apiClient.get<Dispute>(`/disputes/${disputeId}`);
    return res.data;
  },

  listDisputes: async (): Promise<Dispute[]> => {
    const res = await apiClient.get<Dispute[]>('/disputes');
    return res.data;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  markNotificationRead: async (notificationId: string) => {
    const res = await apiClient.put(`/notifications/${notificationId}/read`);
    return res.data;
  },
};
