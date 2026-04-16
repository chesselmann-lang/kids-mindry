'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, BarChart2, Users, Check, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Survey {
  id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
  survey_responses: { id: string }[]
}

interface Props {
  surveys: Survey[]
  siteId: string
}

export default function BefragungManager({ surveys: initial, siteId }: Props) {
  const [surveys, setSurveys] = useState<Survey[]>(initial)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function createSurvey() {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('surveys').insert({
      site_id: siteId,
      title: title.trim(),
      description: description.trim() || null,
      is_active: true,
    }).select('*, survey_responses(id)').single()
    setSaving(false)
    if (data) {
      setSurveys(prev => [data as Survey, ...prev])
      setTitle('')
      setDescription('')
      setOpen(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('surveys').update({ is_active: !current }).eq('id', id)
    setSurveys(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const activeSurveys = surveys.filter(s => s.is_active)
  const closedSurveys = surveys.filter(s => !s.is_active)

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Plus size={16} className="text-violet-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Umfrage erstellen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div>
              <label className="label">Titel *</label>
              <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="z.B. Zufriedenheitsbefragung 2025" />
            </div>
            <div>
              <label className="label">Beschreibung</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Kurze Beschreibung der Umfrage für die Eltern…"
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <button onClick={createSurvey} disabled={!title.trim() || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Erstellen…' : 'Umfrage erstellen'}
            </button>
          </div>
        )}
      </div>

      {/* Active surveys */}
      {activeSurveys.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Aktiv</p>
          <div className="space-y-2">
            {activeSurveys.map(s => (
              <SurveyCard key={s.id} survey={s} onToggle={toggleActive} />
            ))}
          </div>
        </div>
      )}

      {/* Closed surveys */}
      {closedSurveys.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Abgeschlossen</p>
          <div className="space-y-2">
            {closedSurveys.map(s => (
              <SurveyCard key={s.id} survey={s} onToggle={toggleActive} />
            ))}
          </div>
        </div>
      )}

      {surveys.length === 0 && (
        <div className="card p-8 text-center">
          <BarChart2 size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Umfragen erstellt</p>
        </div>
      )}
    </div>
  )
}

function SurveyCard({ survey: s, onToggle }: { survey: Survey; onToggle: (id: string, current: boolean) => void }) {
  const responseCount = s.survey_responses?.length ?? 0
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
          {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={11} /> {responseCount} Antworten
            </span>
            <span className="text-xs text-gray-300">
              {format(parseISO(s.created_at), 'd. MMM yyyy', { locale: de })}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggle(s.id, s.is_active)}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            s.is_active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {s.is_active ? <><X size={12} /> Schließen</> : <><Check size={12} /> Öffnen</>}
        </button>
      </div>

      {/* Survey link for active */}
      {s.is_active && (
        <div className="mt-3 p-2 bg-violet-50 rounded-lg">
          <p className="text-[10px] text-violet-600 font-semibold mb-1">Link für Eltern</p>
          <p className="text-[10px] text-violet-500 break-all font-mono">
            {typeof window !== 'undefined' ? window.location.origin : ''}/befragung/{s.id}
          </p>
        </div>
      )}
    </div>
  )
}
