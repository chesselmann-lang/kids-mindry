'use client'

import { Filter, Wifi, WifiOff, Star, ChevronRight, BookOpen } from 'lucide-react'
import { useState } from 'react'

const ALTER_GRUPPEN = ['3–4 J', '5–6 J', '7–8 J', '9–10 J']
const KATEGORIEN = ['Mathe', 'Deutsch', 'Englisch', 'Natur', 'Kreativ', 'Musik']

const FEATURED = [
  { titel: 'Zahlen bis 20', kategorie: 'Mathe', alter: '5–6 J', bewertung: 4.8, offline: true },
  { titel: 'ABC Lernwelt', kategorie: 'Deutsch', alter: '5–6 J', bewertung: 4.9, offline: true },
  { titel: 'Tiere der Welt', kategorie: 'Natur', alter: '7–8 J', bewertung: 4.6, offline: false },
]

export default function LerninhaltePanel() {
  const [selectedAlter, setSelectedAlter] = useState<string | null>(null)
  const [selectedKat, setSelectedKat] = useState<string | null>(null)
  const [offlineOnly, setOfflineOnly] = useState(false)

  return (
    <div className="p-4 space-y-5">
      {/* Altersgerechte Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Altersgruppe</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALTER_GRUPPEN.map(a => (
            <button
              key={a}
              onClick={() => setSelectedAlter(s => s === a ? null : a)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedAlter === a
                  ? 'bg-brand-600 text-white'
                  : 'border text-gray-600 dark:text-gray-300 hover:border-brand-300'
              }`}
              style={selectedAlter !== a ? { borderColor: 'var(--color-border)' } : {}}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Kategorie-Filter */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: 'var(--color-text-muted)' }}>Bereich</span>
        <div className="flex flex-wrap gap-1.5">
          {KATEGORIEN.map(k => (
            <button
              key={k}
              onClick={() => setSelectedKat(s => s === k ? null : k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedKat === k
                  ? 'bg-purple-600 text-white'
                  : 'border text-gray-600 dark:text-gray-300 hover:border-purple-300'
              }`}
              style={selectedKat !== k ? { borderColor: 'var(--color-border)' } : {}}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Offline-Toggle */}
      <button
        onClick={() => setOfflineOnly(o => !o)}
        className={`flex items-center gap-2 w-full p-2.5 rounded-xl border transition-colors ${
          offlineOnly ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : ''
        }`}
        style={!offlineOnly ? { borderColor: 'var(--color-border)' } : {}}
      >
        {offlineOnly ? <Wifi size={14} className="text-green-600" /> : <WifiOff size={14} style={{ color: 'var(--color-text-muted)' }} />}
        <span className={`text-xs font-semibold ${offlineOnly ? 'text-green-700 dark:text-green-400' : ''}`}
          style={!offlineOnly ? { color: 'var(--color-text-secondary)' } : {}}
        >
          {offlineOnly ? 'Nur Offline-Inhalte' : 'Offline-Inhalte anzeigen'}
        </span>
      </button>

      {/* Top-Inhalte */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Top-Bewertungen</span>
        </div>
        <div className="space-y-2">
          {FEATURED
            .filter(f => !offlineOnly || f.offline)
            .filter(f => !selectedAlter || f.alter === selectedAlter)
            .filter(f => !selectedKat || f.kategorie === selectedKat)
            .map(f => (
              <div key={f.titel} className="flex items-center gap-3 p-2.5 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{f.titel}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{f.alter}</span>
                    <span className="text-[10px] text-amber-600">★ {f.bewertung}</span>
                    {f.offline && <WifiOff size={9} className="text-green-500" />}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
