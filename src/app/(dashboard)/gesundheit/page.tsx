'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart, AlertTriangle, Pill, Activity, Search,
  ChevronRight, CheckCircle2, Clock, Thermometer, Baby,
} from 'lucide-react'

// ── Gesundheits-Übersicht ─────────────────────────────────────────────────────
// Zeigt alle Kinder mit Gesundheits-Hinweisen: Allergien, Medikamente, Krankmeldungen
// Details per Kind unter /gesundheit/[childId]

const KINDER = [
  { id: '1', name: 'Lena M.',    gruppe: 'Sonnenkäfer', allergie: 'Erdnüsse', medikament: null,           krank: false, fieber: false },
  { id: '2', name: 'Noah S.',    gruppe: 'Regenbogen',  allergie: null,        medikament: 'Salbutamol',   krank: false, fieber: false },
  { id: '3', name: 'Mia K.',     gruppe: 'Sonnenkäfer', allergie: 'Laktose',   medikament: 'Ritalin',      krank: false, fieber: false },
  { id: '4', name: 'Leon B.',    gruppe: 'Schmetterlinge', allergie: null,     medikament: null,           krank: true,  fieber: true  },
  { id: '5', name: 'Emilia R.',  gruppe: 'Regenbogen',  allergie: 'Gluten',    medikament: null,           krank: false, fieber: false },
  { id: '6', name: 'Ben T.',     gruppe: 'Schmetterlinge', allergie: null,     medikament: null,           krank: false, fieber: false },
  { id: '7', name: 'Hannah W.',  gruppe: 'Sonnenkäfer', allergie: null,        medikament: null,           krank: true,  fieber: false },
  { id: '8', name: 'Felix P.',   gruppe: 'Regenbogen',  allergie: 'Bienen',    medikament: 'Epinephrin',   krank: false, fieber: false },
]

const GRUPPEN = ['Alle', ...Array.from(new Set(KINDER.map(k => k.gruppe)))]

type Filter = 'alle' | 'allergie' | 'medikament' | 'krank'

export default function GesundheitPage() {
  const [suche, setSuche] = useState('')
  const [gruppe, setGruppe] = useState('Alle')
  const [filter, setFilter] = useState<Filter>('alle')

  const filtered = KINDER.filter(k => {
    if (suche && !k.name.toLowerCase().includes(suche.toLowerCase())) return false
    if (gruppe !== 'Alle' && k.gruppe !== gruppe) return false
    if (filter === 'allergie' && !k.allergie) return false
    if (filter === 'medikament' && !k.medikament) return false
    if (filter === 'krank' && !k.krank) return false
    return true
  })

  const stats = {
    allergien: KINDER.filter(k => k.allergie).length,
    medikamente: KINDER.filter(k => k.medikament).length,
    krank: KINDER.filter(k => k.krank).length,
    fieber: KINDER.filter(k => k.fieber).length,
  }

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <Heart className="w-6 h-6 text-red-500" /> Gesundheit
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Allergien · Medikamente · Krankmeldungen</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Allergien', val: stats.allergien, icon: AlertTriangle, color: 'orange' },
          { label: 'Medikamente', val: stats.medikamente, icon: Pill,      color: 'blue'   },
          { label: 'Krank heute', val: stats.krank,       icon: Activity,  color: 'red'    },
          { label: 'Mit Fieber',  val: stats.fieber,      icon: Thermometer,color:'purple' },
        ].map(c => {
          const Icon = c.icon
          const cls: Record<string, string> = {
            orange: 'bg-orange-50 text-orange-600',
            blue:   'bg-blue-50 text-blue-600',
            red:    'bg-red-50 text-red-600',
            purple: 'bg-purple-50 text-purple-600',
          }
          return (
            <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${cls[c.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{c.val}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            value={suche} onChange={e => setSuche(e.target.value)}
            placeholder="Kind suchen..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <select
          value={gruppe} onChange={e => setGruppe(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none"
        >
          {GRUPPEN.map(g => <option key={g}>{g}</option>)}
        </select>
        {(['alle', 'allergie', 'medikament', 'krank'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {f === 'alle' ? 'Alle' : f === 'allergie' ? '🤧 Allergie' : f === 'medikament' ? '💊 Medikament' : '🤒 Krank'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(kind => (
          <Link key={kind.id} href={`/gesundheit/${kind.id}`}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-sm shrink-0">
              {kind.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-gray-900">{kind.name}</p>
                {kind.krank && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    {kind.fieber ? <><Thermometer className="w-3 h-3" /> Fieber</> : <><Clock className="w-3 h-3" /> Krank</>}
                  </span>
                )}
                {kind.allergie && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                    🤧 {kind.allergie}
                  </span>
                )}
                {kind.medikament && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    💊 {kind.medikament}
                  </span>
                )}
                {!kind.krank && !kind.allergie && !kind.medikament && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Keine Hinweise
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{kind.gruppe}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Baby className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine Kinder gefunden</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Gesundheitsdaten sind besonders schützenswert (Art. 9 DSGVO) — nur für autorisiertes Fachpersonal sichtbar.
      </p>
    </div>
  )
}
