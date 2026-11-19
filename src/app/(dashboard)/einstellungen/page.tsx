import { User, Settings, Lock, Shield } from 'lucide-react'
import Link from 'next/link'

const BEREICHE = [
  {
    href: '/profil',
    icon: User,
    label: 'Mein Profil',
    desc: 'Avatar, Name und persönliche Daten',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    href: '/einstellungen/account',
    icon: Settings,
    label: 'Konto-Einstellungen',
    desc: 'E-Mail, Passwort und Sicherheit',
    color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
  },
  {
    href: '/datenschutz',
    icon: Lock,
    label: 'Datenschutz',
    desc: 'Deine Daten und Rechte (DSGVO)',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    href: '/einwilligungen',
    icon: Shield,
    label: 'Einwilligungen',
    desc: 'Zustimmungen verwalten und widerrufen',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/eltern',
    icon: Shield,
    label: 'Eltern-Bereich',
    desc: 'Kindersicherung und Eltern-Einstellungen',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
]

export default function EinstellungenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Einstellungen</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Konto, Datenschutz und Kindersicherung verwalten.
      </p>
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
