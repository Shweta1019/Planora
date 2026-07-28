import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../../../api/authApi'
import {
  Lock, Eye, EyeOff, Loader2, CheckCircle, Mail
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' })
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const mismatch =
    form.newPassword && form.confirmPassword &&
    form.newPassword !== form.confirmPassword

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields.'); return
    }
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (mismatch) {
      setError('Passwords do not match.'); return
    }

    setLoading(true)
    try {
      await authApi.forgotPassword({ email: form.email, newPassword: form.newPassword })
      setSuccess(true)
      // Log out after reset so the new password takes effect cleanly
      setTimeout(() => {
        logout()
        navigate('/login')
      }, 2000)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || ''
      setError(msg || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ══ Content Area ════════════════════════ */}
      <main style={{
        flex: 1,
        marginLeft: 0,
        minHeight: '100vh',
        background: '#f5f3ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative dot grid — top right */}
        <div style={{
          position: 'absolute', top: 24, right: 24,
          display: 'grid', gridTemplateColumns: 'repeat(7,8px)', gap: 5,
          opacity: 0.35,
        }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed' }} />
          ))}
        </div>

        {/* Decorative dot grid — bottom left */}
        <div style={{
          position: 'absolute', bottom: 40, left: 240,
          display: 'grid', gridTemplateColumns: 'repeat(6,8px)', gap: 5,
          opacity: 0.25,
        }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed' }} />
          ))}
        </div>

        {/* ── The White Card ──────────────────────────────────── */}
        {success ? (
          /* ── Success State ── */
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 44px',
            width: '100%', maxWidth: 440, textAlign: 'center',
            boxShadow: '0 8px 40px rgba(124,58,237,0.10)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 8, color: '#1e1b4b' }}>
              Password Reset Successful!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 6 }}>
              Your password has been updated.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
              Signing you out and redirecting to login…
            </p>
            <div style={{ marginTop: 24 }}>
              <Loader2 size={22} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 44px',
            width: '100%', maxWidth: 440,
            boxShadow: '0 8px 40px rgba(124,58,237,0.10)',
          }}>

            {/* Lock icon circle */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Lock size={32} color="#6d28d9" strokeWidth={1.8} />
              </div>
              <h1 style={{
                fontWeight: 800, fontSize: '1.5rem', color: '#1e1b4b', marginBottom: 8,
              }}>
                Reset Password
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Enter your new password below to reset your password.
              </p>
            </div>



            {/* Error alert */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                fontSize: '0.83rem',
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} noValidate>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontSize: '0.88rem', fontWeight: 600,
                  color: '#374151', marginBottom: 8,
                }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: '#9ca3af',
                  }} />
                  <input
                    id="fp-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={change}
                    style={{
                      width: '100%', padding: '13px 14px 13px 42px',
                      border: '1.5px solid #e5e7eb', borderRadius: 10,
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                      background: '#fff', color: '#111827',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontSize: '0.88rem', fontWeight: 600,
                  color: '#374151', marginBottom: 8,
                }}>
                  New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: '#9ca3af',
                  }} />
                  <input
                    id="fp-new"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={form.newPassword}
                    onChange={change}
                    autoFocus
                    autoComplete="new-password"
                    style={{
                      width: '100%', padding: '13px 44px 13px 42px',
                      border: '1.5px solid #e5e7eb', borderRadius: 10,
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                      background: '#fff', color: '#111827',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', padding: 0, display: 'flex',
                    }}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: 'block', fontSize: '0.88rem', fontWeight: 600,
                  color: '#374151', marginBottom: 8,
                }}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: '#9ca3af',
                  }} />
                  <input
                    id="fp-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={change}
                    autoComplete="new-password"
                    style={{
                      width: '100%', padding: '13px 44px 13px 42px',
                      border: `1.5px solid ${mismatch ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: 10, fontSize: '0.9rem', outline: 'none',
                      boxSizing: 'border-box', background: '#fff', color: '#111827',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => { if (!mismatch) e.target.style.borderColor = '#7c3aed' }}
                    onBlur={e => { if (!mismatch) e.target.style.borderColor = '#e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', padding: 0, display: 'flex',
                    }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mismatch && (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
                    Passwords do not match
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                id="fp-submit-btn"
                type="submit"
                disabled={loading || !!mismatch}
                style={{
                  width: '100%', padding: '14px',
                  background: loading || mismatch ? '#a78bfa' : '#5b21b6',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: '1rem', fontWeight: 700, cursor: loading || mismatch ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s, transform 0.1s',
                  boxShadow: '0 4px 14px rgba(91,33,182,0.35)',
                }}
                onMouseEnter={e => { if (!loading && !mismatch) e.target.style.background = '#4c1d95' }}
                onMouseLeave={e => { if (!loading && !mismatch) e.target.style.background = '#5b21b6' }}
              >
                {loading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</>
                  : 'Submit'
                }
              </button>

            </form>

          </div>
        )}

      </main>

      {/* Spin keyframe (inline) */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

    </div>
  )
}