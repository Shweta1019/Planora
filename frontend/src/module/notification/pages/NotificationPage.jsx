import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../../api/notificationApi'
import { useAuthStore } from '../../../store/authStore'
import { filterNotificationsByPrefs } from '../../../utils/notificationFilter'
import {
  Calendar, FileText, MessageSquare, Bell, Users,
  CheckCheck, MoreVertical, CheckSquare, X, Trash2, Square, ChevronDown, Wallet
} from 'lucide-react'

// type → icon + color matching screenshot exactly
const TYPE_CONF = {
  TASK_ASSIGNED:   { Icon: Calendar,      bg: '#ede9fe', color: '#6d28d9' },
  TASK_REASSIGNED: { Icon: Calendar,      bg: '#ede9fe', color: '#6d28d9' },
  TASK_DUE:        { Icon: Calendar,      bg: '#ffedd5', color: '#ea580c' },
  PROJECT_UPDATED: { Icon: FileText,      bg: '#d1fae5', color: '#059669' },
  PROJECT_CREATED: { Icon: FileText,      bg: '#d1fae5', color: '#059669' },
  BUDGET_OVERRUN:  { Icon: Wallet,        bg: '#fee2e2', color: '#dc2626' },
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
  }).toUpperCase()
}

export default function NotificationPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.userId || user?.id

  const [tab, setTab]         = useState('all')
  const [page, setPage]       = useState(1)
  const [openMenu, setOpenMenu] = useState(null)
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  // Track locally deleted notifications to satisfy frontend functionality without DB dependency
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('local_deleted_notifs') || '[]'))
    } catch {
      return new Set()
    }
  })

  // Persist locally deleted IDs
  useEffect(() => {
    localStorage.setItem('local_deleted_notifs', JSON.stringify(Array.from(deletedIds)))
  }, [deletedIds])

  const pageSize = 8

  // fetch all notifications for this user
  const { data: notifs = [], isLoading, isError } = useQuery({
    queryKey: ['notifications', userId],
    queryFn:  () => notificationApi.getAll(userId).then(r => {
      const d = r.data?.data || r.data
      const rawNotifs = Array.isArray(d) ? d : d?.content || []
      return filterNotificationsByPrefs(rawNotifs, userId)
    }),
    refetchInterval: 3_000,
    staleTime: 1_000,
    enabled: !!userId,
  })

  // Listen to preference changes and re-filter locally or re-fetch
  useEffect(() => {
    function handlePrefsUpdate() {
      if (userId) {
        qc.invalidateQueries({ queryKey: ['notifications', userId] })
      }
    }
    window.addEventListener('planora_notif_prefs_updated', handlePrefsUpdate)
    return () => window.removeEventListener('planora_notif_prefs_updated', handlePrefsUpdate)
  }, [userId, qc])

  // mark all read mutation
  const markAllMut = useMutation({
    mutationFn: () => notificationApi.markAllRead(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  // delete all notifications mutation
  const deleteAllMut = useMutation({
    mutationFn: () => notificationApi.deleteAll(userId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['notifications', userId] })
      await qc.cancelQueries({ queryKey: ['notif-unread', userId] })
      const prev = qc.getQueryData(['notifications', userId])
      // Optimistically clear the list immediately
      qc.setQueryData(['notifications', userId], [])
      qc.setQueryData(['notif-unread', userId], [])
      setSelectedIds(new Set())
      setDeletedIds(new Set())
      return { prev }
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(['notifications', userId], context?.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  const deleteMultipleMut = useMutation({
    mutationFn: (ids) => notificationApi.deleteMultiple(ids.map(Number)),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: ['notifications', userId] })
      await qc.cancelQueries({ queryKey: ['notif-unread', userId] })
      const idSet = new Set(ids.map(String))
      const prev = qc.getQueryData(['notifications', userId])
      const prevUnread = qc.getQueryData(['notif-unread', userId])
      // Optimistically remove selected notifications from cache immediately
      qc.setQueryData(['notifications', userId], (old) =>
        Array.isArray(old) ? old.filter(n => !idSet.has(String(n.notificationId || n.id))) : old
      )
      qc.setQueryData(['notif-unread', userId], (old) =>
        Array.isArray(old) ? old.filter(n => !idSet.has(String(n.notificationId || n.id))) : old
      )
      setSelectedIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(String(id)))
        return next
      })
      setDeletedIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.add(String(id)))
        return next
      })
      return { prev, prevUnread }
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(['notifications', userId], context?.prev)
      qc.setQueryData(['notif-unread', userId], context?.prevUnread)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  // delete single notification mutation
  const deleteOneMut = useMutation({
    mutationFn: async (id) => {
      // Add to locally deleted set instantly
      setDeletedIds(prev => new Set(prev).add(String(id)))
      try {
        const res = await notificationApi.delete(id)
        return res
      } catch (err) {
        // Rollback on failure so it doesn't stay hidden forever
        setDeletedIds(prev => {
          const next = new Set(prev)
          next.delete(String(id))
          return next
        })
        throw err
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications', userId] })
      await qc.cancelQueries({ queryKey: ['notif-unread', userId] })

      const previousNotifs = qc.getQueryData(['notifications', userId])
      const previousUnread = qc.getQueryData(['notif-unread', userId])

      qc.setQueryData(['notifications', userId], (old) => {
        if (!old) return old
        return old.filter(n => String(n.notificationId || n.id) !== String(id))
      })
      qc.setQueryData(['notif-unread', userId], (old) => {
        if (!Array.isArray(old)) return old
        return old.filter(n => String(n.notificationId || n.id) !== String(id))
      })
      
      return { previousNotifs, previousUnread }
    },
    onError: (err, id, context) => {
      qc.setQueryData(['notifications', userId], context.previousNotifs)
      qc.setQueryData(['notif-unread', userId], context.previousUnread)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  // mark single read mutation
  const markOneMut = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications', userId] })
      await qc.cancelQueries({ queryKey: ['notif-unread', userId] })

      const previousNotifs = qc.getQueryData(['notifications', userId])
      const previousUnread = qc.getQueryData(['notif-unread', userId])

      qc.setQueryData(['notifications', userId], (old) => {
        if (!old) return old
        return old.map(n => {
          const nId = n.notificationId || n.id
          if (String(nId) === String(id)) return { ...n, read: true }
          return n
        })
      })
      qc.setQueryData(['notif-unread', userId], (old) => {
        if (!Array.isArray(old)) return old
        return old.filter(n => String(n.notificationId || n.id) !== String(id))
      })

      return { previousNotifs, previousUnread }
    },
    onError: (err, id, context) => {
      qc.setQueryData(['notifications', userId], context.previousNotifs)
      qc.setQueryData(['notif-unread', userId], context.previousUnread)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-unread', userId] })
    },
  })

  function handleNotifClick(n) {
    setSelectedNotif(n)
    const id = n.notificationId || n.id
    if (!n.read) {
      markOneMut.mutate(id)
    }
  }

  // apply local deletions before counting
  const visibleNotifs = notifs.filter(n => !deletedIds.has(String(n.notificationId || n.id)))

  const unreadCount = visibleNotifs.filter(n => !n.read).length
  const readCount   = visibleNotifs.filter(n => n.read).length

  // filter by tab
  const filtered = visibleNotifs.filter(n => {
    if (tab === 'unread') return !n.read
    if (tab === 'read')   return n.read
    return true
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  
  useEffect(() => {
    if (page > pages) {
      setPage(pages)
    }
  }, [page, pages])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tabs = [
    { key: 'all',    label: `All (${visibleNotifs.length})` },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'read',   label: `Read (${readCount})` },
  ]

  const handleDeleteAllInTab = () => {
    const tabNotifIds = filtered.map(n => n.notificationId || n.id).filter(Boolean)
    if (tabNotifIds.length === 0) return

    if (tab === 'all') {
      deleteAllMut.mutate()
    } else {
      deleteMultipleMut.mutate(tabNotifIds)
    }
    setOpenMenu(null)
  }

  return (
    <div onClick={() => setOpenMenu(null)}>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Notifications</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'header' ? null : 'header') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151',
              fontSize: '0.85rem', fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Actions <ChevronDown size={15} />
          </button>
          
          {openMenu === 'header' && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', right: 0, top: 40, zIndex: 50,
                background: '#fff', borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '1px solid #f0f0f0',
                minWidth: 180, overflow: 'hidden',
                padding: '4px 0',
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); markAllMut.mutate(); setOpenMenu(null) }}
                disabled={unreadCount === 0 || markAllMut.isPending}
                style={{
                  width: '100%', padding: '10px 16px', textAlign: 'left',
                  background: 'none', border: 'none',
                  cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem', color: '#374151',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: unreadCount === 0 ? 0.5 : 1,
                }}
              >
                <CheckCheck size={14} color="#6d28d9" /> Mark all as read
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMultipleMut.mutate(Array.from(selectedIds)); setOpenMenu(null) }}
                  disabled={deleteMultipleMut.isPending}
                  style={{
                    width: '100%', padding: '10px 16px', textAlign: 'left',
                    background: 'none', border: 'none',
                    cursor: deleteMultipleMut.isPending ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem', color: '#dc2626',
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: deleteMultipleMut.isPending ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} color="#dc2626" /> Delete Selected ({selectedIds.size})
                </button>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteAllInTab() }}
                disabled={filtered.length === 0 || deleteAllMut.isPending || deleteMultipleMut.isPending}
                style={{
                  width: '100%', padding: '10px 16px', textAlign: 'left',
                  background: 'none', border: 'none',
                  cursor: (filtered.length === 0 || deleteAllMut.isPending || deleteMultipleMut.isPending) ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem', color: '#dc2626',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: (filtered.length === 0 || deleteAllMut.isPending || deleteMultipleMut.isPending) ? 0.5 : 1,
                }}
              >
                <Trash2 size={14} color="#dc2626" /> Delete all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {tabs.map(t => {
          const active = tab === t.key
          return (
            <div
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1) }}
              style={{
                paddingBottom: 10,
                color: active ? 'var(--purple)' : 'var(--text-secondary)',
                borderBottom: active ? '2px solid var(--purple)' : '2px solid transparent',
                fontWeight: active ? 600 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </div>
          )
        })}
      </div>

      {/* Notification list card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {isLoading && paged.length === 0 ? (
          <div className="page-loader"><div className="spinner"/></div>
        ) : isError && paged.length === 0 ? (
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
                onClick={() => handleNotifClick(n)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px',
                  borderBottom: i < paged.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: '#fff',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(String(id))}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedIds(prev => {
                      const next = new Set(prev)
                      if (e.target.checked) next.add(String(id))
                      else next.delete(String(id))
                      return next
                    })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 16, height: 16, cursor: 'pointer', marginRight: 4, flexShrink: 0, accentColor: '#6d28d9' }}
                />
                {/* Unread dot */}
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: n.read ? 'transparent' : '#6d28d9',
                  border: n.read ? '1.5px solid #e5e7eb' : 'none',
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
                {!n.read && (
                  <span
                    onClick={(e) => { e.stopPropagation(); markOneMut.mutate(id) }}
                    style={{
                      padding: '3px 12px', borderRadius: 20,
                      background: '#ede9fe', color: '#6d28d9',
                      fontSize: '0.75rem', fontWeight: 600,
                      flexShrink: 0, cursor: 'pointer',
                      border: 'none',
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
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markOneMut.mutate(id); setOpenMenu(null) }}
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
                        onClick={(e) => { e.stopPropagation(); deleteOneMut.mutate(id); setOpenMenu(null) }}
                        style={{
                          width: '100%', padding: '9px 14px', textAlign: 'left',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.83rem', color: '#dc2626',
                        }}
                      >
                        Delete
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

      {/* Notification Details Modal */}
      {selectedNotif && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedNotif(null)}>
          <div className="modal" style={{ width: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Notification Details</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedNotif(null)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                {(() => {
                  const conf = getConf(selectedNotif.type);
                  const IconComp = conf.Icon;
                  return (
                    <div style={{
                      width: 52, height: 52, borderRadius: 12,
                      background: conf.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <IconComp size={24} color={conf.color} strokeWidth={1.8}/>
                    </div>
                  );
                })()}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>{selectedNotif.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatNotifDate(selectedNotif.createdAt)}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-input)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6
              }}>
                {selectedNotif.message}
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setSelectedNotif(null)} style={{ marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
