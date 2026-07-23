import api from './axiosConfig'

// Backend: /documents/project/{projectId}, /documents/task/{taskId}
export const documentApi = {
  getByProject:  (projectId)  => api.get(`/documents/project/${projectId}`),
  getByTask:     (taskId)     => api.get(`/documents/task/${taskId}`),
  upload:        (formData)   => api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        (id)         => api.delete(`/documents/${id}`),
}
