import api from './axiosConfig'

// Backend routes: /tasks/project/{projectId}, /tasks/assigned/{userId}
// No getAll — we fetch per-project and merge on the frontend
export const taskApi = {
  // Get tasks for a specific project
  getByProject:  (projectId)     => api.get(`/tasks/project/${projectId}`),
  // Get tasks assigned to a specific user
  getByUser:     (userId)        => api.get(`/tasks/assigned/${userId}`),
  getById:       (id)            => api.get(`/tasks/${id}`),
  create:        (data)          => api.post('/tasks', data),
  update:        (id, data)      => api.put(`/tasks/${id}`, data),
  delete:        (id)            => api.delete(`/tasks/${id}`),
  updateStatus:  (id, status)    => api.patch(`/tasks/${id}/status`, { status }),
  getComments:   (taskId)        => api.get(`/tasks/${taskId}/comments`),
  addComment:    (taskId, data)  => api.post(`/tasks/${taskId}/comments`, data),
}
