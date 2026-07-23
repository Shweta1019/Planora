import { initials, timeAgo } from '../../../utils/formatDate'

const ACTIVITY_COLORS = {
  PROJECT: '#6366f1', TASK: '#10b981', USER: '#3b82f6',
  EXPENSE: '#f59e0b', RESOURCE: '#f97316', DEFAULT: '#9ca3af',
}

export default function RecentActivities({ activities = [] }) {
  if (!activities.length) return (
    <div className="empty-state" style={{ padding: 24 }}><p>No recent activity</p></div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {activities.map((a, i) => {
        const color = ACTIVITY_COLORS[a.entityType] || ACTIVITY_COLORS.DEFAULT
        return (
          <div key={a.logId || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: color + '18', color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700,
            }}>
              {initials(a.userFullName || 'Sy')}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                <strong>{a.userFullName || 'System'}</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{a.description || `${a.action?.toLowerCase()} ${a.entityType?.toLowerCase()}`}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {timeAgo(a.createdAt)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
