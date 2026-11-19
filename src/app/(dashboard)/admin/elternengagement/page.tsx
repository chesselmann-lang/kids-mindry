'use client'

import { useState } from 'react'
import { Heart, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Elternengagement — kids-mindry ─────────────────────────────────────────────
// Elternabend · Elternbeirat · Mitarbeit · Beschwerden · Digitale Kommunikation

type ElternTyp = 'elternabend' | 'beirat' | 'hospitationen' | 'kommunikation' | 'beschwerden' | 'mitarbeit' | 'info'
type ElternStatus = 'aktiv' | 'geplant' | 'laufend' | 'abgeschlossen' | 'handlungsbedarf'

interface ElternEintrag {
  id: string
  typ: ElternTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: ElternStatus
  punkte: string[]
}

const TYP_CFG: Record<ElternTyp, { label: string; emoji: string; farbe: string }> = {
  elternabend:  { label: 'Elternabend',       emoji: '👨‍👩‍👧', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  beirat:       { label: 'Elternbeirat',      emoji: '🗳️', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  hospitationen:{ label: 'Hospitationen',     emoji: '👀', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  kommunikation:{ label: 'Kommunikation',     emoji: '📱', farbe: 'bg-green-50 text-green-700 border-green-200' },
  beschwerden:  { label: 'Beschwerdemanag.',  emoji: '📬', farbe: 'bg-red-50 text-red-700 border-red-200' },
  mitarbeit:    { label: 'Aktive Mitarbeit',  emoji: '🤲', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  info:         { label: 'Elterninfos',       emoji: '📄', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<ElternStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  laufend:        { label: 'Laufend',         farbe: 'text-blue-500' },
  abgeschlossen:  { label: 'Abgeschlossen',   farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: ElternEintrag[] = [
  {
    id: 'ee1', typ: 'elternabend', titel: 'Gruppenelternabende SJ 2025/26',
    datum: 'Letzter: Apr, nächster: Jun', verantwortlich: 'Gruppenerzieher:innen', status: 'aktiv',
    punkte: ['Apr-Elternabend: 27/32 TN (84% Beteiligung — sehr gut)', 'Themen: Eingewöhnung U3-Kinder, Sommerfest 20.06., Übergabe GS', 'Protokoll: im Gruppenordner (DSGVO-konform)', 'Jun-Elternabend: geplant 11.06.2026 (Abschlussthemen)', 'Dolmetscher Apr: freiwillige Elternteile (Türkisch, Arabisch)'],
  },
  {
    id: 'ee2', typ: 'beirat', titel: 'Elternbeirat Kita',
    datum: 'Amtszeit bis Sep 2026', verantwortlich: 'Elternbeirat + SL', status: 'aktiv',
    punkte: ['Elternbeirat: 5 gewählte Mitglieder (Vorsitz: Fr. Müller)', 'Sitzungsrhythmus: 6-wöchentlich (nächste Sitzung 08.05.)', 'Beteiligungsrechte: § 9 KiBiz (Information, Beratung, Mitbestimmung)', 'Sommerfest-Mitwirkung: EB koordiniert Getränketheke + Kuchen', 'EB-Protokolle: aushängen (Flur) + digital (Eltern-App)'],
  },
  {
    id: 'ee3', typ: 'hospitationen', titel: 'Elternhospitationen',
    datum: 'Auf Anfrage, jederzeit', verantwortlich: 'Gruppenerzieher:innen', status: 'aktiv',
    punkte: ['Hospitationen: jederzeit möglich (Anmeldung 1 Tag vorher)', 'Apr: 4 Hospitationen durchgeführt (U3- und Ü3-Gruppen)', 'Hospitations-Feedback: Gespräch nach Hospitation (30 min)', 'Fotos während Hospitation: nur eigenes Kind (DSGVO-Hinweis)', 'Tür-und-Angel-Gespräche: täglich Bring-/Abholphase'],
  },
  {
    id: 'ee4', typ: 'kommunikation', titel: 'Digitale Elternkommunikation',
    datum: 'Laufend', verantwortlich: 'Alle Erzieher:innen', status: 'laufend',
    punkte: ['App: Kindertagesstätten-App (95% Eltern aktiv)', 'Elternbriefe digital: 2x/Monat (PDF via App)', 'Tagesfotos: täglich 2–3 Fotos (DSGVO-Freigabe vorhanden)', 'Rücklaufquote digitale Formulare: 88% (sehr gut)', 'Technische Probleme: an Sekretariat melden (Ticket-System)'],
  },
  {
    id: 'ee5', typ: 'beschwerden', titel: 'Beschwerdemanagement Eltern',
    datum: 'Laufend', verantwortlich: 'SL (Erstanlaufstelle)', status: 'aktiv',
    punkte: ['Beschwerden Apr: 1 (Portionsgröße U3 — in Bearbeitung, ab Mai +20%)', 'Beschwerde-Eingang: App, persönlich, schriftlich (alle Wege)', 'Rückmeldung: innerhalb 5 Werktagen (Standard)', 'Eskalation: Träger als 2. Instanz (bei Nichteinigung)', 'Dokumentation: Beschwerdeformular (Büro SL)'],
  },
]

export default function ElternengagementPage() {
  const [expanded, setExpanded] = useState<string | null>('ee2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Elternengagement-Bereiche. Elternabend Apr: 84% Beteiligung. Beirat aktiv (5 Mitglieder). App-Nutzung 95%. Jun-Elternabend 11.06.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Heart className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Elternengagement
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Elternabend · Beirat · Hospitationen · Kommunikation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche', val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'Aktiv',    val: EINTRAEGE.filter(e => e.status === 'aktiv' || e.status === 'laufend').length, color: 'text-teal-600' },
          { label: 'Beteiligung', val: '84%', color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(240 253 250)', border: '1px solid rgb(153 246 228)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <p className="text-[10px] text-teal-700 font-semibold">Elternbeirat-Sitzung 08.05. — Jun-Elternabend 11.06. vorbereiten!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Elternübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Elternübersicht'}
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
