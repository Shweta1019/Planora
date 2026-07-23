import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourceApi } from '../../../api/resourceApi'
import { userApi }     from '../../../api/userApi'
import { projectApi }  from '../../../api/projectApi'
import { Plus, Search, RotateCcw, Eye, Pencil, MoreVertical, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { initials, progressColor } from '../../../utils/formatDate'
import AllocateModal from '../components/AllocationForm'

// Map common roles → skill tags
const ROLE_SKILLS = {
  'PROJECT_MANAGER': ['Management', 'Planning', 'Leadership'],
  'ADMIN':           ['Administration', 'Management', 'Config'],
  'EMPLOYEE':        ['Development', 'Teamwork'],
  'FRONTEND':        ['React', 'JavaScript', 'UI/UX'],
  'BACKEND':         ['Java', 'Spring Boot', 'API'],
  'QA':              ['Testing', 'Selenium', 'Jira'],
  'DESIGNER':        ['Figma', 'UI Design', 'UX Research'],
  'DEVOPS':          ['AWS', 'Docker', 'CI/CD'],
  'ANALYST':         ['Analysis', 'Documentation', 'SQL'],
}

function getSkillsForUser(u) {
  const byRole = ROLE_SKILLS[u.role] || ROLE_SKILLS['EMPLOYEE']
  // parse from designation if available
  if (u.designation) {
    const d = u.designation.toUpperCase()
    if (d.includes('FRONTEND')) return ROLE_SKILLS['FRONTEND']
    if (d.includes('BACKEND'))  return ROLE_SKILLS['BACKEND']
    if (d.includes('QA'))       return ROLE_SKILLS['QA']
    if (d.includes('DESIGN'))   return ROLE_SKILLS['DESIGNER']
    if (d.includes('DEVOPS'))   return ROLE_SKILLS['DEVOPS']
    if (d.includes('ANALYST'))  return ROLE_SKILLS['ANALYST']
  }
  return byRole
}

const SKILL_COLORS = ['#ede9fe', '#dbeafe', '#d1fae5', '#fef3c7', '#fee2e2']
const SKILL_TEXT   = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626']

function SkillTag({ skill, idx }) {
  const bg   = SKILL_COLORS[idx % SKILL_COLORS.length]
  const text = SKILL_TEXT[idx % SKILL_TEXT.length]
  return (
    <span style={{ background: bg, color: text, borderRadius: 12, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {skill}
    </span>
  )
}

const TABS = ['All Resources', 'Team Allocation', 'Availability']

export default function ResourceAllocationPage() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState(0)
  const [search, setSearch] = useState('')
  const [roleF,  setRoleF]  = useState('')
  const [availF, setAvailF] = useState('')
  const [showForm, setForm] = useState(false)
  const [editing, setEdit]  = useState(null)
  const [page, setPage]     = useState(1)
  const pageSize = 8

  const { data: resources = [] } = useQuery({
    queryKey: ['resources-list'],
    queryFn:  () => resourceApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 30_000,
  })

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn:  () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  // Get allocation info for a user
  function getUserAllocation(userId) {
    const r = resources.filter(x => x.userId === userId)
    if (!r.length) return { pct: 0, projectNames: '', avail: 'FULLY_AVAILABLE' }
    const pct = Math.min(r.reduce((s, x) => s + (x.allocationPercentage || 0), 0), 100)
    const projectNames = r.map(x => x.projectName || '').filter(Boolean).join(', ')
    const avail = pct >= 100 ? 'FULLY_ALLOCATED' : pct > 0 ? 'PARTIALLY_AVAILABLE' : 'FULLY_AVAILABLE'
    return { pct, projectNames, avail }
  }

  // Stats
  const totalEmp  = users.length
  const available = users.filter(u => getUserAllocation(u.userId).avail === 'FULLY_AVAILABLE').length
  const allocated = users.filter(u => getUserAllocation(u.userId).avail === 'FULLY_ALLOCATED').length
  const partial   = users.filter(u => getUserAllocation(u.userId).avail === 'PARTIALLY_AVAILABLE').length
  const overAllocated = 0

  const STAT_CARDS = [
    { label: 'Total Employees',    value: totalEmp,      sub: 'All team members',       Icon: Users,          color: '#6366f1', bg: '#ede9fe' },
    { label: 'Available',          value: available,     sub: 'Available for allocation',Icon: CheckCircle2,   color: '#059669', bg: '#d1fae5' },
    { label: 'Allocated',          value: allocated,     sub: 'Currently allocated',     Icon: Users,          color: '#2563eb', bg: '#dbeafe' },
    { label: 'Partially Available',value: partial,       sub: 'Working on projects',     Icon: Clock,          color: '#d97706', bg: '#fef3c7' },
    { label: 'Over Allocated',     value: overAllocated, sub: 'Exceeding capacity',      Icon: AlertCircle,    color: '#dc2626', bg: '#fee2e2' },
  ]

  const filtered = users.filter(u => {
    const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`
    const matchS = !search || name.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchR = !roleF  || u.role === roleF
    const { avail } = getUserAllocation(u.userId)
    const matchA = !availF || avail === availF
    return matchS && matchR && matchA
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function availBadge(avail) {
    if (avail === 'FULLY_ALLOCATED')    return { bg: '#fee2e2', text: '#dc2626', label: 'Fully Allocated'     }
    if (avail === 'PARTIALLY_AVAILABLE') return { bg: '#fef3c7', text: '#d97706', label: 'Partially Available' }
    return { bg: '#d1fae5', text: '#059669', label: 'Fully Available' }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Resources</h1>
          <p className="page-subheading">Manage and allocate resources across projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setForm(true) }}>
          <Plus size={16}/> Allocate Resource
        </button>
      </div>

      {/* 5 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
        {STAT_CARDS.map(s => (
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
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search size={14} className="search-icon"/>
            <input type="text" placeholder="Search resources..." className="form-input" style={{ paddingLeft: 34 }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/>
          </div>
          <select className="form-select" style={{ width: 140 }} value={roleF} onChange={e => setRoleF(e.target.value)}>
            <option value="">All Roles</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select className="form-select" style={{ width: 180 }} value={availF} onChange={e => setAvailF(e.target.value)}>
            <option value="">All Availability</option>
            <option value="FULLY_ALLOCATED">Fully Allocated</option>
            <option value="PARTIALLY_AVAILABLE">Partially Available</option>
            <option value="FULLY_AVAILABLE">Fully Available</option>
          </select>
          {(search || roleF || availF) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setRoleF(''); setAvailF(''); setPage(1) }}>
              <RotateCcw size={13}/> Reset
            </button>
          )}
          <div style={{ flex: 1 }}/>
          <button className="btn btn-outline btn-sm"><RotateCcw size={13}/> Reset</button>
          <button className="btn btn-outline btn-sm">Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <div className="page-loader"><div className="spinner"/></div> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="table-checkbox"/></th>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Skills</th>
                    <th>Current Projects</th>
                    <th>Allocation</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={8} className="table-empty">No resources found</td></tr>
                    : paged.map(u => {
                        const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
                        const { pct, projectNames, avail } = getUserAllocation(u.userId)
                        const badge  = availBadge(avail)
                        const skills = getSkillsForUser(u)
                        return (
                          <tr key={u.userId}>
                            <td className="td-check"><input type="checkbox" className="table-checkbox"/></td>
                            <td>
                              <div className="user-cell">
                                <div className="avatar avatar-md">{initials(name)}</div>
                                <div>
                                  <div className="user-name">{name}</div>
                                  <div className="user-email">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {u.designation || u.role?.replace('_', ' ')}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                                {skills.slice(0, 3).map((s, i) => <SkillTag key={s} skill={s} idx={i}/>)}
                                {skills.length > 3 && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 12, padding: '2px 7px', fontWeight: 600 }}>
                                    +{skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 140 }}>
                              {projectNames || '—'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                  <div className={`progress-fill ${progressColor(pct)}`} style={{ width: `${pct}%` }}/>
                                </div>
                                <span style={{ fontSize: '0.78rem', minWidth: 32, fontWeight: 600 }}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                background: badge.bg, color: badge.text,
                                borderRadius: 12, padding: '3px 10px',
                                fontSize: '0.75rem', fontWeight: 600,
                              }}>
                                {badge.label}
                              </span>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button className="action-btn view" title="View"><Eye size={14}/></button>
                                <button className="action-btn edit" onClick={() => { setEdit(u); setForm(true) }} title="Edit"><Pencil size={14}/></button>
                                <button className="action-btn" title="More"><MoreVertical size={14}/></button>
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
              <span>Showing {Math.min((page-1)*pageSize+1, total)}–{Math.min(page*pageSize, total)} of {total} resources</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i+1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p+1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <AllocateModal
          resource={editing}
          users={users}
          projects={projects}
          onClose={() => { setForm(false); setEdit(null) }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['resources-list'] }); setForm(false); setEdit(null) }}
        />
      )}
    </div>
  )
}
