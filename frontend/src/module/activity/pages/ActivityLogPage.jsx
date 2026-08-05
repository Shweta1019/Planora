import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../../../api/activityApi'
import { projectApi }  from '../../../api/projectApi'
import { Search, Filter } from 'lucide-react'
import { timeAgo, initials } from '../../../utils/formatDate'

const ENTITY_COLORS = {
  PROJECT:  '#6366f1',
  TASK:     '#10b981',
  USER:     '#3b82f6',
  EXPENSE:  '#f59e0b',
  RESOURCE: '#f97316',
  DOCUMENT: '#8b5cf6',
  DEFAULT:  '#9ca3af',
}

const ACTION_COLOR = {
  CREATE: '#10b981',
  UPDATE: '#6366f1',
  DELETE: '#ef4444',
  LOGIN:  '#3b82f6',
  DEFAULT:'#9ca3af',
}

export default function ActivityLogPage() {
  const [search, setSearch] = useState('')
  const [tempSearch, setTempSearch] = useState('')
  const [projF,  setProjF]  = useState('')
  const [page,   setPage]   = useState(1)
  const pageSize = 12

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['activity-all'],
    queryFn:  () => activityApi.getAll({ size: 100 }).then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 30_000,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const filtered = raw.filter(a => {
    const matchS = !search || a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.userFullName?.toLowerCase().includes(search.toLowerCase())
    const matchP = !projF || String(a.projectId) === projF
    return matchS && matchP
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Activity Log</h1>
          <p className="page-subheading">Track all actions and changes across the system.</p>
        </div>
        <button className="btn btn-outline btn-sm"><Filter size={14}/> Filter</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:16, padding:'12px 16px' }}>
        <div className="filter-row" style={{ marginBottom:0 }}>
          <div className="search-box">
            <Search size={14} className="search-icon"/>
            <input type="text" placeholder="Search activity..." className="form-input" style={{ paddingLeft:34 }}
              value={tempSearch} onChange={e=>setTempSearch(e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearch(tempSearch)
                  setPage(1)
                }
              }}/>
          </div>
          <select className="form-select" style={{ width:200 }} value={projF} onChange={e=>setProjF(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p=><option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding:0 }}>
        {isLoading ? <div className="page-loader"><div className="spinner"/></div>
          : paged.length === 0
          ? <div className="empty-state"><h4>No activity found</h4><p>No actions recorded yet.</p></div>
          : (
          <div>
            {paged.map((a, i) => {
              const entityColor = ENTITY_COLORS[a.entityType] || ENTITY_COLORS.DEFAULT
              const actionColor = ACTION_COLOR[a.action]       || ACTION_COLOR.DEFAULT
              return (
                <div key={a.logId || i} style={{
                  display:'flex', gap:16, padding:'16px 20px',
                  borderBottom: i < paged.length-1 ? '1px solid var(--border-light)' : 'none',
                  alignItems:'flex-start',
                }}>
                  {/* Avatar */}
                  {a.userProfileImage ? (
                    <img src={a.userProfileImage} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div className="avatar avatar-md" style={{ background:`linear-gradient(135deg, ${entityColor}, ${entityColor}cc)`, flexShrink:0 }}>
                      {initials(a.userFullName || 'SY')}
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{a.userFullName || 'System'}</span>
                      <span style={{
                        background: actionColor+'18', color: actionColor,
                        borderRadius:'var(--radius-full)', padding:'1px 8px',
                        fontSize:'0.72rem', fontWeight:600,
                      }}>
                        {a.action}
                      </span>
                      <span style={{
                        background: entityColor+'18', color: entityColor,
                        borderRadius:'var(--radius-full)', padding:'1px 8px',
                        fontSize:'0.72rem', fontWeight:500,
                      }}>
                        {a.entityType}
                      </span>
                    </div>
                    <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:4, lineHeight:1.5 }}>
                      {a.description || `${a.action?.toLowerCase()} ${a.entityType?.toLowerCase()}`}
                    </div>
                    {a.projectName && (
                      <div style={{ fontSize:'0.75rem', color:'var(--purple)', marginTop:4 }}>
                        📁 {a.projectName}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', whiteSpace:'nowrap', flexShrink:0, marginTop:2 }}>
                    {timeAgo(a.createdAt)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="pagination">
          <span>Showing {Math.min((page-1)*pageSize+1,total)}–{Math.min(page*pageSize,total)} of {total} activities</span>
          <div className="pag-controls">
            <button className="pag-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=>(
              <button key={n} className={`pag-btn${page===n?' active':''}`} onClick={()=>setPage(n)}>{n}</button>
            ))}
            <button className="pag-btn" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}
