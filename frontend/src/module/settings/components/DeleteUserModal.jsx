import { X } from 'lucide-react'

export default function DeleteUserModal({ user, onClose, onConfirm, isDeleting }) {
  if (!user) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--red)' }}>Delete User</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Are you sure you want to delete <strong>{user.fullName || user.firstName || 'this user'}</strong>? 
            This action cannot be undone and they will lose access to the system.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => onConfirm(user.userId)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}
