import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

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
    const data = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = months[d.getMonth()]
      const count = projects.filter(p => {
        if (!p.createdAt) return false
        const pDate = new Date(p.createdAt)
        return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear()
      }).length
      data.push({ name: monthName, value: count })
    }
    return data
  }, [projects])

  const recentUsers = useMemo(() => [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4), [users])
  const recentProjects = useMemo(() => [...projects].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4), [projects])

  return (
    <div className="dashboard-layout">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Dashboard</h1>
        </div>

      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <AdminStatCard icon={Users} color="#f3e8ff" iconColor="#a855f7" title="Total Users" value={stats.totalUsers} onClick={() => navigate('/users')} />
        <AdminStatCard icon={User} color="#e0f2fe" iconColor="#3b82f6" title="Project Managers" value={stats.projectManagers} onClick={() => navigate('/users')} />
        <AdminStatCard icon={UsersRound} color="#dcfce7" iconColor="#22c55e" title="Employees" value={stats.employees} onClick={() => navigate('/users')} />
        <AdminStatCard icon={FileText} color="#fef9c3" iconColor="#eab308" title="Total Projects" value={stats.totalProjects} onClick={() => navigate('/projects')} />
        <AdminStatCard icon={CheckSquare} color="#dcfce7" iconColor="#22c55e" title="Active Projects" value={stats.activeProjects} subtext={stats.totalProjects ? Math.round((stats.activeProjects / stats.totalProjects) * 100) + '%' : '0%'} onClick={() => navigate('/projects')} />
        <AdminStatCard icon={CheckCircle2} color="#dcfce7" iconColor="#22c55e" title="Completed Projects" value={stats.completedProjects} subtext={stats.totalProjects ? Math.round((stats.completedProjects / stats.totalProjects) * 100) + '%' : '0%'} onClick={() => navigate('/projects')} />
        <AdminStatCard icon={AlertCircle} color="#fee2e2" iconColor="#ef4444" title="Overdue Projects" value={stats.overdueProjects} subtext={stats.totalProjects ? Math.round((stats.overdueProjects / stats.totalProjects) * 100) + '%' : '0%'} onClick={() => navigate('/projects')} />
        <AdminStatCard icon={Wallet} color="#f3e8ff" iconColor="#a855f7" title="Total Budget" value={formatINR(stats.totalBudget)} onClick={() => navigate('/projects')} />
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
            <span style={{ color: COLORS.purple, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/users')}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentUsers.map((u, i) => (
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

        <ListCard title="Recent Projects" items={recentProjects} type="project" onViewAll={() => navigate('/projects')} />
        <ListCard title="Projects Near Deadline" items={projects.filter(p => p.endDate && p.status !== 'COMPLETED').sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 4)} type="near_deadline" onViewAll={() => navigate('/projects')} />
        <ListCard title="Budget Overrun Projects" items={projects.filter(p => p.budgetOverrun || (p.budget > 0 && p.spentAmount > p.budget)).slice(0, 4)} type="overrun" onViewAll={() => navigate('/projects')} />
      </div>
    </div>
  )
}

function AdminStatCard({ icon: Icon, color, iconColor, title, value, subtext, onClick }) {
  const isUp = subtext && String(subtext).includes('↑')
  return (
    <div className="card" onClick={onClick} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: onClick ? 'pointer' : 'default', height: '100%' }}>
      <div style={{ background: color, color: iconColor, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: isUp ? '#10b981' : 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, minHeight: 18 }}>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {formatDate(item.createdAt)?.slice(0, 6) || 'N/A'}</div>
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
                <span style={{ fontSize: '0.7rem', color: diff < 0 ? '#ef4444' : '#eab308', fontWeight: 500 }}>
                  {diff < 0 ? `Overdue by ${Math.abs(diff)} days` : `Due in ${days} days`}
                </span>
              </div>
            )
          }
          if (type === 'overrun') {
            const over = item.budget ? Math.round(((item.spentAmount - item.budget) / item.budget) * 100) : 0
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
