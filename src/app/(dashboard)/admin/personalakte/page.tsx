'use client'

import { useState } from 'react'
import { FolderOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Shield, AlertTriangle } from 'lucide-react'

// ── Personalakte — kids-mindry ────────────────────────────────────────────────
// Personalakte · Mitarbeiterdokumente · Qualifikationen · Fristen

type DokTyp = 'vertrag' | 'zeugnis' | 'fortbildung' | 'gesundheit' | 'beurteilung' | 'sonstiges' | 'auszeichnung'
type DokStatus = 'aktuell' | 'abgelaufen' | 'fehlt' | 'in_pruefung'

interface PersonalDok {
  id: string
  typ: DokTyp
  bezeichnung: string
  status: DokStatus
  datum: string
  gueltigBis?: string
  notiz?: string
}

interface PersonalAkte {
  id: string
  name: string
  funktion: string
  einstellungsDatum: string
  dokumente: PersonalDok[]
  pruefungAusstehend?: boolean
}

const TYP_CFG: Record<DokTyp, { label: string; emoji: string; farbe: string }> = {
  vertrag:     { label: 'Vertrag',      emoji: '📜', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  zeugnis:     { label: 'Zeugnis',      emoji: '🎓', farbe: 'bg-green-50 text-green-700 border-green-200' },
  fortbildung: { label: 'Fortbildung',  emoji: '📚', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  gesundheit:  { label: 'Gesundheit',   emoji: '🏥', farbe: 'bg-red-50 text-red-700 border-red-200' },
  beurteilung: { label: 'Beurteilung',  emoji: '📊', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  sonstiges:   { label: 'Sonstiges',    emoji: '📄', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
  auszeichnung:{ label: 'Auszeichnung', emoji: '🏅', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const STATUS_CFG: Record<DokStatus, { label: string; farbe: string; dot: string }> = {
  aktuell:    { label: 'Aktuell',      farbe: 'text-teal-600',   dot: 'bg-teal-400' },
  abgelaufen: { label: 'Abgelaufen',   farbe: 'text-red-500',    dot: 'bg-red-400' },
  fehlt:      { label: 'Fehlt',        farbe: 'text-orange-500', dot: 'bg-orange-400' },
  in_pruefung:{ label: 'In Prüfung',   farbe: 'text-blue-500',   dot: 'bg-blue-400' },
}

const AKTEN: PersonalAkte[] = [
  {
    id: 'pa1', name: 'Sandra Berger', funktion: 'Einrichtungsleitung',
    einstellungsDatum: '01.09.2019',
    dokumente: [
      { id: 'd1', typ: 'vertrag',     bezeichnung: 'Arbeitsvertrag unbefristet', status: 'aktuell', datum: '01.09.2019' },
      { id: 'd2', typ: 'zeugnis',     bezeichnung: 'Staatsexamen Sozialpädagogik', status: 'aktuell', datum: '15.06.2019' },
      { id: 'd3', typ: 'gesundheit',  bezeichnung: 'Masernschutznachweis §20a IfSG', status: 'aktuell', datum: '01.09.2019', gueltigBis: '01.09.2029' },
      { id: 'd4', typ: 'fortbildung', bezeichnung: 'Kinderschutz §8a SGB VIII', status: 'aktuell', datum: '14.03.2025', gueltigBis: '14.03.2027' },
    ],
  },
  {
    id: 'pa2', name: 'Miriam Hofmann', funktion: 'Erzieherin',
    einstellungsDatum: '15.08.2022', pruefungAusstehend: true,
    dokumente: [
      { id: 'd5', typ: 'vertrag',     bezeichnung: 'Arbeitsvertrag befristet bis 31.07.2026', status: 'aktuell', datum: '15.08.2022', gueltigBis: '31.07.2026' },
      { id: 'd6', typ: 'zeugnis',     bezeichnung: 'Staatliche Anerkennung Erzieherin', status: 'aktuell', datum: '10.06.2022' },
      { id: 'd7', typ: 'gesundheit',  bezeichnung: 'Masernschutznachweis §20a IfSG', status: 'abgelaufen', datum: '15.08.2020', gueltigBis: '15.08.2022', notiz: 'Erneuerung erforderlich!' },
      { id: 'd8', typ: 'fortbildung', bezeichnung: 'Erste Hilfe am Kind', status: 'abgelaufen', datum: '10.04.2022', gueltigBis: '10.04.2024', notiz: 'Kurs bis Mai 2026 nachholen' },
    ],
  },
  {
    id: 'pa3', name: 'Lars Kunze', funktion: 'Erzieher (Springer)',
    einstellungsDatum: '01.01.2024',
    dokumente: [
      { id: 'd9',  typ: 'vertrag',     bezeichnung: 'Arbeitsvertrag Minijob', status: 'aktuell', datum: '01.01.2024' },
      { id: 'd10', typ: 'gesundheit',  bezeichnung: 'Masernschutznachweis §20a IfSG', status: 'aktuell', datum: '02.01.2024' },
      { id: 'd11', typ: 'fortbildung', bezeichnung: 'Kinderschutz §8a SGB VIII', status: 'fehlt', datum: '—', notiz: 'Noch nicht absolviert — bis 30.06.2026' },
    ],
  },
]

export default function PersonalaktePage() {
  const [expanded, setExpanded] = useState<string | null>('pa1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const alleDoc = AKTEN.flatMap(a => a.dokumente)
  const abgelaufen = alleDoc.filter(d => d.status === 'abgelaufen').length
  const fehlt = alleDoc.filter(d => d.status === 'fehlt').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${AKTEN.length} Mitarbeiter, ${alleDoc.length} Dokumente. ${abgelaufen} Dokumente abgelaufen, ${fehlt} fehlen. Miriam Hofmann: Masernschutz + Erste-Hilfe dringend erneuern! Lars Kunze: §8a-Nachweis fehlt.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-teal-500" /> Personalakten
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Mitarbeiterdokumente · Qualifikationen · Fristen · §20a IfSG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Mitarbeiter', val: AKTEN.length,   color: 'text-teal-700' },
          { label: 'Abgelaufen',  val: abgelaufen,     color: abgelaufen > 0 ? 'text-red-500' : 'text-gray-400' },
          { label: 'Fehlt',       val: fehlt,          color: fehlt > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {(abgelaufen > 0 || fehlt > 0) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">{abgelaufen} Dokument{abgelaufen !== 1 ? 'e' : ''} abgelaufen · {fehlt} fehlend — sofort prüfen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Personalübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Personalübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {AKTEN.map(a => {
          const isOpen = expanded === a.id
          const kritisch = a.dokumente.filter(d => d.status === 'abgelaufen' || d.status === 'fehlt').length
          return (
            <div key={a.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-900">{a.name}</p>
                  <p className="text-[9px] text-teal-500">{a.funktion} · seit {a.einstellungsDatum}</p>
                  <p className="text-[9px] text-teal-400">{a.dokumente.length} Dokumente{kritisch > 0 ? ` · ` : ''}{kritisch > 0 && <span className="text-red-500 font-bold">{kritisch} kritisch</span>}</p>
                </div>
                {kritisch > 0 && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  {a.dokumente.map(d => {
                    const tCfg = TYP_CFG[d.typ]
                    const sCfg = STATUS_CFG[d.status]
                    return (
                      <div key={d.id} className={`rounded-xl border px-2.5 py-2 ${tCfg.farbe}`}>
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-base">{tCfg.emoji}</span>
                          <span className="text-[8px] font-semibold">{tCfg.label}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                          <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                        </div>
                        <p className="text-[9px] font-semibold">{d.bezeichnung}</p>
                        <p className="text-[8px] opacity-70">{d.datum}{d.gueltigBis ? ` · gültig bis ${d.gueltigBis}` : ''}</p>
                        {d.notiz && (
                          <div className="mt-1 bg-white/60 rounded px-1.5 py-0.5">
                            <p className="text-[8px] font-semibold text-red-600">⚠ {d.notiz}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2">
        <p className="text-[8px] text-teal-600 flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Alle Personalakten unterliegen dem Datenschutz (DSGVO Art. 9). Zugriff nur für Leitungskräfte.</p>
      </div>
    </div>
  )
}
