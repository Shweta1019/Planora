// ── Date formatting ─────────────────────────────────────────
export function formatDate(str, opts = {}) {
  if (!str) return '—'
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...opts
  })
}

export function formatDateTime(str) {
  if (!str) return '—'
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(str) {
  if (!str) return ''
  const diff = (Date.now() - new Date(str)) / 1000
  if (diff < 60)  return `${Math.floor(diff)} sec ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

// ── String helpers ───────────────────────────────────────────
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export function truncate(str = '', max = 40) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ── Number helpers ───────────────────────────────────────────
export function formatCurrency(n, currency = 'USD') {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0
  }).format(n)
}

export function formatPct(n) {
  if (n == null) return '0%'
  return `${Math.round(n)}%`
}

// ── Color helpers ─────────────────────────────────────────────
export function progressColor(pct) {
  if (pct >= 80) return 'green'
  if (pct >= 40) return 'blue'
  if (pct >= 20) return 'yellow'
  return 'red'
}

export function statusBadgeClass(status = '') {
  const map = {
    'ACTIVE':          'badge-active',
    'IN_PROGRESS':     'badge-in-progress',
    'COMPLETED':       'badge-completed',
    'PLANNING':        'badge-planning',
    'ON_HOLD':         'badge-on-hold',
    'CANCELLED':       'badge-cancelled',
    'NOT_STARTED':     'badge-not-started',
    'OVERDUE':         'badge-overdue',
    'IN_REVIEW':       'badge-in-review',
    'TO_DO':           'badge-not-started',
    'ON_TRACK':        'badge-on-track',
    'OVER_BUDGET':     'badge-over-budget',
    'UNDER_BUDGET':    'badge-under-budget',
    'PLANNED':         'badge-planned',
    'FULLY_ALLOCATED': 'badge-fully-allocated',
    'PARTIALLY_AVAILABLE': 'badge-partially-available',
    'FULLY_AVAILABLE': 'badge-fully-available',
  }
  return map[status?.toUpperCase()] || 'badge-not-started'
}

export function priorityBadgeClass(p = '') {
  const map = {
    HIGH:     'badge-high',
    MEDIUM:   'badge-medium',
    LOW:      'badge-low',
    CRITICAL: 'badge-critical',
  }
  return map[p?.toUpperCase()] || 'badge-low'
}

export function statusLabel(s = '') {
  return s.replace(/_/g, ' ')
    .split(' ')
    .map(w => w[0] + w.slice(1).toLowerCase())
    .join(' ')
}
