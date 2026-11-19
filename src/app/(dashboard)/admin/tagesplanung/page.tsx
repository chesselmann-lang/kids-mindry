'use client'

import { useState } from 'react'
import { Clock3, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Tagesplanung — kids-mindry ────────────────────────────────────────────────
// Tagesstruktur · Dienstplan · Mahlzeiten · Schlaf · Übergaben

type TPTyp = 'struktur' | 'dienstplan' | 'mahlzeiten' | 'schlaf' | 'freispiel' | 'uebergabe' | 'doku'
type TPStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface TPEintrag {
  id: string
  typ: TPTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: TPStatus
  punkte: string[]
}

const TYP_CFG: Record<TPTyp, { label: string; farbe: string }> = {
  struktur:   { label: 'Tagesstruktur',  farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  dienstplan: { label: 'Dienstplan',     farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  mahlzeiten: { label: 'Mahlzeiten',     farbe: 'bg-green-50 text-green-700 border-green-200' },
  schlaf:     { label: 'Schlaf/Ruhe',    farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  freispiel:  { label: 'Freispiel',      farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  uebergabe:  { label: 'Übergabe',       farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  doku:       { label: 'Tagesdoku',      farbe: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_CFG: Record<TPStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: TPEintrag[] = [
  {
    id: 'tp1', typ: 'struktur', titel: 'Tagesstruktur & Ablaufplan',
    datum: 'Mo–Fr 7:00–17:00', verantwortlich: 'Gruppenleitung', status: 'aktiv',
    punkte: [
      '7:00–8:00: Frühdienst (Gr.übergreifend, 1 MA), Freispiel + Ankommen',
      '8:00–9:30: Morgenkreis 8:15 (alle Gruppen), Freispiel, Angebote vorbereiten',
      '9:30–11:30: Angebote / Projekte / Freispiel + Garten (witterungsabhängig)',
      '11:30–13:00: Mittagessen + Schlaf-/Ruhephase (Krippe 11:30, Kita 12:00)',
      '15:30–17:00: Spätdienst (Gr.übergreifend), Elternabholung, Übergabe',
    ],
  },
  {
    id: 'tp2', typ: 'dienstplan', titel: 'Dienstplan & Schichtplanung',
    datum: 'Monatl. Planung', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Dienstplan: monatlich (bis 25. des Vormonats, Aushang + KitaPlus-App)',
      'Frühdienst: 7:00 (1 MA, Wechsel wöchentlich reihum)',
      'Spätdienst: bis 17:00 (1 MA, Wechsel wöchentlich reihum)',
      'Mindestbesetzung: 2 MA pro Gruppe in Kernzeit (BGKJHG NRW)',
      'Urlaubs-/Krankheitslücken: Springerpool (3 MA) oder Gruppen-Zusammenlegung',
    ],
  },
  {
    id: 'tp3', typ: 'mahlzeiten', titel: 'Mahlzeiten & Verpflegungskonzept',
    datum: 'Tägl. Catering', verantwortlich: 'Hauswirtschaft + Gruppenltg.', status: 'aktiv',
    punkte: [
      'Frühstück: 8:30 (Buffet, Eltern bringen mit — Allergienliste aushängen)',
      'Mittagessen: Caterer "FrischKost GmbH" (tägl. 11:45 Lieferung, Menüwahl 2)',
      'Vesper: 15:00 (Kita-Küche, saisonal + Vollkorn, Budget Träger)',
      'Allergien/Intoleranzen: 8 Kinder (Liste Küche + Gruppen laminiert, aktuell)',
      'Nächste Catering-Evaluation: Okt 2026 (Elternbeirat-Umfrage geplant)',
    ],
  },
  {
    id: 'tp4', typ: 'schlaf', titel: 'Schlaf- & Ruhephase Krippe',
    datum: '11:30–13:30', verantwortlich: 'Krippengruppe', status: 'aktiv',
    punkte: [
      'Schlafraum Krippe: 8 Betten (Schlafplan individuell je Kind, Eltern-Absprache)',
      'Schlafaufsicht: 1 MA anwesend während gesamter Schlafzeit (SHK NRW §§)',
      'Schlafprotokoll: tägl. Eintrag (Uhrzeit ein/auf, Auffälligkeiten) in KitaPlus',
      'Einschlafhilfen: individuell (Schnuller, Schmusetier — Elternvereinbarung)',
      'Kita-Kinder: 12:30–13:30 Ruhephase (keine Schlafpflicht, Bücher/Ruhe)',
    ],
  },
  {
    id: 'tp5', typ: 'uebergabe', titel: 'Übergabe & Abholregelung',
    datum: 'Tägl. Protokoll', verantwortlich: 'Gruppenleitung', status: 'handlungsbedarf',
    punkte: [
      'Übergabe Früh-/Spätdienst: mündl. + KitaPlus-Notiz (Vorkommnisse, Befinden)',
      'Abholberechtigung: Liste je Kind (max. 5 Personen, Lichtbildausweis 1. Mal)',
      'Unbekannte Abholung: Eltern müssen telefonisch bestätigen (1 Vorfall Mai!)',
      'Abholprotokoll: Spätdienst zeichnet alle Abholzeiten auf (Aufsichtspflicht)',
      'Verbesserung: Digitale Abholsignatur geplant ab Sep 2026 (Träger evaluiert)',
    ],
  },
]

export default function TagesplanungPage() {
  const [expanded, setExpanded] = useState<string | null>('tp1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 7:00–17:00 Betriebszeit. Dienstplan monatlich. 8 Allergien. 1 Abholvorfall Mai — Protokoll prüfen. Dig. Abholsignatur Sep geplant.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Clock3 className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Tagesplanung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Tagesstruktur · Dienstplan · Mahlzeiten · Schlaf · Übergaben</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Öffnung',   val: '10h', color: '#0d9488' },
          { label: 'Allergien', val: 8, color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Abholvorfall Mai prüfen — Dienstplan Jun bis 25.05. fertig — Übergabe-Protokoll aktualisieren</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Tagesübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Tagesübersicht'}
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
