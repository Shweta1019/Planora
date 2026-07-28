import api from './axiosConfig'

export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  getMe:          ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  resetPassword:  (data) => api.put('/auth/reset-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  updateProfile:  (data) => api.put('/auth/profile', data),
}
