import { useState } from 'react'
import { X, Info } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'

const STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

export default function ProjectStatusModal({ project, onClose }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState(project?.status || 'ACTIVE')

  const mut = useMutation({
    mutationFn: () => projectApi.updateStatus(project.projectId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      onClose()
    }
  })

  if (!project) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Change Project Status</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
          <div className="modal-body">
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
            <Info size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
            <div style={{ color: '#1e3a8a', fontSize: '0.85rem' }}>Update the status of this project.</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 24 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status</div>
            <span className="badge" style={{ background: '#dcfce7', color: '#10b981', fontWeight: 600 }}>{project.status.replace(/_/g, ' ')}</span>
          </div>

          <div className="form-group">
            <label className="form-label">New Status <span style={{ color: '#ef4444' }}>*</span></label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>


        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mut.isPending}>
            {mut.isPending ? 'Updating...' : 'Update Status'}
          </button>
        </div>
        </form>
      </div>
    </div>
  )
}
