'use client'

import { useState } from 'react'
import { Stethoscope, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Fachdienste — kids-mindry ──────────────────────────────────────────────────
// Frühförderung · Logopädie · Ergotherapie · SPZ · Kinderarzt · ASD

type FachdienstTyp = 'frühförderung' | 'logopaedie' | 'ergo' | 'spz' | 'kinderarzt' | 'asd' | 'kjp'
type FachdienstStatus = 'aktiv' | 'warteliste' | 'angefragt' | 'abgeschlossen' | 'empfohlen'

interface FachdienstEintrag {
  id: string
  typ: FachdienstTyp
  titel: string
  kontakt?: string
  verantwortlich: string
  status: FachdienstStatus
  anzahl?: number
  punkte: string[]
}

const TYP_CFG: Record<FachdienstTyp, { label: string; emoji: string; farbe: string }> = {
  frühförderung: { label: 'Frühförderung',    emoji: '🌱', farbe: 'bg-green-50 text-green-700 border-green-200' },
  logopaedie:    { label: 'Logopädie',        emoji: '🗣️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  ergo:          { label: 'Ergotherapie',     emoji: '✋', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  spz:           { label: 'SPZ',              emoji: '🏥', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  kinderarzt:    { label: 'Kinderärztl. U',   emoji: '🩺', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  asd:           { label: 'ASD/Jugendamt',    emoji: '🏢', farbe: 'bg-red-50 text-red-700 border-red-200' },
  kjp:           { label: 'Kinder-/Jug.-Psy.',emoji: '🧠', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<FachdienstStatus, { label: string; farbe: string }> = {
  aktiv:        { label: 'Aktiv',         farbe: 'text-teal-600' },
  warteliste:   { label: 'Warteliste',    farbe: 'text-orange-500' },
  angefragt:    { label: 'Angefragt',     farbe: 'text-blue-400' },
  abgeschlossen:{ label: 'Abgeschlossen', farbe: 'text-gray-400' },
  empfohlen:    { label: 'Empfohlen',     farbe: 'text-purple-500' },
}

const EINTRAEGE: FachdienstEintrag[] = [
  {
    id: 'fd1', typ: 'spz', titel: 'SPZ — Sozialpädiatrisches Zentrum',
    kontakt: 'SPZ Wuppertal: 0202-896-3200', verantwortlich: 'SL + Eltern (veranlasst)', status: 'aktiv',
    anzahl: 3,
    punkte: ['3 Kinder in SPZ-Behandlung (Entwicklungsdiagnostik)', 'Förderberichte: Apr empfangen (alle 3)', 'Kooperation: Fallbesprechung mit SPZ-Team 04.06.2026', 'Aufgabe Kita: Beobachtungsbögen bereitstellen (BaSiK)', 'Kita-Fachberatung SPZ: kostenfrei, auf Anfrage'],
  },
  {
    id: 'fd2', typ: 'frühförderung', titel: 'Frühförderstelle — Ambulante Förderung',
    kontakt: 'Frühförderstelle LVR: 0202-xxx', verantwortlich: 'Eltern + Inklusionsfachkraft', status: 'aktiv',
    anzahl: 3,
    punkte: ['3 Kinder mit Integrationsstatus (§ 16a KiBiz — erhöhte Kindpauschale)', 'Frühförderstelle: Therapeut:innen kommen 1–2x/Woche in Kita', 'Förderplan: gemeinsam (Kita + Frühförderstelle + Eltern)', 'Eingliederungshilfe: Antrag beim LVR (durch Eltern, Kita unterstützt)', 'Übergangsvorbereitung GS: Förderbericht Jun 2026'],
  },
  {
    id: 'fd3', typ: 'logopaedie', titel: 'Logopädie-Kooperation Praxis Martini',
    kontakt: 'Praxis Martini: 0202-xxx-xxx', verantwortlich: 'Eltern + Gruppenerzieher:in', status: 'aktiv',
    anzahl: 4,
    punkte: ['4 Kinder in Logopädie (externe Praxis)', 'Kooperation: Praxis Martini gibt Rückmeldung bei Bedarf', 'Kita-Aufgabe: Sprachliche Förderung im Alltag (BaSiK-Ziele)', 'Neue Empfehlung Apr: 1 Kind (Eltern beraten, Überweisung angeregt)', 'Dokumentation: Gesprächsprotokoll + Elterneinverständnis'],
  },
  {
    id: 'fd4', typ: 'asd', titel: 'Allgemeiner Sozialdienst (ASD) — Kinderschutz',
    kontakt: 'ASD Jugendamt: 0202-563-xxxx', verantwortlich: 'SL (§ 8a-Beauftragte)', status: 'aktiv',
    punkte: ['Aktuell: 1 §8a-Schutzfall (gemeldet Apr 2026, ASD informiert)', 'Schutzplan: in Erarbeitung mit ASD (nächstes Treffen 30.04.)', 'Kontaktperson ASD: Fr. Kramer (zuständig)', 'Dokumentation: DSGVO-konform, gesonderte Ablage (SL)', 'Insoweit erfahrene Fachkraft (IEF): SL (zertifiziert 2024)'],
  },
  {
    id: 'fd5', typ: 'kinderarzt', titel: 'Schuleingangsuntersuchung & Kinderärztl. Kooperation',
    kontakt: 'Gesundheitsamt: 0202-563-xxxx', verantwortlich: 'SL + Eltern', status: 'empfohlen',
    punkte: ['SEU-Vorbereitung: Kinder Jg. 2020 (Schulstart 2026/27)', '8 Kinder betroffen — Eltern informiert (U-Heft mitbringen)', 'Gesundheitsamt: SEU-Termin automatisch vom GA eingeladen', 'Kita-Bericht: Kurzeinschätzung Entwicklungsstand (standardisiert)', 'Impfstatus: lfd. geprüft (§34 IfSG — Impflücken an Gesundheitsamt)'],
  },
]

export default function FachdienstePage() {
  const [expanded, setExpanded] = useState<string | null>('fd1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesamtKinder = EINTRAEGE.reduce((s, e) => s + (e.anzahl ?? 0), 0)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Fachdienstbereiche · ${gesamtKinder} Kinder in externer Begleitung. SPZ: 3 Kinder. Frühförderung: 3 (§16a KiBiz). §8a-Fall: Schutzplan in Erarbeitung.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Stethoscope className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Fachdienste
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>SPZ · Frühförderung · Logopädie · ASD · Kinderarzt</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'Aktiv',       val: EINTRAEGE.filter(e => e.status === 'aktiv').length, color: 'text-teal-600' },
          { label: 'Ges. Kinder', val: gesamtKinder, color: 'text-purple-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(254 242 242)', border: '1px solid rgb(252 165 165)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <p className="text-[10px] text-red-700 font-semibold">§8a-Schutzfall: Treffen ASD 30.04. — Schutzplan-Ergebnis dokumentieren!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Fachdienstübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Fachdienstübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.typ === 'asd' ? 'rgb(252 165 165)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {e.anzahl !== undefined && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>{e.anzahl} Kinder</span>}
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.kontakt ?? e.verantwortlich}</p>
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
