'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, Users, Clock, AlertTriangle } from 'lucide-react'

// ── Bewegungsangebot — Mindry Kids ────────────────────────────────────────────
// Motorik · Sport · Tanz · Psychomotorik · Raumnutzung

type BewegungsTyp = 'sport' | 'tanz' | 'psychomotorik' | 'outdoor' | 'yoga' | 'spiel'
type BewegungsStatus = 'geplant' | 'aktiv' | 'abgeschlossen' | 'pausiert'
type Altersgruppe = 'krippe' | 'kita' | 'alle'

interface BewegungsEinheit {
  id: string
  titel: string
  typ: BewegungsTyp
  status: BewegungsStatus
  altersgruppe: Altersgruppe
  wochentag: string
  uhrzeit: string
  dauer: number // Minuten
  leitung: string
  gruppen: string[]
  ziele: string[]
  material?: string
  notiz?: string
  teilnehmer?: number
}

const TYP_CFG: Record<BewegungsTyp, { label: string; emoji: string; farbe: string; bg: string }> = {
  sport:         { label: 'Sport',         emoji: '⚽', farbe: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  tanz:          { label: 'Tanz',          emoji: '💃', farbe: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200' },
  psychomotorik: { label: 'Psychomotorik', emoji: '🎯', farbe: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  outdoor:       { label: 'Outdoor',       emoji: '🌳', farbe: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  yoga:          { label: 'Kinderyoga',    emoji: '🧘', farbe: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  spiel:         { label: 'Bewegungsspiel',emoji: '🎪', farbe: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
}

const STATUS_CFG: Record<BewegungsStatus, { label: string; farbe: string }> = {
  geplant:      { label: 'Geplant',      farbe: 'text-blue-600' },
  aktiv:        { label: 'Aktiv',        farbe: 'text-green-600' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-500' },
  pausiert:     { label: 'Pausiert',     farbe: 'text-orange-600' },
}

const ALTER_CFG: Record<Altersgruppe, string> = {
  krippe: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  kita:   'bg-teal-50 text-teal-700 border-teal-200',
  alle:   'bg-gray-50 text-gray-600 border-gray-200',
}

const INIT_EINHEITEN: BewegungsEinheit[] = [
  {
    id: 'b1', titel: 'Fußball & Ballspiele', typ: 'sport', status: 'aktiv',
    altersgruppe: 'kita', wochentag: 'Dienstag', uhrzeit: '09:30', dauer: 45,
    leitung: 'Hr. Schulze', gruppen: ['Sonnenkäfer', 'Marienkäfer'], teilnehmer: 22,
    ziele: ['Grobmotorik stärken', 'Teamgeist fördern', 'Regelverständnis'],
    material: 'Bälle, Hütchen, Tore',
  },
  {
    id: 'b2', titel: 'Kindertanz — Frühling', typ: 'tanz', status: 'aktiv',
    altersgruppe: 'alle', wochentag: 'Donnerstag', uhrzeit: '10:00', dauer: 30,
    leitung: 'Fr. Weber', gruppen: ['Alle Gruppen'], teilnehmer: 30,
    ziele: ['Rhythmusgefühl', 'Körperkoordination', 'Kreativausdrucck'],
    material: 'Tücher, Musik-Box',
    notiz: 'Aufführung beim Sommerfest 24.06.',
  },
  {
    id: 'b3', titel: 'Psychomotorik-Zirkel', typ: 'psychomotorik', status: 'aktiv',
    altersgruppe: 'kita', wochentag: 'Mittwoch', uhrzeit: '09:00', dauer: 40,
    leitung: 'Fr. Weber', gruppen: ['Marienkäfer'], teilnehmer: 8,
    ziele: ['Gleichgewicht', 'Körperwahrnehmung', 'Selbstregulation'],
    material: 'Balancierbalken, Matten, Igelbälle, Tunnels',
    notiz: '⚠️ Kleingruppe — max. 8 Kinder für optimale Betreuung',
  },
  {
    id: 'b4', titel: 'Waldspaziergang & Naturerkundung', typ: 'outdoor', status: 'geplant',
    altersgruppe: 'kita', wochentag: 'Freitag', uhrzeit: '08:45', dauer: 90,
    leitung: 'Team', gruppen: ['Sonnenkäfer'], teilnehmer: 14,
    ziele: ['Naturverbundenheit', 'Ausdauer', 'Sinneswahrnehmung'],
    material: 'Wetterfeste Kleidung, Lupen, Sammelbehälter',
    notiz: 'Wetterabhängig — Ersatzplan: Turnhalle',
  },
  {
    id: 'b5', titel: 'Kinderyoga & Entspannung', typ: 'yoga', status: 'aktiv',
    altersgruppe: 'krippe', wochentag: 'Montag', uhrzeit: '15:00', dauer: 20,
    leitung: 'Fr. Weber', gruppen: ['Krippenkinder'], teilnehmer: 6,
    ziele: ['Ruhe & Entspannung', 'Atemübungen', 'Körperbewusstsein'],
    material: 'Matten, ruhige Musik',
  },
  {
    id: 'b6', titel: 'Großer Bewegungsparcours', typ: 'spiel', status: 'abgeschlossen',
    altersgruppe: 'alle', wochentag: 'Dienstag', uhrzeit: '10:30', dauer: 60,
    leitung: 'Team', gruppen: ['Alle Gruppen'], teilnehmer: 45,
    ziele: ['Vielfältige Bewegungserfahrungen', 'Ausdauer', 'Koordination'],
    material: 'Gesamte Turnhallen-Ausstattung',
  },
]

export default function BewegungsangebotPage() {
  const [expanded, setExpanded] = useState<string | null>('b1')
  const [filterTyp, setFilterTyp] = useState<'alle' | BewegungsTyp>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gefiltert = INIT_EINHEITEN.filter(e => filterTyp === 'alle' || e.typ === filterTyp)
  const aktive = INIT_EINHEITEN.filter(e => e.status === 'aktiv').length
  const gesamtKinder = [...new Set(INIT_EINHEITEN.filter(e=>e.status==='aktiv').flatMap(e=>e.gruppen))].length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${aktive} aktive Bewegungsangebote mit ${INIT_EINHEITEN.filter(e=>e.status==='aktiv').reduce((s,e)=>s+(e.teilnehmer??0),0)} Teilnahmen/Woche. Hinweis: Psychomotorik-Zirkel voll belegt (8/8) — Warteliste empfohlen. Nächste Prüfung: Tanzaufführung 24.06. Empfehlung: Outdoor-Angebot auf 2×/Woche ausweiten (aktuell 1×).`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <span className="text-2xl">🏃</span> Bewegungsangebote
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Sport · Tanz · Psychomotorik · Outdoor</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Angebote', val: INIT_EINHEITEN.length, color: 'text-teal-700' },
          { label: 'Aktiv',    val: aktive,                color: aktive > 0 ? 'text-green-600' : 'text-gray-400' },
          { label: 'Std/Wo',  val: `${(INIT_EINHEITEN.filter(e=>e.status==='aktiv').reduce((s,e)=>s+e.dauer,0)/60).toFixed(1)}h`, color: 'text-blue-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-200 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Überblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Bewegungsüberblick'}
        </button>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilterTyp('alle')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === 'alle' ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
          Alle
        </button>
        {(Object.keys(TYP_CFG) as BewegungsTyp[]).map(t => (
          <button key={t} onClick={() => setFilterTyp(t)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
            {TYP_CFG[t].emoji} {TYP_CFG[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(e => {
          const tCfg = TYP_CFG[e.typ]
          const isOpen = expanded === e.id
          return (
            <div key={e.id} className={`rounded-2xl border overflow-hidden ${tCfg.bg}`}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <span className="text-xl shrink-0">{tCfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-semibold ${tCfg.farbe}`}>{e.titel}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-teal-600">{e.wochentag} {e.uhrzeit}</span>
                    <span className="text-[9px] text-teal-500"><Clock className="w-2.5 h-2.5 inline" /> {e.dauer} Min</span>
                    {e.teilnehmer && <span className="text-[9px] text-teal-500"><Users className="w-2.5 h-2.5 inline" /> {e.teilnehmer}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${ALTER_CFG[e.altersgruppe]}`}>
                      {e.altersgruppe === 'krippe' ? 'Krippe' : e.altersgruppe === 'kita' ? 'Kita' : 'Alle'}
                    </span>
                    <span className={`text-[9px] font-semibold ${STATUS_CFG[e.status].farbe}`}>{STATUS_CFG[e.status].label}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-teal-400" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-200/50 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-700">Leitung: {e.leitung} · {e.gruppen.join(', ')}</p>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide">Förderziele</p>
                    {e.ziele.map((z, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                        <p className="text-[10px] text-teal-900">{z}</p>
                      </div>
                    ))}
                  </div>
                  {e.material && (
                    <div className="flex items-start gap-1">
                      <Star className="w-2.5 h-2.5 text-teal-400 mt-0.5 shrink-0" />
                      <p className="text-[9px] text-teal-700">Material: {e.material}</p>
                    </div>
                  )}
                  {e.notiz && (
                    <div className={`flex items-start gap-1.5 text-[10px] rounded-lg px-2 py-1.5 border ${e.notiz.startsWith('⚠️') ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-teal-50 border-teal-200 text-teal-700'}`}>
                      {e.notiz.startsWith('⚠️') ? <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> : <Star className="w-3 h-3 shrink-0 mt-0.5" />}
                      {e.notiz}
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
