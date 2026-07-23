import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ManagerRoute() {
  const user = useAuthStore(s => s.user)
  const allowed = ['ADMIN', 'PROJECT_MANAGER', 'MANAGER']
  return allowed.includes(user?.role)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />
}
