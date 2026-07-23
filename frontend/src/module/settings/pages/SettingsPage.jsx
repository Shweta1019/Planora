import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import {
  Camera, Mail, Phone, Building, Clock, MapPin,
  Calendar, Activity, Bell, Lock
} from 'lucide-react'
import { formatDate, initials } from '../../../utils/formatDate'

const SETTING_TABS = [
  { key: 'profile',       label: 'Profile'       },
  { key: 'account',       label: 'Account'       },
  { key: 'preferences',   label: 'Preferences'   },
  { key: 'notifications', label: 'Notifications' },
]

export default function SettingsPage() {
  const qc = useQueryClient()
  const { user: authUser } = useAuthStore()
  const [tab, setTab]   = useState('profile')
  const [saved, setSaved] = useState('')
  const [pwErr, setPwErr] = useState('')

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn:  () => authApi.getMe().then(r => r.data?.data || r.data),
    staleTime: 60_000,
  })

  const me       = profile || authUser || {}
  const fullName = me.fullName || `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'User'

  const [form, setForm] = useState({
    firstName:   '',
    lastName:    '',
    email:       '',
    phone:       '',
    department:  '',
    designation: '',
    location:    '',
    bio:         '',
  })

  // Sync form when profile data loads
  useEffect(() => {
    if (me.firstName || me.email) {
      setForm({
        firstName:   me.firstName   || '',
        lastName:    me.lastName    || '',
        email:       me.email       || '',
        phone:       me.phoneNo || me.phone || '',
        department:  me.department  || '',
        designation: me.designation || '',
        location:    me.location    || '',
        bio:         me.bio         || '',
      })
    }
  }, [profile])

  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })

  const profileMut = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      setSaved('Profile saved successfully!')
      qc.invalidateQueries({ queryKey: ['my-profile'] })
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

  function changeForm(e)  { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }
  function changePw(e)    { setPwForm(f => ({ ...f, [e.target.name]: e.target.value })); setPwErr('') }

  function submitProfile(e) {
    e.preventDefault()
    profileMut.mutate(form)
  }

  function submitPassword(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwErr('Passwords do not match'); return }
    if (pwForm.newPassword.length < 6)                 { setPwErr('Min 6 characters'); return }
    pwMut.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
  }

  const sessions = [
    { device: 'Chrome on Windows', location: 'New York, USA • This device', status: 'Current',  statusColor: '#10b981' },
    { device: 'Safari on macOS',   location: 'New York, USA • 3 hours ago',  status: 'Active',   statusColor: '#6366f1' },
    { device: 'Chrome on iPhone',  location: 'New York, USA • 1 day ago',    status: 'Active',   statusColor: '#6366f1' },
    { device: 'Edge on Windows',   location: 'Chicago, USA • 3 days ago',    status: 'Inactive', statusColor: '#9ca3af' },
  ]

  const notifSettings = [
    { label: 'Task Assigned',    desc: 'You have been assigned a new task.',                on: true  },
    { label: 'Task Completed',   desc: 'A task has been completed.',                        on: true  },
    { label: 'Project Deadline', desc: 'Project deadline is approaching.',                  on: true  },
    { label: 'File Uploaded',    desc: 'A file has been uploaded to your project.',          on: false },
    { label: 'New Comment',      desc: 'Someone commented on your task.',                   on: true  },
    { label: 'Budget Alert',     desc: 'Budget threshold has been reached.',                on: false },
    { label: 'Weekly Report',    desc: 'Weekly activity summary sent to your email.',       on: true  },
  ]

  const accountToggles = [
    { label: 'Two-Factor Authentication (2FA)', desc: 'Add an extra layer of security to your account.', on: false },
    { label: 'Email Notifications',              desc: 'Receive important updates and alerts via email.', on: true  },
    { label: 'Activity Digest',                  desc: 'Receive a daily summary of your activities.',    on: false },
  ]

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Settings</h1>
          <p className="page-subheading">Manage your account, preferences and system settings.</p>
        </div>
      </div>

      {/* Tabs — horizontal like design */}
      <div className="tabs-bar" style={{ marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {SETTING_TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Success banner */}
      {saved && (
        <div style={{
          background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: '0.875rem', fontWeight: 500,
        }}>✓ {saved}</div>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>

          {/* Left — Profile Overview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: 24 }}>
            <div style={{ marginBottom: 12, position: 'relative' }}>
              <div className="avatar" style={{ width: 90, height: 90, fontSize: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {initials(fullName)}
              </div>
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%', background: 'var(--purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #fff',
              }}>
                <Camera size={13} color="#fff"/>
                <input type="file" style={{ display: 'none' }} accept="image/*"/>
              </label>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>{fullName}</div>
            <div style={{
              fontSize: '0.78rem', color: 'var(--purple)', fontWeight: 600, marginBottom: 16,
              background: 'var(--purple-dim)', borderRadius: 20, padding: '2px 10px',
            }}>
              {me.role?.replace('_', ' ') || 'Employee'}
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: Mail,     text: me.email                    },
                { icon: Phone,    text: me.phone || 'No phone'      },
                { icon: Building, text: me.department || 'No dept'  },
                { icon: Clock,    text: 'GMT+05:30 IST'             },
                { icon: MapPin,   text: me.location || 'No location'},
                { icon: Calendar, text: `Joined ${formatDate(me.createdAt)}` },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Icon size={13} color="var(--purple)" style={{ flexShrink: 0 }}/>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text || '—'}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-outline" style={{ width: '100%', marginTop: 16, fontSize: '0.82rem', gap: 6 }}>
              <Activity size={13}/> View Activity Log
            </button>
          </div>

          {/* Right — Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Profile Information form */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Profile Information</div>
              <form onSubmit={submitProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input name="firstName" value={form.firstName} onChange={changeForm} className="form-input" placeholder="John Smith"/>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Title</label>
                    <input name="designation" value={form.designation} onChange={changeForm} className="form-input" placeholder="Project Manager"/>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">About Me</label>
                    <input name="bio" value={form.bio} onChange={changeForm} className="form-input" placeholder="Brief bio..."/>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={changeForm} className="form-input" readOnly style={{ opacity: 0.7 }}/>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department</label>
                    <select name="department" value={form.department} onChange={changeForm} className="form-select">
                      <option value="">Select department</option>
                      {['Engineering','Design','Marketing','Finance','HR','Operations','Sales'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={changeForm} className="form-input" placeholder="+1 (555) 123-4567"/>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location</label>
                    <select name="location" value={form.location} onChange={changeForm} className="form-select">
                      <option value="">Select location</option>
                      {['New York, USA','London, UK','Berlin, Germany','Mumbai, India','Tokyo, Japan','Sydney, Australia'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-outline">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={profileMut.isPending}>
                    {profileMut.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Change Password</div>
              {pwErr && (
                <div style={{ color: 'var(--red)', background: 'var(--red-dim)', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: '0.85rem' }}>
                  {pwErr}
                </div>
              )}
              <form onSubmit={submitPassword}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Current Password</label>
                    <input name="currentPassword" type="password" value={pwForm.currentPassword} onChange={changePw} className="form-input" placeholder="Enter current password"/>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password</label>
                    <input name="newPassword" type="password" value={pwForm.newPassword} onChange={changePw} className="form-input" placeholder="Enter new password"/>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Confirm New Password</label>
                    <input name="confirmPassword" type="password" value={pwForm.confirmPassword} onChange={changePw} className="form-input" placeholder="Confirm new password"/>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={pwMut.isPending}>
                    🔒 {pwMut.isPending ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === 'notifications' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Notification Preferences</div>
          {notifSettings.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--purple-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color="var(--purple)"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked={s.on}/>
                <span className="toggle-slider"/>
              </label>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-primary">Save Preferences</button>
          </div>
        </div>
      )}

      {/* ── ACCOUNT TAB ── */}
      {tab === 'account' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Account Settings</div>
          {accountToggles.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--purple-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={16} color="var(--purple)"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked={s.on}/>
                <span className="toggle-slider"/>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* ── PREFERENCES TAB ── */}
      {tab === 'preferences' && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚧</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Preferences</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This section will be available soon.</p>
        </div>
      )}
    </div>
  )
}
