'use client'

import { useState } from 'react'
import { ShoppingCart, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Beschaffung — kids-mindry ─────────────────────────────────────────────────
// Materialbeschaffung · Inventar · Budget · Lieferanten · Wartung

type BeschTyp = 'material' | 'inventar' | 'budget' | 'lieferant' | 'wartung' | 'hygiene' | 'it'
type BeschStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface BeschEintrag {
  id: string
  typ: BeschTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: BeschStatus
  punkte: string[]
}

const TYP_CFG: Record<BeschTyp, { label: string; farbe: string }> = {
  material:  { label: 'Material',        farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  inventar:  { label: 'Inventar',        farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  budget:    { label: 'Budget',          farbe: 'bg-green-50 text-green-700 border-green-200' },
  lieferant: { label: 'Lieferanten',     farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  wartung:   { label: 'Wartung/Reparatur',farbe: 'bg-red-50 text-red-700 border-red-200' },
  hygiene:   { label: 'Hygienematerial', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  it:        { label: 'IT/Technik',      farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<BeschStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: BeschEintrag[] = [
  {
    id: 'besc1', typ: 'material', titel: 'Spielmaterial & pädagogisches Material',
    datum: 'Bestellung Mai geplant', verantwortlich: 'Gruppenleitung + Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Materialbudget SJ: 3.200 € (davon 1.850 € verbraucht, Rest 1.350 €)',
      'Bestellung Mai: Außenspielgeräte-Ergänzung (480 €, Angebot eingeholt)',
      'Bastelmaterial: Grundbestand ok, Farben + Papier nachbestellen (bis 15.05.)',
      'Bücherei: 25 neue Bilderbücher geplant (Förderverein zahlt 200 €)',
      'Materialpflege: defekte Spielsachen — Inventurliste bis 30.05. erstellen',
    ],
  },
  {
    id: 'besc2', typ: 'inventar', titel: 'Inventar & Bestandsverwaltung',
    datum: 'Jahresinventur Jun', verantwortlich: 'Kita-Ltg. + Hauswirtschaft', status: 'geplant',
    punkte: [
      'Inventurliste: zuletzt aktualisiert Jan 2026 (Jahresinventur Jun geplant)',
      'Inventar-Software: Excel-Liste (Träger-Vorgabe, kein spezielles Tool)',
      'Neuanschaffungen: Anlagenverzeichnis fortschreiben (Pflicht für Jahresabschluss)',
      'Abgänge: defekte/ausgesonderte Gegenstände dokumentieren + Träger melden',
      'Wertvermögen: Jahresinventur bis 30.06. abgeschlossen (Träger-Frist)',
    ],
  },
  {
    id: 'besc3', typ: 'wartung', titel: 'Wartung, Reparaturen & Sicherheitsprüfungen',
    datum: 'Prüfungen ausstehend!', verantwortlich: 'Hausmeister Hr. Klein + Kita-Ltg.', status: 'faellig',
    punkte: [
      'Außenspielgeräte: jährliche Sicherheitsprüfung überfällig (letzte: Apr 2025 — jetzt!)',
      'Feuerlöscher: Wartung fällig Mai 2026 (Fachfirma bestellt, Termin 19.05.)',
      'Waschmaschine Gr.2: defekt seit 10.04. — Reparaturauftrag offen (Hausmeister)',
      'Reparaturliste: 4 offene Punkte (Tür Garderobe, Fenstergriff, Bank Garten, Regal)',
      'UVV-Prüfung: elektrische Geräte (alle 4 Jahre — nächste 2027, ok)',
    ],
  },
  {
    id: 'besc4', typ: 'budget', titel: 'Beschaffungsbudget & Finanzplanung',
    datum: 'Q2 Bericht bis 30.06.', verantwortlich: 'Kita-Ltg. + Träger', status: 'aktiv',
    punkte: [
      'Gesamtbudget Sachmittel 2026: 8.600 € (Stand Apr: 4.720 € verbraucht = 55%)',
      'Budget-Reste: 3.880 € frei (Q2 Planung: Material 480 €, Wartung 350 €, IT 200 €)',
      'Überschreitungsregel: Einzelanschaffungen >500 € → Träger-Genehmigung',
      'Investitionsantrag 2027: bis Sep 2026 einreichen (Kletterturm-Sanierung ~6.000 €)',
      'Fördergelder: KidsChance-Antrag ausstehend (Digitalisierung, bis 31.05. einreichen)',
    ],
  },
  {
    id: 'besc5', typ: 'hygiene', titel: 'Hygienematerial & Verbrauchsmittel',
    datum: 'Monatl. Nachbestellung', verantwortlich: 'Hauswirtschaft Fr. Berger', status: 'aktiv',
    punkte: [
      'Hygienemittel: Monatsbestellung läuft (Lieferant Würth, Rahmenvertrag)',
      'Desinfektionsmittel: Bestand ok (3 Mon. Vorrat), Händedesinfekt. nachbestellen',
      'Einmalhandschuhe: Bestand niedrig — Sofortbestellung 10 Boxen (Fr. Berger)',
      'Wickelbereich: Windeln 6 Kinder (Eltern bringen mit — kein Kita-Budget)',
      'Verbrauchsprotokoll: HACCP-Aufzeichnungen tägl. (Fr. Berger, ok)',
    ],
  },
]

export default function BeschaffungPage() {
  const [expanded, setExpanded] = useState<string | null>('besc3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Außenspielgeräte-Prüfung überfällig! Feuerlöscher 19.05. Waschmaschine defekt. Handschuhe Sofortbestellung. Budget 55% verbraucht.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShoppingCart className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Beschaffung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Material · Inventar · Budget · Wartung · Hygienemittel</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',      val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Budget frei',   val: '3.880€', color: '#0d9488' },
          { label: 'Wartung offen', val: 4, color: '#ef4444' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Spielgeräte-Sicherheitsprüfung überfällig — Waschmaschine defekt — Einmalhandschuhe Sofortbestellung</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Beschaffungsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Beschaffungsübersicht'}
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
