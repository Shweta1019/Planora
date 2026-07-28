import { useState } from 'react'
import { X } from 'lucide-react'

export default function ProjectReportModal({ project, onClose }) {
  const [reportType, setReportType] = useState('Project Overview Report')
  const [projectName, setProjectName] = useState(project?.projectName || '')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState('PDF')

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Download Report</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" style={{ color: '#ef4444' }}>Report Type *</label>
            <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="Project Overview Report">Project Overview Report</option>
              <option value="Task Status Report">Task Status Report</option>
              <option value="Budget Report">Budget Report</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#ef4444' }}>Project *</label>
            <select className="form-select" value={projectName} onChange={e => setProjectName(e.target.value)}>
              <option value={projectName}>{projectName || 'Website Redesign'}</option>
              <option value="All Projects">All Projects</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#ef4444' }}>Date Range *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ color: 'var(--text-secondary)' }}>—</span>
              <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: '#ef4444' }}>Format *</label>
            <select className="form-select" value={format} onChange={e => setFormat(e.target.value)}>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel / XLSX</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Download</button>
        </div>
      </div>
    </div>
  )
}
