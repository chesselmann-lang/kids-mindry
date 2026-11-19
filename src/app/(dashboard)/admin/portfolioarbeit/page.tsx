'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star } from 'lucide-react'

// ── Portfolioarbeit — kids-mindry ──────────────────────────────────────────────
// Bildungsdokumentation · Entwicklungsportfolios · Scrapbook · Beobachtungen

type PortfolioBereich = 'sprache' | 'bewegung' | 'sozial' | 'kreativ' | 'natur' | 'mathematik' | 'selbstbild'
type PortfolioFormat = 'papiermappe' | 'digital' | 'scrapbook' | 'videotagebuch' | 'zeichnungen' | 'fotos' | 'audio'
type PortfolioStatus = 'aktuell' | 'aktualisierung_noetig' | 'abgeschlossen' | 'uebergeben'

interface PortfolioKind {
  id: string
  name: string
  gruppe: string
  format: PortfolioFormat
  bereich: PortfolioBereich[]
  status: PortfolioStatus
  letzteEintrag: string
  naechsteAktualisierung?: string
  eintraegeAnzahl: number
  wichtig?: boolean
  notizen: string[]
}

const FORMAT_CFG: Record<PortfolioFormat, { label: string; emoji: string; farbe: string }> = {
  papiermappe:   { label: 'Papiermappe',    emoji: '📂', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  digital:       { label: 'Digital',        emoji: '💻', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  scrapbook:     { label: 'Scrapbook',      emoji: '📒', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  videotagebuch: { label: 'Video-Tagebuch', emoji: '🎬', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  zeichnungen:   { label: 'Zeichnungen',    emoji: '🖍️', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  fotos:         { label: 'Fotosammlung',   emoji: '📸', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  audio:         { label: 'Audio-Tagebuch', emoji: '🎙️', farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const STATUS_CFG: Record<PortfolioStatus, { label: string; farbe: string }> = {
  aktuell:               { label: 'Aktuell',              farbe: 'text-green-600' },
  aktualisierung_noetig: { label: 'Aktualisierung nötig', farbe: 'text-orange-500' },
  abgeschlossen:         { label: 'Abgeschlossen',        farbe: 'text-gray-500' },
  uebergeben:            { label: 'Übergeben',            farbe: 'text-blue-500' },
}

const PORTFOLIOS: PortfolioKind[] = [
  {
    id: 'po1', name: 'Lena M.', gruppe: 'Sonnenschein (4 J.)',
    format: 'scrapbook', bereich: ['sprache', 'kreativ', 'sozial'],
    status: 'aktuell', letzteEintrag: '18.04.2026',
    naechsteAktualisierung: 'Mai 2026', eintraegeAnzahl: 34, wichtig: true,
    notizen: ['Scrapbook seit Sep 2023 (3 Ordner)', 'Letzte Beobachtung: Rollenspiel mit Peers (18.04.)', 'Sprachentwicklung: Sätze 5–7 Wörter, sehr aktiv', 'Elterngespräch: Einblick Portfolio angeboten (Apr 2026)', 'Übergang Schule geplant: Sep 2026 — Abschlussdokumentation starten'],
  },
  {
    id: 'po2', name: 'Noah S.', gruppe: 'Regenbogen (3 J.)',
    format: 'fotos', bereich: ['bewegung', 'natur', 'selbstbild'],
    status: 'aktualisierung_noetig', letzteEintrag: '28.02.2026',
    naechsteAktualisierung: 'sofort', eintraegeAnzahl: 18,
    notizen: ['Letzter Eintrag: Feb 2026 (8 Wochen veraltet)', 'Beobachtungsschwerpunkt: Grobmotorik (sehr aktiv)', 'Fotos: 12 neue Fotos im Ordner — noch nicht eingeheftet', 'Eltern: haben nach Portfolio gefragt (14.04.)', 'Zuständig: Fr. Klein (seit Feb erkrankt, Vertretung nötig)'],
  },
  {
    id: 'po3', name: 'Emma K.', gruppe: 'Sterne (5 J.)',
    format: 'papiermappe', bereich: ['mathematik', 'natur', 'sprache', 'kreativ'],
    status: 'aktuell', letzteEintrag: '10.04.2026',
    naechsteAktualisierung: 'Mai 2026', eintraegeAnzahl: 52, wichtig: true,
    notizen: ['Umfangreichstes Portfolio in der Gruppe', 'Schulfähigkeitsprofil: wird ergänzt (Sep 2026)', 'Schwerpunkte: Naturwissenschaft, Zahlenbegriff sehr ausgeprägt', 'Mama möchte Kopien ausgewählter Seiten — bis Jun 2026', 'Druckpapier A4 + Kleber: Nachschub nötig (Schrank B3)'],
  },
  {
    id: 'po4', name: 'Finn B.', gruppe: 'Sonnenschein (4 J.)',
    format: 'digital', bereich: ['kreativ', 'sozial', 'selbstbild'],
    status: 'aktuell', letzteEintrag: '15.04.2026',
    eintraegeAnzahl: 27,
    notizen: ['Digitales Portfolio: App KidsFolio (DSGVO-konform)', 'Eltern haben App-Zugang (aktiv genutzt)', '3 Videos + 24 Fotos + 4 Sprachaufnahmen', 'DSGVO: Einwilligung Eltern vorhanden (Ablage)', 'Backup: monatlich auf Server (letztes: 01.04.)'],
  },
  {
    id: 'po5', name: 'Mia T.', gruppe: 'Regenbogen (Übergang Schule)',
    format: 'scrapbook', bereich: ['sprache', 'sozial', 'selbstbild', 'kreativ'],
    status: 'abgeschlossen', letzteEintrag: '31.03.2026',
    eintraegeAnzahl: 61,
    notizen: ['Abschlussdokumentation: fertiggestellt 31.03.2026', 'Übergabe an Grundschule: 12.06.2026 (Anmeldung)', 'Schulfähigkeitsprofil NRW: ausgefüllt + beigelegt', 'Eltern: Abschlussgespräch 08.05.2026 (Einladung raus)', 'Kopie für Kita-Archiv: angefertigt'],
  },
]

export default function PortfolioarbeitPage() {
  const [expanded, setExpanded] = useState<string | null>('po1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktuell = PORTFOLIOS.filter(p => p.status === 'aktuell').length
  const veraltet = PORTFOLIOS.filter(p => p.status === 'aktualisierung_noetig').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PORTFOLIOS.length} Portfolios, ${aktuell} aktuell. Noah S.: 8 Wochen veraltet — sofort aktualisieren. Mia T.: Abschlussdokumentation fertig, Übergabe Grundschule 12.06.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <BookOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Portfolioarbeit
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Bildungsdokumentation · Entwicklungsportfolios · Übergabe Schule</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Portfolios', val: PORTFOLIOS.length, color: 'text-teal-600' },
          { label: 'Aktuell',    val: aktuell,           color: 'text-green-600' },
          { label: 'Veraltet',   val: veraltet,          color: veraltet > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Portfolio-Übersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Portfolio-Übersicht'}
        </button>
      )}

      <div className="space-y-2">
        {PORTFOLIOS.map(p => {
          const isOpen = expanded === p.id
          const fCfg = FORMAT_CFG[p.format]
          const sCfg = STATUS_CFG[p.status]
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${p.status === 'aktualisierung_noetig' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {fCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${fCfg.farbe}`}>{fCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {p.wichtig && <Star className="w-2.5 h-2.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{p.name} — {p.gruppe}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{p.eintraegeAnzahl} Einträge · zuletzt {p.letzteEintrag}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {p.bereich.map(b => (
                      <span key={b} className="text-[8px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">{b}</span>
                    ))}
                  </div>
                  {p.naechsteAktualisierung && (
                    <p className="text-[9px] font-semibold" style={{ color: p.status === 'aktualisierung_noetig' ? 'rgb(234 88 12)' : 'var(--color-text-muted)' }}>Nächste Aktualisierung: {p.naechsteAktualisierung}</p>
                  )}
                  {p.notizen.map((n, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{n}</p>
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
