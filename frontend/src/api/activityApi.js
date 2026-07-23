import api from './axiosConfig'

export const activityApi = {
  getAll:  (params) => api.get('/activity-logs', { params }),
  getByProject: (projectId) => api.get(`/activity-logs/project/${projectId}`),
}
