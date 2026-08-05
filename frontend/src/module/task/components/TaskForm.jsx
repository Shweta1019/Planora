import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { taskApi } from '../../../api/taskApi'
import { projectApi } from '../../../api/projectApi'
import { useAuthStore } from '../../../store/authStore'
import { X } from 'lucide-react'

export default function TaskFormModal({ task, projects = [], users = [], isEmployeeEdit = false, onClose, onSaved }) {
  const isEdit = !!task
  const todayStr = new Date().toISOString().split('T')[0]
  const currentUserId = useAuthStore(s => s.user?.userId)
  const currentUserRole = useAuthStore(s => s.user?.role)

  const allowedProjects = currentUserRole === 'PROJECT_MANAGER' && currentUserId
    ? projects.filter(p => p.managerId && String(p.managerId) === String(currentUserId))
    : projects;

  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    projectId:   task?.projectId   || '',
    assignedToId:task?.assignedToId|| '',
    priority:    task?.priority    || 'MEDIUM',
    status:      task?.status      || 'TODO',
    startDate:   task?.startDate?.slice(0, 10) || '',
    dueDate:     task?.dueDate?.slice(0, 10) || '',
    completionPercentage: task?.completionPercentage || 0,
  })

  const [errors, setErrors] = useState({})

  // Fetch members of the selected project
  const { data: projectMembers = [] } = useQuery({
    queryKey: ['project-members', form.projectId],
    queryFn: () => form.projectId ? projectApi.getMembers(form.projectId).then(r => r.data?.data || r.data || []) : Promise.resolve([]),
    enabled: !!form.projectId,
  })

  const selectedProject = projects.find(p => String(p.projectId) === String(form.projectId))

  // Eligible assignees for this project: Project Manager of the project + Employees assigned to the project (no Admin)
  const projectAssignees = (() => {
    const list = []
    const addedUserIds = new Set()

    // Add PM of the project if assigned
    if (selectedProject?.managerId) {
      const pmUser = users.find(u => String(u.userId) === String(selectedProject.managerId))
      const pmName = pmUser?.fullName || `${pmUser?.firstName || ''} ${pmUser?.lastName || ''}`.trim() || selectedProject.managerName || pmUser?.email
      if (pmUser?.role !== 'ADMIN') {
        list.push({
          userId: selectedProject.managerId,
          fullName: pmName,
          roleTag: 'Project Manager'
        })
        addedUserIds.add(String(selectedProject.managerId))
      }
    }

    // Add project members (employees & PMs in the project)
    projectMembers.forEach(m => {
      if (m.userId && !addedUserIds.has(String(m.userId))) {
        if (m.role === 'EMPLOYEE' || m.role === 'PROJECT_MANAGER' || !m.role) {
          list.push({
            userId: m.userId,
            fullName: m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email,
            roleTag: m.roleInProject || (m.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Employee')
          })
          addedUserIds.add(String(m.userId))
        }
      }
    })

    return list.filter(assignee => {
      const assigneeUser = users.find(u => String(u.userId) === String(assignee.userId));
      if (currentUserRole === 'PROJECT_MANAGER' && assigneeUser?.role === 'PROJECT_MANAGER') {
        return String(assignee.userId) === String(currentUserId);
      }
      return true;
    });
  })()

  const mut = useMutation({
    mutationFn: async (data) => {
      let res;
      if (isEdit) {
        res = await taskApi.update(task.taskId, data);
        if (data.status && data.status !== task.status) {
          await taskApi.updateStatus(task.taskId, data.status);
        }
      } else {
        res = await taskApi.create(data);
        const newTaskId = res.data?.data?.taskId || res.data?.taskId;
        if (newTaskId && data.status && data.status !== 'TODO') {
          await taskApi.updateStatus(newTaskId, data.status);
        }
      }
      return res;
    },
    onSuccess: onSaved,
    onError: (err) => setErrors({ api: err.response?.data?.message || 'Error saving task' }),
  })

  function change(e) {
    const { name, value } = e.target
    if (name === 'projectId') {
      setForm(f => ({ ...f, projectId: value, assignedToId: '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.title || !form.title.trim()) {
      e.title = 'Task name is required'
    } else if (form.title.trim().length < 2) {
      e.title = 'Task name must be at least 2 characters'
    }
    if (!form.projectId) {
      e.projectId = 'Please select a project'
    }
    if (!form.assignedToId) {
      e.assignedToId = 'Please assign the task to someone'
    }
    if (!form.startDate) {
      e.startDate = 'Start date is required'
    }
    if (!form.dueDate) {
      e.dueDate = 'Due date is required'
    } else if (form.startDate && form.dueDate && form.startDate > form.dueDate) {
      e.dueDate = 'Due date must be on or after start date'
    }
    return e
  }

  function submit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    mut.mutate({
      ...form,
      title: form.title.trim(),
      projectId:   parseInt(form.projectId),
      assignedToId:form.assignedToId ? parseInt(form.assignedToId) : null,
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
              <label className="form-label">Task Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input name="title" value={form.title} onChange={change} className="form-input" placeholder="Task title..." disabled={locked} />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={change} className="form-textarea" placeholder="Task details..." disabled={locked} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="projectId" value={form.projectId} onChange={change} className="form-select" disabled={locked}>
                  <option value="">Select project</option>
                  {allowedProjects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
                </select>
                {errors.projectId && <span className="form-error">{errors.projectId}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Assigned To <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="assignedToId" value={form.assignedToId} onChange={change} className="form-select" disabled={locked || !form.projectId}>
                  <option value="">
                    {!form.projectId 
                      ? 'Select a project first' 
                      : projectAssignees.length === 0 
                        ? 'No members in this project' 
                        : 'Select assignee'}
                  </option>
                  {projectAssignees.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.fullName} {u.roleTag ? `(${u.roleTag})` : ''}
                    </option>
                  ))}
                </select>
                {errors.assignedToId && <span className="form-error">{errors.assignedToId}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" value={form.priority} onChange={change} className="form-select" disabled={locked}>
                  {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" value={form.status} onChange={change} className="form-select">
                    {['TODO','IN_PROGRESS','IN_REVIEW','COMPLETED','OVERDUE'].map(s => (
                      <option key={s} value={s}>{s === 'TODO' ? 'To Do' : s.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="startDate" type="date" min={todayStr} value={form.startDate} onChange={change} className="form-input" disabled={locked} />
                {errors.startDate && <span className="form-error">{errors.startDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Due Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="dueDate" type="date" min={form.startDate || todayStr} value={form.dueDate} onChange={change} className="form-input" disabled={locked} />
                {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
              </div>
            </div>

            {locked && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: '#f8f9fa', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                💡 As an employee, you can update the Status only.
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
