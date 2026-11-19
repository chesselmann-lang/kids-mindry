'use client'

import { useState } from 'react'
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Star } from 'lucide-react'

// ── Sicherheit & Arbeitsschutz — Mindry Kids Admin ────────────────────────────
// Unfallverhütung · Brandschutz · Hygieneplan · §21 SGB VIII

type SicherheitsBereich = 'brandschutz' | 'hygiene' | 'unfallschutz' | 'gefahrstoffe' | 'erstehilfe' | 'aufsichtspflicht'
type PruefStatus = 'aktuell' | 'faellig' | 'ueberfaellig'

interface SicherheitsAufgabe {
  bezeichnung: string
  verantwortlich: string
  intervall: string
  letztePruefung: string
  status: PruefStatus
  notiz?: string
}

const BEREICH_CFG: Record<SicherheitsBereich, { label: string; emoji: string; farbe: string }> = {
  brandschutz:      { label: 'Brandschutz',       emoji: '🔥', farbe: 'bg-red-50 text-red-700' },
  hygiene:          { label: 'Hygiene',            emoji: '🧼', farbe: 'bg-blue-50 text-blue-700' },
  unfallschutz:     { label: 'Unfallschutz',       emoji: '⛑️', farbe: 'bg-orange-50 text-orange-700' },
  gefahrstoffe:     { label: 'Gefahrstoffe',       emoji: '☣️', farbe: 'bg-yellow-50 text-yellow-700' },
  erstehilfe:       { label: 'Erste Hilfe',        emoji: '🩺', farbe: 'bg-green-50 text-green-700' },
  aufsichtspflicht: { label: 'Aufsichtspflicht',   emoji: '👁️', farbe: 'bg-purple-50 text-purple-700' },
}

const PRUF_CFG: Record<PruefStatus, { label: string; farbe: string; dot: string }> = {
  aktuell:     { label: 'Aktuell',     farbe: 'text-green-600',  dot: 'bg-green-400' },
  faellig:     { label: 'Fällig',      farbe: 'text-orange-500', dot: 'bg-orange-400' },
  ueberfaellig:{ label: 'Überfällig!', farbe: 'text-red-600',    dot: 'bg-red-400' },
}

const AUFGABEN: (SicherheitsAufgabe & { bereich: SicherheitsBereich; id: string })[] = [
  {
    id: 's1', bereich: 'brandschutz', bezeichnung: 'Brandschutzübung durchführen',
    verantwortlich: 'Kita-Leitung', intervall: 'jährlich',
    letztePruefung: 'Nov. 2025', status: 'faellig',
    notiz: 'Übung für April 2026 noch nicht terminiert!',
  },
  {
    id: 's2', bereich: 'brandschutz', bezeichnung: 'Feuerlöscher Wartung',
    verantwortlich: 'Hausmeister', intervall: '2-jährlich',
    letztePruefung: 'Jan. 2025', status: 'faellig',
  },
  {
    id: 's3', bereich: 'hygiene', bezeichnung: 'Hygieneplan aktualisieren (§36 IfSG)',
    verantwortlich: 'Kita-Leitung + Gesundheitsamt', intervall: 'jährlich',
    letztePruefung: 'März 2026', status: 'aktuell',
  },
  {
    id: 's4', bereich: 'erstehilfe', bezeichnung: 'EH-Ausweise Lehrkräfte erneuern',
    verantwortlich: 'Kita-Leitung', intervall: '2-jährlich',
    letztePruefung: 'Juni 2023', status: 'ueberfaellig',
    notiz: '3 Ausweise seit 2025 abgelaufen — sofort Kurs buchen!',
  },
  {
    id: 's5', bereich: 'unfallschutz', bezeichnung: 'Spielplatzprüfung (DGUV Vorschrift 82)',
    verantwortlich: 'Hausmeister + Trägerin', intervall: 'jährlich',
    letztePruefung: 'Feb. 2026', status: 'aktuell',
  },
  {
    id: 's6', bereich: 'aufsichtspflicht', bezeichnung: 'Aufsichtsplan + Elterninfo aktualisieren',
    verantwortlich: 'Kita-Leitung', intervall: 'halbjährlich',
    letztePruefung: 'Okt. 2025', status: 'faellig',
  },
]

export default function SicherheitPage() {
  const [expanded, setExpanded] = useState<string | null>('s1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const ueberfaellig = AUFGABEN.filter(a => a.status === 'ueberfaellig').length
  const faellig = AUFGABEN.filter(a => a.status === 'faellig').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${AUFGABEN.length} Sicherheitsaufgaben: ${ueberfaellig} überfällig, ${faellig} fällig. EH-Ausweise dringend erneuern! Brandschutzübung + Feuerlöscher bis April/Mai. Aufsichtsplan überholt.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-500" /> Sicherheit & Arbeitsschutz
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Brandschutz · Hygiene · Erste Hilfe · §21 SGB VIII</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Aufgaben',    val: AUFGABEN.length, color: 'text-teal-700' },
          { label: 'Fällig',      val: faellig,         color: faellig > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Überfällig',  val: ueberfaellig,    color: ueberfaellig > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {ueberfaellig > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-bold">{ueberfaellig} überfällige Prüfung(en) — sofort handeln!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Sicherheitscheck</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Sicherheitscheck'}
        </button>
      )}

      <div className="space-y-2">
        {AUFGABEN.map(a => {
          const isOpen = expanded === a.id
          const bCfg = BEREICH_CFG[a.bereich]
          const pCfg = PRUF_CFG[a.status]
          return (
            <div key={a.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-lg">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${pCfg.farbe}`}>{pCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{a.bezeichnung}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />Letzte Prüfung: {a.letztePruefung} · {a.intervall}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  <p className="text-[9px] text-teal-600">Verantwortlich: {a.verantwortlich}</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3 h-3 ${a.status === 'aktuell' ? 'text-green-500' : 'text-gray-300'}`} />
                    <p className={`text-[9px] ${a.status === 'aktuell' ? 'text-green-700' : 'text-orange-600 font-semibold'}`}>
                      {a.status === 'aktuell' ? 'Erledigt und aktuell' : `${pCfg.label} — sofort prüfen!`}
                    </p>
                  </div>
                  {a.notiz && (
                    <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-1.5 mt-1">
                      <p className="text-[9px] text-red-700"><Star className="w-2.5 h-2.5 inline mr-1" />{a.notiz}</p>
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
