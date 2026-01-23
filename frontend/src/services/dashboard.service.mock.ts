// Service mock pour le dashboard
import { mockDashboardStats, USE_MOCK_DATA } from '../data/mockData';
import { DashboardStats } from './dashboard.service';

export const dashboardServiceMock = {
  async getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    return {
      success: true,
      data: mockDashboardStats as any,
    };
  },
};
