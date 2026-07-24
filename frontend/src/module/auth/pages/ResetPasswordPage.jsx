import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { Lock, Eye, EyeOff, Loader2, KeyRound, ShieldCheck, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate  = useNavigate()
  const logout    = useAuthStore(s => s.logout)

  const [form, setForm]               = useState({ newPassword: '', confirmPassword: '' })
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)

  const mismatch = form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields.'); return
    }
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.'); return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({ newPassword: form.newPassword })
      setSuccess(true)
      // Log out and redirect to login after 2s so the new password takes effect
      setTimeout(() => {
        logout()
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── strength meter ──────────────────────────────────────── */
  function strength(pw) {
    if (!pw) return { level: 0, label: '', color: 'transparent' }
    let score = 0
    if (pw.length >= 6)  score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { level: 1, label: 'Weak',   color: '#ef4444' }
    if (score <= 3) return { level: 2, label: 'Fair',   color: '#f59e0b' }
    if (score <= 4) return { level: 3, label: 'Good',   color: '#10b981' }
    return               { level: 4, label: 'Strong', color: '#6366f1' }
  }

  const str = strength(form.newPassword)

  return (
    <div>

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}>
            <KeyRound size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-heading">Reset Password</h1>
            <p className="page-subheading">Set a new password for your account. You will be signed out after resetting.</p>
          </div>
        </div>
      </div>

      {/* ── Centered content area ────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* ── Success state ─────────────────────────────────── */}
          {success ? (
            <div className="card" style={{ textAlign: 'center', padding: '52px 40px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={36} color="#10b981" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                Password Reset Successful!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>
                Your password has been updated.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                Redirecting you to the login page…
              </p>
              <div style={{ marginTop: 20 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            </div>
          ) : (

          /* ── Form card ────────────────────────────────────── */
          <div className="card" style={{ padding: '32px 36px' }}>

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--purple-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ShieldCheck size={18} color="var(--purple)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Change Password
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Enter and confirm your new password below
                </div>
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <div style={{
                background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--red)', borderRadius: 8, padding: '10px 14px',
                fontSize: '0.85rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={submit} noValidate>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="rp-new">
                  New Password <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <div className="form-input-wrap">
                  <Lock size={15} className="input-icon left" />
                  <input
                    id="rp-new"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    className="form-input input-icon-left"
                    style={{ paddingRight: 40 }}
                    placeholder="Enter new password"
                    value={form.newPassword}
                    onChange={change}
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-icon right"
                    onClick={() => setShowNew(v => !v)}
                    tabIndex={-1}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength bar — only shows when user starts typing */}
                {form.newPassword && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 4,
                          background: i <= str.level ? str.color : 'var(--border)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: str.color, fontWeight: 600 }}>
                      {str.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="rp-confirm">
                  Confirm Password <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <div className="form-input-wrap">
                  <Lock size={15} className="input-icon left" />
                  <input
                    id="rp-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="form-input input-icon-left"
                    style={{
                      paddingRight: 40,
                      borderColor: mismatch ? 'var(--red)' : undefined,
                      boxShadow:   mismatch ? '0 0 0 3px rgba(239,68,68,0.12)' : undefined,
                    }}
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={change}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-icon right"
                    onClick={() => setShowConfirm(v => !v)}
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {mismatch && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: 2, display: 'block' }}>
                    Passwords do not match
                  </span>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 24px' }} />

              {/* Submit */}
              <button
                id="reset-password-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
                disabled={loading || !!mismatch}
              >
                {loading
                  ? <><Loader2 size={16} className="spin-anim" /> Resetting…</>
                  : <><KeyRound size={15} /> Submit</>
                }
              </button>

            </form>

            {/* Info note */}
            <p style={{
              textAlign: 'center', fontSize: '0.78rem',
              color: 'var(--text-muted)', marginTop: 18, lineHeight: 1.5,
            }}>
              After resetting, you will be automatically signed out<br />
              and redirected to the login page.
            </p>

          </div>
          )}

        </div>
      </div>

    </div>
  )
}
