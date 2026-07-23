import { useState } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { expenseApi } from '../../../api/expenseApi'
import { projectApi } from '../../../api/projectApi'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { Download, Plus, Home, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatDate'

const PROJECT_ICONS = ['🌐', '📱', '🏪', '⚙️', '🔧', '🖥️', '📊', '🎨', '🔬', '📦']
function getProjectIcon(name = '', idx = 0) {
  const n = name.toLowerCase()
  if (n.includes('web') || n.includes('site')) return '🌐'
  if (n.includes('mobile') || n.includes('app')) return '📱'
  if (n.includes('shop') || n.includes('ecom')) return '🏪'
  if (n.includes('api') || n.includes('backend')) return '⚙️'
  if (n.includes('tool') || n.includes('internal')) return '🔧'
  if (n.includes('crm') || n.includes('erp')) return '🖥️'
  if (n.includes('report') || n.includes('data')) return '📊'
  return PROJECT_ICONS[idx % PROJECT_ICONS.length]
}
const ICON_COLORS = ['#ede9fe', '#dbeafe', '#d1fae5', '#fef3c7', '#fee2e2', '#e0f2fe']
const ICON_TEXT = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0284c7']

const DONUT_COLORS = ['#6366f1', '#10b981', '#9ca3af']
const BAR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

function getBudgetStatus(utilization) {
  if (utilization >= 100) return { label: 'Over Budget', cls: 'badge-over-budget' }
  if (utilization >= 80) return { label: 'On Track', cls: 'badge-on-track' }
  if (utilization === 0) return { label: 'Planned', cls: 'badge-planned' }
  return { label: 'Under Budget', cls: 'badge-under-budget' }
}

export default function BudgetsPage() {
  const [period, setPeriod] = useState('This Year')

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  // Fetch expenses for every project in parallel
  const expenseQueries = useQueries({
    queries: projects.map(p => ({
      queryKey: ['expenses-project', p.projectId],
      queryFn: () => expenseApi.getByProject(p.projectId).then(r => {
        const d = r.data?.data || r.data
        return Array.isArray(d) ? d : d?.content || []
      }),
      staleTime: 30_000,
      enabled: projects.length > 0,
    })),
  })

  const isLoading = expenseQueries.some(q => q.isLoading)
  const expenses = expenseQueries.flatMap(q => q.data || [])

  // Compute budget breakdown per project
  const budgetData = projects.map((p, idx) => {
    const projExpenses = expenses.filter(e => String(e.projectId) === String(p.projectId))
    const totalBudget = p.budget || 0
    const totalExpense = projExpenses.reduce((s, e) => s + (e.amount || 0), 0)
    const remaining = totalBudget - totalExpense
    const utilization = totalBudget > 0 ? Math.round(totalExpense / totalBudget * 100) : 0
    return {
      projectId: p.projectId,
      projectName: p.projectName,
      managerName: p.managerName,
      totalBudget,
      totalExpense,
      remaining,
      utilization,
      idx,
    }
  })

  // Summary stats
  const totalBudget = budgetData.reduce((s, p) => s + p.totalBudget, 0)
  const totalExpenses = budgetData.reduce((s, p) => s + p.totalExpense, 0)
  const remaining = totalBudget - totalExpenses
  const activePrj = projects.filter(p => p.status === 'IN_PROGRESS').length
  const overBudget = budgetData.filter(p => p.remaining < 0).length

  const STAT_CARDS = [
    { label: 'Total Budget', value: formatCurrency(totalBudget), sub: 'Across all projects', Icon: '💼', color: '#6366f1', bg: '#ede9fe' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), sub: 'Across all projects', Icon: '📈', color: '#10b981', bg: '#d1fae5' },
    { label: 'Remaining Budget', value: formatCurrency(remaining), sub: `${totalBudget > 0 ? Math.round(remaining / totalBudget * 100) : 0}% of total budget`, Icon: '💰', color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Active Projects', value: activePrj, sub: 'With budgets', Icon: '📅', color: '#d97706', bg: '#fef3c7' },
    { label: 'Over Budget Projects', value: overBudget, sub: 'Needs attention', Icon: '📊', color: '#dc2626', bg: '#fee2e2' },
  ]

  // Pie chart data
  const pieData = [
    { name: 'Total Expenses', value: totalExpenses },
    { name: 'Remaining Budget', value: Math.max(0, remaining) },
    { name: 'Available', value: Math.max(0, totalBudget - totalExpenses - remaining) },
  ].filter(d => d.value > 0)

  // Bar chart data — mock monthly data based on totals
  const barData = BAR_MONTHS.map((m, i) => ({
    month: m,
    Budget: Math.round(totalBudget / 12 * (i < 7 ? 1 : 0.8)),
    Expenses: Math.round(totalExpenses / 12 * (i < 7 ? 1 : 0.5)),
  }))

  return (
    <div>
      {/* Header with breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <div className="breadcrumb" style={{ marginBottom: 8 }}>
          <Home size={12} />
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Budgets</span>
        </div>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-heading">Budgets</h1>
            <p className="page-subheading">Track project budgets, expenses and financial overview</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-sm"><Download size={14} /> Export Report</button>
            <button className="btn btn-primary"><Plus size={15} /> Add Budget</button>
          </div>
        </div>
      </div>

      {/* 5 Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
        {STAT_CARDS.map((s, i) => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
              {s.Icon}
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.1rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: s.label === 'Over Budget Projects' && overBudget > 0 ? '#dc2626' : 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Donut */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>Budget Overview</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {[
              { label: 'Total Expenses', pct: totalBudget ? Math.round(totalExpenses / totalBudget * 100) : 0, color: '#6366f1' },
              { label: 'Remaining Budget', pct: totalBudget ? Math.round(Math.max(0, remaining) / totalBudget * 100) : 0, color: '#10b981' },
              { label: 'Planned Budget', pct: 100, color: '#9ca3af' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{l.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Budget vs Expenses (This Month)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select className="form-select" style={{ width: 130, padding: '4px 10px', fontSize: '0.8rem' }}
                value={period} onChange={e => setPeriod(e.target.value)}>
                <option>This Year</option>
                <option>Last 6 Months</option>
                <option>Last Quarter</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={18} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Budget Details table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>
          Project Budget Details
        </div>
        {isLoading
          ? <div className="page-loader"><div className="spinner" /></div>
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Project Manager</th>
                    <th>Total Budget</th>
                    <th>Total Expenses</th>
                    <th>Remaining Budget</th>
                    <th>Utilization</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.length === 0
                    ? <tr><td colSpan={8} className="table-empty">No budget data yet</td></tr>
                    : budgetData.map(p => {
                      const status = getBudgetStatus(p.utilization)
                      const icon = getProjectIcon(p.projectName, p.idx)
                      const bg = ICON_COLORS[p.idx % ICON_COLORS.length]
                      return (
                        <tr key={p.projectId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                                {icon}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.projectName}</span>
                            </div>
                          </td>
                          <td>
                            {p.managerName
                              ? <div className="user-cell"><div className="avatar avatar-sm">{p.managerName[0]}</div><span style={{ fontSize: '0.82rem' }}>{p.managerName}</span></div>
                              : <span className="td-muted">—</span>
                            }
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(p.totalBudget)}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem', color: p.totalExpense > p.totalBudget ? '#dc2626' : '#059669' }}>
                            {formatCurrency(p.totalExpense)}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem', color: p.remaining < 0 ? '#dc2626' : '#059669' }}>
                            {formatCurrency(p.remaining)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', borderRadius: 3,
                                  width: `${Math.min(p.utilization, 100)}%`,
                                  background: p.utilization >= 100 ? '#ef4444' : p.utilization >= 80 ? '#6366f1' : '#10b981',
                                  transition: 'width 0.4s',
                                }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, minWidth: 32 }}>{p.utilization}%</span>
                            </div>
                          </td>
                          <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                          <td>
                            <div className="actions-cell">
                              <button className="action-btn view" title="View">👁</button>
                              <button className="action-btn edit" title="Edit">✏️</button>
                              <button className="action-btn delete" title="Delete">🗑</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        <div className="pagination">
          <span>Showing 1 to {budgetData.length} of {budgetData.length} projects</span>
          <div className="pag-controls">
            <button className="pag-btn" disabled>‹</button>
            <button className="pag-btn active">1</button>
            <button className="pag-btn" disabled>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}
