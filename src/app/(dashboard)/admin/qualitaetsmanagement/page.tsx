'use client'

import { useState } from 'react'
import { Award, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Qualitätsmanagement — Mindry Kids Admin ───────────────────────────────────
// QM-Bereiche · Indikatoren · Selbstevaluation · §45 SGB VIII

type QmBereich = 'paedagogik' | 'personal' | 'sicherheit' | 'elternkooperation' | 'raumkonzept' | 'konzeptarbeit'
type BewertungStufe = 1 | 2 | 3 | 4 | 5
type MassnahmeStatus = 'offen' | 'laufend' | 'abgeschlossen'

interface QmIndikator {
  bezeichnung: string
  bewertung: BewertungStufe
  zielwert: BewertungStufe
}

interface QmMassnahme {
  text: string
  verantwortlich: string
  bis: string
  status: MassnahmeStatus
}

interface QmEintrag {
  id: string
  bereich: QmBereich
  letztePruefung: string
  indikatoren: QmIndikator[]
  massnahmen: QmMassnahme[]
  notiz?: string
}

const BEREICH_CFG: Record<QmBereich, { label: string; emoji: string; farbe: string }> = {
  paedagogik:       { label: 'Pädagogische Qualität', emoji: '🎓', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  personal:         { label: 'Personalentwicklung',   emoji: '👥', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  sicherheit:       { label: 'Sicherheit & Hygiene',  emoji: '🛡️', farbe: 'bg-red-50 text-red-700 border-red-200' },
  elternkooperation:{ label: 'Elternkooperation',     emoji: '👨‍👩‍👧', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  raumkonzept:      { label: 'Raum- & Materialkonzept', emoji: '🏠', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  konzeptarbeit:    { label: 'Konzeptarbeit',          emoji: '📋', farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const STATUS_FARBE: Record<MassnahmeStatus, string> = {
  offen:        'text-orange-500',
  laufend:      'text-blue-600',
  abgeschlossen:'text-green-600',
}

const QM_EINTRAEGE: QmEintrag[] = [
  {
    id: 'qm1', bereich: 'paedagogik', letztePruefung: 'März 2026',
    indikatoren: [
      { bezeichnung: 'Beobachtung und Dokumentation', bewertung: 4, zielwert: 5 },
      { bezeichnung: 'Sprachliche Bildung', bewertung: 3, zielwert: 4 },
      { bezeichnung: 'Partizipation der Kinder', bewertung: 4, zielwert: 5 },
      { bezeichnung: 'Inklusive Praxis', bewertung: 3, zielwert: 4 },
    ],
    massnahmen: [
      { text: 'Sprachförderkonzept überarbeiten', verantwortlich: 'Fr. Maier', bis: '30.06.2026', status: 'laufend' },
      { text: 'Kita-Forum: Kinderrechte im Alltag', verantwortlich: 'Team', bis: '15.05.2026', status: 'offen' },
    ],
  },
  {
    id: 'qm2', bereich: 'elternkooperation', letztePruefung: 'Jan. 2026',
    indikatoren: [
      { bezeichnung: 'Elterngespräche Qualität', bewertung: 4, zielwert: 5 },
      { bezeichnung: 'Elternbriefe & Kommunikation', bewertung: 5, zielwert: 5 },
      { bezeichnung: 'Einbeziehung in Kita-Leben', bewertung: 3, zielwert: 4 },
    ],
    massnahmen: [
      { text: 'Elternbefragung 2026 durchführen', verantwortlich: 'Fr. Maier', bis: '31.05.2026', status: 'offen' },
      { text: 'Eltern-Café einmal pro Quartal', verantwortlich: 'Team', bis: 'laufend', status: 'laufend' },
    ],
    notiz: 'Letztes Elternbefragungsergebnis: Ø 4,1/5. Ziel 4,5.',
  },
  {
    id: 'qm3', bereich: 'personal', letztePruefung: 'Feb. 2026',
    indikatoren: [
      { bezeichnung: 'Fortbildungsstunden/Jahr pro Fachkraft', bewertung: 3, zielwert: 4 },
      { bezeichnung: 'Teamkultur und Feedback', bewertung: 4, zielwert: 5 },
      { bezeichnung: 'Fachkräftemangel-Prävention', bewertung: 2, zielwert: 3 },
    ],
    massnahmen: [
      { text: 'Fortbildungsplan 2026/27 erstellen', verantwortlich: 'Fr. Maier', bis: '30.04.2026', status: 'offen' },
      { text: 'Praktikanten-Konzept überarbeiten', verantwortlich: 'Fr. Schmidt', bis: '31.05.2026', status: 'offen' },
    ],
    notiz: 'Fachkräftemangel kritisch — Maßnahmen dringend!',
  },
]

export default function QualitaetsmanagementPage() {
  const [expanded, setExpanded] = useState<string | null>('qm1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesamtIndikatoren = QM_EINTRAEGE.flatMap(e => e.indikatoren)
  const durchschnitt = Math.round((gesamtIndikatoren.reduce((s, i) => s + i.bewertung, 0) / gesamtIndikatoren.length) * 10) / 10
  const offeneMassnahmen = QM_EINTRAEGE.flatMap(e => e.massnahmen).filter(m => m.status !== 'abgeschlossen').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${QM_EINTRAEGE.length} QM-Bereiche: Ø-Bewertung ${durchschnitt}/5. ${offeneMassnahmen} Maßnahmen offen. Personal-Indikator Fachkräftemangel nur 2/5 — kritisch! Elternbefragung 2026 noch nicht gestartet.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-teal-500" /> Qualitätsmanagement
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Selbstevaluation · QM-Indikatoren · §45 SGB VIII</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'QM-Bereiche', val: QM_EINTRAEGE.length, color: 'text-teal-700' },
          { label: 'Ø Bewertung', val: `${durchschnitt}/5`,  color: durchschnitt >= 4 ? 'text-green-600' : 'text-orange-500' },
          { label: 'Offen',       val: offeneMassnahmen,     color: offeneMassnahmen > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {QM_EINTRAEGE.some(e => e.indikatoren.some(i => i.bewertung <= 2)) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">Kritisch niedrige Indikatoren (≤ 2/5) — Maßnahmen einleiten!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-QM-Analyse</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-QM-Analyse'}
        </button>
      )}

      <div className="space-y-2">
        {QM_EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const bCfg = BEREICH_CFG[e.bereich]
          const avgBew = Math.round((e.indikatoren.reduce((s, i) => s + i.bewertung, 0) / e.indikatoren.length) * 10) / 10
          return (
            <div key={e.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <div key={s} className={`w-2 h-2 rounded-sm ${s <= avgBew ? 'bg-teal-400' : 'bg-teal-100'}`} />
                      ))}
                    </div>
                    <span className="text-[8px] font-bold text-teal-600">{avgBew}/5</span>
                    <span className="text-[8px] text-teal-400">{e.indikatoren.length} Indikatoren</span>
                  </div>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />Letzte Prüfung: {e.letztePruefung}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Indikatoren</p>
                    {e.indikatoren.map((ind, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[9px] text-teal-800 flex-1">{ind.bezeichnung}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <div key={s} className={`w-1.5 h-1.5 rounded-sm ${s <= ind.bewertung ? 'bg-teal-400' : 'bg-teal-100'}`} />
                          ))}
                        </div>
                        <span className={`text-[8px] font-bold ${ind.bewertung < ind.zielwert ? 'text-orange-500' : 'text-green-600'}`}>{ind.bewertung}/{ind.zielwert}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Maßnahmen</p>
                    {e.massnahmen.map((m, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-0.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${m.status === 'abgeschlossen' ? 'text-green-500' : 'text-gray-300'}`} />
                        <div className="flex-1">
                          <p className={`text-[9px] ${m.status === 'abgeschlossen' ? 'line-through text-teal-300' : 'text-teal-800'}`}>{m.text}</p>
                          <p className="text-[8px] text-teal-400">{m.verantwortlich} · {m.bis} · <span className={STATUS_FARBE[m.status]}>{m.status}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {e.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{e.notiz}</p>
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
