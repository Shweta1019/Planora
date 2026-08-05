import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../../../api/taskApi'
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import { statusBadgeClass, statusLabel, priorityBadgeClass, formatDate } from '../../../utils/formatDate'

const COLUMNS = [
  { key: 'TODO',       label: 'To Do',       color: '#9ca3af' },
  { key: 'IN_PROGRESS', label: 'In Progress',  color: '#6366f1' },
  { key: 'IN_REVIEW',   label: 'In Review',    color: '#f97316' },
  { key: 'COMPLETED',   label: 'Completed',    color: '#10b981' },
  { key: 'OVERDUE',     label: 'Overdue',      color: '#ef4444' },
]

function TaskCard({ task, onEdit, onDelete }) {
  const pct = task.status === 'COMPLETED' ? 100 : (task.status === 'IN_REVIEW' ? (task.completionPercentage || 75) : (task.status === 'IN_PROGRESS' ? (task.completionPercentage || 50) : (task.completionPercentage || 0)))
  return (
    <div className="task-card">
      <div className="task-card-project">{task.projectName || 'General'}</div>
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-footer">
        {task.assignedToProfileImage ? (
          <img src={task.assignedToProfileImage} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div className="avatar avatar-sm">{task.assignedToName?.[0] || '?'}</div>
        )}
        <span>{formatDate(task.dueDate)}</span>
        <span className={`badge ${priorityBadgeClass(task.priority)}`} style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
          {task.priority}
        </span>
      </div>
      {pct > 0 && (
        <div className="task-card-progress">
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill blue" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 3 }}>{pct}%</div>
        </div>
      )}
    </div>
  )
}

export default function TaskBoardView({ tasks = [], projects = [], onEdit, onDelete }) {
  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key)
        return (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header">
              <div className="kanban-col-title">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                {col.label}
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <button className="action-btn"><MoreHorizontal size={15} /></button>
            </div>
            <div className="kanban-cards">
              {colTasks.map(t => (
                <TaskCard key={t.taskId} task={t} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
            <button className="kanban-add-btn" onClick={() => onEdit(null)}>
              <Plus size={14} /> Add Task
            </button>
          </div>
        )
      })}
    </div>
  )
}
