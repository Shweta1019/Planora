import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { projectApi } from '../../../api/projectApi'
import { taskApi } from '../../../api/taskApi'
import { userApi } from '../../../api/userApi'
import { activityApi } from '../../../api/activityApi'

import DashboardEmployee from './DashboardEmployee'
import DashboardManager from './DashboardManager'
import DashboardAdmin from './DashboardAdmin'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const user = useAuthStore(state => state.user)
  const role = user?.role

  // Fetch all necessary data concurrently based on role
  const { data: projects = [], isLoading: pLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const { data: activities = [], isLoading: aLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => activityApi.getAll({ size: 10 }).then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 30_000,
  })

  // Admins and Managers need all users
  const { data: users = [], isLoading: uLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
    enabled: role === 'ADMIN' || role === 'PROJECT_MANAGER',
  })

  // We need tasks. For Employee: fetch tasks assigned to them.
  // For Manager: fetch tasks from their projects.
  // For Admin: Ideally fetch all tasks. Since there is no getAll tasks endpoint, 
  // we will fetch tasks for all projects and flatten.
  const [tasks, setTasks] = useState([])
  const [tLoading, setTLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchTasks = async () => {
      try {
        if (role === 'EMPLOYEE' && user?.userId) {
          const res = await taskApi.getByUser(user.userId)
          if (isMounted) setTasks(res.data?.data || res.data || [])
        } else if (projects.length > 0) {
          // Admin or Manager: fetch tasks for all available projects
          const promises = projects.map(p => taskApi.getByProject(p.projectId))
          const results = await Promise.all(promises)
          const allTasks = results.flatMap(res => res.data?.data || res.data || [])
          if (isMounted) setTasks(allTasks)
        } else if (projects.length === 0 && !pLoading) {
           if (isMounted) setTasks([])
        }
      } catch (err) {
        console.error("Error fetching tasks for dashboard:", err)
      } finally {
        if (isMounted) setTLoading(false)
      }
    }
    fetchTasks()
    return () => { isMounted = false }
  }, [role, user?.userId, projects, pLoading])

  const isLoading = pLoading || aLoading || uLoading || tLoading

  if (isLoading) {
    return <div className="page-loader"><div className="spinner" /> Loading dashboard…</div>
  }

  if (role === 'ADMIN') {
    return <DashboardAdmin user={user} projects={projects} users={users} activities={activities} />
  }

  if (role === 'PROJECT_MANAGER') {
    const team = users.filter(u => u.role !== 'ADMIN') // Basic team filter
    return <DashboardManager user={user} projects={projects} tasks={tasks} activities={activities} team={team} />
  }

  // EMPLOYEE is default fallback
  return <DashboardEmployee user={user} projects={projects} tasks={tasks} activities={activities} />
}
