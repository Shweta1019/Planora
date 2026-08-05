import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { X } from 'lucide-react'

const STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

export default function ProjectFormModal({ project, users = [], currentUser, onClose, onSaved }) {
  const isEdit = !!project
  const todayStr = new Date().toISOString().split('T')[0]

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
  })

  const managers = users.filter(u => 
    u.role === 'PROJECT_MANAGER' && 
    (currentUser?.role === 'ADMIN' || String(u.userId) === String(currentUser?.userId))
  )
  const employees = users.filter(u => u.role === 'EMPLOYEE')

  const getManagerProjectCount = (managerId) => {
    if (!managerId) return 0
    return allProjects.filter(p => 
      String(p.managerId) === String(managerId) && 
      p.status !== 'COMPLETED' && 
      p.status !== 'CANCELLED' && 
      String(p.projectId) !== String(project?.projectId)
    ).length
  }

  const defaultManagerId = project?.managerId 
    ? project.managerId 
    : (currentUser?.role === 'PROJECT_MANAGER' && getManagerProjectCount(currentUser.userId) < 2
        ? currentUser.userId 
        : (managers.find(u => getManagerProjectCount(u.userId) < 2)?.userId || ''))

  const [form, setForm] = useState({
    projectName:  project?.projectName  || '',
    description:  project?.description  || '',
    startDate:    project?.startDate?.slice(0, 10) || '',
    endDate:      project?.endDate?.slice(0, 10)   || '',
    status:       project?.status       || 'PLANNING',
    managerId:    defaultManagerId,
    budget:       project?.budget || project?.totalBudget || '',
    priority:     project?.priority     || 'MEDIUM',
    members:      [],
  })

  function addMember() {
    setForm(f => ({ ...f, members: [...f.members, { userId: '', roleInProject: 'Developer' }] }))
  }

  function updateMember(index, field, value) {
    setForm(f => {
      const newMembers = [...f.members]
      newMembers[index] = { ...newMembers[index], [field]: value }
      return { ...f, members: newMembers }
    })
    if (errors.members) setErrors(er => ({ ...er, members: '' }))
  }

  function removeMember(index) {
    setForm(f => ({ ...f, members: f.members.filter((_, i) => i !== index) }))
    if (errors.members) setErrors(er => ({ ...er, members: '' }))
  }

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
    if (name === 'managerId' && value) {
      const count = getManagerProjectCount(value)
      if (count >= 2) {
        if (currentUser?.role === 'PROJECT_MANAGER') {
          setErrors(er => ({ ...er, managerId: 'Maximum limit of 2 active projects reached. Complete an existing project before creating a new one.' }))
        } else {
          setErrors(er => ({ ...er, managerId: 'This Project Manager is already assigned to 2 projects (maximum limit reached).' }))
        }
      }
    }
  }

  function validate() {
    const e = {}
    if (!form.projectName || !form.projectName.trim()) {
      e.projectName = 'Project name is required'
    } else if (form.projectName.trim().length < 2) {
      e.projectName = 'Project name must be at least 2 characters'
    } else if (form.projectName.trim().length > 100) {
      e.projectName = 'Project name cannot exceed 100 characters'
    }

    if (!form.managerId) {
      e.managerId = 'Project Manager is required'
    } else {
      const count = getManagerProjectCount(form.managerId)
      if (count >= 2) {
        if (currentUser?.role === 'PROJECT_MANAGER') {
          e.managerId = 'Maximum limit of 2 active projects reached. Complete an existing project before creating a new one.'
        } else {
          e.managerId = 'This Project Manager is already assigned to 2 projects (maximum limit reached).'
        }
      }
    }

    if (!form.startDate) {
      e.startDate = 'Start date is required'
    }

    if (!form.endDate) {
      e.endDate = 'End date is required'
    } else if (form.startDate && form.endDate && form.startDate > form.endDate) {
      e.endDate = 'End date must be on or after start date'
    }

    if (form.budget === '' || form.budget === null || form.budget === undefined) {
      e.budget = 'Budget is required'
    } else if (isNaN(form.budget) || Number(form.budget) <= 0) {
      e.budget = 'Budget must be a positive number greater than 0'
    }

    if (!isEdit) {
      if (!form.members || form.members.length === 0) {
        e.members = 'At least one team member is required'
      } else {
        const selectedIds = form.members.map(m => m.userId).filter(Boolean)
        if (form.members.some(m => !m.userId)) {
          e.members = 'Please select a team member for all added rows or remove empty rows'
        } else if (new Set(selectedIds).size !== selectedIds.length) {
          e.members = 'Duplicate teammates are not allowed'
        }
      }
    }

    return e
  }

  function submit(e) {
    if (e) e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    mut.mutate({
      ...form,
      projectName: form.projectName.trim(),
      managerId: form.managerId ? parseInt(form.managerId) : null,
      budget: form.budget ? parseFloat(form.budget) : 0,
      members: form.members.filter(m => m.userId).map(m => ({ ...m, userId: parseInt(m.userId) })),
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault()
      submit(e)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{isEdit ? 'Edit Project' : 'Create New Project'}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={submit} onKeyDown={handleKeyDown}>
          <div className="modal-body">
            {errors.api && <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: 12, padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 6 }}>{errors.api}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="projectName" value={form.projectName} onChange={change} className="form-input" placeholder="Website Redesign" />
                {errors.projectName && <span className="form-error">{errors.projectName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Project Manager <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="managerId" value={form.managerId} onChange={change} className="form-select">
                  <option value="">Select manager</option>
                  {managers.map(u => {
                    const count = getManagerProjectCount(u.userId)
                    const isMax = count >= 2
                    return (
                      <option 
                        key={u.userId} 
                        value={u.userId} 
                        disabled={isMax && String(form.managerId) !== String(u.userId)}
                      >
                        {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                        {isMax ? ' (Max 2 projects reached)' : ` (${count}/2 projects)`}
                      </option>
                    )
                  })}
                </select>
                {errors.managerId && <span className="form-error">{errors.managerId}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Priority <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="priority" value={form.priority} onChange={change} className="form-select">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              {!isEdit && (
                <div className="form-group">
                  <label className="form-label">Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="startDate" type="date" min={todayStr} value={form.startDate} onChange={change} className="form-input" />
                  {errors.startDate && <span className="form-error">{errors.startDate}</span>}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">End Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="endDate" type="date" min={todayStr} value={form.endDate} onChange={change} className="form-input" />
                {errors.endDate && <span className="form-error">{errors.endDate}</span>}
              </div>
            </div>

            <div className="form-group" style={{ width: 'calc(50% - 8px)' }}>
              <label className="form-label">Budget (₹) <span style={{ color: '#ef4444' }}>*</span></label>
              <input name="budget" type="number" min="1" step="any" value={form.budget || ''} onChange={change} className="form-input" placeholder="2,00,000" />
              {errors.budget && <span className="form-error">{errors.budget}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={(e) => {
                  change(e);
                  e.target.style.height = 'inherit';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }} 
                className="form-textarea" 
                placeholder="Complete redesign of the company website including UI/UX improvements, content updates and performance optimization."
                style={{ overflow: 'hidden', minHeight: '80px', resize: 'none' }}
              />
            </div>

            {!isEdit && (
              <div className="form-group" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Team Members <span style={{ color: '#ef4444' }}>*</span></label>
                  <button type="button" onClick={addMember} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>+ Add Teammate</button>
                </div>
                {errors.members && <span className="form-error" style={{ display: 'block', marginBottom: 8 }}>{errors.members}</span>}
                {form.members.map((member, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select value={member.userId} onChange={e => updateMember(idx, 'userId', e.target.value)} className="form-select" style={{ flex: 1 }}>
                      <option value="">Select user...</option>
                      {employees.map(u => (
                        <option 
                          key={u.userId} 
                          value={u.userId}
                          disabled={
                            form.members.some((m, i) => i !== idx && String(m.userId) === String(u.userId))
                          }
                        >
                          {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                        </option>
                      ))}
                    </select>
                    <select value={member.roleInProject} onChange={e => updateMember(idx, 'roleInProject', e.target.value)} className="form-select" style={{ width: '150px' }}>
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
                    <button type="button" onClick={() => removeMember(idx)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
