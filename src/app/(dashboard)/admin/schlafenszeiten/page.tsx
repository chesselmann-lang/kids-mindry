'use client'

import { useState } from 'react'
import { Moon, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Schlafenszeiten — kids-mindry ─────────────────────────────────────────────
// Schlafenszeiten · Schlafpläne · Kinder · Besonderheiten

type SchlafTyp = 'regelschlaf' | 'kurz' | 'kein_schlaf' | 'elternwunsch' | 'gesundheit' | 'eingewoehnungsphase'

interface SchlafEintrag {
  id: string
  kindName: string
  gruppe: string
  typ: SchlafTyp
  zeitVon: string
  zeitBis: string
  besonderheit?: string
  elterninfo: boolean
  aktiv: boolean
}

const TYP_CFG: Record<SchlafTyp, { label: string; emoji: string; farbe: string }> = {
  regelschlaf:         { label: 'Regelschlaf',        emoji: '😴', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  kurz:                { label: 'Kurzschlaf',          emoji: '💤', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kein_schlaf:         { label: 'Kein Mittagsschlaf',  emoji: '🌞', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  elternwunsch:        { label: 'Elternwunsch',        emoji: '👪', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  gesundheit:          { label: 'Gesundheitlich',      emoji: '🏥', farbe: 'bg-red-50 text-red-700 border-red-200' },
  eingewoehnungsphase: { label: 'Eingewöhnung',        emoji: '🌱', farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const SCHLAF_EINTRAEGE: SchlafEintrag[] = [
  { id: 's1', kindName: 'Leon M.',    gruppe: 'Krippe 1', typ: 'regelschlaf',         zeitVon: '12:00', zeitBis: '14:00', elterninfo: false, aktiv: true },
  { id: 's2', kindName: 'Mia K.',     gruppe: 'Krippe 1', typ: 'regelschlaf',         zeitVon: '11:45', zeitBis: '13:30', elterninfo: false, aktiv: true },
  { id: 's3', kindName: 'Emre Y.',    gruppe: 'U3',       typ: 'kurz',                zeitVon: '12:30', zeitBis: '13:30', besonderheit: 'Schläft nie länger als 60 Min.', elterninfo: true, aktiv: true },
  { id: 's4', kindName: 'Sophie B.',  gruppe: 'U3',       typ: 'kein_schlaf',         zeitVon: '—',     zeitBis: '—',     besonderheit: 'Schläft tagsüber nicht — ruhige Beschäftigung anbieten', elterninfo: true, aktiv: true },
  { id: 's5', kindName: 'Jonas H.',   gruppe: 'U6',       typ: 'elternwunsch',        zeitVon: '12:15', zeitBis: '13:00', besonderheit: 'Eltern möchten max. 45 Min. — auf Wunsch wecken', elterninfo: true, aktiv: true },
  { id: 's6', kindName: 'Lara F.',    gruppe: 'Krippe 2', typ: 'gesundheit',          zeitVon: '12:00', zeitBis: '14:30', besonderheit: 'Ärztliche Anordnung: erhöhter Schlafbedarf (Infekt ausgeheilt)', elterninfo: true, aktiv: true },
  { id: 's7', kindName: 'Ben S.',     gruppe: 'Krippe 1', typ: 'eingewoehnungsphase', zeitVon: '12:30', zeitBis: '13:30', besonderheit: 'Woche 2 der Eingewöhnung — Bezugsperson bleibt dabei', elterninfo: true, aktiv: true },
  { id: 's8', kindName: 'Hanna T.',   gruppe: 'U6',       typ: 'kein_schlaf',         zeitVon: '—',     zeitBis: '—',     elterninfo: false, aktiv: false },
]

const GRUPPEN = [...new Set(SCHLAF_EINTRAEGE.map(s => s.gruppe))]

export default function SchlafensZeitenPage() {
  const [expanded, setExpanded] = useState<string | null>('s6')
  const [filterGruppe, setFilterGruppe] = useState<string>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gefiltert = SCHLAF_EINTRAEGE.filter(s => s.aktiv && (filterGruppe === 'alle' || s.gruppe === filterGruppe))
  const mitBesonderheit = gefiltert.filter(s => s.besonderheit).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${gefiltert.length} aktive Schlafpläne. ${mitBesonderheit} mit Besonderheiten. Lara F.: ärztliche Anordnung Schlafbedarf. Ben S.: Eingewöhnung — Bezugsperson erforderlich. Sophie B. + Hanna T.: kein Mittagsschlaf.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Moon className="w-6 h-6 text-teal-500" /> Schlafenszeiten
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Schlafpläne · Besonderheiten · Elternabsprachen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kinder',         val: gefiltert.length,    color: 'text-teal-700' },
          { label: 'Besonderheiten', val: mitBesonderheit,     color: mitBesonderheit > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Gruppen',        val: GRUPPEN.length,      color: 'text-blue-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {['alle', ...GRUPPEN].map(g => (
          <button key={g} onClick={() => setFilterGruppe(g)}
            className={`text-[9px] px-2 py-1 rounded-full font-semibold border transition-colors ${filterGruppe === g ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
            {g === 'alle' ? 'Alle Gruppen' : g}
          </button>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Schlafübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Schlafübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {gefiltert.map(s => {
          const isOpen = expanded === s.id
          const tCfg = TYP_CFG[s.typ]
          return (
            <div key={s.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className="text-[8px] text-teal-400">{s.gruppe}</span>
                    {s.elterninfo && <span className="text-[8px] text-blue-400">👪</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{s.kindName}</p>
                  <p className="text-[9px] text-teal-400">{s.zeitVon !== '—' ? `${s.zeitVon} – ${s.zeitBis} Uhr` : 'Kein Mittagsschlaf'}</p>
                </div>
                {s.besonderheit && <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && s.besonderheit && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                    <p className="text-[9px] text-amber-700 font-semibold">⚠ Besonderheit</p>
                    <p className="text-[9px] text-amber-700">{s.besonderheit}</p>
                  </div>
                  {s.elterninfo && (
                    <p className="text-[8px] text-teal-400 mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-teal-400" /> Eltern informiert</p>
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
