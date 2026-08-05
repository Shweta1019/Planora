import { useState } from 'react'
import { X, Calendar } from 'lucide-react'

export default function DownloadReportModal({ budget, onClose }) {
  const [reportType, setReportType] = useState('Budget Report')
  const [project, setProject] = useState(budget?.projectName || '')
  const [startDate, setStartDate] = useState(budget?.startDate || '2024-05-01')
  const [endDate, setEndDate] = useState(budget?.endDate || '2024-08-31')
  const [format, setFormat] = useState('PDF')

  const handleDownload = () => {
    let ext = format.toLowerCase();
    if (ext === 'excel') ext = 'csv';
    
    let type = 'text/plain';
    if (ext === 'pdf') type = 'application/pdf';
    else if (ext === 'xlsx') type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === 'csv') type = 'text/csv';

    // Generate dummy download based on state
    const csv = `Report Type,Project,Start Date,End Date,Format\n${reportType},${project},${startDate},${endDate},${format}`;
    const blob = new Blob([csv], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.replace(/\s+/g, '_')}_${reportType.replace(/\s+/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 650, background: 'var(--bg-card)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Download Report</h2>
          <X size={20} cursor="pointer" color="var(--text-secondary)" onClick={onClose} />
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Select Report Type</label>
            <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: '100%', height: 44 }}>
              <option value="Budget Report">Budget Report</option>
              <option value="Expense Report">Expense Report</option>
              <option value="Variance Report">Variance Report</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Project</label>
            <select className="form-select" value={project} onChange={e => setProject(e.target.value)} style={{ width: '100%', height: 44 }}>
              <option value={budget?.projectName || 'Project'}>{budget?.projectName || 'Project'}</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Date Range</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', height: 44, paddingRight: 40 }} />
                <Calendar size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: 12, top: 14, pointerEvents: 'none' }} />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>-</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', height: 44, paddingRight: 40 }} />
                <Calendar size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: 12, top: 14, pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Format</label>
            <select className="form-select" value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%', maxWidth: 300, height: 44 }}>
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <button style={{ padding: '10px 24px', background: 'white', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }} onClick={onClose}>
            Cancel
          </button>
          <button style={{ padding: '10px 24px', background: 'var(--purple)', border: 'none', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'white' }} onClick={handleDownload}>
            Download
          </button>
        </div>

      </div>
    </div>
  )
}
