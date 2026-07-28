import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { X } from 'lucide-react'

export default function AddMemberModal({ projectId, projectName, allUsers, currentMembers, onClose, onSaved }) {
  const qc = useQueryClient()
  
  // Filter out users who are already in the project
  const availableUsers = allUsers.filter(
    u => !currentMembers.some(m => String(m.userId) === String(u.userId))
  )

  const [form, setForm] = useState({
    userId: '',
    roleInProject: 'Developer',
  })
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: (data) => projectApi.addMember(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] })
      onSaved()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to add member'),
  })

  function submit(e) {
    e.preventDefault()
    if (!form.userId) {
      setError('Please select a user')
      return
    }
    mut.mutate({
      userId: parseInt(form.userId, 10),
      roleInProject: form.roleInProject,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Member to {projectName}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div style={{ color:'var(--red)', fontSize:'0.85rem', marginBottom:12, padding:'8px 12px', background:'var(--red-dim)', borderRadius:6 }}>{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Select User *</label>
              <select 
                className="form-select" 
                value={form.userId} 
                onChange={e => { setForm({ ...form, userId: e.target.value }); setError('') }}
              >
                <option value="">-- Choose User --</option>
                {availableUsers.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Role in Project *</label>
              <select 
                className="form-select" 
                value={form.roleInProject} 
                onChange={e => setForm({ ...form, roleInProject: e.target.value })}
              >
                <option value="Developer">Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="QA Tester">QA Tester</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Project Coordinator">Project Coordinator</option>
                <option value="Content Writer">Content Writer</option>
              </select>
            </div>
            
            {availableUsers.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                All available users are already members of this project.
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending || availableUsers.length === 0}>
              {mut.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
