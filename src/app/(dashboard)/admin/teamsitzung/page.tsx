'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Teamsitzungen — kids-mindry ────────────────────────────────────────────────
// Teamkonferenz · Fachbereich · Supervision · Klausurtag · Protokolle

type TeamTyp = 'konferenz' | 'fachbereich' | 'supervision' | 'klausurtag' | 'protokoll' | 'dienstbesprechung' | 'intervision'
type TeamStatus = 'aktiv' | 'geplant' | 'laufend' | 'abgeschlossen' | 'handlungsbedarf'

interface TeamEintrag {
  id: string
  typ: TeamTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: TeamStatus
  punkte: string[]
}

const TYP_CFG: Record<TeamTyp, { label: string; emoji: string; farbe: string }> = {
  konferenz:       { label: 'Teamkonferenz',       emoji: '🧑‍🤝‍🧑', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  fachbereich:     { label: 'Fachbereichstreffen', emoji: '📋', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  supervision:     { label: 'Supervision',         emoji: '🌿', farbe: 'bg-green-50 text-green-700 border-green-200' },
  klausurtag:      { label: 'Klausurtag',          emoji: '🏕️', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  protokoll:       { label: 'Protokollführung',    emoji: '✏️', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  dienstbesprechung:{ label: 'Dienstbesprechung',  emoji: '📢', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  intervision:     { label: 'Intervision',         emoji: '🔄', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
}

const STATUS_CFG: Record<TeamStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  laufend:        { label: 'Laufend',         farbe: 'text-blue-500' },
  abgeschlossen:  { label: 'Abgeschlossen',   farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: TeamEintrag[] = [
  {
    id: 'ts1', typ: 'konferenz', titel: 'Wöchentliche Teamkonferenz',
    datum: 'Mo 7:30 Uhr (45 min)', verantwortlich: 'SL (Moderation)', status: 'aktiv',
    punkte: ['Teamkonferenz: wöchentlich Mo 7:30 vor Dienstbeginn (45 min)', 'Struktur: Informationen SL → Fallbesprechungen → Aufgaben', 'Protokoll: rotierend (je 1 Erzieher:in/Woche)', 'Vertretung SL: stellv. SL Fr. Braun (bei Abwesenheit)', 'Anwesenheitspflicht: alle Vollzeitkräfte (TZ nach Absprache)'],
  },
  {
    id: 'ts2', typ: 'fachbereich', titel: 'Fachbereichstreffen',
    datum: 'Monatlich (letzter Di)', verantwortlich: 'Fachbereichsleitungen', status: 'aktiv',
    punkte: ['Fachbereiche: U3 · Ü3 · Inklusion · Sprachförderung', 'Treffen: monatlich, letzter Di, 14:00–15:30 (nach Kinder-Abholzeit)', 'Inhalte: Pädagogik · Förderpläne · Beobachtungen · Material', 'Ergebnisse: fließen in Teamkonferenz ein (Kurzbericht)', 'Nächstes Treffen: 28.04.2026 (Fachbereich Ü3 + Inklusion)'],
  },
  {
    id: 'ts3', typ: 'supervision', titel: 'Externe Teamsupervision',
    datum: 'Alle 6 Wochen', verantwortlich: 'Externe Supervisorin Fr. Wolf', status: 'laufend',
    punkte: ['Supervisorin: Fr. Wolf (zertifiziert, seit 2023)', 'Rhythmus: alle 6 Wochen, 2h (nächster Termin: 14.05.)', 'Teilnahme: gesamtes Kita-Team (verpflichtend, Arbeitszeit)', 'Fokus SJ 2025/26: Übergänge + Fallbesprechungen § 8a', 'Supervision wird durch Träger finanziert (jährl. 2.000 €)'],
  },
  {
    id: 'ts4', typ: 'klausurtag', titel: 'Klausurtag / Teamtag',
    datum: '17.07.2026', verantwortlich: 'SL + Team', status: 'geplant',
    punkte: ['Klausurtag: 17.07.2026 (Freitag vor Sommerferien)', 'Ort: Bildungshaus Wuppertal (gebucht)', 'Programm: Jahresrückblick + Konzeptentwicklung + Teambuilding', 'Notbetreuung: Kita geschlossen (Eltern bis 30.04. informiert)', 'Vorbereitung: Abfrage Themen bis 30.05. (alle TN)'],
  },
  {
    id: 'ts5', typ: 'protokoll', titel: 'Protokollführung & Dokumentation',
    datum: 'Laufend', verantwortlich: 'Rotierende Protokollant:innen', status: 'aktiv',
    punkte: ['Protokolle: innerhalb 3 Tage nach Sitzung (Digital, Ordner)', 'Aufbewahrung: 10 Jahre (gesetzl. Vorgabe, DSGVO-konform)', 'Schweigepflicht: Protokolle mit Fallbezug — nur Beteiligte', 'Unterschrift: alle TN nach Genehmigung in Folgesitzung', 'Archiv digital: verschlüsselt auf Kita-Server'],
  },
]

export default function TeamsitzungPage() {
  const [expanded, setExpanded] = useState<string | null>('ts1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Team-Bereiche. Teamkonferenz wöchentlich (Mo 7:30). Supervision 14.05. Fachbereichstreffen 28.04. Klausurtag 17.07. (Bildungshaus).`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Teamsitzungen
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Konferenz · Fachbereich · Supervision · Klausurtag</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche', val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'Aktiv',    val: EINTRAEGE.filter(e => e.status === 'aktiv' || e.status === 'laufend').length, color: 'text-teal-600' },
          { label: 'Geplant',  val: EINTRAEGE.filter(e => e.status === 'geplant').length, color: 'text-purple-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(240 253 250)', border: '1px solid rgb(153 246 228)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <p className="text-[10px] text-teal-700 font-semibold">Fachbereichstreffen 28.04. — Supervision 14.05. — Klausurtag-Themenabfrage bis 30.05.!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Teamübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Teamübersicht'}
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
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
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
