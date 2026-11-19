'use client'

import { useState } from 'react'
import { Gift, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Veranstaltungen — kids-mindry ──────────────────────────────────────────────
// Sommerfest · Laternenumzug · Weihnachtsfeier · Projekte · Ausflüge

type VeranstaltungsTyp = 'fest' | 'ausflug' | 'projekt' | 'gottesdienst' | 'abschluss' | 'sport' | 'extern'
type VeranstaltungsStatus = 'geplant' | 'vorbereitung' | 'bestaetigt' | 'abgeschlossen' | 'abgesagt'

interface VeranstaltungsEintrag {
  id: string
  typ: VeranstaltungsTyp
  titel: string
  datum: string
  verantwortlich: string
  status: VeranstaltungsStatus
  punkte: string[]
}

const TYP_CFG: Record<VeranstaltungsTyp, { label: string; emoji: string; farbe: string }> = {
  fest:         { label: 'Fest/Feier',       emoji: '🎉', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  ausflug:      { label: 'Ausflug',          emoji: '🚌', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  projekt:      { label: 'Projektwoche',     emoji: '🎨', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  gottesdienst: { label: 'Gottesdienst/Feier',emoji: '🕊️', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  abschluss:    { label: 'Abschlussfeier',   emoji: '🎓', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  sport:        { label: 'Sport/Bewegung',   emoji: '⚽', farbe: 'bg-green-50 text-green-700 border-green-200' },
  extern:       { label: 'Extern/Kooperation',emoji: '🤝', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<VeranstaltungsStatus, { label: string; farbe: string }> = {
  geplant:      { label: 'Geplant',      farbe: 'text-blue-400' },
  vorbereitung: { label: 'Vorbereitung', farbe: 'text-orange-500' },
  bestaetigt:   { label: 'Bestätigt',    farbe: 'text-teal-600' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-400' },
  abgesagt:     { label: 'Abgesagt',     farbe: 'text-red-500' },
}

const EINTRAEGE: VeranstaltungsEintrag[] = [
  {
    id: 've1', typ: 'fest', titel: 'Sommerfest Kita',
    datum: '20.06.2026', verantwortlich: 'Gesamtes Team + Elternbeirat', status: 'vorbereitung',
    punkte: ['Datum: 20.06.2026 (Sa, 14:00–18:00)', 'Motto: "Rund um die Welt" (interkulturell)', 'Programm: Kindertanzgruppe, Buffet, Spielstationen (8 geplant)', 'Flyer: bis 02.06. verteilen (digital + analog)', 'Aufgaben: Getränketheke EB, Kuchen MA, Spielstationen Gruppen'],
  },
  {
    id: 've2', typ: 'ausflug', titel: 'Gruppenausflüge Mai/Jun',
    datum: 'Mai–Jun 2026', verantwortlich: 'Gruppenerzieher:innen', status: 'geplant',
    punkte: ['Ü3-Gruppe A: Zoo Wuppertal (14.05., Busanmeldung läuft)', 'Ü3-Gruppe B: Schwebebahn + Museum (21.05., bestätigt)', 'U3-Gruppen: kein Fernausflug (Stressvermeidung, lokale Spaziergänge)', 'Elterneinverständnis: bis 02.05. (Formular per App)', 'Betreuungsschlüssel: 1:4 (U3), 1:5 (Ü3) — externe Begleitung nötig'],
  },
  {
    id: 've3', typ: 'projekt', titel: 'Projektwoche "Tiere und Natur"',
    datum: '08.–12.06.2026', verantwortlich: 'Pädagogische Fachkräfte', status: 'geplant',
    punkte: ['Thema: "Tiere und Natur" (Frühlingsprojekt, gruppenübergreifend)', 'Aktionen: Tiere basteln, Naturwerkstatt, Kita-Garten bepflanzen', 'Kooperation: Tierarzt-Praxis Besuch (Dr. Meier, bestätigt)', 'Elterneinbindung: "Berufe-Eltern" (Förster, Tierarzt, Gärtner eingeladen)', 'Dokumentation: Portfolio-Seite je Kind'],
  },
  {
    id: 've4', typ: 'abschluss', titel: 'Abschlussfeier Vorschulkinder',
    datum: '25.06.2026', verantwortlich: 'SL + Vorschulgruppe', status: 'bestaetigt',
    punkte: ['Abschlussfeier: 25.06.2026 (Do, 16:00)', '8 Vorschulkinder (Schulstart 2026/27)', 'Programm: Aufführung + Zeugnisübergabe + Buffet', 'Raum: Bewegungsraum (dekoriert von Erzieher:innen)', 'Einladungen: Eltern + Geschwister (per App, bis 10.06.)'],
  },
  {
    id: 've5', typ: 'extern', titel: 'Externe Kooperationsveranstaltungen',
    datum: 'Lfd. SJ', verantwortlich: 'SL', status: 'bestaetigt',
    punkte: ['Polizei-Besuch: Verkehrserziehung (Apr — abgeschlossen)', 'Feuerwehr-Besuch: Jun (geplant, Brandschutzübung + Besichtigung)', 'Bibliothek: Vorlesestunde 1x/Monat (jeden 3. Di, läuft)', 'Grundschule: Schnuppertag Kl.1a 12.05. (8 Vorschulkinder)', 'VHS-Kooperation: Elterncafé "Sprachentwicklung" 04.06.'],
  },
]

export default function VeranstaltungenPage() {
  const [expanded, setExpanded] = useState<string | null>('ve1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Veranstaltungen. Sommerfest 20.06. (Vorbereitung). Projektwoche 08.–12.06. Abschlussfeier 25.06. Ausflüge Mai (Zoo 14.05., Schwebebahn 21.05.).`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Gift className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Veranstaltungen
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Sommerfest · Ausflüge · Projektwoche · Abschlussfeier</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Veranstalt.',  val: EINTRAEGE.length, color: 'text-pink-600' },
          { label: 'Bestätigt',   val: EINTRAEGE.filter(e => e.status === 'bestaetigt').length, color: 'text-teal-600' },
          { label: 'Vorbereitung',val: EINTRAEGE.filter(e => e.status === 'vorbereitung').length, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(253 242 248)', border: '1px solid rgb(249 168 212)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-pink-500 shrink-0" />
        <p className="text-[10px] text-pink-700 font-semibold">Sommerfest 20.06. — Flyer bis 02.06. — Elterneinverständnis Ausflüge bis 02.05.!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Veranstaltungsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Veranstaltungsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'vorbereitung' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
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
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich} · {e.datum}</p>
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
