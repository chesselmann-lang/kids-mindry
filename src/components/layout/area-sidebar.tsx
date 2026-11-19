'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Star, Heart,
  Calculator, BookOpen, Globe, Leaf, Music,
  BookMarked, PlayCircle, FlaskConical, HelpCircle,
  Shirt, Award, Unlock,
  BarChart3, Shield, Bell, CreditCard,
  User, Lock, Settings,
  ChevronRight, SunMedium, Flame, Bookmark,
} from 'lucide-react'
import type { AppArea } from './area-top-bar'

interface SidebarGroup {
  id: string
  label: string
  items: SidebarItem[]
}

interface SidebarItem {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  badge?: number
  komingSoon?: boolean
}

const AREA_GROUPS: Record<AppArea, SidebarGroup[]> = {
  zuhause: [
    {
      id: 'heute',
      label: 'HEUTE',
      items: [
        { href: '/feed', icon: SunMedium, label: 'Was ist dran' },
        { href: '/heute', icon: Star, label: 'Tagesziele' },
      ],
    },
    {
      id: 'streak',
      label: 'STREAK',
      items: [
        { href: '/streak', icon: Flame, label: 'Tage-in-Folge' },
        { href: '/anwesenheit', icon: Heart, label: 'Anwesenheit' },
      ],
    },
    {
      id: 'favoriten',
      label: 'FAVORITEN',
      items: [
        { href: '/favoriten', icon: Bookmark, label: 'Meine Favoriten' },
      ],
    },
  ],
  lernen: [
    {
      id: 'mathe',
      label: 'MATHE',
      items: [
        { href: '/lernen/mathe/klasse-1', icon: Calculator, label: 'Klasse 1' },
        { href: '/lernen/mathe/klasse-2', icon: Calculator, label: 'Klasse 2' },
        { href: '/lernen/mathe/klasse-3', icon: Calculator, label: 'Klasse 3' },
      ],
    },
    {
      id: 'deutsch',
      label: 'DEUTSCH',
      items: [
        { href: '/lernen/deutsch/lesen', icon: BookOpen, label: 'Lesen' },
        { href: '/lernen/deutsch/rechtschreibung', icon: BookOpen, label: 'Rechtschreibung' },
        { href: '/lernen/deutsch/grammatik', icon: BookOpen, label: 'Grammatik' },
      ],
    },
    {
      id: 'englisch',
      label: 'ENGLISCH',
      items: [
        { href: '/lernen/englisch', icon: Globe, label: 'Englisch' },
      ],
    },
    {
      id: 'sachkunde',
      label: 'SACHKUNDE',
      items: [
        { href: '/lernen/sachkunde/natur', icon: Leaf, label: 'Natur' },
        { href: '/lernen/sachkunde/technik', icon: FlaskConical, label: 'Technik' },
        { href: '/lernen/sachkunde/welt', icon: Globe, label: 'Welt' },
      ],
    },
    {
      id: 'musik-kreativ',
      label: 'MUSIK & KREATIV',
      items: [
        { href: '/lernen/musik', icon: Music, label: 'Musik' },
        { href: '/lernen/kreativ', icon: Heart, label: 'Kreativ' },
      ],
    },
  ],
  entdecken: [
    {
      id: 'leseabenteuer',
      label: 'LESEABENTEUER',
      items: [
        { href: '/entdecken/geschichten', icon: BookMarked, label: 'Altersgerechte Stories' },
        { href: '/entdecken/hoerspiele', icon: PlayCircle, label: 'Hörspiele' },
      ],
    },
    {
      id: 'wissen-videos',
      label: 'WISSEN-VIDEOS',
      items: [
        { href: '/entdecken/videos', icon: PlayCircle, label: 'Kuratierte Videos' },
      ],
    },
    {
      id: 'experimente',
      label: 'EXPERIMENTE',
      items: [
        { href: '/entdecken/experimente', icon: FlaskConical, label: 'Mitmach-Experimente' },
      ],
    },
    {
      id: 'mini-quiz',
      label: 'MINI-QUIZ',
      items: [
        { href: '/entdecken/quiz', icon: HelpCircle, label: 'Quiz & Rätsel' },
      ],
    },
  ],
  belohnungen: [
    {
      id: 'avatar',
      label: 'AVATAR',
      items: [
        { href: '/belohnungen/avatar', icon: Shirt, label: 'Anziehsachen & Outfits' },
      ],
    },
    {
      id: 'sammlung',
      label: 'SAMMLUNG',
      items: [
        { href: '/belohnungen/sticker', icon: Star, label: 'Sticker & Abzeichen' },
        { href: '/belohnungen/sammlung', icon: Award, label: 'Meine Sammlung' },
      ],
    },
    {
      id: 'freischaltungen',
      label: 'FREISCHALTUNGEN',
      items: [
        { href: '/belohnungen/welten', icon: Unlock, label: 'Neue Welten' },
      ],
    },
  ],
  eltern: [
    {
      id: 'fortschritt',
      label: 'FORTSCHRITT',
      items: [
        { href: '/eltern/fortschritt', icon: BarChart3, label: 'Pro-Kind-Report' },
        { href: '/eltern/statistik', icon: BarChart3, label: 'Statistiken' },
      ],
    },
    {
      id: 'einstellungen-eltern',
      label: 'EINSTELLUNGEN',
      items: [
        { href: '/eltern/bildschirm-limit', icon: Shield, label: 'Bildschirm-Limit' },
        { href: '/eltern/inhalts-filter', icon: Lock, label: 'Inhalts-Filter' },
      ],
    },
    {
      id: 'benachrichtigungen-eltern',
      label: 'BENACHRICHTIGUNGEN',
      items: [
        { href: '/eltern/alerts', icon: Bell, label: 'Alert-Einstellungen' },
      ],
    },
    {
      id: 'konto',
      label: 'KONTOVERWALTUNG',
      items: [
        { href: '/eltern/konto', icon: CreditCard, label: 'Abo & Abrechnung' },
        { href: '/eltern/kinder-konten', icon: User, label: 'Kinder-Profile' },
      ],
    },
  ],
  einstellungen: [
    {
      id: 'account',
      label: 'ACCOUNT',
      items: [
        { href: '/profil', icon: User, label: 'Mein Profil' },
        { href: '/einstellungen/account', icon: Settings, label: 'Konto-Einstellungen' },
      ],
    },
    {
      id: 'privatsphaere',
      label: 'PRIVATSPHÄRE',
      items: [
        { href: '/datenschutz', icon: Lock, label: 'Datenschutz' },
        { href: '/einwilligungen', icon: Shield, label: 'Einwilligungen' },
      ],
    },
    {
      id: 'eltern-control',
      label: 'ELTERN-CONTROL',
      items: [
        { href: '/eltern', icon: Shield, label: 'Eltern-Bereich' },
      ],
    },
  ],
}

interface Props {
  activeArea: AppArea
  isAdmin?: boolean
  isStaff?: boolean
}

export default function AreaSidebar({ activeArea, isAdmin = false, isStaff = false }: Props) {
  const pathname = usePathname()
  const groups = AREA_GROUPS[activeArea] ?? AREA_GROUPS.zuhause

  return (
    <aside
      className="hidden lg:flex flex-col h-full border-r overflow-hidden flex-shrink-0"
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        {groups.map(group => (
          <div key={group.id} className="mb-3">
            <p
              className="px-4 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {group.label}
            </p>
            {group.items.map(item => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href !== '/feed' && item.href !== '/heute' && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.href}
                  href={item.komingSoon ? '#' : item.href}
                  className={`
                    flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-colors duration-100 min-h-[44px]
                    ${active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    }
                    ${item.komingSoon ? 'opacity-40 pointer-events-none' : ''}
                  `}
                  style={!active ? { color: 'var(--color-text-secondary)' } : {}}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/30' : 'bg-brand-100 text-brand-700'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.komingSoon && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500">Bald</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}

        {/* Admin-Link wenn Staff */}
        {(isAdmin || isStaff) && (
          <div className="mx-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[44px] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Shield size={16} />
              <span>Admin-Bereich</span>
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        )}
      </nav>
    </aside>
  )
}
