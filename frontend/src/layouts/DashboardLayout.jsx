import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../api/notificationApi'
import { useAuthStore } from '../store/authStore'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuthStore()
  const userId = user?.userId || user?.id

  const { data: unread } = useQuery({
    queryKey:  ['notif-unread', userId],
    queryFn:   () => notificationApi.getUnread(userId).then(r => r.data?.data || r.data || []),
    refetchInterval: 60_000,
    staleTime:       30_000,
    enabled: !!userId,
  })

  const notifCount = unread?.length || 0

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        notifCount={notifCount}
      />
      <div className={`main-area${collapsed ? ' collapsed' : ''}`}>
        <Navbar
          onMenuToggle={() => setCollapsed(v => !v)}
          notifCount={notifCount}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
