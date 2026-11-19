import { BookOpen, Calculator, Globe, Leaf, Music } from 'lucide-react'
import Link from 'next/link'

const BEREICHE = [
  { href: '/lernen/mathe/klasse-1', icon: Calculator, label: 'Mathe Klasse 1', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { href: '/lernen/mathe/klasse-2', icon: Calculator, label: 'Mathe Klasse 2', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { href: '/lernen/mathe/klasse-3', icon: Calculator, label: 'Mathe Klasse 3', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { href: '/lernen/deutsch/lesen', icon: BookOpen, label: 'Lesen', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { href: '/lernen/deutsch/rechtschreibung', icon: BookOpen, label: 'Rechtschreibung', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { href: '/lernen/englisch', icon: Globe, label: 'Englisch', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { href: '/lernen/sachkunde/natur', icon: Leaf, label: 'Natur', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { href: '/lernen/musik', icon: Music, label: 'Musik', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
]

export default function LernenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Lernen</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Wähle ein Fach aus der Seitenleiste oder starte direkt hier.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BEREICHE.map(b => {
          const Icon = b.icon
          return (
            <Link
              key={b.href}
              href={b.href}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${b.color}`}>
                <Icon size={22} />
              </div>
              <span className="text-sm font-semibold text-center leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {b.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
