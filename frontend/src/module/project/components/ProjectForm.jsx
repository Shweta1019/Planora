import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { X } from 'lucide-react'

const STATUSES = ['PLANNING','ACTIVE','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED']

export default function ProjectFormModal({ project, users = [], onClose, onSaved }) {
  const isEdit = !!project

  const [form, setForm] = useState({
    projectName:  project?.projectName  || '',
    description:  project?.description  || '',
    startDate:    project?.startDate?.slice(0, 10) || '',
    endDate:      project?.endDate?.slice(0, 10)   || '',
    status:       project?.status       || 'PLANNING',
    managerId:    project?.managerId    || '',
    clientName:   project?.clientName   || '',
    priority:     project?.priority     || 'MEDIUM',
  })

  const [errors, setErrors] = useState({})

  const mut = useMutation({
    mutationFn: (data) =>
      isEdit ? projectApi.update(project.projectId, data) : projectApi.create(data),
    onSuccess: onSaved,
    onError: (err) => {
      setErrors({ api: err.response?.data?.message || 'Something went wrong' })
    },
  })

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.projectName.trim()) e.projectName = 'Project name is required'
    if (!form.startDate)          e.startDate   = 'Start date is required'
    if (!form.endDate)            e.endDate     = 'End date is required'
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      e.endDate = 'End date must be after start date'
    return e
  }

  function submit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    mut.mutate({
      ...form,
      managerId: form.managerId ? parseInt(form.managerId) : null,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Project' : 'Create New Project'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            {errors.api && <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: 12, padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 6 }}>{errors.api}</div>}

            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input name="projectName" value={form.projectName} onChange={change} className="form-input" placeholder="Enter project name" />
              {errors.projectName && <span className="form-error">{errors.projectName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={change} className="form-textarea" placeholder="Project description..." />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input name="startDate" type="date" value={form.startDate} onChange={change} className="form-input" />
                {errors.startDate && <span className="form-error">{errors.startDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input name="endDate" type="date" value={form.endDate} onChange={change} className="form-input" />
                {errors.endDate && <span className="form-error">{errors.endDate}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={change} className="form-select">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" value={form.priority} onChange={change} className="form-select">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project Manager</label>
                <select name="managerId" value={form.managerId} onChange={change} className="form-select">
                  <option value="">Select manager</option>
                  {users.map(u => (
                    <option key={u.userId} value={u.userId}>{u.fullName || `${u.firstName} ${u.lastName}`}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input name="clientName" value={form.clientName} onChange={change} className="form-input" placeholder="Client / organization" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
