import { Navigate, Outlet } from 'react-router-dom'
import { useRole } from '../store/useRole'

/**
 * RoleGuard — wrap routes that require specific roles
 * Usage: <RoleGuard allowed={['ADMIN', 'PROJECT_MANAGER']} />
 * If role not allowed → redirects to /dashboard
 */
export default function RoleGuard({ allowed = [] }) {
  const { role } = useRole()
  if (allowed.includes(role)) return <Outlet />
  return <Navigate to="/dashboard" replace />
}
