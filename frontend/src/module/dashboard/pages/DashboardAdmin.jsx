import { useMemo } from 'react'
import {
  Users, User, UsersRound, FileText, CheckSquare,
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

export default function DashboardAdmin({ projects = [], users = [], activities = [], user }) {

  const stats = useMemo(() => {
    const totalUsers = users.length
    const projectManagers = users.filter(u => u.role === 'PROJECT_MANAGER').length
    const employees = users.filter(u => u.role === 'EMPLOYEE').length
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const overdueProjects = projects.filter(p => p.endDate && p.endDate < new Date().toISOString().slice(0, 10) && p.status !== 'COMPLETED').length
    const totalBudget = projects.reduce((acc, p) => acc + (p.totalBudget || p.budget || 0), 0)

    return { totalUsers, projectManagers, employees, totalProjects, activeProjects, completedProjects, overdueProjects, totalBudget }
  }, [projects, users])

  const projectStatusData = useMemo(() => {
    const s = { 'Completed': 0, 'In Progress': 0, 'On Hold': 0, 'Cancelled': 0 }
    projects.forEach(p => {
      if (p.status === 'COMPLETED') s['Completed']++
      else if (p.status === 'IN_PROGRESS' || p.status === 'ACTIVE') s['In Progress']++
      else if (p.status === 'ON_HOLD') s['On Hold']++
      else if (p.status === 'CANCELLED') s['Cancelled']++
      else s['In Progress']++
    })
    return [
      { name: 'Completed', value: s['Completed'], color: COLORS.green },
      { name: 'In Progress', value: s['In Progress'], color: COLORS.blue },
      { name: 'On Hold', value: s['On Hold'], color: COLORS.yellow },
      { name: 'Cancelled', value: s['Cancelled'], color: COLORS.red },
    ]
  }, [projects])

  const usersRoleData = useMemo(() => {
    const s = { Admin: 0, Managers: 0, Employees: 0 }
    users.forEach(u => {
      if (u.role === 'ADMIN') s.Admin++
      else if (u.role === 'PROJECT_MANAGER') s.Managers++
      else s.Employees++
    })
    return [
      { name: 'Admin', value: s.Admin, color: COLORS.purple },
      { name: 'Managers', value: s.Managers, color: COLORS.blue },
      { name: 'Employees', value: s.Employees, color: COLORS.green },
    ]
  }, [users])

  const monthlyData = useMemo(() => {
    // Mock monthly project progress data
    return [
      { name: 'Jan', value: 65 },
      { name: 'Feb', value: 70 },
      { name: 'Mar', value: 50 },
      { name: 'Apr', value: 60 },
      { name: 'May', value: 80 },
      { name: 'Jun', value: 90 },
    ]
  }, [])

  return (
    <div className="dashboard-layout">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Dashboard</h1>
        </div>

      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <AdminStatCard icon={Users} color="#f3e8ff" iconColor="#a855f7" title="Total Users" value={stats.totalUsers} subtext="↑ 12% this month" />
        <AdminStatCard icon={User} color="#e0f2fe" iconColor="#3b82f6" title="Project Managers" value={stats.projectManagers} subtext="↑ 8% this month" />
        <AdminStatCard icon={UsersRound} color="#dcfce7" iconColor="#22c55e" title="Employees" value={stats.employees} subtext="↑ 15% this month" />
        <AdminStatCard icon={FileText} color="#fef9c3" iconColor="#eab308" title="Total Projects" value={stats.totalProjects} subtext="↑ 6% this month" />
        <AdminStatCard icon={CheckSquare} color="#dcfce7" iconColor="#22c55e" title="Active Projects" value={stats.activeProjects} subtext={stats.totalProjects ? Math.round((stats.activeProjects / stats.totalProjects) * 100) + '%' : '0%'} />
        <AdminStatCard icon={CheckCircle2} color="#dcfce7" iconColor="#22c55e" title="Completed Projects" value={stats.completedProjects} subtext={stats.totalProjects ? Math.round((stats.completedProjects / stats.totalProjects) * 100) + '%' : '0%'} />
        <AdminStatCard icon={AlertCircle} color="#fee2e2" iconColor="#ef4444" title="Overdue Projects" value={stats.overdueProjects} subtext={stats.totalProjects ? Math.round((stats.overdueProjects / stats.totalProjects) * 100) + '%' : '0%'} />
        <AdminStatCard icon={Wallet} color="#f3e8ff" iconColor="#a855f7" title="Total Budget" value={formatINR(stats.totalBudget)} subtext="100%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr', gap: 16, marginTop: 24 }}>
        <ChartCard title="Projects by Status" data={projectStatusData} />
        <ChartCard title="Users by Role" data={usersRoleData} />

        <div className="card chart-card">
          <p className="chart-title">Monthly Project Progress</p>
          <div style={{ height: 200, marginTop: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ left: -25, bottom: -10 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v} />
                <ReTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Users</div>
            <a href="#" style={{ color: COLORS.purple, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {users.slice(0, 4).map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={u.profileImage || `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=random`} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.fullName || `${u.firstName} ${u.lastName}`}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)?.slice(0, 6) || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>

        <ListCard title="Recent Projects" items={projects.slice(0, 4)} type="project" />
        <ListCard title="Projects Near Deadline" items={projects.filter(p => p.endDate && p.status !== 'COMPLETED').sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 4)} type="near_deadline" />
        <ListCard title="Budget Overrun Projects" items={projects.filter(p => p.budget && p.totalBudget && p.budget < p.totalBudget).slice(0, 4)} type="overrun" />
      </div>
    </div>
  )
}

function AdminStatCard({ icon: Icon, color, iconColor, title, value, subtext }) {
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
            const pct = total ? Math.round((d.value / total) * 100) : 0
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
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ListCard({ title, items, type }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
        <a href="#" style={{ color: COLORS.purple, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>View All</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data available.</div> : null}
        {items.map((item, i) => {
          if (type === 'project') return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#f3e8ff', color: '#a855f7', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={16} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.projectName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.createdAt)?.slice(0, 6) || '1 May'}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.createdAt)?.slice(0, 6) || '2 May'}</span>
            </div>
          )
          if (type === 'near_deadline') {
            const today = new Date()
            const end = new Date(item.endDate)
            const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
            const days = diff > 0 ? diff : 0
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#fee2e2', color: '#ef4444', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.projectName}</div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 500 }}>Due in {days} days</span>
              </div>
            )
          }
          if (type === 'overrun') {
            const over = Math.floor(Math.random() * 15) + 1 // mock
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#fee2e2', color: '#ef4444', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wallet size={16} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.projectName}</div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 500 }}>{over}% Over</span>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
