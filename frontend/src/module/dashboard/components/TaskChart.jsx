import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer
} from 'recharts'

const BARS = [
  { label: 'Completed',   key: 'completedTasks',  color: '#10b981' },
  { label: 'In Progress', key: 'pendingTasks',     color: '#6366f1' },
  { label: 'On Hold',     key: 'onHoldTasks',      color: '#f59e0b' },
  { label: 'Not Started', key: 'notStartedTasks',  color: '#9ca3af' },
  { label: 'Cancelled',   key: 'cancelledTasks',   color: '#ef4444' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>Tasks: <strong>{payload[0]?.value}</strong></p>
    </div>
  )
}

export default function TaskChart({ stats }) {
  const data = BARS.map(b => ({
    name:  b.label,
    value: stats?.[b.key] || 0,
    color: b.color,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={36} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
