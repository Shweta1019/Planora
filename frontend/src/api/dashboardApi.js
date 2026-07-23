import api from './axiosConfig'

// Backend: GET /dashboard/stats (Admin/PM only)
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}
