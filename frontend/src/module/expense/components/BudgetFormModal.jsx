import { ChevronLeft } from 'lucide-react'

export default function BudgetFormModal({ mode, budget, projects, onClose }) {
  const isAdd = mode === 'add'
  
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: 12 }} className="card" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }} onClick={onClose}>
            <ChevronLeft size={18} /> {isAdd ? 'Add Budget' : 'Edit Budget'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Project <span style={{ color: 'red' }}>*</span></label>
              <select className="form-select" defaultValue={budget?.projectName || ''}>
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectName}>{p.projectName}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Budget Type <span style={{ color: 'red' }}>*</span></label>
              <select className="form-select" defaultValue={budget?.budgetType || ''}>
                <option value="">Select Type</option>
                <option value="Fixed">Fixed</option>
                <option value="Estimated">Estimated</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Budget Name <span style={{ color: 'red' }}>*</span></label>
              <input type="text" className="form-input" placeholder="Enter budget name" defaultValue={budget?.budgetName || ''} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Total Budget (₹) <span style={{ color: 'red' }}>*</span></label>
              <input type="number" className="form-input" placeholder="Enter amount" defaultValue={budget?.totalBudget || ''} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Description (Optional)</label>
            <textarea 
              className="form-input" 
              rows={4} 
              placeholder="Enter description..." 
              defaultValue={budget?.description || ''} 
              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', overflow: 'hidden', minHeight: '100px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            ></textarea>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>0/200</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={onClose} style={{ padding: '8px 24px' }}>Cancel</button>
            <button className="btn btn-primary" onClick={onClose} style={{ padding: '8px 24px' }}>{isAdd ? 'Save Budget' : 'Update Budget'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
