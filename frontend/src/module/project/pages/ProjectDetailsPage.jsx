import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { taskApi }    from '../../../api/taskApi'
import { activityApi }from '../../../api/activityApi'
import {
  ArrowLeft, Star, Share2, MoreHorizontal, Pencil,
  User, Building, Tag, Calendar, FileText, Check
} from 'lucide-react'
import {
  formatDate, formatDateTime, statusBadgeClass, statusLabel,
  priorityBadgeClass, progressColor, timeAgo, initials
} from '../../../utils/formatDate'
import ProjectFormModal from '../components/ProjectForm'
import { useQueryClient } from '@tanstack/react-query'

const TABS = ['Overview','Tasks','Files','Team','Timeline','Budget','Discussions','Activity']

export default function ProjectDetailsPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const qc           = useQueryClient()
  const [tab, setTab]        = useState(0)
  const [editing, setEditing] = useState(false)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn:  () => projectApi.getById(id).then(r => r.data?.data || r.data),
    staleTime: 30_000,
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-list'],
    queryFn:  () => taskApi.getAll().then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 30_000,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['project-activity', id],
    queryFn:  () => activityApi.getByProject(id).then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }).catch(()=>[]),
    staleTime: 30_000,
  })

  const projectTasks   = tasks.filter(t => String(t.projectId) === String(id))
  const recentTasks    = projectTasks.slice(0, 5)

  const completedCount = projectTasks.filter(t=>t.status==='COMPLETED').length
  const pct = project?.completionPercentage || (projectTasks.length ? Math.round(completedCount/projectTasks.length*100) : 0)

  // milestones — static for now
  const milestones = [
    { label:'Project Kickoff',   date: project?.startDate,  done:true  },
    { label:'Design Phase',      date: null,                done: pct>25 },
    { label:'Development Phase', date: null,                done: pct>60, active: pct>25 && pct<=60 },
    { label:'Testing Phase',     date: null,                done: pct>80 },
    { label:'Project Launch',    date: project?.endDate,    done: project?.status==='COMPLETED' },
  ]

  if (isLoading) return <div className="page-loader"><div className="spinner"/></div>

  if (!project) return (
    <div className="empty-state" style={{ paddingTop:80 }}>
      <h4>Project not found</h4>
      <button className="btn btn-primary" onClick={()=>navigate('/projects')} style={{ marginTop:16 }}><ArrowLeft size={14}/> Back</button>
    </div>
  )

  const daysRemaining = project.endDate
    ? Math.max(0, Math.ceil((new Date(project.endDate)-Date.now())/(86400*1000)))
    : null

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <button onClick={()=>navigate('/projects')} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:10 }}>
          <ArrowLeft size={15}/> Back to Projects
        </button>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <h1 className="page-heading" style={{ marginBottom:0 }}>{project.projectName}</h1>
              <button style={{ color:'#f59e0b' }}><Star size={18} fill="#f59e0b"/></button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span className={`badge ${statusBadgeClass(project.status)}`}>{statusLabel(project.status)}</span>
              {project.projectCode && <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>📋 {project.projectCode}</span>}
              {project.startDate && <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>📅 {formatDate(project.startDate)} – {formatDate(project.endDate)}</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-outline btn-sm"><Share2 size={14}/> Share</button>
            <button className="btn btn-outline btn-sm"><MoreHorizontal size={14}/> More</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setEditing(true)}><Pencil size={14}/> Edit Project</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map((t,i)=>(
          <button key={t} className={`tab-btn${tab===i?' active':''}`} onClick={()=>setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Progress + health */}
            <div className="card">
              <div style={{ display:'flex', gap:30, alignItems:'center' }}>
                {/* Donut */}
                <div style={{ position:'relative', width:120, height:120, flexShrink:0 }}>
                  <svg viewBox="0 0 120 120" style={{ transform:'rotate(-90deg)', width:120, height:120 }}>
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="14"/>
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#6366f1" strokeWidth="14"
                      strokeDasharray={`${2*Math.PI*45*pct/100} ${2*Math.PI*45*(1-pct/100)}`}
                      strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                    <div style={{ fontSize:'1.3rem', fontWeight:800, color:'var(--purple)' }}>{pct}%</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Complete</div>
                  </div>
                </div>
                {/* Stats */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                    <span style={{ fontSize:'0.875rem', fontWeight:600 }}>Project Health</span>
                    <span style={{ background:'rgba(16,185,129,0.12)', color:'var(--green)', borderRadius:'var(--radius-full)', padding:'2px 10px', fontSize:'0.75rem', fontWeight:600 }}>
                      ✅ On Track
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:24 }}>
                    <div>
                      <div style={{ fontSize:'1.1rem', fontWeight:700 }}>{completedCount}/{projectTasks.length}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Tasks Completed</div>
                    </div>
                    {daysRemaining !== null && (
                      <div>
                        <div style={{ fontSize:'1.1rem', fontWeight:700 }}>{daysRemaining}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Days Remaining</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize:'1.1rem', fontWeight:700 }}>{formatDate(project.endDate)}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Completion Date</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="card">
              <div className="section-header">
                <span className="section-title">Recent Tasks</span>
                <a href={`/tasks`} className="section-link">View all tasks →</a>
              </div>
              {recentTasks.length === 0
                ? <div className="empty-state" style={{ padding:'20px 0' }}><p>No tasks yet</p></div>
                : recentTasks.map(t=>(
                  <div key={t.taskId} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                    <div style={{
                      width:18, height:18, borderRadius:'50%', border:'2px solid',
                      borderColor: t.status==='COMPLETED'?'var(--green)':t.status==='OVERDUE'?'var(--red)':'var(--border)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    }}>
                      {t.status==='COMPLETED' && <Check size={10} color="var(--green)"/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{t.taskName}</div>
                    </div>
                    <div className="user-cell" style={{ gap:6 }}>
                      {t.assignedToName && <div className="avatar avatar-sm">{initials(t.assignedToName)}</div>}
                    </div>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{formatDate(t.dueDate)}</span>
                    <span className={`badge ${statusBadgeClass(t.status)}`} style={{ fontSize:'0.72rem' }}>{statusLabel(t.status)}</span>
                  </div>
                ))
              }
            </div>

            {/* Milestones */}
            <div className="card">
              <div className="section-header">
                <span className="section-title">Milestones</span>
                <a href="#" className="section-link">View timeline →</a>
              </div>
              <div className="timeline-bar">
                {milestones.map((m,i)=>(
                  <div key={i} className={`timeline-step${m.done?' done':''}`}>
                    <div className={`timeline-dot${m.done?' done':m.active?' active':''}`}>
                      {m.done && <Check size={10}/>}
                    </div>
                    <div className="timeline-label">{m.label}</div>
                    {m.date && <div className="timeline-date">{formatDate(m.date)}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Activity */}
            {activity.length > 0 && (
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Latest Activity</span>
                  <a href="/activity" className="section-link">View all activity →</a>
                </div>
                {activity.slice(0,4).map((a,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                    <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#6366f1,#a78bfa)', flexShrink:0 }}>
                      {initials(a.userFullName||'SY')}
                    </div>
                    <div>
                      <div style={{ fontSize:'0.82rem' }}><strong>{a.userFullName}</strong> {a.description}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{timeAgo(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Project details */}
            <div className="card">
              <div style={{ fontWeight:700, fontSize:'0.875rem', marginBottom:14 }}>Project Details</div>
              {[
                { icon:User,     label:'Project Manager', value: project.managerName },
                { icon:Building, label:'Client',          value: project.clientName  },
                { icon:Tag,      label:'Priority',        value: project.priority, isPriority:true },
                { icon:Tag,      label:'Category',        value: project.category   },
                { icon:Calendar, label:'Status',          value: project.status,    isStatus:true },
              ].map(({ icon:Icon, label, value, isPriority, isStatus })=>(
                <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                  <Icon size={15} color="var(--text-muted)" style={{ flexShrink:0, marginTop:2 }}/>
                  <div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
                    {isPriority
                      ? <span className={`badge ${priorityBadgeClass(value)}`}>{value}</span>
                      : isStatus
                      ? <span className={`badge ${statusBadgeClass(value)}`}>{statusLabel(value)}</span>
                      : <span style={{ fontSize:'0.82rem', fontWeight:500 }}>{value||'—'}</span>
                    }
                  </div>
                </div>
              ))}
              {project.description && (
                <div style={{ paddingTop:10, borderTop:'1px solid var(--border-light)' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>Description</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{project.description}</div>
                </div>
              )}
            </div>

            {/* Team */}
            {project.members?.length > 0 && (
              <div className="card">
                <div className="section-header">
                  <span style={{ fontWeight:700, fontSize:'0.875rem' }}>Team Members</span>
                  <a href="#" className="section-link">View all →</a>
                </div>
                {project.members.slice(0,4).map((m,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div className="avatar avatar-sm">{initials(m.fullName||m.name)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.82rem', fontWeight:500 }}>{m.fullName||m.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{m.role?.replace('_',' ')}</div>
                    </div>
                    <button style={{ color:'var(--text-muted)', display:'flex', padding:2 }}><FileText size={13}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab !== 0 && (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🚧</div>
          <h3 style={{ fontWeight:600, marginBottom:8 }}>{TABS[tab]}</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>This tab is under construction.</p>
        </div>
      )}

      {editing && (
        <ProjectFormModal
          project={project}
          users={[]}
          onClose={()=>setEditing(false)}
          onSaved={()=>{ qc.invalidateQueries({queryKey:['project',id]}); setEditing(false) }}
        />
      )}
    </div>
  )
}
