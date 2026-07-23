import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { userApi } from '../../../api/userApi'
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2 } from 'lucide-react'
import { formatDate, statusBadgeClass, statusLabel, initials } from '../../../utils/formatDate'
import UserFormModal from '../components/UserForm'

export default function UsersPage() {
  const qc = useQueryClient()
  const currentUserId = useAuthStore(s => s.user?.userId)
  const [search, setSearch]   = useState('')
  const [roleF,  setRoleF]    = useState('')
  const [showForm, setForm]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage]       = useState(1)
  const pageSize = 10

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn:  () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 30_000,
  })

  const deleteMut = useMutation({
    mutationFn: (id) => userApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['users-list'] }),
  })

  const filtered = raw.filter(u => {
    const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleF || u.role === roleF
    return matchSearch && matchRole
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function roleBadge(role) {
    const map = { ADMIN: 'badge-admin', PROJECT_MANAGER: 'badge-pm', MANAGER: 'badge-pm', EMPLOYEE: 'badge-employee' }
    return map[role] || 'badge-employee'
  }

  function handleDelete(id, name) {
    if (String(id) === String(currentUserId)) {
      alert('You cannot delete your own account.')
      return
    }
    if (window.confirm(`Delete user "${name}"? This action cannot be undone.`)) deleteMut.mutate(id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Users</h1>
          <p className="page-subheading">Manage team members and their roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(true) }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <div className="filter-row" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search by name or email..." className="form-input" style={{ paddingLeft: 34, width: 260 }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1) }}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
          {(search || roleF) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setRoleF(''); setPage(1) }}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={7} className="table-empty">No users found</td></tr>
                    : paged.map(u => {
                      const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
                      return (
                        <tr key={u.userId}>
                          <td>
                            <div className="user-cell">
                              <div className="avatar avatar-md">{initials(name)}</div>
                              <div>
                                <div className="user-name">{name}</div>
                                <div className="user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge ${roleBadge(u.role)}`}>{u.role?.replace('_', ' ')}</span></td>
                          <td>{u.department || '—'}</td>
                          <td>{u.designation || '—'}</td>
                          <td>
                            <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}`}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td>{formatDate(u.createdAt)}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="action-btn view" title="View"><Eye size={14} /></button>
                              <button className="action-btn edit" onClick={() => { setEditing(u); setForm(true) }} title="Edit"><Pencil size={14} /></button>
                              <button className="action-btn delete" onClick={() => handleDelete(u.userId, name)} title="Delete"><Trash2 size={14} /></button>
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
              <span>Showing {Math.min((page-1)*pageSize+1, total)}–{Math.min(page*pageSize, total)} of {total} users</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                {Array.from({ length: Math.min(pages,5) }, (_,i)=>i+1).map(n=>(
                  <button key={n} className={`pag-btn${page===n?' active':''}`} onClick={()=>setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page>=pages} onClick={() => setPage(p=>p+1)}>›</button>
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
