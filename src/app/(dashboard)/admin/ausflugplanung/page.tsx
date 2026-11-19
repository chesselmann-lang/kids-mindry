'use client'

import { useState } from 'react'
import { MapPinned, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Ausflugplanung — kids-mindry ──────────────────────────────────────────────
// Ausflüge · Genehmigungen · Sicherheit · Abrechnung · Dokumentation

type APTyp = 'planung' | 'genehmigung' | 'sicherheit' | 'abrechnung' | 'doku' | 'verkehr' | 'recht'
type APStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface APEintrag {
  id: string
  typ: APTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: APStatus
  punkte: string[]
}

const TYP_CFG: Record<APTyp, { label: string; farbe: string }> = {
  planung:     { label: 'Ausflugplanung',  farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  genehmigung: { label: 'Genehmigung',    farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  sicherheit:  { label: 'Sicherheit',     farbe: 'bg-red-50 text-red-700 border-red-200' },
  abrechnung:  { label: 'Abrechnung',     farbe: 'bg-green-50 text-green-700 border-green-200' },
  doku:        { label: 'Dokumentation',  farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  verkehr:     { label: 'Transport',      farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  recht:       { label: 'Rechtl. Rahmen', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<APStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: APEintrag[] = [
  {
    id: 'ap1', typ: 'planung', titel: 'Jahresausflugplanung SJ 2025/26',
    datum: 'SJ: 8 Ausflüge', verantwortlich: 'Gruppenleitung + Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Ausflüge SJ: 8 geplant (6 durchgeführt, 2 ausstehend: Freibad Jul + Tierpark Aug)',
      'Ausflugkalender: jährl. Planung Sep (Gruppen koordiniert, Trägervorgabe: 6/Gr.)',
      'Freibad-Ausflug: 14.07.2026 (Gr.1+2, Busanmietung, Elternbegleitung 4 Pers.)',
      'Tierpark: 12.08.2026 (alle Gruppen, gesonderte Genehmigung, Elterninfo bis 15.07.)',
      'Notfallausflug Regenwetter: Alternativen-Liste (Bibliothek, Turnhalle, Museum)',
    ],
  },
  {
    id: 'ap2', typ: 'genehmigung', titel: 'Genehmigungen & Elterneinwilligungen',
    datum: 'Je Ausflug Formular', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Einwilligungsformular: je Ausflug (Datum, Ziel, Transport, Kosten, Notfallkontakt)',
      'Jahreseinwilligung: Nahbereichsausflüge < 1h (einmalig bei Jahresstart)',
      'Genehmigung Träger: Ausflüge > 30km oder Übernachtung (Antrag 4 Wochen vorher)',
      'Fotoeinwilligung: Ausflug-Fotos nur mit Einwilligung (DSGVO-Formular SJ-Beginn)',
      'Rücklaufquote Einwilligungen: mind. 100% vor Ausflug (kein Kind ohne Erlaubnis)',
    ],
  },
  {
    id: 'ap3', typ: 'sicherheit', titel: 'Sicherheit & Aufsichtspflicht',
    datum: 'Schlüssel: 1:5', verantwortlich: 'Gruppenleitung', status: 'aktiv',
    punkte: [
      'Aufsichtsschlüssel Ausflug: 1 MA: 5 Kinder (Krippe), 1:8 (Kita ab 3 J.)',
      'Elternbegleitung: bei Ausflügen immer einplanen (mind. 2 Elternteile pro Gruppe)',
      'Erste-Hilfe-Tasche: immer mitführen (Checkliste vor jedem Ausflug)',
      'Notfallkontaktliste: aktuell, laminiert, MA-Ausflugmappe',
      'Versicherung: Kinder gesetzl. unfallversichert (Träger-Police deckt Ausflüge ab)',
    ],
  },
  {
    id: 'ap4', typ: 'abrechnung', titel: 'Kosten & Abrechnung',
    datum: 'Budget: 800€/SJ', verantwortlich: 'Kita-Ltg. + Träger', status: 'aktiv',
    punkte: [
      'Ausflugbudget: 800€/SJ (Träger-Zuweisung, verbleibend: 220€ für Jul+Aug)',
      'Elternbeitrag: bis 5€/Ausflug (Nahbereich), > 5€ mit Elternbeirat abstimmen',
      'Härtefall-Fonds: auf Antrag Kostenübernahme (Kita-Ltg. entscheidet diskret)',
      'Kassenführung: Einzelbelege je Ausflug (Einnahmen + Ausgaben, Träger-Abrechnung)',
      'Busanmietung: Sammelrechnung Träger (kein Einzelkauf, Rahmenvertrag Busgesellschaft)',
    ],
  },
  {
    id: 'ap5', typ: 'doku', titel: 'Dokumentation & Nachbereitung',
    datum: 'Je Ausflug Protokoll', verantwortlich: 'Gruppenleitung', status: 'aktiv',
    punkte: [
      'Ausflugprotokoll: Teilnahmeliste + Vorfälle + Bewertung (KitaPlus-Formular)',
      'Fotoalbum: je Ausflug (Gruppen-Portfolio, nur Kinder mit Fotoeinwilligung)',
      'Elterninfo Nachbericht: IServ-Nachricht mit Foto-Rückblick (1–2 Tage nach Ausflug)',
      'Vorfallsprotokoll: bei Unfall/Verletzung (Kita-Leitung + Träger + Unfallanzeige)',
      'Jahresrückblick: alle Ausflüge im Jahresbericht (Dokumentation Bildungsarbeit)',
    ],
  },
]

export default function AusflugplanungPage() {
  const [expanded, setExpanded] = useState<string | null>('ap1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 8 Ausflüge SJ, 2 ausstehend (Freibad 14.07., Tierpark 12.08.). Budget 220€ übrig. Elterninfo Tierpark bis 15.07.!`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <MapPinned className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Ausflugplanung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Planung · Genehmigungen · Sicherheit · Abrechnung · Dokumentation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'SJ-Ausflt.',val: 8, color: '#0d9488' },
          { label: 'Budget €',  val: 220, color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Freibad 14.07. + Tierpark 12.08. planen — Elterninfo Tierpark bis 15.07. — Budget prüfen</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Ausflugübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Ausflugübersicht'}
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
