'use client'

import { useState } from 'react'
import { Handshake, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Zusammenarbeit — kids-mindry ──────────────────────────────────────────────
// Elternkooperation · Netzwerkpartner · Schnittstellen · Kooperationsverträge

type ZATyp = 'eltern' | 'netzwerk' | 'schnittstelle' | 'vertrag' | 'beratung' | 'ehrenamt' | 'oeffentlich'
type ZAStatus = 'aktiv' | 'geplant' | 'faellig' | 'abgeschlossen' | 'handlungsbedarf'

interface ZAEintrag {
  id: string
  typ: ZATyp
  titel: string
  datum?: string
  verantwortlich: string
  status: ZAStatus
  punkte: string[]
}

const TYP_CFG: Record<ZATyp, { label: string; farbe: string }> = {
  eltern:      { label: 'Elternkooperation', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  netzwerk:    { label: 'Netzwerkpartner',   farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  schnittstelle:{ label: 'Schnittstellen',   farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  vertrag:     { label: 'Kooperationsvertrag',farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  beratung:    { label: 'Fachberatung',      farbe: 'bg-green-50 text-green-700 border-green-200' },
  ehrenamt:    { label: 'Ehrenamt',          farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  oeffentlich: { label: 'Öffentlichkeitsarb.',farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<ZAStatus, { label: string; farbe: string }> = {
  aktiv:         { label: 'Aktiv',           farbe: 'text-teal-600' },
  geplant:       { label: 'Geplant',         farbe: 'text-blue-400' },
  faellig:       { label: 'Fällig',          farbe: 'text-red-500' },
  abgeschlossen: { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf',farbe: 'text-orange-500' },
}

const EINTRAEGE: ZAEintrag[] = [
  {
    id: 'za1', typ: 'eltern', titel: 'Elternkooperation & Elterncafé',
    datum: 'Lfd. — nächstes Café 14.05.', verantwortlich: 'Kita-Ltg. + Gruppenerzieher:innen', status: 'aktiv',
    punkte: [
      'Elterncafé: monatlich (Mi 15–17h, Gruppenraum A) — nächster Termin 14.05.',
      'Elterngespräche: mind. 2×/Jahr pro Kind (Protokoll in Kindakte)',
      'Tür-und-Angel-Gespräche: tägl. Bringzeit (Erzieher:innen verfügbar)',
      'Elternumfrage 2025: Gesamtzufriedenheit 4,3/5 (Ausw. im Jahresbericht)',
      'Elternbeirat: Sitzung 20.05. (Fr. Hofer, 3 Mitglieder — Quorum prüfen!)',
    ],
  },
  {
    id: 'za2', typ: 'netzwerk', titel: 'Kooperationspartner & Netzwerke',
    datum: 'Aktuelle Verträge', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Grundschule Pestalozzi: Kooperationsvertrag (Übergang Kita→Schule, Besuche Apr)',
      'Frühförderstelle: 5 Kinder betreut, Fachberatung Fr. Weber (monatlich)',
      'Jugendamt: Ansprechpartnerin Fr. Bachmann (Fallgespräche bei Bedarf)',
      'VHS: Elternkurse "Starke Eltern – Starke Kinder" (2×/Jahr, Kooperation)',
      'AWO-Netzwerk: Stadtteilkonferenz Frühe Hilfen (Ltg. nimmt teil, quartalsweise)',
    ],
  },
  {
    id: 'za3', typ: 'schnittstelle', titel: 'Übergang Kita – Grundschule',
    datum: 'Übergangsgespräche Mai/Jun', verantwortlich: 'Kita-Ltg. + Gruppenleitung', status: 'aktiv',
    punkte: [
      'Schulkinder 2026: 14 Kinder (Grundschule Pestalozzi 10, freie Wahl 4)',
      'Übergabegespräche: mit Grundschule 20.05. (Terminbestätigung ausstehend!)',
      'Schulvorbereitung: wöchentl. Vorschulgruppe (Di 9–11h, Fr. Nowak)',
      'Schulbesuch: Schnuppertag 03.06. (14 Kinder angemeldet)',
      'Übergabebogen: bei Einverständnis Eltern (DSGVO, Einverständnis 12/14 erhalten)',
    ],
  },
  {
    id: 'za4', typ: 'vertrag', titel: 'Kooperationsverträge & Verlängerungen',
    datum: 'Prüfung fällig!', verantwortlich: 'Kita-Ltg. + Träger', status: 'faellig',
    punkte: [
      'Kooperationsvertrag Grundschule: läuft aus 31.07.2026 — Verlängerung bis 15.05.!',
      'Frühförderstelle: unbefristet (letzte Überprüfung 2023 — Update nötig)',
      'Logopädie-Praxis Maier: Kooperation (informell, kein Vertrag — formalisieren!)',
      'Trägervertrag Betriebskita: überprüfen (Indexanpassung Elternbeiträge Jul)',
      'Datenweitergabe: alle Kooperationsverträge DSGVO-konform prüfen (Träger)',
    ],
  },
  {
    id: 'za5', typ: 'oeffentlich', titel: 'Öffentlichkeitsarbeit & Außendarstellung',
    datum: 'Kita-Fest 21.06.', verantwortlich: 'Kita-Ltg. + Team', status: 'geplant',
    punkte: [
      'Kita-Fest: 21.06.2026 (14–18h, Außengelände, alle Familien eingeladen)',
      'Website: letztes Update Jan 2026 — Fotos + Konzept aktualisieren (Mai)',
      'Lokalpresse: Beitrag über Sprachförderungsprojekt geplant (Jun)',
      'Social Media: Eltern-Newsletter monatl. (kein öffentl. Social Media — Datenschutz)',
      'Tag der offenen Tür: Sep 2026 (Planung noch nicht begonnen — bis Jun festlegen)',
    ],
  },
]

export default function ZusammenarbeitPage() {
  const [expanded, setExpanded] = useState<string | null>('za4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Kooperationsvertrag Grundschule läuft ab (bis 15.05. verlängern!). 14 Schulkinder-Übergabe Mai/Jun. Elterncafé 14.05. Kita-Fest 21.06.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Handshake className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Zusammenarbeit
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Elternkooperation · Netzwerk · Übergang Schule · Verträge · Öffentlichkeit</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Schulkinder', val: 14, color: '#0d9488' },
          { label: 'Vertrag fällig', val: 1, color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Kooperationsvertrag Grundschule bis 15.05. verlängern — Übergabegespräch 20.05. bestätigen — Logopädie formalisieren</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Kooperationsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Kooperationsübersicht'}
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
