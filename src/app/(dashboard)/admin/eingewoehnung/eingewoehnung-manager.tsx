'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, ChevronRight, Baby, CheckCircle2 } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'
import AiEingewoehnungTipps from './ai-eingewoehnung-tipps'

interface Process {
  id: string
  child_id: string
  start_date: string
  phase: number
  status: string
  notes: string | null
  children?: { first_name: string; last_name: string }
}

interface Child { id: string; first_name: string; last_name: string }

const PHASES = [
  { num: 1, label: 'Grundphase', desc: 'Kind & Elternteil gemeinsam (Tag 1-3)', days: 3 },
  { num: 2, label: 'Erweiterungsphase', desc: 'Erste Trennungsversuche (Tag 4-6)', days: 3 },
  { num: 3, label: 'Stabilisierungsphase', desc: 'Längere Trennungen (Woche 2-3)', days: 10 },
  { num: 4, label: 'Schlussphase', desc: 'Volle Integration (Woche 4)', days: 7 },
  { num: 5, label: 'Abgeschlossen', desc: 'Eingewöhnung erfolgreich', days: 0 },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
}

interface Props {
  processes: Process[]
  children: Child[]
  siteId: string
}

export default function EingewoehnungManager({ processes: initial, children, siteId }: Props) {
  const [processes, setProcesses] = useState<Process[]>(initial)
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [childId, setChildId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  async function startProcess() {
    if (!childId) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('eingewoehnung_processes').insert({
      site_id: siteId,
      child_id: childId,
      start_date: startDate,
      phase: 1,
      status: 'active',
    }).select('*, children:child_id(first_name, last_name)').single()
    setSaving(false)
    if (data) {
      setProcesses(prev => [data as Process, ...prev])
      setChildId('')
      setOpen(false)
    }
  }

  async function advancePhase(id: string, currentPhase: number) {
    const nextPhase = Math.min(currentPhase + 1, 5)
    const supabase = createClient()
    const update: any = { phase: nextPhase }
    if (nextPhase === 5) update.status = 'completed'
    await supabase.from('eingewoehnung_processes').update(update).eq('id', id)
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...update } : p))
  }

  const activeProcesses = processes.filter(p => p.status === 'active')
  const doneProcesses = processes.filter(p => p.status !== 'active')

  return (
    <div className="space-y-4">
      {/* Start new */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
              <Plus size={16} className="text-pink-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Eingewöhnung starten</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div>
              <label className="label">Kind *</label>
              <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
                <option value="">– Kind auswählen –</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Startdatum</label>
              <input type="date" className="input-field" value={startDate}
                onChange={e => setStartDate(e.target.value)} />
            </div>
            <button onClick={startProcess} disabled={!childId || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Starten…' : 'Eingewöhnung beginnen'}
            </button>
          </div>
        )}
      </div>

      {/* Active processes */}
      {activeProcesses.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Aktive Eingewöhnungen</p>
          <div className="space-y-3">
            {activeProcesses.map(p => {
              const phaseCfg = PHASES[p.phase - 1]
              const daysSince = differenceInDays(new Date(), parseISO(p.start_date))
              return (
                <div key={p.id} className="card overflow-hidden">
                  <button
                    className="w-full p-3 flex items-center gap-3 text-left"
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <Baby size={15} className="text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {p.children?.first_name} {p.children?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{phaseCfg?.label} · Tag {daysSince + 1}</p>
                    </div>
                    <ChevronRight size={14} className={`text-gray-300 transition-transform ${expandedId === p.id ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedId === p.id && (
                    <div className="px-3 pb-3 border-t border-gray-50 pt-2 space-y-3">
                      {/* Phase progress */}
                      <div className="space-y-1.5">
                        {PHASES.map(phase => (
                          <div key={phase.num} className={`flex items-center gap-2 p-2 rounded-lg ${
                            p.phase === phase.num ? 'bg-pink-50 border border-pink-200' :
                            p.phase > phase.num ? 'opacity-50' : ''
                          }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              p.phase > phase.num ? 'bg-green-500' :
                              p.phase === phase.num ? 'bg-pink-500' : 'bg-gray-200'
                            }`}>
                              {p.phase > phase.num
                                ? <CheckCircle2 size={12} className="text-white" />
                                : <span className="text-[9px] font-bold text-white">{phase.num}</span>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800">{phase.label}</p>
                              <p className="text-[10px] text-gray-400">{phase.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {p.phase < 5 && (
                        <button
                          onClick={() => advancePhase(p.id, p.phase)}
                          className="btn-primary w-full py-2 text-xs"
                        >
                          Weiter zu Phase {p.phase + 1}
                        </button>
                      )}
                      {p.phase < 5 && (
                        <AiEingewoehnungTipps
                          processId={p.id}
                          childName={p.children?.first_name ?? 'Kind'}
                          phase={p.phase}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {doneProcesses.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Abgeschlossen</p>
          <div className="space-y-2">
            {doneProcesses.map(p => (
              <div key={p.id} className="card p-3 flex items-center gap-3 opacity-70">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                <p className="text-sm text-gray-700">{p.children?.first_name} {p.children?.last_name}</p>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {format(parseISO(p.start_date), 'd. MMM yyyy', { locale: de })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {processes.length === 0 && (
        <div className="card p-8 text-center">
          <Baby size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine laufenden Eingewöhnungen</p>
        </div>
      )}
    </div>
  )
}
