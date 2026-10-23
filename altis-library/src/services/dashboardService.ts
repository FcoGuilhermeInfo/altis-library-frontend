
import { api } from '@/boot/axios'

import type {
  AdminDashboardResponse,
  UserDashboardResponse,
} from '@/types/dashboard'

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const response = await api.get<AdminDashboardResponse>(
      '/dashboard/admin',
    )

    return response.data
  },

  async getUserDashboard(): Promise<UserDashboardResponse> {
    const response = await api.get<UserDashboardResponse>(
      '/dashboard/user',
    )

    return response.data
  },
}
