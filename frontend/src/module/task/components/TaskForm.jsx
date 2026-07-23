import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { taskApi } from '../../../api/taskApi'
import { X } from 'lucide-react'

export default function TaskFormModal({ task, projects = [], users = [], isEmployeeEdit = false, onClose, onSaved }) {
  const isEdit = !!task

  const [form, setForm] = useState({
    taskName:    task?.taskName    || '',
    description: task?.description || '',
    projectId:   task?.projectId   || '',
    assignedTo:  task?.assignedTo  || '',
    priority:    task?.priority    || 'MEDIUM',
    status:      task?.status      || 'TO_DO',
    dueDate:     task?.dueDate?.slice(0, 10) || '',
    completionPercentage: task?.completionPercentage || 0,
  })

  const [errors, setErrors] = useState({})

  const mut = useMutation({
    mutationFn: (data) => isEdit ? taskApi.update(task.taskId, data) : taskApi.create(data),
    onSuccess: onSaved,
    onError: (err) => setErrors({ api: err.response?.data?.message || 'Error saving task' }),
  })

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.taskName.trim()) { setErrors({ taskName: 'Task name required' }); return }
    if (!form.projectId)       { setErrors({ projectId: 'Select a project' }); return }
    mut.mutate({
      ...form,
      projectId:   parseInt(form.projectId),
      assignedTo:  form.assignedTo ? parseInt(form.assignedTo) : null,
      completionPercentage: parseInt(form.completionPercentage) || 0,
    })
  }

  // Employee editing: can only change status and completion percentage
  const locked = isEmployeeEdit && isEdit

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {errors.api && <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: 12, padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 6 }}>{errors.api}</div>}

            <div className="form-group">
              <label className="form-label">Task Name *</label>
              <input name="taskName" value={form.taskName} onChange={change} className="form-input" placeholder="Task title..." disabled={locked} />
              {errors.taskName && <span className="form-error">{errors.taskName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={change} className="form-textarea" placeholder="Task details..." disabled={locked} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select name="projectId" value={form.projectId} onChange={change} className="form-select" disabled={locked}>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
                </select>
                {errors.projectId && <span className="form-error">{errors.projectId}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <select name="assignedTo" value={form.assignedTo} onChange={change} className="form-select" disabled={locked}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.userId} value={u.userId}>{u.fullName || `${u.firstName} ${u.lastName}`}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" value={form.priority} onChange={change} className="form-select" disabled={locked}>
                  {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={change} className="form-select">
                  {['TO_DO','IN_PROGRESS','IN_REVIEW','COMPLETED','OVERDUE'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input name="dueDate" type="date" value={form.dueDate} onChange={change} className="form-input" disabled={locked} />
              </div>
              <div className="form-group">
                <label className="form-label">Completion %</label>
                <input name="completionPercentage" type="number" min="0" max="100" value={form.completionPercentage} onChange={change} className="form-input" />
              </div>
            </div>

            {locked && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: '#f8f9fa', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                💡 As an employee, you can update Status and Completion % only.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
