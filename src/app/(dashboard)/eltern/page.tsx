import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, ShieldAlert, BarChart3, CreditCard, User, Bell, ExternalLink } from 'lucide-react'
import ParentalControlsClient, { type ChildControl } from './parental-controls-client'
import DsgvoActionsClient from './dsgvo-actions-client'

export const metadata = { title: 'Eltern-Bereich · mindry kids' }

const QUICK_LINKS = [
  { href: '/eltern/fortschritt', icon: BarChart3, label: 'Lernfortschritt', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { href: '/eltern/statistik',   icon: BarChart3, label: 'Statistiken',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { href: '/eltern/konto',       icon: CreditCard, label: 'Abo & Abrechnung', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { href: '/eltern/kinder-konten', icon: User, label: 'Kinder-Profile',    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { href: '/eltern/alerts',      icon: Bell, label: 'Alert-Einstellungen', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { href: '/einwilligungen',     icon: Shield, label: 'Einwilligungen',     color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' },
]

export default async function ElternPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/anmelden')

  // Load children for this guardian
  const { data: guardians } = await supabase
    .from('guardians')
    .select('child_id, full_name, children(id, first_name, last_name)')
    .eq('user_id', user.id)

  const childIds = (guardians ?? []).map((g: any) => g.child_id).filter(Boolean)

  // Load parental_controls for each child
  let controlRows: any[] = []
  if (childIds.length > 0) {
    const { data } = await (supabase as any)
      .from('parental_controls')
      .select('*')
      .in('child_id', childIds)
    controlRows = data ?? []
  }

  const childControls: ChildControl[] = (guardians ?? []).map((g: any) => {
    const child = g.children
    const ctrl = controlRows.find((r: any) => r.child_id === g.child_id)
    return {
      child_id: g.child_id,
      child_name: child ? `${child.first_name} ${child.last_name}` : g.full_name ?? 'Kind',
      controls_id: ctrl?.id ?? null,
      daily_limit_minutes: ctrl?.daily_limit_minutes ?? 60,
      max_age_rating: ctrl?.max_age_rating ?? '6+',
      weekly_report_enabled: ctrl?.weekly_report_enabled ?? false,
      weekly_report_email: ctrl?.weekly_report_email ?? user.email ?? '',
    }
  })

  const childrenForDsgvo = childControls.map(c => ({ child_id: c.child_id, child_name: c.child_name }))

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={20} className="text-brand-600" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Eltern-Bereich</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Bildschirmzeit, Inhaltsfilter, Datenschutz und Berichte für Ihre Kinder
        </p>
      </div>

      {/* Parental Controls (screen time + KJM filter + weekly report) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Kinderschutz-Einstellungen
        </h2>
        <ParentalControlsClient children={childControls} />
      </section>

      {/* DSGVO Actions */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Datenschutz-Aktionen
        </h2>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Beide Aktionen erfordern Ihren Eltern-PIN zur Bestätigung.
        </p>
        <DsgvoActionsClient children={childrenForDsgvo} />
      </section>

      {/* Quick links grid */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Weitere Bereiche
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_LINKS.map(l => {
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 p-3 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${l.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{l.label}</p>
                </div>
                <ExternalLink size={12} className="flex-shrink-0 text-gray-300" />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
