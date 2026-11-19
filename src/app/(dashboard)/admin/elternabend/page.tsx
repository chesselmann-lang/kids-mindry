'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

// ── Elternabend — kids-mindry ──────────────────────────────────────────────────
// Elternabende · Protokolle · Einladungen · Rückmeldungen

type ElternabendTyp = 'gruppenabend' | 'gesamtelternabend' | 'themenabend' | 'praesentation' | 'aktion' | 'digital' | 'erstgespraech'
type ElternabendStatus = 'geplant' | 'eingeladen' | 'durchgefuehrt' | 'protokolliert' | 'abgesagt'

interface ElternabendEintrag {
  id: string
  typ: ElternabendTyp
  thema: string
  datum: string
  gruppe: string
  status: ElternabendStatus
  anwesend?: number
  eingeladen?: number
  verantwortlich: string
  wichtig?: boolean
  punkte: string[]
}

const TYP_CFG: Record<ElternabendTyp, { label: string; emoji: string; farbe: string }> = {
  gruppenabend:       { label: 'Gruppenabend',      emoji: '👨‍👩‍👧', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  gesamtelternabend:  { label: 'Gesamtelternabend', emoji: '🏠', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  themenabend:        { label: 'Themenabend',       emoji: '💡', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  praesentation:      { label: 'Präsentation',      emoji: '📊', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  aktion:             { label: 'Mitmach-Aktion',    emoji: '🎨', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  digital:            { label: 'Digital/Online',    emoji: '💻', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  erstgespraech:      { label: 'Erstgespräch',      emoji: '🤝', farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const STATUS_CFG: Record<ElternabendStatus, { label: string; farbe: string }> = {
  geplant:        { label: 'Geplant',        farbe: 'text-blue-500' },
  eingeladen:     { label: 'Eingeladen',     farbe: 'text-teal-600' },
  durchgefuehrt:  { label: 'Durchgeführt',   farbe: 'text-green-600' },
  protokolliert:  { label: 'Protokolliert',  farbe: 'text-gray-500' },
  abgesagt:       { label: 'Abgesagt',       farbe: 'text-red-500' },
}

const ABENDE: ElternabendEintrag[] = [
  {
    id: 'ea1', typ: 'gruppenabend', thema: 'Jahresplanung Gruppe Sonnenschein — Sommer 2026',
    datum: '07.05.2026', gruppe: 'Gruppe Sonnenschein (3–4 J.)',
    status: 'eingeladen', anwesend: undefined, eingeladen: 14,
    verantwortlich: 'Fr. Müller (Gruppenleitung)', wichtig: true,
    punkte: ['Einladung raus: 24.04.2026', 'Themen: Ausflug, Sommerfest, Übergabe-Vorbereitung', 'Bitte: Rückmeldung bis 02.05.', 'Ort: Gruppenraum Erdgeschoss, 19:00 Uhr', 'Protokoll: Fr. Schulze übernimmt'],
  },
  {
    id: 'ea2', typ: 'themenabend', thema: 'Mediennutzung bei Kleinkindern — Empfehlungen',
    datum: '22.04.2026', gruppe: 'Alle Familien',
    status: 'durchgefuehrt', anwesend: 18, eingeladen: 42,
    verantwortlich: 'Leitung + Medienpädagogin Fr. Frank',
    punkte: ['Referentin: Fr. Frank (Medienpädagogin JFF)', 'Teilnahme: 18 Erziehungsberechtigte', 'Kernbotschaft: max. 30 Min./Tag unter 3 Jahren', 'Materialien: ausgeteilt + im Elternportal', 'Folgeaktion: Infoblatt für neue Familien'],
  },
  {
    id: 'ea3', typ: 'gesamtelternabend', thema: 'Jahresrückblick + Kitagebühren 2026/27',
    datum: '25.03.2026', gruppe: 'Alle Familien',
    status: 'protokolliert', anwesend: 24, eingeladen: 42,
    verantwortlich: 'Kitaleitung', wichtig: true,
    punkte: ['Protokoll: 25.03.2026 (abgelegt /protokolle)', 'Beitragserhöhung ab Sep 2026: beschlossen (+2,8%)', 'Elternbeirat neu gewählt: Fr. Özkan (Vors.)', 'Sommerferien-Notbetreuung: Umfrage läuft', 'Nächster Gesamtelternabend: Okt 2026'],
  },
  {
    id: 'ea4', typ: 'aktion', thema: 'Frühlingsbasar — Eltern basteln mit',
    datum: '10.05.2026', gruppe: 'Alle Gruppen',
    status: 'geplant', eingeladen: 42,
    verantwortlich: 'Elternbeirat + Team',
    punkte: ['Samstag 10.05., 10–13 Uhr', 'Erlös: Spielgeräte Außenbereich', 'Helfer gesucht: Anmeldeliste hängt aus', 'Getränke + Kuchen: Elternspende', 'Aufbau: Fr 09.05. ab 16 Uhr'],
  },
  {
    id: 'ea5', typ: 'erstgespraech', thema: 'Aufnahmegespräche neue Familien — Sep 2026',
    datum: '12.–16.05.2026', gruppe: 'Neue Familien (8 Kinder)',
    status: 'geplant', eingeladen: 8,
    verantwortlich: 'Kitaleitung + Gruppenleitung',
    punkte: ['8 Aufnahmegespräche à 30 Min.', 'Unterlagen: Aufnahmeformular, SEPA, Betreuungsvertrag', 'Eingewöhnungsmodell: Münchner Modell (Info in Gespräch)', 'Terminvereinbarung: per App + Telefonat', 'Checkliste: Ablage Sekretariat'],
  },
]

export default function ElternabendPage() {
  const [expanded, setExpanded] = useState<string | null>('ea1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const geplant = ABENDE.filter(e => e.status === 'geplant' || e.status === 'eingeladen').length
  const durchgefuehrt = ABENDE.filter(e => e.status === 'durchgefuehrt' || e.status === 'protokolliert').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${ABENDE.length} Elternabende, ${geplant} geplant. Gruppenabend Sonnenschein 07.05. — Einladung raus. Frühlingsbasar 10.05. Aufnahmegespräche 12.–16.05. (8 neue Familien).`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Elternabende
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Gruppenabende · Themenabende · Protokolle · Mitmachaktionen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Abende',        val: ABENDE.length,   color: 'text-teal-600' },
          { label: 'Geplant',       val: geplant,         color: 'text-blue-500' },
          { label: 'Durchgeführt',  val: durchgefuehrt,   color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-teal-50 border border-teal-100">
        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <p className="text-[10px] text-teal-700 font-semibold">Gruppenabend Sonnenschein 07.05. — Rückmeldung bis 02.05. einfordern!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Übersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Elternabend-Übersicht'}
        </button>
      )}

      <div className="space-y-2">
        {ABENDE.map(e => {
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.thema}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.datum} · {e.gruppe}{e.anwesend !== undefined ? ` · ${e.anwesend}/${e.eingeladen} anwesend` : e.eingeladen ? ` · ${e.eingeladen} eingeladen` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-[9px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}</p>
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
