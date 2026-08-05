import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseApi } from '../../../api/expenseApi'
import { X, Receipt, AlertCircle, IndianRupee } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'

export default function ExpenseFormModal({ projectId, onClose }) {
  const qc = useQueryClient()
  const { user } = useAuthStore()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState({})

  const createMut = useMutation({
    mutationFn: (data) => expenseApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses-project', projectId] })
      qc.invalidateQueries({ queryKey: ['projects-list'] })
      onClose()
    },
  })

  function validate() {
    const errs = {}
    if (!title.trim()) errs.title = 'Title is required.'
    if (!amount || isNaN(Number(amount))) {
      errs.amount = 'Please enter a valid amount.'
    } else if (Number(amount) < 0) {
      errs.amount = 'Expense amount cannot be negative.'
    } else if (Number(amount) === 0) {
      errs.amount = 'Expense amount must be greater than 0.'
    }
    if (!expenseDate) errs.expenseDate = 'Date is required.'
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    createMut.mutate({
      projectId: Number(projectId),
      title,
      amount: Number(amount),
      expenseDate,
      description,
      category,
      submittedById: user?.userId
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 500, background: 'var(--bg-card)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Record Expense</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Add a new expense for this project</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {createMut.isError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} />
              {createMut.error?.response?.data?.message || 'Failed to record expense. Please try again.'}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Expense Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Server Hosting"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(v => ({ ...v, title: '' })) }}
              style={{ borderColor: errors.title ? '#dc2626' : undefined }}
            />
            {errors.title && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.title}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Amount (₹) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setErrors(v => ({ ...v, amount: '' })) }}
                  style={{ paddingLeft: 26, borderColor: errors.amount ? '#dc2626' : undefined }}
                />
              </div>
              {errors.amount && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.amount}</div>}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={expenseDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => { setExpenseDate(e.target.value); setErrors(v => ({ ...v, expenseDate: '' })) }}
                style={{ borderColor: errors.expenseDate ? '#dc2626' : undefined }}
              />
              {errors.expenseDate && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.expenseDate}</div>}
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Category <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software, Hardware, Travel"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Provide details about this expense..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-outline" onClick={onClose} style={{ minWidth: 90 }}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={createMut.isPending}
              style={{ minWidth: 130, background: '#ef4444', borderColor: '#ef4444' }}
            >
              {createMut.isPending ? 'Saving...' : 'Record Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
