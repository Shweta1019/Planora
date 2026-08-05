import { useState, useRef } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../../../api/documentApi'
import { projectApi }  from '../../../api/projectApi'
import { Search, RotateCcw, Upload, FolderPlus, Eye, Download, MoreHorizontal, Folder } from 'lucide-react'
import { formatDate, formatDateTime } from '../../../utils/formatDate'

const FILE_TYPES = {
  'pdf':  { cls:'file-pdf',  ext:'PDF',  icon:'📄' },
  'docx': { cls:'file-doc',  ext:'DOCX', icon:'📝' },
  'doc':  { cls:'file-doc',  ext:'DOC',  icon:'📝' },
  'xlsx': { cls:'file-xls',  ext:'XLSX', icon:'📊' },
  'xls':  { cls:'file-xls',  ext:'XLS',  icon:'📊' },
  'png':  { cls:'file-png',  ext:'PNG',  icon:'🖼️' },
  'jpg':  { cls:'file-png',  ext:'JPG',  icon:'🖼️' },
  'zip':  { cls:'file-zip',  ext:'ZIP',  icon:'📦' },
  'fig':  { cls:'file-fig',  ext:'FIG',  icon:'🎨' },
  'folder':{ cls:'file-folder',ext:'—',  icon:'📁' },
}

function getFileInfo(name, isFolder) {
  if (isFolder) return FILE_TYPES.folder
  const ext = name?.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPES[ext] || { cls:'file-other', ext: ext.toUpperCase() || 'FILE', icon:'📎' }
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes >= 1073741824) return (bytes/1073741824).toFixed(1)+' GB'
  if (bytes >= 1048576)    return (bytes/1048576).toFixed(1)+' MB'
  if (bytes >= 1024)       return Math.round(bytes/1024)+' KB'
  return bytes+' B'
}

const TABS = ['All Files','Project Files','Shared with Me','Recent Files','Trash']

export default function DocumentPage() {
  const qc       = useQueryClient()
  const fileRef  = useRef(null)
  const [tab, setTab]       = useState(0)
  const [search, setSearch] = useState('')
  const [tempSearch, setTempSearch] = useState('')
  const [projF, setProjF]   = useState('')
  const [typeF, setTypeF]   = useState('')
  const [uploaderF, setUploaderF] = useState('')
  const [page, setPage]     = useState(1)
  const pageSize = 8

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  // Fetch documents for every project in parallel, then merge
  const docQueries = useQueries({
    queries: projects.map(p => ({
      queryKey: ['documents-project', p.projectId],
      queryFn:  () => documentApi.getByProject(p.projectId).then(r => {
        const d = r.data?.data || r.data
        const list = Array.isArray(d) ? d : d?.content || []
        return list.map(doc => ({ ...doc, projectName: p.projectName }))
      }),
      staleTime: 30_000,
      enabled:   projects.length > 0,
    })),
  })

  const isLoading = docQueries.some(q => q.isLoading)
  const raw = docQueries.flatMap(q => q.data || [])

  const uploadMut = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData()
      fd.append('file', file)
      if (projF) fd.append('projectId', projF)
      return documentApi.upload(fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents-project'] }) },
  })

  const deleteMut = useMutation({
    mutationFn: (id) => documentApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['documents-project'] }),
  })

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (file) uploadMut.mutate(file)
    e.target.value = ''
  }

  const filtered = raw.filter(f => {
    const matchS = !search   || f.fileName?.toLowerCase().includes(search.toLowerCase())
    const matchP = !projF    || String(f.projectId) === projF
    const matchT = !typeF    || f.fileType?.toLowerCase() === typeF.toLowerCase()
    const matchU = !uploaderF|| f.uploadedByName?.toLowerCase().includes(uploaderF.toLowerCase())
    return matchS && matchP && matchT && matchU
  })

  // stats
  const totalSize     = raw.reduce((s,f)=>s+(f.fileSize||0),0)
  const sharedFiles   = raw.filter(f=>f.isShared).length
  const downloads     = raw.reduce((s,f)=>s+(f.downloadCount||0),0)

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total/pageSize))
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">File Management</h1>
          <p className="page-subheading">Upload, manage and organize project files and documents.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-outline" onClick={()=>fileRef.current?.click()}>
            <Upload size={14}/> Upload Files
          </button>
          <button className="btn btn-primary"><FolderPlus size={15}/> New Folder</button>
          <input type="file" ref={fileRef} style={{ display:'none' }} onChange={handleFileUpload}/>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Total Files', value:raw.length, sub:'Across all projects', icon:'📁', color:'purple' },
          { label:'Total Size',  value:formatSize(totalSize), sub:'Storage used', icon:'💾', color:'green' },
          { label:'Shared Files',value:sharedFiles, sub:'Files shared with team', icon:'🔗', color:'blue'  },
          { label:'Downloads',   value:downloads,   sub:'This month', icon:'⬇️', color:'yellow' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`} style={{ fontSize:'1.2rem' }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize:'1.2rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map((t,i)=>(
          <button key={t} className={`tab-btn${tab===i?' active':''}`} onClick={()=>{setTab(i);setPage(1)}}>{t}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:16, padding:'12px 16px' }}>
        <div className="filter-row" style={{ marginBottom:0 }}>
          <div className="search-box">
            <Search size={14} className="search-icon"/>
            <input type="text" placeholder="Search files..." className="form-input" style={{ paddingLeft:34 }}
              value={tempSearch} onChange={e=>setTempSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearch(tempSearch)
                  setPage(1)
                }
              }}/>
          </div>
          <select className="form-select" style={{ width:180 }} value={projF} onChange={e=>setProjF(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p=><option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
          </select>
          <select className="form-select" style={{ width:150 }} value={typeF} onChange={e=>setTypeF(e.target.value)}>
            <option value="">All File Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="xlsx">XLSX</option>
            <option value="png">PNG</option>
            <option value="zip">ZIP</option>
          </select>
          <select className="form-select" style={{ width:160 }} value={uploaderF} onChange={e=>setUploaderF(e.target.value)}>
            <option value="">All Uploaded By</option>
            {[...new Set(raw.map(f => f.uploadedByName).filter(Boolean))].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {(search||projF||typeF||uploaderF) && (
            <button className="btn btn-ghost btn-sm" onClick={()=>{setSearch('');setProjF('');setTypeF('');setUploaderF('')}}>
              <RotateCcw size={13}/> Reset
            </button>
          )}
          <button className="btn btn-outline btn-sm">Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {isLoading ? <div className="page-loader"><div className="spinner"/></div> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="table-checkbox"/></th>
                    <th>Name</th>
                    <th>Project</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded By</th>
                    <th>Uploaded On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'var(--text-muted)' }}>
                      {raw.length === 0
                        ? <>No files yet. <button onClick={()=>fileRef.current?.click()} style={{ color:'var(--purple)', fontWeight:500 }}>Upload your first file</button></>
                        : 'No files match your search'
                      }
                    </td></tr>
                  ) : paged.map(f => {
                    const isFolder = f.isFolder
                    const info = getFileInfo(f.fileName, isFolder)
                    const pName = projects.find(p=>p.projectId===f.projectId)?.projectName
                    return (
                      <tr key={f.documentId || f.fileId}>
                        <td className="td-check"><input type="checkbox" className="table-checkbox"/></td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div className={`file-icon ${info.cls}`}>{info.icon}</div>
                            <div>
                              <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{f.fileName}</div>
                              {isFolder && <div className="td-muted">{f.fileCount} files</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          {pName
                            ? <a href={`/projects/${f.projectId}`} style={{ color:'var(--purple)', fontWeight:500, fontSize:'0.82rem' }}>{pName}</a>
                            : <span className="td-muted">—</span>
                          }
                        </td>
                        <td style={{ fontSize:'0.82rem', fontWeight:500 }}>{info.ext}</td>
                        <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{formatSize(f.fileSize)}</td>
                        <td>
                          {f.uploadedByName
                            ? <div className="user-cell">
                                {f.uploadedByProfileImage ? (
                                  <img src={f.uploadedByProfileImage} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div className="avatar avatar-sm">{f.uploadedByName[0]}</div>
                                )}
                                <span style={{ fontSize:'0.82rem' }}>{f.uploadedByName}</span>
                              </div>
                            : <span className="td-muted">—</span>
                          }
                        </td>
                        <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{formatDateTime(f.uploadedAt||f.createdAt)}</td>
                        <td>
                          <div className="actions-cell">
                            {!isFolder && <button className="action-btn view" title="Preview"><Eye size={14}/></button>}
                            {!isFolder && <button className="action-btn" title="Download" style={{ color:'var(--blue)' }} onClick={()=>window.open(`/api/documents/${f.documentId||f.fileId}/download`,'_blank')}><Download size={14}/></button>}
                            <button className="action-btn" title="More"><MoreHorizontal size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Showing {Math.min((page-1)*pageSize+1,total)}–{Math.min(page*pageSize,total)} of {total} files</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
                {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=>(
                  <button key={n} className={`pag-btn${page===n?' active':''}`} onClick={()=>setPage(n)}>{n}</button>
                ))}
                <button className="pag-btn" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
