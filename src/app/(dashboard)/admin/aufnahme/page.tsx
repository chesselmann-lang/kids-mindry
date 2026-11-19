'use client'

import { useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Star } from 'lucide-react'

// ── Aufnahme — Mindry Kids Admin ──────────────────────────────────────────────
// Anmeldungen · Aufnahmeprozess · Warteliste · Platzvergabe

type AufnahmeStatus = 'warteliste' | 'angemeldet' | 'aufgenommen' | 'abgesagt' | 'probe'
type Betreuungsart = 'ganztag' | 'halbtag' | 'krippe'

interface AufnahmeKind {
  id: string
  name: string
  geburtsdatum: string
  betreuungsart: Betreuungsart
  wunschstart: string
  status: AufnahmeStatus
  geschwister: boolean
  elternname: string
  telefon: string
  prioritaet: number
  notiz?: string
  unterlagen: { bezeichnung: string; eingegangen: boolean }[]
}

const STATUS_CFG: Record<AufnahmeStatus, { label: string; farbe: string; dot: string }> = {
  warteliste:  { label: 'Warteliste',   farbe: 'text-gray-500',   dot: 'bg-gray-400' },
  angemeldet:  { label: 'Angemeldet',  farbe: 'text-blue-600',   dot: 'bg-blue-400' },
  aufgenommen: { label: 'Aufgenommen', farbe: 'text-green-600',  dot: 'bg-green-400' },
  abgesagt:    { label: 'Abgesagt',    farbe: 'text-red-500',    dot: 'bg-red-400' },
  probe:       { label: 'Probetag',    farbe: 'text-orange-500', dot: 'bg-orange-400' },
}

const BETREUUNG_CFG: Record<Betreuungsart, { label: string; emoji: string }> = {
  ganztag: { label: 'Ganztag',  emoji: '🌅' },
  halbtag: { label: 'Halbtag',  emoji: '🌤️' },
  krippe:  { label: 'Krippe',   emoji: '🍼' },
}

const KINDER: AufnahmeKind[] = [
  {
    id: 'a1', name: 'Sophia R.', geburtsdatum: '15.08.2022', wunschstart: 'Sept. 2026',
    betreuungsart: 'ganztag', status: 'aufgenommen', geschwister: true, prioritaet: 1,
    elternname: 'Renate R.', telefon: '0176-1234567',
    unterlagen: [
      { bezeichnung: 'Anmeldeformular', eingegangen: true },
      { bezeichnung: 'Impfausweis', eingegangen: true },
      { bezeichnung: 'Sorgerechtsnachweis', eingegangen: true },
      { bezeichnung: 'SEPA-Mandat', eingegangen: false },
    ],
    notiz: 'Geschwisterkind von Tom R. (Gruppe Schmetterlinge)',
  },
  {
    id: 'a2', name: 'Ben H.', geburtsdatum: '02.02.2023', wunschstart: 'Sept. 2026',
    betreuungsart: 'krippe', status: 'probe', geschwister: false, prioritaet: 2,
    elternname: 'Markus H.', telefon: '0171-9876543',
    unterlagen: [
      { bezeichnung: 'Anmeldeformular', eingegangen: true },
      { bezeichnung: 'Impfausweis', eingegangen: false },
      { bezeichnung: 'Sorgerechtsnachweis', eingegangen: false },
      { bezeichnung: 'SEPA-Mandat', eingegangen: false },
    ],
    notiz: 'Probetag 29.04. — Eingewöhnung ab Sept.',
  },
  {
    id: 'a3', name: 'Lina K.', geburtsdatum: '30.04.2021', wunschstart: 'Aug. 2026',
    betreuungsart: 'halbtag', status: 'angemeldet', geschwister: false, prioritaet: 3,
    elternname: 'Julia K.', telefon: '0151-4444111',
    unterlagen: [
      { bezeichnung: 'Anmeldeformular', eingegangen: true },
      { bezeichnung: 'Impfausweis', eingegangen: true },
      { bezeichnung: 'Sorgerechtsnachweis', eingegangen: false },
      { bezeichnung: 'SEPA-Mandat', eingegangen: false },
    ],
  },
  {
    id: 'a4', name: 'Max T.', geburtsdatum: '11.11.2021', wunschstart: 'Jan. 2027',
    betreuungsart: 'ganztag', status: 'warteliste', geschwister: false, prioritaet: 5,
    elternname: 'Peter T.', telefon: '0162-7654321',
    unterlagen: [
      { bezeichnung: 'Anmeldeformular', eingegangen: true },
    ],
  },
]

export default function AufnahmePage() {
  const [expanded, setExpanded] = useState<string | null>('a1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aufgenommen = KINDER.filter(k => k.status === 'aufgenommen').length
  const warteliste = KINDER.filter(k => k.status === 'warteliste').length
  const offeneUnterlagen = KINDER.filter(k =>
    k.status !== 'abgesagt' && k.unterlagen.some(u => !u.eingegangen)
  ).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${KINDER.length} Anmeldungen: ${aufgenommen} aufgenommen, ${warteliste} auf Warteliste. ${offeneUnterlagen} Kinder haben noch fehlende Unterlagen. Ben H. Probetag 29.04. — Impfausweis fehlt noch!`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-teal-500" /> Aufnahme & Anmeldungen
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Aufnahmeprozess · Warteliste · Unterlagen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Anmeldungen',  val: KINDER.length, color: 'text-teal-700' },
          { label: 'Aufgenommen',  val: aufgenommen,   color: 'text-green-600' },
          { label: 'Warteliste',   val: warteliste,    color: 'text-gray-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {offeneUnterlagen > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 font-semibold">{offeneUnterlagen} Kinder haben noch fehlende Unterlagen.</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Aufnahmeübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Aufnahmeübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {KINDER.map(k => {
          const isOpen = expanded === k.id
          const stCfg = STATUS_CFG[k.status]
          const bCfg = BETREUUNG_CFG[k.betreuungsart]
          const fehlend = k.unterlagen.filter(u => !u.eingegangen).length
          return (
            <div key={k.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 text-lg">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${stCfg.farbe}`}>{stCfg.label}</span>
                    <span className="text-[8px] text-teal-400">{bCfg.label}</span>
                    {k.geschwister && <span className="text-[8px] text-purple-500 font-semibold">Geschwister</span>}
                    {fehlend > 0 && <span className="text-[8px] text-orange-500 font-semibold">⚠️ {fehlend} fehlen</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{k.name} · geb. {k.geburtsdatum}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />Start: {k.wunschstart} · {k.elternname}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-500">📞 {k.elternname} · {k.telefon}</p>

                  <div>
                    <p className="text-[9px] font-bold text-teal-500 uppercase tracking-wide mb-1">Unterlagen</p>
                    {k.unterlagen.map((u, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${u.eingegangen ? 'text-green-500' : 'text-gray-300'}`} />
                        <p className={`text-[9px] ${u.eingegangen ? 'text-teal-700' : 'text-orange-600 font-semibold'}`}>{u.bezeichnung}</p>
                        {!u.eingegangen && <span className="text-[8px] text-orange-400">fehlt</span>}
                      </div>
                    ))}
                  </div>

                  {k.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{k.notiz}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
