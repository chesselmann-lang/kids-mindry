'use client'

import { useState } from 'react'
import { Activity, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Gesundheitsförderung — kids-mindry ─────────────────────────────────────────
// Gesundheitsförderung · Hygiene · Ernährung · Bewegung · Infektionsschutz

type GesundheitsBereich = 'bewegung' | 'ernaehrung' | 'hygiene' | 'praevention' | 'infektionsschutz' | 'wohlbefinden' | 'natur'
type MassnahmenStatus = 'aktiv' | 'geplant' | 'abgeschlossen' | 'extern'

interface GesundheitsMassnahme {
  id: string
  bereich: GesundheitsBereich
  titel: string
  status: MassnahmenStatus
  verantwortlich: string
  rhythmus: string
  zielgruppe: string
  hinweise: string[]
  rechtsgrundlage?: string
  warnung?: string
}

const BEREICH_CFG: Record<GesundheitsBereich, { label: string; emoji: string; farbe: string }> = {
  bewegung:        { label: 'Bewegung',         emoji: '🏃', farbe: 'bg-green-50 text-green-700 border-green-200' },
  ernaehrung:      { label: 'Ernährung',        emoji: '🥦', farbe: 'bg-lime-50 text-lime-700 border-lime-200' },
  hygiene:         { label: 'Hygiene',          emoji: '🧼', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  praevention:     { label: 'Prävention',       emoji: '🛡️', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  infektionsschutz:{ label: 'Infektionsschutz', emoji: '🦠', farbe: 'bg-red-50 text-red-700 border-red-200' },
  wohlbefinden:    { label: 'Wohlbefinden',     emoji: '💛', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  natur:           { label: 'Natur & Umwelt',   emoji: '🌿', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const STATUS_CFG: Record<MassnahmenStatus, { label: string; farbe: string; dot: string }> = {
  aktiv:        { label: 'Aktiv',        farbe: 'text-green-600', dot: 'bg-green-400' },
  geplant:      { label: 'Geplant',      farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-400',  dot: 'bg-gray-300' },
  extern:       { label: 'Extern',       farbe: 'text-purple-500',dot: 'bg-purple-400' },
}

const MASSNAHMEN: GesundheitsMassnahme[] = [
  {
    id: 'gf1', bereich: 'bewegung', titel: 'Tägliche Bewegungszeit (30 min)',
    status: 'aktiv', verantwortlich: 'Alle Erzieher:innen', rhythmus: 'Täglich 9:00–9:30 Uhr',
    zielgruppe: 'Alle Kinder',
    hinweise: ['Freier Bewegungsraum + geführte Übungen', 'Schlechtwetterprogramm: Turnhalle', 'Outdoor-Bewegung ab 10°C bevorzugt', 'Motorikentwicklung dokumentiert'],
    rechtsgrundlage: 'KiBiz §4 NRW + WHO-Empfehlungen',
  },
  {
    id: 'gf2', bereich: 'ernaehrung', titel: 'Gesundes Frühstück + Mittagessen',
    status: 'aktiv', verantwortlich: 'Küche + Gruppenleitung', rhythmus: 'Täglich',
    zielgruppe: 'Alle Kinder',
    hinweise: ['DGE-Qualitätsstandards Kitaverpflegung', 'Allergenliste + Unverträglichkeiten aktualisiert', 'Bio-Anteil: 30% (zertifiziert)', 'Obstteller täglich + Wasser immer verfügbar'],
    rechtsgrundlage: 'DGE-Qualitätsstandard + §12 KiBiz',
  },
  {
    id: 'gf3', bereich: 'hygiene', titel: 'Hygieneplan + Händewaschen-Routine',
    status: 'aktiv', verantwortlich: 'Leitung + Erzieherteam', rhythmus: 'Täglich + Halbjährliche Überprüfung',
    zielgruppe: 'Kinder + Personal',
    hinweise: ['Hygieneplan nach §36 IfSG aushängt', 'Händewaschen: vor Essen, nach Toilette, nach draußen', 'Desinfektionsmittel: Dosierung beachten', 'Schulung Personal 2× jährlich'],
    rechtsgrundlage: '§36 IfSG + Hygieneleitfaden RKI',
  },
  {
    id: 'gf4', bereich: 'infektionsschutz', titel: 'Meldepflicht + Ausschlussfristen',
    status: 'aktiv', verantwortlich: 'Leitung', rhythmus: 'Bei Bedarf / sofort',
    zielgruppe: 'Alle Kinder + Eltern',
    hinweise: ['Ausschluss bei: Masern, Keuchhusten, Scharlach...', 'Elterninfo-Vorlage im System', 'Meldung ans Gesundheitsamt binnen 24h', 'Wiederaufnahme: ärztl. Attest erforderlich'],
    rechtsgrundlage: '§34 IfSG Gemeinschaftseinrichtungen',
    warnung: 'Aktuell: 2 Kinder mit Scharlach (Kita bestätigt 22.04.)',
  },
  {
    id: 'gf5', bereich: 'praevention', titel: 'U-Untersuchungen + Vorsorge',
    status: 'aktiv', verantwortlich: 'Leitung + Eltern', rhythmus: 'Bei Aufnahme + Jahresbeginn',
    zielgruppe: 'Alle Kinder',
    hinweise: ['U-Heft-Vorlage bei Aufnahme prüfen', 'Zahnprophylaxe (Schulzahnärztlicher Dienst)', 'Sehtest + Hörtest: Kl.-Arzt', 'Impfpass-Check (Empfehlung STIKO)'],
    rechtsgrundlage: 'KFU NRW + SGB V',
  },
  {
    id: 'gf6', bereich: 'wohlbefinden', titel: 'Entspannungs- und Ruhezeiten',
    status: 'aktiv', verantwortlich: 'Alle Erzieher:innen', rhythmus: 'Täglich 12:30–14:00',
    zielgruppe: 'U3 + Ü3 nach Bedarf',
    hinweise: ['Schlafraum: Helligkeit + Temperatur reguliert', 'Individuelle Schlafbedürfnisse dokumentiert', 'Musikkonzepte: ruhige Musik bei Einschlaf', 'Kein Schlafzwang für Ü3-Kinder'],
  },
]

export default function GesundheitsfoerderungPage() {
  const [expanded, setExpanded] = useState<string | null>('gf4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = MASSNAHMEN.filter(m => m.status === 'aktiv').length
  const warnungen = MASSNAHMEN.filter(m => m.warnung).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MASSNAHMEN.length} Gesundheitsmaßnahmen, ${aktiv} aktiv. ${warnungen} aktive Warnung(en). Scharlach-Meldung 22.04. — Ausschlussfristen prüfen! Hygieneplan §36 IfSG aktuell.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24 text-teal-900">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-teal-500" /> Gesundheitsförderung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Hygiene · Ernährung · Bewegung · Infektionsschutz · §34 IfSG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Maßnahmen', val: MASSNAHMEN.length, color: 'text-teal-700' },
          { label: 'Aktiv',     val: aktiv,             color: 'text-green-600' },
          { label: 'Warnungen', val: warnungen,         color: warnungen > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {MASSNAHMEN.some(m => m.warnung) && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-700 font-semibold">{MASSNAHMEN.find(m => m.warnung)?.warnung}</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Gesundheitsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Gesundheitsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {MASSNAHMEN.map(m => {
          const isOpen = expanded === m.id
          const bCfg = BEREICH_CFG[m.bereich]
          const sCfg = STATUS_CFG[m.status]
          return (
            <div key={m.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 bg-white flex items-center justify-center shrink-0 text-lg">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {m.warnung && <AlertTriangle className="w-2.5 h-2.5 text-red-500" />}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{m.titel}</p>
                  <p className="text-[9px] text-teal-400">{m.verantwortlich} · {m.rhythmus}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-600">Zielgruppe: {m.zielgruppe}</p>
                  {m.rechtsgrundlage && (
                    <p className="text-[8px] font-semibold text-teal-500">{m.rechtsgrundlage}</p>
                  )}
                  <div>
                    {m.hinweise.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-teal-500" />
                        <p className="text-[9px] text-teal-800">{h}</p>
                      </div>
                    ))}
                  </div>
                  {m.warnung && (
                    <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] text-red-700 font-semibold">{m.warnung}</p>
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
