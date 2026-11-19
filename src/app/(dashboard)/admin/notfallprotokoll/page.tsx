'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Phone, Star, Users } from 'lucide-react'

// ── Notfallprotokoll — Mindry Kids Admin ──────────────────────────────────────
// Ersthelfer · Notfallkontakte · Ereignis-Dokumentation · Maßnahmen

type NotfallTyp = 'verletzung' | 'erkrankung' | 'allergie' | 'unfall' | 'sonstiges'
type MassnahmeStatus = 'erledigt' | 'offen' | 'weitergeleitet'

interface Massnahme {
  text: string
  status: MassnahmeStatus
}

interface Notfallprotokoll {
  id: string
  datum: string
  uhrzeit: string
  kind: string
  gruppe: string
  typ: NotfallTyp
  beschreibung: string
  ersthelfer: string
  massnahmen: Massnahme[]
  elternInformiert: boolean
  arztBenoetigt: boolean
  notiz?: string
}

const TYP_CFG: Record<NotfallTyp, { label: string; farbe: string }> = {
  verletzung: { label: 'Verletzung', farbe: 'bg-red-50 text-red-700 border-red-200' },
  erkrankung: { label: 'Erkrankung', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  allergie:   { label: 'Allergie',   farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  unfall:     { label: 'Unfall',     farbe: 'bg-red-50 text-red-800 border-red-300' },
  sonstiges:  { label: 'Sonstiges',  farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const ERSTHELFER = [
  { name: 'Fr. Schmidt', raum: 'R101', telefon: '0178 111 22 33' },
  { name: 'Hr. Weber',   raum: 'R204', telefon: '0178 444 55 66' },
  { name: 'Fr. Braun',   raum: 'Büro', telefon: '0178 777 88 99' },
]

const INIT_PROTOKOLLE: Notfallprotokoll[] = [
  {
    id: 'nf1', datum: '24.04.2026', uhrzeit: '09:15', kind: 'Lena K.', gruppe: 'Igel',
    typ: 'verletzung', ersthelfer: 'Fr. Schmidt',
    beschreibung: 'Kind ist auf dem Außengelände gestürzt und hat sich das Knie aufgeschürft.',
    massnahmen: [
      { text: 'Wunde gereinigt und desinfiziert', status: 'erledigt' },
      { text: 'Pflaster angelegt', status: 'erledigt' },
      { text: 'Eltern telefonisch informiert', status: 'erledigt' },
    ],
    elternInformiert: true, arztBenoetigt: false,
    notiz: 'Kind war schnell beruhigt, weiter beobachten',
  },
  {
    id: 'nf2', datum: '23.04.2026', uhrzeit: '11:30', kind: 'Max F.', gruppe: 'Bären',
    typ: 'allergie', ersthelfer: 'Fr. Braun',
    beschreibung: 'Allergische Reaktion nach Mittagessen — Ausschlag am Arm sichtbar.',
    massnahmen: [
      { text: 'Antihistaminikum lt. Elternverfügung verabreicht', status: 'erledigt' },
      { text: 'Eltern sofort informiert', status: 'erledigt' },
      { text: 'Kinderarzt aufgesucht', status: 'weitergeleitet' },
    ],
    elternInformiert: true, arztBenoetigt: true,
    notiz: 'Allergenliste bitte aktualisieren',
  },
  {
    id: 'nf3', datum: '22.04.2026', uhrzeit: '14:05', kind: 'Anna S.', gruppe: 'Füchse',
    typ: 'erkrankung', ersthelfer: 'Hr. Weber',
    beschreibung: 'Kind klagte über Kopfschmerzen und erhöhte Temperatur (38,2°C gemessen).',
    massnahmen: [
      { text: 'Temperatur gemessen und dokumentiert', status: 'erledigt' },
      { text: 'Kind in ruhigen Bereich gebracht', status: 'erledigt' },
      { text: 'Eltern zur Abholung gebeten', status: 'erledigt' },
    ],
    elternInformiert: true, arztBenoetigt: false,
  },
]

function TypBadge({ typ }: { typ: NotfallTyp }) {
  const cfg = TYP_CFG[typ]
  return <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${cfg.farbe}`}>{cfg.label}</span>
}

function StatusDot({ status }: { status: MassnahmeStatus }) {
  const cfg = { erledigt: 'text-teal-500', offen: 'text-orange-400', weitergeleitet: 'text-blue-500' }
  return <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${cfg[status]}`} />
}

export default function NotfallprotokollPage() {
  const [expanded, setExpanded] = useState<string | null>('nf1')
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const arztFaelle = INIT_PROTOKOLLE.filter(p => p.arztBenoetigt).length
  const offeneMassnahmen = INIT_PROTOKOLLE.flatMap(p => p.massnahmen).filter(m => m.status === 'offen').length

  const gefiltert = INIT_PROTOKOLLE.filter(p =>
    filterTyp === 'alle' || p.typ === filterTyp
  )

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${INIT_PROTOKOLLE.length} Protokolle dieser Woche — ${arztFaelle} Arztbesuche, ${offeneMassnahmen} offene Maßnahmen. Häufigster Typ: Verletzungen (Außengelände). Empfehlung: Außengelände-Sicherheitscheck einplanen und Allergenliste von Max F. aktualisieren.`)
      setKiLaedt(false)
    }, 950)
  }

  const typen = ['verletzung', 'erkrankung', 'allergie', 'unfall', 'sonstiges'] as NotfallTyp[]

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-teal-500" /> Notfallprotokoll
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Ereignisse · Erstmaßnahmen · Dokumentation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Protokolle',  val: INIT_PROTOKOLLE.length, color: 'text-teal-700' },
          { label: 'Arzt benötigt', val: arztFaelle, color: arztFaelle > 0 ? 'text-red-600' : 'text-gray-400' },
          { label: 'Offen', val: offeneMassnahmen, color: offeneMassnahmen > 0 ? 'text-orange-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Notfallauswertung</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Notfallauswertung'}
        </button>
      )}

      {/* Ersthelfer */}
      <div className="rounded-2xl border border-teal-100 bg-white p-3 space-y-1.5">
        <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Ersthelfer im Dienst</p>
        {ERSTHELFER.map((e, i) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-teal-900">{e.name}</span>
            <span className="text-teal-500 flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{e.telefon}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilterTyp('alle')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === 'alle' ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
          Alle
        </button>
        {typen.map(t => (
          <button key={t} onClick={() => setFilterTyp(t)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
            {TYP_CFG[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(p => {
          const isOpen = expanded === p.id
          const erledigtCount = p.massnahmen.filter(m => m.status === 'erledigt').length
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.arztBenoetigt ? 'bg-red-100' : 'bg-teal-100'}`}>
                  <AlertTriangle className={`w-4 h-4 ${p.arztBenoetigt ? 'text-red-600' : 'text-teal-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{p.kind}</p>
                    <TypBadge typ={p.typ} />
                    {p.arztBenoetigt && <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold border border-red-200">Arzt</span>}
                  </div>
                  <p className="text-[9px] text-teal-500 mt-0.5"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{p.datum} · {p.uhrzeit} · Gruppe {p.gruppe}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-teal-100">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${Math.round(erledigtCount / p.massnahmen.length * 100)}%` }} />
                    </div>
                    <span className="text-[9px] text-teal-400">{erledigtCount}/{p.massnahmen.length} Maßn.</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[10px] text-teal-800 leading-relaxed">{p.beschreibung}</p>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-teal-500 tracking-wide">Maßnahmen</p>
                    {p.massnahmen.map((m, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <StatusDot status={m.status} />
                        <p className={`text-[10px] ${m.status === 'erledigt' ? 'line-through opacity-50 text-teal-700' : 'text-teal-900'}`}>{m.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 text-[9px] text-teal-600">
                    <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Ersthelfer: {p.ersthelfer}</span>
                    <span className={p.elternInformiert ? 'text-teal-600' : 'text-orange-500'}>
                      {p.elternInformiert ? '✓ Eltern informiert' : '⚠ Eltern noch nicht informiert'}
                    </span>
                  </div>
                  {p.notiz && (
                    <div className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-2 py-1.5">
                      <Star className="w-2.5 h-2.5 inline mr-1" />{p.notiz}
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
