import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRole, ROLES } from '../store/useRole'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Wallet, FileText, BarChart2, Bell, Activity,
  Settings, ChevronLeft, ChevronRight, LogOut, Boxes
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
    label: 'Projects',
    roles: [ROLES.ADMIN, ROLES.PM],
  },
  {
    to: '/tasks',
    icon: CheckSquare,
    label: 'Tasks',
    roles: [ROLES.ADMIN, ROLES.PM, ROLES.EMPLOYEE],
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
    label: 'Users',
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
  [ROLES.ADMIN]:    { label: 'Admin',           bg: '#ede9fe', color: '#7c3aed' },
  [ROLES.PM]:       { label: 'Project Manager', bg: '#dbeafe', color: '#2563eb' },
  [ROLES.EMPLOYEE]: { label: 'Employee',         bg: '#d1fae5', color: '#059669' },
}

export default function Sidebar({ collapsed, onToggle, notifCount = 0 }) {
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()
  const { role }         = useRole()

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

      {/* Role badge — only when expanded */}
      {!collapsed && role && (
        <div style={{ padding: '0 14px 10px' }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: '0.7rem',
            fontWeight: 700,
            background: badge.bg,
            color: badge.color,
            letterSpacing: 0.3,
          }}>
            {badge.label}
          </span>
        </div>
      )}

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

      {/* Collapse toggle */}
      <button className="sidebar-collapse-btn" onClick={onToggle} title="Toggle sidebar">
        {collapsed
          ? <ChevronRight size={16} />
          : <><ChevronLeft size={16} /><span>Collapse</span></>
        }
      </button>

      {/* User at bottom */}
      {!collapsed && user && (
        <div className="sidebar-user">
          <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
            {user.fullName?.[0] || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-role" style={{ color: badge.color, fontWeight: 600 }}>
              {badge.label}
            </div>
          </div>
          <button className="sidebar-user-logout" onClick={handleLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  )
}
