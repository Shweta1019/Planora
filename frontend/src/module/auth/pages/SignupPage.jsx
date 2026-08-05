import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../../api/authApi'
import {
  Mail, Lock, Eye, EyeOff, Loader2, User, Briefcase,
  Users, TrendingUp, CheckCircle, UserPlus,
} from 'lucide-react'

/* ── Departments ─────────────────────────────────────────── */
const DEPARTMENTS = [
  'Engineering', 'Design', 'Product Management', 'Marketing',
  'Sales', 'Human Resources', 'Finance', 'Operations',
  'Quality Assurance', 'Research & Development', 'Administration',
]

/* ── Roles ───────────────────────────────────────────────── */
const ROLES = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'ADMIN', label: 'Admin' },
]

export default function SignupPage() {
  const navigate = useNavigate()


  // Removed 'terms' from state since we removed the checkbox
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    designation: '',
    department: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoad] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check if passwords mismatch in real-time
  const isPasswordMismatch = form.password && form.confirmPassword && form.password !== form.confirmPassword;

  function change(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.fullName.trim() || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields.'); return
    }
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address (e.g., user@example.com).'); return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }

    const nameParts = form.fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || '.'

    setLoad(true)
    try {
      await authApi.register({
        firstName,
        lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        designation: form.designation,
        department: form.department,
      })

      setSuccess(`Account for ${form.fullName} created successfully! Redirecting...`)
      setForm({
        fullName: '', email: '', password: '', confirmPassword: '',
        role: 'EMPLOYEE', designation: '', department: '',
      })

      // Redirect to login page after 1.5 seconds of successful signup
      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── Floating Card ── */}
      <div className="login-card" style={{ maxWidth: 980 }}>

        {/* ── Left — branding panel ── */}
        <div className="login-left">
          <div className="login-left-inner">

            {/* Logo row */}
            <div className="login-brand-row">
              <div className="login-logo-box" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
                P
              </div>
              <span className="login-brand-name">Planora</span>
            </div>

            {/* Heading & tagline */}
            <h2 className="login-left-heading">
              Create.<br />Collaborate.<br />Succeed.
            </h2>
            <p className="login-left-desc">
              Create your account and start collaborating with your team.
              Manage projects, track tasks, and deliver results efficiently.
            </p>

            {/* Feature list */}
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: <Users size={16} />, text: 'Team Collaboration' },
                { icon: <TrendingUp size={16} />, text: 'Track Progress' },
                { icon: <CheckCircle size={16} />, text: 'Deliver Results' },
              ].map(f => (
                <div
                  key={f.text}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    color: 'rgba(255,255,255,0.88)', fontSize: '0.88rem',
                  }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {f.icon}
                  </span>
                  {f.text}
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="login-illustration">
              <svg viewBox="0 0 340 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="80" y="40" width="180" height="130" rx="8" fill="white" fillOpacity="0.15" />
                <rect x="90" y="50" width="160" height="110" rx="4" fill="white" fillOpacity="0.25" />
                <rect x="145" y="170" width="50" height="10" rx="2" fill="white" fillOpacity="0.2" />
                <rect x="120" y="180" width="100" height="5" rx="2" fill="white" fillOpacity="0.2" />
                <rect x="110" y="110" width="20" height="40" rx="2" fill="#a78bfa" />
                <rect x="138" y="95" width="20" height="55" rx="2" fill="#818cf8" />
                <rect x="166" y="125" width="20" height="25" rx="2" fill="#6ee7b7" />
                <rect x="194" y="105" width="20" height="45" rx="2" fill="#fbbf24" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="#a78bfa" strokeWidth="8" strokeDasharray="53 123" strokeDashoffset="-20" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="#6ee7b7" strokeWidth="8" strokeDasharray="35 141" strokeDashoffset="-73" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="88 88" strokeDashoffset="-108" />
                <rect x="210" y="130" width="56" height="8" rx="2" fill="white" fillOpacity="0.2" />
                <rect x="210" y="143" width="40" height="8" rx="2" fill="white" fillOpacity="0.2" />
                <circle cx="207" cy="134" r="3" fill="#6ee7b7" />
                <circle cx="207" cy="147" r="3" fill="#a78bfa" />
                <circle cx="75" cy="165" r="12" fill="white" fillOpacity="0.3" />
                <rect x="66" y="177" width="18" height="32" rx="4" fill="white" fillOpacity="0.25" />
                <circle cx="270" cy="170" r="11" fill="white" fillOpacity="0.3" />
                <rect x="255" y="181" width="30" height="20" rx="4" fill="white" fillOpacity="0.2" />
                <circle cx="280" cy="60" r="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                <circle cx="280" cy="60" r="5" fill="white" fillOpacity="0.2" />
                <circle cx="300" cy="80" r="7" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                <rect x="44" y="195" width="8" height="20" rx="2" fill="white" fillOpacity="0.2" />
                <ellipse cx="40" cy="190" rx="8" ry="10" fill="white" fillOpacity="0.2" />
                <ellipse cx="52" cy="185" rx="6" ry="8" fill="white" fillOpacity="0.15" />
              </svg>
            </div>

          </div>
        </div>

        {/* ── Right — form panel ── */}
        <div className="login-right">
          <div className="login-form-card" style={{ maxWidth: 440 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #7c6ff7, #6c63f0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <UserPlus size={20} color="white" />
              </div>
              <div>
                <h1 className="login-form-heading" style={{ marginBottom: 0 }}>Create Account</h1>
                <p className="login-form-sub" style={{ marginTop: 2 }}>Plan Smarter. Track Better. Deliver Faster.</p>
              </div>
            </div>

            {/* Alerts */}
            {error && <div className="login-alert" style={{ marginTop: 16 }}>{error}</div>}
            {success && (
              <div className="login-success" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'green' }}>
                <CheckCircle size={16} /> {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} noValidate style={{ marginTop: 20 }}>

              {/* Row 1: Full Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="fullName">
                    Full Name <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <div className="form-input-wrap">
                    <User size={15} className="input-icon left" />
                    <input
                      id="fullName" name="fullName" type="text"
                      className="form-input input-icon-left"
                      placeholder="Enter full name"
                      value={form.fullName} onChange={change} autoFocus
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="email">
                    Email Address <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <div className="form-input-wrap">
                    <Mail size={15} className="input-icon left" />
                    <input
                      id="email" name="email" type="email"
                      className="form-input input-icon-left"
                      placeholder="Enter email address"
                      value={form.email} onChange={change} autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Password + Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="password">
                    Password <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <div className="form-input-wrap">
                    <Lock size={15} className="input-icon left" />
                    <input
                      id="password" name="password"
                      type={showPass ? 'text' : 'password'}
                      className="form-input input-icon-left"
                      style={{ paddingRight: 38 }}
                      placeholder="Min. 6 characters"
                      value={form.password} onChange={change}
                    />
                    <button type="button" className="input-icon right"
                      onClick={() => setShowPass(v => !v)} tabIndex={-1}
                      aria-label={showPass ? 'Hide' : 'Show'}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <div className="form-input-wrap">
                    <Lock size={15} className="input-icon left" />
                    <input
                      id="confirmPassword" name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      className="form-input input-icon-left"
                      style={{
                        paddingRight: 38,
                        border: isPasswordMismatch ? '1.5px solid red' : undefined // Real-time validation red border
                      }}
                      placeholder="Repeat password"
                      value={form.confirmPassword} onChange={change}
                    />
                    <button type="button" className="input-icon right"
                      onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                      aria-label={showConfirm ? 'Hide' : 'Show'}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Validation Error Message */}
                  {isPasswordMismatch && (
                    <span style={{ color: 'red', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Role + Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="role">
                    Role <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <select id="role" name="role" className="form-select"
                    value={form.role} onChange={change}>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="designation">Designation</label>
                  <div className="form-input-wrap">
                    <Briefcase size={15} className="input-icon left" />
                    <input
                      id="designation" name="designation" type="text"
                      className="form-input input-icon-left"
                      placeholder="e.g. Software Engineer"
                      value={form.designation} onChange={change}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Department — full width */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="department">Department</label>
                <select id="department" name="department" className="form-select"
                  value={form.department} onChange={change}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="signup-btn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '0.95rem' }}
                disabled={loading || isPasswordMismatch}
              >
                {loading
                  ? <><Loader2 size={16} className="spin-anim" /> Creating…</>
                  : <><UserPlus size={15} /> Create Account</>
                }
              </button>

            </form>

            {/* Sign in link */}
            <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 20 }}>
              Already have an account?{' '}
              <span
                style={{ color: 'var(--purple)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => navigate('/login')}
              >
                Sign in
              </span>
            </p>

          </div>
        </div>

      </div>

      {/* Footer */}
      <p className="login-page-footer">© 2026 Planora. All rights reserved.</p>

    </div>
  )
}