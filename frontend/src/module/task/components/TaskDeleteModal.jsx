import { X, AlertTriangle } from 'lucide-react'

export default function TaskDeleteModal({ task, isPending, onConfirm, onClose }) {
  if (!task) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <AlertTriangle size={20} />
            Delete Task
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} disabled={isPending}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          <p style={{ marginBottom: 16, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the task <strong>"{task.title || task.taskName}"</strong>? 
            This action cannot be undone and will remove all associated data and comments.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} 
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
