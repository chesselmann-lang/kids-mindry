'use client'

import { useState } from 'react'
import { Layers, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Raumgestaltung — kids-mindry ───────────────────────────────────────────────
// Raumkonzept · Funktionsbereiche · Sicherheit · Materialien

type RaumBereich = 'gruppenraum' | 'bewegung' | 'kreativitaet' | 'ruhe' | 'outdoor' | 'sanitaer' | 'personal'
type RaumStatus = 'in_ordnung' | 'pruefung' | 'massnahme_noetig' | 'gesperrt'

interface RaumEintrag {
  id: string
  bereich: RaumBereich
  name: string
  flaeche?: string
  status: RaumStatus
  verantwortlich: string
  letzteInspektion: string
  naechsteInspektion?: string
  merkmale: string[]
  hinweis?: string
}

const BEREICH_CFG: Record<RaumBereich, { label: string; emoji: string; farbe: string }> = {
  gruppenraum:  { label: 'Gruppenraum',    emoji: '🏠', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  bewegung:     { label: 'Bewegungsraum',  emoji: '🏃', farbe: 'bg-green-50 text-green-700 border-green-200' },
  kreativitaet: { label: 'Kreativraum',    emoji: '🎨', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  ruhe:         { label: 'Ruhebereich',    emoji: '💛', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  outdoor:      { label: 'Außengelände',   emoji: '🌳', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  sanitaer:     { label: 'Sanitärbereich', emoji: '🚿', farbe: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  personal:     { label: 'Personalbereich',emoji: '🔑', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<RaumStatus, { label: string; farbe: string; dot: string }> = {
  in_ordnung:       { label: 'In Ordnung',     farbe: 'text-green-600', dot: 'bg-green-400' },
  pruefung:         { label: 'Wird geprüft',   farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  massnahme_noetig: { label: 'Maßnahme nötig', farbe: 'text-orange-500',dot: 'bg-orange-400' },
  gesperrt:         { label: 'Gesperrt',        farbe: 'text-red-600',   dot: 'bg-red-400' },
}

const RAEUME: RaumEintrag[] = [
  {
    id: 'rg1', bereich: 'gruppenraum', name: 'Gruppenraum Sonnenkäfer (U3)',
    flaeche: '42 m²', status: 'in_ordnung',
    verantwortlich: 'Fr. Müller', letzteInspektion: '01.04.2026', naechsteInspektion: '01.10.2026',
    merkmale: ['Kindgerechte Möbelhöhe (40 cm)', 'Spielinseln: Bauen, Rollenspiel, Bücher', 'Krippenregeln: max. 10 U3-Kinder', 'Fensterfolie + Sicherheitsverriegelung'],
  },
  {
    id: 'rg2', bereich: 'bewegung', name: 'Turnhalle / Bewegungsraum',
    flaeche: '80 m²', status: 'in_ordnung',
    verantwortlich: 'Hr. Weber', letzteInspektion: '15.03.2026', naechsteInspektion: '15.09.2026',
    merkmale: ['Geräteprüfung TÜV: März 2026 (bestanden)', 'Weichbodenmatte + Turngeräte zugelassen', 'Kletterwand: Sicherheitsabstand einhalten', 'Maximale Gruppengröße: 15 Kinder'],
  },
  {
    id: 'rg3', bereich: 'outdoor', name: 'Außengelände + Spielplatz',
    flaeche: '350 m²', status: 'massnahme_noetig',
    verantwortlich: 'Leitung', letzteInspektion: '20.04.2026', naechsteInspektion: '30.04.2026',
    merkmale: ['Spielgeräte nach EN 1176 geprüft', 'Sandkasten: hygienisch einwandfrei (04/2026)', 'Trampolin: Netz zu erneuern (Auftrag erteilt)', 'Weidenzelt: Schnitt fällig (Mai 2026)'],
    hinweis: 'Trampolin-Sicherheitsnetz defekt — bis Reparatur gesperrt!',
  },
  {
    id: 'rg4', bereich: 'kreativitaet', name: 'Atelier / Kreativbereich',
    flaeche: '25 m²', status: 'in_ordnung',
    verantwortlich: 'Fr. Schmidt', letzteInspektion: '10.04.2026',
    merkmale: ['Materialien: kindgerecht + CE-zugelassen', 'Staffeleien + Wasserfarben (nicht toxisch)', 'Tonwerkstatt: Lehm-Wanne abgedeckt', 'Aufräumritual nach jeder Nutzung'],
  },
  {
    id: 'rg5', bereich: 'ruhe', name: 'Schlaf- und Ruheraum',
    flaeche: '30 m²', status: 'in_ordnung',
    verantwortlich: 'Fr. Müller', letzteInspektion: '18.04.2026',
    merkmale: ['Kinderbetten: personalisiert + gekennzeichnet', 'Schlafkontrolle U3: 10-min-Intervall', 'Belüftung: CO2-Sensor installiert (04/2026)', 'Abdunklungsrollos + Nachtlicht'],
  },
  {
    id: 'rg6', bereich: 'sanitaer', name: 'Sanitärbereich Kinder',
    status: 'pruefung',
    verantwortlich: 'Leitung + Hausmeister', letzteInspektion: '22.04.2026',
    merkmale: ['Kinderklos: 4 WCs (Kniehöhe 23 cm)', 'Wickelbereich: Schutzpapier tägl. wechseln', 'Warmwasser: max. 38°C (Thermostat)', 'Wasserarmaturen: Legionellen-Spülung quartalsw.'],
    hinweis: 'Siphon Waschbecken 2 verstopft — Handwerker angerufen 22.04.',
  },
]

export default function RaumgestaltungPage() {
  const [expanded, setExpanded] = useState<string | null>('rg3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const inOrdnung = RAEUME.filter(r => r.status === 'in_ordnung').length
  const aktion = RAEUME.filter(r => r.status === 'massnahme_noetig' || r.status === 'gesperrt').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${RAEUME.length} Raumbereiche, ${inOrdnung} in Ordnung, ${aktion} mit Handlungsbedarf. Trampolin gesperrt (Netz defekt). Sanitär: Siphon verstopft (Handwerker 22.04.). CO2-Sensor neu installiert.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24 text-teal-900">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-teal-500" /> Raumgestaltung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Raumkonzept · Sicherheit · EN 1176 · Inspektionen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: RAEUME.length, color: 'text-teal-700' },
          { label: 'In Ordnung',  val: inOrdnung,     color: 'text-green-600' },
          { label: 'Maßnahmen',   val: aktion,        color: aktion > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {RAEUME.some(r => r.hinweis) && (
        <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-orange-700 font-semibold">{RAEUME.find(r => r.hinweis)?.hinweis}</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Raumübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Raumübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {RAEUME.map(r => {
          const isOpen = expanded === r.id
          const bCfg = BEREICH_CFG[r.bereich]
          const sCfg = STATUS_CFG[r.status]
          return (
            <div key={r.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 bg-white flex items-center justify-center shrink-0 text-lg">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{r.name}</p>
                  <p className="text-[9px] text-teal-400">{r.verantwortlich}{r.flaeche ? ` · ${r.flaeche}` : ''} · Insp. {r.letzteInspektion}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {r.naechsteInspektion && (
                    <p className="text-[9px] text-teal-500">Nächste Inspektion: {r.naechsteInspektion}</p>
                  )}
                  <div>
                    {r.merkmale.map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-teal-500" />
                        <p className="text-[9px] text-teal-800">{m}</p>
                      </div>
                    ))}
                  </div>
                  {r.hinweis && (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] text-orange-700 font-semibold">{r.hinweis}</p>
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
