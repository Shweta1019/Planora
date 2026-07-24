import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from '../protectedRoutes/ProtectedRoute'
import RoleGuard from '../protectedRoutes/RoleGuard'

// Lazy load all pages
const LoginPage = lazy(() => import('../module/auth/pages/LoginPage'))
const SignupPage = lazy(() => import('../module/auth/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('../module/auth/pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('../module/dashboard/pages/DashboardPage'))
const ProjectListPage = lazy(() => import('../module/project/pages/ProjectListPage'))
const ProjectDetailsPage = lazy(() => import('../module/project/pages/ProjectDetailsPage'))
const TaskListPage = lazy(() => import('../module/task/pages/TaskListPage'))
const ResourcePage = lazy(() => import('../module/resource/pages/ResourceAllocationPage'))
const UsersPage = lazy(() => import('../module/user/pages/UsersPage'))
const BudgetsPage = lazy(() => import('../module/expense/pages/BudgetsPage'))
const FilesPage = lazy(() => import('../module/document/pages/DocumentPage'))
const ReportsPage = lazy(() => import('../module/report/pages/ReportsPage'))
const NotificationsPage = lazy(() => import('../module/notification/pages/NotificationPage'))
const ActivityPage = lazy(() => import('../module/activity/pages/ActivityLogPage'))
const SettingsPage       = lazy(() => import('../module/settings/pages/SettingsPage'))
const ResetPasswordPage  = lazy(() => import('../module/auth/pages/ResetPasswordPage'))
const NotFoundPage       = lazy(() => import('../module/auth/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
      Loading…
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public auth routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          {/* /signup is public in routing; backend JWT enforces actual ADMIN restriction */}
          <Route path="/signup" element={<SignupPage />} />
          {/* Yahan Forgot Password ka route add kiya hai */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ── Protected routes — must be logged in ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* All roles */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/notifications"   element={<NotificationsPage />} />
            <Route path="/settings"         element={<SettingsPage />} />
            <Route path="/reset-password"   element={<ResetPasswordPage />} />

            {/* Admin + Project Manager */}
            <Route element={<RoleGuard allowed={['ADMIN', 'PROJECT_MANAGER']} />}>
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/resources" element={<ResourcePage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Admin only */}
            <Route element={<RoleGuard allowed={['ADMIN']} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/activity" element={<ActivityPage />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}