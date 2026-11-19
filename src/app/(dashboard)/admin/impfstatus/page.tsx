'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, Clock, AlertTriangle, Users, Star } from 'lucide-react'

// ── Impfstatus — Mindry Kids Admin ────────────────────────────────────────────
// Impfübersicht · Masernschutz § 20 IfSG · Dokumentation · KI-Analyse

type ImpfStatus = 'vollstaendig' | 'teilweise' | 'fehlend' | 'unbekannt' | 'kontraindikation'

interface Impfung {
  bezeichnung: string
  datum?: string
  vorhanden: boolean
}

interface Kind {
  name: string
  gruppe: string
  geburtsjahr: number
  status: ImpfStatus
  impfungen: Impfung[]
  elternKontaktiert: boolean
  notiz?: string
}

const STATUS_CFG: Record<ImpfStatus, { label: string; farbe: string; bg: string }> = {
  vollstaendig:    { label: 'Vollständig',    farbe: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  teilweise:       { label: 'Teilweise',      farbe: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  fehlend:         { label: 'Fehlend',        farbe: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  unbekannt:       { label: 'Unbekannt',      farbe: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200' },
  kontraindikation:{ label: 'Kontrain.',      farbe: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
}

const INIT_KINDER: Kind[] = [
  {
    name: 'Emma B.', gruppe: 'Igel', geburtsjahr: 2021, status: 'vollstaendig',
    elternKontaktiert: false,
    impfungen: [
      { bezeichnung: 'Masern (Erstimpfung)', datum: '15.04.2022', vorhanden: true },
      { bezeichnung: 'Masern (Zweitimpfung)', datum: '10.10.2022', vorhanden: true },
      { bezeichnung: 'MMR', datum: '10.10.2022', vorhanden: true },
    ],
  },
  {
    name: 'Lena K.', gruppe: 'Bären', geburtsjahr: 2021, status: 'fehlend',
    elternKontaktiert: true,
    impfungen: [
      { bezeichnung: 'Masern (Erstimpfung)', vorhanden: false },
      { bezeichnung: 'Masern (Zweitimpfung)', vorhanden: false },
    ],
    notiz: 'Eltern wurden angeschrieben — Frist bis 15.05.2026',
  },
  {
    name: 'Max F.', gruppe: 'Igel', geburtsjahr: 2020, status: 'teilweise',
    elternKontaktiert: true,
    impfungen: [
      { bezeichnung: 'Masern (Erstimpfung)', datum: '20.06.2021', vorhanden: true },
      { bezeichnung: 'Masern (Zweitimpfung)', vorhanden: false },
    ],
    notiz: 'Termin für Zweitimpfung noch nicht bekannt',
  },
  {
    name: 'Noah P.', gruppe: 'Füchse', geburtsjahr: 2021, status: 'vollstaendig',
    elternKontaktiert: false,
    impfungen: [
      { bezeichnung: 'Masern (Erstimpfung)', datum: '05.03.2022', vorhanden: true },
      { bezeichnung: 'Masern (Zweitimpfung)', datum: '14.09.2022', vorhanden: true },
    ],
  },
  {
    name: 'Anna S.', gruppe: 'Bären', geburtsjahr: 2021, status: 'kontraindikation',
    elternKontaktiert: true,
    impfungen: [
      { bezeichnung: 'Masern', vorhanden: false },
    ],
    notiz: 'Ärztliche Kontraindikation liegt vor (Doc. vorhanden)',
  },
]

export default function ImpfstatusPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const vollstaendig = INIT_KINDER.filter(k => k.status === 'vollstaendig').length
  const handlungsbedarf = INIT_KINDER.filter(k => k.status === 'fehlend' || k.status === 'teilweise').length

  const gefiltert = INIT_KINDER.filter(k =>
    filterStatus === 'alle' || k.status === filterStatus
  )

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${INIT_KINDER.length} Kinder erfasst: ${vollstaendig} vollständig geimpft, ${handlungsbedarf} mit Handlungsbedarf. Masernschutzgesetz §20 IfSG: Fehlende Nachweise bis 15.05. einfordern. Lena K. und Max F. priorisieren.`)
      setKiLaedt(false)
    }, 950)
  }

  const statusTypen = ['alle', 'vollstaendig', 'teilweise', 'fehlend', 'unbekannt'] as const

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-teal-500" /> Impfstatus
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Masernschutz §20 IfSG · Dokumentation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kinder',        val: INIT_KINDER.length, color: 'text-teal-700' },
          { label: 'Vollständig',   val: vollstaendig, color: 'text-green-600' },
          { label: 'Handlungsbedarf', val: handlungsbedarf, color: handlungsbedarf > 0 ? 'text-red-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {handlungsbedarf > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">{handlungsbedarf} Kinder ohne vollständigen Impfnachweis — §20 IfSG beachten!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Impfüberblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Impfüberblick'}
        </button>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {statusTypen.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterStatus === s ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
            {s === 'alle' ? 'Alle' : STATUS_CFG[s as ImpfStatus]?.label ?? s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map((k, idx) => {
          const id = `imp-${idx}`
          const isOpen = expanded === id
          const stCfg = STATUS_CFG[k.status]
          const vorhanden = k.impfungen.filter(i => i.vorhanden).length
          return (
            <div key={idx} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${stCfg.bg}`}>
                  <CheckCircle2 className={`w-4 h-4 ${stCfg.farbe}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-900">{k.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                    <span className="text-teal-400"><Users className="w-2.5 h-2.5 inline mr-0.5" />{k.gruppe} · *{k.geburtsjahr}</span>
                    <span className={`font-semibold ${stCfg.farbe}`}>{stCfg.label}</span>
                    {k.elternKontaktiert && <span className="text-blue-400">✉ Eltern informiert</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-teal-100">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${Math.round(vorhanden / k.impfungen.length * 100)}%` }} />
                    </div>
                    <span className="text-[9px] text-teal-400">{vorhanden}/{k.impfungen.length}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  {k.impfungen.map((imp, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${imp.vorhanden ? 'text-teal-500' : 'opacity-20 text-gray-400'}`} />
                        <p className={`text-[10px] ${imp.vorhanden ? 'text-teal-900' : 'text-red-600 font-semibold'}`}>{imp.bezeichnung}</p>
                      </div>
                      <span className="text-[9px] text-teal-400">{imp.datum ?? (imp.vorhanden ? '' : 'Ausstehend')}</span>
                    </div>
                  ))}
                  {k.notiz && (
                    <div className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-2 py-1.5">
                      <Star className="w-2.5 h-2.5 inline mr-1" />{k.notiz}
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
