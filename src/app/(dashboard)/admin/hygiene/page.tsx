'use client'

import { useState } from 'react'
import {
  Shield, ChevronDown, ChevronUp, Sparkles,
  CheckCircle2, AlertTriangle, Clock, CalendarDays,
  Star, Users, Heart,
} from 'lucide-react'

// ── Hygieneprotokoll — Mindry Kids ────────────────────────────────────────────
// Reinigungsnachweise · IfSG-Konformität · Desinfektionsplan · Leiterin

type HygieneStatus = 'offen' | 'erledigt' | 'ueberpruefen'
type Bereich = 'toiletten' | 'kueche' | 'gruppenraum' | 'schlafraum' | 'eingang' | 'spielzeug'
type Haeufigkeit = 'taeglich' | 'woeffentlich' | 'monatlich'

interface HygieneAufgabe {
  id: string
  bereich: Bereich
  aufgabe: string
  haeufigkeit: Haeufigkeit
  status: HygieneStatus
  erledigt_von?: string
  uhrzeit?: string
  hinweis?: string
}

const STATUS_CFG: Record<HygieneStatus, { label: string; farbe: string; bg: string; emoji: string }> = {
  offen:       { label: 'Offen',     farbe: 'text-gray-600',   bg: 'bg-gray-100',  emoji: '○' },
  erledigt:    { label: 'Erledigt',  farbe: 'text-green-700',  bg: 'bg-green-50',  emoji: '✅' },
  ueberpruefen:{ label: 'Prüfen',    farbe: 'text-orange-700', bg: 'bg-orange-50', emoji: '⚠️' },
}

const BEREICH_CFG: Record<Bereich, { label: string; emoji: string }> = {
  toiletten:   { label: 'Toiletten',   emoji: '🚽' },
  kueche:      { label: 'Küche',       emoji: '🍴' },
  gruppenraum: { label: 'Gruppenraum', emoji: '🏠' },
  schlafraum:  { label: 'Schlafraum',  emoji: '🛏️' },
  eingang:     { label: 'Eingang',     emoji: '🚪' },
  spielzeug:   { label: 'Spielzeug',   emoji: '🧸' },
}

const INIT_AUFGABEN: HygieneAufgabe[] = [
  { id: 'h1', bereich: 'toiletten',   aufgabe: 'Toiletten desinfizieren & reinigen', haeufigkeit: 'taeglich', status: 'erledigt', erledigt_von: 'Fr. Bauer', uhrzeit: '07:30' },
  { id: 'h2', bereich: 'toiletten',   aufgabe: 'Seifenspender auffüllen', haeufigkeit: 'taeglich', status: 'erledigt', erledigt_von: 'Fr. Bauer', uhrzeit: '07:32' },
  { id: 'h3', bereich: 'kueche',      aufgabe: 'Arbeitsflächen desinfizieren', haeufigkeit: 'taeglich', status: 'erledigt', erledigt_von: 'Küche', uhrzeit: '08:00' },
  { id: 'h4', bereich: 'kueche',      aufgabe: 'Kühlschrank Temperatur prüfen', haeufigkeit: 'taeglich', status: 'offen', hinweis: 'Solltemperatur: 2–7°C' },
  { id: 'h5', bereich: 'gruppenraum', aufgabe: 'Tische abwischen nach Mahlzeit', haeufigkeit: 'taeglich', status: 'offen' },
  { id: 'h6', bereich: 'gruppenraum', aufgabe: 'Boden feucht wischen', haeufigkeit: 'taeglich', status: 'offen' },
  { id: 'h7', bereich: 'schlafraum',  aufgabe: 'Matten desinfizieren', haeufigkeit: 'woeffentlich', status: 'erledigt', erledigt_von: 'Fr. Klein', uhrzeit: 'Mo 08:00' },
  { id: 'h8', bereich: 'spielzeug',   aufgabe: 'Kunststoffspielzeug in Desinfektionslösung', haeufigkeit: 'woeffentlich', status: 'ueberpruefen', hinweis: 'Letzt: Fr, 18.04. — Protokoll fehlt' },
  { id: 'h9', bereich: 'eingang',     aufgabe: 'Desinfektionsmittelspender auffüllen', haeufigkeit: 'taeglich', status: 'offen' },
  { id: 'h10', bereich: 'kueche',     aufgabe: 'Monatliche Schädlingskontrolle', haeufigkeit: 'monatlich', status: 'erledigt', erledigt_von: 'Schädlingsbekämpfer', uhrzeit: '01. Apr.' },
]

export default function HygienePage() {
  const [aufgaben, setAufgaben] = useState(INIT_AUFGABEN)
  const [filterBereich, setFilterBereich] = useState<Bereich | 'alle'>('alle')
  const [kiText, setKiText] = useState<string | null>(null)
  const [kiLaedt, setKiLaedt] = useState(false)

  function statusToggle(id: string) {
    setAufgaben(prev => prev.map(a => {
      if (a.id !== id) return a
      const order: HygieneStatus[] = ['offen', 'erledigt', 'ueberpruefen']
      const next = order[(order.indexOf(a.status) + 1) % order.length]
      return { ...a, status: next, erledigt_von: next === 'erledigt' ? 'Fr. Weber' : a.erledigt_von, uhrzeit: next === 'erledigt' ? new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : a.uhrzeit }
    }))
  }

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      const offen = aufgaben.filter(a => a.status === 'offen').length
      const pruefen = aufgaben.filter(a => a.status === 'ueberpruefen').length
      const text = `Hygieneprotokoll heute: ${aufgaben.filter(a => a.status === 'erledigt').length}/${aufgaben.length} Aufgaben erledigt. ${offen > 0 ? offen + ' Aufgaben noch offen.' : 'Alle erledigt!'} ${pruefen > 0 ? pruefen + ' Aufgabe(n) zur Überprüfung.' : ''} Nächste IfSG-Prüfung: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}.`
      setKiText(text)
      setKiLaedt(false)
    }, 1000)
  }

  const filtered = filterBereich === 'alle' ? aufgaben : aufgaben.filter(a => a.bereich === filterBereich)
  const erledigtCount = aufgaben.filter(a => a.status === 'erledigt').length
  const offenCount = aufgaben.filter(a => a.status === 'offen').length
  const prüfenCount = aufgaben.filter(a => a.status === 'ueberpruefen').length
  const bereiche = Array.from(new Set(aufgaben.map(a => a.bereich)))

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" /> Hygieneprotokoll
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">IfSG-konform · Tagesprotokoll · Freitag, 25. Apr. 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Gesamt',   val: aufgaben.length,  color: 'text-amber-700' },
          { label: 'Erledigt', val: erledigtCount,     color: 'text-green-700' },
          { label: 'Offen',    val: offenCount,        color: offenCount > 0 ? 'text-orange-600' : 'text-gray-500' },
          { label: 'Prüfen',   val: prüfenCount,       color: prüfenCount > 0 ? 'text-red-600' : 'text-gray-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {prüfenCount > 0 && (
        <div className="rounded-xl flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-xs text-orange-800">{prüfenCount} Aufgabe(n) erfordern Überprüfung — bitte zeitnah klären.</p>
        </div>
      )}

      {/* Bereich-Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', ...bereiche] as (Bereich | 'alle')[]).map(b => (
          <button key={b} onClick={() => setFilterBereich(b)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterBereich === b ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {b === 'alle' ? 'Alle' : `${BEREICH_CFG[b as Bereich].emoji} ${BEREICH_CFG[b as Bereich].label}`}
          </button>
        ))}
      </div>

      {/* Aufgaben */}
      <div className="space-y-1.5">
        {filtered.map(a => {
          const sCfg = STATUS_CFG[a.status]
          const bCfg = BEREICH_CFG[a.bereich]
          return (
            <button key={a.id} onClick={() => statusToggle(a.id)}
              className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left hover:opacity-90 transition-opacity bg-white ${
                a.status === 'ueberpruefen' ? 'border-orange-200' : 'border-amber-100'
              }`}>
              <span className="text-base shrink-0">{sCfg.emoji}</span>
              <span className="text-base shrink-0">{bCfg.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${a.status === 'erledigt' ? 'line-through text-gray-400' : 'text-amber-900'}`}>{a.aufgabe}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-amber-600">{bCfg.label}</span>
                  {a.erledigt_von && <span className="text-[9px] text-green-600">✓ {a.erledigt_von} {a.uhrzeit ? `· ${a.uhrzeit}` : ''}</span>}
                  {a.hinweis && <span className="text-[9px] text-orange-600">⚠ {a.hinweis}</span>}
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe} shrink-0`}>{sCfg.label}</span>
            </button>
          )
        })}
      </div>

      {kiText ? (
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-bold flex items-center gap-1 mb-1 text-amber-700">
            <Sparkles className="w-3 h-3" /> KI-Zusammenfassung
          </p>
          <p className="text-xs leading-relaxed text-amber-900">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Zusammenfassung'}
        </button>
      )}
    </div>
  )
}
