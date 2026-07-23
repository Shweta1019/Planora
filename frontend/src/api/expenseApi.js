import api from './axiosConfig'

// Backend routes: /expenses/project/{projectId}, /expenses/project/{projectId}/summary
// No getAll — fetch per-project and merge on the frontend
export const expenseApi = {
  getByProject:  (projectId) => api.get(`/expenses/project/${projectId}`),
  getSummary:    (projectId) => api.get(`/expenses/project/${projectId}/summary`),
  getById:       (id)        => api.get(`/expenses/${id}`),
  create:        (data)      => api.post('/expenses', data),
  updateStatus:  (id, data)  => api.patch(`/expenses/${id}/status`, data),
  delete:        (id)        => api.delete(`/expenses/${id}`),
}
