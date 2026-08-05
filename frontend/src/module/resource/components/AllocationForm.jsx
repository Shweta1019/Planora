import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { resourceApi } from '../../../api/resourceApi'
import { X } from 'lucide-react'

export default function AllocateModal({ resource, users=[], projects=[], onClose, onSaved }) {
  const isEdit = !!resource
  const [form, setForm] = useState({
    userId:    resource?.userId    || '',
    projectId: resource?.projectId || '',
    allocationPercentage: resource?.allocationPercentage || 100,
    role:      resource?.role      || '',
    notes:     resource?.notes     || '',
  })
  const [errors, setErrors] = useState({})

  const mut = useMutation({
    mutationFn: (data) => isEdit ? resourceApi.update(resource.resourceId, data) : resourceApi.allocate(data),
    onSuccess: onSaved,
    onError: err => setErrors({ api: err.response?.data?.message || 'Error allocating' }),
  })

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.userId || !form.projectId) {
      setErrors({ api: 'Please select user and project' }); return
    }
    mut.mutate({
      ...form,
      userId:    parseInt(form.userId),
      projectId: parseInt(form.projectId),
      allocationPercentage: parseInt(form.allocationPercentage),
    })
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Allocation' : 'Allocate Resource'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {errors.api && <div style={{ color:'var(--red)', padding:'8px 12px', background:'var(--red-dim)', borderRadius:6, marginBottom:12, fontSize:'0.85rem' }}>{errors.api}</div>}
            <div className="form-group">
              <label className="form-label">Team Member *</label>
              <select name="userId" value={form.userId} onChange={change} className="form-select">
                <option value="">Select member</option>
                {users.filter(u => u.role === 'EMPLOYEE').map(u=>(
                  <option key={u.userId} value={u.userId}>
                    {u.fullName||`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select name="projectId" value={form.projectId} onChange={change} className="form-select">
                <option value="">Select project</option>
                {projects.map(p=><option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Allocation % ({form.allocationPercentage}%)</label>
              <input name="allocationPercentage" type="range" min="10" max="100" step="10"
                value={form.allocationPercentage} onChange={change}
                style={{ width:'100%', accentColor:'var(--purple)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>
                <span>10%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role / Notes</label>
              <input name="notes" value={form.notes} onChange={change} className="form-input" placeholder="e.g. Lead developer" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : isEdit ? 'Update' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
