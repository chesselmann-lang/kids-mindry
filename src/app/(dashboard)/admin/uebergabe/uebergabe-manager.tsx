'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, ChevronRight, ArrowLeftRight, Sparkles, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Handover {
  id: string
  group_id: string | null
  handover_date: string
  shift: string
  notes: string
  incidents: string | null
  author_id: string
  profiles?: { full_name: string }
  groups?: { name: string }
}

interface Group { id: string; name: string }

interface Props {
  handovers: Handover[]
  groups: Group[]
  userId: string
  siteId: string
  today: string
}

const SHIFTS = [
  { value: 'morning', label: 'Frühdienst' },
  { value: 'midday', label: 'Mittag' },
  { value: 'afternoon', label: 'Spätdienst' },
]

const SHIFT_COLORS: Record<string, string> = {
  morning: 'bg-yellow-100 text-yellow-700',
  midday: 'bg-blue-100 text-blue-700',
  afternoon: 'bg-orange-100 text-orange-700',
}

export default function UebergabeManager({ handovers: initial, groups, userId, siteId, today }: Props) {
  const [handovers, setHandovers] = useState<Handover[]>(initial)
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '')
  const [date, setDate] = useState(today)
  const [shift, setShift] = useState('morning')
  const [notes, setNotes] = useState('')
  const [incidents, setIncidents] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  async function generateAiHandover() {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/uebergabe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift, groupId: groupId || null }),
      })
      const data = await res.json()
      if (data.text) setNotes(data.text)
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  async function handleSave() {
    if (!notes.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('group_handovers').insert({
      site_id: siteId,
      author_id: userId,
      group_id: groupId || null,
      handover_date: date,
      shift,
      notes: notes.trim(),
      incidents: incidents.trim() || null,
    }).select('*, profiles:author_id(full_name), groups:group_id(name)').single()

    setSaving(false)
    if (data) {
      setHandovers(prev => [data as Handover, ...prev])
      setNotes('')
      setIncidents('')
      setOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Plus size={16} className="text-amber-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Übergabe eintragen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Datum</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Dienst</label>
                <select className="input-field" value={shift} onChange={e => setShift(e.target.value)}>
                  {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {groups.length > 0 && (
              <div>
                <label className="label">Gruppe</label>
                <select className="input-field" value={groupId} onChange={e => setGroupId(e.target.value)}>
                  <option value="">Alle Gruppen</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Übergabenotizen *</label>
                <button
                  onClick={generateAiHandover}
                  disabled={aiLoading}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors disabled:opacity-40"
                >
                  {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  KI-Vorschlag
                </button>
              </div>
              <textarea className="input-field resize-none" rows={4}
                placeholder="Was ist heute passiert? Besonderheiten, offene Aufgaben…"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div>
              <label className="label">Vorfälle (optional)</label>
              <textarea className="input-field resize-none" rows={2}
                placeholder="Unfälle, Krankmeldungen, besondere Ereignisse…"
                value={incidents} onChange={e => setIncidents(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!notes.trim() || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Übergabe protokollieren'}
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {handovers.length === 0 ? (
        <div className="card p-8 text-center">
          <ArrowLeftRight size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Übergaben protokolliert</p>
        </div>
      ) : (
        <div className="space-y-2">
          {handovers.map(h => (
            <div key={h.id} className="card overflow-hidden">
              <button
                className="w-full p-3 flex items-center gap-3 text-left"
                onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SHIFT_COLORS[h.shift] ?? 'bg-gray-100 text-gray-600'}`}>
                      {SHIFTS.find(s => s.value === h.shift)?.label ?? h.shift}
                    </span>
                    {h.groups?.name && (
                      <span className="text-[10px] text-gray-400">{h.groups.name}</span>
                    )}
                    {h.incidents && (
                      <span className="text-[10px] font-semibold text-red-500">⚠ Vorfall</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 truncate">{h.notes.slice(0, 60)}{h.notes.length > 60 ? '…' : ''}</p>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <p className="text-[10px] text-gray-400">
                        {format(parseISO(h.handover_date), 'd. MMM', { locale: de })} · {h.profiles?.full_name?.split(' ')[0]}
                      </p>
                      <ChevronRight size={14} className={`text-gray-300 transition-transform ${expandedId === h.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
              </button>
              {expandedId === h.id && (
                <div className="px-3 pb-3 border-t border-gray-50 pt-2 space-y-2">
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{h.notes}</p>
                  {h.incidents && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-xs font-semibold text-red-600 mb-0.5">Vorfälle</p>
                      <p className="text-xs text-red-700 whitespace-pre-wrap">{h.incidents}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400">von {h.profiles?.full_name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
