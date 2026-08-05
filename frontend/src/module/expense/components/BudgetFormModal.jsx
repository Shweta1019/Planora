import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { X, IndianRupee, AlertCircle } from 'lucide-react'

export default function BudgetFormModal({ mode, budget, projects, onClose }) {
  const isAdd = mode === 'add'
  const qc = useQueryClient()

  // For edit mode, pre-fill from existing budget data
  const [projectId, setProjectId] = useState(budget?.id ? String(budget.id) : '')
  const [budgetType, setBudgetType] = useState(budget?.budgetType || '')
  const [budgetName, setBudgetName] = useState(budget?.budgetName || '')
  const [totalBudget, setTotalBudget] = useState(budget?.totalBudget != null ? String(budget.totalBudget) : '')
  const [description, setDescription] = useState(budget?.description || '')
  const [errors, setErrors] = useState({})

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => projectApi.updateBudget(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      onClose()
    },
  })

  function validate() {
    const errs = {}
    if (!projectId) errs.projectId = 'Please select a project.'
    if (!budgetType) errs.budgetType = 'Please select a budget type.'
    if (!budgetName.trim()) errs.budgetName = 'Budget name is required.'
    if (!totalBudget || isNaN(Number(totalBudget))) {
      errs.totalBudget = 'Please enter a valid amount.'
    } else if (Number(totalBudget) <= 0) {
      errs.totalBudget = 'Budget must be greater than ₹0.'
    } else if (Number(totalBudget) > 100_00_00_000) {
      errs.totalBudget = 'Budget cannot exceed ₹100 crore.'
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    
    // Find the managerId for the selected project
    const selectedProject = projects.find(p => String(p.projectId) === String(projectId))
    const managerId = selectedProject ? selectedProject.managerId : (budget?.managerId || null)
    
    updateMut.mutate({ id: Number(projectId), data: { budget: Number(totalBudget), managerId } })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 580, background: 'var(--bg-card)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{isAdd ? 'Add Budget' : 'Edit Budget'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Set total budget allocated for a project</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Global error */}
          {updateMut.isError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} />
              {updateMut.error?.response?.data?.message || 'Failed to save budget. Please try again.'}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            {/* Project */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Project <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="form-select"
                value={projectId}
                onChange={e => { setProjectId(e.target.value); setErrors(v => ({ ...v, projectId: '' })) }}
                disabled={!isAdd}
                style={{ borderColor: errors.projectId ? '#dc2626' : undefined }}
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
              {errors.projectId && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.projectId}</div>}
            </div>

            {/* Budget Type */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Budget Type <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="form-select"
                value={budgetType}
                onChange={e => { setBudgetType(e.target.value); setErrors(v => ({ ...v, budgetType: '' })) }}
                style={{ borderColor: errors.budgetType ? '#dc2626' : undefined }}
              >
                <option value="">Select Type</option>
                <option value="Fixed">Fixed</option>
                <option value="Estimated">Estimated</option>
              </select>
              {errors.budgetType && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.budgetType}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            {/* Budget Name */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Budget Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Q1 Project Budget"
                value={budgetName}
                onChange={e => { setBudgetName(e.target.value); setErrors(v => ({ ...v, budgetName: '' })) }}
                style={{ borderColor: errors.budgetName ? '#dc2626' : undefined }}
              />
              {errors.budgetName && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.budgetName}</div>}
            </div>

            {/* Total Budget */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Total Budget (₹) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="1"
                  value={totalBudget}
                  onChange={e => { setTotalBudget(e.target.value); setErrors(v => ({ ...v, totalBudget: '' })) }}
                  style={{ paddingLeft: 26, borderColor: errors.totalBudget ? '#dc2626' : undefined }}
                />
              </div>
              {errors.totalBudget
                ? <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.totalBudget}</div>
                : totalBudget && !isNaN(Number(totalBudget)) && Number(totalBudget) > 0
                  ? <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(totalBudget))}
                    </div>
                  : null
              }
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Brief notes about this budget allocation..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{description.length}/200</div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-outline" onClick={onClose} style={{ minWidth: 90 }}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={updateMut.isPending}
              style={{ minWidth: 130 }}
            >
              {updateMut.isPending ? 'Saving...' : (isAdd ? 'Save Budget' : 'Update Budget')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
