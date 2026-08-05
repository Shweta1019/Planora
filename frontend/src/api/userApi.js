import api from './axiosConfig'

export const userApi = {
  getAll:    (params)   => api.get('/users', { params }),
  getById:   (id)       => api.get(`/users/${id}`),
  create:    (data)     => api.post('/users', data),
  update:    (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
  delete:    (id)       => api.delete(`/users/${id}`),
  getSummary:()         => api.get('/users/summary'),
  getManagerStats:()    => api.get('/users/manager-stats'),
  updateProfile: (data) => api.put('/users/profile', data),
}
