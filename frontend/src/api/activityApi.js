import api from './axiosConfig'

export const activityApi = {
  getAll:  (params) => api.get('/activity-logs', { params }),
  getByUser: (userId) => api.get(`/activity-logs/user/${userId}`),
  getByProject: (projectId) => api.get(`/activity-logs/project/${projectId}`),
}
