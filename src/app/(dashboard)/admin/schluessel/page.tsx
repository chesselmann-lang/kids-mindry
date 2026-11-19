'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react'

// ── Schlüsselverwaltung — Mindry Kids Admin ───────────────────────────────────
// Schlüsselausgabe · Rückgabe · Berechtigte · Verlust-Dokumentation

type SchluesselTyp = 'haupteingang' | 'seiteneingang' | 'keller' | 'lager' | 'buero' | 'notausgang'
type SchluesselStatus = 'ausgegeben' | 'zurueck' | 'verloren' | 'gesperrt'

interface SchluesselAusgabe {
  person: string
  rolle: string
  ausgabeDatum: string
  rueckgabeDatum?: string
  status: SchluesselStatus
  notiz?: string
}

interface Schluessel {
  id: string
  bezeichnung: string
  typ: SchluesselTyp
  anzahlKopien: number
  ausgaben: SchluesselAusgabe[]
}

const TYP_CFG: Record<SchluesselTyp, { label: string; farbe: string }> = {
  haupteingang: { label: 'Haupteingang', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  seiteneingang:{ label: 'Seiteneingang',farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  keller:       { label: 'Keller',       farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
  lager:        { label: 'Lager',        farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  buero:        { label: 'Büro',         farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  notausgang:   { label: 'Notausgang',   farbe: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_CFG: Record<SchluesselStatus, { label: string; farbe: string }> = {
  ausgegeben: { label: 'Ausgegeben', farbe: 'text-orange-500' },
  zurueck:    { label: 'Zurück',     farbe: 'text-green-600' },
  verloren:   { label: 'Verloren',   farbe: 'text-red-600' },
  gesperrt:   { label: 'Gesperrt',   farbe: 'text-gray-500' },
}

const INIT_SCHLUESSEL: Schluessel[] = [
  {
    id: 'sk1', bezeichnung: 'Hauptschlüssel A', typ: 'haupteingang', anzahlKopien: 4,
    ausgaben: [
      { person: 'Fr. Schmidt', rolle: 'Leiterin', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
      { person: 'Fr. Klein', rolle: 'Stellv. Leiterin', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
      { person: 'Hr. Weber', rolle: 'Hausmeister', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
      { person: 'Fr. Braun', rolle: 'Erzieherin', ausgabeDatum: '15.03.2026', status: 'ausgegeben' },
    ],
  },
  {
    id: 'sk2', bezeichnung: 'Seiteneingang B', typ: 'seiteneingang', anzahlKopien: 2,
    ausgaben: [
      { person: 'Fr. Neumann', rolle: 'Erzieherin', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
      { person: 'Fr. Koch', rolle: 'FSJ', ausgabeDatum: '01.10.2025', rueckgabeDatum: '31.03.2026', status: 'zurueck' },
    ],
  },
  {
    id: 'sk3', bezeichnung: 'Lagerschlüssel', typ: 'lager', anzahlKopien: 2,
    ausgaben: [
      { person: 'Hr. Weber', rolle: 'Hausmeister', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
      { person: 'Fr. Schmidt', rolle: 'Leiterin', ausgabeDatum: '01.09.2025', status: 'verloren', notiz: 'Verlust gemeldet 20.04.2026 — Schloss wird getauscht' },
    ],
  },
  {
    id: 'sk4', bezeichnung: 'Büroschlüssel', typ: 'buero', anzahlKopien: 3,
    ausgaben: [
      { person: 'Fr. Schmidt', rolle: 'Leiterin', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
      { person: 'Fr. Klein', rolle: 'Stellv. Leiterin', ausgabeDatum: '01.09.2025', status: 'ausgegeben' },
    ],
  },
]

export default function SchluesselverwaltungPage() {
  const [expanded, setExpanded] = useState<string | null>('sk1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const ausgegeben = INIT_SCHLUESSEL.flatMap(s => s.ausgaben).filter(a => a.status === 'ausgegeben').length
  const verloren = INIT_SCHLUESSEL.flatMap(s => s.ausgaben).filter(a => a.status === 'verloren').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${INIT_SCHLUESSEL.length} Schließanlagen verwaltet, ${ausgegeben} Schlüssel aktuell ausgegeben. ${verloren > 0 ? `⚠ ${verloren} Verlustmeldung(en) — Schloss tauschen!` : 'Keine offenen Verlustmeldungen.'} Empfehlung: Jährliche Schlüsselrückgabe-Prüfung durchführen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-teal-500" /> Schlüsselverwaltung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Ausgabe · Rückgabe · Verlustmeldung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Schlüssel',   val: INIT_SCHLUESSEL.length, color: 'text-teal-700' },
          { label: 'Ausgegeben',  val: ausgegeben, color: 'text-orange-600' },
          { label: 'Verlust',     val: verloren, color: verloren > 0 ? 'text-red-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {verloren > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">Verlustmeldung offen — Schloss tauschen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Schlüsselüberblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Schlüsselüberblick'}
        </button>
      )}

      <div className="space-y-2">
        {INIT_SCHLUESSEL.map(s => {
          const isOpen = expanded === s.id
          const aktiv = s.ausgaben.filter(a => a.status === 'ausgegeben').length
          const hatVerlust = s.ausgaben.some(a => a.status === 'verloren')
          const typCfg = TYP_CFG[s.typ]
          return (
            <div key={s.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${hatVerlust ? 'bg-red-100' : 'bg-teal-100'}`}>
                  <Star className={`w-4 h-4 ${hatVerlust ? 'text-red-500' : 'text-teal-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{s.bezeichnung}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${typCfg.farbe}`}>{typCfg.label}</span>
                    {hatVerlust && <span className="text-[8px] text-red-600 font-bold">⚠ Verlust</span>}
                  </div>
                  <p className="text-[9px] text-teal-500 mt-0.5"><Users className="w-2.5 h-2.5 inline mr-0.5" />{aktiv} von {s.anzahlKopien} Kopien ausgegeben</p>
                  <div className="h-1 rounded-full bg-teal-100 mt-1">
                    <div className="h-full rounded-full bg-teal-400" style={{ width: `${Math.min(100, Math.round(aktiv / s.anzahlKopien * 100))}%` }} />
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  {s.ausgaben.map((a, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-teal-900">{a.person}</p>
                        <p className="text-[9px] text-teal-500">{a.rolle} · seit {a.ausgabeDatum}</p>
                        {a.notiz && <p className="text-[8px] text-red-600 mt-0.5">{a.notiz}</p>}
                      </div>
                      <span className={`text-[9px] font-semibold ${STATUS_CFG[a.status].farbe}`}>{STATUS_CFG[a.status].label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
