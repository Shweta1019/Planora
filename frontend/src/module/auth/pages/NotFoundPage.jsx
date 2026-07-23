import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-main)' }}>
      <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--purple)', lineHeight: 1 }}>404</div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Page not found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        <Home size={16} /> Go to Dashboard
      </button>
    </div>
  )
}
