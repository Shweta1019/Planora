import { X, AlertCircle } from 'lucide-react'
import { formatDate } from '../../../utils/formatDate'

export default function ProjectDeleteModal({ project, onClose, onConfirm, isPending }) {
  if (!project) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 550 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Delete Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body">
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, display: 'flex', gap: 12, marginBottom: 24 }}>
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Are you sure you want to delete this project?</div>
              <div style={{ color: '#b91c1c', fontSize: '0.85rem', lineHeight: 1.4 }}>This action cannot be undone. All project data including tasks, members, documents and expenses will be permanently deleted.</div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Project Name</div>
                <div style={{ fontWeight: 600 }}>{project.projectName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Status</div>
                <span className="badge" style={{ background: '#dcfce7', color: '#10b981' }}>{project.status.replace(/_/g, ' ')}</span>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Project ID</div>
                <div style={{ fontWeight: 500 }}>{project.projectId || `P-1001`}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Priority</div>
                <span style={{ color: '#d97706', fontWeight: 600, background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>{project.priority || 'Medium'}</span>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Project Manager</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                  {project.managerName || 'Amit Kumar'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>End Date</div>
                <div style={{ fontWeight: 500 }}>{formatDate(project.endDate)}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Start Date</div>
                <div style={{ fontWeight: 500 }}>{formatDate(project.startDate)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Budget</div>
                <div style={{ fontWeight: 600 }}>₹{project.budget?.toLocaleString('en-IN') || '2,00,000'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
