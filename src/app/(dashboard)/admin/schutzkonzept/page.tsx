'use client'

import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Users, Star } from 'lucide-react'

// ── Schutzkonzept — Mindry Kids Admin ─────────────────────────────────────────
// Kinderschutz §§8a/8b SGB VIII · Risikoanalyse · Maßnahmen · Verhaltenskodex

type SchutzBereich = 'risiko' | 'praevention' | 'intervention' | 'kodex' | 'schulung' | 'dokumentation'
type MassnahmenStatus = 'umgesetzt' | 'in_arbeit' | 'geplant' | 'ueberfaellig'

interface SchutzMassnahme {
  titel: string
  beschreibung: string
  verantwortlich: string
  frist: string
  status: MassnahmenStatus
}

interface SchutzBaustein {
  id: string
  bereich: SchutzBereich
  titel: string
  zusammenfassung: string
  massnahmen: SchutzMassnahme[]
  letzteUeberarbeitung: string
}

const BEREICH_CFG: Record<SchutzBereich, { label: string; farbe: string }> = {
  risiko:        { label: 'Risikoanalyse',   farbe: 'bg-red-50 text-red-700 border-red-200' },
  praevention:   { label: 'Prävention',      farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  intervention:  { label: 'Intervention',    farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  kodex:         { label: 'Verhaltenskodex', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  schulung:      { label: 'Schulung',        farbe: 'bg-green-50 text-green-700 border-green-200' },
  dokumentation: { label: 'Dokumentation',   farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const STATUS_CFG: Record<MassnahmenStatus, { label: string; farbe: string; symbol: string }> = {
  umgesetzt:   { label: 'Umgesetzt',    farbe: 'text-green-600', symbol: '✓' },
  in_arbeit:   { label: 'In Arbeit',    farbe: 'text-blue-600',  symbol: '◑' },
  geplant:     { label: 'Geplant',      farbe: 'text-gray-500',  symbol: '○' },
  ueberfaellig:{ label: 'Überfällig!',  farbe: 'text-red-600',   symbol: '!' },
}

const BAUSTEINE: SchutzBaustein[] = [
  {
    id: 'sk1', bereich: 'risiko', letzteUeberarbeitung: '01.03.2026',
    titel: 'Risikoanalyse Einrichtung',
    zusammenfassung: 'Jährliche Analyse potenzieller Gefährdungsrisiken in Räumen, beim Personal und in der pädagogischen Arbeit gemäß §§8a/8b SGB VIII.',
    massnahmen: [
      { titel: 'Risikoanalyse Außengelände', beschreibung: 'Jährliche Begehung und Protokoll', verantwortlich: 'Leitung', frist: '30.04.2026', status: 'umgesetzt' },
      { titel: 'Personaleinsatz Risikofelder', beschreibung: 'Regelung 4-Augen-Prinzip', verantwortlich: 'Leitung', frist: '31.03.2026', status: 'umgesetzt' },
      { titel: 'Jährliche Aktualisierung Risikoanalyse', beschreibung: 'Dokumentation & Freigabe Träger', verantwortlich: 'Leitung', frist: '01.06.2026', status: 'geplant' },
    ],
  },
  {
    id: 'sk2', bereich: 'praevention', letzteUeberarbeitung: '15.02.2026',
    titel: 'Präventionsmaßnahmen & Kinderschutzkonzept',
    zusammenfassung: 'Aktive Präventionsarbeit: Partizipation, Beschwerdemanagement, Körperautonomie, Sexualpädagogik altersgerecht.',
    massnahmen: [
      { titel: 'Kindgerechtes Beschwerdemanagement einführen', beschreibung: 'Kummerkasten + Kinder-Konferenz', verantwortlich: 'Fr. Bauer', frist: '15.05.2026', status: 'in_arbeit' },
      { titel: 'Partizipation in Alltagsroutinen', beschreibung: 'Morgenkreis, Abstimmungen, Regeln', verantwortlich: 'Team', frist: '01.04.2026', status: 'umgesetzt' },
      { titel: 'Elterninformation Schutzkonzept', beschreibung: 'Elternabend-Präsentation', verantwortlich: 'Leitung', frist: '20.05.2026', status: 'geplant' },
    ],
  },
  {
    id: 'sk3', bereich: 'schulung', letzteUeberarbeitung: '10.01.2026',
    titel: 'Fortbildung & Schulung Personal',
    zusammenfassung: 'Alle Mitarbeitenden erhalten jährlich Schulungen zu Kinderschutz, Kindeswohlgefährdung und Handlungsabläufen gemäß §8a SGB VIII.',
    massnahmen: [
      { titel: 'Jahresschulung Kinderschutz 2026', beschreibung: 'Extern: Caritas Fachberatung', verantwortlich: 'Leitung', frist: '30.04.2026', status: 'ueberfaellig' },
      { titel: 'Neues Personal Einweisung §8a', beschreibung: 'Onboarding-Checkliste Schutzkonzept', verantwortlich: 'Leitung', frist: 'laufend', status: 'umgesetzt' },
    ],
  },
  {
    id: 'sk4', bereich: 'kodex', letzteUeberarbeitung: '01.09.2025',
    titel: 'Verhaltenskodex & Selbstverpflichtung',
    zusammenfassung: 'Alle Mitarbeitenden unterzeichnen den Verhaltenskodex. Regelungen zu Nähe/Distanz, Sprache, Fotos, Ausflüge, Kommunikation.',
    massnahmen: [
      { titel: 'Verhaltenskodex aktualisieren 2025/26', beschreibung: 'Überarbeitung mit Fachberatung', verantwortlich: 'Leitung', frist: '01.09.2025', status: 'umgesetzt' },
      { titel: 'Unterschriften aller Mitarbeitenden', beschreibung: 'Dokumentation in Personalakte', verantwortlich: 'Leitung', frist: '30.09.2025', status: 'umgesetzt' },
    ],
  },
]

export default function SchutzkonzeptPage() {
  const [expanded, setExpanded] = useState<string | null>('sk1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const alleMassnahmen = BAUSTEINE.flatMap(b => b.massnahmen)
  const umgesetzt = alleMassnahmen.filter(m => m.status === 'umgesetzt').length
  const ueberfaellig = alleMassnahmen.filter(m => m.status === 'ueberfaellig').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${BAUSTEINE.length} Schutzkonzept-Bausteine erfasst: ${umgesetzt}/${alleMassnahmen.length} Maßnahmen umgesetzt. ${ueberfaellig > 0 ? `⚠ ${ueberfaellig} Maßnahme überfällig — Jahresschulung §8a sofort planen!` : 'Kein unmittelbarer Handlungsbedarf.'} Verhaltenskodex & Risikoanalyse aktuell.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-500" /> Schutzkonzept
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Kinderschutz §§8a/8b SGB VIII · Risikoanalyse</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bausteine',    val: BAUSTEINE.length, color: 'text-teal-700' },
          { label: 'Umgesetzt',    val: umgesetzt, color: 'text-green-600' },
          { label: 'Überfällig',   val: ueberfaellig, color: ueberfaellig > 0 ? 'text-red-600' : 'text-gray-400' },
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
          <p className="text-[10px] text-red-700 font-semibold">{ueberfaellig} Schutzkonzept-Maßnahme überfällig — sofortiger Handlungsbedarf!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Schutzkonzept-Check</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Schutzkonzept-Check'}
        </button>
      )}

      <div className="space-y-2">
        {BAUSTEINE.map(b => {
          const isOpen = expanded === b.id
          const bereichCfg = BEREICH_CFG[b.bereich]
          const erledigtCount = b.massnahmen.filter(m => m.status === 'umgesetzt').length
          const pct = Math.round(erledigtCount / b.massnahmen.length * 100)
          const hatUeberfaellig = b.massnahmen.some(m => m.status === 'ueberfaellig')
          return (
            <div key={b.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${hatUeberfaellig ? 'bg-red-100' : 'bg-teal-100'}`}>
                  <Shield className={`w-4 h-4 ${hatUeberfaellig ? 'text-red-500' : 'text-teal-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bereichCfg.farbe}`}>{bereichCfg.label}</span>
                    <span className="text-[8px] text-teal-400">Rev. {b.letzteUeberarbeitung}</span>
                    {hatUeberfaellig && <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{b.titel}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-teal-100">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[9px] text-teal-400">{erledigtCount}/{b.massnahmen.length}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  <p className="text-[10px] text-teal-700 leading-relaxed mb-2">{b.zusammenfassung}</p>
                  {b.massnahmen.map((m, i) => {
                    const stCfg = STATUS_CFG[m.status]
                    return (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5">
                          <span className={`text-[10px] font-bold shrink-0 ${stCfg.farbe}`}>{stCfg.symbol}</span>
                          <div>
                            <p className="text-[10px] text-teal-900 font-medium">{m.titel}</p>
                            <p className="text-[9px] text-teal-400">{m.verantwortlich} · {m.frist}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-semibold shrink-0 ${stCfg.farbe}`}>{stCfg.label}</span>
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
