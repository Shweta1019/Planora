import api from './axiosConfig'

export const resourceApi = {
  getAll:    (params)   => api.get('/resources', { params }),
  allocate:  (data)     => api.post('/resources', data),
  update:    (id, data) => api.put(`/resources/${id}`, data),
  delete:    (id)       => api.delete(`/resources/${id}`),
  getByUser: (userId)   => api.get(`/resources/user/${userId}`),
}
