import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { useRole } from '../../../store/useRole'
import { userApi } from '../../../api/userApi'
import { projectApi } from '../../../api/projectApi'
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2, Users, UserCheck, Clock, UserX, MoreVertical, Folder } from 'lucide-react'
import { formatDate, initials } from '../../../utils/formatDate'
import UserFormModal from '../components/UserForm'
import AddMemberModal from '../components/AddMemberModal'

function AdminUsersView() {
  const qc = useQueryClient()
  const currentUserId = useAuthStore(s => s.user?.userId)
  const [search, setSearch] = useState('')
  const [roleF, setRoleF] = useState('')
  const [statusF, setStatusF] = useState('')
  const [deptF, setDeptF] = useState('')
  const [showForm, setForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 8

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 30_000,
  })

  const deleteMut = useMutation({
    mutationFn: (id) => userApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users-list'] }),
  })

  const filtered = raw.filter(u => {
    const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleF || u.role === roleF
    const matchStatus = !statusF || (u.status || 'ACTIVE') === statusF
    const matchDept = !deptF || u.department === deptF
    return matchSearch && matchRole && matchStatus && matchDept
  })

  const totalFiltered = filtered.length
  const pages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Stats
  const total = raw.length || 1 // Avoid divide by zero
  const activeCount = raw.filter(u => (u.status || 'ACTIVE') === 'ACTIVE').length
  const inactiveCount = raw.filter(u => u.status === 'INACTIVE').length
  const blockedCount = raw.filter(u => u.status === 'BLOCKED').length

  const activePct = Math.round((activeCount / total) * 100)
  const inactivePct = Math.round((inactiveCount / total) * 100)
  const blockedPct = Math.round((blockedCount / total) * 100)

  // Unique departments for filter
  const departments = [...new Set(raw.map(u => u.department).filter(Boolean))]

  function roleBadgeStyle(role) {
    switch (role) {
      case 'ADMIN': return { background: '#f3e8ff', color: '#a855f7' }
      case 'PROJECT_MANAGER': return { background: '#e0f2fe', color: '#3b82f6' }
      case 'EMPLOYEE': return { background: '#ccfbf1', color: '#06b6d4' }
      default: return { background: '#f1f5f9', color: '#64748b' }
    }
  }

  function statusBadgeStyle(status) {
    if (status === 'ACTIVE') return { background: '#dcfce7', color: '#22c55e' }
    if (status === 'INACTIVE') return { background: '#ffedd5', color: '#f97316' }
    if (status === 'BLOCKED') return { background: '#fee2e2', color: '#ef4444' }
    return { background: '#dcfce7', color: '#22c55e' }
  }

  function formatUserId(id) {
    const num = String(id).replace(/\D/g, '').slice(0, 4) || '1000'
    return `U-${num.padStart(4, '0')}`
  }

  function handleDelete(id, name) {
    if (String(id) === String(currentUserId)) {
      alert('You cannot delete your own account.')
      return
    }
    if (window.confirm(`Delete user "${name}"? This action cannot be undone.`)) deleteMut.mutate(id)
  }

  const resetFilters = () => {
    setSearch(''); setRoleF(''); setStatusF(''); setDeptF(''); setPage(1)
  }

  return (
    <div onClick={() => setOpenMenu(null)}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Users</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Users</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{raw.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer', marginTop: 'auto' }} onClick={resetFilters}>View all users</div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Users</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{activePct}% of total users</span>
            <div style={{ height: 4, flex: 1, background: '#f1f5f9', borderRadius: 2 }}>
              <div style={{ height: 4, width: `${activePct}%`, background: '#10b981', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#ffedd5', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Inactive Users</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inactiveCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{inactivePct}% of total users</span>
            <div style={{ height: 4, flex: 1, background: '#f1f5f9', borderRadius: 2 }}>
              <div style={{ height: 4, width: `${inactivePct}%`, background: '#f59e0b', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Blocked Users</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{blockedCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{blockedPct}% of total users</span>
            <div style={{ height: 4, flex: 1, background: '#f1f5f9', borderRadius: 2 }}>
              <div style={{ height: 4, width: `${blockedPct}%`, background: '#ef4444', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 400 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Role</div>
            <select className="form-select" style={{ height: 38 }} value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1) }}>
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Status</div>
            <select className="form-select" style={{ height: 38 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Department</div>
            <select className="form-select" style={{ height: 38 }} value={deptF} onChange={e => { setDeptF(e.target.value); setPage(1) }}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <button className="btn btn-outline" style={{ height: 38, whiteSpace: 'nowrap', color: '#7c3aed', borderColor: '#7c3aed' }} onClick={resetFilters}>
            <RotateCcw size={13} style={{ marginRight: 6 }} /> Clear Filters
          </button>
          <button className="btn btn-primary" style={{ height: 38 }} onClick={() => { setEditing(null); setForm(true) }}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap" style={{ overflow: 'visible' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined On</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={8} className="table-empty">No users found</td></tr>
                    : paged.map((u) => {
                      const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
                      const isMenuOpen = openMenu === u.userId
                      return (
                        <tr key={u.userId}>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatUserId(u.userId)}</td>
                          <td>
                            <div className="user-cell">
                              <div className="avatar avatar-md">{initials(name)}</div>
                              <div className="user-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{name}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, ...roleBadgeStyle(u.role) }}>
                              {u.role?.replace('_', ' ') || 'Employee'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, ...statusBadgeStyle(u.status || 'ACTIVE') }}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{formatDate(u.createdAt) || '—'}</td>
                          <td>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#3b82f6' }}
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : u.userId) }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: 'absolute', right: 36, top: 0, zIndex: 50,
                                    background: '#fff', borderRadius: 8,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                    border: '1px solid #f0f0f0',
                                    minWidth: 120, overflow: 'hidden',
                                  }}
                                >
                                  <button onClick={() => { setEditing(u); setForm(true); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    Edit
                                  </button>
                                  <button onClick={() => { handleDelete(u.userId, name); setOpenMenu(null) }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' }}>
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
              <span>Showing {totalFiltered === 0 ? 0 : Math.min((page - 1) * pageSize + 1, totalFiltered)} to {Math.min(page * pageSize, totalFiltered)} of {totalFiltered} users</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <UserFormModal
          user={editing}
          onClose={() => { setForm(false); setEditing(null) }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['users-list'] }); setForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function ManagerTeamMembersView() {
  const { user } = useAuthStore()

  // Filters
  const [search, setSearch] = useState('')
  const [roleF, setRoleF] = useState('')
  const [statusF, setStatusF] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const qc = useQueryClient()
  const [showAddMember, setShowAddMember] = useState(false)

  // Projects
  const { data: rawProjects = [], isLoading: pLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })
  
  const myProjects = useMemo(() => rawProjects.filter(p => p.managerName === user?.fullName), [rawProjects, user])
  
  const [selectedProjectId, setSelectedProjectId] = useState('')
  
  useEffect(() => {
    if (myProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(myProjects[0].projectId)
    }
  }, [myProjects, selectedProjectId])

  // Members
  const { data: rawMembers = [], isLoading: mLoading } = useQuery({
    queryKey: ['project-members', selectedProjectId],
    queryFn: () => projectApi.getMembers(selectedProjectId).then(r => r.data?.data || r.data || []),
    enabled: !!selectedProjectId,
    staleTime: 60_000,
  })

  // Users (for department info)
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000
  })

  // Combine member + user info
  const members = useMemo(() => {
    return rawMembers.map(m => {
      const u = allUsers.find(user => String(user.userId) === String(m.userId)) || {}
      return {
        ...m,
        department: u.department,
      }
    })
  }, [rawMembers, allUsers])

  const filtered = members.filter(m => {
    const matchSearch = !search || m.fullName?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleF || m.roleInProject === roleF
    const matchStatus = !statusF || (m.status === 'INACTIVE' || m.status === 'BLOCKED' ? 'INACTIVE' : 'ACTIVE') === statusF
    return matchSearch && matchRole && matchStatus
  })

  const totalFiltered = filtered.length
  const pages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const total = members.length || 1
  const activeCount = members.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length
  const inactiveCount = members.filter(m => m.status === 'INACTIVE' || m.status === 'BLOCKED').length
  const activePct = Math.round((activeCount / total) * 100)
  const inactivePct = Math.round((inactiveCount / total) * 100)

  // Unique roles for filter
  const roles = [...new Set(members.map(m => m.roleInProject).filter(Boolean))]

  const resetFilters = () => {
    setSearch(''); setRoleF(''); setStatusF(''); setPage(1)
  }

  // badge style for role
  function roleBadge(roleStr) {
    if(!roleStr) return { background: '#f1f5f9', color: '#64748b' }
    const r = roleStr.toLowerCase()
    if (r.includes('developer')) return { background: '#e0f2fe', color: '#3b82f6' }
    if (r.includes('designer')) return { background: '#f3e8ff', color: '#a855f7' }
    if (r.includes('tester') || r.includes('qa')) return { background: '#f5f3ff', color: '#8b5cf6' }
    if (r.includes('analyst')) return { background: '#fef3c7', color: '#d97706' }
    if (r.includes('writer')) return { background: '#ccfbf1', color: '#0d9488' }
    if (r.includes('coordinator')) return { background: '#ffedd5', color: '#ea580c' }
    return { background: '#e0e7ff', color: '#4f46e5' }
  }

  function statusBadge(status) {
    if (status === 'INACTIVE' || status === 'BLOCKED') return { background: '#fee2e2', color: '#ef4444', text: 'Inactive' }
    return { background: '#dcfce7', color: '#22c55e', text: 'Active' }
  }

  const [openMenu, setOpenMenu] = useState(null)

  const removeMut = useMutation({
    mutationFn: (userId) => projectApi.removeMember(selectedProjectId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-members', selectedProjectId] }),
  })

  return (
    <div onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Team Members</h1>
        </div>
        {user?.role === 'PROJECT_MANAGER' && (
          <button className="btn btn-primary" onClick={() => setShowAddMember(true)} disabled={!selectedProjectId}>
            <Plus size={15} /> Add Member
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Folder size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Project</div>
              <select 
                value={selectedProjectId} 
                onChange={e => { setSelectedProjectId(e.target.value); setPage(1); }} 
                className="form-select"
                style={{ 
                  height: 38, 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  width: '100%', 
                  cursor: 'pointer', 
                  paddingRight: 24,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {myProjects.length === 0 && <option value="">No Projects</option>}
                {myProjects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Members</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{members.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'auto' }}>View all members</div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Members</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activePct}% of total</span>
            <div style={{ height: 4, flex: 1, background: '#f1f5f9', borderRadius: 2 }}>
              <div style={{ height: 4, width: `${activePct}%`, background: '#10b981', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Inactive Members</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inactiveCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inactivePct}% of total</span>
            <div style={{ height: 4, flex: 1, background: '#f1f5f9', borderRadius: 2 }}>
              <div style={{ height: 4, width: `${inactivePct}%`, background: '#ef4444', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 400 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Role</div>
            <select className="form-select" style={{ height: 38 }} value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1) }}>
              <option value="">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>Status</div>
            <select className="form-select" style={{ height: 38 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div style={{ flex: 2, position: 'relative' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'transparent' }}>Search</div>
            <Search size={16} style={{ position: 'absolute', left: 12, bottom: 11, color: '#94a3b8' }} />
            <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} style={{ height: 38, paddingLeft: 36 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <button className="btn" style={{ height: 38, whiteSpace: 'nowrap', color: '#5b21b6', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 6, padding: '0 16px', display: 'flex', alignItems: 'center' }} onClick={resetFilters}>
            <RotateCcw size={14} style={{ marginRight: 6 }} /> Clear Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {(pLoading || mLoading) ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap" style={{ overflow: 'visible' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined On</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={6} className="table-empty">No members found</td></tr>
                    : paged.map((m) => {
                      const isMenuOpen = openMenu === m.memberId
                      const st = statusBadge(m.status)
                      return (
                        <tr key={m.memberId}>
                          <td>
                            <div className="user-cell">
                              <div className="avatar avatar-md">{initials(m.fullName)}</div>
                              <div>
                                <div className="user-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, ...roleBadge(m.roleInProject) }}>
                              {m.roleInProject || 'Team Member'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{m.department || '—'}</td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: st.background, color: st.color }}>
                              {st.text}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{formatDate(m.assignedDate) || '—'}</td>
                          <td>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5b21b6' }}
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : m.memberId) }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: 'absolute', right: 36, top: 0, zIndex: 50,
                                    background: '#fff', borderRadius: 8,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                    border: '1px solid #f0f0f0',
                                    minWidth: 120, overflow: 'hidden',
                                  }}
                                >
                                  <button onClick={() => { 
                                    if(window.confirm(`Remove ${m.fullName} from this project?`)) {
                                      removeMut.mutate(m.userId)
                                    }
                                    setOpenMenu(null) 
                                  }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' }}>
                                    Remove Member
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
              <span>Showing {totalFiltered === 0 ? 0 : Math.min((page - 1) * pageSize + 1, totalFiltered)} to {Math.min(page * pageSize, totalFiltered)} of {totalFiltered} members</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} style={page === n ? { background: '#5b21b6', borderColor: '#5b21b6', color: '#fff' } : {}} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showAddMember && selectedProjectId && (
        <AddMemberModal
          projectId={selectedProjectId}
          projectName={myProjects.find(p => String(p.projectId) === String(selectedProjectId))?.projectName}
          allUsers={allUsers}
          currentMembers={members}
          onClose={() => setShowAddMember(false)}
          onSaved={() => setShowAddMember(false)}
        />
      )}
    </div>
  )
}

export default function UsersPage() {
  const { isAdmin, isPM } = useRole()
  
  if (isAdmin) {
    return <AdminUsersView />
  }
  
  if (isPM) {
    return <ManagerTeamMembersView />
  }

  return (
    <div className="page-header">
      <h1 className="page-heading">Access Denied</h1>
    </div>
  )
}
