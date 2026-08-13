import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { useRole } from '../../../store/useRole'
import { taskApi }    from '../../../api/taskApi'
import { projectApi } from '../../../api/projectApi'
import { userApi }    from '../../../api/userApi'
import { Plus, RotateCcw, Eye, MoreHorizontal, MoreVertical, Pencil, Trash2, Calendar } from 'lucide-react'
import {
  formatDate, statusBadgeClass, statusLabel, priorityBadgeClass, progressColor
} from '../../../utils/formatDate'
import TaskFormModal from '../components/TaskForm'
import TaskDetailsModal from '../components/TaskDetailsModal'
import TaskDeleteModal from '../components/TaskDeleteModal'

/* ── helper ─────────────────────────────────────────────────── */
function Initials({ name, image }) {
  if (image) {
    return (
      <img 
        src={image} 
        alt={name || 'Profile'} 
        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
      />
    )
  }
  const letter = (name || '?')[0].toUpperCase()
  return (
    <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
      {letter}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────────────────────── */
export default function TaskListPage() {
  const qc     = useQueryClient()
  const user   = useAuthStore(s => s.user)
  const userId = user?.userId
  const { isEmployee, isPM } = useRole()

  // ── URL param for tab (e.g. ?tab=today from dashboard)
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'today' ? 'today' : 'all')

  // ── Filters (shared) ──────────────────────────────────────
  const [projF,   setProjF]   = useState('')
  const [assignF, setAssignF] = useState('')
  const [statF,   setStatF]   = useState('')
  const [prioF,   setPrioF]   = useState('')
  const [page,    setPage]    = useState(1)
  const pageSize = 5

  // ── Modal ──────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [viewing,  setViewing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  const { data: rawProjects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })
  
  const projects = isPM ? rawProjects.filter(p => p.managerId && String(p.managerId) === String(userId)) : rawProjects;

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn:  () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const taskQueries = useQueries({
    queries: isEmployee
      ? [{
          queryKey: ['tasks-user', userId],
          queryFn:  () => taskApi.getByUser(userId).then(r => {
            const d = r.data?.data || r.data
            return Array.isArray(d) ? d : d?.content || []
          }),
          staleTime: 30_000,
          enabled: !!userId,
        }]
      : projects.map(p => ({
          queryKey: ['tasks-project', p.projectId],
          queryFn:  () => taskApi.getByProject(p.projectId).then(r => {
            const d = r.data?.data || r.data
            const list = Array.isArray(d) ? d : d?.content || []
            return list.map(t => ({ ...t, projectName: p.projectName }))
          }),
          staleTime: 30_000,
          enabled: projects.length > 0,
        })),
  })

  const isLoading = taskQueries.some(q => q.isLoading)
  const rawTasks = taskQueries.flatMap(q => q.data || [])

  const expenseQueries = useQueries({
    queries: (isEmployee ? [] : projects).map(p => ({
      queryKey: ['expenses-project', p.projectId],
      queryFn: () => expenseApi.getByProject(p.projectId).then(r => {
        const d = r.data?.data || r.data
        return Array.isArray(d) ? d : d?.content || []
      }),
      staleTime: 30_000,
      enabled: !isEmployee && projects.length > 0,
    })),
  })

  const expenses = expenseQueries.flatMap(q => q.data || [])

  const projectTaskIds = {}
  const tasksByProj = {}
  rawTasks.forEach(t => {
    if (!tasksByProj[t.projectId]) tasksByProj[t.projectId] = []
    tasksByProj[t.projectId].push(t)
  })
  Object.values(tasksByProj).forEach(group => {
    group.sort((a, b) => a.taskId - b.taskId)
    group.forEach((t, index) => {
      projectTaskIds[t.taskId] = index + 1
    })
  })

  const allTasks = rawTasks.map(t => ({
    ...t,
    displayTaskId: projectTaskIds[t.taskId] || t.taskId,
    projectName:    t.projectName    || projects.find(p => String(p.projectId) === String(t.projectId))?.projectName || '—',
    assignedToName: t.assignedToName || users.find(u => String(u.userId) === String(t.assignedTo))?.fullName || '—',
    assignedByName: t.assignedByName || users.find(u => String(u.userId) === String(t.assignedBy))?.fullName || '—',
  }))

  // ── Delete ─────────────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['tasks-user'] })
      qc.invalidateQueries({ queryKey: ['tasks-project'] })
      qc.invalidateQueries({ queryKey: ['recent-activity'] })
      setDeleting(null)
    },
  })

  // ── Filtering ──────────────────────────────────────────────
  const filtered = allTasks.filter(t => {
    const matchProj   = !projF   || String(t.projectId) === projF
    const matchAssign = !assignF || String(t.assignedToId) === assignF
    const matchStat   = !statF   || t.status   === statF
    const matchPrio   = !prioF   || t.priority  === prioF
    return matchProj && matchAssign && matchStat && matchPrio
  })

  const total  = filtered.length
  const pages  = Math.max(1, Math.ceil(total / pageSize))
  const paged  = filtered.slice((page - 1) * pageSize, page * pageSize)

  function resetFilters() {
    setProjF(''); setAssignF(''); setStatF(''); setPrioF(''); setPage(1)
  }

  // ── Summary card counts ────────────────────────────────────
  const inProgress = filtered.filter(t => t.status === 'IN_PROGRESS').length
  const completed  = filtered.filter(t => t.status === 'COMPLETED').length
  const overdue    = filtered.filter(t => t.status === 'OVERDUE').length
  const pct = (n) => total ? Math.round((n / total) * 100) : 0

  // ── Upcoming deadlines ─────────────────────────────────────
  const now = new Date()
  const upcoming = [...filtered]
    .filter(t => t.dueDate && new Date(t.dueDate) > now && t.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  /* ── Shared table row renderer ────────────────────────────── */
  function renderRows() {
    if (paged.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="table-empty">No tasks found</td>
        </tr>
      )
    }
    return paged.map(t => {
      const pct = t.status === 'COMPLETED' ? 100 : (t.status === 'IN_REVIEW' ? (t.completionPercentage || 75) : (t.status === 'IN_PROGRESS' ? (t.completionPercentage || 50) : (t.completionPercentage || 0)))
      return (
        <tr key={t.taskId}>
          {/* Task ID + Name */}
          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.displayTaskId}
          </td>
          <td>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
            {t.description && (
              <div className="td-muted">{t.description.slice(0, 40)}{t.description.length > 40 ? '…' : ''}</div>
            )}
          </td>
          {/* Project */}
          <td>
            <span style={{ color: 'var(--purple)', fontWeight: 500, fontSize: '0.82rem' }}>
              {t.projectName}
            </span>
          </td>
          {/* Assigned By (employee) or Assignee (PM) */}
          <td>
            <div className="user-cell">
                <Initials 
                  name={isEmployee ? t.assignedByName : t.assignedToName} 
                  image={isEmployee ? t.assignedByProfileImage : t.assignedToProfileImage} 
                />
              <span style={{ fontSize: '0.82rem' }}>
                {isEmployee ? t.assignedByName : t.assignedToName}
              </span>
            </div>
          </td>
          {/* Status */}
          <td>
            {isEmployee ? (
              <select
                value={t.status}
                style={{
                  fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border)',
                  borderRadius: 6, padding: '3px 8px', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', cursor: 'pointer', outline: 'none',
                }}
                onChange={(e) => {
                  const newStatus = e.target.value
                  taskApi.updateStatus(t.taskId, newStatus).then(() => {
                    qc.invalidateQueries({ queryKey: ['tasks-user'] })
                    qc.invalidateQueries({ queryKey: ['tasks-project'] })
                    qc.invalidateQueries({ queryKey: ['tasks-dashboard'] })
                    qc.invalidateQueries({ queryKey: ['projects-list'] })
                    qc.invalidateQueries({ queryKey: ['recent-activity'] })
                  })
                }}
              >
                {['TODO','IN_PROGRESS','IN_REVIEW','COMPLETED','NOT_STARTED','OVERDUE'].map(s => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            ) : (
              <span className={`badge ${statusBadgeClass(t.status)}`}>{statusLabel(t.status)}</span>
            )}
          </td>
          {/* Priority */}
          <td>
            <span className={`badge ${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
          </td>
          {/* Due Date */}
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Calendar size={13} style={{ opacity: 0.5 }} />
              {formatDate(t.dueDate)}
            </div>
          </td>
          {/* Progress */}
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '0.82rem', fontWeight: 600, minWidth: 32,
                color: pct >= 80 ? '#10b981' : pct >= 40 ? '#6366f1' : 'var(--text-secondary)',
              }}>
                {pct}%
              </span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className={`progress-fill ${progressColor(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </td>
          {/* Actions */}
          <td>
            {isPM ? (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === t.taskId ? null : t.taskId) }}
                >
                  <MoreVertical size={16} />
                </button>

                {openMenu === t.taskId && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', right: 24, top: 0, zIndex: 50,
                      background: '#fff', borderRadius: 8,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      border: '1px solid #f0f0f0',
                      minWidth: 120, overflow: 'hidden',
                    }}
                  >
                    <button onClick={() => { setViewing(t); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      View Details
                    </button>
                    <button onClick={() => { setEditing(t); setShowForm(true); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      Edit
                    </button>
                    <button onClick={() => { setDeleting(t); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === t.taskId ? null : t.taskId) }}
                >
                  <MoreVertical size={16} />
                </button>

                {openMenu === t.taskId && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', right: 24, top: 0, zIndex: 50,
                      background: '#fff', borderRadius: 8,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      border: '1px solid #f0f0f0',
                      minWidth: 140, overflow: 'hidden',
                    }}
                  >
                    <button onClick={() => { setViewing(t); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      View Details
                    </button>
                    <button onClick={() => { setEditing(t); setShowForm(true); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      Update Progress
                    </button>
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )
    })
  }

  /* ── Summary Cards (shared) ───────────────────────────────── */
  function SummaryCards() {
    const cards = [
      { label: 'Total Tasks',  value: total,      pct: 100,     color: '#6366f1', bg: '#ede9fe', filterVal: '' },
      { label: 'In Progress',  value: inProgress,  pct: pct(inProgress), color: '#3b82f6', bg: '#dbeafe', filterVal: 'IN_PROGRESS' },
      { label: 'Completed',    value: completed,   pct: pct(completed),  color: '#10b981', bg: '#d1fae5', filterVal: 'COMPLETED' },
      { label: 'Overdue',      value: overdue,     pct: pct(overdue),    color: '#ef4444', bg: '#fee2e2', filterVal: 'OVERDUE' },
    ]
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {cards.map(c => {
          const isActive = statF === c.filterVal
          return (
            <div
              key={c.label}
              className="card"
              onClick={() => { setStatF(c.filterVal); setPage(1) }}
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: 'none',
                background: '#fff',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.05)' : 'var(--shadow-sm)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.transform = 'none' }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {c.value}
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--border)' }}>
                  <div style={{ height: 4, borderRadius: 4, background: c.color, width: `${c.pct}%`, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: c.color, fontWeight: 600, marginTop: 4, display: 'block' }}>
                  {c.pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }


  /* ── Upcoming Deadlines (shared footer) ───────────────────── */
  function UpcomingDeadlines() {
    return (
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color="var(--purple)" /> Upcoming Deadlines
        </div>
        {upcoming.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming deadlines.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(t => (
              <div key={t.taskId} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8, background: 'var(--bg-input)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.taskName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.projectName}</div>
                </div>
                <span className={`badge ${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={12} style={{ opacity: 0.6 }} />
                  {formatDate(t.dueDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════
     EMPLOYEE LAYOUT
     ═══════════════════════════════════════════════════════════ */
  if (isEmployee) {
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayTasks = allTasks.filter(t => t.dueDate?.slice(0, 10) === todayStr)
    const todayDone  = todayTasks.filter(t => t.status === 'COMPLETED').length
    const todayPct   = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0

    // Sort: OVERDUE tasks bubble to the top
    const tabTasksSorted = activeTab === 'today'
      ? [...todayTasks].sort((a, b) => (a.status === 'OVERDUE' ? -1 : b.status === 'OVERDUE' ? 1 : 0))
      : [...filtered].sort((a, b) => (a.status === 'OVERDUE' ? -1 : b.status === 'OVERDUE' ? 1 : 0))
    const tabPaged = tabTasksSorted.slice((page - 1) * pageSize, page * pageSize)
    const tabPages = Math.max(1, Math.ceil(tabTasksSorted.length / pageSize))

    function renderTabRows() {
      if (tabPaged.length === 0) {
        return (
          <tr>
            <td colSpan={9} className="table-empty">
              {activeTab === 'today' ? 'No tasks due today 🎉' : 'No tasks found'}
            </td>
          </tr>
        )
      }
      return tabPaged.map(t => {
        const tPct = t.status === 'COMPLETED' ? 100 : (t.status === 'IN_REVIEW' ? (t.completionPercentage || 75) : (t.status === 'IN_PROGRESS' ? (t.completionPercentage || 50) : (t.completionPercentage || 0)))
        const isOverdue = t.status === 'OVERDUE'
        return (
          <tr key={t.taskId} style={isOverdue ? { background: '#fff5f5', borderLeft: '3px solid #ef4444' } : {}}>
            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isOverdue && <span title="Overdue!" style={{ color: '#ef4444', marginRight: 4 }}>⚠️</span>}
              {t.displayTaskId}
            </td>
            <td>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isOverdue ? '#b91c1c' : 'inherit' }}>{t.title}</div>
              {t.description && (
                <div className="td-muted">{t.description.slice(0, 40)}{t.description.length > 40 ? '…' : ''}</div>
              )}
              {isOverdue && (
                <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600, marginTop: 2 }}>
                  Overdue — please complete ASAP
                </div>
              )}
            </td>
            <td>
              <a href={`/projects/${t.projectId}`} style={{ color: 'var(--purple)', fontWeight: 500, fontSize: '0.82rem' }}>
                {t.projectName}
              </a>
            </td>
            <td>
              <div className="user-cell">
                {t.assignedByName
                  ? <><Initials name={t.assignedByName} image={t.assignedByProfileImage} /><span style={{ fontSize: '0.82rem' }}>{t.assignedByName}</span></>
                  : <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>—</span>
                }
              </div>
            </td>
            <td>
              {isOverdue ? (
                // Overdue tasks: show badge + allow employee to still change to in-progress/completed
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="badge badge-overdue" style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>Overdue</span>
                  <select
                    defaultValue=""
                    style={{
                      fontSize: '0.72rem', border: '1px solid #fca5a5',
                      borderRadius: 6, padding: '2px 6px', background: '#fff',
                      color: '#dc2626', cursor: 'pointer', outline: 'none',
                    }}
                    onChange={(e) => {
                      if (!e.target.value) return
                      taskApi.updateStatus(t.taskId, e.target.value).then(() => {
                        qc.invalidateQueries({ queryKey: ['tasks-user'] })
                        qc.invalidateQueries({ queryKey: ['tasks-project'] })
                        qc.invalidateQueries({ queryKey: ['tasks-dashboard'] })
                        qc.invalidateQueries({ queryKey: ['projects-list'] })
                        qc.invalidateQueries({ queryKey: ['recent-activity'] })
                      })
                    }}
                  >
                    <option value="">Move to…</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              ) : (
                <select
                  value={t.status}
                  style={{
                    fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border)',
                    borderRadius: 6, padding: '3px 8px', background: 'var(--bg-input)',
                    color: 'var(--text-primary)', cursor: 'pointer', outline: 'none',
                  }}
                  onChange={(e) => {
                    const newStatus = e.target.value
                    taskApi.updateStatus(t.taskId, newStatus).then(() => {
                      qc.invalidateQueries({ queryKey: ['tasks-user'] })
                      qc.invalidateQueries({ queryKey: ['tasks-project'] })
                      qc.invalidateQueries({ queryKey: ['tasks-dashboard'] })
                      qc.invalidateQueries({ queryKey: ['projects-list'] })
                      qc.invalidateQueries({ queryKey: ['recent-activity'] })
                    })
                  }}
                >
                  <option value="IN_PROGRESS">{statusLabel('IN_PROGRESS')}</option>
                  <option value="IN_REVIEW">{statusLabel('IN_REVIEW')}</option>
                  <option value="COMPLETED">{statusLabel('COMPLETED')}</option>
                </select>
              )}
            </td>
            <td><span className={`badge ${priorityBadgeClass(t.priority)}`}>{t.priority}</span></td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <Calendar size={13} style={{ opacity: 0.5 }} />
                {formatDate(t.dueDate)}
              </div>
            </td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 32, color: tPct >= 80 ? '#10b981' : tPct >= 40 ? '#6366f1' : 'var(--text-secondary)' }}>
                  {tPct}%
                </span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className={`progress-fill ${progressColor(tPct)}`} style={{ width: `${tPct}%` }} />
                </div>
              </div>
            </td>
            <td style={{ textAlign: 'center' }}>
              <button
                title="View Details"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#6366f1', display: 'inline-flex' }}
                onClick={() => setViewing(t)}
              >
                <Eye size={16} />
              </button>
            </td>
          </tr>
        )
      })
    }

    return (
      <div>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="page-heading">My Tasks</h1>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        {/* ── TABS ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
          {[
            { key: 'all',   label: `All Tasks (${allTasks.length})` },
            { key: 'today', label: `Today's Tasks (${todayTasks.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: activeTab === tab.key ? 'var(--purple)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--purple)' : '2px solid transparent',
                marginBottom: -2,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TODAY PROGRESS TRACKER (only visible on today tab) ── */}
        {activeTab === 'today' && (
          <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Today's Progress</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {todayDone} of {todayTasks.length} tasks completed
                </div>
              </div>
              <div style={{
                fontSize: '1.6rem', fontWeight: 800,
                color: todayPct === 100 ? '#10b981' : todayPct >= 50 ? '#6366f1' : 'var(--text-secondary)',
              }}>
                {todayPct}%
              </div>
            </div>
            <div style={{ height: 10, borderRadius: 10, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${todayPct}%`,
                borderRadius: 10,
                background: todayPct === 100 ? '#10b981' : '#6366f1',
                transition: 'width 0.5s ease',
              }} />
            </div>
            {todayPct === 100 && (
              <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                🎉 All done for today!
              </div>
            )}
          </div>
        )}

        {/* ── FILTERS (only on All tab) ── */}
        {activeTab === 'all' && (
          <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 220px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Status</div>
                <select className="form-select" style={{ height: 38, width: '100%' }} value={statF} onChange={e => { setStatF(e.target.value); setPage(1) }}>
                  <option value="">All Status</option>
                  {['TODO','IN_PROGRESS','IN_REVIEW','COMPLETED','NOT_STARTED','OVERDUE'].map(s => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '0 0 220px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Priority</div>
                <select className="form-select" style={{ height: 38, width: '100%' }} value={prioF} onChange={e => { setPrioF(e.target.value); setPage(1) }}>
                  <option value="">All Priority</option>
                  {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button className="btn" style={{ height: 38, whiteSpace: 'nowrap', color: '#7c3aed', background: '#fff', border: '1px solid #c4b5fd', borderRadius: 6, padding: '0 16px', display: 'flex', alignItems: 'center' }} onClick={resetFilters}>
                <RotateCcw size={14} style={{ marginRight: 6 }} /> Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading
            ? <div className="page-loader"><div className="spinner" /></div>
            : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Task Name</th>
                      <th>Project</th>
                      <th>Assigned By</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderTabRows()}</tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Pagination for Today tab */}
        {tabPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {Array.from({ length: tabPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                  background: page === p ? 'var(--purple)' : '#fff',
                  color: page === p ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        {activeTab === 'all' && <UpcomingDeadlines />}

        {/* Modals for Employee */}
        {showForm && (
          <TaskFormModal
            task={editing}
            projects={projects}
            users={users}
            isEmployeeEdit={true}
            onClose={() => { setShowForm(false); setEditing(null) }}
            onSaved={() => {
              qc.invalidateQueries({ queryKey: ['tasks-user'] })
              qc.invalidateQueries({ queryKey: ['tasks-project'] })
              qc.invalidateQueries({ queryKey: ['tasks-dashboard'] })
              qc.invalidateQueries({ queryKey: ['projects-list'] })
              qc.invalidateQueries({ queryKey: ['recent-activity'] })
              setShowForm(false); setEditing(null)
            }}
          />
        )}
        {viewing && (
          <TaskDetailsModal task={viewing} onClose={() => setViewing(null)} />
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════
     PROJECT MANAGER LAYOUT
     ═══════════════════════════════════════════════════════════ */
  return (
    <div onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Tasks</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 400 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Project</div>
            <select className="form-select" style={{ height: 38 }} value={projF} onChange={e => { setProjF(e.target.value); setPage(1) }}>
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Assignee</div>
            <select className="form-select" style={{ height: 38 }} value={assignF} onChange={e => { setAssignF(e.target.value); setPage(1) }}>
              <option value="">All Assignees</option>
              {users.map(u => (
                <option key={u.userId} value={u.userId}>{u.fullName || `${u.firstName} ${u.lastName}`}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Status</div>
            <select className="form-select" style={{ height: 38 }} value={statF} onChange={e => { setStatF(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              {['TODO','IN_PROGRESS','IN_REVIEW','COMPLETED','NOT_STARTED','OVERDUE'].map(s => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Priority</div>
            <select className="form-select" style={{ height: 38 }} value={prioF} onChange={e => { setPrioF(e.target.value); setPage(1) }}>
              <option value="">All Priority</option>
              {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <button className="btn" style={{ height: 38, whiteSpace: 'nowrap', color: '#5b21b6', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 6, padding: '0 16px', display: 'flex', alignItems: 'center' }} onClick={resetFilters}>
            <RotateCcw size={14} style={{ marginRight: 6 }} /> Clear Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        {isLoading
          ? <div className="page-loader"><div className="spinner" /></div>
          : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Task Name</th>
                      <th>Project</th>
                      <th>Assignee</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows()}</tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span>
                  Showing {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)} to{' '}
                  {Math.min(page * pageSize, total)} of {total} tasks
                </span>
                <div className="pag-controls">
                  <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                    <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
              </div>
            </>
          )
        }
      </div>

      {/* Footer */}
      <UpcomingDeadlines />

      {/* Add/Edit Task Modal */}
      {showForm && (
        <TaskFormModal
          task={editing}
          projects={projects}
          users={users}
          isEmployeeEdit={false}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['tasks-user'] })
            qc.invalidateQueries({ queryKey: ['tasks-project'] })
            qc.invalidateQueries({ queryKey: ['tasks-dashboard'] })
            qc.invalidateQueries({ queryKey: ['projects-list'] })
            qc.invalidateQueries({ queryKey: ['recent-activity'] })
            setShowForm(false); setEditing(null)
          }}
        />
      )}

      {viewing && (
        <TaskDetailsModal task={viewing} onClose={() => setViewing(null)} />
      )}

      {deleting && (
        <TaskDeleteModal 
          task={deleting} 
          isPending={deleteMut.isPending} 
          onConfirm={() => deleteMut.mutate(deleting.taskId)} 
          onClose={() => setDeleting(null)} 
        />
      )}
    </div>
  )
}
