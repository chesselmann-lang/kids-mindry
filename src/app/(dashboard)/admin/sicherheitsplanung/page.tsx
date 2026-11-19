'use client'

import { useState } from 'react'
import { ShieldAlert, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Sicherheitsplanung — kids-mindry ──────────────────────────────────────────
// Brandschutz · Evakuierung · Gebäudesicherheit · Prüfungen · Unfallverhütung

type SiTyp = 'brandschutz' | 'evakuierung' | 'gebaeude' | 'pruefung' | 'uvv' | 'extern' | 'schulung'
type SiStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface SiEintrag {
  id: string
  typ: SiTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: SiStatus
  punkte: string[]
}

const TYP_CFG: Record<SiTyp, { label: string; farbe: string }> = {
  brandschutz: { label: 'Brandschutz',        farbe: 'bg-red-50 text-red-700 border-red-200' },
  evakuierung: { label: 'Evakuierung',         farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  gebaeude:    { label: 'Gebäudesicherheit',   farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  pruefung:    { label: 'Prüfpflichten',       farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  uvv:         { label: 'Unfallverhütung',     farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  extern:      { label: 'Behörden/Extern',     farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  schulung:    { label: 'Sicherheitsschulung', farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const STATUS_CFG: Record<SiStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: SiEintrag[] = [
  {
    id: 'si1', typ: 'brandschutz', titel: 'Brandschutz & Feuerlöscher',
    datum: 'Wartung 19.05.', verantwortlich: 'Hausmeister Hr. Klein + Kita-Ltg.', status: 'faellig',
    punkte: [
      'Feuerlöscher: 6 Geräte (Kita-Eingang 2, Küche 2, Keller 1, Garten 1)',
      'Wartung fällig: 19.05.2026 (Fachfirma Brandschutz GmbH, Termin bestätigt)',
      'Brandmelder: 8 Rauchmelder (letzter Test Apr 2026 — alle ok)',
      'Brandschutzordnung: ausgehängt (alle 3 Gruppenräume + Eingang, aktuell)',
      'Brandschutzbeauftragter: Hr. Klein (Schulung 2023 — Auffrischung 2026 fällig!)',
    ],
  },
  {
    id: 'si2', typ: 'evakuierung', titel: 'Evakuierungsplan & Brandschutzübungen',
    datum: 'Übung Apr: ok', verantwortlich: 'Kita-Ltg. + Brandschutzbeauftr.', status: 'aktiv',
    punkte: [
      'Brandschutzübung: 2×/Jahr (Apr + Okt), letzter Apr 2026 — Evakuierung 2:48 Min.',
      'Evakuierungsplan: ausgehängt, alle Fluchtwege markiert + beleuchtet',
      'Sammelplatz: Parkplatz Nordseite (alle MA kennen Sammelplatz)',
      'Rollstuhlkind: 1 Kind (Evakuierungsplan angepasst, Tragestuhl vorhanden)',
      'Übungsprotokoll: Apr-Übung dokumentiert (Träger + Feuerwehr-Kopie)',
    ],
  },
  {
    id: 'si3', typ: 'gebaeude', titel: 'Gebäudesicherheit & Zugang',
    datum: 'Regelmäßige Prüfung', verantwortlich: 'Kita-Ltg. + Hausmeister', status: 'aktiv',
    punkte: [
      'Eingangsanlage: Klingel + Video-Einlass (kein unkontrollierter Zugang)',
      'Schlüsselverwaltung: Liste alle 14 Schlüsselinhaber (Aktualisierung Mai nötig!)',
      'Tore Außengelände: selbstschließend + verriegelt (tägl. Prüfung Pausenaufsicht)',
      'Defekte Steckdosen: Raum 2 (gesperrt, Elektriker Auftrag 25.04. — Termin offen)',
      'Geländer Treppenhaus: Wartung Apr 2026 ok (nächste: Apr 2027)',
    ],
  },
  {
    id: 'si4', typ: 'pruefung', titel: 'Pflichtprüfungen & Prüfkalender',
    datum: 'Prüfkalender 2026', verantwortlich: 'Kita-Ltg. + Träger', status: 'handlungsbedarf',
    punkte: [
      'Spielgeräte Außen: Sicherheitsprüfung überfällig (letzte Apr 2025 — sofort!)',
      'Feuerlöscher: 19.05. (Termin bestätigt)',
      'Elektroanlagen (DGUV V3): letzte Prüfung 2023 — nächste 2027 (4-Jahres-Rhythmus)',
      'Aufzug: keiner vorhanden (entfällt)',
      'Heizungsanlage: Jährliche Überprüfung Nov 2025 ok (nächste Nov 2026)',
    ],
  },
  {
    id: 'si5', typ: 'uvv', titel: 'Unfallverhütung & Gefährdungsbeurteilung',
    datum: 'GB: 2024', verantwortlich: 'Kita-Ltg. + Betriebsarzt', status: 'geplant',
    punkte: [
      'Gefährdungsbeurteilung: letzte 2024 (Aktualisierung fällig bei Änderungen)',
      'Betriebsarzt: Dr. Müller (Vorsorge 4 MA bis 01.06. — Termine noch nicht gebucht!)',
      'Unfälle SJ: 4 Kleinstunfälle (alle dokumentiert, Unfallbuch geführt)',
      'Rutschfeste Böden: alle Nassräume geprüft (Küche, Waschraum — ok)',
      'Psychische Gefährdung: nächste GB-Erweiterung Sep 2026 (Träger-Vorgabe)',
    ],
  },
]

export default function SicherheitsplanungPage() {
  const [expanded, setExpanded] = useState<string | null>('si4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Spielgeräte-Prüfung überfällig (sofort!). Feuerlöscher 19.05. Betriebsarzt 4 MA bis 01.06. buchen. Steckdose Raum 2 defekt.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShieldAlert className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Sicherheitsplanung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Brandschutz · Evakuierung · Gebäude · Prüfpflichten · Unfallverhütung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Prüfung fäll.',val: 1, color: '#ef4444' },
          { label: 'Feuerlöscher',val: '19.05.', color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Spielgeräte-Prüfung sofort nachholen — Betriebsarzt bis 01.06. buchen — Steckdose Raum 2 reparieren</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Sicherheitsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Sicherheitsübersicht'}
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
