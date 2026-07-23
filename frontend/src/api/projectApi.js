import api from './axiosConfig'

export const projectApi = {
  getAll:    (params)        => api.get('/projects', { params }),
  getById:   (id)            => api.get(`/projects/${id}`),
  create:    (data)          => api.post('/projects', data),
  update:    (id, data)      => api.put(`/projects/${id}`, data),
  delete:    (id)            => api.delete(`/projects/${id}`),
  getMembers:(id)            => api.get(`/projects/${id}/members`),
  addMember: (id, data)      => api.post(`/projects/${id}/members`, data),
  removeMember:(id, userId)  => api.delete(`/projects/${id}/members/${userId}`),
  updateStatus:(id, status)  => api.patch(`/projects/${id}/status`, { status }),
}
