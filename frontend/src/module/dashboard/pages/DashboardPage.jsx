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
  const { data: rawProjects = [], isLoading: pLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
    enabled: role !== 'EMPLOYEE',
  })

  const projects = role === 'PROJECT_MANAGER' ? rawProjects.filter(p => p.managerId === user?.userId) : rawProjects;

  const { data: activities = [], isLoading: aLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => {
      if (role === 'EMPLOYEE' && user?.userId) {
        return activityApi.getByUser(user.userId).then(r => {
          const d = r.data?.data || r.data
          return Array.isArray(d) ? d : d?.content || []
        })
      }
      return activityApi.getAll({ size: 10 }).then(r => {
        const d = r.data?.data || r.data
        return Array.isArray(d) ? d : d?.content || []
      })
    },
    staleTime: 0,
    enabled: !!user?.userId
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
  // For Admin: fetch tasks for all projects and flatten.
  const { data: tasks = [], isLoading: tLoading } = useQuery({
    queryKey: ['tasks-dashboard', role, user?.userId],
    queryFn: async () => {
      if (role === 'EMPLOYEE' && user?.userId) {
        const res = await taskApi.getByUser(user.userId)
        return res.data?.data || res.data || []
      } else if (projects.length > 0) {
        const promises = projects.map(p => taskApi.getByProject(p.projectId))
        const results = await Promise.all(promises)
        return results.flatMap(res => res.data?.data || res.data || [])
      }
      return []
    },
    staleTime: 0,
    enabled: (role === 'EMPLOYEE' && !!user?.userId) || (role !== 'EMPLOYEE' && !pLoading)
  })

  const { data: teamMembers = [], isLoading: tmLoading } = useQuery({
    queryKey: ['team-members-dashboard', role, user?.userId],
    queryFn: async () => {
      if (projects.length > 0) {
        const promises = projects.map(p => projectApi.getMembers(p.projectId))
        const results = await Promise.all(promises)
        return results.flatMap(res => res.data?.data || res.data || [])
      }
      return []
    },
    staleTime: 0,
    enabled: role === 'PROJECT_MANAGER' && !pLoading
  })

  const isLoading = (role !== 'EMPLOYEE' ? pLoading : false) || aLoading || uLoading || tLoading || (role === 'PROJECT_MANAGER' && tmLoading)

  if (isLoading) {
    return <div className="page-loader"><div className="spinner" /> Loading dashboard…</div>
  }

  if (role === 'ADMIN') {
    return <DashboardAdmin user={user} projects={projects} users={users} activities={activities} />
  }

  if (role === 'PROJECT_MANAGER') {
    const pmUsers = users.filter(u => u.role !== 'ADMIN' && teamMembers.some(m => String(m.userId) === String(u.userId)))
    return <DashboardManager user={user} projects={projects} tasks={tasks} activities={activities} team={pmUsers} />
  }

  // EMPLOYEE is default fallback
  return <DashboardEmployee user={user} projects={projects} tasks={tasks} activities={activities} />
}
