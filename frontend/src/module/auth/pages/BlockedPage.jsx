import { useAuthStore } from '../../../store/authStore'
import { Ban, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BlockedPage() {
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-body, #f8fafc)', padding: 20, textAlign: 'center'
    }}>
      <div style={{
        background: 'var(--bg-card, #fff)', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        maxWidth: 400, width: '100%', border: '1px solid var(--border, #e2e8f0)'
      }}>
        <Ban size={48} color="#dc2626" style={{ marginBottom: 20 }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)', marginBottom: 12 }}>
          Access Restricted
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary, #64748b)', marginBottom: 30, lineHeight: 1.5 }}>
          You are blocked or your account is suspended by the admin. Please contact the admin.
        </p>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px', background: 'var(--purple, #7c3aed)',
            color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: '1rem', fontWeight: 600
          }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  )
}
