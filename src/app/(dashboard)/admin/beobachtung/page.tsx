'use client'

import { useState } from 'react'
import { ScanEye, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Beobachtung — kids-mindry ─────────────────────────────────────────────────
// Pädagogische Beobachtung · Dokumentation · Portfolios · Förderplanung

type BeobTyp = 'methode' | 'portfolio' | 'foerderplan' | 'sprachstand' | 'entwicklung' | 'team' | 'datenschutz'
type BeobStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface BeobEintrag {
  id: string
  typ: BeobTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: BeobStatus
  punkte: string[]
}

const TYP_CFG: Record<BeobTyp, { label: string; farbe: string }> = {
  methode:    { label: 'Methoden',          farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  portfolio:  { label: 'Portfolio',         farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  foerderplan:{ label: 'Förderplanung',     farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  sprachstand:{ label: 'Sprachstand',       farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  entwicklung:{ label: 'Entwicklungsdoku.', farbe: 'bg-green-50 text-green-700 border-green-200' },
  team:       { label: 'Teamreflexion',     farbe: 'bg-rose-50 text-rose-700 border-rose-200' },
  datenschutz:{ label: 'Datenschutz',       farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<BeobStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: BeobEintrag[] = [
  {
    id: 'beob1', typ: 'methode', titel: 'Beobachtungsmethoden & -instrumente',
    datum: 'Lfd.', verantwortlich: 'Pädagog. Team', status: 'aktiv',
    punkte: [
      'Hauptmethode: Bildungs- und Lerngeschichten (BLGs) — gesamtes Team geschult',
      'SISMIK: Sprachkompetenz MK (14 Kinder mit Migrationshintergrund, Apr abgeschl.)',
      'SELDAK: Sprachentwicklung dt. Kinder (alle EF-Kinder, Herbst geplant)',
      'Freie Beobachtung: Beobachtungsbögen (hauseigen, laminiert, Klemmbrett)',
      'Fotodokumentation: iPad-gestützt, Kita-App (Eltern-Sichtrechte konfiguriert)',
    ],
  },
  {
    id: 'beob2', typ: 'portfolio', titel: 'Portfolios — Stand & Aktualisierung',
    datum: 'Halbjährlich aktualisieren', verantwortlich: 'Gruppenleitung', status: 'handlungsbedarf',
    punkte: [
      'Portfolios aktuell: 68/73 Kinder (5 Portfolios veraltet → bis 30.05. nacharbeiten!)',
      'Portfoliokonzept: überarbeitet 2024 (Vorlage digital + analog)',
      'Elterneinblick: Portfolio beim Elterngespräch besprechen (Pflicht, 2×/Jahr)',
      'Abgabe-Portfolio: Schulkinder erhalten Portfolio bei Abschluss (Jun)',
      'Digitalisierung: Kita-App-Portfolio für Kl.2+3 gestartet (pilotgruppe Gr.3)',
    ],
  },
  {
    id: 'beob3', typ: 'foerderplan', titel: 'Individuelle Förderpläne',
    datum: 'Überprüfung fällig!', verantwortlich: 'Gruppenerzieher:in + Fachberatung', status: 'faellig',
    punkte: [
      'Förderpläne aktiv: 9 Kinder (Sprache 4, Motorik 3, Verhalten 2)',
      'Förderpläne überfällig: 2 Kinder ohne aktualisiertem Plan (>6 Mon.) — bis 15.05.!',
      'Frühförderstelle: 5 Kinder mit externem Förderplan (Koordination Fr. Weber)',
      'Elterneinbindung: Eltern bei Förderplan unterzeichnen (alle vorhanden)',
      'Wirksamkeitsprüfung: Förderplan-Review quartalsweise (nächste: Jun)',
    ],
  },
  {
    id: 'beob4', typ: 'entwicklung', titel: 'Entwicklungsdokumentation & Berichte',
    datum: 'Halbjährlich', verantwortlich: 'Gruppenleitung', status: 'aktiv',
    punkte: [
      'Entwicklungsberichte: 2×/Jahr (Herbst + Frühjahr), Vorlage aktualisiert 2024',
      'Aktueller Stand: Frühjahrsberichte 61/73 fertig (12 ausstehend — bis 30.05.!)',
      'Übergabebericht Schule: 14 Schulkinder (Formular, Einverständnis 12/14)',
      'Aufbewahrung: 10 Jahre nach Abgang (Träger-Regelung, Datenschutz)',
      'Digitale Akte: Kita-Software "KitaPlus" (alle Berichte dort abgelegt)',
    ],
  },
  {
    id: 'beob5', typ: 'datenschutz', titel: 'Datenschutz bei Bild- & Beobachtungsdokumentation',
    datum: 'Jährliche Prüfung', verantwortlich: 'Kita-Ltg. + Datenschutzbeauftragter', status: 'geplant',
    punkte: [
      'Fotoeinverständnis: alle 73 Kinder mit gültigem Einverständnis (Prüfung Apr)',
      'Kita-App Datenschutz: EU-Server, Auftragsverarbeitungsvertrag vorhanden',
      'Löschfristen: Fotos nach Kitaaustritt innerhalb 30 Tagen löschen (Protokoll)',
      'Datenschutzschulung Team: letzte Schulung Sep 2025 (nächste Sep 2026)',
      'Eltern-Anfragen: 2 Auskunftsersuchen SJ (beide beantwortet, dokumentiert)',
    ],
  },
]

export default function BeobachtungPage() {
  const [expanded, setExpanded] = useState<string | null>('beob3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 2 Förderpläne überfällig (bis 15.05.!). 5 Portfolios veraltet (bis 30.05.). 12 Entwicklungsberichte ausstehend. SISMIK Apr abgeschlossen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ScanEye className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Beobachtung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Methoden · Portfolio · Förderplanung · Entwicklungsdoku · Datenschutz</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',     val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Pläne fällig', val: 2, color: '#ef4444' },
          { label: 'Portfolios',   val: '68/73', color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>2 Förderpläne überfällig bis 15.05. — 5 Portfolios bis 30.05. — 12 Entwicklungsberichte ausstehend</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Beobachtungsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Beobachtungsübersicht'}
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
