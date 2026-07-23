import { useQuery } from '@tanstack/react-query'
import api from '../../../api/axiosConfig'
import { projectApi } from '../../../api/projectApi'
import { activityApi } from '../../../api/activityApi'
import StatsCard       from '../components/StatsCard'
import ProjectChart    from '../components/ProjectChart'
import TaskChart       from '../components/TaskChart'
import RecentActivities from '../components/RecentActivities'
import {
  FolderKanban, Users, CheckSquare,
  Clock, CheckCircle2, CalendarClock
} from 'lucide-react'
import { formatDate, formatPct } from '../../../utils/formatDate'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => api.get('/dashboard/stats').then(r => r.data?.data || r.data),
    staleTime: 60_000,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['recent-activity'],
    queryFn:  () => activityApi.getAll({ size: 6 }).then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 30_000,
  })

  const topProjects = [...projects]
    .sort((a, b) => (b.completionPercentage || 0) - (a.completionPercentage || 0))
    .slice(0, 5)

  // upcoming deadlines — projects ending soon
  const upcoming = [...projects]
    .filter(p => p.endDate && p.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(0, 5)

  if (isLoading) return (
    <div className="page-loader"><div className="spinner" /> Loading dashboard…</div>
  )

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 14px' }}>
          <CalendarClock size={14} />
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <StatsCard
          icon={FolderKanban} color="purple"
          label="Total Projects" value={stats?.totalProjects}
          change={stats?.totalProjectsChange}
        />
        <StatsCard
          icon={Users} color="blue"
          label="Total Employees" value={stats?.totalUsers}
          change={stats?.totalUsersChange}
        />
        <StatsCard
          icon={CheckSquare} color="green"
          label="Total Tasks" value={stats?.totalTasks}
          change={stats?.totalTasksChange}
        />
        <StatsCard
          icon={Clock} color="yellow"
          label="In Progress Tasks" value={stats?.pendingTasks}
          change={stats?.pendingChange}
        />
        <StatsCard
          icon={CheckCircle2} color="purple"
          label="Completed Tasks" value={stats?.completedTasks}
          change={stats?.completedChange}
        />
      </div>

      {/* Charts row */}
      <div className="grid-chart">
        <div className="card chart-card">
          <p className="chart-title">Project Progress Overview</p>
          <ProjectChart stats={stats} />
        </div>
        <div className="card chart-card">
          <p className="chart-title">Tasks Status</p>
          <TaskChart stats={stats} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-bottom">
        {/* Recent Activities */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Activities</span>
            <a href="/activity" className="section-link">View All →</a>
          </div>
          <RecentActivities activities={activities} />
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Upcoming Deadlines</span>
            <a href="/projects" className="section-link">View All →</a>
          </div>
          {upcoming.length === 0
            ? <div className="empty-state" style={{ padding: 24 }}><p>No upcoming deadlines</p></div>
            : upcoming.map(p => (
              <div key={p.projectId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.projectName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.managerName || 'No manager'}</div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--red)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {formatDate(p.endDate)}
                </div>
              </div>
            ))
          }
        </div>

        {/* Top Projects */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Top Projects</span>
            <a href="/projects" className="section-link">View All →</a>
          </div>
          {topProjects.map(p => {
            const pct = p.completionPercentage || 0
            const color = pct >= 80 ? 'green' : pct >= 50 ? 'blue' : pct >= 25 ? 'yellow' : 'red'
            return (
              <div key={p.projectId} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{p.projectName}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {topProjects.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}><p>No projects yet</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
