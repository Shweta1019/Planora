import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../../api/notificationApi'
import { useAuthStore } from '../../../store/authStore'
import {
  Calendar, FileText, MessageSquare, Bell, Users,
  CheckCheck, MoreVertical, CheckSquare
} from 'lucide-react'

// type → icon + color matching screenshot exactly
const TYPE_CONF = {
  TASK_ASSIGNED:   { Icon: Calendar,      bg: '#ede9fe', color: '#6d28d9' },
  TASK_REASSIGNED: { Icon: Calendar,      bg: '#ede9fe', color: '#6d28d9' },
  TASK_DUE:        { Icon: Calendar,      bg: '#ffedd5', color: '#ea580c' },
  PROJECT_UPDATED: { Icon: FileText,      bg: '#d1fae5', color: '#059669' },
  PROJECT_CREATED: { Icon: FileText,      bg: '#d1fae5', color: '#059669' },
  NEW_COMMENT:     { Icon: MessageSquare, bg: '#dbeafe', color: '#2563eb' },
  NEW_USER:        { Icon: Users,         bg: '#fef3c7', color: '#d97706' },
  SYSTEM:          { Icon: Bell,          bg: '#f3f4f6', color: '#6b7280' },
  DEFAULT:         { Icon: Bell,          bg: '#f3f4f6', color: '#6b7280' },
}

function getConf(type) {
  return TYPE_CONF[type] || TYPE_CONF.DEFAULT
}

function formatNotifDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return String(dateStr)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function NotificationPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.userId || user?.id

  const [tab, setTab]         = useState('all')
  const [page, setPage]       = useState(1)
  const [openMenu, setOpenMenu] = useState(null)
  const pageSize = 8

  // fetch all notifications for this user
  const { data: notifs = [], isLoading, isError } = useQuery({
    queryKey: ['notifications', userId],
    queryFn:  () => notificationApi.getAll(userId).then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 30_000,
    enabled: !!userId,
  })

  // mark all read mutation
  const markAllMut = useMutation({
    mutationFn: () => notificationApi.markAllRead(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  // mark single read mutation
  const markOneMut = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  const unreadCount = notifs.filter(n => !n.isRead).length
  const readCount   = notifs.filter(n => n.isRead).length

  // filter by tab
  const filtered = notifs.filter(n => {
    if (tab === 'unread') return !n.isRead
    if (tab === 'read')   return n.isRead
    return true
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tabs = [
    { key: 'all',    label: `All (${notifs.length})` },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'read',   label: `Read (${readCount})` },
  ]

  return (
    <div onClick={() => setOpenMenu(null)}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">Here are your recent notifications.</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); markAllMut.mutate() }}
          disabled={unreadCount === 0 || markAllMut.isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #e0d7ff',
            background: '#f5f3ff', color: '#6d28d9',
            fontSize: '0.85rem', fontWeight: 500,
            cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
            opacity: unreadCount === 0 ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <CheckCheck size={15} color="#6d28d9" />
          {markAllMut.isPending ? 'Marking…' : 'Mark all as read'}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {tabs.map(t => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1) }}
              style={{
                padding: '7px 18px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: active ? '#6d28d9' : 'transparent',
                color: active ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Notification list card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {isLoading ? (
          <div className="page-loader"><div className="spinner"/></div>
        ) : isError ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ marginBottom: 10 }}/>
            <div>Could not load notifications. Please try again.</div>
          </div>
        ) : paged.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={36} style={{ marginBottom: 12, opacity: 0.4 }}/>
            <div style={{ fontWeight: 500 }}>No notifications</div>
            <div style={{ fontSize: '0.82rem', marginTop: 4 }}>You're all caught up!</div>
          </div>
        ) : (
          paged.map((n, i) => {
            const id = n.notificationId || n.id
            const conf = getConf(n.type)
            const IconComp = conf.Icon
            const isMenuOpen = openMenu === id

            return (
              <div
                key={id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px',
                  borderBottom: i < paged.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: n.isRead ? '#fff' : '#fafbff',
                  position: 'relative',
                  transition: 'background 0.15s',
                }}
              >
                {/* Unread dot */}
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: n.isRead ? 'transparent' : '#6d28d9',
                  border: n.isRead ? '1.5px solid #e5e7eb' : 'none',
                  flexShrink: 0,
                }}/>

                {/* Square icon box */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: conf.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconComp size={20} color={conf.color} strokeWidth={1.8}/>
                </div>

                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: '0.9rem',
                    color: '#111827', marginBottom: 3,
                  }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#9ca3af' }}>
                    {formatNotifDate(n.createdAt)}
                  </div>
                </div>

                {/* "New" badge — only for unread */}
                {!n.isRead && (
                  <span
                    onClick={(e) => { e.stopPropagation(); markOneMut.mutate(id) }}
                    style={{
                      padding: '3px 12px', borderRadius: 20,
                      background: '#ede9fe', color: '#6d28d9',
                      fontSize: '0.75rem', fontWeight: 600,
                      flexShrink: 0, cursor: 'pointer',
                      border: '1px solid #ddd6fe',
                      userSelect: 'none',
                    }}
                    title="Click to mark as read"
                  >
                    New
                  </span>
                )}

                {/* Three-dot menu */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : id) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 4, color: '#9ca3af', borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <MoreVertical size={16}/>
                  </button>

                  {/* Dropdown */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute', right: 0, top: 32, zIndex: 50,
                        background: '#fff', borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        border: '1px solid #f0f0f0',
                        minWidth: 160, overflow: 'hidden',
                      }}
                    >
                      {!n.isRead && (
                        <button
                          onClick={() => { markOneMut.mutate(id); setOpenMenu(null) }}
                          style={{
                            width: '100%', padding: '9px 14px', textAlign: 'left',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.83rem', color: '#374151',
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}
                        >
                          <CheckSquare size={14} color="#6d28d9"/> Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => setOpenMenu(null)}
                        style={{
                          width: '100%', padding: '9px 14px', textAlign: 'left',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.83rem', color: '#374151',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="pagination">
            <span style={{ color: '#9ca3af', fontSize: '0.83rem' }}>
              Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} notifications
            </span>
            <div className="pag-controls">
              <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              {pages > 5 && <button className="pag-btn" disabled>…</button>}
              <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}

        {/* Footer for single page */}
        {total > 0 && total <= pageSize && (
          <div className="pagination">
            <span style={{ color: '#9ca3af', fontSize: '0.83rem' }}>
              Showing 1 to {total} of {total} notifications
            </span>
            <div className="pag-controls">
              <button className="pag-btn" disabled>‹</button>
              <button className="pag-btn active">1</button>
              <button className="pag-btn" disabled>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
