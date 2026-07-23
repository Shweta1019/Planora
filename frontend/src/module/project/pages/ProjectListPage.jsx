import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../../../api/projectApi'
import { userApi }    from '../../../api/userApi'
import { Plus, Search, Filter, Eye, Pencil, Trash2 } from 'lucide-react'
import { formatDate, statusBadgeClass, statusLabel, progressColor } from '../../../utils/formatDate'
import ProjectFormModal from '../components/ProjectForm'

// Project type icons
const PROJECT_ICONS = ['🌐', '📱', '🏪', '⚙️', '🔧', '🖥️', '📊', '🎨', '🔬', '📦']

function getProjectIcon(name = '', index = 0) {
  // try to pick a smart icon based on name keywords
  const n = name.toLowerCase()
  if (n.includes('web') || n.includes('site'))    return '🌐'
  if (n.includes('mobile') || n.includes('app'))   return '📱'
  if (n.includes('shop') || n.includes('ecom'))   return '🏪'
  if (n.includes('api') || n.includes('backend'))  return '⚙️'
  if (n.includes('tool') || n.includes('internal'))return '🔧'
  if (n.includes('crm') || n.includes('erp'))     return '🖥️'
  if (n.includes('report') || n.includes('data'))  return '📊'
  if (n.includes('design') || n.includes('ui'))   return '🎨'
  if (n.includes('research') || n.includes('ml'))  return '🔬'
  return PROJECT_ICONS[index % PROJECT_ICONS.length]
}

const ICON_COLORS = ['#ede9fe','#dbeafe','#d1fae5','#fef3c7','#fee2e2','#e0f2fe','#fce7f3','#ecfdf5']
const ICON_TEXT   = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0284c7','#be185d','#047857']

const ALL_STATUSES = ['PLANNING','ACTIVE','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED','NOT_STARTED']

export default function ProjectListPage() {
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [page, setPage]           = useState(1)
  const pageSize = 10

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 30_000,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn:  () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const deleteMut = useMutation({
    mutationFn: (id) => projectApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['projects-list'] }),
  })

  const filtered = raw.filter(p => {
    const matchSearch = !search || p.projectName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleDelete(id, name) {
    if (window.confirm(`Delete project "${name}"?`)) deleteMut.mutate(id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Projects</h1>
          <p className="page-subheading">Manage and track all your projects</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus size={16}/> Add Project
          </button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="card" style={{ marginBottom: 14, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={14} className="search-icon"/>
            <input type="text" placeholder="Search projects..." className="form-input" style={{ paddingLeft: 34 }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/>
          </div>
          <button
            className={`btn btn-outline btn-sm${showFilter ? ' active' : ''}`}
            style={{ flexShrink: 0 }}
            onClick={() => setShowFilter(f => !f)}
          >
            <Filter size={14}/> Filter
          </button>
        </div>

        {/* Filter dropdown */}
        {showFilter && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
            <button
              className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              onClick={() => { setStatus(''); setPage(1) }}
            >All</button>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => { setStatus(s); setPage(1) }}
              >{statusLabel(s)}</button>
            ))}
          </div>
        )}
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
                    <th>Project Name</th>
                    <th>Manager</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={7} className="table-empty">No projects found</td></tr>
                    : paged.map((p, idx) => {
                        const pct = p.completionPercentage || 0
                        const icon = getProjectIcon(p.projectName, idx)
                        const bg   = ICON_COLORS[idx % ICON_COLORS.length]
                        const fg   = ICON_TEXT[idx % ICON_TEXT.length]
                        return (
                          <tr key={p.projectId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {/* Project icon box */}
                                <div style={{
                                  width: 36, height: 36, borderRadius: 8,
                                  background: bg, display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                                }}>
                                  {icon}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.projectName}</div>
                                  {p.clientName && <div className="td-muted">{p.clientName}</div>}
                                </div>
                              </div>
                            </td>
                            <td>
                              {p.managerName
                                ? (
                                  <div className="user-cell">
                                    <div className="avatar avatar-sm">{p.managerName[0]}</div>
                                    <span style={{ fontSize: '0.82rem' }}>{p.managerName}</span>
                                  </div>
                                ) : <span className="td-muted">—</span>
                              }
                            </td>
                            <td style={{ fontSize: '0.82rem' }}>{formatDate(p.startDate) || '—'}</td>
                            <td style={{ fontSize: '0.82rem' }}>{formatDate(p.endDate) || '—'}</td>
                            <td>
                              <span className={`badge ${statusBadgeClass(p.status)}`}>{statusLabel(p.status)}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 32 }}>{pct}%</span>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                  <div className={`progress-fill ${progressColor(pct)}`} style={{ width: `${pct}%` }}/>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button className="action-btn view"  onClick={() => navigate(`/projects/${p.projectId}`)} title="View"><Eye size={15}/></button>
                                <button className="action-btn edit"  onClick={() => { setEditing(p); setShowForm(true) }} title="Edit"><Pencil size={15}/></button>
                                <button className="action-btn delete" onClick={() => handleDelete(p.projectId, p.projectName)} title="Delete"><Trash2 size={15}/></button>
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
              <span>Showing {Math.min((page-1)*pageSize+1, total)} to {Math.min(page*pageSize, total)} of {total} entries</span>
              <div className="pag-controls">
                <button className="pag-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i+1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" onClick={() => setPage(p => p+1)} disabled={page >= pages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ProjectFormModal
          project={editing}
          users={users}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['projects-list'] }); setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
