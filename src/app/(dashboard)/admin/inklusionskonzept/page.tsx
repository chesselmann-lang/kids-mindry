'use client'

import { useState } from 'react'
import { Rainbow, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, AlertTriangle } from 'lucide-react'

// ── Inklusionskonzept — Mindry Kids Admin ────────────────────────────────────
// Inklusion · Förderbedarf · UN-BRK · §22a KiTaG · Integrationsplätze

type InklusionsBereich = 'koerper' | 'sinne' | 'sprache' | 'kognition' | 'sozialEmotional' | 'chronischKrank' | 'hochbegabt'
type MassnahmeStatus = 'umgesetzt' | 'laufend' | 'geplant' | 'evaluiert'

interface InklusionsMassnahme {
  bezeichnung: string
  verantwortlich: string
  status: MassnahmeStatus
  bis?: string
}

interface InklusionsBereichEintrag {
  id: string
  bereich: InklusionsBereich
  anzahlKinder: number
  beschreibung: string
  massnahmen: InklusionsMassnahme[]
  ressourcen?: string[]
  notiz?: string
}

const BEREICH_CFG: Record<InklusionsBereich, { label: string; emoji: string; farbe: string }> = {
  koerper:        { label: 'Körperl. Beeinträchtigung', emoji: '♿', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  sinne:          { label: 'Sinnesbeeinträchtigung',    emoji: '👁️', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  sprache:        { label: 'Sprachentwicklung',         emoji: '💬', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kognition:      { label: 'Kognitive Förderung',       emoji: '🧠', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  sozialEmotional:{ label: 'Sozial-emotional',          emoji: '❤️', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  chronischKrank: { label: 'Chronische Erkrankung',     emoji: '💊', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  hochbegabt:     { label: 'Hochbegabung',              emoji: '⭐', farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

const STATUS_CFG: Record<MassnahmeStatus, { label: string; farbe: string; dot: string }> = {
  umgesetzt: { label: 'Umgesetzt', farbe: 'text-green-600', dot: 'bg-green-400' },
  laufend:   { label: 'Laufend',   farbe: 'text-blue-600',  dot: 'bg-blue-400' },
  geplant:   { label: 'Geplant',   farbe: 'text-gray-400',  dot: 'bg-gray-300' },
  evaluiert: { label: 'Evaluiert', farbe: 'text-purple-600', dot: 'bg-purple-400' },
}

const BEREICHE: InklusionsBereichEintrag[] = [
  {
    id: 'ik1', bereich: 'sprache', anzahlKinder: 4,
    beschreibung: 'Vier Kinder mit unterschiedlichem Förderbedarf in der Sprachentwicklung. Zwei Kinder mit Migrationshintergrund (DaZ), zwei mit diagnostiziertem Sprachentwicklungsverzug.',
    massnahmen: [
      { bezeichnung: 'Sprachförderprogramm „Kinder-Literacy" täglich 30 Min.', verantwortlich: 'Fr. Maier', status: 'laufend' },
      { bezeichnung: 'Logopädische Fachberatung monatlich', verantwortlich: 'Fr. Baum (extern)', status: 'laufend' },
      { bezeichnung: 'Elterninfomappe mehrsprachig erstellen', verantwortlich: 'Fr. Klein', status: 'geplant', bis: '15.05.2026' },
    ],
    ressourcen: ['Logopädin (extern)', 'Fördermaterial Literacy-Kit'],
  },
  {
    id: 'ik2', bereich: 'kognition', anzahlKinder: 2,
    beschreibung: 'Zwei Kinder mit Förderbedarf kognitive Entwicklung. Ein Kind mit Trisomie 21 (Integrationsplatz), ein Kind mit Entwicklungsverzug (in Abklärung).',
    massnahmen: [
      { bezeichnung: 'Heilpädagogische Fachkraft 20 Std./Woche', verantwortlich: 'Fr. Stern (HP)', status: 'umgesetzt' },
      { bezeichnung: 'Individueller Förderplan halbjährlich', verantwortlich: 'Fr. Stern + Gruppenl.', status: 'laufend' },
      { bezeichnung: 'Evaluation Integrationsplatz Sept. 2026', verantwortlich: 'Fr. Maier', status: 'geplant', bis: '01.09.2026' },
    ],
    ressourcen: ['Heilpädagogin Fr. Stern', 'Eingliederungshilfe bewilligt'],
    notiz: 'Zweites Kind: Abklärung läuft — Diagnose ausstehend.',
  },
  {
    id: 'ik3', bereich: 'sozialEmotional', anzahlKinder: 3,
    beschreibung: 'Drei Kinder mit erhöhtem sozial-emotionalem Förderbedarf. Verhaltensauffälligkeiten im Gruppenkontext.',
    massnahmen: [
      { bezeichnung: 'Soziales Kompetenztraining in Kleingruppe', verantwortlich: 'Fr. Hoffmann', status: 'laufend' },
      { bezeichnung: 'Fachberatung Jugendamt', verantwortlich: 'Fr. Maier', status: 'laufend' },
      { bezeichnung: 'Elternberatung mit Familienzentrum', verantwortlich: 'Fr. Maier', status: 'geplant', bis: '30.04.2026' },
    ],
    notiz: 'Elternberatung noch nicht terminiert — dringend!',
  },
]

export default function InklusionskonzeptPage() {
  const [expanded, setExpanded] = useState<string | null>('ik1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesamtKinder = BEREICHE.reduce((s, b) => s + b.anzahlKinder, 0)
  const offeneMassnahmen = BEREICHE.flatMap(b => b.massnahmen).filter(m => m.status === 'geplant').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${gesamtKinder} Kinder mit Förderbedarf in ${BEREICHE.length} Bereichen. ${offeneMassnahmen} Maßnahmen noch geplant. Elternberatung sozial-emotional dringend! Integrationsplatz Kognition läuft gut.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Rainbow className="w-6 h-6 text-teal-500" /> Inklusionskonzept
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Inklusion · Förderbereiche · Maßnahmen · UN-BRK · §22a KiTaG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',      val: BEREICHE.length,    color: 'text-teal-700' },
          { label: 'Förderkinder',  val: gesamtKinder,        color: 'text-blue-600' },
          { label: 'Offen. Maßn.', val: offeneMassnahmen,    color: offeneMassnahmen > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {BEREICHE.some(b => b.notiz?.includes('!')) && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Offene Punkte im Inklusionskonzept — Hinweise beachten.</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Inklusionsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Inklusionsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {BEREICHE.map(b => {
          const isOpen = expanded === b.id
          const bCfg = BEREICH_CFG[b.bereich]
          const umgesetzt = b.massnahmen.filter(m => m.status === 'umgesetzt' || m.status === 'laufend').length
          return (
            <div key={b.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{b.anzahlKinder} {b.anzahlKinder === 1 ? 'Kind' : 'Kinder'}</p>
                  <p className="text-[9px] text-teal-400">{umgesetzt}/{b.massnahmen.length} Maßnahmen aktiv/umgesetzt</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-700 leading-relaxed">{b.beschreibung}</p>
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Maßnahmen</p>
                    {b.massnahmen.map((m, i) => {
                      const mCfg = STATUS_CFG[m.status]
                      return (
                        <div key={i} className="flex items-start gap-1.5 mb-1">
                          <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${mCfg.dot}`} />
                          <div className="flex-1">
                            <p className="text-[9px] text-teal-800">{m.bezeichnung}</p>
                            <p className="text-[8px] text-teal-400">{m.verantwortlich}{m.bis ? ` · bis ${m.bis}` : ''} · <span className={mCfg.farbe}>{mCfg.label}</span></p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {b.ressourcen && (
                    <div className="flex flex-wrap gap-1">
                      {b.ressourcen.map((r, i) => (
                        <span key={i} className="text-[8px] bg-teal-50 border border-teal-200 rounded-full px-1.5 py-0.5 text-teal-600">{r}</span>
                      ))}
                    </div>
                  )}
                  {b.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{b.notiz}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
