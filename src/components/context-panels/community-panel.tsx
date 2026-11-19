'use client'

import { Shield, Users, MessageCircle, Flag, CheckCircle, AlertTriangle } from 'lucide-react'

const POSTS = [
  {
    id: 1,
    autor: 'Emma K.',
    text: 'Ich habe heute alle Mathe-Aufgaben geschafft! 🎉',
    zeit: 'vor 5 Min',
    moderiert: true,
    likes: 4,
    altersgruppe: '6–8 J',
  },
  {
    id: 2,
    autor: 'Tim S.',
    text: 'Wer mag auch Dinosaurier? Ich mag den T-Rex am liebsten!',
    zeit: 'vor 12 Min',
    moderiert: true,
    likes: 7,
    altersgruppe: '6–8 J',
  },
  {
    id: 3,
    autor: 'Lara M.',
    text: 'Habe heute das Leseabenteuer "Zauberschule" beendet 📚',
    zeit: 'vor 30 Min',
    moderiert: true,
    likes: 12,
    altersgruppe: '7–9 J',
  },
]

export default function CommunityPanel() {
  return (
    <div className="p-4 space-y-5">
      {/* Sicherheits-Badge */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800">
        <Shield size={18} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">100% Moderiert</p>
          <p className="text-[10px] text-green-600 dark:text-green-500">Alle Beiträge werden vor Freischaltung geprüft</p>
        </div>
      </div>

      {/* Erwachsenen-Trennung */}
      <div className="p-3 rounded-xl border border-amber-100 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-amber-600" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Kinder-only Zone</p>
        </div>
        <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">
          Erwachsene können Beiträge nur als Moderatoren lesen, nicht kommentieren
        </p>
      </div>

      {/* Aktuelle Posts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={14} className="text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Aktuelle Beiträge</span>
        </div>
        <div className="space-y-2">
          {POSTS.map(p => (
            <div key={p.id} className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
              <div className="flex items-start gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-brand-700">
                  {p.autor[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{p.autor}</span>
                    {p.moderiert && <CheckCircle size={10} className="text-green-500" />}
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>· {p.altersgruppe}</span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{p.text}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>❤️ {p.likes}</span>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>· {p.zeit}</span>
                </div>
                <button className="p-0.5" title="Melden">
                  <Flag size={10} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
