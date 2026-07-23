import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../../api/notificationApi'
import { useAuthStore } from '../../../store/authStore'
import {
  Bell, Mail, AlertCircle, CheckCircle2,
  FileText, Users, Wallet, MessageSquare, CheckCheck, Filter
} from 'lucide-react'
import { timeAgo } from '../../../utils/formatDate'

const TABS = [
  { key: 'all',      label: 'All'      },
  { key: 'unread',   label: 'Unread'   },
  { key: 'mentions', label: 'Mentions' },
  { key: 'tasks',    label: 'Tasks'    },
  { key: 'projects', label: 'Projects' },
  { key: 'system',   label: 'System'   },
]

// notification type → icon + color
const NOTIF_TYPES = {
  TASK_ASSIGNED:    { Icon: CheckCircle2,  color: '#6366f1', bg: '#ede9fe', label: 'Task Assigned'        },
  TASK_COMPLETED:   { Icon: CheckCircle2,  color: '#10b981', bg: '#d1fae5', label: 'Task Completed'       },
  PROJECT_DEADLINE: { Icon: AlertCircle,   color: '#f97316', bg: '#ffedd5', label: 'Project Deadline'     },
  FILE_UPLOADED:    { Icon: FileText,      color: '#3b82f6', bg: '#dbeafe', label: 'File Uploaded'        },
  RESOURCE_ALLOC:   { Icon: Users,         color: '#8b5cf6', bg: '#ede9fe', label: 'Resource Allocated'   },
  BUDGET_UPDATED:   { Icon: Wallet,        color: '#f59e0b', bg: '#fef3c7', label: 'Budget Updated'       },
  NEW_COMMENT:      { Icon: MessageSquare, color: '#06b6d4', bg: '#e0f2fe', label: 'New Comment'          },
  SYSTEM:           { Icon: Bell,          color: '#6366f1', bg: '#ede9fe', label: 'System Maintenance'   },
  DEFAULT:          { Icon: Bell,          color: '#9ca3af', bg: '#f3f4f6', label: 'Notification'         },
}

function getTypeConf(type) {
  return NOTIF_TYPES[type] || NOTIF_TYPES.DEFAULT
}

export default function NotificationPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.userId || user?.id
  const [tab, setTab]   = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn:  () => notificationApi.getAll(userId).then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 30_000,
    enabled: !!userId,
  })

  const markAllMut = useMutation({
    mutationFn: () => notificationApi.markAllRead(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notif-unread'] })
    },
  })

  const markOneMut = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notif-unread'] })
    },
  })

  const unreadCount = raw.filter(n => !n.isRead).length
  const thisWeek    = raw.filter(n => n.createdAt && (Date.now() - new Date(n.createdAt)) < 7 * 86400_000)
  const thisMonth   = raw.filter(n => n.createdAt && (Date.now() - new Date(n.createdAt)) < 30 * 86400_000)

  const filtered = raw.filter(n => {
    if (tab === 'unread')   return !n.isRead
    if (tab === 'tasks')    return n.type?.toLowerCase().includes('task')
    if (tab === 'projects') return n.type?.toLowerCase().includes('project')
    if (tab === 'system')   return n.type === 'SYSTEM'
    return true
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Inline stat boxes (like design — no big card, just horizontal row)
  const STAT_BOXES = [
    { Icon: Bell,          color: '#6366f1', bg: '#ede9fe', label: 'All Notifications', value: raw.length,         sub: 'All time'          },
    { Icon: Mail,          color: '#10b981', bg: '#d1fae5', label: 'Unread',             value: unreadCount,       sub: 'Requires attention'  },
    { Icon: AlertCircle,   color: '#3b82f6', bg: '#dbeafe', label: 'This Week',          value: thisWeek.length,   sub: `${thisWeek.filter(n=>!n.isRead).length} unread`  },
    { Icon: CheckCircle2,  color: '#d97706', bg: '#fef3c7', label: 'This Month',         value: thisMonth.length,  sub: `${thisMonth.filter(n=>!n.isRead).length} unread` },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">Stay updated with important alerts and updates.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => markAllMut.mutate()}
            disabled={unreadCount === 0 || markAllMut.isPending}
          >
            <CheckCheck size={14}/> Mark all as read
          </button>
          <button className="btn btn-outline btn-sm">
            <Filter size={14}/> Filter
          </button>
        </div>
      </div>

      {/* 4 inline stat boxes — matches design exactly */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {STAT_BOXES.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.Icon size={22} color={s.color} strokeWidth={1.8}/>
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => { setTab(t.key); setPage(1) }}
          >
            {t.label}
            {t.key === 'unread' && unreadCount > 0 && (
              <span style={{ marginLeft: 6, background: '#6366f1', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading
          ? <div className="page-loader"><div className="spinner"/></div>
          : paged.length === 0
          ? (
            <div className="empty-state" style={{ padding: 60 }}>
              <Bell size={40} color="var(--text-muted)"/>
              <h4 style={{ marginTop: 12 }}>No notifications</h4>
              <p>You're all caught up!</p>
            </div>
          )
          : paged.map((n, i) => {
              const id   = n.notificationId || n.id
              const conf = getTypeConf(n.type)
              const IconComp = conf.Icon
              return (
                <div
                  key={id}
                  onClick={() => !n.isRead && markOneMut.mutate(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < paged.length - 1 ? '1px solid var(--border-light)' : 'none',
                    background: n.isRead ? 'transparent' : '#fafbff',
                    cursor: n.isRead ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Icon circle */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: conf.bg, color: conf.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconComp size={18} strokeWidth={1.8}/>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.875rem', marginBottom: 2 }}>
                      {n.title || conf.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message || n.description || 'No details'}
                    </div>
                  </div>

                  {/* Time + read dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {timeAgo(n.createdAt)}
                    </span>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: n.isRead ? 'var(--border)' : '#6366f1',
                      flexShrink: 0,
                    }}/>
                  </div>
                </div>
              )
            })
        }

        {/* Pagination */}
        {total > 0 && (
          <div className="pagination">
            <span>Showing {Math.min((page-1)*pageSize+1, total)}–{Math.min(page*pageSize, total)} of {total} notifications</span>
            <div className="pag-controls">
              <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
              {Array.from({ length: Math.min(pages, 4) }, (_, i) => i+1).map(n => (
                <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              {pages > 4 && <button className="pag-btn">…</button>}
              <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p+1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
