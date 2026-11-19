'use client'

import { useState } from 'react'
import { Inbox, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Büroorganisation — kids-mindry ─────────────────────────────────────────────
// Post · Ablage · Termine · Beschaffung · Kommunikation · Dienstpläne

type BueroTyp = 'ablage' | 'post' | 'kommunikation' | 'beschaffung' | 'dienstplan' | 'termine' | 'bueroausstattung'
type BueroStatus = 'ok' | 'handlungsbedarf' | 'in_bearbeitung' | 'erledigt' | 'kritisch'

interface BueroEintrag {
  id: string
  typ: BueroTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: BueroStatus
  punkte: string[]
}

const TYP_CFG: Record<BueroTyp, { label: string; emoji: string; farbe: string }> = {
  ablage:          { label: 'Ablage/Archiv',    emoji: '🗂️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  post:            { label: 'Post/E-Mail',      emoji: '📬', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kommunikation:   { label: 'Kommunikation',    emoji: '💬', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  beschaffung:     { label: 'Beschaffung',      emoji: '🛒', farbe: 'bg-green-50 text-green-700 border-green-200' },
  dienstplan:      { label: 'Dienstplan',       emoji: '📅', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  termine:         { label: 'Termine/Kalender', emoji: '🗓️', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  bueroausstattung:{ label: 'Büroausstattung',  emoji: '🖥️', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
}

const STATUS_CFG: Record<BueroStatus, { label: string; farbe: string }> = {
  ok:              { label: 'OK',              farbe: 'text-green-600' },
  handlungsbedarf: { label: 'Handlungsbedarf', farbe: 'text-orange-500' },
  in_bearbeitung:  { label: 'In Bearbeitung',  farbe: 'text-teal-600' },
  erledigt:        { label: 'Erledigt',        farbe: 'text-gray-400' },
  kritisch:        { label: 'Kritisch!',       farbe: 'text-red-600' },
}

const EINTRAEGE: BueroEintrag[] = [
  {
    id: 'bo1', typ: 'dienstplan', titel: 'Dienstplan Mai–Jun 2026',
    datum: 'Veröffentlichung: 28.04.2026', verantwortlich: 'SL', status: 'in_bearbeitung',
    punkte: ['Dienstplan Mai: Entwurf (Veröffentlichung 28.04. geplant)', 'Urlaub Mai: Fr. Schmidt (01.–09.05., genehmigt), Hr. Bauer (TBD)', 'Springer: Fr. Neumann (Träger-Pool, 3 Tage verf.)', 'Überstundenabbau: Fr. Wagner (4h fällig bis Jun)', 'Dienstplan Jun: nach Sommerferienplanung (ab 05.05. abstimmen)'],
  },
  {
    id: 'bo2', typ: 'post', titel: 'Post & E-Mail-Management',
    datum: 'Lfd.', verantwortlich: 'SL + Verwaltungskraft', status: 'ok',
    punkte: ['Eingangspost: täglich sichten (SL), Weiterleitung digital', 'E-Mail: kita@[einrichtung].de (SL + Verwaltung)', 'Träger-Rundschreiben: Posteingang Apr (3 offene Punkte bearbeitet)', 'Elternpost: Sicherheitsprotokoll-Quittung noch ausstehend (1 Familie)', 'Archivierung: Brief-/E-Mail-Ablage DSGVO-konform (Träger-Cloud)'],
  },
  {
    id: 'bo3', typ: 'beschaffung', titel: 'Beschaffung & Bestellwesen Mai 2026',
    datum: 'Bestellung bis: 05.05.2026', verantwortlich: 'SL + Gruppen-Verantw.', status: 'handlungsbedarf',
    punkte: ['Fingerfarben: Nachbestellung (s. Materialverwaltung, kritisch)', 'Büromaterial: Papier A4 (5 Päckchen), Toner Drucker (1x)', 'Spielzeug-Budget Mai: 80 € verfügbar (Träger genehmigt)', 'Reinigungsmittel: Bestellung läuft (Träger-Rahmenvertrag)', 'Bestellgrenze: >150 € = Träger-Freigabe erforderlich'],
  },
  {
    id: 'bo4', typ: 'termine', titel: 'Terminkalender & Konferenzen Mai–Jun',
    datum: 'Lfd.', verantwortlich: 'SL', status: 'ok',
    punkte: ['28.04.: Dienstplan Mai veröffentlichen', '05.05.: Beschaffungsbestellung Träger', '10.05.: Frühlingsbasar (s. Elternabend)', '15.05.–30.05.: Entwicklungsberichte + Elterngespräche', '04.06.: Interdisziplinäre Fachkonferenz (SPZ)', '15.06.: Übergangsportfolio-Übergabe GS Am Park'],
  },
  {
    id: 'bo5', typ: 'kommunikation', titel: 'Eltern-Kommunikationskanäle',
    datum: 'Lfd.', verantwortlich: 'Alle Fachkräfte', status: 'ok',
    punkte: ['Hauptkanal: App (datenschutzkonforme Kita-App, Träger-Lizenz)', 'Aushang: Flur Garderobe (aktuelle Infos wöchentlich)', 'Elternbriefe: max. 1x/Monat (digital + Papier)', 'Notfallkette: Telefon SL-Büro → Handy SL (28-Stunden-Erreichbarkeit)', 'WhatsApp/private Gruppen: offiziell nicht genutzt (DSGVO!)'],
  },
]

export default function BueroorganisationPage() {
  const [expanded, setExpanded] = useState<string | null>('bo1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const handlungsbedarf = EINTRAEGE.filter(e => e.status === 'handlungsbedarf' || e.status === 'kritisch').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bürobereiche. Dienstplan Mai: Veröffentlichung 28.04. Beschaffungsbestellung: bis 05.05. Fingerfarben kritisch. Terminkalender: Basar 10.05.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Inbox className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Büroorganisation
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Dienstplan · Beschaffung · Post · Termine · Kommunikation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length,  color: 'text-blue-600' },
          { label: 'OK',        val: EINTRAEGE.filter(e => e.status === 'ok').length, color: 'text-green-600' },
          { label: 'Handlungsb.', val: handlungsbedarf, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {handlungsbedarf > 0 && (
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Beschaffungsbestellung bis 05.05. — Fingerfarben nachbestellen (kritisch)!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Büroübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Büroübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'handlungsbedarf' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
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
