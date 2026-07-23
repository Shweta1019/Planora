import { useAuthStore } from './authStore'

// Role constants — match backend enum exactly
export const ROLES = {
  ADMIN:   'ADMIN',
  PM:      'PROJECT_MANAGER',
  EMPLOYEE:'EMPLOYEE',
}

// Hook: returns helper functions
export function useRole() {
  const user = useAuthStore(s => s.user)
  const role = user?.role ?? null

  const isAdmin   = role === ROLES.ADMIN
  const isPM      = role === ROLES.PM
  const isEmployee= role === ROLES.EMPLOYEE

  // true if role is in the allowedRoles array
  const hasRole   = (...allowed) => allowed.includes(role)

  // Admin or PM
  const isAdminOrPM = isAdmin || isPM

  return { role, isAdmin, isPM, isEmployee, isAdminOrPM, hasRole }
}
