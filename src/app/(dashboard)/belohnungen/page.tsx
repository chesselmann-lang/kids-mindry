import { Star, Award, Shirt, Unlock, Sparkles } from 'lucide-react'
import Link from 'next/link'

const BEREICHE = [
  {
    href: '/belohnungen/avatar',
    icon: Shirt,
    label: 'Avatar & Outfits',
    desc: 'Passe deinen Avatar an',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  },
  {
    href: '/belohnungen/sticker',
    icon: Star,
    label: 'Sticker & Abzeichen',
    desc: 'Deine gesammelten Sticker',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    href: '/belohnungen/sammlung',
    icon: Award,
    label: 'Meine Sammlung',
    desc: 'Alle Trophäen und Auszeichnungen',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/belohnungen/welten',
    icon: Unlock,
    label: 'Neue Welten',
    desc: 'Freischaltbare Lernwelten',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
]

export default function BelohnungenPage() {
  return (
    <div>
      {/* Points banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-6">
        <div className="flex items-center gap-2 mb-1 opacity-90">
          <Sparkles size={16} />
          <span className="text-sm font-semibold">Dein Punkte-Stand</span>
        </div>
        <p className="text-4xl font-bold">180 Punkte</p>
        <p className="text-sm opacity-80 mt-1">🏆 Rang: Lern-Champion</p>
      </div>

      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Bereiche</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BEREICHE.map(b => {
          const Icon = b.icon
          return (
            <Link
              key={b.href}
              href={b.href}
              className="flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${b.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{b.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{b.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
