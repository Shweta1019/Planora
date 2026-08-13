import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  // baseURL: '/api',
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// attach JWT on every request
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// handle 401 — token expired or invalid
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } else if (err.response?.status === 403 && err.response?.data?.message === 'ACCOUNT_BLOCKED') {
      useAuthStore.getState().logout()
      window.location.href = '/blocked'
    }
    return Promise.reject(err)
  }
)

export default api
