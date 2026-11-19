'use client'

import { useState } from 'react'
import { Utensils, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Ernährung — kids-mindry ────────────────────────────────────────────────────
// Mittagessen · Allergene · HACCP · Snacks · Ernährungsbildung

type ErnTyp = 'mittagessen' | 'allergene' | 'haccp' | 'fruehstueck' | 'ernaehrungsbildung' | 'lieferant' | 'sonder'
type ErnStatus = 'aktuell' | 'faellig' | 'aktiv' | 'abgeschlossen' | 'geplant'

interface ErnEintrag {
  id: string
  typ: ErnTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: ErnStatus
  punkte: string[]
}

const TYP_CFG: Record<ErnTyp, { label: string; farbe: string }> = {
  mittagessen:      { label: 'Mittagessen',       farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  allergene:        { label: 'Allergene',         farbe: 'bg-red-50 text-red-700 border-red-200' },
  haccp:            { label: 'HACCP/Hygiene',     farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  fruehstueck:      { label: 'Frühstück/Snacks',  farbe: 'bg-green-50 text-green-700 border-green-200' },
  ernaehrungsbildung:{ label: 'Ernährungsbildung', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  lieferant:        { label: 'Lieferanten',       farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  sonder:           { label: 'Sonderkost',        farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<ErnStatus, { label: string; farbe: string }> = {
  aktuell:      { label: 'Aktuell',     farbe: 'text-teal-600' },
  faellig:      { label: 'Fällig',      farbe: 'text-red-500' },
  aktiv:        { label: 'Aktiv',       farbe: 'text-blue-500' },
  abgeschlossen:{ label: 'Abgeschl.',   farbe: 'text-gray-400' },
  geplant:      { label: 'Geplant',     farbe: 'text-purple-500' },
}

const EINTRAEGE: ErnEintrag[] = [
  {
    id: 'er1', typ: 'mittagessen', titel: 'Mittagsversorgung & Speiseplan',
    datum: 'Täglich 11:30–13h', verantwortlich: 'Fr. Meier (Küche) + Leitung', status: 'aktuell',
    punkte: [
      'Catering: GKM Catering Service (Vertrag bis Dez 2026)',
      'Speiseplan: wöchentlich (Aushang Eingang + KiTa-App)',
      'Mahlzeiten: 68 Kinder tägl. (25h: kalt, 35h+45h: warm)',
      'Kosten: 3,85 €/Tag (Antrag BuT möglich, 12 Kinder gefördert)',
      'Bewertung Elternbefragung: Note 2,3 (Verbesserungswunsch: mehr Salat)',
    ],
  },
  {
    id: 'er2', typ: 'allergene', titel: 'Allergene & Unverträglichkeiten',
    datum: 'Aktuell: 7 Kinder', verantwortlich: 'KiTa-Leitung + Küche', status: 'aktuell',
    punkte: [
      'Allergienliste: 7 Kinder (Gluten 3, Milch 2, Nuss 1, Laktose 1)',
      'Attest: alle 7 mit ärztlichem Attest (Ordner Küche + App-Profil)',
      'Kennzeichnung: Allergien sichtbar an Tischkarte + Küchen-Aushang',
      'Epipen: 1 Kind mit EpiPen (alle MA geschult, Aufbewahrung Kühlschrank)',
      'LEAA-Schulung: alle MA 2025 geschult (jährl. Auffrischung Sep 2026)',
    ],
  },
  {
    id: 'er3', typ: 'haccp', titel: 'HACCP & Lebensmittelhygiene',
    datum: 'Überarbeitung fällig', verantwortlich: 'Fr. Meier + Leitung', status: 'faellig',
    punkte: [
      'HACCP-Konzept: letzte Revision Mär 2025 (>1 Jahr, Überarbeitung fällig!)',
      'Temperaturprotokoll: tägl. (Ordner "Temp-Kontrolle" Küche, letzte Woche ok)',
      'Warmhaltung: max. 3h (GN-Behälter + Warmhaltebox, Messung dokumentiert)',
      'Reinigungsplan Küche: tägl. + wöchentl. Desinfektion (Protokoll aktuell)',
      'HACCP-Unterweisung Fr. Meier: noch nicht erfolgt (seit Apr, dringend!)',
    ],
  },
  {
    id: 'er4', typ: 'sonder', titel: 'Sonderkost & religiöse Ernährung',
    datum: 'Lfd.', verantwortlich: 'KiTa-Leitung + Küche', status: 'aktiv',
    punkte: [
      'Halal: 14 Kinder (GKM liefert halal-zertifiziert, Nachweis vorhanden)',
      'Vegetarisch: 5 Kinder (tägl. vegetarische Alternative vorhanden)',
      'Vegan: 2 Kinder (veganes Menü auf Anfrage 48h vorher)',
      'Sonderkost-Formular: Anlage 3 Anmeldeunterlagen (alle ausgefüllt)',
      'Ramadan: Kinder fasten → Elterninfo beachten (keine Zwangsmahlzeit)',
    ],
  },
  {
    id: 'er5', typ: 'ernaehrungsbildung', titel: 'Ernährungsbildung im Alltag',
    datum: 'Lfd. pädagogisch', verantwortlich: 'Alle Erzieher:innen', status: 'aktiv',
    punkte: [
      'Gesundes Frühstück: Mo-Frühstücksbuffet (Kinder bringen mit, Konzept aktiv)',
      'Gemüsegarten: Hochbeet Außengelände (Kinder säen + ernten, saisonal)',
      'Kochprojekte: monatlich je Gruppe (Rezept an Eltern → Familien-App)',
      'Zahngesundheit: Kooperation Zahnärztin (Apr, Kl.1-Klassen besucht)',
      'Ernährungsampel: Ampel-Bilder in Küche + Gruppen (Erklärung: rot/gelb/grün)',
    ],
  },
]

export default function ErnaehrungPage() {
  const [expanded, setExpanded] = useState<string | null>('er3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. HACCP-Unterweisung Fr. Meier dringend! HACCP-Konzept >1 Jahr (überarbeiten). 7 Allergien aktiv (alle mit Attest). 68 Kinder tägl. Mittagessen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Utensils className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Ernährung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Mittagessen · Allergene · HACCP · Sonderkost · Ernährungsbildung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',   val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Allergien',  val: 7, color: '#ef4444' },
          { label: 'Mahlzeiten', val: 68, color: '#d97706' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>HACCP-Unterweisung Fr. Meier dringend! — HACCP-Konzept überarbeiten (>1 Jahr) — Temp-Protokoll ok</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Ernährungsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Ernährungsübersicht'}
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
