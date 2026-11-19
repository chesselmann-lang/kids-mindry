'use client'

import { useState } from 'react'
import { Droplets, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, AlertTriangle } from 'lucide-react'

// ── Hygienekonzept — Mindry Kids Admin ───────────────────────────────────────
// Hygiene · Reinigung · Infektionsschutz · §36 IfSG

type HygieneBereich = 'reinigung' | 'handehygiene' | 'lebensmittel' | 'waeschepflege' | 'infektionsschutz' | 'sanitaer'
type PruefStatus = 'bestanden' | 'maengel' | 'ausstehend'

interface HygienePruefung {
  datum: string
  prueferin: string
  status: PruefStatus
  maengel?: string[]
  behoben?: boolean
}

interface HygieneMassnahme {
  bezeichnung: string
  haeufigkeit: string
  verantwortlich: string
  letzteKontrolle?: string
  ok?: boolean
}

interface HygieneAbschnitt {
  id: string
  bereich: HygieneBereich
  titel: string
  massnahmen: HygieneMassnahme[]
  pruefungen?: HygienePruefung[]
  notiz?: string
}

const BEREICH_CFG: Record<HygieneBereich, { label: string; emoji: string; farbe: string }> = {
  reinigung:       { label: 'Reinigung',       emoji: '🧹', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  handehygiene:    { label: 'Händehygiene',    emoji: '🙌', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  lebensmittel:    { label: 'Lebensmittel',    emoji: '🥗', farbe: 'bg-green-50 text-green-700 border-green-200' },
  waeschepflege:   { label: 'Wäschepflege',   emoji: '👕', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  infektionsschutz:{ label: 'Infektionsschutz',emoji: '🦠', farbe: 'bg-red-50 text-red-700 border-red-200' },
  sanitaer:        { label: 'Sanitäranlagen',  emoji: '🚿', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const PRUEF_CFG: Record<PruefStatus, { label: string; farbe: string }> = {
  bestanden: { label: 'Bestanden', farbe: 'text-green-600' },
  maengel:   { label: 'Mängel',    farbe: 'text-red-600' },
  ausstehend:{ label: 'Ausstehend', farbe: 'text-orange-500' },
}

const ABSCHNITTE: HygieneAbschnitt[] = [
  {
    id: 'hk1', bereich: 'reinigung', titel: 'Tägliche Reinigung',
    massnahmen: [
      { bezeichnung: 'Böden wischen alle Gruppenräume', haeufigkeit: 'täglich', verantwortlich: 'Reinigungsdienst', letzteKontrolle: '24.04.2026', ok: true },
      { bezeichnung: 'Oberflächen desinfizieren (Tische, Türgriffe)', haeufigkeit: 'täglich', verantwortlich: 'Reinigungsdienst', letzteKontrolle: '24.04.2026', ok: true },
      { bezeichnung: 'Tiefenreinigung Gruppenräume', haeufigkeit: 'wöchentlich', verantwortlich: 'Reinigungsunternehmen', letzteKontrolle: '18.04.2026', ok: true },
    ],
  },
  {
    id: 'hk2', bereich: 'handehygiene', titel: 'Händehygiene & Spender',
    massnahmen: [
      { bezeichnung: 'Seifenspender-Kontrolle + Auffüllen', haeufigkeit: 'täglich', verantwortlich: 'Frühdienst', letzteKontrolle: '24.04.2026', ok: true },
      { bezeichnung: 'Desinfektionsmittel-Stationen überprüfen', haeufigkeit: 'täglich', verantwortlich: 'Frühdienst', letzteKontrolle: '24.04.2026', ok: false },
      { bezeichnung: 'Händehygiene-Training für neue Kinder', haeufigkeit: 'bei Aufnahme', verantwortlich: 'Gruppenleitung', ok: true },
    ],
    notiz: 'Station Eingang leer — nachfüllen!',
  },
  {
    id: 'hk3', bereich: 'lebensmittel', titel: 'Lebensmittelhygiene (§36 IfSG)',
    massnahmen: [
      { bezeichnung: 'Kühlkette Frühstücks- und Mittagessenslagerung', haeufigkeit: 'täglich', verantwortlich: 'Köchin', letzteKontrolle: '24.04.2026', ok: true },
      { bezeichnung: 'Kühlschranktemperatur protokollieren', haeufigkeit: 'täglich', verantwortlich: 'Köchin', letzteKontrolle: '24.04.2026', ok: true },
      { bezeichnung: 'MHD-Kontrolle aller Lebensmittel', haeufigkeit: 'wöchentlich', verantwortlich: 'Köchin', letzteKontrolle: '21.04.2026', ok: true },
    ],
    pruefungen: [
      { datum: '15.01.2026', prueferin: 'Gesundheitsamt', status: 'bestanden' },
      { datum: '15.07.2026', prueferin: 'Gesundheitsamt', status: 'ausstehend' },
    ],
  },
  {
    id: 'hk4', bereich: 'infektionsschutz', titel: 'Infektionsschutz & Erkrankungsfälle',
    massnahmen: [
      { bezeichnung: 'Meldepflicht-Überwachung bei Infektionskrankheiten', haeufigkeit: 'laufend', verantwortlich: 'Leitung', ok: true },
      { bezeichnung: 'Ausschlussregelung kranker Kinder dokumentieren', haeufigkeit: 'bei Bedarf', verantwortlich: 'Gruppenleitung', ok: true },
      { bezeichnung: 'Elterninformation bei Ausbrüchen', haeufigkeit: 'bei Bedarf', verantwortlich: 'Leitung', ok: true },
    ],
  },
]

export default function HygienekonzeptPage() {
  const [expanded, setExpanded] = useState<string | null>('hk1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const offen = ABSCHNITTE.flatMap(a => a.massnahmen).filter(m => m.ok === false).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${ABSCHNITTE.length} Hygienebereiche. ${offen} Maßnahme(n) mit Handlungsbedarf. Desinfektionsmittel-Station Eingang leer — sofort auffüllen! Gesundheitsamt-Prüfung Juli 2026.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-teal-500" /> Hygienekonzept
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Reinigung · Infektionsschutz · Lebensmittelhygiene · §36 IfSG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',     val: ABSCHNITTE.length, color: 'text-teal-700' },
          { label: 'Handl.bedarf', val: offen,              color: offen > 0 ? 'text-red-500' : 'text-gray-400' },
          { label: 'Prüfungen',   val: ABSCHNITTE.flatMap(a => a.pruefungen || []).length, color: 'text-blue-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {offen > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-bold">Hygienemängel festgestellt — sofort beheben!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Hygieneübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Hygieneübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {ABSCHNITTE.map(a => {
          const isOpen = expanded === a.id
          const bCfg = BEREICH_CFG[a.bereich]
          const mängel = a.massnahmen.filter(m => m.ok === false).length
          return (
            <div key={a.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    {mängel > 0 && <span className="text-[8px] text-red-500 font-bold">⚠️ {mängel} Mangel</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{a.titel}</p>
                  <p className="text-[9px] text-teal-400">{a.massnahmen.length} Maßnahmen</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {a.massnahmen.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${m.ok ? 'text-green-500' : m.ok === false ? 'text-red-400' : 'text-gray-300'}`} />
                      <div className="flex-1">
                        <p className="text-[9px] text-teal-800">{m.bezeichnung}</p>
                        <p className="text-[8px] text-teal-400">{m.haeufigkeit} · {m.verantwortlich}{m.letzteKontrolle ? ` · Kontrolle: ${m.letzteKontrolle}` : ''}</p>
                      </div>
                    </div>
                  ))}
                  {a.pruefungen && (
                    <div className="mt-1">
                      <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Prüfungen</p>
                      {a.pruefungen.map((p, i) => {
                        const pCfg = PRUEF_CFG[p.status]
                        return (
                          <div key={i} className="flex items-center gap-1.5 mb-0.5">
                            <div className={`w-2 h-2 rounded-full ${p.status === 'bestanden' ? 'bg-green-400' : p.status === 'maengel' ? 'bg-red-400' : 'bg-gray-300'}`} />
                            <p className="text-[9px] text-teal-700">{p.datum} · {p.prueferin}</p>
                            <span className={`text-[8px] font-semibold ${pCfg.farbe}`}>{pCfg.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {a.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{a.notiz}</p>
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
