import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Users, ClipboardList, CheckSquare,
  Clock, Calendar, Wallet, CheckCircle2, AlertCircle
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatDate, initials } from '../../../utils/formatDate'

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
  const navigate = useNavigate()

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
    const remainingBudget = projects.reduce((acc, p) => acc + ((p.budget || 0) - (p.spentAmount || 0)), 0)

    return { myProjects, teamMembers, totalTasks, inProgress, completed, overdue, upcomingDeadlines, remainingBudget }
  }, [projects, tasks, team])

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

  const projectProgressData = useMemo(() => {
    return projects.slice(0, 8).map((p, i) => ({
      name: p.projectName ? (p.projectName.length > 10 ? p.projectName.substring(0, 8) + '..' : p.projectName) : `P${i+1}`,
      value: (p.status === 'COMPLETED' || p.status === 'Completed') ? 100 : (p.completionPercentage || 0),
      fullName: p.projectName
    }))
  }, [projects])

  const teamWorkloadData = useMemo(() => {
    let high = 0, medium = 0, low = 0
    tasks.forEach(t => {
      if (t.priority === 'HIGH' || t.priority === 'CRITICAL') high++
      else if (t.priority === 'LOW') low++
      else medium++
    })
    return [
      { name: 'High', value: high, color: COLORS.red },
      { name: 'Medium', value: medium, color: COLORS.yellow },
      { name: 'Low', value: low, color: COLORS.green },
    ]
  }, [tasks])

  const awaitingReviewTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'IN_REVIEW' || t.status === 'REVIEW')
  }, [tasks])

  const upcomingDeadlineTasks = useMemo(() => {
    return tasks
      .filter(t => t.dueDate && t.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4)
  }, [tasks])

  const overdueTasks = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    return tasks
      .filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'COMPLETED')
      .slice(0, 4)
  }, [tasks])

  return (
    <div className="dashboard-layout">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Dashboard</h1>
        </div>
      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <ManagerStatCard icon={FileText} color="#e0f2fe" iconColor="#3b82f6" title="My Projects" value={stats.myProjects} subtext="View active projects" onClick={() => navigate('/projects')} />
        <ManagerStatCard icon={Users} color="#e0f2fe" iconColor="#3b82f6" title="Team Members" value={stats.teamMembers} subtext="View all members" onClick={() => navigate('/users')} />
        <ManagerStatCard icon={ClipboardList} color="#dcfce7" iconColor="#22c55e" title="Total Tasks" value={stats.totalTasks} subtext="View all tasks" onClick={() => navigate('/tasks')} />
        <ManagerStatCard icon={CheckSquare} color="#fef9c3" iconColor="#eab308" title="Tasks in Progress" value={stats.inProgress} subtext={stats.totalTasks ? Math.round((stats.inProgress/stats.totalTasks)*100) + '%' : '0%'} onClick={() => navigate('/tasks')} />
        <ManagerStatCard icon={CheckCircle2} color="#dcfce7" iconColor="#22c55e" title="Completed Tasks" value={stats.completed} subtext={stats.totalTasks ? Math.round((stats.completed/stats.totalTasks)*100) + '%' : '0%'} onClick={() => navigate('/tasks')} />
        <ManagerStatCard icon={AlertCircle} color="#fee2e2" iconColor="#ef4444" title="Overdue Tasks" value={stats.overdue} subtext={stats.totalTasks ? Math.round((stats.overdue/stats.totalTasks)*100) + '%' : '0%'} onClick={() => navigate('/tasks')} />
        <ManagerStatCard icon={Calendar} color="#ffedd5" iconColor="#f97316" title="Upcoming Deadlines" value={stats.upcomingDeadlines} subtext="This Month" onClick={() => navigate('/tasks')} />
        <ManagerStatCard icon={Wallet} color="#f3e8ff" iconColor="#a855f7" title="Remaining Budget" value={formatINR(stats.remainingBudget)} subtext="Allocated budget" onClick={() => navigate('/budgets')} />
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

      {/* Row 1: 3 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Active Projects</div>
            <span style={{ color: COLORS.purple, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/projects')}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {projects.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active projects.</div> : null}
            {projects.slice(0, 4).map((p, i) => {
              const pct = (p.status === 'COMPLETED' || p.status === 'Completed') ? 100 : (p.completionPercentage || 0)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.projectId}`)}>
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

        <ListCard 
          title="Tasks Awaiting Review" 
          items={awaitingReviewTasks.slice(0, 4)} 
          type="review" 
          onViewAll={() => navigate('/tasks')}
          onItemClick={() => navigate('/tasks')}
        />

        <ListCard 
          title="Upcoming Deadlines" 
          items={upcomingDeadlineTasks} 
          type="deadline" 
          onViewAll={() => navigate('/tasks')}
          onItemClick={() => navigate('/tasks')}
        />
      </div>

      {/* Row 2: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
        <ListCard 
          title="Overdue Tasks" 
          items={overdueTasks} 
          type="overdue" 
          highlightDate 
          onViewAll={() => navigate('/tasks')}
          onItemClick={() => navigate('/tasks')}
        />
        
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Team Members Workload</div>
            <span style={{ color: COLORS.purple, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/users')}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {team.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No team members available.</div> : null}
            {(() => {
              const teamWithTasks = team.map(u => {
                const count = tasks.filter(t => String(t.assignedToId) === String(u.userId) || String(t.assignedTo) === String(u.userId)).length
                return { ...u, taskCount: count }
              }).sort((a, b) => b.taskCount - a.taskCount)

              const maxTasks = Math.max(...teamWithTasks.map(u => u.taskCount), 1)

              return teamWithTasks.slice(0, 4).map((u, i) => {
                const pct = Math.round((u.taskCount / maxTasks) * 100)
                const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User'
                const photo = u.profileImage || u.photoUrl || u.avatar || u.profilePic || (u.userId === user?.userId ? user?.photoUrl : null)

                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {photo ? (
                        <img 
                          src={photo} 
                          alt={name} 
                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)', 
                        color: '#fff', 
                        display: photo ? 'none' : 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.65rem', 
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {initials(name)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{u.designation || u.role || 'Employee'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 120 }}>
                      <div style={{ height: 6, flex: 1, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: COLORS.purple, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: 32 }}>{pct}%</span>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

function ManagerStatCard({ icon: Icon, color, iconColor, title, value, subtext, onClick }) {
  return (
    <div className="card" onClick={onClick} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: onClick ? 'pointer' : 'default', height: '100%' }}>
      <div style={{ background: color, color: iconColor, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
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

function ListCard({ title, items = [], type, highlightDate, onViewAll, onItemClick }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
        {onViewAll && <span style={{ color: COLORS.purple, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }} onClick={onViewAll}>View All</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data available.</div> : null}
        {items.map((item, i) => {
          const taskName = item.title || item.taskName || 'Task'
          const projectName = item.projectName || 'Project Task'
          const dateStr = item.dueDate ? formatDate(item.dueDate)?.slice(0, 6) : 'N/A'

          return (
            <div 
              key={i} 
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: onItemClick ? 'pointer' : 'default' }}
              onClick={onItemClick}
            >
              <div style={{ 
                background: type === 'overdue' ? '#fee2e2' : type === 'review' ? '#ffedd5' : '#f3e8ff', 
                color: type === 'overdue' ? '#ef4444' : type === 'review' ? '#f97316' : '#a855f7', 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}>
                {type === 'review' ? <Clock size={16} /> : <Calendar size={16} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {taskName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {projectName}
                </div>
              </div>
              {type === 'review' ? (
                <span style={{ fontSize: '0.72rem', background: '#ffedd5', color: '#ea580c', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  Review
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: highlightDate ? '#ef4444' : 'var(--text-muted)' }}>
                  {highlightDate && 'Due: '}{dateStr}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
