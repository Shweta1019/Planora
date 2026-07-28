import { X, Calendar, Flag, CheckSquare } from 'lucide-react'
import { formatDate, statusBadgeClass, statusLabel, priorityBadgeClass, progressColor } from '../../../utils/formatDate'

export default function TaskDetailsModal({ task, onClose }) {
  if (!task) return null

  const pct = task.completionPercentage || 0

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>View Task Details</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={28} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{task.title}</h3>
                <span className={`badge ${statusBadgeClass(task.status)}`}>{statusLabel(task.status)}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Project: <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{task.projectName}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Task ID</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.taskId || `${Math.floor(Math.random()*1000)+1000}`}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px', marginBottom: 24, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned To</span>
              <div style={{ fontWeight: 500 }}>{task.assignedToName || '—'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned By</span>
              <div style={{ fontWeight: 500 }}>{task.assignedByName || '—'}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span className={`badge ${statusBadgeClass(task.status)}`}>{statusLabel(task.status)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Priority</span>
              <span className={`badge ${priorityBadgeClass(task.priority)}`}>{task.priority}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Start Date</span>
              <span style={{ fontWeight: 500 }}>{formatDate(task.startDate) || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Due Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                <Calendar size={13} style={{ opacity: 0.5 }} />
                {formatDate(task.dueDate) || '—'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Created On</span>
              <span style={{ fontWeight: 500 }}>{formatDate(task.createdAt || new Date())}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Last Updated</span>
              <span style={{ fontWeight: 500 }}>{formatDate(task.updatedAt || new Date())}</span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Progress</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, width: '100%' }}>
              <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: pct >= 80 ? '#10b981' : pct >= 40 ? '#6366f1' : 'var(--text-secondary)' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Description</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
              {task.description || 'No description provided.'}
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
