import { useState } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { useRole } from '../../../store/useRole'
import { taskApi }    from '../../../api/taskApi'
import { projectApi } from '../../../api/projectApi'
import { userApi }    from '../../../api/userApi'
import { expenseApi } from '../../../api/expenseApi'
import { Plus, RotateCcw, Eye, MoreHorizontal, MoreVertical, Pencil, Trash2, Calendar, Wallet } from 'lucide-react'
import {
  formatDate, statusBadgeClass, statusLabel, priorityBadgeClass, progressColor
} from '../../../utils/formatDate'
import TaskFormModal from '../components/TaskForm'
import TaskDetailsModal from '../components/TaskDetailsModal'
import TaskDeleteModal from '../components/TaskDeleteModal'

/* ── helper ─────────────────────────────────────────────────── */
function Initials({ name }) {
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

  // ── Data ──────────────────────────────────────────────────
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

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

  const employeeProjectIds = isEmployee ? Array.from(new Set(rawTasks.map(t => t.projectId))) : []
  const employeeProjects = isEmployee ? employeeProjectIds.map(id => projects.find(p => String(p.projectId) === String(id))).filter(Boolean) : []
  
  const expenseQueries = useQueries({
    queries: employeeProjects.map(p => ({
      queryKey: ['expenses-project', p.projectId],
      queryFn: () => expenseApi.getByProject(p.projectId).then(r => {
        const d = r.data?.data || r.data
        return Array.isArray(d) ? d : d?.content || []
      }),
      staleTime: 30_000,
      enabled: isEmployee && employeeProjects.length > 0,
    })),
  })

  const expenses = expenseQueries.flatMap(q => q.data || [])

  const allTasks = rawTasks.map(t => ({
    ...t,
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
      const pct = t.completionPercentage || 0
      return (
        <tr key={t.taskId}>
          {/* Task ID + Name */}
          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            #{t.taskId}
          </td>
          <td>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
            {t.description && (
              <div className="td-muted">{t.description.slice(0, 40)}{t.description.length > 40 ? '…' : ''}</div>
            )}
          </td>
          {/* Project */}
          <td>
            <a href={`/projects/${t.projectId}`} style={{ color: 'var(--purple)', fontWeight: 500, fontSize: '0.82rem' }}>
              {t.projectName}
            </a>
          </td>
          {/* Assigned By (employee) or Assignee (PM) */}
          <td>
            <div className="user-cell">
              <Initials name={isEmployee ? t.assignedByName : t.assignedToName} />
              <span style={{ fontSize: '0.82rem' }}>
                {isEmployee ? t.assignedByName : t.assignedToName}
              </span>
            </div>
          </td>
          {/* Status */}
          <td>
            <span className={`badge ${statusBadgeClass(t.status)}`}>{statusLabel(t.status)}</span>
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
              <div className="actions-cell">
                <button className="action-btn view" title="View" onClick={() => setViewing(t)}><Eye size={14} /></button>
                <button className="action-btn view" title="More"><MoreHorizontal size={14} /></button>
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
      { label: 'Total Tasks',  value: total,      pct: 100,     color: '#6366f1', bg: '#ede9fe' },
      { label: 'In Progress',  value: inProgress,  pct: pct(inProgress), color: '#3b82f6', bg: '#dbeafe' },
      { label: 'Completed',    value: completed,   pct: pct(completed),  color: '#10b981', bg: '#d1fae5' },
      { label: 'Overdue',      value: overdue,     pct: pct(overdue),    color: '#ef4444', bg: '#fee2e2' },
    ]
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
              {c.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {c.value}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, borderRadius: 4, background: 'var(--border)' }}>
                <div style={{ height: 4, borderRadius: 4, background: c.color, width: `${c.pct}%`, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: c.color, fontWeight: 600, marginTop: 4, display: 'block' }}>
                {c.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Employee Budget Card ─────────────────────────────────── */
  function EmployeeBudgetCard() {
    const totalAllocated = employeeProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const remaining = totalAllocated - totalSpent

    if (employeeProjects.length === 0) return null;

    return (
      <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wallet size={16} color="var(--purple)" /> Project Budget Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div style={{ padding: 12, borderRadius: 8, background: '#ede9fe', border: '1px solid #ddd6fe' }}>
            <div style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 600 }}>Total Allocated</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4c1d95' }}>${(totalAllocated || 0).toLocaleString()}</div>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>Total Spent</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#065f46' }}>${(totalSpent || 0).toLocaleString()}</div>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: remaining < 0 ? '#fee2e2' : '#e0f2fe', border: `1px solid ${remaining < 0 ? '#fecaca' : '#bae6fd'}` }}>
            <div style={{ fontSize: '0.78rem', color: remaining < 0 ? '#b91c1c' : '#0369a1', fontWeight: 600 }}>Remaining</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: remaining < 0 ? '#991b1b' : '#075985' }}>${(remaining || 0).toLocaleString()}</div>
          </div>
        </div>
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
    return (
      <div>
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-heading">My Tasks</h1>
            <p className="page-subheading">Tasks assigned to you.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        <EmployeeBudgetCard />

        {/* Filters — Status + Priority + Clear */}
        <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 150 }} value={statF}
              onChange={e => { setStatF(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              {['TODO','IN_PROGRESS','IN_REVIEW','COMPLETED','NOT_STARTED','OVERDUE'].map(s => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>

            <select className="form-select" style={{ width: 150 }} value={prioF}
              onChange={e => { setPrioF(e.target.value); setPage(1) }}>
              <option value="">All Priority</option>
              {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <button className="btn btn-outline btn-sm" style={{ color: '#7c3aed', borderColor: '#7c3aed' }} onClick={resetFilters}>
              <RotateCcw size={13} /> Clear Filters
            </button>
          </div>
        </div>

        {/* Table — no pagination for employee */}
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
                  <tbody>{renderRows()}</tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Footer */}
        <UpcomingDeadlines />
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

      {/* Footer / Summary moved here */}
      <SummaryCards />
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
            qc.invalidateQueries({ queryKey: ['tasks-project'] })
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
