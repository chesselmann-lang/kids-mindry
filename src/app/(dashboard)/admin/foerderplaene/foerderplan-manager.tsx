'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Save, CheckCircle2, Trash2, Target, X, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Child { id: string; first_name: string; last_name: string }
interface Plan {
  id: string
  child_id: string
  title: string
  goals: string[]
  start_date: string
  review_date: string | null
  notes: string | null
  is_active: boolean
  children?: { first_name: string; last_name: string }
}

interface Props {
  siteId: string
  staffId: string
  children: Child[]
  plans: Plan[]
}

export default function FoerderplanManager({ siteId, staffId, children, plans: initial }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [plans, setPlans] = useState<Plan[]>(initial)
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [title, setTitle] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [reviewDate, setReviewDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  function addGoal() {
    const t = newGoal.trim()
    if (t) { setGoals(p => [...p, t]); setNewGoal('') }
  }

  async function handleSave() {
    if (!childId || !title.trim() || goals.length === 0) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('foerderplaene').insert({
      site_id: siteId,
      child_id: childId,
      title: title.trim(),
      goals,
      start_date: startDate,
      review_date: reviewDate || null,
      notes: notes.trim() || null,
      is_active: true,
      created_by: staffId,
    }).select('*, children(first_name, last_name)').single()

    setSaving(false)
    if (data) {
      setPlans(prev => [data as Plan, ...prev])
      setSaved(true)
      setChildId(''); setTitle(''); setGoals([]); setNotes(''); setReviewDate('')
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
  }

  async function getAiGoals() {
    if (!childId) return
    setAiLoading(true)
    setAiSuggestions([])
    try {
      const res = await fetch('/api/ai/foerderplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, planTitle: title }),
      })
      const data = await res.json()
      if (data.goals?.length) setAiSuggestions(data.goals)
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  function addAiGoal(g: string) {
    if (!goals.includes(g)) setGoals(prev => [...prev, g])
    setAiSuggestions(prev => prev.filter(s => s !== g))
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('foerderplaene').update({ is_active: !current }).eq('id', id)
    setPlans(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Plus size={16} className="text-brand-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Neuen Förderplan erstellen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="label">Kind *</label>
                <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
                  <option value="">Auswählen…</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start</label>
                <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Titel *</label>
              <input className="input-field" placeholder="z.B. Sprachförderung Q1 2026"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            {/* Goals */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Förderziele *</label>
                <button
                  onClick={getAiGoals}
                  disabled={!childId || aiLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors disabled:opacity-40"
                >
                  {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  KI-Vorschläge
                </button>
              </div>
              <div className="flex gap-2">
                <input className="input-field flex-1" placeholder="Ziel hinzufügen …"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }} />
                <button onClick={addGoal} className="btn-primary px-3 py-2 text-sm">+</button>
              </div>
              {goals.length > 0 && (
                <div className="space-y-1 mt-2">
                  {goals.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 bg-brand-50 rounded-lg px-3 py-1.5">
                      <Target size={12} className="text-brand-500 flex-shrink-0" />
                      <span className="text-xs text-brand-800 flex-1">{g}</span>
                      <button onClick={() => setGoals(p => p.filter((_, j) => j !== i))}>
                        <X size={10} className="text-brand-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {aiSuggestions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] text-violet-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={9} /> KI-Vorschläge (antippen zum Hinzufügen)
                  </p>
                  {aiSuggestions.map((s, i) => (
                    <button key={i} onClick={() => addAiGoal(s)}
                      className="w-full text-left flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 hover:bg-violet-100 transition-colors">
                      <Plus size={11} className="text-violet-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-violet-800">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label">Review-Datum</label>
              <input type="date" className="input-field" value={reviewDate} onChange={e => setReviewDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Notizen</label>
              <textarea className="input-field resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!childId || !title.trim() || goals.length === 0 || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Förderplan speichern</>}
            </button>
          </div>
        )}
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="card p-8 text-center">
          <Target size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Förderpläne angelegt</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className={`card overflow-hidden ${!p.is_active ? 'opacity-60' : ''}`}>
              <button className="w-full flex items-center gap-3 p-3 text-left"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-400">
                    {p.children?.first_name} {p.children?.last_name}
                    {' · '}ab {format(parseISO(p.start_date), 'd. MMM yyyy', { locale: de })}
                  </p>
                </div>
                <ChevronRight size={14} className={`text-gray-400 transition-transform ${expandedId === p.id ? 'rotate-90' : ''}`} />
              </button>
              {expandedId === p.id && (
                <div className="px-3 pb-3 border-t border-gray-50 pt-2 space-y-2">
                  <div className="space-y-1">
                    {p.goals.map((g, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Target size={11} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700">{g}</p>
                      </div>
                    ))}
                  </div>
                  {p.notes && <p className="text-xs text-gray-500 italic">{p.notes}</p>}
                  <button onClick={() => toggleActive(p.id, p.is_active)}
                    className={`text-xs font-medium px-2 py-1 rounded-lg ${p.is_active ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                    {p.is_active ? 'Als abgeschlossen markieren' : 'Wieder aktivieren'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
