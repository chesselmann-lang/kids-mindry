'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, CalendarDays, MessageCircle, User, Baby,
  ClipboardList, Shield, SunMedium, Utensils
} from 'lucide-react'
import { clsx } from 'clsx'

const parentNav = [
  { href: '/feed',        icon: Home,          label: 'Feed' },
  { href: '/mein-kind',   icon: Baby,          label: 'Mein Kind' },
  { href: '/nachrichten', icon: MessageCircle, label: 'Nachrichten' },
  { href: '/kalender',    icon: CalendarDays,  label: 'Kalender' },
  { href: '/profil',      icon: User,          label: 'Profil' },
]

const staffNav = [
  { href: '/heute',          icon: SunMedium,     label: 'Heute' },
  { href: '/kinder',         icon: Baby,          label: 'Kinder' },
  { href: '/nachrichten',    icon: MessageCircle, label: 'Nachrichten' },
  { href: '/tagesberichte',  icon: ClipboardList, label: 'Berichte' },
  { href: '/profil',         icon: User,          label: 'Profil' },
]

const adminNav = [
  { href: '/heute',        icon: SunMedium,     label: 'Heute' },
  { href: '/kinder',       icon: Baby,          label: 'Kinder' },
  { href: '/nachrichten',  icon: MessageCircle, label: 'Nachrichten' },
  { href: '/admin',        icon: Shield,        label: 'Admin' },
  { href: '/profil',       icon: User,          label: 'Profil' },
]

interface Props {
  isStaff?: boolean
  isAdmin?: boolean
  unreadMessages?: number
  unreadNotifications?: number
}

export default function BottomNav({ isStaff = false, isAdmin = false, unreadMessages = 0, unreadNotifications = 0 }: Props) {
  const pathname = usePathname()
  const navItems = isAdmin ? adminNav : isStaff ? staffNav : parentNav

  function getBadgeCount(href: string): number {
    if (href === '/nachrichten') return unreadMessages
    if (href === '/feed' && !isStaff) return unreadNotifications
    return 0
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t safe-bottom" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const badgeCount = getBadgeCount(href)
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150',
                active ? 'text-brand-800' : 'text-gray-400 hover:text-gray-600'
              )}>
              <div className={clsx('relative p-1.5 rounded-xl transition-colors',
                active ? 'bg-brand-50' : 'hover:bg-gray-50')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                {badgeCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className={clsx('text-[10px] font-medium', active ? 'text-brand-800' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
