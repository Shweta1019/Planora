import { ChevronLeft, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import ExpenseFormModal from './ExpenseFormModal'

export default function BudgetDetailsModal({ budget, onClose, formatINR }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const renderStatus = (status) => {
    if (status === 'Over Budget') return <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', background: '#fee2e2', padding: '2px 8px', borderRadius: 4 }}>Over Budget</span>
    if (status === 'At Risk') return <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>At Risk</span>
    return <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', background: '#d1fae5', padding: '2px 8px', borderRadius: 4 }}>On Track</span>
  }
  
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: 12 }} className="card" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
             <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: '#ede9fe', borderRadius: 8, color: '#7c3aed' }}>
                 <Wallet size={20} />
               </div>
               <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronLeft size={18} cursor="pointer" onClick={onClose} />
                    {budget?.budgetName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{budget?.projectName}</div>
               </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {renderStatus(budget?.status)}
                {/* X close icon */}
                <button
                  onClick={onClose}
                  title="Close"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6, lineHeight: 1 }}
                >
                  <X size={18} />
                </button>
             </div>
          </div>

          {/* Warning Banner */}
          {budget?.status === 'Over Budget' && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>Warning:</span> Total spent has exceeded the allocated project budget.
            </div>
          )}

          {/* Summary Cards: Total Budget | Spent | Remaining | % Used */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
             <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Total Budget</div>
               <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatINR(budget?.totalBudget)}</div>
             </div>
             <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Spent</div>
               <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatINR(budget?.spent)}</div>
             </div>
             <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Remaining</div>
               <div style={{ fontSize: '1.1rem', fontWeight: 700, color: budget?.remaining < 0 ? '#dc2626' : '#059669' }}>{formatINR(budget?.remaining)}</div>
             </div>
             <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>% Used</div>
               <div style={{ fontSize: '1.1rem', fontWeight: 700, color: budget?.utilization >= 100 ? '#dc2626' : '#7c3aed' }}>{budget?.utilization}%</div>
               <div style={{ marginTop: 6, height: 4, background: 'var(--border)', borderRadius: 4 }}>
                 <div style={{
                   height: 4, borderRadius: 4,
                   background: budget?.utilization >= 100 ? '#dc2626' : budget?.utilization >= 80 ? '#d97706' : '#7c3aed',
                   width: `${Math.min(Number(budget?.utilization) || 0, 100)}%`,
                   transition: 'width 0.4s'
                 }} />
               </div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            {/* Budget Information */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Budget Information</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Budget Type</span>
                    <span style={{ fontWeight: 500 }}>{budget?.budgetType}</span>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Created On</span>
                    <span style={{ fontWeight: 500 }}>{budget?.createdAt ? new Date(budget.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Description</span>
                    <span style={{ lineHeight: 1.5 }}>{budget?.description || '—'}</span>
                 </div>
              </div>
            </div>

            {/* Expense History Table */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Expense History</h4>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowExpenseForm(true)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#ef4444', borderColor: '#ef4444' }}
                >
                  Record Expense
                </button>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Title</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!budget?.allExpenses || budget.allExpenses.length === 0) ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px 14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No expenses recorded yet.
                        </td>
                      </tr>
                    ) : (
                      budget.allExpenses.sort((a,b) => new Date(b.expenseDate) - new Date(a.expenseDate)).map(exp => (
                        <tr key={exp.expenseId}>
                          <td style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                            {new Date(exp.expenseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '0.8rem', fontWeight: 500 }}>
                            {exp.title}
                            {exp.description && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 400 }}>{exp.description}</div>
                            )}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '0.8rem', fontWeight: 600, textAlign: 'right', color: '#ef4444' }}>
                            {formatINR(exp.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-outline"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {showExpenseForm && (
        <ExpenseFormModal
          projectId={budget?.projectId}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  )
}
