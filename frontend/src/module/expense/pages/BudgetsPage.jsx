import { useState, useMemo, useEffect } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseApi } from '../../../api/expenseApi'
import { projectApi } from '../../../api/projectApi'
import { useRole } from '../../../store/useRole'
import { Plus, Search, MoreVertical } from 'lucide-react'
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

export default function BudgetsPage() {
  const { isPM } = useRole()
  const qc = useQueryClient()
  const [view, setView] = useState('list') // 'list', 'add', 'edit', 'details'
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [activeTab, setActiveTab] = useState('All Budgets')
  const [summaryProjFilter, setSummaryProjFilter] = useState('All')
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Filters
  const [search, setSearch] = useState('')
  const [projFilter, setProjFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  
  const [page, setPage] = useState(1)
  const pageSize = 5

  const { data: projects = [], isLoading: isProjLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
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
  const expenses = expenseQueries.flatMap(q => q.data || [])

  const budgetData = useMemo(() => {
    return projects.map((p, idx) => {
      const projExpenses = expenses.filter(e => String(e.projectId) === String(p.projectId))
      const totalBudget = p.budget || 0
      const totalExpense = projExpenses.reduce((s, e) => s + (e.amount || 0), 0)
      const remaining = totalBudget - totalExpense
      const utilization = totalBudget > 0 ? (totalExpense / totalBudget * 100).toFixed(1) : 0
      
      let status = 'On Track'
      if (utilization >= 100) status = 'Over Budget'
      else if (utilization >= 80) status = 'At Risk'

      return {
        id: p.projectId,
        budgetName: p.projectName + ' Budget',
        projectName: p.projectName,
        budgetType: idx % 2 === 0 ? 'Fixed' : 'Estimated',
        totalBudget,
        spent: totalExpense,
        remaining,
        utilization,
        status,
        createdAt: p.createdAt,
        description: p.description || 'Budget for complete project development and testing.',
        recentExpenses: projExpenses.slice(0, 3)
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
    if (status === 'Over Budget') return <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#fee2e2', padding: '2px 8px', borderRadius: 12 }}><span style={{ fontSize: '10px' }}>●</span> Over Budget</span>
    if (status === 'At Risk') return <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '2px 8px', borderRadius: 12 }}><span style={{ fontSize: '10px' }}>●</span> At Risk</span>
    return <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#d1fae5', padding: '2px 8px', borderRadius: 12 }}><span style={{ fontSize: '10px' }}>●</span> On Track</span>
  }
  
  const renderTypeBadge = (type) => {
    if (type === 'Fixed') return <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>Fixed</span>
    return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>Estimated</span>
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-heading">Budget Management</h1>
          <p className="page-subheading">Track and manage budgets for your projects.</p>
        </div>
        {isPM && (
          <button className="btn btn-primary" onClick={() => { setSelectedBudget(null); setView('add') }}>
            <Plus size={15} /> Add Budget
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <div onClick={() => setActiveTab('All Budgets')} style={{ paddingBottom: 10, color: activeTab === 'All Budgets' ? 'var(--purple)' : 'var(--text-secondary)', borderBottom: activeTab === 'All Budgets' ? '2px solid var(--purple)' : '2px solid transparent', fontWeight: activeTab === 'All Budgets' ? 600 : 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>All Budgets</div>
        <div onClick={() => setActiveTab('Budget Summary')} style={{ paddingBottom: 10, color: activeTab === 'Budget Summary' ? 'var(--purple)' : 'var(--text-secondary)', borderBottom: activeTab === 'Budget Summary' ? '2px solid var(--purple)' : '2px solid transparent', fontWeight: activeTab === 'Budget Summary' ? 600 : 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>Budget Summary</div>
      </div>

      {activeTab === 'Budget Summary' && (() => {
        const summaryData = summaryProjFilter === 'All' 
          ? budgetData 
          : budgetData.filter(b => String(b.id) === String(summaryProjFilter));
        
        return (
          <div>
            <div style={{ marginBottom: 20, width: 250 }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Project Filter</label>
              <select className="form-select" value={summaryProjFilter} onChange={(e) => setSummaryProjFilter(e.target.value)}>
                <option value="All">All Projects</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
            </div>
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
          </div>
        );
      })()}

      {activeTab !== 'Budget Summary' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Project</div>
              <select className="form-select" value={projFilter} onChange={e => { setProjFilter(e.target.value); setPage(1) }}>
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.projectId} value={p.projectName}>{p.projectName}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Status</div>
              <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                <option value="On Track">On Track</option>
                <option value="Over Budget">Over Budget</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Budget Type</div>
              <select className="form-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                <option value="">All Type</option>
                <option value="Fixed">Fixed</option>
                <option value="Estimated">Estimated</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Search</div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by budget name..." 
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  style={{ paddingRight: 32 }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
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
                        {isPM && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.length === 0 ? (
                        <tr><td colSpan={isPM ? 8 : 7} className="table-empty">No budget data found</td></tr>
                      ) : (
                        pagedData.map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.budgetName}</td>
                            <td style={{ fontSize: '0.875rem' }}>{b.projectName}</td>
                            <td>{renderTypeBadge(b.budgetType)}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatINR(b.totalBudget)}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatINR(b.spent)}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.875rem', color: b.remaining < 0 ? '#dc2626' : 'inherit' }}>
                              {formatINR(b.remaining)}
                            </td>
                            <td>{renderStatus(b.status)}</td>
                            {isPM && (
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
                                    <div style={{ position: 'absolute', right: 0, top: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, width: 140, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                                      <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => { setOpenMenuId(null); handleActionClick('details', b); }}>👁 View Details</div>
                                      <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => { setOpenMenuId(null); handleActionClick('edit', b); }}>✏️ Edit Budget</div>
                                      <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', color: '#dc2626' }} onClick={() => { setOpenMenuId(null); handleActionClick('delete', b); }}>🗑 Delete Budget</div>
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
          budget={selectedBudget} 
          projects={projects} 
          onClose={() => setView('list')} 
        />
      )}

      {view === 'details' && (
        <BudgetDetailsModal 
          budget={selectedBudget} 
          isPM={isPM} 
          onClose={() => setView('list')} 
          onEdit={() => setView('edit')} 
          onDelete={() => setView('delete')}
          formatINR={formatINR} 
        />
      )}

      {view === 'delete' && (
        <DeleteBudgetModal 
          budget={selectedBudget} 
          onClose={() => setView('list')} 
          onConfirm={() => {
            // Mock delete operation
            setView('list')
          }}
        />
      )}
    </div>
  )
}
