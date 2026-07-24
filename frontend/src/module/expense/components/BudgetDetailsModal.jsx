import { useState } from 'react'
import { ChevronLeft, Wallet, MoreVertical } from 'lucide-react'

export default function BudgetDetailsModal({ budget, isPM, onClose, onEdit, onDelete, formatINR }) {
  const [openMenu, setOpenMenu] = useState(false)
  
  const renderStatus = (status) => {
    if (status === 'Over Budget') return <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#fee2e2', padding: '2px 8px', borderRadius: 12 }}><span style={{ fontSize: '10px' }}>●</span> Over Budget</span>
    if (status === 'At Risk') return <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '2px 8px', borderRadius: 12 }}><span style={{ fontSize: '10px' }}>●</span> At Risk</span>
    return <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#d1fae5', padding: '2px 8px', borderRadius: 12 }}><span style={{ fontSize: '10px' }}>●</span> On Track</span>
  }
  
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: 12 }} className="card" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px' }}>
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
                {isPM && (
                  <div style={{ position: 'relative' }}>
                    <MoreVertical size={18} color="var(--text-secondary)" cursor="pointer" onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu); }} />
                    {openMenu && (
                      <div style={{ position: 'absolute', right: 0, top: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, width: 140, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => { setOpenMenu(false); onEdit(); }}>✏️ Edit Budget</div>
                        <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', color: '#dc2626' }} onClick={() => { setOpenMenu(false); onDelete(); }}>🗑 Delete Budget</div>
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>

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
               <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{formatINR(budget?.remaining)}</div>
             </div>
             <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Utilization</div>
               <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7c3aed' }}>{budget?.utilization}%</div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
             <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Budget Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Budget Type</span>
                      <span>{budget?.budgetType}</span>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Created On</span>
                      <span>{budget?.createdAt ? new Date(budget.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '10 May 2025'}</span>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Description</span>
                      <span style={{ lineHeight: 1.5 }}>{budget?.description}</span>
                   </div>
                </div>
             </div>
             <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Recent Expenses</h4>
                  <span style={{ color: '#7c3aed', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View All</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {budget?.recentExpenses && budget.recentExpenses.length > 0 ? budget.recentExpenses.map((exp, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{exp.description || 'General Expense'}</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatINR(exp.amount)}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {exp.date ? new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '16 May 2025'}
                          </div>
                        </div>
                     </div>
                   )) : (
                     <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent expenses.</div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
