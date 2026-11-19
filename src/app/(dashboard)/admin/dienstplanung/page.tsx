'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, Clock, AlertTriangle, Star, CheckCircle2 } from 'lucide-react'

// ── Dienstplanung — Mindry Kids Admin ─────────────────────────────────────────
// Wochendienst · Schichten · Personalplanung · Urlaubsvertretungen

type DienstTyp = 'frueh' | 'mitte' | 'spaet' | 'teildienst' | 'vertretung' | 'frei'
type Wochentag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr'

interface DienstEintrag {
  tag: Wochentag
  typ: DienstTyp
  von: string
  bis: string
  notiz?: string
}

interface Mitarbeiter {
  id: string
  name: string
  rolle: string
  gruppe: string
  stunden: number
  eintraege: DienstEintrag[]
}

const DIENST_CFG: Record<DienstTyp, { label: string; farbe: string; bg: string }> = {
  frueh:      { label: 'Früh',       farbe: 'text-blue-700',   bg: 'bg-blue-50' },
  mitte:      { label: 'Mitte',      farbe: 'text-green-700',  bg: 'bg-green-50' },
  spaet:      { label: 'Spät',       farbe: 'text-orange-700', bg: 'bg-orange-50' },
  teildienst: { label: 'Teilzeit',   farbe: 'text-purple-700', bg: 'bg-purple-50' },
  vertretung: { label: 'Vertretung', farbe: 'text-red-700',    bg: 'bg-red-50' },
  frei:       { label: 'Frei',       farbe: 'text-gray-400',   bg: 'bg-gray-50' },
}

const TAGE: Wochentag[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

const INIT_MITARBEITER: Mitarbeiter[] = [
  {
    id: 'm1', name: 'Lisa Bauer', rolle: 'Erzieherin', gruppe: 'Igel', stunden: 39,
    eintraege: [
      { tag: 'Mo', typ: 'frueh',      von: '07:00', bis: '13:30' },
      { tag: 'Di', typ: 'mitte',      von: '09:00', bis: '15:30' },
      { tag: 'Mi', typ: 'mitte',      von: '09:00', bis: '15:30' },
      { tag: 'Do', typ: 'spaet',      von: '11:30', bis: '17:00' },
      { tag: 'Fr', typ: 'frueh',      von: '07:00', bis: '13:00' },
    ],
  },
  {
    id: 'm2', name: 'Karla Nowak', rolle: 'Erzieherin', gruppe: 'Bären', stunden: 30,
    eintraege: [
      { tag: 'Mo', typ: 'mitte',      von: '09:00', bis: '15:00' },
      { tag: 'Di', typ: 'teildienst', von: '08:00', bis: '12:30' },
      { tag: 'Mi', typ: 'frei',       von: '',      bis: '' },
      { tag: 'Do', typ: 'mitte',      von: '09:00', bis: '15:00' },
      { tag: 'Fr', typ: 'mitte',      von: '09:00', bis: '15:00' },
    ],
  },
  {
    id: 'm3', name: 'Tim Schulz', rolle: 'Erzieher', gruppe: 'Füchse', stunden: 39,
    eintraege: [
      { tag: 'Mo', typ: 'spaet',      von: '11:30', bis: '17:00' },
      { tag: 'Di', typ: 'spaet',      von: '11:30', bis: '17:00' },
      { tag: 'Mi', typ: 'frueh',      von: '07:00', bis: '13:30' },
      { tag: 'Do', typ: 'vertretung', von: '07:00', bis: '15:00', notiz: 'Vertretung für L. Bauer (krank)' },
      { tag: 'Fr', typ: 'spaet',      von: '11:30', bis: '17:00' },
    ],
  },
  {
    id: 'm4', name: 'Anna Krüger', rolle: 'Kinderpflegerin', gruppe: 'Igel', stunden: 20,
    eintraege: [
      { tag: 'Mo', typ: 'teildienst', von: '08:00', bis: '12:00' },
      { tag: 'Di', typ: 'teildienst', von: '08:00', bis: '12:00' },
      { tag: 'Mi', typ: 'teildienst', von: '08:00', bis: '12:00' },
      { tag: 'Do', typ: 'frei',       von: '',      bis: '' },
      { tag: 'Fr', typ: 'teildienst', von: '08:00', bis: '12:00' },
    ],
  },
]

function DienstCell({ e }: { e?: DienstEintrag }) {
  if (!e) return <div className="w-full h-7 rounded-lg bg-gray-50 border border-gray-100" />
  const cfg = DIENST_CFG[e.typ]
  return (
    <div className={`w-full h-7 rounded-lg ${cfg.bg} flex items-center justify-center relative group`}>
      <span className={`text-[8px] font-bold ${cfg.farbe}`}>{cfg.label}</span>
      {e.von && <span className="absolute -bottom-4 left-0 right-0 text-center text-[7px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{e.von}–{e.bis}</span>}
      {e.notiz && <AlertTriangle className="absolute top-0.5 right-0.5 w-2 h-2 text-red-400" />}
    </div>
  )
}

export default function DienstplanungPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [aktiverTag, setAktiverTag] = useState<Wochentag>('Mo')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const vertretungen = INIT_MITARBEITER.flatMap(m => m.eintraege).filter(e => e.typ === 'vertretung').length
  const freiTage = INIT_MITARBEITER.flatMap(m => m.eintraege).filter(e => e.typ === 'frei').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${INIT_MITARBEITER.length} Mitarbeiter geplant. ${vertretungen} Vertretungsdienst(e) diese Woche. Tim Schulz übernimmt Donnerstag für Lisa Bauer — Überlastvermeidung prüfen. ${freiTage} freie Schichten dokumentiert.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-500" /> Dienstplanung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Wochendienst · Schichten · Personal</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Mitarbeiter',  val: INIT_MITARBEITER.length, color: 'text-teal-700' },
          { label: 'Vertretungen', val: vertretungen, color: vertretungen > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Freitage',     val: freiTage, color: 'text-gray-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {vertretungen > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">{vertretungen} Vertretungsdienst(e) diese Woche — Belastung prüfen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Dienstübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Dienstübersicht'}
        </button>
      )}

      {/* Tagesfilter */}
      <div className="flex gap-1.5">
        {TAGE.map(t => (
          <button key={t} onClick={() => setAktiverTag(t)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${aktiverTag === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tagesübersicht */}
      <div className="rounded-2xl border border-teal-100 bg-white p-3 space-y-2">
        <p className="text-[10px] font-bold text-teal-700 mb-2">{aktiverTag} — Dienstübersicht</p>
        {INIT_MITARBEITER.map(m => {
          const eintrag = m.eintraege.find(e => e.tag === aktiverTag)
          const cfg = eintrag ? DIENST_CFG[eintrag.typ] : null
          return (
            <div key={m.id} className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-teal-900">{m.name}</p>
                <p className="text-[9px] text-teal-400">{m.rolle} · {m.gruppe}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {eintrag?.notiz && <AlertTriangle className="w-3 h-3 text-red-400" />}
                {eintrag && eintrag.typ !== 'frei' && <span className="text-[9px] text-teal-400">{eintrag.von}–{eintrag.bis}</span>}
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${cfg ? `${cfg.bg} ${cfg.farbe}` : 'bg-gray-50 text-gray-400'}`}>
                  {cfg ? cfg.label : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Wochenübersicht kompakt */}
      <div className="space-y-2">
        {INIT_MITARBEITER.map(m => {
          const isOpen = expanded === m.id
          return (
            <div key={m.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-900">{m.name}</p>
                  <p className="text-[9px] text-teal-400">{m.rolle} · {m.gruppe} · {m.stunden}h/Wo</p>
                  <div className="flex gap-1 mt-1">
                    {TAGE.map(t => {
                      const e = m.eintraege.find(x => x.tag === t)
                      const typ = e?.typ ?? 'frei'
                      const cfg = DIENST_CFG[typ]
                      return <span key={t} className={`text-[7px] px-1 py-0.5 rounded font-bold ${cfg.bg} ${cfg.farbe}`}>{t}</span>
                    })}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  {m.eintraege.map((e, i) => {
                    const cfg = DIENST_CFG[e.typ]
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-teal-400 w-5">{e.tag}</span>
                          {e.notiz && <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
                          {e.notiz && <span className="text-[9px] text-red-600 italic">{e.notiz}</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {e.von && <span className="text-[9px] text-teal-400">{e.von}–{e.bis}</span>}
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.farbe}`}>{cfg.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
