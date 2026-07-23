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
    if (!form.firstName.trim()) errs.firstName = 'First name required'
    if (!form.lastName.trim())  errs.lastName  = 'Last name required'
    if (!form.email.trim())     errs.email     = 'Email required'
    if (!isEdit && !form.password) errs.password = 'Password required'
    if (!isEdit && form.password && form.password.length < 6) errs.password = 'Min 6 characters'
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
        <form onSubmit={submit}>
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
              <input name="email" type="email" value={form.email} onChange={change} className="form-input" placeholder="email@planora.com" disabled={isEdit} style={isEdit ? { opacity: 0.6 } : {}} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input name="password" type="password" value={form.password} onChange={change} className="form-input" placeholder="Min 6 characters" />
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
                <input name="phoneNo" value={form.phoneNo} onChange={change} className="form-input" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input name="department" value={form.department} onChange={change} className="form-input" placeholder="e.g. Engineering" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input name="designation" value={form.designation} onChange={change} className="form-input" placeholder="e.g. Senior Developer" />
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
