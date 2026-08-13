import { X, Folder, Users, UserPlus, Trash2 } from 'lucide-react'
import { formatDate } from '../../../utils/formatDate'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { expenseApi } from '../../../api/expenseApi'
import { useState } from 'react'

export default function ProjectDetailsModal({ project, users = [], currentUser, onClose }) {
  const qc = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState({ userId: '', roleInProject: 'Team Member' })
  const [error, setError] = useState('')
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project-members', project?.projectId],
    queryFn: () => projectApi.getMembers(project.projectId).then(r => r.data?.data || r.data || []),
    enabled: !!project?.projectId,
    staleTime: 60_000,
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', project?.projectId],
    queryFn: () => expenseApi.getByProject(project.projectId).then(r => r.data?.data || r.data || []),
    enabled: !!project?.projectId,
  })

  const addMut = useMutation({
    mutationFn: (data) => projectApi.addMember(project.projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', project?.projectId] })
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      setShowAddForm(false)
      setNewMember({ userId: '', roleInProject: 'Team Member' })
      setError('')
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to add member')
  })

  const removeMut = useMutation({
    mutationFn: (userId) => projectApi.removeMember(project.projectId, userId),
    onSuccess: () => {
      setConfirmRemoveId(null)
      qc.invalidateQueries({ queryKey: ['project-members', project?.projectId] })
      qc.invalidateQueries({ queryKey: ['projects-list'] })
    },
    onError: () => {
      setConfirmRemoveId(null)
    }
  })

  if (!project) return null

  const isManagerOrAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.userId === project.managerId)

  const realSpentAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0) || project.spentAmount || 0
  const budget = project.budget || project.totalBudget || 0
  const realOverrun = budget > 0 && realSpentAmount > budget
  const exceededBy = realSpentAmount - budget

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>View Project Details</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Folder size={28} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{project.projectName}</h3>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Project ID</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{project.projectId}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px', marginBottom: 24, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Project Manager</span>
              <div style={{ fontWeight: 500 }}>{project.managerName || 'Not Assigned'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Team Members</span>
              <span style={{ fontWeight: 500 }}>{project.totalMembers || 0}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ fontWeight: 600 }}>{project.status?.replace(/_/g, ' ') || 'PLANNING'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Priority</span>
              <span style={{ fontWeight: 600 }}>{project.priority || 'MEDIUM'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Start Date</span>
              <span style={{ fontWeight: 500 }}>{formatDate(project.startDate) || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>End Date</span>
              <span style={{ fontWeight: 500 }}>{formatDate(project.endDate) || '—'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <span style={{ fontWeight: 600 }}>{(project.status === 'COMPLETED' || project.status === 'Completed') ? 100 : (project.completionPercentage || 0)}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Budget</span>
              <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(budget)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Spent</span>
              <span style={{ fontWeight: 600, color: realOverrun ? '#dc2626' : 'inherit' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(realSpentAmount)}</span>
            </div>

            {realOverrun && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gridColumn: '1 / -1', background: '#fee2e2', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <span style={{ color: '#991b1b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>⚠️ Budget Overrun</span>
                <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 700 }}>
                  Exceeded by {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(exceededBy)}
                </span>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Description</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {project.description || 'No description provided.'}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Team Members ({members.length})</div>
              {isManagerOrAdmin && !showAddForm && (
                <button type="button" onClick={() => setShowAddForm(true)} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserPlus size={14} /> Add Member
                </button>
              )}
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: 8 }}>{error}</div>}

            {showAddForm && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <select value={newMember.userId} onChange={e => setNewMember({ ...newMember, userId: e.target.value })} className="form-select" style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}>
                  <option value="">Select user...</option>
                  {users.filter(u => u.role === 'EMPLOYEE').map(u => (
                    <option 
                      key={u.userId} 
                      value={u.userId}
                      disabled={members.some(m => String(m.userId) === String(u.userId))}
                    >
                      {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                    </option>
                  ))}
                </select>
                <select value={newMember.roleInProject} onChange={e => setNewMember({ ...newMember, roleInProject: e.target.value })} className="form-select" style={{ width: 140, padding: '6px 10px', fontSize: '0.85rem' }}>
                  <option value="Team Member">Team Member</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="QA">QA</option>
                </select>
                <button 
                  type="button" 
                  disabled={!newMember.userId || addMut.isPending}
                  onClick={() => addMut.mutate({ ...newMember, userId: parseInt(newMember.userId) })} 
                  style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, padding: '0 16px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', opacity: (!newMember.userId || addMut.isPending) ? 0.7 : 1 }}
                >
                  {addMut.isPending ? 'Adding...' : 'Add'}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setError(''); }} style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0 12px', cursor: 'pointer' }}>
                  <X size={16} style={{ display: 'block' }} />
                </button>
              </div>
            )}

            {isLoading ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading members...</div>
            ) : members.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No members assigned to this project yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                {members.map(m => {
                  const isConfirming = confirmRemoveId === (m.memberId || m.userId)
                  return (
                    <div key={m.memberId || m.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: isConfirming ? '#fef2f2' : '#f8fafc', borderRadius: 8, border: isConfirming ? '1px solid #fecaca' : '1px solid #f1f5f9', position: 'relative', transition: 'all 0.2s ease' }}>
                      {m.profileImage && !isConfirming ? (
                        <img 
                          src={m.profileImage} 
                          alt={m.fullName} 
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                        />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isConfirming ? '#fee2e2' : '#e2e8f0', color: isConfirming ? '#dc2626' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, transition: 'all 0.2s ease' }}>
                          {m.fullName?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                      )}
                      {isConfirming ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}>Remove?</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => removeMut.mutate(m.userId)}
                              disabled={removeMut.isPending}
                              style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', opacity: removeMut.isPending ? 0.7 : 1 }}
                            >
                              {removeMut.isPending ? 'Removing…' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveId(null)}
                              style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer' }}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.fullName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.roleInProject?.replace(/_/g, ' ') || 'Team Member'}</div>
                          </div>
                          {isManagerOrAdmin && m.roleInProject !== 'Project Manager' && (
                            <button 
                              type="button"
                              onClick={() => setConfirmRemoveId(m.memberId || m.userId)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', opacity: 0.6 }}
                              onMouseOver={e => e.currentTarget.style.opacity = 1}
                              onMouseOut={e => e.currentTarget.style.opacity = 0.6}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-outline" onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
        </div>
      </div>
    </div>
  )
}
