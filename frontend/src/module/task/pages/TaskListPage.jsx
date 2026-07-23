import { useState } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { useRole } from '../../../store/useRole'
import { taskApi }    from '../../../api/taskApi'
import { projectApi } from '../../../api/projectApi'
import { userApi }    from '../../../api/userApi'
import {
  Plus, Search, RotateCcw, Eye, Pencil, Trash2,
  Filter, Download, Calendar
} from 'lucide-react'
import {
  formatDate, statusBadgeClass, statusLabel, priorityBadgeClass, progressColor
} from '../../../utils/formatDate'
import TaskFormModal from '../components/TaskForm'

export default function TaskListPage() {
  const qc = useQueryClient()
  const user   = useAuthStore(s => s.user)
  const userId = user?.userId
  const { role, isEmployee } = useRole()

  // Employee defaults to "my" tab, PM/Admin to "all"
  const [tab,    setTab]    = useState(isEmployee ? 'my' : 'all')
  const [search, setSearch] = useState('')
  const [projF,  setProjF]  = useState('')
  const [statF,  setStatF]  = useState('')
  const [prioF,  setPrioF]  = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 7

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  // Fetch tasks — for Employee only their tasks, for PM/Admin all project tasks
  const taskQueries = useQueries({
    queries: isEmployee
      ? [{
          queryKey: ['tasks-user', userId],
          queryFn:  () => taskApi.getByUser(userId).then(r => {
            const d = r.data?.data || r.data
            return Array.isArray(d) ? d : d?.content || []
          }),
          staleTime: 30_000,
          enabled:   !!userId,
        }]
      : projects.map(p => ({
          queryKey: ['tasks-project', p.projectId],
          queryFn:  () => taskApi.getByProject(p.projectId).then(r => {
            const d = r.data?.data || r.data
            const list = Array.isArray(d) ? d : d?.content || []
            return list.map(t => ({ ...t, projectName: p.projectName }))
          }),
          staleTime: 30_000,
          enabled:   projects.length > 0,
        })),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn:  () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const isLoading = taskQueries.some(q => q.isLoading)
  const rawTasks = taskQueries.flatMap(q => q.data || [])
  const raw = rawTasks.map(t => ({
    ...t,
    projectName: t.projectName || projects.find(p => String(p.projectId) === String(t.projectId))?.projectName || 'General',
    assignedToName: t.assignedToName || users.find(u => String(u.userId) === String(t.assignedTo))?.fullName || t.assignedToName || '',
  }))

  const deleteMut = useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['tasks-user'] })
      qc.invalidateQueries({ queryKey: ['tasks-project'] })
    },
  })

  // Tab filtering
  const tabFiltered = raw.filter(t => {
    if (tab === 'all') return true
    if (tab === 'my')  return String(t.assignedTo) === String(userId)
    if (tab === 'assigned') return String(t.assignedTo) !== String(userId)
    return true
  })

  // Dropdown + search filtering
  const filtered = tabFiltered.filter(t => {
    const matchSearch = !search || t.taskName?.toLowerCase().includes(search.toLowerCase())
    const matchProj   = !projF  || String(t.projectId) === projF
    const matchStat   = !statF  || t.status === statF
    const matchPrio   = !prioF  || t.priority === prioF
    return matchSearch && matchProj && matchStat && matchPrio
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function resetFilters() {
    setSearch(''); setProjF(''); setStatF(''); setPrioF(''); setPage(1)
  }

  function handleDelete(id, name) {
    if (window.confirm(`Delete task "${name}"?`)) deleteMut.mutate(id)
  }

  function handleExport() {
    const headers = ['Task Name','Project','Assigned To','Priority','Status','Due Date','Progress']
    const rows = filtered.map(t => [
      t.taskName, t.projectName, t.assignedToName, t.priority,
      statusLabel(t.status), formatDate(t.dueDate), `${t.completionPercentage || 0}%`
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tasks_export.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Tasks</h1>
          <p className="page-subheading">Manage and track tasks for your projects</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExport}><Download size={14}/> Export</button>
          {!isEmployee && (
            <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
              <Plus size={16}/> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs — All Tasks / My Tasks / Assigned to Others */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 18 }}>
        {[
          { key: 'all',      label: 'All Tasks' },
          { key: 'my',       label: 'My Tasks' },
          ...(!isEmployee ? [{ key: 'assigned', label: 'Assigned to Others' }] : []),
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1) }}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? 'var(--purple)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--purple)' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-box" style={{ minWidth: 180 }}>
            <Search size={14} className="search-icon"/>
            <input type="text" placeholder="Search tasks..." className="form-input" style={{ paddingLeft: 34 }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={projF} onChange={e => { setProjF(e.target.value); setPage(1) }}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
          </select>
          <select className="form-select" style={{ width: 140 }} value={statF} onChange={e => { setStatF(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {['TO_DO','IN_PROGRESS','IN_REVIEW','COMPLETED','NOT_STARTED','OVERDUE'].map(s => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <select className="form-select" style={{ width: 140 }} value={prioF} onChange={e => { setPrioF(e.target.value); setPage(1) }}>
            <option value="">All Priority</option>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(search || projF || statF || prioF) && (
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}><RotateCcw size={13}/> Reset</button>
          )}
          <div style={{ flex: 1 }}/>
          <button className="btn btn-outline btn-sm"><Filter size={14}/> Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading
          ? <div className="page-loader"><div className="spinner"/></div>
          : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="table-checkbox"/></th>
                    <th>Task Name</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={9} className="table-empty">No tasks found</td></tr>
                    : paged.map(t => {
                        const pct = t.completionPercentage || 0
                        const isOwn = String(t.assignedTo) === String(userId)
                        return (
                          <tr key={t.taskId}>
                            <td className="td-check"><input type="checkbox" className="table-checkbox"/></td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.taskName}</div>
                              {t.description && <div className="td-muted">{t.description.slice(0, 40)}{t.description.length>40?'…':''}</div>}
                            </td>
                            <td>
                              <a href={`/projects/${t.projectId}`} style={{ color:'var(--purple)', fontWeight:500, fontSize:'0.82rem' }}>
                                {t.projectName||'—'}
                              </a>
                            </td>
                            <td>
                              {t.assignedToName
                                ? <div className="user-cell"><div className="avatar avatar-sm">{t.assignedToName[0]}</div><span style={{ fontSize:'0.82rem' }}>{t.assignedToName}</span></div>
                                : <span className="td-muted">—</span>}
                            </td>
                            <td><span className={`badge ${priorityBadgeClass(t.priority)}`}>{t.priority}</span></td>
                            <td><span className={`badge ${statusBadgeClass(t.status)}`}>{statusLabel(t.status)}</span></td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                <Calendar size={13} style={{ opacity: 0.5 }}/>
                                {formatDate(t.dueDate)}
                              </div>
                            </td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ fontSize:'0.82rem', fontWeight:600, minWidth:32, color: pct >= 80 ? '#10b981' : pct >= 40 ? '#6366f1' : 'var(--text-secondary)' }}>{pct}%</span>
                                <div className="progress-bar" style={{ flex:1 }}>
                                  <div className={`progress-fill ${progressColor(pct)}`} style={{ width:`${pct}%` }}/>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button className="action-btn view" title="View"><Eye size={14}/></button>
                                <button className="action-btn edit" onClick={() => { setEditing(t); setShowForm(true) }} title="Edit"><Pencil size={14}/></button>
                                {(!isEmployee || isOwn) && (
                                  <button className="action-btn delete" onClick={() => handleDelete(t.taskId, t.taskName)} title="Delete"><Trash2 size={14}/></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                    })
                  }
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="pagination">
              <span>Showing {total === 0 ? 0 : Math.min((page-1)*pageSize+1, total)} to {Math.min(page*pageSize, total)} of {total} tasks</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page===1} onClick={() => setPage(p => p-1)}>‹</button>
                {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=>(
                  <button key={n} className={`pag-btn${page===n?' active':''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page>=pages} onClick={() => setPage(p => p+1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <TaskFormModal
          task={editing}
          projects={projects}
          users={users}
          isEmployeeEdit={isEmployee}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['tasks'] })
            qc.invalidateQueries({ queryKey: ['tasks-user'] })
            qc.invalidateQueries({ queryKey: ['tasks-project'] })
            setShowForm(false); setEditing(null)
          }}
        />
      )}
    </div>
  )
}
