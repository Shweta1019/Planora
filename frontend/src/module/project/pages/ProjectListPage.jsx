import { useState, useMemo } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useRole } from '../../../store/useRole'
import { projectApi } from '../../../api/projectApi'
import { userApi } from '../../../api/userApi'
import { Plus, Search, Filter, Eye, Pencil, Trash2, MoreVertical, Folder, CheckCircle, PauseCircle, XCircle, Monitor, Smartphone, Code, BarChart2, Cloud, Box } from 'lucide-react'
import { formatDate, statusBadgeClass, statusLabel, progressColor } from '../../../utils/formatDate'
import ProjectFormModal from '../components/ProjectForm'
import ProjectDetailsModal from '../components/ProjectDetailsModal'
import ProjectDeleteModal from '../components/ProjectDeleteModal'
import ProjectStatusModal from '../components/ProjectStatusModal'
import ProjectReportModal from '../components/ProjectReportModal'

const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ── Shared Helpers ────────────────────────────────────────────────────────
function getProjectIconInfo(name = '', index = 0) {
  const n = name.toLowerCase()
  if (n.includes('web') || n.includes('site')) return { icon: <Monitor size={20} />, bg: '#f3e8ff', color: '#9333ea' }
  if (n.includes('mobile') || n.includes('app')) return { icon: <Smartphone size={20} />, bg: '#dcfce7', color: '#22c55e' }
  if (n.includes('crm') || n.includes('api')) return { icon: <Code size={20} />, bg: '#ffedd5', color: '#f97316' }
  if (n.includes('report') || n.includes('data') || n.includes('analytic')) return { icon: <BarChart2 size={20} />, bg: '#e0f2fe', color: '#3b82f6' }
  if (n.includes('cloud') || n.includes('migrate')) return { icon: <Cloud size={20} />, bg: '#dcfce7', color: '#22c55e' }
  
  const colors = [
    { bg: '#f3e8ff', color: '#9333ea' },
    { bg: '#e0f2fe', color: '#3b82f6' },
    { bg: '#dcfce7', color: '#22c55e' },
    { bg: '#ffedd5', color: '#f97316' },
    { bg: '#fee2e2', color: '#ef4444' }
  ]
  return { icon: <Box size={20} />, ...colors[index % colors.length] }
}
const ALL_STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

/* ═══════════════════════════════════════════════════════════
   ADMIN VIEW - Full Access
   ═══════════════════════════════════════════════════════════ */
function AdminProjectView({ raw, users, deleteMut, isLoading }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [tempSearch, setTempSearch] = useState('')
  const [statusFilter, setStatus] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [activeModal, setActiveModal] = useState({ type: null, data: null })
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = raw.filter(p => {
    const matchSearch = !search || p.projectName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const activeCount = raw.filter(p => p.status === 'ACTIVE').length
  const onHoldCount = raw.filter(p => p.status === 'ON_HOLD').length
  const completedCount = raw.filter(p => p.status === 'COMPLETED').length

  function handleDelete(id, name) {
    if (window.confirm(`Delete project "${name}"?`)) deleteMut.mutate(id)
  }

  return (
    <div onClick={() => setOpenMenu(null)}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Projects</h1>

        </div>
        <button className="btn btn-primary" onClick={() => { setActiveModal({ type: 'edit', data: null }) }}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Folder size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Projects</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{raw.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer', marginTop: 'auto' }} onClick={() => setStatus('')}>View all projects →</div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Projects</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer', marginTop: 'auto' }} onClick={() => setStatus('ACTIVE')}>View active projects →</div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PauseCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>On Hold Projects</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{onHoldCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer', marginTop: 'auto' }} onClick={() => setStatus('ON_HOLD')}>View on hold projects →</div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed Projects</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{completedCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer', marginTop: 'auto' }} onClick={() => setStatus('COMPLETED')}>View completed projects →</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>All Projects</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="form-select" value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ minWidth: 140, height: 38 }}>
              <option value="">All Status</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <div className="search-box" style={{ width: 220 }}>
              <Search size={14} className="search-icon" style={{ left: 12 }} />
              <input
                type="text"
                placeholder="Search projects..."
                className="form-input"
                style={{ paddingLeft: 34, height: 38 }}
                value={tempSearch}
                onChange={e => setTempSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearch(tempSearch)
                    setPage(1)
                  }
                }}
              />
            </div>
          </div>
        </div>
        {isLoading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap" style={{ overflow: 'visible' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Project Manager</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Budget</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={7} className="table-empty">No projects found</td></tr>
                    : paged.map((p, idx) => {
                      const isMenuOpen = openMenu === p.projectId
                      return (
                        <tr key={p.projectId}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.projectName}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.managerName || '—'}</span>
                          </td>
                          <td><span className={`badge ${statusBadgeClass(p.status)}`}>{statusLabel(p.status)}</span></td>
                          <td style={{ fontSize: '0.82rem' }}>{formatDate(p.startDate) || '—'}</td>
                          <td style={{ fontSize: '0.82rem' }}>{formatDate(p.endDate) || '—'}</td>
                          <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatINR(p.budget || p.totalBudget)}</td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : p.projectId) }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {isMenuOpen && (
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
                                  <button onClick={() => { setActiveModal({ type: 'view', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    View Details
                                  </button>
                                  <button onClick={() => { setActiveModal({ type: 'edit', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    Edit
                                  </button>
                                  <button onClick={() => { setActiveModal({ type: 'status', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    Change Status
                                  </button>

                                  <button onClick={() => { setActiveModal({ type: 'delete', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' }}>
                                    Delete
                                  </button>
                                </div>
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
            <div className="pagination">
              <span>Showing {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} projects</span>
              <div className="pag-controls">
                <button className="pag-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" onClick={() => setPage(p => p + 1)} disabled={page >= pages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeModal.type === 'view' && <ProjectDetailsModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'edit' && <ProjectFormModal project={activeModal.data} users={users} onSaved={() => { qc.invalidateQueries({ queryKey: ['projects-list'] }); setActiveModal({ type: null, data: null }) }} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'status' && <ProjectStatusModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'report' && <ProjectReportModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'delete' && <ProjectDeleteModal project={activeModal.data} isPending={deleteMut.isPending} onConfirm={() => { deleteMut.mutate(activeModal.data.projectId); setActiveModal({ type: null, data: null }) }} onClose={() => setActiveModal({ type: null, data: null })} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MANAGER VIEW - Own Projects Only
   ═══════════════════════════════════════════════════════════ */
function ManagerProjectView({ raw, users, user, isLoading }) {
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()

  const search = new URLSearchParams(location.search).get('q') || ''

  const [activeModal, setActiveModal] = useState({ type: null, data: null })
  const [openMenu, setOpenMenu] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // PM only sees projects they manage
  const myProjects = raw.filter(p => p.managerName === user.fullName)

  const filtered = myProjects.filter(p => {
    const matchSearch = !search || p.projectName?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Custom mapping for PM view status to match mockup
  function pmStatusBadge(status) {
    if (status === 'ACTIVE') return { text: 'In Progress', bg: '#e0f2fe', color: '#3b82f6' }
    if (status === 'PLANNING') return { text: 'Pending', bg: '#ffedd5', color: '#f97316' }
    if (status === 'COMPLETED') return { text: 'Completed', bg: '#dcfce7', color: '#22c55e' }
    return { text: status, bg: '#f1f5f9', color: '#64748b' }
  }

  return (
    <div onClick={() => setOpenMenu(null)}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">My Projects</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setActiveModal({ type: 'edit', data: null }) }}>
          <Plus size={16} /> Create Project
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        {isLoading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap" style={{ overflow: 'visible' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={7} className="table-empty">No projects found</td></tr>
                    : paged.map((p, idx) => {
                      const pct = p.completionPercentage || 0
                      const iconInfo = getProjectIconInfo(p.projectName, idx)
                      const badge = pmStatusBadge(p.status)
                      return (
                        <tr key={p.projectId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 8, background: iconInfo.bg, color: iconInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {iconInfo.icon}
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.projectName}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {p.description ? (p.description.length > 60 ? p.description.slice(0, 60) + '…' : p.description) : 'No description provided.'}
                            </div>
                          </td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: badge.bg, color: badge.color }}>
                              {badge.text}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{formatDate(p.startDate) || '—'}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{formatDate(p.endDate) || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</span>
                              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, width: '100%' }}>
                                <div style={{ height: 6, background: '#5b21b6', borderRadius: 3, width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5b21b6' }}
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === p.projectId ? null : p.projectId) }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenu === p.projectId && (
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
                                  <button onClick={() => { setActiveModal({ type: 'view', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    View Details
                                  </button>
                                  <button onClick={() => { setActiveModal({ type: 'edit', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    Edit
                                  </button>
                                  <button onClick={() => { setActiveModal({ type: 'status', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    Change Status
                                  </button>
                                  <button onClick={() => { setActiveModal({ type: 'report', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    Download Report
                                  </button>
                                </div>
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
            <div className="pagination">
              <span>Showing {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} projects</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} style={page === n ? { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' } : {}} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeModal.type === 'view' && <ProjectDetailsModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'edit' && <ProjectFormModal project={activeModal.data} users={users} onSaved={() => { qc.invalidateQueries({ queryKey: ['projects-list'] }); setActiveModal({ type: null, data: null }) }} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'status' && <ProjectStatusModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
      {activeModal.type === 'report' && <ProjectReportModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   EMPLOYEE VIEW - Team Member Access Only
   ═══════════════════════════════════════════════════════════ */
function EmployeeProjectView({ raw, user, memberQueries, isLoading }) {
  const navigate = useNavigate()
  const location = useLocation()
  const search = new URLSearchParams(location.search).get('q') || ''

  const [activeModal, setActiveModal] = useState({ type: null, data: null })
  const [openMenu, setOpenMenu] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Combine raw projects with memberQuery data to filter only projects the employee belongs to
  const myProjects = raw.map((p, idx) => {
    const memQuery = memberQueries[idx]
    if (!memQuery || !memQuery.data) return null

    const myMemberRecord = memQuery.data.find(m => String(m.userId) === String(user.userId))
    if (!myMemberRecord) return null

    return { ...p, myRole: myMemberRecord.roleInProject || 'Team Member' }
  }).filter(Boolean)

  const filtered = myProjects.filter(p => {
    const matchSearch = !search || p.projectName?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const isDataLoading = isLoading || memberQueries.some(q => q.isLoading)

  return (
    <div onClick={() => setOpenMenu(null)}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">My Projects</h1>
          <p className="page-subheading">Projects you are part of.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isDataLoading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap" style={{ overflow: 'visible' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={7} className="table-empty">No projects found</td></tr>
                    : paged.map((p, idx) => {
                      const iconInfo = getProjectIconInfo(p.projectName, idx)
                      return (
                        <tr key={p.projectId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: iconInfo.bg, color: iconInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {iconInfo.icon}
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.projectName}</div>
                            </div>
                          </td>
                          <td>
                            <div className="td-muted">
                              {p.description ? (p.description.length > 40 ? p.description.slice(0, 40) + '…' : p.description) : 'No description provided.'}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem',
                              fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)'
                            }}>
                              {p.myRole}
                            </span>
                          </td>
                          <td><span className={`badge ${statusBadgeClass(p.status)}`}>{statusLabel(p.status)}</span></td>
                          <td style={{ fontSize: '0.82rem' }}>{formatDate(p.startDate) || '—'}</td>
                          <td style={{ fontSize: '0.82rem' }}>{formatDate(p.endDate) || '—'}</td>
                          <td>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === p.projectId ? null : p.projectId) }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenu === p.projectId && (
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
                                  <button onClick={() => { setActiveModal({ type: 'view', data: p }); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    View Details
                                  </button>
                                </div>
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
            <div className="pagination">
              <span>Showing {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} projects</span>
              <div className="pag-controls">
                <button className="pag-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" onClick={() => setPage(p => p + 1)} disabled={page >= pages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeModal.type === 'view' && <ProjectDetailsModal project={activeModal.data} onClose={() => setActiveModal({ type: null, data: null })} />}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT - RBAC Router
   ═══════════════════════════════════════════════════════════ */
export default function ProjectListPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { isAdmin, isPM, isEmployee } = useRole()

  // 1. Fetch all projects
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 30_000,
  })

  // 2. Fetch all users (for modals/assigning)
  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  // 3. For Employees: fetch members for each project to filter only their projects
  const memberQueries = useQueries({
    queries: isEmployee ? raw.map(p => ({
      queryKey: ['project-members', p.projectId],
      queryFn: () => projectApi.getMembers(p.projectId).then(r => r.data?.data || []),
      staleTime: 60_000,
    })) : []
  })

  // 4. Admin Delete Mutation
  const deleteMut = useMutation({
    mutationFn: (id) => projectApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects-list'] }),
  })

  // Render the appropriate isolated component based on Role
  if (isAdmin) {
    return <AdminProjectView raw={raw} users={users} deleteMut={deleteMut} isLoading={isLoading} />
  }

  if (isPM) {
    return <ManagerProjectView raw={raw} users={users} user={user} isLoading={isLoading} />
  }

  if (isEmployee) {
    return <EmployeeProjectView raw={raw} user={user} memberQueries={memberQueries} isLoading={isLoading} />
  }

  // Fallback (should never be reached in a protected route)
  return <div className="page-header"><h1 className="page-heading">Access Denied</h1></div>
}
