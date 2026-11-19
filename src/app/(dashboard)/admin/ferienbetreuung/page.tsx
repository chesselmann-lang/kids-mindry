'use client'

import { useState } from 'react'
import { Umbrella, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Ferienbetreuung — kids-mindry ─────────────────────────────────────────────
// Ferienangebote · Anmeldung · Personal · Programm · Abrechnung

type FBTyp = 'angebot' | 'anmeldung' | 'personal' | 'programm' | 'abrechnung' | 'extern' | 'recht'
type FBStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface FBEintrag {
  id: string
  typ: FBTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: FBStatus
  punkte: string[]
}

const TYP_CFG: Record<FBTyp, { label: string; farbe: string }> = {
  angebot:    { label: 'Ferienangebot',  farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  anmeldung:  { label: 'Anmeldung',     farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  personal:   { label: 'Personal',      farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  programm:   { label: 'Programm',      farbe: 'bg-green-50 text-green-700 border-green-200' },
  abrechnung: { label: 'Abrechnung',    farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  extern:     { label: 'Externe Part.', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  recht:      { label: 'Rechtl. Rahmen',farbe: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_CFG: Record<FBStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: FBEintrag[] = [
  {
    id: 'fb1', typ: 'angebot', titel: 'Ferienbetreuungsangebote Überblick',
    datum: 'Sommer: 5 Wochen', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Sommerferien 2026: 5 Wochen Betreuung (25.07.–29.08., 1 Woche Schließung 01.–08.08.)',
      'Herbstferien: 2 Wochen (12.10.–23.10.2026, volle Öffnung 7:00–17:00)',
      'Weihnachten: 23.12.–06.01. geschlossen (Träger-Vorgabe, Ausnahme auf Antrag)',
      'Randzeiten Alltag: 7:00–8:00 + 16:00–17:00 (Früh- und Spätbetreuung, tägl.)',
      'Anmeldepflicht Ferien: 4 Wochen im Voraus (Bedarfsplanung Personal + Catering)',
    ],
  },
  {
    id: 'fb2', typ: 'anmeldung', titel: 'Ferienanmeldung & Bedarfserfassung',
    datum: 'Sommer-Anm.: bis 30.05.!', verantwortlich: 'Kita-Ltg.', status: 'faellig',
    punkte: [
      'Sommerferien-Anmeldung: Frist 30.05.2026 — 41/73 Kinder angemeldet (32 ausstehend!)',
      'Anmeldebogen: digital via KitaPlus-Portal (Eltern-Login) + Papierformular als Backup',
      'Mindestbelegung: 8 Kinder/Woche (sonst Personalanpassung, Eltern informieren)',
      'Woche 01.08.: Schließwoche — Eltern informiert (IServ-Rundschreiben Apr)',
      'Herbst-Anmeldung: startet Sep 2026 (Erinnerung KitaPlus + Aushang)',
    ],
  },
  {
    id: 'fb3', typ: 'personal', titel: 'Personaleinsatz Ferienzeiten',
    datum: 'Sommer: 4 MA geplant', verantwortlich: 'Kita-Ltg. + Personalplanung', status: 'geplant',
    punkte: [
      'Ferienpersonal: min. 4 MA/Tag (Betreuungsschlüssel 1:8 im Sommer)',
      'Urlaubsplanung: 3 MA Urlaub Schließwoche, 2 MA wöchentlich reihum (Plan bis Jun)',
      'Honorarkräfte: 2 Springer für Sommer (Vereinbarung läuft bis Jul)',
      'FSJ/BFD: 2 Personen im Sommer verfügbar (Bestandteil Regelplanung)',
      'Vertretungspool: 3 externe Fachkräfte (Vermittlung über Träger bei Engpässen)',
    ],
  },
  {
    id: 'fb4', typ: 'programm', titel: 'Ferienprogramm & Aktivitäten',
    datum: 'Konzept bis 20.06.', verantwortlich: 'Gruppenleitung', status: 'geplant',
    punkte: [
      'Sommerprogramm: Wochen-Themen (Wasser, Natur, Bewegung, Kreativ, Abschluss)',
      'Ausflüge geplant: Freibad (Jul), Tierpark (Aug) — Elternbeiträge genehmigt',
      'Projektwoche Abschluss: 25.–29.08. (Kindergartenjahr-Abschluss Gr.1+2)',
      'Verpflegung: Cateringservice Sommer-Menu (Vertrag Träger, kein Zuzahlung)',
      'Notfallprogramm Regen: Indoor-Aktivitäten (Bastelboxen + Bewegungsraum)',
    ],
  },
  {
    id: 'fb5', typ: 'abrechnung', titel: 'Abrechnung & Beitragsregelung',
    datum: 'Lfd. Abrechnung', verantwortlich: 'Kita-Ltg. + Träger', status: 'aktiv',
    punkte: [
      'Ferienbeitrag: kein Zusatzbeitrag (regulärer Monatsbeitrag gilt für Sommerbetreuung)',
      'Schließzeit: kein Beitrag für Schließwoche 01.–08.08. (Träger-Verrechnung)',
      'Früh-/Spätbetreuung: 15€/Monat Pauschale (Einzug SEPA, Träger-Abwicklung)',
      'Förderantrag Ferienbetreuung: Jugendamt-Zuschuss 1.200€/Jahr (bewilligt)',
      'Abrechnung Ausflüge: Einzelbelege Kita-Kasse, monatl. Abschluss Träger',
    ],
  },
]

export default function FerienbetreuungPage() {
  const [expanded, setExpanded] = useState<string | null>('fb2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Sommer-Anmeldung bis 30.05. (32 ausstehend!). 5 Wochen Sommer, 1 Schließwoche. 4 MA geplant. Programm-Konzept bis 20.06.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Umbrella className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Ferienbetreuung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Angebote · Anmeldung · Personal · Programm · Abrechnung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Sommer-Wo.', val: 5, color: '#0d9488' },
          { label: 'Anm. offen', val: 32, color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Sommer-Anmeldung bis 30.05. (32 noch offen!) — Programm-Konzept bis 20.06. — Personalplan Jun</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Ferienübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Ferienübersicht'}
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
