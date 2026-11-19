'use client'

import { useState } from 'react'
import { FolderOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Materialverwaltung — kids-mindry ───────────────────────────────────────────
// Spielzeug · Verbrauchsmaterial · Bestand · Bestellungen · Inventur

type MaterialKategorie = 'spielzeug' | 'bastelmaterial' | 'buecher' | 'sport' | 'hygiene' | 'kueche' | 'aussengelaende'
type MaterialStatus = 'ausreichend' | 'nachbestellen' | 'bestellt' | 'pruefen' | 'defekt'

interface MaterialEintrag {
  id: string
  kategorie: MaterialKategorie
  bezeichnung: string
  bestand: number
  einheit: string
  mindestbestand: number
  status: MaterialStatus
  lagerort: string
  verantwortlich: string
  hinweise: string[]
  letzteInventur?: string
}

const KAT_CFG: Record<MaterialKategorie, { label: string; emoji: string; farbe: string }> = {
  spielzeug:      { label: 'Spielzeug',         emoji: '🧸', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  bastelmaterial: { label: 'Bastelmaterial',    emoji: '✂️', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  buecher:        { label: 'Bücher/Medien',     emoji: '📚', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  sport:          { label: 'Bewegung/Sport',    emoji: '⚽', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  hygiene:        { label: 'Hygiene/Pflege',    emoji: '🧴', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  kueche:         { label: 'Küche/Haushalt',   emoji: '🍽️', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  aussengelaende: { label: 'Außengelände',      emoji: '🌳', farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const STATUS_CFG: Record<MaterialStatus, { label: string; farbe: string }> = {
  ausreichend:  { label: 'Ausreichend', farbe: 'text-green-600' },
  nachbestellen:{ label: 'Nachbestellen!', farbe: 'text-red-600' },
  bestellt:     { label: 'Bestellt',    farbe: 'text-blue-500' },
  pruefen:      { label: 'Prüfen',      farbe: 'text-orange-500' },
  defekt:       { label: 'Defekt',      farbe: 'text-gray-400' },
}

const MATERIALIEN: MaterialEintrag[] = [
  {
    id: 'm1', kategorie: 'bastelmaterial', bezeichnung: 'Fingerfarben (diverse Farben)',
    bestand: 4, einheit: 'Flaschen', mindestbestand: 12,
    status: 'nachbestellen', lagerort: 'Schrank B3 (Gruppenraum)', verantwortlich: 'Fr. Meyer',
    letzteInventur: '01.04.2026',
    hinweise: ['Bestand kritisch: 4 von 12 Mindestbestand', 'Bestellvorschlag: 2× Set à 6 Farben (Conrad)', 'Budget Q2: noch 48 € vorhanden', 'Letzte Bestellung: Jan 2026'],
  },
  {
    id: 'm2', kategorie: 'hygiene', bezeichnung: 'Einmalhandschuhe (Gr. M) + Desinfektionsmittel',
    bestand: 2, einheit: 'Pakete/Flaschen', mindestbestand: 5,
    status: 'bestellt', lagerort: 'Wickelraum + Sanitär', verantwortlich: 'Leitung',
    letzteInventur: '15.04.2026',
    hinweise: ['Bestellung: 22.04.2026 (Lieferung erwartet: 28.04.)', '§34 IfSG: Vorrat für Infektionsschutz-Maßnahmen', 'Desinfektion: Lysoform 1-Liter (3 Flaschen bestellt)', 'Lieferant: Apotheke Marktstraße (Konto vorhanden)'],
  },
  {
    id: 'm3', kategorie: 'spielzeug', bezeichnung: 'Konstruktionsspielzeug Duplo / Bauklötze',
    bestand: 8, einheit: 'Kisten', mindestbestand: 6,
    status: 'ausreichend', lagerort: 'Spielzeugregal Raum 1', verantwortlich: 'Fr. Schulze',
    letzteInventur: '10.04.2026',
    hinweise: ['Bestand ausreichend', 'Inventur Apr 2026: 3 defekte Teile aussortiert', 'Altersgerecht: ab 18 Monate (EN 71)', 'Duplo-Erweiterungsset: Wunschliste für Spendenaufruf'],
  },
  {
    id: 'm4', kategorie: 'aussengelaende', bezeichnung: 'Sandkastenspielzeug + Schaufeln',
    bestand: 14, einheit: 'Sets', mindestbestand: 10,
    status: 'pruefen', lagerort: 'Außengerätehaus', verantwortlich: 'Fr. Braun',
    letzteInventur: '03.04.2026',
    hinweise: ['Frühlingscheck ausstehend: Rost + Brüche prüfen', '2 Schaufeln gemeldet defekt — aussondern', 'Sand-Auffüllung: Apr/Mai (2 m³ bestellt)', 'Sonnenschutz Sandkasten: Plane auf Lager'],
  },
  {
    id: 'm5', kategorie: 'buecher', bezeichnung: 'Bilderbücher + Sachbücher (3–6 J.)',
    bestand: 87, einheit: 'Bücher', mindestbestand: 60,
    status: 'ausreichend', lagerort: 'Leseecke + Regal Flur', verantwortlich: 'Päd. Team',
    letzteInventur: '28.03.2026',
    hinweise: ['Bibliotheksbestand: 87 Titel (Stand Apr 2026)', 'Thematisch: Natur, Familie, Tiere, Vielfalt', 'Neuanschaffung: 5 Bücher (Spende Stadtbücherei)', 'Beschädigte Bücher: 4 — repariert/ausgesondert'],
  },
]

export default function MaterialverwaltungPage() {
  const [expanded, setExpanded] = useState<string | null>('m1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const kritisch = MATERIALIEN.filter(m => m.status === 'nachbestellen').length
  const bestellt = MATERIALIEN.filter(m => m.status === 'bestellt').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MATERIALIEN.length} Kategorien. ${kritisch} Artikel nachbestellen. Fingerfarben: kritisch (4/12). Hygiene: Lieferung 28.04. erwartet. Sandkastenspielzeug: Frühlingscheck ausstehend.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <FolderOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Materialverwaltung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Bestand · Bestellungen · Inventur · Lagerorte</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kategorien',  val: MATERIALIEN.length, color: 'text-teal-600' },
          { label: 'Kritisch',    val: kritisch,           color: kritisch > 0 ? 'text-red-600' : 'text-gray-400' },
          { label: 'Bestellt',    val: bestellt,           color: 'text-blue-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {kritisch > 0 && (
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-red-50 border border-red-100">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">Fingerfarben: Bestand kritisch — sofort nachbestellen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Materialübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Materialübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {MATERIALIEN.map(m => {
          const isOpen = expanded === m.id
          const kCfg = KAT_CFG[m.kategorie]
          const sCfg = STATUS_CFG[m.status]
          const pct = m.mindestbestand > 0 ? Math.min(100, Math.round(m.bestand / m.mindestbestand * 100)) : 100
          return (
            <div key={m.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${m.status === 'nachbestellen' ? 'rgb(252 165 165)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {kCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${kCfg.farbe}`}>{kCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{m.bezeichnung}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{m.bestand} {m.einheit} · Min. {m.mindestbestand} · {m.lagerort}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div className={`h-full rounded-full ${pct < 50 ? 'bg-red-400' : pct < 80 ? 'bg-orange-400' : 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  {m.letzteInventur && (
                    <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Letzte Inventur: {m.letzteInventur}</p>
                  )}
                  {m.hinweise.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{h}</p>
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
