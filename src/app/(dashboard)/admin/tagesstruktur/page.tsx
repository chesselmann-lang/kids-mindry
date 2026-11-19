'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, Users, AlertTriangle } from 'lucide-react'

// ── Tagesstruktur — Mindry Kids Admin ─────────────────────────────────────────
// Tagesablauf · Zeitplanung · Aktivitäten · Rituale

type AktivitaetsTyp = 'freispiel' | 'mahlzeit' | 'aussengelaende' | 'angebot' | 'ruhe' | 'ritual'
type Wochentag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr'

interface Aktivitaet {
  von: string
  bis: string
  bezeichnung: string
  typ: AktivitaetsTyp
  gruppe?: string
  personal?: string
  hinweis?: string
}

const TYP_CFG: Record<AktivitaetsTyp, { label: string; farbe: string; bg: string }> = {
  freispiel:     { label: 'Freispiel',    farbe: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  mahlzeit:      { label: 'Mahlzeit',     farbe: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  aussengelaende:{ label: 'Außen',        farbe: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  angebot:       { label: 'Angebot',      farbe: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  ruhe:          { label: 'Ruhe',         farbe: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200' },
  ritual:        { label: 'Ritual',       farbe: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200' },
}

const TAGESABLAUF: Aktivitaet[] = [
  { von: '07:00', bis: '08:30', bezeichnung: 'Frühdienst & Ankommen', typ: 'freispiel', hinweis: 'Elternkontakt nutzen' },
  { von: '08:30', bis: '09:00', bezeichnung: 'Morgenkreis & Begrüßungslied', typ: 'ritual', personal: 'Fr. Schmidt' },
  { von: '09:00', bis: '09:30', bezeichnung: 'Frühstück', typ: 'mahlzeit', hinweis: 'Allergenliste beachten' },
  { von: '09:30', bis: '11:00', bezeichnung: 'Freispiel in der Gruppe', typ: 'freispiel', gruppe: 'alle Gruppen' },
  { von: '09:45', bis: '10:30', bezeichnung: 'Angebot: Kunst & Kreativität', typ: 'angebot', gruppe: 'Bären', personal: 'Fr. Braun' },
  { von: '11:00', bis: '11:45', bezeichnung: 'Außengelände', typ: 'aussengelaende', gruppe: 'alle Gruppen', personal: 'alle ErzieherInnen' },
  { von: '11:45', bis: '12:30', bezeichnung: 'Mittagessen', typ: 'mahlzeit', hinweis: 'Tischkultur & Selbstständigkeit fördern' },
  { von: '12:30', bis: '14:00', bezeichnung: 'Mittagsruhe / Schlaf', typ: 'ruhe', gruppe: 'U3-Kinder' },
  { von: '14:00', bis: '14:30', bezeichnung: 'Nachmittagssnack', typ: 'mahlzeit' },
  { von: '14:30', bis: '16:30', bezeichnung: 'Nachmittagsfreispiel & Spätdienst', typ: 'freispiel' },
  { von: '16:00', bis: '16:30', bezeichnung: 'Abschlussrunde & Verabschiedung', typ: 'ritual' },
]

const WOCHEN_BESONDERHEITEN: Record<Wochentag, string> = {
  Mo: 'Wochenstart-Kreis · Neue Wochenthemen vorstellen',
  Di: 'Turnhalle 9:30–10:30 (Igel-Gruppe)',
  Mi: 'Waldtag 09:00–11:30 (Füchse-Gruppe) · Regen-Alternative: Turnsaal',
  Do: 'Musikalische Früherziehung 10:00 (Bären)',
  Fr: 'Wochenrückblick · Portfolios ergänzen · Elterngespräche möglich',
}

const WOCHENTAGE: Wochentag[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

export default function TagesstrukturPage() {
  const [aktTag, setAktTag] = useState<Wochentag>('Mo')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const angebote = TAGESABLAUF.filter(a => a.typ === 'angebot').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Strukturierter Tagesablauf mit ${TAGESABLAUF.length} Zeitblöcken. ${angebote} gezielte Angebote täglich. ${aktTag}: ${WOCHEN_BESONDERHEITEN[aktTag]}. Empfehlung: Rituale konsequent einhalten — stärkt Orientierung bei Krippenkindern.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-teal-500" /> Tagesstruktur
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Tagesablauf · Rituale · Angebote</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Zeitblöcke', val: TAGESABLAUF.length, color: 'text-teal-700' },
          { label: 'Angebote',   val: angebote, color: 'text-purple-600' },
          { label: 'Rituale',    val: TAGESABLAUF.filter(a => a.typ === 'ritual').length, color: 'text-teal-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Tageshinweis</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Tageshinweis'}
        </button>
      )}

      {/* Wochentage */}
      <div className="flex gap-1.5">
        {WOCHENTAGE.map(t => (
          <button key={t} onClick={() => setAktTag(t)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${aktTag === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Besonderheit des Tages */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
        <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-700">{WOCHEN_BESONDERHEITEN[aktTag]}</p>
      </div>

      {/* Tagesablauf */}
      <div className="space-y-1.5">
        {TAGESABLAUF.map((a, i) => {
          const cfg = TYP_CFG[a.typ]
          return (
            <div key={i} className={`rounded-xl border px-3 py-2 ${cfg.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-teal-600 w-16 shrink-0">{a.von}–{a.bis}</span>
                  <p className={`text-[10px] font-semibold ${cfg.farbe}`}>{a.bezeichnung}</p>
                </div>
                <span className={`text-[8px] font-semibold ${cfg.farbe}`}>{cfg.label}</span>
              </div>
              {(a.gruppe || a.personal || a.hinweis) && (
                <div className="flex gap-3 mt-0.5 ml-16 text-[8px] text-teal-600 flex-wrap">
                  {a.gruppe && <span><Users className="w-2 h-2 inline mr-0.5" />{a.gruppe}</span>}
                  {a.personal && <span>{a.personal}</span>}
                  {a.hinweis && <span className="text-amber-600 italic">{a.hinweis}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
