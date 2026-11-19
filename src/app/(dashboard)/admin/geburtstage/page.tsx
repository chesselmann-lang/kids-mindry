'use client'

import { useState } from 'react'
import {
  Star, ChevronDown, ChevronUp,
  CalendarDays, Users, Gift, Bell,
  Heart, Cake,
} from 'lucide-react'

// ── Geburtstage — Mindry Kids ─────────────────────────────────────────────────
// Kindergeburtstage · Mitarbeiter · Erinnerungen · Leiterin

type Monat = 'Jan' | 'Feb' | 'Mär' | 'Apr' | 'Mai' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Okt' | 'Nov' | 'Dez'
type PersonTyp = 'kind' | 'mitarbeiter'

interface GeburtstagPerson {
  id: string
  name: string
  typ: PersonTyp
  gruppe?: string
  datum: string // DD.MM
  alter?: number
  erinnerung: boolean
}

const MONATE: Monat[] = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const MONAT_VOLL: Record<Monat, string> = {
  Jan: 'Januar', Feb: 'Februar', Mär: 'März', Apr: 'April', Mai: 'Mai', Jun: 'Juni',
  Jul: 'Juli', Aug: 'August', Sep: 'September', Okt: 'Oktober', Nov: 'November', Dez: 'Dezember',
}

const GRUPPE_FARBE: Record<string, string> = {
  'Bienen':       'text-amber-700',
  'Schmetterlinge':'text-purple-700',
  'Krabbelkäfer': 'text-green-700',
  'Team':         'text-blue-700',
}

const INIT_PERSONEN: GeburtstagPerson[] = [
  // Kinder
  { id: 'g1',  name: 'Mia Bauer',      typ: 'kind', gruppe: 'Bienen',        datum: '03.05', alter: 4, erinnerung: true },
  { id: 'g2',  name: 'Luca Meier',     typ: 'kind', gruppe: 'Schmetterlinge', datum: '15.05', alter: 5, erinnerung: true },
  { id: 'g3',  name: 'Emma Fischer',   typ: 'kind', gruppe: 'Krabbelkäfer',  datum: '22.05', alter: 2, erinnerung: true },
  { id: 'g4',  name: 'Ben Koch',       typ: 'kind', gruppe: 'Bienen',        datum: '28.05', alter: 4, erinnerung: false },
  { id: 'g5',  name: 'Sophie Braun',   typ: 'kind', gruppe: 'Schmetterlinge', datum: '08.06', alter: 6, erinnerung: true },
  { id: 'g6',  name: 'Finn Weber',     typ: 'kind', gruppe: 'Bienen',        datum: '12.06', alter: 4, erinnerung: false },
  { id: 'g7',  name: 'Hannah Klein',   typ: 'kind', gruppe: 'Krabbelkäfer',  datum: '19.04', alter: 1, erinnerung: true },
  { id: 'g8',  name: 'Noah Wagner',    typ: 'kind', gruppe: 'Schmetterlinge', datum: '30.04', alter: 5, erinnerung: true },
  // Mitarbeiter
  { id: 'g9',  name: 'Fr. Bauer',      typ: 'mitarbeiter', gruppe: 'Team', datum: '17.05', erinnerung: true },
  { id: 'g10', name: 'Fr. Klein',      typ: 'mitarbeiter', gruppe: 'Team', datum: '03.06', erinnerung: true },
  { id: 'g11', name: 'Hr. Weber',      typ: 'mitarbeiter', gruppe: 'Team', datum: '25.04', erinnerung: false },
]

function getMonat(datum: string): Monat {
  const monatNr = parseInt(datum.split('.')[1], 10)
  return MONATE[monatNr - 1]
}

function getTag(datum: string): number {
  return parseInt(datum.split('.')[0], 10)
}

function istNaechste30Tage(datum: string): boolean {
  const today = new Date()
  const tag = getTag(datum)
  const monatNr = parseInt(datum.split('.')[1], 10) - 1
  const test = new Date(today.getFullYear(), monatNr, tag)
  if (test < today) test.setFullYear(today.getFullYear() + 1)
  const diff = (test.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 30
}

export default function GeburtstagePage() {
  const [personen, setPersonen] = useState(INIT_PERSONEN)
  const [aktuellerMonat, setAktuellerMonat] = useState<Monat>('Mai')
  const [filterTyp, setFilterTyp] = useState<PersonTyp | 'alle'>('alle')

  function erinnerungToggle(id: string) {
    setPersonen(prev => prev.map(p =>
      p.id === id ? { ...p, erinnerung: !p.erinnerung } : p
    ))
  }

  const filtered = personen
    .filter(p => getMonat(p.datum) === aktuellerMonat)
    .filter(p => filterTyp === 'alle' || p.typ === filterTyp)
    .sort((a, b) => getTag(a.datum) - getTag(b.datum))

  const naechste = personen
    .filter(p => istNaechste30Tage(p.datum))
    .sort((a, b) => getTag(a.datum) - getTag(b.datum))

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-500" /> Geburtstage
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Kinder & Team · Erinnerungen</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kinder', val: personen.filter(p => p.typ === 'kind').length, color: 'text-amber-700' },
          { label: 'Team',   val: personen.filter(p => p.typ === 'mitarbeiter').length, color: 'text-blue-700' },
          { label: 'Nächste 30 Tage', val: naechste.length, color: naechste.length > 0 ? 'text-green-700' : 'text-gray-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Nächste Geburtstage */}
      {naechste.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-2 flex items-center gap-1">
            <Bell className="w-3 h-3" /> Nächste 30 Tage
          </p>
          <div className="space-y-1.5">
            {naechste.map(p => (
              <div key={p.id} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-lg shrink-0">
                  🎂
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{p.name}</p>
                  <p className="text-[10px] text-amber-700/60">{p.datum} · {p.gruppe}{p.alter ? ` · wird ${p.alter + 1}` : ''}</p>
                </div>
                <button onClick={() => erinnerungToggle(p.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    p.erinnerung ? 'bg-amber-400 text-white' : 'bg-amber-100 text-amber-600'
                  }`}>
                  {p.erinnerung ? '🔔' : '🔕'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monatsauswahl */}
      <div className="overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {MONATE.map(m => {
            const anzahl = personen.filter(p => getMonat(p.datum) === m).length
            return (
              <button key={m} onClick={() => setAktuellerMonat(m)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  aktuellerMonat === m ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                <span>{m}</span>
                {anzahl > 0 && <span className={`text-[9px] mt-0.5 ${aktuellerMonat === m ? 'text-amber-100' : 'text-amber-500'}`}>{anzahl}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Typ-Filter */}
      <div className="flex gap-2">
        {(['alle', 'kind', 'mitarbeiter'] as const).map(t => (
          <button key={t} onClick={() => setFilterTyp(t)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterTyp === t ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {t === 'alle' ? 'Alle' : t === 'kind' ? 'Kinder' : 'Team'}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div>
        <p className="text-xs font-bold text-amber-800 mb-3">
          {MONAT_VOLL[aktuellerMonat]} — {filtered.length} Eintrag{filtered.length !== 1 ? 'e' : ''}
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-amber-100 bg-white p-6 text-center">
            <p className="text-2xl mb-2">🎈</p>
            <p className="text-sm text-amber-700/60">Keine Geburtstage im {MONAT_VOLL[aktuellerMonat]}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="rounded-2xl border border-amber-100 bg-white flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">
                  {p.typ === 'kind' ? '🧒' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-amber-700/60">{p.datum}</span>
                    {p.alter && <span className="text-[10px] text-amber-600 font-semibold">wird {p.alter + 1}</span>}
                    {p.gruppe && (
                      <span className={`text-[9px] font-semibold ${GRUPPE_FARBE[p.gruppe] ?? 'text-gray-500'}`}>{p.gruppe}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => erinnerungToggle(p.id)}
                  className={`text-sm px-2 py-1 rounded-xl border transition-colors ${
                    p.erinnerung ? 'bg-amber-100 border-amber-200' : 'border-gray-100 bg-gray-50'
                  }`}
                  title={p.erinnerung ? 'Erinnerung aktiv' : 'Keine Erinnerung'}>
                  {p.erinnerung ? '🔔' : '🔕'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
