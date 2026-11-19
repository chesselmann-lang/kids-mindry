'use client'

import { useState } from 'react'
import { HeartHandshake, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Elternzusammenarbeit — Mindry Kids Admin ──────────────────────────────────
// Elternarbeit · Veranstaltungen · Elternbeirat · Kommunikation · §9 KiTaG

type ElternAktivitaet = 'elternabend' | 'elternbeirat' | 'infoveranstaltung' | 'ehrenamt' | 'workshop' | 'gespraech' | 'newsletter'
type AktivitaetStatus = 'geplant' | 'laufend' | 'abgeschlossen' | 'abgesagt'

interface ElternAktion {
  id: string
  typ: ElternAktivitaet
  titel: string
  datum: string
  status: AktivitaetStatus
  zielgruppe?: string
  ort?: string
  teilnehmer?: number
  verantwortlich?: string
  beschreibung: string
  ergebnis?: string
  notiz?: string
  wichtig?: boolean
}

const TYP_CFG: Record<ElternAktivitaet, { label: string; emoji: string; farbe: string }> = {
  elternabend:      { label: 'Elternabend',      emoji: '👨‍👩‍👧', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  elternbeirat:     { label: 'Elternbeirat',     emoji: '🏛️', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  infoveranstaltung:{ label: 'Infoveranstaltung', emoji: '📢', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  ehrenamt:         { label: 'Ehrenamt',          emoji: '🙌', farbe: 'bg-green-50 text-green-700 border-green-200' },
  workshop:         { label: 'Workshop',          emoji: '🛠️', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  gespraech:        { label: 'Gespräch',          emoji: '💬', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  newsletter:       { label: 'Newsletter',        emoji: '📧', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const STATUS_CFG: Record<AktivitaetStatus, { label: string; farbe: string }> = {
  geplant:      { label: 'Geplant',      farbe: 'text-gray-400' },
  laufend:      { label: 'Laufend',      farbe: 'text-blue-600' },
  abgeschlossen:{ label: 'Abgeschlossen', farbe: 'text-green-600' },
  abgesagt:     { label: 'Abgesagt',     farbe: 'text-red-500' },
}

const AKTIONEN: ElternAktion[] = [
  {
    id: 'ez1', typ: 'elternabend', titel: 'Elternabend — Bildungspläne & Jahresrückblick',
    datum: '08.05.2026', status: 'geplant', zielgruppe: 'Alle Eltern',
    ort: 'Multifunktionsraum', verantwortlich: 'Fr. Maier',
    beschreibung: 'Jährlicher Elternabend: Vorstellung Bildungspläne, Jahresrückblick, Ausblick auf das neue Kitajahr. Neuwahl Elternbeirat.',
    wichtig: true,
    notiz: 'Einladungen noch nicht versandt — bis 24.04.!',
  },
  {
    id: 'ez2', typ: 'elternbeirat', titel: 'Elternbeiratssitzung April',
    datum: '29.04.2026', status: 'geplant', verantwortlich: 'Fr. Schmidt (EB-Vors.)',
    zielgruppe: 'Elternbeirat (7 Mitgl.)',
    ort: 'Leitungsbüro',
    beschreibung: 'Regularien: Finanzbericht Elternbeiratskasse, Planung Sommerfest, Rückmeldung zur neuen Beitragsordnung.',
  },
  {
    id: 'ez3', typ: 'workshop', titel: 'Medienworkshop für Eltern',
    datum: '15.04.2026', status: 'abgeschlossen', teilnehmer: 12,
    ort: 'Gruppenraum 1', verantwortlich: 'Hr. Link (extern)',
    beschreibung: 'Workshop zur altersgerechten Mediennutzung für Kinder unter 6. Praktische Tipps zur Bildschirmzeit.',
    ergebnis: '12 Eltern, sehr positives Feedback. Wunsch nach Folgeformat.',
  },
  {
    id: 'ez4', typ: 'newsletter', titel: 'April-Newsletter an alle Familien',
    datum: '20.04.2026', status: 'abgeschlossen', teilnehmer: 38,
    verantwortlich: 'Fr. Klein',
    beschreibung: 'Monatlicher Newsletter: Termine Mai, Fotorückblick April, Hinweis Elternabend, Impfinfo Jugendamt.',
    ergebnis: 'An 38 Familien versandt. Öffnungsrate 71% (laut App-Statistik).',
  },
  {
    id: 'ez5', typ: 'ehrenamt', titel: 'Ehrenamtliche Gartenarbeit',
    datum: '03.05.2026', status: 'geplant', zielgruppe: 'Interessierte Eltern',
    ort: 'Außengelände',
    beschreibung: 'Gemeinsamer Arbeitseinsatz: Beetpflege, Sandkasten reinigen, Klettergerüst sichern. Frühstück für alle Helfer.',
    verantwortlich: 'Hr. Bauer (EB)',
  },
]

export default function ElternzusammenarbeitPage() {
  const [expanded, setExpanded] = useState<string | null>('ez1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const geplant = AKTIONEN.filter(a => a.status === 'geplant').length
  const abgeschlossen = AKTIONEN.filter(a => a.status === 'abgeschlossen').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${AKTIONEN.length} Elternaktivitäten: ${geplant} geplant, ${abgeschlossen} abgeschlossen. Elternabend 08.05. — Einladungen ausstehend! Medienworkshop erfolgreich: Folgeformat gewünscht.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-teal-500" /> Elternzusammenarbeit
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Elternarbeit · Elternbeirat · Veranstaltungen · §9 KiTaG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Gesamt',       val: AKTIONEN.length, color: 'text-teal-700' },
          { label: 'Geplant',      val: geplant,          color: 'text-blue-600' },
          { label: 'Abgeschl.',    val: abgeschlossen,    color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {AKTIONEN.some(a => a.notiz?.includes('!')) && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Ausstehende Elternkommunikation — Einladungen versenden!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Elternübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Elternübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {AKTIONEN.map(a => {
          const isOpen = expanded === a.id
          const tCfg = TYP_CFG[a.typ]
          const sCfg = STATUS_CFG[a.status]
          return (
            <div key={a.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {a.wichtig && <span className="text-[8px] text-orange-500 font-bold">⚡ Wichtig</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{a.titel}</p>
                  <p className="text-[9px] text-teal-400">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />{a.datum}
                    {a.ort ? ` · ${a.ort}` : ''}
                    {a.teilnehmer ? ` · ${a.teilnehmer} TN` : ''}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-700 leading-relaxed">{a.beschreibung}</p>
                  {a.zielgruppe && <p className="text-[8px] text-teal-400">Zielgruppe: {a.zielgruppe}</p>}
                  {a.verantwortlich && <p className="text-[8px] text-teal-400">Verantwortlich: {a.verantwortlich}</p>}
                  {a.ergebnis && (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-green-700 font-semibold">✓ {a.ergebnis}</p>
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
