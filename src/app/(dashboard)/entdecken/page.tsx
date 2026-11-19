import { BookMarked, PlayCircle, FlaskConical, HelpCircle } from 'lucide-react'
import Link from 'next/link'

const KATEGORIEN = [
  {
    href: '/entdecken/geschichten',
    icon: BookMarked,
    label: 'Altersgerechte Stories',
    desc: 'Spannende Geschichten zum Lesen und Entdecken',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    href: '/entdecken/hoerspiele',
    icon: PlayCircle,
    label: 'Hörspiele',
    desc: 'Spannende Audio-Abenteuer für unterwegs',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/entdecken/videos',
    icon: PlayCircle,
    label: 'Wissen-Videos',
    desc: 'Kuratierte Lernvideos ohne Werbung',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  {
    href: '/entdecken/experimente',
    icon: FlaskConical,
    label: 'Mitmach-Experimente',
    desc: 'Spannende Versuche zum Selbermachen',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    href: '/entdecken/quiz',
    icon: HelpCircle,
    label: 'Quiz & Rätsel',
    desc: 'Teste dein Wissen mit Mini-Quizzes',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
]

export default function EntdeckenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Entdecken</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Geschichten, Videos, Experimente und mehr – alles kindersicher kuratiert.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {KATEGORIEN.map(k => {
          const Icon = k.icon
          return (
            <Link
              key={k.href}
              href={k.href}
              className="flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{k.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{k.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
