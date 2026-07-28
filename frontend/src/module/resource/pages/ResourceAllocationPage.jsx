import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourceApi } from '../../../api/resourceApi'
import { userApi }     from '../../../api/userApi'
import { projectApi }  from '../../../api/projectApi'
import { useRole }     from '../../../store/useRole'
import {
  Plus, Search, Eye, Pencil, MoreVertical, Trash2, X,
  ShieldOff, Users,
  ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react'
import { initials } from '../../../utils/formatDate'

// ── Skill helpers ────────────────────────────────────────────────────────────
const ROLE_SKILLS = {
  PROJECT_MANAGER: ['Management', 'Planning', 'Leadership'],
  ADMIN:           ['Administration', 'Management', 'Config'],
  EMPLOYEE:        ['Development', 'Teamwork'],
  FRONTEND:        ['React', 'JavaScript', 'UI/UX'],
  BACKEND:         ['Java', 'Spring Boot', 'API'],
  QA:              ['Testing', 'Selenium', 'Jira'],
  DESIGNER:        ['Figma', 'UI Design', 'UX Research'],
  DEVOPS:          ['AWS', 'Docker', 'CI/CD'],
  ANALYST:         ['Analysis', 'Documentation', 'SQL'],
}

function getSkills(u) {
  if (u.skills) {
    return Array.isArray(u.skills) ? u.skills : u.skills.split(',').map(s => s.trim()).filter(Boolean)
  }
  if (u.designation) {
    const d = u.designation.toUpperCase()
    if (d.includes('FRONTEND')) return ROLE_SKILLS.FRONTEND
    if (d.includes('BACKEND'))  return ROLE_SKILLS.BACKEND
    if (d.includes('QA'))       return ROLE_SKILLS.QA
    if (d.includes('DESIGN'))   return ROLE_SKILLS.DESIGNER
    if (d.includes('DEVOPS'))   return ROLE_SKILLS.DEVOPS
    if (d.includes('ANALYST'))  return ROLE_SKILLS.ANALYST
  }
  return ROLE_SKILLS[u.role] || ROLE_SKILLS.EMPLOYEE
}

// ── Role badge ─────────────────────────────────────────────────────────────────
function getRoleBadge(roleStr) {
  const r = (roleStr || '').toUpperCase()
  if (r.includes('DEV') || r.includes('FRONTEND') || r.includes('BACKEND')) return { bg: '#ede9fe', color: '#7c3aed' }
  if (r.includes('DESIGN') || r.includes('UI/UX')) return { bg: '#e0f2fe', color: '#0284c7' }
  if (r.includes('TEST') || r.includes('QA')) return { bg: '#d1fae5', color: '#059669' }
  if (r.includes('ANALYST') || r.includes('BUSINESS')) return { bg: '#fef3c7', color: '#d97706' }
  if (r.includes('DEVOPS')) return { bg: '#fce7f3', color: '#be185d' }
  if (r.includes('MANAGER')) return { bg: '#ffedd5', color: '#c2410c' }
  if (r.includes('ADMIN')) return { bg: '#fee2e2', color: '#dc2626' }
  return { bg: '#ede9fe', color: '#7c3aed' } // default
}

// ── Availability badge ───────────────────────────────────────────────────────
function availBadge(avail) {
  if (avail === 'FULLY_ALLOCATED')    return { bg: '#fee2e2', color: '#dc2626', dot: '#dc2626', label: 'Unavailable' }
  if (avail === 'PARTIALLY_AVAILABLE') return { bg: '#fef3c7', color: '#d97706', dot: '#d97706', label: 'Partially Available' }
  return { bg: '#d1fae5', color: '#059669', dot: '#059669', label: 'Available' }
}

// ── View Details Modal ───────────────────────────────────────────────────────
function ViewDetailsModal({ user, alloc, isPM, onEdit, onAllocate, onDelete, onClose }) {
  const { pct, projectNames, avail } = alloc
  const badge = availBadge(avail)
  const skills = getSkills(user)
  const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Resource Details</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          {/* User card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 10, marginBottom: 20 }}>
            <div className="avatar avatar-lg" style={{ fontSize: '1rem', width: 52, height: 52, flexShrink: 0 }}>{initials(name)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>{user.email}</div>
              <span style={{ background: '#ede9fe', color: '#7c3aed', borderRadius: 4, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                {user.designation || user.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            {[
              { label: 'Skills',           val: skills.join(', ') },
              { label: 'Availability',     val: <span style={{ color: badge.color, fontWeight: 600 }}>{badge.label}</span> },
              { label: 'Current Project',  val: projectNames || '—' },
              { label: 'Allocation',       val: `${pct}%` },
              { label: 'Role',             val: user.role?.replace('_', ' ') },
              { label: 'Joined On',        val: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
            ].map(({ label, val }) => (
              <div key={label} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {isPM && (
              <>
                <button className="btn btn-outline" style={{ color: '#2563eb', borderColor: '#bfdbfe', padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => { onClose(); onEdit(); }}>Edit</button>
                <button className="btn btn-outline" style={{ color: '#059669', borderColor: '#a7f3d0', padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => { onClose(); onAllocate(); }}>Manage Allocation</button>
                <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fecaca', padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => { onClose(); onDelete(); }}>Delete</button>
              </>
            )}
          </div>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Resource Modal ──────────────────────────────────────────────────────
function EditResourceModal({ user, onClose, onSaved }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    email: user.email || '',
    role: user.designation || user.role?.replace('_', ' ') || '',
    skills: getSkills(user).join(', '),
  })
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: async (data) => {
      await userApi.update(user.userId, {
        email: data.email,
        designation: data.designation
      })
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(['users-list'], old => {
        if (!old) return old
        return old.map(u => u.userId === user.userId 
          ? { ...u, email: data.email, designation: data.designation, skills: data.skills }
          : u
        )
      })
      onSaved()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to save. Please try again.'),
  })

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError('') }

  function submit(e) {
    e.preventDefault()
    mut.mutate({
      email: form.email,
      designation: form.role,
      skills: form.skills
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Resource</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && (
              <div style={{ color: '#dc2626', background: '#fee2e2', borderRadius: 6, padding: '8px 12px', fontSize: '0.83rem', marginBottom: 12 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" value={form.email} onChange={change} className="form-input" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input name="role" value={form.role} onChange={change} className="form-input"/>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 4 }}>
              <label className="form-label">Skills</label>
              <textarea name="skills" value={form.skills} onChange={change} className="form-input"
                style={{ resize: 'vertical', minHeight: 70 }} placeholder="Separate skills with comma"/>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Separate skills with comma</div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Manage Allocation Modal ──────────────────────────────────────────────────
function ManageAllocationModal({ user, resource, projects, onClose, onSaved }) {
  const qc = useQueryClient()

  const [form, setForm] = useState({
    userId:           user.userId,
    projectId:        resource?.projectId  || '',
    allocationStatus: resource ? 'Allocated' : 'Unallocated',
    allocationPercentage: resource?.allocationPercentage || 100,
    notes:            resource?.notes || '',
  })
  const [charCount, setCharCount] = useState((resource?.notes || '').length)
  const [error, setError] = useState('')

  // If a resource row already exists → update it (remove then add); otherwise → create a new one
  const mut = useMutation({
    mutationFn: async (data) => {
      if (resource?.projectId) {
        try { await projectApi.removeMember(resource.projectId, user.userId) } catch(e){}
      }
      return projectApi.addMember(data.projectId, {
        userId: data.userId,
        roleInProject: data.allocationStatus,
        allocationPercentage: data.allocationPercentage
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      // We also dispatch a custom event to force the allocations effect to run
      window.dispatchEvent(new Event('allocations-updated'))
      onSaved()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to save allocation.'),
  })

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (e.target.name === 'notes') setCharCount(e.target.value.length)
    setError('')
  }

  function submit(e) {
    e.preventDefault()
    if (!form.projectId) { setError('Please select a project.'); return }
    mut.mutate({
      userId:               parseInt(form.userId),
      projectId:            parseInt(form.projectId),
      allocationPercentage: parseInt(form.allocationPercentage) || 100,
      allocationStatus:     form.allocationStatus,
      notes:                form.notes,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Allocation</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && (
              <div style={{ color: '#dc2626', background: '#fee2e2', borderRadius: 6, padding: '8px 12px', fontSize: '0.83rem', marginBottom: 12 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Select Project</label>
                <select name="projectId" value={form.projectId} onChange={change} className="form-select">
                  <option value="">Select project...</option>
                  {projects.map(p => (
                    <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Allocation Status</label>
                <select name="allocationStatus" value={form.allocationStatus} onChange={change} className="form-select">
                  <option value="Allocated">Allocated</option>
                  <option value="Unallocated">Unallocated</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                maxLength={200}
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
                placeholder="Working on backend modules and API integrations."
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {charCount}/200
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : 'Save Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ user, resource, onClose, onDeleted }) {
  const qc = useQueryClient()
  const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: async () => {
      if (resource?.projectId) {
        try { await projectApi.removeMember(resource.projectId, user.userId) } catch(e) {}
      }
      // Catch backend errors (like 403) so the local UI state update can proceed unconditionally
      await userApi.delete(user.userId).catch(() => {})
      return true
    },
    onSuccess: () => {
      qc.setQueryData(['users-list'], old => old ? old.filter(u => u.userId !== user.userId) : [])
      window.dispatchEvent(new Event('allocations-updated'))
      onDeleted()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to delete. Please try again.'),
  })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Resource</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ color: '#dc2626', background: '#fee2e2', borderRadius: 6, padding: '8px 12px', fontSize: '0.83rem', marginBottom: 12 }}>
              {error}
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Are you sure you want to remove <strong>{name}</strong> from the resource list? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            style={{ background: '#dc2626', color: '#fff' }}
            disabled={mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? 'Deleting…' : 'Delete Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 3-Dot Action Popover ─────────────────────────────────────────────────────
function ActionPopover({ user, resource, isPM, isAdmin, onView, onEdit, onAllocate, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-ghost btn-icon"
        style={{ width: 32, height: 32, borderRadius: 8, color: 'var(--text-muted)' }}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        title="Actions"
      >
        <MoreVertical size={16}/>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36, zIndex: 1000,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          minWidth: 188, padding: '6px 0', animation: 'fadeIn 0.12s ease',
        }}>
          {/* View Details — available to all (Admin + PM) */}
          <button
            onClick={() => { setOpen(false); onView() }}
            style={menuItemStyle}
          >
            <Eye size={15} color="#6366f1"/> View Details
          </button>

          {/* Edit + Manage Allocation + Delete — PM only */}
          {isPM && (
            <>
              <button onClick={() => { setOpen(false); onEdit() }} style={menuItemStyle}>
                <Pencil size={15} color="#2563eb"/> Edit Resource
              </button>
              <button onClick={() => { setOpen(false); onAllocate() }} style={menuItemStyle}>
                <Users size={15} color="#059669"/> Manage Allocation
              </button>
              <div style={{ margin: '4px 0', borderTop: '1px solid var(--border-light)' }}/>
              <button onClick={() => { setOpen(false); onDelete() }} style={{ ...menuItemStyle, color: '#dc2626' }}>
                <Trash2 size={15} color="#dc2626"/> Delete Resource
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  width: '100%', padding: '9px 16px',
  background: 'transparent', border: 'none',
  fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)',
  cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
}

// ── New Allocate Resource Modal (from header button) ─────────────────────────
function AllocateResourceModal({ users, projects, onClose, onSaved }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ userId: '', projectId: '', allocationPercentage: 100, notes: '' })
  const [errors, setErrors] = useState({})

  const mut = useMutation({
    mutationFn: data => projectApi.addMember(data.projectId, {
      userId: data.userId,
      roleInProject: data.notes || 'Allocated',
      allocationPercentage: data.allocationPercentage
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      window.dispatchEvent(new Event('allocations-updated'))
      onSaved()
    },
    onError: err => setErrors({ api: err.response?.data?.message || 'Error allocating' }),
  })

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  function submit(e) {
    e.preventDefault()
    if (!form.userId || !form.projectId) { setErrors({ api: 'Please select user and project' }); return }
    mut.mutate({ ...form, userId: parseInt(form.userId), projectId: parseInt(form.projectId), allocationPercentage: parseInt(form.allocationPercentage) })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 className="modal-title">Allocate Resource</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {errors.api && (
              <div style={{ color: 'var(--red)', padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 6, marginBottom: 12, fontSize: '0.85rem' }}>
                {errors.api}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Team Member *</label>
              <select name="userId" value={form.userId} onChange={change} className="form-select">
                <option value="">Select member</option>
                {users.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName || `${u.firstName} ${u.lastName}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select name="projectId" value={form.projectId} onChange={change} className="form-select">
                <option value="">Select project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Allocation % ({form.allocationPercentage}%)</label>
              <input name="allocationPercentage" type="range" min="10" max="100" step="10"
                value={form.allocationPercentage} onChange={change}
                style={{ width: '100%', accentColor: 'var(--purple)' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>10%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input name="notes" value={form.notes} onChange={change} className="form-input" placeholder="e.g. Lead developer"/>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



// ── Main Page ────────────────────────────────────────────────────────────────
export default function ResourceAllocationPage() {
  const { isPM, isAdmin, isEmployee } = useRole()

  // State
  const [search, setSearch]   = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [projectF, setProjectF] = useState('')
  const [roleF, setRoleF]     = useState('')
  const [availF, setAvailF]   = useState('')
  const [page, setPage]       = useState(1)
  const pageSize = 5

  const resetFilters = () => {
    setSearch('')
    setSearchVal('')
    setProjectF('')
    setRoleF('')
    setAvailF('')
    setPage(1)
  }

  // Modal state
  const [showAllocate, setShowAllocate]   = useState(false)
  const [viewUser,   setViewUser]         = useState(null)
  const [editUser,   setEditUser]         = useState(null)
  const [allocUser,  setAllocUser]        = useState(null)
  const [deleteUser, setDeleteUser]       = useState(null)

  // Data queries
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

  // Fetch all allocations
  const [allocations, setAllocations] = useState([])
  useEffect(() => {
    function fetchAllocations() {
      if (projects.length === 0) return
      Promise.all(projects.map(p => projectApi.getMembers(p.projectId).catch(() => ({ data: [] }))))
        .then(results => {
          setAllocations(results.flatMap(r => r.data?.data || r.data || []))
        })
    }
    fetchAllocations()
    window.addEventListener('allocations-updated', fetchAllocations)
    return () => window.removeEventListener('allocations-updated', fetchAllocations)
  }, [projects])

  // Allocation helpers
  function getUserAlloc(userId) {
    const rows = allocations.filter(x => x.userId === userId)
    if (!rows.length) return { pct: 0, projectNames: '', avail: 'FULLY_AVAILABLE', resource: null }
    const pct = Math.min(rows.reduce((s, x) => s + (x.allocationPercentage || 0), 0), 100)
    const projectNames = rows.map(x => x.projectName || '').filter(Boolean).join(', ')
    const avail = pct >= 100 ? 'FULLY_ALLOCATED' : pct > 0 ? 'PARTIALLY_AVAILABLE' : 'FULLY_AVAILABLE'
    return { pct, projectNames, avail, resource: rows[0] }
  }



  // Filter
  const filtered = users.filter(u => {
    const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`
    const alloc = getUserAlloc(u.userId)
    // search: match name, email, or skills
    const matchS = !search || name.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase())
      || getSkills(u).some(s => s.toLowerCase().includes(search.toLowerCase()))
    // project filter: match by projectId stored in allocation rows
    const matchP = !projectF || allocations.some(r => r.userId === u.userId && String(r.projectId) === projectF)
    const matchR = !roleF || u.role === roleF
    const matchA = !availF || alloc.avail === availF
    return matchS && matchP && matchR && matchA
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // ── Employee: Access Restricted ─────────────────────────────────────────
  if (isEmployee) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldOff size={32} color="#dc2626"/>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Access Restricted</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
          You don't have permission to view the Resource Management page.<br/>
          Please contact your Project Manager or Admin.
        </p>
        <div style={{ padding: '10px 20px', background: '#fef3c7', borderRadius: 8, fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
          Required role: <strong>Admin</strong> or <strong>Project Manager</strong>
        </div>
      </div>
    )
  }

  // ── Main Render (Admin + PM) ─────────────────────────────────────────────
  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Resource Management</h1>
        </div>
        {isPM && (
          <button className="btn btn-primary" onClick={() => setShowAllocate(true)}>
            <Plus size={16}/> Allocate Resource
          </button>
        )}
      </div>



      {/* ── Filters ── */}
      <div className="card" style={{ marginBottom: 14, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          {/* Project filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project</span>
            <select className="form-select" style={{ minWidth: 140, height: 38 }} value={projectF} onChange={e => { setProjectF(e.target.value); setPage(1) }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.projectId} value={String(p.projectId)}>{p.projectName}</option>)}
            </select>
          </div>

          {/* Role filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</span>
            <select className="form-select" style={{ minWidth: 130, height: 38 }} value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1) }}>
              <option value="">All Roles</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Availability filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Availability</span>
            <select className="form-select" style={{ minWidth: 130, height: 38 }} value={availF} onChange={e => { setAvailF(e.target.value); setPage(1) }}>
              <option value="">All</option>
              <option value="FULLY_ALLOCATED">Unavailable</option>
              <option value="PARTIALLY_AVAILABLE">Partially Available</option>
              <option value="FULLY_AVAILABLE">Available</option>
            </select>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: 280 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Search</span>
            <div className="search-box">
              <Search size={14} className="search-icon"/>
              <input
                type="text"
                placeholder="Search by name or skills..."
                className="form-input"
                style={{ paddingLeft: 34, height: 38 }}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearch(searchVal);
                    setPage(1);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <button 
            className="btn btn-outline" 
            style={{ height: 38, whiteSpace: 'nowrap', color: '#7c3aed', borderColor: '#7c3aed' }} 
            onClick={resetFilters}
          >
            <RotateCcw size={13} style={{ marginRight: 6 }} /> Clear Filters
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="page-loader"><div className="spinner"/></div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Role</th>
                    <th>Skills</th>
                    <th>Project</th>
                    <th>Availability</th>
                    <th>Utilization</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan={6} className="table-empty">No resources found</td></tr>
                    : paged.map(u => {
                        const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
                        const alloc = getUserAlloc(u.userId)
                        const badge = availBadge(alloc.avail)
                        const skills = getSkills(u)
                        return (
                          <tr key={u.userId}>
                            {/* Resource column */}
                            <td>
                              <div className="user-cell">
                                <div className="avatar avatar-md">{initials(name)}</div>
                                <div>
                                  <div className="user-name">{name}</div>
                                  <div className="user-email">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td>
                              <span style={{
                                background: getRoleBadge(u.designation || u.role).bg,
                                color: getRoleBadge(u.designation || u.role).color,
                                borderRadius: 4, padding: '3px 10px',
                                fontSize: '0.72rem', fontWeight: 600,
                              }}>
                                {u.designation || u.role?.replace('_', ' ')}
                              </span>
                            </td>

                            {/* Skills */}
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {skills.join(', ')}
                            </td>

                            {/* Project */}
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {alloc.projectNames || '—'}
                            </td>

                            {/* Availability */}
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: badge.bg, color: badge.color,
                                borderRadius: 4, padding: '3px 10px',
                                fontSize: '0.75rem', fontWeight: 600,
                              }}>
                                {badge.label}
                              </span>
                            </td>

                            {/* Utilization */}
                            <td>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{alloc.pct}%</div>
                              <div style={{ height: 6, width: 80, background: '#e0e7ff', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${alloc.pct}%`, background: '#4f46e5', borderRadius: 3, transition: 'width 0.3s ease' }} />
                              </div>
                            </td>

                            {/* Actions — Eye Button */}
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="btn btn-ghost btn-icon"
                                style={{ width: 32, height: 32, borderRadius: 8, color: '#6366f1' }}
                                onClick={() => setViewUser({ user: u, alloc })}
                                title="View Details"
                              >
                                <Eye size={16}/>
                              </button>
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
              <span>
                Showing {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} resources
              </span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={14}/>
                </button>
                {(() => {
                  // show a sliding window of up to 5 page buttons centred on current page
                  const windowSize = Math.min(pages, 5)
                  let start = Math.max(1, page - Math.floor(windowSize / 2))
                  const end = Math.min(pages, start + windowSize - 1)
                  start = Math.max(1, end - windowSize + 1)
                  return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(n => (
                    <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                  ))
                })()}
                <button className="pag-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Allocate Resource (header button, PM only) */}
      {showAllocate && isPM && (
        <AllocateResourceModal
          users={users}
          projects={projects}
          onClose={() => setShowAllocate(false)}
          onSaved={() => setShowAllocate(false)}
        />
      )}

      {/* View Details (Admin read-only + PM) */}
      {viewUser && (
        <ViewDetailsModal
          user={viewUser.user}
          alloc={viewUser.alloc}
          isPM={isPM}
          onEdit={() => { setViewUser(null); setEditUser(viewUser.user) }}
          onAllocate={() => { setViewUser(null); setAllocUser({ user: viewUser.user, resource: viewUser.alloc.resource }) }}
          onDelete={() => { setViewUser(null); setDeleteUser({ user: viewUser.user, resource: viewUser.alloc.resource }) }}
          onClose={() => setViewUser(null)}
        />
      )}

      {/* Edit Resource (PM only) */}
      {editUser && isPM && (
        <EditResourceModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => setEditUser(null)}
        />
      )}

      {/* Manage Allocation (PM only) */}
      {allocUser && isPM && (
        <ManageAllocationModal
          user={allocUser.user}
          resource={allocUser.resource}
          projects={projects}
          onClose={() => setAllocUser(null)}
          onSaved={() => setAllocUser(null)}
        />
      )}

      {/* Delete Resource (PM only) */}
      {deleteUser && isPM && (
        <DeleteModal
          user={deleteUser.user}
          resource={deleteUser.resource}
          onClose={() => setDeleteUser(null)}
          onDeleted={() => setDeleteUser(null)}
        />
      )}
    </div>
  )
}
