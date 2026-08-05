import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, Calendar, CheckSquare, Clock,
  AlertCircle, Bell, FolderKanban, FileText
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatDate } from '../../../utils/formatDate'

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#eab308',
  red: '#ef4444',
  purple: '#8b5cf6',
  gray: '#94a3b8',
}

export default function DashboardEmployee({ tasks = [], projects = [], activities = [], user }) {
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    
    const assigned = tasks.length
    const dueToday = tasks.filter(t => t.dueDate?.slice(0, 10) === todayStr).length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'COMPLETED').length
    const highPriority = tasks.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length
    
    const myProjectIds = [...new Set(tasks.map(t => t.projectId).filter(Boolean))]
    const activeProjects = myProjectIds.length 

    return { assigned, dueToday, inProgress, completed, overdue, highPriority, activeProjects }
  }, [tasks])

  const taskStatusData = useMemo(() => {
    const s = { 'To Do': 0, 'In Progress': 0, 'Review': 0, 'Completed': 0 }
    tasks.forEach(t => {
      if (t.status === 'PLANNING' || t.status === 'TODO' || !t.status) s['To Do']++
      else if (t.status === 'IN_PROGRESS') s['In Progress']++
      else if (t.status === 'IN_REVIEW' || t.status === 'REVIEW' || t.status === 'ON_HOLD') s['Review']++
      else if (t.status === 'COMPLETED') s['Completed']++
    })
    return [
      { name: 'To Do', value: s['To Do'], color: COLORS.gray },
      { name: 'In Progress', value: s['In Progress'], color: COLORS.blue },
      { name: 'Review', value: s['Review'], color: COLORS.yellow },
      { name: 'Completed', value: s['Completed'], color: COLORS.green },
    ]
  }, [tasks])

  const priorityData = useMemo(() => {
    const s = { High: 0, Medium: 0, Low: 0 }
    tasks.forEach(t => {
      if (t.priority === 'HIGH' || t.priority === 'CRITICAL') s.High++
      else if (t.priority === 'MEDIUM') s.Medium++
      else s.Low++
    })
    return [
      { name: 'High', value: s.High, color: COLORS.red },
      { name: 'Medium', value: s.Medium, color: COLORS.yellow },
      { name: 'Low', value: s.Low, color: COLORS.green },
    ]
  }, [tasks])

  const compVsPendData = useMemo(() => {
    const comp = tasks.filter(t => t.status === 'COMPLETED').length
    const pend = tasks.length - comp
    return [
      { name: 'Completed', value: comp, color: COLORS.green },
      { name: 'Pending', value: pend, color: COLORS.purple },
    ]
  }, [tasks])



  return (
    <div className="dashboard-layout">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Dashboard</h1>
        </div>
      </div>

      <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <EmployeeStatCard icon={ClipboardList} color="#f3e8ff" iconColor="#a855f7" title="My Assigned Tasks" value={stats.assigned} linkText="View assigned tasks" onClick={() => navigate('/tasks')} />
        <EmployeeStatCard icon={Calendar} color="#ffedd5" iconColor="#f97316" title="Tasks Due Today" value={stats.dueToday} linkText="View today's tasks" onClick={() => navigate('/tasks?tab=today')} />
        <EmployeeStatCard icon={CheckSquare} color="#e0f2fe" iconColor="#3b82f6" title="In Progress" value={stats.inProgress} linkText="View in-progress tasks" onClick={() => navigate('/tasks')} />
        <EmployeeStatCard icon={CheckSquare} color="#dcfce7" iconColor="#22c55e" title="Completed Tasks" value={stats.completed} linkText="View completed tasks" onClick={() => navigate('/tasks')} />
        <EmployeeStatCard icon={AlertCircle} color="#fee2e2" iconColor="#ef4444" title="Overdue Tasks" value={stats.overdue} linkText="View overdue tasks" onClick={() => navigate('/tasks')} />
        <EmployeeStatCard icon={FolderKanban} color="#e0f2fe" iconColor="#3b82f6" title="My Projects" value={stats.activeProjects} linkText="View my projects" onClick={() => navigate('/projects')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        <ChartCard title="My Task Status" data={taskStatusData} />
        <ChartCard title="Completed vs Pending Tasks" data={compVsPendData} />
        <ChartCard title="Tasks by Priority" data={priorityData} />
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        <ListCard title="Today's Tasks" items={tasks.slice(0, 4)} type="task" onViewAll={() => navigate('/tasks')} />
        <ListCard title="My Active Projects" items={projects.slice(0, 4)} type="project" onViewAll={() => navigate('/projects')} />
        <ListCard title="My Upcoming Deadlines" items={tasks.filter(t => t.dueDate).slice(0, 4)} type="deadline" onViewAll={() => navigate('/tasks')} />
      </div>
    </div>
  )
}

function EmployeeStatCard({ icon: Icon, color, iconColor, title, value, linkText, onClick }) {
  return (
    <div className="card" onClick={onClick} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, cursor: onClick ? 'pointer' : 'default', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: color, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: iconColor, marginTop: 'auto' }}>
        {linkText} →
      </div>
    </div>
  )
}

function ChartCard({ title, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="card chart-card">
      <p className="chart-title">{title}</p>
      <div style={{ height: 180, marginTop: 20, display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
            <ReTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, paddingLeft: 10 }}>
          {data.map((d, i) => {
            const pct = total ? Math.round((d.value/total)*100) : 0
            return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>{d.value}</span>
                <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  )
}

function ListCard({ title, items, type, onViewAll }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
        {onViewAll && <span style={{ color: COLORS.purple, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }} onClick={onViewAll}>View All</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data available.</div> : null}
        {items.map((item, i) => {
          if (type === 'project') {
            const pct = (item.status === 'COMPLETED' || item.status === 'Completed') ? 100 : (item.completionPercentage || 0);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#f3e8ff', color: '#a855f7', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.projectName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.createdAt)?.slice(0, 6) || 'N/A'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 100 }}>
                  <div style={{ height: 6, flex: 1, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: COLORS.purple, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{pct}%</span>
                </div>
              </div>
            )
          }
          if (type === 'task') return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#f3e8ff', color: '#a855f7', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ClipboardList size={16} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.taskName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.projectName || 'Project Task'}</div>
              </div>
              {title === 'Today\'s Tasks' ? 
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: item.priority==='HIGH'?'#fee2e2':'#fef9c3', color: item.priority==='HIGH'?'#ef4444':'#eab308' }}>{item.priority || 'Medium'}</span> :
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.createdAt)?.slice(0,6) || 'N/A'}</span>
              }
            </div>
          )
          if (type === 'deadline') return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#e0f2fe', color: '#3b82f6', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={16} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.taskName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.projectName || 'Project Task'}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.dueDate)?.slice(0,6) || 'N/A'}</span>
            </div>
          )
          return (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: '#f3e8ff', color: '#a855f7', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                <CheckSquare size={12} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.action || 'Action'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{item.description || 'No description available'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(item.createdAt) || '1 hr ago'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
