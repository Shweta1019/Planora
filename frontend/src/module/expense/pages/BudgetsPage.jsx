import { useState, useMemo, useEffect } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseApi } from '../../../api/expenseApi'
import { projectApi } from '../../../api/projectApi'
import { useRole } from '../../../store/useRole'
import { useAuthStore } from '../../../store/authStore'
import { Plus, Search, MoreVertical, RotateCcw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import BudgetFormModal from '../components/BudgetFormModal'
import BudgetDetailsModal from '../components/BudgetDetailsModal'
import DeleteBudgetModal from '../components/DeleteBudgetModal'

// Custom currency formatter for INR
function formatINR(value) {
  if (value == null) return '₹ 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Compact Y-Axis currency formatter for chart
function formatYAxis(val) {
  if (val == null || val === 0) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
}

export default function BudgetsPage() {
  const { isPM, isAdmin, isAdminOrPM, isEmployee } = useRole()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  // Delete (reset) budget mutation
  const deleteBudgetMut = useMutation({
    mutationFn: ({ projectId, managerId, projectName }) =>
      projectApi.updateBudget(projectId, {
        budget: 0,
        managerId: managerId || null,
        projectName: projectName || undefined
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      setView('list')
      setSelectedBudget(null)
    },
    onError: (err) => {
      console.error('Failed to delete budget:', err)
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      setView('list')
      setSelectedBudget(null)
    },
  })
  const [view, setView] = useState('list') // 'list', 'add', 'edit', 'details'
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [activeTab, setActiveTab] = useState('All Budgets')
  const [summarySelectedProjects, setSummarySelectedProjects] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filters
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [projFilter, setProjFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [page, setPage] = useState(1)
  const pageSize = 5

  const { data: projects = [], isLoading: isProjLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
  })

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

  const isLoading = isProjLoading || expenseQueries.some(q => q.isLoading)
  const expenses = useMemo(() => {
    return expenseQueries.flatMap(q => q.data || [])
  }, [expenseQueries.map(q => q.dataUpdatedAt || 0).join(',')])

  const budgetData = useMemo(() => {
    return projects
      .filter((p) => p.budget != null && Number(p.budget) > 0)
      .map((p) => {
        const projExpenses = expenses.filter(e => String(e.projectId) === String(p.projectId))
        const totalBudget = Number(p.budget) || 0
        const spent = Number(p.spentAmount) || projExpenses.reduce((s, e) => s + (e.amount || 0), 0)
        const remaining = totalBudget - spent
        const utilization = totalBudget > 0 ? (spent / totalBudget * 100).toFixed(1) : 0

        let status = 'On Track'
        if (p.budgetOverrun || utilization > 100) status = 'Over Budget'
        else if (utilization >= 80) status = 'At Risk'

        const budgetType = 'Fixed'

        return {
          id: p.projectId,
          budgetName: p.projectName + ' Budget',
          projectName: p.projectName,
          projectId: p.projectId,
          managerId: p.managerId,
          budgetType,
          totalBudget,
          spent: spent,
          remaining,
          utilization,
          status,
          createdAt: p.createdAt,
          description: p.description || 'Budget for complete project development and testing.',
          recentExpenses: projExpenses.slice(0, 3),
          allExpenses: projExpenses
        }
      })
  }, [projects, expenses])

  // Filtering
  const filteredData = useMemo(() => {
    return budgetData.filter(b => {
      if (search && !b.budgetName.toLowerCase().includes(search.toLowerCase())) return false
      if (projFilter && b.projectName !== projFilter) return false
      if (statusFilter && b.status !== statusFilter) return false
      if (typeFilter && b.budgetType !== typeFilter) return false
      return true
    })
  }, [budgetData, search, projFilter, statusFilter, typeFilter])

  const total = filteredData.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  const handleActionClick = (action, budget) => {
    setSelectedBudget(budget)
    setView(action)
  }

  const renderStatus = (status) => {
    if (status === 'Over Budget') return <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 6, background: '#fee2e2', padding: '2px 8px', borderRadius: 4 }}>⚠️ Over Budget</span>
    if (status === 'At Risk') return <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>At Risk</span>
    return <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 6, background: '#d1fae5', padding: '2px 8px', borderRadius: 4 }}>On Track</span>
  }

  const renderTypeBadge = (type) => {
    if (type === 'Fixed') return <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>Fixed</span>
    return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>Estimated</span>
  }

  const currentSelectedBudget = selectedBudget 
    ? budgetData.find(b => b.id === selectedBudget.id) || selectedBudget 
    : null;

  return (
    <div style={{ position: 'relative' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Budget Management</h1>
        </div>
        {isAdminOrPM && (
          <button className="btn btn-primary" onClick={() => { setSelectedBudget(null); setView('add') }}>
            <Plus size={15} /> Set Budget
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <div onClick={() => setActiveTab('All Budgets')} style={{ paddingBottom: 10, color: activeTab === 'All Budgets' ? 'var(--purple)' : 'var(--text-secondary)', borderBottom: activeTab === 'All Budgets' ? '2px solid var(--purple)' : '2px solid transparent', fontWeight: activeTab === 'All Budgets' ? 600 : 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>All Budgets</div>
        <div onClick={() => setActiveTab('Budget Summary')} style={{ paddingBottom: 10, color: activeTab === 'Budget Summary' ? 'var(--purple)' : 'var(--text-secondary)', borderBottom: activeTab === 'Budget Summary' ? '2px solid var(--purple)' : '2px solid transparent', fontWeight: activeTab === 'Budget Summary' ? 600 : 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>Budget Summary</div>
      </div>

      {activeTab === 'Budget Summary' && (() => {
        const summaryData = summarySelectedProjects.length === 0
          ? budgetData
          : budgetData.filter(b => summarySelectedProjects.includes(String(b.id)));

        const chartData = [...summaryData]
          .filter(b => b.totalBudget > 0 || b.spent > 0)
          .sort((a, b) => b.totalBudget - a.totalBudget)
          .map(b => ({
            name: b.projectName.length > 22 ? b.projectName.substring(0, 20) + '...' : b.projectName,
            fullProjectName: b.projectName,
            Budget: b.totalBudget,
            Spent: b.spent
          }));

        const isFew = chartData.length <= 4;

        return (
          <div>
            {/* Project Selection / Comparison Section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Compare Projects
                  </span>
                  {summarySelectedProjects.length > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 4 }}>
                      {summarySelectedProjects.length} Selected
                    </span>
                  )}
                </div>
                {summarySelectedProjects.length > 0 && (
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setSummarySelectedProjects([])}
                    style={{ height: 32, padding: '0 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', color: '#7c3aed', borderColor: '#7c3aed', borderRadius: 6 }}
                    title="Clear Filters"
                  >
                    <RotateCcw size={12} style={{ marginRight: 6 }} /> Clear Filters
                  </button>
                )}
              </div>

              {/* Project Selection Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setSummarySelectedProjects([])}
                  style={{
                    padding: '6px 13px',
                    borderRadius: 6,
                    border: summarySelectedProjects.length === 0 ? '1px solid #7c3aed' : '1px solid var(--border)',
                    background: summarySelectedProjects.length === 0 ? '#ede9fe' : 'var(--bg-card)',
                    color: summarySelectedProjects.length === 0 ? '#7c3aed' : 'var(--text-secondary)',
                    fontWeight: summarySelectedProjects.length === 0 ? 600 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  All Projects ({projects.length})
                </button>
                {projects.map(p => {
                  const isSelected = summarySelectedProjects.includes(String(p.projectId))
                  return (
                    <button
                      key={p.projectId}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSummarySelectedProjects(summarySelectedProjects.filter(id => id !== String(p.projectId)))
                        } else {
                          setSummarySelectedProjects([...summarySelectedProjects, String(p.projectId)])
                        }
                      }}
                      style={{
                        padding: '6px 13px',
                        borderRadius: 6,
                        border: isSelected ? '1px solid #7c3aed' : '1px solid var(--border)',
                        background: isSelected ? '#ede9fe' : 'var(--bg-card)',
                        color: isSelected ? '#7c3aed' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s'
                      }}
                    >
                      {isSelected && <span style={{ fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                      {p.projectName}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Total Budget Allocated</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--purple)' }}>{formatINR(summaryData.reduce((s, b) => s + b.totalBudget, 0))}</div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Total Amount Spent</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#059669' }}>{formatINR(summaryData.reduce((s, b) => s + b.spent, 0))}</div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Total Remaining</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb' }}>{formatINR(summaryData.reduce((s, b) => s + b.remaining, 0))}</div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="card" style={{ padding: 24, marginTop: 24 }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                {summarySelectedProjects.length > 0 ? 'Project Budget Comparison' : 'Project Budgets (Highest to Lowest)'}
              </div>
              {chartData.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No budget data available to display for the selected projects.</div>
              ) : (
                <div>
                  <div style={{ height: 380, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: isFew ? 20 : 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          height={isFew ? 45 : 65}
                          axisLine={{ stroke: '#e5e7eb' }} 
                          tickLine={false} 
                          tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
                          angle={isFew ? 0 : -25} 
                          textAnchor={isFew ? 'middle' : 'end'}
                          interval={0}
                          dy={isFew ? 8 : 4}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                          tickFormatter={formatYAxis}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f9fafb' }}
                          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          formatter={(value) => formatINR(value)}
                          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullProjectName || label}
                        />
                        <Bar dataKey="Budget" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={isFew ? 65 : 45} />
                        <Bar dataKey="Spent" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={isFew ? 65 : 45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Clean Legend at the bottom of the card, never overlapping with X-Axis */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 32,
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#7c3aed', display: 'inline-block' }} />
                      <span>Budget Allocated</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#059669', display: 'inline-block' }} />
                      <span>Amount Spent</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab !== 'Budget Summary' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16, marginBottom: 24, alignItems: 'flex-end' }}>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Project</div>
              <select className="form-select" value={projFilter} onChange={e => { setProjFilter(e.target.value); setPage(1) }}>
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.projectId} value={p.projectName}>{p.projectName}</option>)}
              </select>
            </div>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Status</div>
              <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                <option value="On Track">On Track</option>
                <option value="Over Budget">Over Budget</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Budget Type</div>
              <select className="form-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                <option value="">All Type</option>
                <option value="Fixed">Fixed</option>
                <option value="Estimated">Estimated</option>
              </select>
            </div>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Search</div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by budget name..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setSearch(searchInput);
                      setPage(1);
                    }
                  }}
                  style={{ paddingRight: 32 }}
                />
                <button 
                  onClick={() => { setSearch(searchInput); setPage(1); }}
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                  <Search size={16} color="var(--text-muted)" />
                </button>
              </div>
            </div>

            <button
              className="btn btn-outline"
              style={{ height: 38, whiteSpace: 'nowrap', color: '#7c3aed', borderColor: '#7c3aed', display: 'flex', alignItems: 'center' }}
              onClick={() => {
                setProjFilter('');
                setStatusFilter('');
                setTypeFilter('');
                setSearch('');
                setSearchInput('');
                setPage(1);
              }}
              title="Clear Filters"
            >
              <RotateCcw size={13} style={{ marginRight: 6 }} /> Clear Filters
            </button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            {isLoading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : (
              <>
                <div className="table-wrap" style={{ overflow: 'visible' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Budget Name</th>
                        <th>Project</th>
                        <th>Budget Type</th>
                        <th>Total Budget</th>
                        <th>Spent</th>
                        <th>Remaining</th>
                        <th>Status</th>
                        {isAdminOrPM && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.length === 0 ? (
                        <tr><td colSpan={isAdminOrPM ? 8 : 7} className="table-empty">No budget data found</td></tr>
                      ) : (
                        pagedData.map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.budgetName}</td>
                            <td style={{ fontSize: '0.875rem' }}>{b.projectName}</td>
                            <td>{renderTypeBadge(b.budgetType)}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatINR(b.totalBudget)}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatINR(b.spent)}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem', color: b.remaining < 0 ? '#dc2626' : 'inherit' }}>
                              {b.remaining < 0 ? `Exceeded by ${formatINR(Math.abs(b.remaining))}` : formatINR(b.remaining)}
                            </td>
                            <td>{renderStatus(b.status)}</td>
                            {isAdminOrPM && (
                              <td>
                                <div style={{ position: 'relative' }}>
                                  <button
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(openMenuId === b.id ? null : b.id);
                                    }}
                                  >
                                    <MoreVertical size={16} color="var(--text-secondary)" />
                                  </button>
                                  {openMenuId === b.id && (
                                    <div 
                                      style={{ 
                                      position: 'absolute', 
                                      right: 0, 
                                      top: 24, 
                                      background: 'var(--bg-card)', 
                                      border: '1px solid var(--border)', 
                                      borderRadius: 8, 
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                                      zIndex: 1000, 
                                      width: 150, 
                                      overflow: 'hidden' 
                                    }} 
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'block', color: 'var(--text-primary)' }}
                                        onClick={() => { setOpenMenuId(null); handleActionClick('details', b); }}
                                      >
                                        View Details
                                      </button>
                                      <button
                                        type="button"
                                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'block', color: 'var(--text-primary)' }}
                                        onClick={() => { setOpenMenuId(null); handleActionClick('edit', b); }}
                                      >
                                        Edit Budget
                                      </button>
                                      <button
                                        type="button"
                                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer', display: 'block', color: '#dc2626' }}
                                        onClick={() => { setOpenMenuId(null); handleActionClick('delete', b); }}
                                      >
                                        Delete Budget
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <span>Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} budgets</span>
                  <div className="pag-controls">
                    <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                      <button key={n} className={`pag-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)} style={page === n ? { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' } : {}}>{n}</button>
                    ))}
                    <button className="pag-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* MODALS */}
      {(view === 'add' || view === 'edit') && (
        <BudgetFormModal
          mode={view}
          budget={currentSelectedBudget}
          projects={projects}
          onClose={() => setView('list')}
        />
      )}

      {view === 'details' && (
        <BudgetDetailsModal
          budget={currentSelectedBudget}
          onClose={() => setView('list')}
          formatINR={formatINR}
        />
      )}

      {view === 'delete' && (
        <DeleteBudgetModal
          budget={currentSelectedBudget}
          isPending={deleteBudgetMut.isPending}
          onClose={() => {
            setView('list')
            setSelectedBudget(null)
          }}
          onConfirm={() => {
            const pid = currentSelectedBudget?.projectId || currentSelectedBudget?.id
            if (pid) {
              deleteBudgetMut.mutate({
                projectId: pid,
                managerId: currentSelectedBudget.managerId,
                projectName: currentSelectedBudget.projectName
              })
              setView('list')
              setSelectedBudget(null)
            }
          }}
        />
      )}
    </div>
  )
}
