import { apiClient } from './api';
import { Project, Milestone, MilestoneSubmission, User } from '../types';

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects');
    return res.data;
  },

  getProject: async (projectId: string): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${projectId}`);
    return res.data;
  },

  createProject: async (data: {
    title: string;
    description: string;
    budget: number;
    currency: string;
    freelancer_id?: string;
    requirements: Array<{
      title: string;
      description?: string;
      category: string;
      weight: number;
      is_mandatory: boolean;
    }>;
  }): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', data);
    return res.data;
  },

  getAvailableFreelancers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/projects/freelancers/available');
    return res.data;
  },

  assignFreelancer: async (projectId: string, freelancerId: string) => {
    const res = await apiClient.post(`/projects/${projectId}/assign`, null, {
      params: { freelancer_id: freelancerId },
    });
    return res.data;
  },

  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    const res = await apiClient.get<Milestone[]>(`/projects/${projectId}/milestones`);
    return res.data;
  },

  getMilestone: async (milestoneId: string): Promise<Milestone> => {
    const res = await apiClient.get<Milestone>(`/milestones/${milestoneId}`);
    return res.data;
  },

  createMilestone: async (projectId: string, data: {
    title: string;
    description: string;
    requirements_text?: string;
    payment_amount: number;
    currency: string;
    deadline?: string;
  }): Promise<Milestone> => {
    const res = await apiClient.post<Milestone>(`/projects/${projectId}/milestones`, data);
    return res.data;
  },

  submitDeliverable: async (milestoneId: string, formData: FormData): Promise<MilestoneSubmission> => {
    const res = await apiClient.post<MilestoneSubmission>(
      `/milestones/${milestoneId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  approveMilestone: async (milestoneId: string) => {
    const res = await apiClient.post(`/milestones/${milestoneId}/approve`);
    return res.data;
  },

  requestRevision: async (milestoneId: string, feedback: string) => {
    const formData = new FormData();
    formData.append('feedback', feedback);
    const res = await apiClient.post(`/milestones/${milestoneId}/request-revision`, formData);
    return res.data;
  },
};
