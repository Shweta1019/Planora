export default function StatsCard({ icon: Icon, color, label, value, change }) {
  const isUp   = change > 0
  const hasChange = change != null && change !== 0

  const colorMap = {
    purple: { bg: '#ede9fe', icon: '#7c3aed' },
    blue:   { bg: '#dbeafe', icon: '#2563eb' },
    green:  { bg: '#d1fae5', icon: '#059669' },
    yellow: { bg: '#fef3c7', icon: '#d97706' },
    red:    { bg: '#fee2e2', icon: '#dc2626' },
  }
  const c = colorMap[color] || colorMap.purple

  return (
    <div className="stat-card">
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={c.icon} strokeWidth={1.8} />
      </div>
      <div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
        {hasChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: isUp ? '#059669' : '#dc2626',
            }}>
              {isUp ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>from last week</span>
          </div>
        )}
      </div>
    </div>
  )
}
