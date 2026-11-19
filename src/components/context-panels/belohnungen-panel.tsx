'use client'

import { Gift, Star, Clock, CheckCircle, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const BADGES = [
  { id: 1, name: 'Mathe-Star', icon: '⭐', beschreibung: '10 Aufgaben richtig', fortschritt: 8, max: 10, einloesbar: false },
  { id: 2, name: 'Lese-Fuchs', icon: '🦊', beschreibung: '5 Bücher gelesen', fortschritt: 5, max: 5, einloesbar: true },
  { id: 3, name: 'Entdecker', icon: '🔭', beschreibung: '3 Sachkunde-Module', fortschritt: 2, max: 3, einloesbar: false },
]

const FREISCHALTUNGEN = [
  { name: 'Weltraum-Welt', icon: '🚀', punkte: 150, verfuegbar: true },
  { name: 'Ozean-Welt', icon: '🌊', punkte: 200, verfuegbar: false },
]

export default function BelohnungenPanel() {
  return (
    <div className="p-4 space-y-5">
      {/* Punkte-Status */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} />
          <span className="text-xs font-semibold opacity-90">Gamification-Status</span>
        </div>
        <p className="text-3xl font-bold">180 Punkte</p>
        <p className="text-xs opacity-80 mt-1">🏆 Rang: Lern-Champion</p>
      </div>

      {/* Einlösbare Badges */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Badges</span>
        </div>
        <div className="space-y-2">
          {BADGES.map(b => (
            <div key={b.id} className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{b.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{b.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{b.beschreibung}</p>
                </div>
                {b.einloesbar && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Einlösbar!
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-3)' }}>
                <div
                  className={`h-1.5 rounded-full ${b.einloesbar ? 'bg-green-500' : 'bg-amber-400'}`}
                  style={{ width: `${(b.fortschritt / b.max) * 100}%` }}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{b.fortschritt}/{b.max}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parental-Approval-Queue */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-purple-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Eltern-Freigabe</span>
        </div>
        <div className="space-y-2">
          {FREISCHALTUNGEN.map(f => (
            <div key={f.name} className={`flex items-center gap-3 p-2.5 rounded-xl border ${
              f.verfuegbar ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : ''
            }`} style={!f.verfuegbar ? { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' } : {}}>
              <span className="text-xl">{f.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{f.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{f.punkte} Punkte</p>
              </div>
              {f.verfuegbar
                ? <CheckCircle size={16} className="text-green-500" />
                : <span className="text-[10px] text-amber-600 font-semibold">Warten...</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
