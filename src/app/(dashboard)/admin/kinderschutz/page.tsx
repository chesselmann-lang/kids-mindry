'use client'

import { useState } from 'react'
import { ShieldAlert, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle, Lock } from 'lucide-react'

// ── Kinderschutz — kids-mindry ────────────────────────────────────────────────
// Kinderschutz · §8a SGB VIII · Meldungen · Schutzkonzept · Fachkraftnachweise

type MeldungTyp = 'verdacht' | 'beobachtung' | 'gespraech' | 'meldung_jug' | 'kollegialer_austausch' | 'elterngespraech' | 'beratung_insofern'
type MeldungStatus = 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'weitergeleitet'

interface SchutzMassnahme {
  bezeichnung: string
  verantwortlich: string
  status: 'umgesetzt' | 'geplant' | 'offen'
  frist?: string
}

interface KindSchutzMeldung {
  id: string
  typ: MeldungTyp
  datum: string
  bearbeitung: string
  status: MeldungStatus
  vertraulich: boolean
  massnahmen: SchutzMassnahme[]
  notiz?: string
}

const TYP_CFG: Record<MeldungTyp, { label: string; emoji: string; farbe: string }> = {
  verdacht:            { label: 'Gefährdungsverdacht',    emoji: '🚨', farbe: 'bg-red-50 text-red-700 border-red-200' },
  beobachtung:         { label: 'Beobachtung',             emoji: '👁️', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  gespraech:           { label: 'Fachkraftgespräch',       emoji: '💬', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  meldung_jug:         { label: 'Meldung Jugendamt',       emoji: '📋', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  kollegialer_austausch:{ label: 'Kollegialer Austausch',  emoji: '🤝', farbe: 'bg-green-50 text-green-700 border-green-200' },
  elterngespraech:     { label: 'Elterngespräch',          emoji: '👪', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  beratung_insofern:   { label: 'Beratung insoweit eFk',   emoji: '🏛️', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const STATUS_CFG: Record<MeldungStatus, { label: string; farbe: string }> = {
  offen:          { label: 'Offen',          farbe: 'text-orange-500' },
  in_bearbeitung: { label: 'In Bearbeitung', farbe: 'text-blue-500' },
  abgeschlossen:  { label: 'Abgeschlossen',  farbe: 'text-green-600' },
  weitergeleitet: { label: 'Jugendamt ✓',    farbe: 'text-purple-600' },
}

const MELDUNGEN: KindSchutzMeldung[] = [
  {
    id: 'ks1', typ: 'beobachtung', datum: '08.04.2026', bearbeitung: 'S. Berger',
    status: 'in_bearbeitung', vertraulich: true,
    massnahmen: [
      { bezeichnung: 'Systematische Beobachtungsdokumentation', verantwortlich: 'Gruppenerzieher:in', status: 'umgesetzt' },
      { bezeichnung: 'Beratung insoweit erfahrene Fachkraft', verantwortlich: 'S. Berger', status: 'umgesetzt', frist: '15.04.2026' },
      { bezeichnung: 'Elterngespräch vorbereiten', verantwortlich: 'S. Berger', status: 'geplant', frist: '30.04.2026' },
    ],
    notiz: 'Beobachtungen systematisch dokumentiert. Insoweit eFk konsultiert am 10.04.',
  },
  {
    id: 'ks2', typ: 'meldung_jug', datum: '15.02.2026', bearbeitung: 'S. Berger',
    status: 'weitergeleitet', vertraulich: true,
    massnahmen: [
      { bezeichnung: 'Meldung Jugendamt gem. §8a SGB VIII', verantwortlich: 'S. Berger', status: 'umgesetzt' },
      { bezeichnung: 'Dokumentation Gefährdungsbogen', verantwortlich: 'S. Berger', status: 'umgesetzt' },
      { bezeichnung: 'Rückmeldung Jugendamt ausstehend', verantwortlich: 'Jugendamt', status: 'offen' },
    ],
    notiz: 'ASD zuständig. Kontaktperson: Herr Müller, Tel. 0123-456789',
  },
  {
    id: 'ks3', typ: 'gespraech', datum: '20.03.2026', bearbeitung: 'M. Hofmann',
    status: 'abgeschlossen', vertraulich: false,
    massnahmen: [
      { bezeichnung: 'Kollegiale Fallbesprechung', verantwortlich: 'Team Gruppe 2', status: 'umgesetzt' },
      { bezeichnung: 'Verstärkte Beobachtung für 4 Wochen', verantwortlich: 'M. Hofmann', status: 'umgesetzt' },
    ],
  },
]

const SCHUTZKONZEPT_BAUSTEINE = [
  { bezeichnung: 'Schutzkonzept verschriftlicht & aktuell', status: true },
  { bezeichnung: '§8a-Schulung alle Fachkräfte (≤ 3 Jahre)', status: true },
  { bezeichnung: 'Verhaltenskodex für Mitarbeitende', status: true },
  { bezeichnung: 'Beschwerdeverfahren für Kinder etabliert', status: false },
  { bezeichnung: 'Kooperationsvereinbarung mit insoweit eFk', status: true },
  { bezeichnung: 'Jährliche Selbstevaluation Schutzkonzept', status: false },
]

export default function KinderschutzPage() {
  const [expanded, setExpanded] = useState<string | null>('ks1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const offen = MELDUNGEN.filter(m => m.status === 'offen' || m.status === 'in_bearbeitung').length
  const konzeptOk = SCHUTZKONZEPT_BAUSTEINE.filter(b => b.status).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MELDUNGEN.length} Kinderschutzvorgänge, ${offen} aktiv. Schutzkonzept: ${konzeptOk}/${SCHUTZKONZEPT_BAUSTEINE.length} Bausteine erfüllt. Beschwerdeverfahren für Kinder + Selbstevaluation fehlen noch.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-teal-500" /> Kinderschutz
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">§8a SGB VIII · Gefährdungseinschätzung · Schutzkonzept · Meldungen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Vorgänge',   val: MELDUNGEN.length, color: 'text-teal-700' },
          { label: 'Aktiv',      val: offen,            color: offen > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Konzept',    val: `${konzeptOk}/${SCHUTZKONZEPT_BAUSTEINE.length}`, color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
        <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <p className="text-[10px] text-red-700 font-semibold">Alle Vorgänge sind vertraulich. Zugriff ausschließlich Leitungskräfte. DSGVO Art. 9.</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Kinderschutzübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Kinderschutzübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {MELDUNGEN.map(m => {
          const isOpen = expanded === m.id
          const tCfg = TYP_CFG[m.typ]
          const sCfg = STATUS_CFG[m.status]
          const erledigt = m.massnahmen.filter(ma => ma.status === 'umgesetzt').length
          return (
            <div key={m.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {m.vertraulich && <span className="text-[8px] text-gray-500">🔒</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{m.datum} · {m.bearbeitung}</p>
                  <p className="text-[9px] text-teal-400">{erledigt}/{m.massnahmen.length} Maßnahmen erledigt</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Maßnahmen</p>
                  {m.massnahmen.map((ma, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 mt-0.5 shrink-0 ${ma.status === 'umgesetzt' ? 'text-green-400' : ma.status === 'geplant' ? 'text-blue-300' : 'text-gray-300'}`} />
                      <div>
                        <p className={`text-[9px] ${ma.status === 'umgesetzt' ? 'text-teal-700' : 'text-teal-900'}`}>{ma.bezeichnung}</p>
                        <p className="text-[8px] text-teal-400">{ma.verantwortlich}{ma.frist ? ` · bis ${ma.frist}` : ''}</p>
                      </div>
                    </div>
                  ))}
                  {m.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 mt-1">
                      <p className="text-[8px] text-amber-700">{m.notiz}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-teal-100 bg-white p-3">
        <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-2">Schutzkonzept-Bausteine</p>
        <div className="space-y-1">
          {SCHUTZKONZEPT_BAUSTEINE.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className={`w-3 h-3 shrink-0 ${b.status ? 'text-green-400' : 'text-gray-200'}`} />
              <p className={`text-[9px] ${b.status ? 'text-teal-700' : 'text-orange-500 font-semibold'}`}>{b.bezeichnung}{!b.status ? ' — fehlt!' : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
