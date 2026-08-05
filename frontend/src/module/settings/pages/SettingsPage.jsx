import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../../api/authApi'
import { userApi } from '../../../api/userApi'
import { useAuthStore } from '../../../store/authStore'
import {
  Camera, Mail, Phone, Building, Clock, MapPin,
  Calendar, Activity, Bell, Lock, User, Eye, EyeOff,
  CheckSquare, MessageSquare, Users, Trash2, Ban, UserPlus, MoreVertical
} from 'lucide-react'
import { formatDate, initials } from '../../../utils/formatDate'
import { useRole } from '../../../store/useRole'
import { Link, useNavigate } from 'react-router-dom'
import DeleteUserModal from '../components/DeleteUserModal'
import UserFormModal from '../../user/components/UserForm'

export default function SettingsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { user: authUser, setPhoto } = useAuthStore()
  const { isAdmin } = useRole()

  const settingTabs = [
    { key: 'profile', label: 'Profile Settings', icon: User },
    { key: 'password', label: 'Change Password', icon: Lock },
  ]
  if (isAdmin) {
    settingTabs.push({ key: 'users', label: 'User Management', icon: Users })
  }

  const [tab, setTab] = useState('profile')
  const [saved, setSaved] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(authUser?.photoUrl || '')

  useEffect(() => {
    setPhotoUrl(authUser?.photoUrl || '')
  }, [authUser?.photoUrl])

  const { data: profile } = useQuery({
    queryKey: ['my-profile', authUser?.userId],
    queryFn: () => authApi.getMe().then(r => r.data?.data || r.data),
    staleTime: 60_000,
    enabled: !!authUser?.userId,
  })

  const me = profile || authUser || {}
  const fullName = me.fullName || `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'User'

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    location: '',
    bio: '',
  })

  // Sync form when profile data loads
  useEffect(() => {
    if (me.firstName || me.email) {
      setForm({
        firstName: me.fullName || `${me.firstName || ''} ${me.lastName || ''}`.trim() || '',
        lastName: me.lastName || '',
        email: me.email || '',
        phone: me.phoneNo || me.phone || '',
        department: me.department || '',
        designation: me.designation || '',
        location: me.location || '',
        bio: me.bio || '',
      })
    }
    if (profile?.profileImage) {
      setPhotoUrl(profile.profileImage)
      if (!authUser?.photoUrl) setPhoto(profile.profileImage)
    }
  }, [profile])

  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })

  const profileMut = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setSaved('Profile saved successfully!')
      qc.invalidateQueries({ queryKey: ['my-profile', authUser?.userId] })

      // Update global auth store so UI components like Navbar re-render immediately
      const updatedUser = res.data?.data || res.data
      if (updatedUser) {
        useAuthStore.getState().setUser({ ...authUser, ...updatedUser })
      }

      setTimeout(() => setSaved(''), 3000)
    },
  })

  const pwMut = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      setSaved('Password updated successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSaved(''), 3000)
    },
    onError: (err) => setPwErr(err.response?.data?.message || 'Failed to update password'),
  })

  function changeForm(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }
  function changePw(e) { setPwForm(f => ({ ...f, [e.target.name]: e.target.value })); setPwErr('') }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function (event) {
      const dataUrl = event.target.result
      setPhotoUrl(dataUrl)
      setPhoto(dataUrl)
      profileMut.mutate({ profileImage: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  function handleRemovePhoto() {
    setPhotoUrl('')
    setPhoto('')
    profileMut.mutate({ profileImage: '' })
  }

  function submitProfile(e) {
    e.preventDefault()
    if (!form.firstName.trim()) { setProfileErr('Full Name is required'); return }
    if (form.phone && !/^\+?[\d\s-]{9,}$/.test(form.phone)) { setProfileErr('Invalid Phone Number'); return }
    setProfileErr('')

    // Split full name into first and last name
    const nameParts = form.firstName.trim().split(' ')
    const fName = nameParts[0]
    const lName = nameParts.slice(1).join(' ')

    const payload = { ...form, firstName: fName, lastName: lName }
    profileMut.mutate(payload)
  }

  function submitPassword(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwErr('Passwords do not match'); return }
    if (pwForm.newPassword.length < 6) { setPwErr('Min 6 characters'); return }
    pwMut.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
  }

  // Default notification settings
  const defaultNotifs = [
    { icon: CheckSquare, label: 'Task Assignments', desc: 'Get notified when a task is assigned to you.', on: true },
    { icon: Calendar, label: 'Task Due Reminders', desc: 'Receive reminders for approaching task deadlines.', on: true },
    { icon: Building, label: 'Project Updates', desc: 'Get notified about changes to your assigned projects.', on: true },
    { icon: Activity, label: 'Budget Alerts', desc: 'Receive alerts when project budgets are at risk.', on: false },
    { icon: MessageSquare, label: 'Mentions & Comments', desc: 'Get notified when you are mentioned in a comment.', on: true },
  ]

  // Load saved values from localStorage (if any), otherwise use defaults
  const savedNotifs = localStorage.getItem(`planora_notif_prefs_${authUser?.userId}`)
  const initialNotifs = savedNotifs
    ? defaultNotifs.map((item, i) => ({ ...item, on: JSON.parse(savedNotifs)[i] }))
    : defaultNotifs

  const [notifSettings, setNotifSettings] = useState(initialNotifs)

  useEffect(() => {
    const saved = localStorage.getItem(`planora_notif_prefs_${authUser?.userId}`)
    setNotifSettings(saved ? defaultNotifs.map((item, i) => ({ ...item, on: JSON.parse(saved)[i] })) : defaultNotifs)
  }, [authUser?.userId])

  const [userStatusFilter, setUserStatusFilter] = useState('All')
  const [openUserMenuId, setOpenUserMenuId] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [managerAlert, setManagerAlert] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => userApi.getAll().then(r => r.data?.data || r.data || []),
    enabled: isAdmin && tab === 'users',
    staleTime: 60_000,
  })

  const blockUserMut = useMutation({
    mutationFn: ({ id, status }) => userApi.updateStatus(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users-list'] })
  })

  const deleteUserMut = useMutation({
    mutationFn: (id) => userApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-list'] })
      setUserToDelete(null)
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete user'
      if (msg === 'USER_IS_MANAGER') {
        setManagerAlert(userToDelete)
      } else {
        alert(msg)
      }
      setUserToDelete(null)
    }
  })

  const filteredUsers = allUsers.filter(u => {
    if (userStatusFilter === 'All') return true
    if (userStatusFilter === 'Active') return u.status === 'ACTIVE'
    if (userStatusFilter === 'Blocked') return u.status === 'INACTIVE' || u.status === 'BLOCKED'
    return true
  })

  function toggleNotif(index) {
    setNotifSettings(prev =>
      prev.map((item, i) => i === index ? { ...item, on: !item.on } : item)
    )
  }

  function saveNotifPrefs() {
    // Save only the on/off values to localStorage
    const onValues = notifSettings.map(item => item.on)
    localStorage.setItem(`planora_notif_prefs_${authUser?.userId}`, JSON.stringify(onValues))
    setSaved('Notification preferences saved!')
    setTimeout(() => setSaved(''), 3000)
    window.dispatchEvent(new Event('planora_notif_prefs_updated'))
  }

  const roleLabel = me.role === 'ADMIN' ? 'ADMIN'
    : me.role === 'PROJECT_MANAGER' ? 'PROJECT MANAGER'
      : 'EMPLOYEE'

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Settings</h1>

        </div>
      </div>

      {/* Success banner */}
      {saved && (
        <div style={{
          background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: '0.875rem', fontWeight: 500,
        }}>✓ {saved}</div>
      )}

      {/* Two-column settings layout */}
      <div className="settings-layout">

        {/* Left — vertical tab nav */}
        <div className="card settings-nav">
          {settingTabs.map(t => {
            const Icon = t.icon
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--purple)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--purple-dim)' : 'transparent',
                  marginBottom: 2,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Right — content panel */}
        <div className="settings-panel">

          {/* ── PROFILE SETTINGS TAB ── */}
          {tab === 'profile' && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 20 }}>Profile Settings</div>
              <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

                {/* Avatar column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    {/* Avatar circle — show uploaded photo or initials */}
                    {photoUrl
                      ? <img src={photoUrl} alt="Profile" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{
                        width: 90, height: 90, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
                        color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, fontSize: '2rem',
                      }}>
                        {initials(fullName)}
                      </div>
                    }
                    <label htmlFor="photo-upload" style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--purple)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', border: '2px solid #fff',
                    }}>
                      <Camera size={13} color="#fff" />
                      <input id="photo-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>{fullName}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      style={{
                        fontSize: '0.75rem', color: 'var(--purple)', fontWeight: 500,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      }}
                    >
                      Change Photo
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        style={{
                          fontSize: '0.75rem', color: 'var(--red)', fontWeight: 500,
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={submitProfile} style={{ flex: 1, minWidth: 0 }}>
                  {profileErr && <div style={{ color: 'var(--red)', background: 'var(--red-dim)', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: '0.85rem' }}>{profileErr}</div>}
                  {/* Row 1: Full Name, Email, Phone Number */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Full Name</label>
                      <input name="firstName" value={form.firstName} onChange={changeForm} className="form-input" placeholder="Full name" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email</label>
                      <input name="email" type="email" value={form.email} onChange={changeForm} className="form-input" readOnly style={{ opacity: 0.7 }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Phone Number</label>
                      <input name="phone" value={form.phone} onChange={changeForm} className="form-input" placeholder="+91 87654 32109" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Designation</label>
                      <input name="designation" value={form.designation} onChange={changeForm} className="form-input" placeholder="Project Manager" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Department</label>
                      <input name="department" value={form.department} onChange={changeForm} className="form-input" placeholder="Project Management" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Language</label>
                      <select name="language" className="form-select" defaultValue="English">
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>

                  {/* Other Preferences */}
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>Other Preferences</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Date Format</label>
                      <select name="dateFormat" className="form-select" defaultValue="DD-MM-YYYY">
                        <option>DD-MM-YYYY</option>
                        <option>MM-DD-YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Time Format</label>
                      <select name="timeFormat" className="form-select" defaultValue="12 Hour (AM/PM)">
                        <option>12 Hour (AM/PM)</option>
                        <option>24 Hour</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div className="form-group" style={{ marginBottom: 0, maxWidth: '50%' }}>
                      <label className="form-label">Time Zone</label>
                      <select name="timezone" className="form-select" defaultValue="(GMT+05:30) Asia/Kolkata">
                        <option>(GMT+05:30) Asia/Kolkata</option>
                        <option>(GMT+00:00) UTC</option>
                        <option>(GMT-05:00) America/New_York</option>
                        <option>(GMT+01:00) Europe/London</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={profileMut.isPending}>
                      {profileMut.isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── CHANGE PASSWORD TAB ── */}
          {tab === 'password' && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 20 }}>Change Password</div>

              {pwErr && (
                <div style={{ color: 'var(--red)', background: 'var(--red-dim)', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: '0.85rem' }}>
                  {pwErr}
                </div>
              )}

              <form onSubmit={submitPassword} style={{ maxWidth: 600 }}>
                {/* Current Password */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="currentPassword"
                      type={showCurrent ? 'text' : 'password'}
                      value={pwForm.currentPassword}
                      onChange={changePw}
                      className="form-input"
                      placeholder="Enter your current password"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group" style={{ marginBottom: 6 }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="newPassword"
                      type={showNew ? 'text' : 'password'}
                      value={pwForm.newPassword}
                      onChange={changePw}
                      className="form-input"
                      placeholder="Enter your new password"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group" style={{ marginBottom: 28 }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={pwForm.confirmPassword}
                      onChange={changePw}
                      className="form-input"
                      placeholder="Confirm your new password"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={pwMut.isPending}>
                    {pwMut.isPending ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── NOTIFICATION PREFERENCES TAB ── */}
          {tab === 'notifications' && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 20 }}>Notification Preferences</div>
              {notifSettings.map((s, index) => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <Icon size={20} color="var(--text-secondary)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.on}
                      onChange={() => toggleNotif(index)}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#7c3aed' }}
                    />
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-primary" onClick={saveNotifPrefs}>Save Changes</button>
              </div>
            </div>
          )}

          {/* ── USER MANAGEMENT TAB (ADMIN ONLY) ── */}
          {tab === 'users' && isAdmin && (
            <div className="card" onClick={() => setOpenUserMenuId(null)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>User Management</div>

                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div>
                    <select className="form-select" style={{ height: 38 }} value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                      <option value="All">View All Users</option>
                      <option value="Active">Active</option>
                      <option value="Blocked">Blocked / Inactive</option>
                    </select>
                  </div>
                  <button onClick={() => setShowAddUser(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                    <UserPlus size={16} /> Add User
                  </button>
                </div>
              </div>

              {usersLoading ? <div className="page-loader" style={{ height: 100 }}><div className="spinner" /></div> : (
                <div className="table-wrap" style={{ overflow: 'visible' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => {
                        const isMenuOpen = openUserMenuId === u.userId
                        const isActive = u.status === 'ACTIVE'
                        return (
                          <tr key={u.userId}>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User'}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'var(--purple-dim)', color: 'var(--purple)' }}>
                                {u.role?.replace('_', ' ') || 'EMPLOYEE'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: isActive ? '#d1fae5' : '#fee2e2', color: isActive ? '#059669' : '#dc2626' }}>
                                {isActive ? 'Active' : 'Blocked / Inactive'}
                              </span>
                            </td>
                            <td>
                              {u.userId !== authUser?.userId && (
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                  <button
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenUserMenuId(isMenuOpen ? null : u.userId)
                                    }}
                                  >
                                    <MoreVertical size={16} color="var(--text-secondary)" />
                                  </button>
                                  {isMenuOpen && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        position: 'absolute', right: 36, top: 0, zIndex: 50,
                                        background: 'var(--bg-card)', borderRadius: 8,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                        border: '1px solid var(--border)',
                                        minWidth: 120, overflow: 'hidden',
                                      }}
                                    >
                                      <button onClick={() => {
                                        blockUserMut.mutate({ id: u.userId, status: isActive ? 'INACTIVE' : 'ACTIVE' })
                                        setOpenUserMenuId(null)
                                      }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)' }}>
                                        {isActive ? 'Block User' : 'Unblock User'}
                                      </button>
                                      <button onClick={() => {
                                        setUserToDelete(u)
                                        setOpenUserMenuId(null)
                                      }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' }}>
                                        Delete User
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>No users found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {showAddUser && (
        <UserFormModal
          user={null}
          onClose={() => setShowAddUser(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['admin-users-list'] }); setShowAddUser(false); }}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => deleteUserMut.mutate(userToDelete.userId)}
          isDeleting={deleteUserMut.isPending}
        />
      )}

      {/* Manager Reassignment Required Modal */}
      {managerAlert && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Ban size={28} />
            </div>
            <h3 style={{ marginBottom: 12, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '600' }}>
              Action Required
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5, fontSize: '0.95rem' }}>
              <strong>{managerAlert.fullName || managerAlert.firstName}</strong> is currently managing one or more active projects. You must reassign these projects to a new manager before this account can be deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setManagerAlert(null)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const name = managerAlert.fullName || managerAlert.firstName || ''
                  setManagerAlert(null)
                  navigate('/projects', { state: { searchManager: name } })
                }}
                style={{ flex: 1 }}
              >
                Go to Projects
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
