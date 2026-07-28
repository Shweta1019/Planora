import { X, Folder } from 'lucide-react'
import { formatDate } from '../../../utils/formatDate'

export default function ProjectDetailsModal({ project, onClose }) {
  if (!project) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>View Project Details</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Folder size={28} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{project.projectName}</h3>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Project ID</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{project.projectId}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px', marginBottom: 24, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Project Manager</span>
              <div style={{ fontWeight: 500 }}>{project.managerName || 'Not Assigned'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Team Members</span>
              <span style={{ fontWeight: 500 }}>{project.totalMembers || 0}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ fontWeight: 600 }}>{project.status?.replace(/_/g, ' ') || 'PLANNING'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Priority</span>
              <span style={{ fontWeight: 600 }}>{project.priority || 'MEDIUM'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Start Date</span>
              <span style={{ fontWeight: 500 }}>{formatDate(project.startDate) || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>End Date</span>
              <span style={{ fontWeight: 500 }}>{formatDate(project.endDate) || '—'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <span style={{ fontWeight: 600 }}>{project.completionPercentage || 0}%</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Description</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {project.description || 'No description provided.'}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-outline" onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
        </div>
      </div>
    </div>
  )
}
