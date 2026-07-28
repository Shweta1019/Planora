import { useMemo } from 'react'
import {
  FileText, Users, ClipboardList, CheckSquare,
  Clock, Calendar, Wallet, CheckCircle2, AlertCircle
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatDate } from '../../../utils/formatDate'

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#eab308',
  red: '#ef4444',
  purple: '#8b5cf6',
  gray: '#94a3b8',
}

export default function DashboardManager({ tasks = [], projects = [], activities = [], team = [], user }) {

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    
    const myProjects = projects.length
    const teamMembers = team.length
    const totalTasks = tasks.length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'COMPLETED').length
    const upcomingDeadlines = tasks.filter(t => t.dueDate && t.dueDate >= todayStr && t.status !== 'COMPLETED').length
    const remainingBudget = projects.reduce((acc, p) => acc + (p.totalBudget || p.budget || 0), 0)

    return { myProjects, teamMembers, totalTasks, inProgress, completed, overdue, upcomingDeadlines, remainingBudget }
  }, [projects, tasks, team])

  const taskStatusData = useMemo(() => {
    const s = { 'To Do': 0, 'In Progress': 0, 'Review': 0, 'Completed': 0 }
    tasks.forEach(t => {
      if (t.status === 'PLANNING' || t.status === 'TODO' || !t.status) s['To Do']++
      else if (t.status === 'IN_PROGRESS') s['In Progress']++
      else if (t.status === 'REVIEW' || t.status === 'ON_HOLD') s['Review']++
      else if (t.status === 'COMPLETED') s['Completed']++
    })
    return [
      { name: 'To Do', value: s['To Do'], color: COLORS.gray },
      { name: 'In Progress', value: s['In Progress'], color: COLORS.blue },
      { name: 'Review', value: s['Review'], color: COLORS.yellow },
      { name: 'Completed', value: s['Completed'], color: COLORS.green },
    ]
  }, [tasks])

  const projectProgressData = useMemo(() => {
    return projects.slice(0, 8).map((p, i) => ({
      name: `P${i+1}`,
      value: p.completionPercentage || Math.floor(Math.random() * 100),
      fullName: p.projectName
    }))
  }, [projects])

  const teamWorkloadData = useMemo(() => {
    return [
      { name: 'High', value: 5, color: COLORS.red },
      { name: 'Medium', value: 9, color: COLORS.yellow },
      { name: 'Low', value: 4, color: COLORS.green },
    ]
  }, [tasks])

  return (
    <div className="dashboard-layout">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Dashboard</h1>
        </div>
      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <ManagerStatCard icon={FileText} color="#e0f2fe" iconColor="#3b82f6" title="My Projects" value={stats.myProjects} subtext="↑ 2 this month" />
        <ManagerStatCard icon={Users} color="#e0f2fe" iconColor="#3b82f6" title="Team Members" value={stats.teamMembers} subtext="↑ 1 this month" />
        <ManagerStatCard icon={ClipboardList} color="#dcfce7" iconColor="#22c55e" title="Total Tasks" value={stats.totalTasks} subtext="↑ 8 this month" />
        <ManagerStatCard icon={CheckSquare} color="#fef9c3" iconColor="#eab308" title="Tasks in Progress" value={stats.inProgress} subtext={stats.totalTasks ? Math.round((stats.inProgress/stats.totalTasks)*100) + '%' : '0%'} />
        <ManagerStatCard icon={CheckCircle2} color="#dcfce7" iconColor="#22c55e" title="Completed Tasks" value={stats.completed} subtext={stats.totalTasks ? Math.round((stats.completed/stats.totalTasks)*100) + '%' : '0%'} />
        <ManagerStatCard icon={AlertCircle} color="#fee2e2" iconColor="#ef4444" title="Overdue Tasks" value={stats.overdue} subtext={stats.totalTasks ? Math.round((stats.overdue/stats.totalTasks)*100) + '%' : '0%'} />
        <ManagerStatCard icon={Calendar} color="#ffedd5" iconColor="#f97316" title="Upcoming Deadlines" value={stats.upcomingDeadlines} subtext="This Month" />
        <ManagerStatCard icon={Wallet} color="#f3e8ff" iconColor="#a855f7" title="Remaining Budget" value={formatINR(stats.remainingBudget)} subtext="42% Left" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, marginTop: 24 }}>
        <ChartCard title="Task Status" data={taskStatusData} />
        
        <div className="card chart-card">
          <p className="chart-title">Project Progress</p>
          <div style={{ height: 200, marginTop: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} margin={{ left: -25, bottom: -10 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v + '%'} />
                <ReTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v) => [v + '%', 'Progress']} labelFormatter={(v, arr) => arr?.[0]?.payload?.fullName || v} />
                <Bar dataKey="value" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ChartCard title="Team Workload" data={teamWorkloadData} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Active Projects</div>
            <a href="#" style={{ color: COLORS.purple, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {projects.slice(0, 4).map((p, i) => {
              const pct = p.completionPercentage || Math.floor(Math.random() * 100)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.projectName.length > 20 ? p.projectName.slice(0,20)+'...' : p.projectName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 140 }}>
                    <div style={{ height: 6, flex: 1, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COLORS.purple, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: 32 }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ListCard title="Tasks Awaiting Review" items={tasks.filter(t => t.status === 'REVIEW').slice(0, 3)} type="deadline" highlightDate />
        <ListCard title="Upcoming Deadlines" items={tasks.filter(t => t.dueDate).slice(0, 3)} type="deadline" />
        
        <ListCard title="Overdue Tasks" items={tasks.filter(t => t.dueDate && t.dueDate < new Date().toISOString().slice(0,10) && t.status !== 'COMPLETED').slice(0, 3)} type="overdue" highlightDate />
        <ListCard title="Recent Activities" items={activities.slice(0, 4)} type="activity" />
        
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Team Members Workload</div>
            <a href="#" style={{ color: COLORS.purple, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {team.slice(0, 4).map((u, i) => {
              const pct = [85, 70, 45, 30][i] || 50 // Mock workload percentage
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600, color: '#64748b' }}>
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{u.fullName || `${u.firstName} ${u.lastName}`}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.designation || 'Employee'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 100 }}>
                    <div style={{ height: 6, flex: 1, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COLORS.purple, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: 32 }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ManagerStatCard({ icon: Icon, color, iconColor, title, value, subtext }) {
  const isUp = subtext?.includes('↑')
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ background: color, color: iconColor, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: isUp ? '#10b981' : 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          {subtext}
        </div>
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

function ListCard({ title, items, type, highlightDate }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
        <a href="#" style={{ color: COLORS.purple, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>View All</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data available.</div> : null}
        {items.map((item, i) => {
          if (type === 'deadline' || type === 'overdue') return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: type==='overdue' ? '#fee2e2' : '#f3e8ff', color: type==='overdue' ? '#ef4444' : '#a855f7', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {type === 'overdue' ? <Calendar size={16} /> : <Calendar size={16} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.taskName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.projectName || 'Project Task'}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: highlightDate ? '#ef4444' : 'var(--text-muted)' }}>{highlightDate && 'Due: '}{formatDate(item.dueDate)?.slice(0,6) || 'N/A'}</span>
            </div>
          )
          if (type === 'activity') return (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: '#f3e8ff', color: '#a855f7', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                <CheckSquare size={12} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.action || 'Updated a task'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(item.createdAt) || '1 hr ago'}</div>
              </div>
            </div>
          )
          return null
        })}
      </div>
    </div>
  )
}
