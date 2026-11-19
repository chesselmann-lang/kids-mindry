'use client'

import { useState } from 'react'
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Sicherheitsprotokoll — kids-mindry ─────────────────────────────────────────
// Unfallberichte · Brandschutz · Notfallplan · Sicherheitsbegehungen

type SicherheitsTyp = 'unfall' | 'brandschutz' | 'notfallplan' | 'begehung' | 'einbruch' | 'gesundheit' | 'datenschutz'
type SicherheitsStatus = 'erledigt' | 'offen' | 'in_bearbeitung' | 'faellig' | 'kritisch'

interface SicherheitsEintrag {
  id: string
  typ: SicherheitsTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: SicherheitsStatus
  faellig?: string
  massnahmen: string[]
}

const TYP_CFG: Record<SicherheitsTyp, { label: string; emoji: string; farbe: string }> = {
  unfall:       { label: 'Unfall/Zwischenfall',  emoji: '🩹', farbe: 'bg-red-50 text-red-700 border-red-200' },
  brandschutz:  { label: 'Brandschutz',          emoji: '🔥', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  notfallplan:  { label: 'Notfallplan',          emoji: '🚨', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  begehung:     { label: 'Sicherheitsbegehung',  emoji: '🔍', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  einbruch:     { label: 'Einbruch/Diebstahl',   emoji: '🔒', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  gesundheit:   { label: 'Gesundheitsschutz',    emoji: '💊', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  datenschutz:  { label: 'Datenschutz',          emoji: '🛡️', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<SicherheitsStatus, { label: string; farbe: string }> = {
  erledigt:      { label: 'Erledigt',       farbe: 'text-green-600' },
  offen:         { label: 'Offen',          farbe: 'text-blue-500' },
  in_bearbeitung:{ label: 'In Bearbeitung', farbe: 'text-orange-500' },
  faellig:       { label: 'Fällig!',        farbe: 'text-red-600' },
  kritisch:      { label: 'Kritisch!',      farbe: 'text-red-700' },
}

const EINTRAEGE: SicherheitsEintrag[] = [
  {
    id: 'sp1', typ: 'brandschutz', titel: 'Brandschutzübung Frühjahr 2026',
    datum: '08.04.2026', verantwortlich: 'Leitung + Brandschutzbeauftragter Hr. Kroll',
    status: 'erledigt',
    massnahmen: ['Übung durchgeführt: 08.04.2026, 10:15 Uhr', 'Evakuierungszeit: 2:45 min (Ziel: unter 3 min) ✓', 'Alle 42 Kinder + 8 Mitarbeiter:innen erfasst', 'Protokoll: unterschrieben + Amt gemeldet', 'Nächste Übung: Herbst 2026 (Okt/Nov)'],
  },
  {
    id: 'sp2', typ: 'begehung', titel: 'Jährliche Sicherheitsbegehung — Träger + Behörde',
    datum: 'Jun 2026', verantwortlich: 'Leitung + AWO-Sicherheitsbeauftragte',
    status: 'faellig', faellig: 'Jun 2026',
    massnahmen: ['Termin: noch nicht festgelegt (Träger anfragen!)', 'Letzte Begehung: Jun 2025 (2 Mängel behoben)', 'Prüfpunkte: Fluchtwege, Beleuchtung, Erste Hilfe, Spielzeug', 'Checkliste: Ablage /sicherheit/begehung-checkliste.pdf', 'Mängelprotokoll: bis 4 Wochen nach Termin'],
  },
  {
    id: 'sp3', typ: 'unfall', titel: 'Unfallmeldung: Platzsturz Außenbereich (23.04.)',
    datum: '23.04.2026', verantwortlich: 'Fr. Müller (Diensthabend)',
    status: 'in_bearbeitung',
    massnahmen: ['Kind (3 J., Name in Akte): Sturz vom Klettergerüst', 'Verletzung: Schürfwunde Knie, kein Arztbesuch nötig', 'Erstversorgung: sofort durch Fr. Müller (Ersthelfer)', 'Eltern informiert: telefonisch 23.04. 11:45 Uhr', 'Unfallmeldung GUV: bis 3 Werktage (bis 28.04. fällig)', 'Klettergerüst-Inspektion: eingeleitet (Schraube locker)'],
  },
  {
    id: 'sp4', typ: 'notfallplan', titel: 'Notfallplan aktuell — Sj. 2025/26',
    verantwortlich: 'Leitung', status: 'erledigt', datum: 'Sep 2025',
    massnahmen: ['Notfallplan: aktualisiert Sep 2025', 'Notrufnummern: ausgehängt (Gruppenräume + Küche)', 'Erste-Hilfe-Kurs: 6 Mitarbeiter:innen (zertifiziert)', 'Nächste Erste-Hilfe-Auffrischung: Feb 2027 (Termine eingetragen)', 'Giftige Pflanzen Außengelände: Bestandscheck Mai 2026 geplant'],
  },
  {
    id: 'sp5', typ: 'gesundheit', titel: '§34 IfSG Meldepflicht — Scharlach Apr 2026',
    datum: '19.04.2026', verantwortlich: 'Leitung',
    status: 'in_bearbeitung',
    massnahmen: ['2 Kinder: Scharlach-Diagnose (19.04.2026)', 'Gesundheitsamt informiert: 19.04. (telefonisch + schriftlich)', 'Eltern aller Kinder: Informationsschreiben 20.04.', 'Wiederzulassung: nach Attest (frühestens 24h nach Antibiose-Start)', 'Desinfektion Kontaktflächen: durchgeführt 20.04.'],
  },
]

export default function SicherheitsprotokollPage() {
  const [expanded, setExpanded] = useState<string | null>('sp3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const kritisch = EINTRAEGE.filter(e => e.status === 'kritisch' || e.status === 'faellig').length
  const offen = EINTRAEGE.filter(e => e.status === 'offen' || e.status === 'in_bearbeitung').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Protokolleinträge. Unfallmeldung GUV: bis 28.04. fällig. Sicherheitsbegehung Jun 2026: Termin noch offen. Scharlach: 2 Kinder, Eltern informiert.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShieldCheck className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Sicherheitsprotokoll
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Brandschutz · Unfälle · Notfallplan · Begehungen · §34 IfSG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Protokolle',  val: EINTRAEGE.length, color: 'text-teal-600' },
          { label: 'Offen',       val: offen,            color: offen > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Fällig',      val: kritisch,         color: kritisch > 0 ? 'text-red-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-red-50 border border-red-100">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <p className="text-[10px] text-red-700 font-semibold">Unfallmeldung GUV: bis 28.04. einreichen! Sicherheitsbegehung: Termin festlegen!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Sicherheitsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Sicherheitsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'faellig' || e.status === 'kritisch' ? 'rgb(252 165 165)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}{e.faellig ? ` · Fällig: ${e.faellig}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {e.massnahmen.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{m}</p>
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
