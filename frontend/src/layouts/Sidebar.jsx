import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRole, ROLES } from '../store/useRole'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Wallet, FileText, BarChart2, Bell, Activity,
  Settings, ChevronLeft, ChevronRight, LogOut, Boxes, UserPlus
} from 'lucide-react'

// All nav items with their allowed roles (empty = all roles)
const ALL_NAV = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    roles: [ROLES.ADMIN, ROLES.PM, ROLES.EMPLOYEE],
  },
  {
    to: '/projects',
    icon: FolderKanban,
    label: 'My Projects',
    roles: [ROLES.ADMIN, ROLES.PM],
  },
  {
    to: '/tasks',
    icon: CheckSquare,
    label: 'Tasks',
    roles: [ROLES.PM, ROLES.EMPLOYEE],   // Hidden from ADMIN
  },
  {
    to: '/resources',
    icon: Boxes,
    label: 'Resources',
    roles: [ROLES.ADMIN, ROLES.PM],
  },
  {
    to: '/users',
    icon: Users,
    label: 'Team Members',
    roles: [ROLES.ADMIN],                          // Admin only
  },
  {
    to: '/signup',
    icon: UserPlus,
    label: 'Create Account',
    roles: [ROLES.ADMIN],                          // Admin only
  },
  {
    to: '/budgets',
    icon: Wallet,
    label: 'Budgets',
    roles: [ROLES.ADMIN, ROLES.PM],
  },
  {
    to: '/files',
    icon: FileText,
    label: 'Files',
    roles: [ROLES.ADMIN, ROLES.PM, ROLES.EMPLOYEE],
  },
  {
    to: '/reports',
    icon: BarChart2,
    label: 'Reports',
    roles: [ROLES.ADMIN, ROLES.PM],
  },
  {
    to: '/notifications',
    icon: Bell,
    label: 'Notifications',
    roles: [ROLES.ADMIN, ROLES.PM, ROLES.EMPLOYEE],
  },
  {
    to: '/activity',
    icon: Activity,
    label: 'Activity Log',
    roles: [ROLES.ADMIN],                          // Admin only
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Settings',
    roles: [ROLES.ADMIN, ROLES.PM, ROLES.EMPLOYEE],
  },
]

// Role badge colours
const ROLE_BADGE = {
  [ROLES.ADMIN]: { label: 'Admin', bg: '#ede9fe', color: '#7c3aed' },
  [ROLES.PM]: { label: 'Project Manager', bg: '#dbeafe', color: '#2563eb' },
  [ROLES.EMPLOYEE]: { label: 'Employee', bg: '#d1fae5', color: '#059669' },
}

export default function Sidebar({ collapsed, onToggle, notifCount = 0 }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { role } = useRole()

  // Filter nav items by role
  const navItems = ALL_NAV.filter(item => item.roles.includes(role))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const badge = ROLE_BADGE[role] ?? { label: role, bg: '#f3f4f6', color: '#6b7280' }

  return (
    <aside
      className="sidebar"
      style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img src="/logo.svg" alt="Planora" width={22} height={22}
            onError={e => { e.target.style.display = 'none' }}
          />
          <span style={{ display: 'none' }}>P</span>
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-brand">Planora</div>
            <div className="sidebar-brand-sub">Project Management System</div>
          </div>
        )}
      </div>



      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
            title={collapsed ? label : undefined}
          >
            <div className="sidebar-link-icon">
              <Icon size={18} strokeWidth={1.8} />
              {label === 'Notifications' && notifCount > 0 && (
                <span className="sidebar-notif-badge">{notifCount}</span>
              )}
            </div>
            {!collapsed && <span className="sidebar-link-text">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer: copyright + collapse */}
      <div className="sidebar-footer">
        {!collapsed && <span className="sidebar-footer-copy">© 2024 Planora</span>}
        <button className="sidebar-footer-collapse" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
