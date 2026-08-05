import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { X } from 'lucide-react'

export default function EditMemberModal({ projectId, member, onClose, onSaved }) {
  const qc = useQueryClient()
  
  const [form, setForm] = useState({
    roleInProject: member.roleInProject || 'Developer',
  })
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: (data) => projectApi.editMember(projectId, member.userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] })
      onSaved()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to update member'),
  })

  function submit(e) {
    e.preventDefault()
    mut.mutate({
      roleInProject: form.roleInProject,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Member - {member.fullName}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div style={{ color:'var(--red)', fontSize:'0.85rem', marginBottom:12, padding:'8px 12px', background:'var(--red-dim)', borderRadius:6 }}>{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Role in Project *</label>
              <select 
                className="form-select" 
                value={form.roleInProject} 
                onChange={e => setForm({ ...form, roleInProject: e.target.value })}
              >
                <option value="Team Lead">Team Lead</option>
                <option value="Senior Developer">Senior Developer</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Database Administrator (DBA)">Database Administrator (DBA)</option>
                <option value="IT Support Engineer">IT Support Engineer</option>
                <option value="Tester">Tester</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
