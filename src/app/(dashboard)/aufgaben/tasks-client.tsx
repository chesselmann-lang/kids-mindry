'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Plus, X, Save, ChevronDown, ChevronUp, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: string
  status: string
  assigned_to: string | null
  profiles: { full_name: string } | null
}

interface Props {
  initialTasks: Task[]
  staffMembers: { id: string; full_name: string }[]
  userId: string
  siteId: string
}

const PRIORITY = {
  low:    { label: 'Niedrig',  color: 'bg-gray-100 text-gray-500' },
  normal: { label: 'Normal',   color: 'bg-blue-100 text-blue-600' },
  high:   { label: 'Hoch',     color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Dringend', color: 'bg-red-100 text-red-600' },
}

export default function TasksClient({ initialTasks, staffMembers, userId, siteId }: Props) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'done'>('open')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [assignedTo, setAssignedTo] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('staff_tasks').insert({
      site_id: siteId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      assigned_to: assignedTo || null,
      created_by: userId,
    }).select('*, profiles!assigned_to(full_name), creator:profiles!created_by(full_name)').single()

    setSaving(false)
    if (data) setTasks(prev => [data as Task, ...prev])
    setTitle(''); setDescription(''); setDueDate(''); setPriority('normal'); setAssignedTo('')
    setShowForm(false)
    router.refresh()
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'done' ? 'open' : 'done'
    const supabase = createClient()
    await supabase.from('staff_tasks').update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null
    }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  async function deleteTask(id: string) {
    const supabase = createClient()
    await supabase.from('staff_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t =>
    filterStatus === 'all' ? true : filterStatus === 'open' ? t.status !== 'done' : t.status === 'done'
  )

  const openCount = tasks.filter(t => t.status !== 'done').length
  const doneCount = tasks.filter(t => t.status === 'done').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
          <p className="text-sm text-gray-500 mt-0.5">{openCount} offen · {doneCount} erledigt</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Aufgabe
        </button>
      </div>

      {/* New task form */}
      {showForm && (
        <div className="card p-4 space-y-3 border-2 border-brand-100">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-900">Neue Aufgabe</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <input className="input-field" placeholder="Titel *" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="input-field resize-none" rows={2} placeholder="Beschreibung (optional)"
            value={description} onChange={e => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fällig am</label>
              <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Priorität</label>
              <select className="input-field" value={priority} onChange={e => setPriority(e.target.value)}>
                {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Zugewiesen an</label>
            <select className="input-field" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Niemandem</option>
              {staffMembers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <button onClick={handleCreate} disabled={!title.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={16} /> {saving ? 'Speichere…' : 'Aufgabe erstellen'}
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['open', 'done', 'all'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s === 'open' ? `Offen (${openCount})` : s === 'done' ? `Erledigt (${doneCount})` : 'Alle'}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{filterStatus === 'open' ? 'Keine offenen Aufgaben 🎉' : 'Keine Aufgaben'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const prio = PRIORITY[task.priority as keyof typeof PRIORITY] ?? PRIORITY.normal
            const isDone = task.status === 'done'
            const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date()
            return (
              <div key={task.id} className={`card p-4 flex items-start gap-3 transition-opacity ${isDone ? 'opacity-60' : ''}`}>
                <button onClick={() => toggleStatus(task)} className="mt-0.5 flex-shrink-0">
                  {isDone
                    ? <CheckCircle2 size={20} className="text-green-500" />
                    : <Circle size={20} className="text-gray-300" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${prio.color}`}>{prio.label}</span>
                    {task.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        <Clock size={10} />
                        {format(new Date(task.due_date), 'd. MMM', { locale: de })}
                        {isOverdue && ' überfällig'}
                      </span>
                    )}
                    {task.profiles?.full_name && (
                      <span className="text-xs text-gray-400">→ {task.profiles.full_name}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-red-50 text-red-400 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
