import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../../../api/authApi'
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone } from 'lucide-react'

const ROLES = [
  { value: 'EMPLOYEE', label: 'Employee', icon: '👤' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', icon: '📁' },
  { value: 'ADMIN', label: 'Admin', icon: '🔵' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    phoneNo: '',
    role: 'EMPLOYEE',
  })
  const [showPass, setShow] = useState(false)
  const [loading, setLoad] = useState(false)
  const [error, setError] = useState('')

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields'); return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    setLoad(true)
    try {
      const res = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNo: form.phoneNo,
        role: form.role,
      })
      const d = res.data?.data || res.data
      setAuth(d.token, {
        userId: d.userId,
        fullName: d.fullName || `${form.firstName} ${form.lastName}`.trim(),
        email: d.email,
        role: d.role,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Left panel */}
        <div className="login-left">
          <div className="login-left-inner">
            <div className="login-brand-row">
              <div className="login-logo-box">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2" />
                  <path d="M8 24V10l8-4 8 4v14l-8 4-8-4z" fill="white" fillOpacity="0.9" />
                  <path d="M16 6v20M8 10l8 4 8-4" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="login-brand-name">Planora</span>
            </div>

            <h2 className="login-left-heading">
              Join Planora Today
            </h2>
            <p className="login-left-desc">
              Create your account and start collaborating with your team.
              Manage projects, track tasks, and deliver results efficiently.
            </p>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📊', text: 'Real-time project tracking' },
                { icon: '✅', text: 'Task management & assignments' },
                { icon: '📁', text: 'File sharing & documents' },
                { icon: '🔔', text: 'Instant notifications' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{f.text}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* Right panel — signup form */}
        <div className="login-right" style={{ padding: '32px 44px', overflowY: 'auto' }}>
          <div className="login-form-card">

            <h1 className="login-form-heading">Create Account</h1>
            <p className="login-form-sub">Fill in your details to get started</p>

            {error && <div className="login-alert">{error}</div>}

            <form onSubmit={submit}>

              {/* Role selector — pill style */}
              <div className="form-group">
                <label className="form-label">Choose your Role *</label>
                <div style={{
                  display: 'inline-flex', background: '#f3f4f6',
                  borderRadius: 24, padding: 3, gap: 0,
                }}>
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 20,
                        fontSize: '0.82rem', fontWeight: form.role === r.value ? 600 : 400,
                        background: form.role === r.value ? '#fff' : 'transparent',
                        color: form.role === r.value ? '#1f2937' : '#6b7280',
                        boxShadow: form.role === r.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="firstName">First Name *</label>
                  <div className="form-input-wrap">
                    <User size={15} className="input-icon left" />
                    <input id="firstName" name="firstName" type="text"
                      className="form-input input-icon-left"
                      placeholder="First name"
                      value={form.firstName} onChange={change} autoFocus />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="lastName">Last Name *</label>
                  <div className="form-input-wrap">
                    <User size={15} className="input-icon left" />
                    <input id="lastName" name="lastName" type="text"
                      className="form-input input-icon-left"
                      placeholder="Last name"
                      value={form.lastName} onChange={change} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email *</label>
                <div className="form-input-wrap">
                  <Mail size={15} className="input-icon left" />
                  <input id="email" name="email" type="email"
                    className="form-input input-icon-left"
                    placeholder="Enter your email"
                    value={form.email} onChange={change} autoComplete="email" />
                </div>
              </div>

              {/* Password row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="password">Password *</label>
                  <div className="form-input-wrap">
                    <Lock size={15} className="input-icon left" />
                    <input id="password" name="password"
                      type={showPass ? 'text' : 'password'}
                      className="form-input input-icon-left"
                      style={{ paddingRight: 36 }}
                      placeholder="Min 6 chars"
                      value={form.password} onChange={change} />
                    <button type="button" className="input-icon right"
                      onClick={() => setShow(v => !v)} tabIndex={-1}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="confirmPassword">Confirm *</label>
                  <div className="form-input-wrap">
                    <Lock size={15} className="input-icon left" />
                    <input id="confirmPassword" name="confirmPassword"
                      type={showPass ? 'text' : 'password'}
                      className="form-input input-icon-left"
                      placeholder="Repeat password"
                      value={form.confirmPassword} onChange={change} />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="phoneNo">Phone</label>
                <div className="form-input-wrap">
                  <Phone size={15} className="input-icon left" />
                  <input id="phoneNo" name="phoneNo" type="tel"
                    className="form-input input-icon-left"
                    placeholder="Phone number (optional)"
                    value={form.phoneNo} onChange={change} />
                </div>
              </div>

              <button
                type="submit"
                id="signup-btn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '0.95rem', marginTop: 4 }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={16} className="spin-anim" /> Creating account…</>
                  : 'Create Account'
                }
              </button>
            </form>

            <p className="login-signup-text" style={{ marginTop: 18 }}>
              Already have an account?{' '}
              <Link to="/login" className="login-signup-link">Log in</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
