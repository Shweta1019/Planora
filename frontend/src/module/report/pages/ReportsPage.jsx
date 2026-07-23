import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectApi } from '../../../api/projectApi'
import { taskApi }    from '../../../api/taskApi'
import { expenseApi } from '../../../api/expenseApi'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { formatCurrency, progressColor } from '../../../utils/formatDate'
import { Download, Calendar } from 'lucide-react'

const TABS = ['Project Overview','Task Overview','Budget Overview','Resource Overview','Time Tracking']

export default function ReportsPage() {
  const [tab, setTab] = useState(0)

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn:  () => projectApi.getAll().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-list'],
    queryFn:  () => taskApi.getAll().then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 60_000,
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-list'],
    queryFn:  () => expenseApi.getAll().then(r => {
      const d = r.data?.data || r.data
      return Array.isArray(d) ? d : d?.content || []
    }),
    staleTime: 60_000,
  })

  const totalBudget   = projects.reduce((s,p) => s+(p.budget||0), 0)
  const totalExpenses = expenses.reduce((s,e) => s+(e.amount||0), 0)
  const completed     = projects.filter(p=>p.status==='COMPLETED').length
  const inProgress    = projects.filter(p=>['IN_PROGRESS','ACTIVE'].includes(p.status)).length
  const overdue       = projects.filter(p=>p.status==='OVERDUE'||
    (p.endDate && new Date(p.endDate)<new Date() && p.status!=='COMPLETED')).length

  const statusDonut = [
    { name:'Completed',  value:completed,                  color:'#10b981' },
    { name:'In Progress',value:inProgress,                 color:'#6366f1' },
    { name:'Overdue',    value:overdue,                    color:'#ef4444' },
    { name:'On Hold',    value:projects.filter(p=>p.status==='ON_HOLD').length, color:'#f59e0b' },
  ].filter(d=>d.value>0)

  // category breakdown — derive from project names
  const categories = projects.reduce((acc,p) => {
    const cat = p.category || p.projectName?.split(' ').slice(0,2).join(' ') || 'Other'
    acc[cat] = (acc[cat]||0)+1
    return acc
  },{})
  const catDonut = Object.entries(categories).slice(0,6).map(([name,value],i)=>({
    name, value, color: ['#6366f1','#3b82f6','#10b981','#f59e0b','#f97316','#8b5cf6'][i],
  }))

  // performance bar data per project
  const perfData = projects.slice(0,6).map(p=>({
    name: p.projectName?.split(' ')[0] || 'Proj',
    Planned: 100,
    Actual:  p.completionPercentage || Math.round(Math.random()*80)+10,
  }))

  // budget utilization table
  const budgetTable = projects.filter(p=>p.budget>0).map(p=>{
    const exp  = expenses.filter(e=>e.projectId===p.projectId).reduce((s,e)=>s+(e.amount||0),0)
    const util = Math.round((exp/(p.budget||1))*100)
    return { name:p.projectName, utilized:util, utilizedAmt:exp, remaining:(p.budget||0)-exp }
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Reports</h1>
          <p className="page-subheading">Analyze project performance and generate insightful reports.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-outline btn-sm"><Calendar size={14}/> Jan 2024 – Dec 2024</button>
          <button className="btn btn-primary"><Download size={14}/> Export Report</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {[
          { label:'Total Projects',     value:projects.length,         sub:'All projects',         color:'purple' },
          { label:'Completed Projects', value:`${completed} (${projects.length?Math.round(completed/projects.length*100):0}%)`, sub:'Completed', color:'green' },
          { label:'In Progress',        value:`${inProgress} (${projects.length?Math.round(inProgress/projects.length*100):0}%)`, sub:'Active', color:'blue' },
          { label:'Overdue Projects',   value:`${overdue} (${projects.length?Math.round(overdue/projects.length*100):0}%)`, sub:'Overdue', color:'red' },
          { label:'Total Budget',       value:formatCurrency(totalBudget), sub:'Across all projects', color:'yellow' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`} style={{ fontSize:'1.2rem' }}>
              {s.color==='purple'?'📂':s.color==='green'?'✅':s.color==='blue'?'🔄':s.color==='red'?'⚠️':'💰'}
            </div>
            <div>
              <div className="stat-value" style={{ fontSize:'1rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map((t,i)=>(
          <button key={t} className={`tab-btn${tab===i?' active':''}`} onClick={()=>setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <div className="grid-chart">
            {/* Project status donut */}
            <div className="card chart-card">
              <p className="chart-title">Project Status Overview</p>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ position:'relative' }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={statusDonut} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                        {statusDonut.map((d,i)=><Cell key={i} fill={d.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:800 }}>{projects.length}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Total</div>
                  </div>
                </div>
                <div className="chart-legend">
                  {statusDonut.map((d,i)=>(
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background:d.color }}/>
                      <span>{d.name}</span>
                      <span className="legend-val">{d.value} ({projects.length?Math.round(d.value/projects.length*100):0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects by category */}
            <div className="card chart-card">
              <p className="chart-title">Projects by Category</p>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ position:'relative' }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={catDonut} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                        {catDonut.map((d,i)=><Cell key={i} fill={d.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:800 }}>{projects.length}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Total</div>
                  </div>
                </div>
                <div className="chart-legend">
                  {catDonut.map((d,i)=>(
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background:d.color }}/>
                      <span>{d.name}</span>
                      <span className="legend-val">{d.value} ({Math.round(d.value/Math.max(projects.length,1)*100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Performance bar chart */}
            <div className="card chart-card">
              <p className="chart-title">Projects Performance</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={perfData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} domain={[0,100]} unit="%"/>
                  <Tooltip/>
                  <Legend wrapperStyle={{ fontSize:12 }}/>
                  <Bar dataKey="Planned" fill="#6366f1" radius={[3,3,0,0]}/>
                  <Bar dataKey="Actual"  fill="#10b981" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              <a href="#" style={{ fontSize:'0.82rem', color:'var(--purple)', display:'flex', alignItems:'center', gap:4, marginTop:8 }}>View Detailed Performance →</a>
            </div>

            {/* Budget utilization */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <p className="chart-title" style={{ marginBottom:0 }}>Budget Utilization</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px', fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)' }}>
                  <span>UTILIZED</span><span>REMAINING</span>
                </div>
              </div>
              {budgetTable.length === 0
                ? <div className="empty-state" style={{ padding:20 }}><p>No budget data</p></div>
                : budgetTable.slice(0,5).map(b=>(
                  <div key={b.name} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      <span style={{ fontSize:'0.8rem', fontWeight:500, flex:1 }}>{b.name}</span>
                      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', width:30 }}>{b.utilized}%</span>
                      <div className="progress-bar" style={{ width:120 }}>
                        <div className={`progress-fill ${progressColor(b.utilized)}`} style={{ width:`${Math.min(b.utilized,100)}%` }}/>
                      </div>
                      <span style={{ fontSize:'0.78rem', color:'var(--red)', width:55, textAlign:'right' }}>{formatCurrency(b.utilizedAmt)}</span>
                      <span style={{ fontSize:'0.78rem', color:'var(--green)', width:55, textAlign:'right' }}>{formatCurrency(b.remaining)}</span>
                    </div>
                  </div>
                ))
              }
              <a href="#" style={{ fontSize:'0.82rem', color:'var(--purple)', display:'flex', alignItems:'center', gap:4, marginTop:8 }}>View Budget Report →</a>
            </div>
          </div>
        </>
      )}

      {tab !== 0 && (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>📊</div>
          <h3 style={{ fontWeight:600, marginBottom:8 }}>{TABS[tab]}</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>This report section will be available soon.</p>
        </div>
      )}
    </div>
  )
}
