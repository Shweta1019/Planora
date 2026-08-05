import { useState, Suspense, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../api/notificationApi'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { Ban, LogOut } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { filterNotificationsByPrefs } from '../utils/notificationFilter'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const userId = user?.userId || user?.id

  const { data: profile } = useQuery({
    queryKey: ['my-profile', userId],
    queryFn: () => authApi.getMe().then(r => r.data?.data || r.data),
    staleTime: 60_000,
    refetchInterval: 30_000,
    enabled: !!userId
  })

  const { data: unread } = useQuery({
    queryKey:  ['notif-unread', userId],
    queryFn:   () => notificationApi.getUnread(userId).then(r => {
      const d = r.data?.data || r.data || []
      return filterNotificationsByPrefs(Array.isArray(d) ? d : [], userId)
    }),
    refetchInterval: 3_000,
    staleTime:       1_000,
    enabled: !!userId,
  })

  // Listen to preference changes and re-filter locally or re-fetch
  useEffect(() => {
    function handlePrefsUpdate() {
      if (userId) {
        qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
      }
    }
    window.addEventListener('planora_notif_prefs_updated', handlePrefsUpdate)
    return () => window.removeEventListener('planora_notif_prefs_updated', handlePrefsUpdate)
  }, [userId, qc])

  const currentUser = profile || user
  const isBlocked = currentUser?.status === 'INACTIVE' || currentUser?.status === 'BLOCKED'
  const notifCount = unread?.length || 0

  useEffect(() => {
    if (isBlocked) {
      navigate('/blocked', { replace: true })
    }
  }, [isBlocked, navigate])

  if (isBlocked) {
    return null
  }

  return (
    <div className={`app-shell ${isBlocked ? 'blocked-user-mode' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        notifCount={notifCount}
      />
      <div className={`main-area${collapsed ? ' collapsed' : ''}`}>
        <Navbar
          collapsed={collapsed}
          onMenuToggle={() => setCollapsed(v => !v)}
          notifCount={notifCount}
        />
        <main className="page-content">
          <Suspense fallback={<div className="page-loader"><div className="spinner"/></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
