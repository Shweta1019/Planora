import { X, AlertTriangle } from 'lucide-react'

export default function DeleteBudgetModal({ budget, isPending, onClose, onConfirm }) {
  if (!budget) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <AlertTriangle size={20} />
            Delete Budget
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          <p style={{ marginBottom: 16, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to delete the budget for <strong>"{budget.projectName || budget.budgetName}"</strong>? 
            This will reset the allocated budget for this project.
          </p>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} 
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Budget'}
          </button>
        </div>
      </div>
    </div>
  )
}

