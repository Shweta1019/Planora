import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Search, Bell, ChevronDown, LogOut, Settings, Menu } from 'lucide-react'
import { initials } from '../utils/formatDate'

// maps route paths to page titles
const routeTitles = {
  '/dashboard':     'Dashboard',
  '/projects':      'Projects',
  '/tasks':         'Tasks',
  '/resources':     'Resources',
  '/users':         'Users',
  '/budgets':       'Budgets',
  '/files':         'Files',
  '/reports':       'Reports',
  '/notifications': 'Notifications',
  '/activity':      'Activity Log',
  '/settings':      'Settings',
}

export default function Navbar({ onMenuToggle, notifCount = 0 }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user, logout } = useAuthStore()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const pageTitle = Object.entries(routeTitles).find(([k]) =>
    location.pathname.startsWith(k)
  )?.[1] || ''

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="navbar-search">
          <Search size={15} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search anything..."
            className="navbar-search-input"
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification bell */}
        <button
          className="navbar-icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span className="navbar-notif-count">{notifCount}</span>
          )}
        </button>

        {/* User dropdown */}
        <div className="navbar-user-wrap" ref={dropRef}>
          <button
            className="navbar-user-btn"
            onClick={() => setDropOpen(v => !v)}
          >
            <div className="avatar avatar-sm">
              {initials(user?.fullName)}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.fullName || 'User'}</span>
              <span className="navbar-user-role">{user?.role}</span>
            </div>
            <ChevronDown
              size={14}
              style={{ transform: dropOpen ? 'rotate(180deg)' : '', transition: '0.15s ease' }}
            />
          </button>

          {dropOpen && (
            <div className="navbar-dropdown animate-slideUp">
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setDropOpen(false) }}>
                <Settings size={15} /> Profile & Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
