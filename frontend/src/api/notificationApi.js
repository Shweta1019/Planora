import api from './axiosConfig'

// Notification API — backend routes are user-scoped: /notifications/user/{userId}
// Pass userId explicitly from the auth store
export const notificationApi = {
  getAll:        (userId)  => api.get(`/notifications/user/${userId}`),
  getUnread:     (userId)  => api.get(`/notifications/user/${userId}/unread`),
  countUnread:   (userId)  => api.get(`/notifications/user/${userId}/count`),
  markRead:      (id)      => api.patch(`/notifications/${id}/read`),
  markAllRead:   (userId)  => api.patch(`/notifications/user/${userId}/read-all`),
  delete:        (id)      => api.delete(`/notifications/${id}`),
  deleteAll:     (userId)  => api.delete(`/notifications/user/${userId}/all`),
  deleteMultiple:(ids)     => api.delete(`/notifications/bulk`, { data: ids }),
}
