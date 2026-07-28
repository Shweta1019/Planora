import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import {
  Camera, Mail, Phone, Building, Clock, MapPin,
  Calendar, Activity, Bell, Lock, User, Eye, EyeOff,
  CheckSquare, MessageSquare
} from 'lucide-react'
import { formatDate, initials } from '../../../utils/formatDate'

const SETTING_TABS = [
  { key: 'profile', label: 'Profile Settings', icon: User },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'notifications', label: 'Notification Preferences', icon: Bell },
]

export default function SettingsPage() {
  const qc = useQueryClient()
  const { user: authUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [saved, setSaved] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(localStorage.getItem('planora_photo') || '')

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => authApi.getMe().then(r => r.data?.data || r.data),
    staleTime: 60_000,
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
  }, [profile])

  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })

  const profileMut = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setSaved('Profile saved successfully!')
      qc.invalidateQueries({ queryKey: ['my-profile'] })
      
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
      localStorage.setItem('planora_photo', dataUrl)
      window.dispatchEvent(new Event('planora_photo_updated'))
    }
    reader.readAsDataURL(file)
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
    { icon: Calendar, label: 'Task Due Reminders', desc: 'Receive reminders for upcoming task due dates.', on: true },
    { icon: User, label: 'Project Updates', desc: 'Get notified about project updates and changes.', on: true },
    { icon: MessageSquare, label: 'Comments', desc: 'Get notified when someone comments on a task.', on: true },
    { icon: Bell, label: 'General Notifications', desc: 'Receive general important notifications.', on: false },
  ]

  // Load saved values from localStorage (if any), otherwise use defaults
  const savedNotifs = localStorage.getItem('planora_notif_prefs')
  const initialNotifs = savedNotifs
    ? defaultNotifs.map((item, i) => ({ ...item, on: JSON.parse(savedNotifs)[i] }))
    : defaultNotifs

  const [notifSettings, setNotifSettings] = useState(initialNotifs)

  function toggleNotif(index) {
    setNotifSettings(prev =>
      prev.map((item, i) => i === index ? { ...item, on: !item.on } : item)
    )
  }

  function saveNotifPrefs() {
    // Save only the on/off values to localStorage
    const onValues = notifSettings.map(item => item.on)
    localStorage.setItem('planora_notif_prefs', JSON.stringify(onValues))
    setSaved('Notification preferences saved!')
    setTimeout(() => setSaved(''), 3000)
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
          <p className="page-subheading">Manage your account and preferences.</p>
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
          {SETTING_TABS.map(t => {
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
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>Change Password</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Update your password to keep your account secure.
              </div>

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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                  Password must be at least 8 characters long and include uppercase, lowercase, number and special character.
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
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>Notification Preferences</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Choose the notifications you want to receive.
              </div>
              {notifSettings.map((s, index) => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ width: 40, height: 40, background: 'var(--purple-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="var(--purple)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={s.on} onChange={() => toggleNotif(index)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-primary" onClick={saveNotifPrefs}>Save Changes</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
