'use client'

import { useState } from 'react'
import { BellRing, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Notaufnahme — kids-mindry ─────────────────────────────────────────────────
// Plötzliche Aufnahmen · Ausnahmesituationen · Krisenaufnahme · Jugendamtsfälle

type NATyp = 'aufnahme' | 'krisenfall' | 'jugendamt' | 'notfall' | 'dokumentation' | 'kapazitaet' | 'recht'
type NAStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface NAEintrag {
  id: string
  typ: NATyp
  titel: string
  datum?: string
  verantwortlich: string
  status: NAStatus
  punkte: string[]
}

const TYP_CFG: Record<NATyp, { label: string; farbe: string }> = {
  aufnahme:    { label: 'Notaufnahme',      farbe: 'bg-red-50 text-red-700 border-red-200' },
  krisenfall:  { label: 'Krisenfall',       farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  jugendamt:   { label: 'Jugendamt/ASD',    farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  notfall:     { label: 'Medizin. Notfall', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  dokumentation:{ label: 'Dokumentation',  farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kapazitaet:  { label: 'Kapazitätsmanag.',farbe: 'bg-green-50 text-green-700 border-green-200' },
  recht:       { label: 'Rechtl. Grundlagen',farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<NAStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: NAEintrag[] = [
  {
    id: 'na1', typ: 'aufnahme', titel: 'Notaufnahme-Verfahren & Ablaufprotokoll',
    datum: 'Verfahren aktuell', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Notaufnahme-Ablauf: schriftlich fixiert (Träger-Vorlage, letzte Revision 2024)',
      'Trigger: Jugendamt-Einweisung, akute Obdachlosigkeit, häusl. Krisensituation',
      'Entscheidung: Kita-Ltg. + Träger (binnen 24h, Kapazitätsprüfung vorab)',
      'Notaufnahme-Plätze: max. 2 gleichzeitig (über Regelkapazität, Ausnahme)',
      'Information Team: alle Erzieher:innen bei Notaufnahme sofort informieren',
    ],
  },
  {
    id: 'na2', typ: 'krisenfall', titel: 'Krisenfälle & Kindeswohlgefährdung',
    datum: 'Aktuell: 1 aktiver Fall', verantwortlich: 'Kita-Ltg. + Fachberatung', status: 'handlungsbedarf',
    punkte: [
      'Kindeswohlgefährdung § 8a SGB VIII: Einschätzungsbogen + Fachberatung (Pflicht)',
      'Aktiver KWG-Fall: 1 Kind (Beobachtungsphase, Fachberatung eingeschaltet)',
      'Meldepflicht: bei konkretem Verdacht → Jugendamt (ASD) sofort informieren',
      'Protokollpflicht: alle Beobachtungen datiert und unterschrieben dokumentieren',
      'Fachberatung Kinder- und Jugendhilfe: Fr. Berger AWO (Notruf + Wochentermin)',
    ],
  },
  {
    id: 'na3', typ: 'jugendamt', titel: 'Jugendamt & Allgemeiner Sozialdienst (ASD)',
    datum: 'Kooperationsvertrag aktiv', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'ASD-Ansprechpartnerin: Fr. Bachmann (Jugendamt Stadt, Direktleitung Kita)',
      'Meldungen SJ: 2 (1 § 8a-Meldung abgeschlossen, 1 aktiv in Beobachtung)',
      'Fallkonferenz: bei aktiven Fällen monatlich (Kita + ASD + ggf. Eltern)',
      'Krisenhotline Jugendamt: 0211-XXXX (Notfallnummer, sichtbar im Büro Kita-Ltg.)',
      'Kooperationsvertrag Jugendamt: aktuell (erneuert Jan 2025)',
    ],
  },
  {
    id: 'na4', typ: 'notfall', titel: 'Medizinische Notfälle & Erste Hilfe',
    datum: 'EH-Schulung aktuell prüfen!', verantwortlich: 'Alle MA + Kita-Ltg.', status: 'handlungsbedarf',
    punkte: [
      'Notruf 112: Standardprozedur (Aushang in jedem Gruppenraum + Küche)',
      'EH-Ausrüstung: 3 Verbandskästen (Kita-Eingang, Gruppenraum, Garten — geprüft)',
      'Erste-Hilfe-Ausbildung: 2 MA mit EH-Auffrischung überfällig (>2 Jahre)',
      'Allergie-Notfallplan: 3 Kinder mit Notfallplan + Epipen (Formular aktuell)',
      'Krankenhaus-Kontakt: Kinderklinik A (500m, Rettungsweg markiert)',
    ],
  },
  {
    id: 'na5', typ: 'dokumentation', titel: 'Dokumentation Ausnahmesituationen',
    datum: 'Aufbewahrung 10 Jahre', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Unfallmeldepflicht: Unfallanzeige binnen 3 Tagen (GUV/Träger, alle Unfälle)',
      'Unfälle SJ: 4 Kleinstunfälle (alle dokumentiert, keiner meldepflichtig)',
      'Krisendokumentation: handschriftlich + eingescannt (Kinderschutzmappe, SL-Büro)',
      'Aufbewahrung: alle Sondervorgänge 10 Jahre (Träger-Regelung)',
      'Schweigepflicht: Falldetails nur im berechtigten Team (DSGVO-Schulung Sep)',
    ],
  },
]

export default function NotaufnahmePage() {
  const [expanded, setExpanded] = useState<string | null>('na2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 1 aktiver KWG-Fall (Beobachtung + ASD). 2 MA EH-Auffrischung überfällig. 2 JA-Meldungen SJ. Notaufnahme-Ablauf aktuell.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <BellRing className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Notaufnahme
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Notaufnahme · Kindeswohlgefährdung · Jugendamt · Notfall · Dokumentation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'KWG-Fälle',  val: 1, color: '#ef4444' },
          { label: 'JA-Meld. SJ',val: 2, color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>1 aktiver KWG-Fall (Fachberatung läuft) — 2 MA EH-Auffrischung überfällig — § 8a-Dokumentation aktuell halten</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Notaufnahme-Übersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Notaufnahme-Übersicht'}
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
