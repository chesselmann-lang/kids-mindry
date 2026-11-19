'use client'

import { useState } from 'react'
import { UserPlus, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Einarbeitung — kids-mindry ─────────────────────────────────────────────────
// Neue Mitarbeiter · Onboarding · Probezeit · Mentor · Checklisten

type EinarbTyp = 'erzieher' | 'leitung' | 'springer' | 'praktikant' | 'hauswirtschaft' | 'ehrenamt' | 'fsk'
type EinarbStatus = 'aktiv' | 'abgeschlossen' | 'geplant' | 'probezeit' | 'faellig'

interface EinarbEintrag {
  id: string
  typ: EinarbTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: EinarbStatus
  punkte: string[]
}

const TYP_CFG: Record<EinarbTyp, { label: string; farbe: string }> = {
  erzieher:     { label: 'Erzieher:in',       farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  leitung:      { label: 'Leitung/Stv.',      farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  springer:     { label: 'Springer:in',       farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  praktikant:   { label: 'Praktikant:in',     farbe: 'bg-green-50 text-green-700 border-green-200' },
  hauswirtschaft:{ label: 'Hauswirtschaft',   farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  ehrenamt:     { label: 'Ehrenamt',          farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  fsk:          { label: 'FSK / BFD',         farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<EinarbStatus, { label: string; farbe: string }> = {
  aktiv:        { label: 'Aktiv',         farbe: 'text-teal-600' },
  abgeschlossen:{ label: 'Abgeschl.',     farbe: 'text-gray-400' },
  geplant:      { label: 'Geplant',       farbe: 'text-blue-400' },
  probezeit:    { label: 'Probezeit',     farbe: 'text-orange-500' },
  faellig:      { label: 'Fällig',        farbe: 'text-red-500' },
}

const EINTRAEGE: EinarbEintrag[] = [
  {
    id: 'ea1', typ: 'erzieher', titel: 'Neue Erzieher:innen SJ 2025/26',
    datum: 'Start Sep 2025', verantwortlich: 'KiTa-Leitung + Mentorinnen', status: 'aktiv',
    punkte: [
      'Fr. Nowak: Gruppe Schmetterlinge (seit 01.09.25, Probezeit läuft gut)',
      'Hr. Diaz: Gruppe Löwen (seit 01.11.25, Einarbeitungsplan woche 25/26)',
      'Mentor:innen: Fr. Hoffmann (Nowak), Fr. Reinhardt (Diaz)',
      'Checkliste Einarbeitung: 90% abgehakt (beide), Notfallplan + Hygiene offen',
      'Probezeitgespräch: Fr. Nowak 15.05. (6 Monate), Hr. Diaz Jul',
    ],
  },
  {
    id: 'ea2', typ: 'praktikant', titel: 'Praktikant:innen & Anerkennungsjahr',
    datum: 'Lfd. SJ', verantwortlich: 'Praxismentorin Fr. Koch', status: 'aktiv',
    punkte: [
      'Anerkennungsjahr: Fr. Bauer (Fachschule Sozialpädagogik, seit Aug 2025)',
      'Praktikum SPS I: 2 Schüler:innen (BK Sozialpädagogik, ab 12.05. 4 Wochen)',
      'Praxismentorin: Fr. Koch (zertifiziert, 2h Entlastung/Woche)',
      'Anleitungsgespräche: wöchentlich (Protokoll im Ordner "Praxis")',
      'Abschlussgespräch Fr. Bauer: Jul 2026 (mit Schulformblatt)',
    ],
  },
  {
    id: 'ea3', typ: 'fsk', titel: 'FSK / BFD / Ehrenamt',
    datum: 'Lfd. SJ', verantwortlich: 'KiTa-Leitung', status: 'aktiv',
    punkte: [
      'FSK (Freiwilliges Soziales Jahr): 2 Personen (1. + 2. Halbjahr)',
      'BFD (Bundesfreiwilligendienst): 1 Person (Hr. Schmidt, bis Aug 2026)',
      'Einführungsseminar: alle 3 abgeschlossen (Träger AWO)',
      'Aufgaben: Gruppenunterstützung, Ausflüge, Hofaufsicht (kein Alleinaufsicht)',
      'Ehrenamtliche: 3 Personen (Vorlesestunde Di, Elterncafé, Garten)',
    ],
  },
  {
    id: 'ea4', typ: 'springer', titel: 'Einarbeitungsplan & Onboarding-Struktur',
    datum: 'Immer aktuell halten', verantwortlich: 'KiTa-Leitung', status: 'faellig',
    punkte: [
      'Onboarding-Ordner: überarbeiten! (letzte Version Okt 2023, veraltet)',
      'Inhalt: Hausordnung, Konzept, Notfallplan, Hygieneplan, Dienstplan-Einführung',
      'Digitale Version: KiTa-App (Mitarbeiter-Bereich) — noch nicht eingestellt',
      'Erste-Hilfe-Nachweis: alle neuen MA vor Aufnahme in Gruppe (Hr. Diaz ausstehend!)',
      'Ziel: neuer Onboarding-Ordner bis 01.06. (Leitung + Fr. Koch)',
    ],
  },
  {
    id: 'ea5', typ: 'hauswirtschaft', titel: 'Hauswirtschaft & neue Springer:innen',
    datum: 'Lfd.', verantwortlich: 'KiTa-Leitung', status: 'geplant',
    punkte: [
      'Springer-Pool: 3 Springer:innen (Vertretungspool Träger AWO)',
      'Neue Springer Fr. Arndt: Einführung 06.05. (Hausführung + Konzept)',
      'Hauswirtschaft: Fr. Meier neu seit Apr (Einarbeitung Küche abgeschlossen)',
      'HACCP-Unterweisung: Fr. Meier + 2 weitere MA (fällig bis Mai)',
      'Vertretungsplan Sommer: vorbereiten für Urlaubszeit Jul/Aug',
    ],
  },
]

export default function EinarbeitungPage() {
  const [expanded, setExpanded] = useState<string | null>('ea4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Onboarding-Ordner veraltet (bis 01.06. neu!). Hr. Diaz Erste Hilfe ausstehend! Probezeit Fr. Nowak 15.05. HACCP fällig Mai.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <UserPlus className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Einarbeitung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Neue MA · Onboarding · Praktikum · FSK · Springer</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Aktiv',     val: EINTRAEGE.filter(e => e.status === 'aktiv').length, color: '#0d9488' },
          { label: 'Neue MA',   val: 5, color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Onboarding-Ordner bis 01.06. — Hr. Diaz Erste Hilfe ausstehend! — Probezeit Fr. Nowak 15.05.</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Einarbeitungsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Einarbeitungsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {e.punkte.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{p}</p>
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
