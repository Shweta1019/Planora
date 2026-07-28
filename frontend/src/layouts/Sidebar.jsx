import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRole, ROLES } from '../store/useRole'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Wallet, FileText, BarChart2, Bell, Activity,
  Settings, ChevronsLeft, ChevronsRight, LogOut, Boxes, UserPlus
} from 'lucide-react'

export default function Sidebar({ collapsed, onToggle, notifCount = 0 }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { role } = useRole()

  // Role badge colours
  const ROLE_BADGE = {
    [ROLES.ADMIN]: { label: 'Admin', bg: '#ede9fe', color: '#7c3aed' },
    [ROLES.PM]: { label: 'Project Manager', bg: '#dbeafe', color: '#2563eb' },
    [ROLES.EMPLOYEE]: { label: 'Employee', bg: '#d1fae5', color: '#059669' },
  }

  function getNavItems(currentRole) {
    if (currentRole === ROLES.ADMIN) {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/projects', icon: FolderKanban, label: 'Projects' },
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/resources', icon: Boxes, label: 'Resources' },
        { to: '/budgets', icon: Wallet, label: 'Budgets' },
        { to: '/reports', icon: BarChart2, label: 'Reports' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
      ]
    } else if (currentRole === ROLES.PM) {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/projects', icon: FolderKanban, label: 'Projects' },
        { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
        { to: '/users', icon: Users, label: 'Team Members' },
        { to: '/resources', icon: Boxes, label: 'Resources' },
        { to: '/budgets', icon: Wallet, label: 'Budgets' },
        { to: '/reports', icon: BarChart2, label: 'Reports' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
      ]
    } else {
      // EMPLOYEE or fallback
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
        { to: '/projects', icon: FolderKanban, label: 'My Projects' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
      ]
    }
  }

  const navItems = getNavItems(role)

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
        <div className="sidebar-logo-icon">P</div>
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

      {/* Footer: collapse */}
      <div className="sidebar-footer" style={{ justifyContent: 'center', padding: '16px 0' }}>
        <button className="sidebar-footer-collapse" onClick={onToggle} title="Toggle sidebar" style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          {collapsed ? <ChevronsRight size={22} strokeWidth={2.5} color="white" /> : <ChevronsLeft size={22} strokeWidth={2.5} color="white" />}
        </button>
      </div>
    </aside>
  )
}
