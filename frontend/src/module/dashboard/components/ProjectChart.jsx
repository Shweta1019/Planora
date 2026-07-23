import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const STATUSES = [
  { key: 'completedProjects', label: 'Completed',   color: '#10b981' },
  { key: 'activeProjects',    label: 'In Progress',  color: '#6366f1' },
  { key: 'onHoldProjects',    label: 'On Hold',      color: '#f59e0b' },
  { key: 'planningProjects',  label: 'Not Started',  color: '#9ca3af' },
  { key: 'cancelledProjects', label: 'Cancelled',    color: '#ef4444' },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
      <span style={{ color: payload[0].payload.color, fontWeight: 600 }}>{payload[0].name}: </span>
      <strong>{payload[0].value}</strong>
    </div>
  )
}

export default function ProjectChart({ stats }) {
  const data = STATUSES.map(s => ({
    name:  s.label,
    value: stats?.[s.key] || 0,
    color: s.color,
  })).filter(d => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  if (!data.length) return (
    <div className="empty-state" style={{ padding: '30px 0' }}>
      <p>No project data yet</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
            dataKey="value" paddingAngle={2}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: d.color }} />
            <span>{d.name}</span>
            <span className="legend-val" style={{ color: d.color }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
