import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { userApi } from '../../../api/userApi'
import { authApi } from '../../../api/authApi'
import { X } from 'lucide-react'

export default function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = !!user
  const [form, setForm] = useState({
    firstName:   user?.firstName   || '',
    lastName:    user?.lastName    || '',
    email:       user?.email       || '',
    password:    '',
    role:        user?.role        || 'EMPLOYEE',
    department:  user?.department  || '',
    designation: user?.designation || '',
    phoneNo:     user?.phoneNo || user?.phone || '',
  })
  const [errors, setErrors] = useState({})

  // for creating a new user, hit the register endpoint (hashes password)
  // for editing, hit the user update endpoint
  const mut = useMutation({
    mutationFn: (data) => isEdit ? userApi.update(user.userId, data) : authApi.register(data),
    onSuccess: onSaved,
    onError: (err) => setErrors({ api: err.response?.data?.message || 'Error saving user' }),
  })

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  function submit(e) {
    e.preventDefault()
    const errs = {}
    
    if (!form.firstName.trim()) {
      errs.firstName = 'First name required'
    } else if (form.firstName.trim().length < 2) {
      errs.firstName = 'Min 2 characters'
    }

    if (!form.lastName.trim()) {
      errs.lastName = 'Last name required'
    } else if (form.lastName.trim().length < 2) {
      errs.lastName = 'Min 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) {
      errs.email = 'Email required'
    } else if (!emailRegex.test(form.email)) {
      errs.email = 'Invalid email address'
    }

    if (!isEdit && !form.password) {
      errs.password = 'Password required'
    } else if (!isEdit && form.password && form.password.length < 6) {
      errs.password = 'Min 6 characters'
    }

    if (form.phoneNo && !/^[1-9]\d{9}$/.test(form.phoneNo)) {
      errs.phoneNo = 'Must be exactly 10 digits and not start with 0'
    }

    if (Object.keys(errs).length) { setErrors(errs); return }

    const data = { ...form }
    if (isEdit && !data.password) delete data.password
    mut.mutate(data)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit} autoComplete="off">
          <div className="modal-body">
            {errors.api && <div style={{ color:'var(--red)', fontSize:'0.85rem', marginBottom:12, padding:'8px 12px', background:'var(--red-dim)', borderRadius:6 }}>{errors.api}</div>}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input name="firstName" value={form.firstName} onChange={change} className="form-input" placeholder="First name" />
                {errors.firstName && <span className="form-error">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input name="lastName" value={form.lastName} onChange={change} className="form-input" placeholder="Last name" />
                {errors.lastName && <span className="form-error">{errors.lastName}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={change} className="form-input" placeholder="email@planora.com" autoComplete="off" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input name="password" type="password" value={form.password} onChange={change} className="form-input" placeholder="Min 6 characters" autoComplete="new-password" />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
            )}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select name="role" value={form.role} onChange={change} className="form-select">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phoneNo" value={form.phoneNo} onChange={change} className="form-input" placeholder="XXXXXXXXXX" />
                {errors.phoneNo && <span className="form-error">{errors.phoneNo}</span>}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" value={form.department} onChange={change} className="form-select">
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Business Analysis">Business Analysis</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Database Administration">Database Administration</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Human Resources (HR)">Human Resources (HR)</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Administration">Administration</option>
                  <option value="Research & Development (R&D)">Research & Development (R&D)</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <select name="designation" value={form.designation} onChange={change} className="form-select">
                  <option value="">Select Designation</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Senior Software Engineer">Senior Software Engineer</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Database Administrator">Database Administrator</option>
                  <option value="IT Support Engineer">IT Support Engineer</option>
                  <option value="HR Executive">HR Executive</option>
                  <option value="Finance Executive">Finance Executive</option>
                  <option value="Marketing Executive">Marketing Executive</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Customer Support Executive">Customer Support Executive</option>
                  <option value="Operations Executive">Operations Executive</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
