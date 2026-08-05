import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../../../api/authApi'
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Briefcase, User } from 'lucide-react'



export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPass, setShow] = useState(false)
  const [loading, setLoad] = useState(false)
  const [error, setError] = useState('')

  // 1. Remember Me - Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('planora_email');
    if (savedEmail) {
      setForm(f => ({ ...f, email: savedEmail, remember: true }));
    }
  }, []);

  function change(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoad(true)
    try {
      // Only send email + password — backend determines the role from the DB
      const res = await authApi.login({ email: form.email, password: form.password })

      // Handle ApiResponse wrapper: { success, message, data: { token, ... } }
      const d = res.data?.data ?? res.data
      if (!d?.token) throw new Error('No token received')

      setAuth(d.token, {
        userId: d.userId,
        fullName: d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
        email: d.email,
        role: d.role,
        status: d.status,
        photoUrl: d.profileImage,
      }, form.remember)   // ← passes remember flag to store

      // Remember Me — save or clear the email for pre-fill on next visit
      if (form.remember) {
        localStorage.setItem('planora_email', form.email);
      } else {
        localStorage.removeItem('planora_email');
      }

      // 3. Navigate to Dashboard
      navigate('/dashboard')
    } catch (err) {
      // If backend returns ACCOUNT_BLOCKED (403) redirect to the blocked page
      const msg = err.response?.data?.message || err.response?.data || ''
      if (msg === 'ACCOUNT_BLOCKED' || err.response?.status === 403) {
        navigate('/blocked', { replace: true })
        return
      }
      // 4. Custom Error messages from backend (e.g. "Wrong user", "Wrong password")
      if (msg === 'Wrong user') {
        setError('User does not exist. Please contact admin.')
      } else {
        setError(msg || 'Invalid email or password.')
      }

    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── Floating Card ── */}
      <div className="login-card">

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
              Manage Projects.<br />Track Progress.<br />Achieve Success.
            </h2>
            <p className="login-left-desc">
              Project Monitoring &amp; Management System
            </p>

            {/* Illustration */}
            <div className="login-illustration">
              <svg viewBox="0 0 340 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Monitor */}
                <rect x="80" y="40" width="180" height="130" rx="8" fill="white" fillOpacity="0.15" />
                <rect x="90" y="50" width="160" height="110" rx="4" fill="white" fillOpacity="0.25" />
                <rect x="145" y="170" width="50" height="10" rx="2" fill="white" fillOpacity="0.2" />
                <rect x="120" y="180" width="100" height="5" rx="2" fill="white" fillOpacity="0.2" />
                {/* Chart bars */}
                <rect x="110" y="110" width="20" height="40" rx="2" fill="#a78bfa" />
                <rect x="138" y="95" width="20" height="55" rx="2" fill="#818cf8" />
                <rect x="166" y="125" width="20" height="25" rx="2" fill="#6ee7b7" />
                <rect x="194" y="105" width="20" height="45" rx="2" fill="#fbbf24" />
                {/* Pie chart ring */}
                <circle cx="238" cy="95" r="28" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="#a78bfa" strokeWidth="8" strokeDasharray="53 123" strokeDashoffset="-20" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="#6ee7b7" strokeWidth="8" strokeDasharray="35 141" strokeDashoffset="-73" />
                <circle cx="238" cy="95" r="28" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="88 88" strokeDashoffset="-108" />
                {/* Checklist */}
                <rect x="210" y="130" width="56" height="8" rx="2" fill="white" fillOpacity="0.2" />
                <rect x="210" y="143" width="40" height="8" rx="2" fill="white" fillOpacity="0.2" />
                <circle cx="207" cy="134" r="3" fill="#6ee7b7" />
                <circle cx="207" cy="147" r="3" fill="#a78bfa" />
                {/* People */}
                <circle cx="75" cy="165" r="12" fill="white" fillOpacity="0.3" />
                <rect x="66" y="177" width="18" height="32" rx="4" fill="white" fillOpacity="0.25" />
                <circle cx="270" cy="170" r="11" fill="white" fillOpacity="0.3" />
                <rect x="255" y="181" width="30" height="20" rx="4" fill="white" fillOpacity="0.2" />
                {/* Gear icons */}
                <circle cx="280" cy="60" r="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                <circle cx="280" cy="60" r="5" fill="white" fillOpacity="0.2" />
                <circle cx="300" cy="80" r="7" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                {/* Plant */}
                <rect x="44" y="195" width="8" height="20" rx="2" fill="white" fillOpacity="0.2" />
                <ellipse cx="40" cy="190" rx="8" ry="10" fill="white" fillOpacity="0.2" />
                <ellipse cx="52" cy="185" rx="6" ry="8" fill="white" fillOpacity="0.15" />
              </svg>
            </div>

          </div>
        </div>

        {/* ── Right — form panel ── */}
        <div className="login-right">
          <div className="login-form-card">

            <h1 className="login-form-heading">Welcome Back!</h1>
            <p className="login-form-sub">Sign in to continue to Planora</p>

            {/* Error alert */}
            {error && <div className="login-alert">{error}</div>}

            <form onSubmit={submit}>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="form-input-wrap">
                  <Mail size={15} className="input-icon left" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input input-icon-left"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={change}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="form-input-wrap">
                  <Lock size={15} className="input-icon left" />
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input input-icon-left"
                    style={{ paddingRight: 40 }}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={change}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-icon right"
                    onClick={() => setShow(v => !v)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot Password */}
              <div className="login-remember-row">
                <label className="login-remember-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={change}
                    style={{ accentColor: 'var(--purple)', width: 14, height: 14 }}
                  />
                  Remember me
                </label>
                {/* Forgot Password option hidden as requested */}
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                id="login-btn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '0.95rem', marginTop: 4 }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={16} className="spin-anim" /> Signing in…</>
                  : 'Sign In'
                }
              </button>

            </form>


          </div>
        </div>

      </div>

      {/* Footer */}
      <p className="login-page-footer">© 2026 Planora. All rights reserved.</p>

    </div>
  )
}