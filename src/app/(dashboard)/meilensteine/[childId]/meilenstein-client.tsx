'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Star, ChevronDown, ChevronUp, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { format, parseISO, differenceInMonths } from 'date-fns'
import { de } from 'date-fns/locale'

interface Milestone {
  id: string
  child_id: string
  category: string
  title: string
  achieved_date: string
  notes: string | null
}

const CATEGORIES = [
  { value: 'motor', label: 'Motorik', emoji: '🏃', color: 'bg-blue-100 text-blue-700' },
  { value: 'language', label: 'Sprache', emoji: '💬', color: 'bg-green-100 text-green-700' },
  { value: 'social', label: 'Soziales', emoji: '🤝', color: 'bg-purple-100 text-purple-700' },
  { value: 'cognitive', label: 'Kognition', emoji: '🧠', color: 'bg-amber-100 text-amber-700' },
  { value: 'emotional', label: 'Emotional', emoji: '❤️', color: 'bg-rose-100 text-rose-700' },
  { value: 'creative', label: 'Kreativität', emoji: '🎨', color: 'bg-teal-100 text-teal-700' },
  { value: 'other', label: 'Sonstiges', emoji: '⭐', color: 'bg-gray-100 text-gray-600' },
]

const MILESTONE_TEMPLATES: Record<string, string[]> = {
  motor: ['Läuft alleine', 'Treppensteigen', 'Malt Kreise', 'Hält Stift richtig', 'Springt auf einem Bein'],
  language: ['Erste Worte', 'Zweiwortsätze', 'Singt Lieder nach', 'Erzählt Erlebnisse', 'Stellt Warum-Fragen'],
  social: ['Spielt mit anderen Kindern', 'Teilt Spielzeug', 'Zeigt Empathie', 'Hält Regeln ein'],
  cognitive: ['Puzzelt 12 Teile', 'Kennt Farben', 'Zählt bis 5', 'Sortiert nach Formen'],
  emotional: ['Drückt Gefühle aus', 'Beruhigt sich selbst', 'Zeigt Stolz'],
  creative: ['Malt Gesichter', 'Erfindet Geschichten', 'Singt spontan'],
  other: [],
}

interface Props {
  milestones: Milestone[]
  childId: string
  isStaff: boolean
  dateOfBirth: string | null
}

export default function MeilensteinClient({ milestones: initial, childId, isStaff, dateOfBirth }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>(initial)
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('motor')
  const [title, setTitle] = useState('')
  const [achievedDate, setAchievedDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiVorschlaege, setAiVorschlaege] = useState<{ title: string; category: string; rationale: string }[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  async function loadAiVorschlaege() {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/meilenstein-vorschlaege', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (data.vorschlaege?.length > 0) {
        setAiVorschlaege(data.vorschlaege)
        setAiOpen(true)
      }
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  function applyVorschlag(v: { title: string; category: string }) {
    setCategory(v.category)
    setTitle(v.title)
    setOpen(true)
    // Remove from suggestions list
    setAiVorschlaege(prev => prev.filter(p => p.title !== v.title))
  }

  async function saveMilestone() {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('milestones').insert({
      child_id: childId,
      category,
      title: title.trim(),
      achieved_date: achievedDate,
      notes: notes.trim() || null,
    }).select().single()
    setSaving(false)
    if (data) {
      setMilestones(prev => [...prev, data as Milestone].sort((a, b) => a.achieved_date.localeCompare(b.achieved_date)))
      setTitle('')
      setNotes('')
      setOpen(false)
    }
  }

  async function deleteMilestone(id: string) {
    const supabase = createClient()
    await supabase.from('milestones').delete().eq('id', id)
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  function ageAtDate(achievedDate: string): string {
    if (!dateOfBirth) return ''
    const months = differenceInMonths(parseISO(achievedDate), parseISO(dateOfBirth))
    const y = Math.floor(months / 12)
    const m = months % 12
    if (y === 0) return `${m} Monate`
    if (m === 0) return `${y} Jahr${y > 1 ? 'e' : ''}`
    return `${y}J ${m}M`
  }

  // Group by category
  const byCat = CATEGORIES.map(cat => ({
    ...cat,
    items: milestones.filter(m => m.category === cat.value),
  })).filter(cat => cat.items.length > 0)

  const templates = MILESTONE_TEMPLATES[category] ?? []

  return (
    <div className="space-y-4">
      {isStaff && (
        <div className="card overflow-hidden">
          <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Plus size={16} className="text-yellow-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Meilenstein eintragen</span>
            </div>
            {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {open && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
              <div>
                <label className="label">Bereich</label>
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => { setCategory(cat.value); setTitle('') }}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        category === cat.value ? cat.color : 'bg-gray-100 text-gray-600'
                      }`}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              {templates.length > 0 && (
                <div>
                  <label className="label">Vorlagen</label>
                  <div className="flex flex-wrap gap-1.5">
                    {templates.map(t => (
                      <button key={t} onClick={() => setTitle(t)}
                        className="px-2 py-1 text-[10px] bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="label">Meilenstein *</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Was hat das Kind erreicht?" />
              </div>
              <div>
                <label className="label">Datum</label>
                <input type="date" className="input-field" value={achievedDate}
                  onChange={e => setAchievedDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Notiz</label>
                <textarea className="input-field resize-none" rows={2} value={notes}
                  onChange={e => setNotes(e.target.value)} />
              </div>
              <button onClick={saveMilestone} disabled={!title.trim() || saving}
                className="btn-primary w-full py-2.5 disabled:opacity-50">
                {saving ? 'Speichern…' : '⭐ Meilenstein eintragen'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-yellow-500">{milestones.length}</p>
          <p className="text-xs text-gray-500">Meilensteine</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-brand-500">{byCat.length}</p>
          <p className="text-xs text-gray-500">Bereiche</p>
        </div>
      </div>

      {/* AI Vorschläge */}
      {isStaff && (
        <div className="card overflow-hidden">
          <button
            onClick={() => aiVorschlaege.length > 0 ? setAiOpen(v => !v) : loadAiVorschlaege()}
            className="w-full flex items-center justify-between p-4"
            disabled={aiLoading}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                {aiLoading ? <Loader2 size={16} className="text-violet-600 animate-spin" /> : <Sparkles size={16} className="text-violet-600" />}
              </div>
              <span className="font-semibold text-sm text-gray-900">
                {aiLoading ? 'KI analysiert…' : 'KI-Vorschläge'}
              </span>
              {aiVorschlaege.length > 0 && (
                <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                  {aiVorschlaege.length}
                </span>
              )}
            </div>
            {aiVorschlaege.length > 0 && (
              aiOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>
          {aiOpen && aiVorschlaege.length > 0 && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
              <p className="text-[10px] text-gray-400 mb-2">Altersgemäße Vorschläge – tippe zum Übernehmen</p>
              {aiVorschlaege.map((v, i) => {
                const cat = CATEGORIES.find(c => c.value === v.category)
                return (
                  <button key={i} onClick={() => applyVorschlag(v)}
                    className="w-full text-left flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 hover:bg-violet-100 transition-colors">
                    <span className="text-sm flex-shrink-0 mt-0.5">{cat?.emoji ?? '⭐'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{v.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{v.rationale}</p>
                    </div>
                    <Plus size={13} className="text-violet-500 flex-shrink-0 mt-1" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* By category */}
      {byCat.length === 0 ? (
        <div className="card p-8 text-center">
          <Star size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Meilensteine eingetragen</p>
        </div>
      ) : (
        byCat.map(cat => (
          <div key={cat.value}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>{cat.emoji}</span> {cat.label}
            </p>
            <div className="space-y-2">
              {cat.items.map(m => (
                <div key={m.id} className="card p-3 flex items-start gap-2">
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${cat.color}`}>
                    {ageAtDate(m.achieved_date) || format(parseISO(m.achieved_date), 'd. MMM yy', { locale: de })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                    {m.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{m.notes}</p>}
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {format(parseISO(m.achieved_date), 'd. MMMM yyyy', { locale: de })}
                    </p>
                  </div>
                  {isStaff && (
                    <button onClick={() => deleteMilestone(m.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
