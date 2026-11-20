'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Baby, MessageCircle, CalendarDays, Users, Shield,
  ClipboardList, Bell, BookOpen, Star, BarChart3, Settings, CheckCircle2,
  SunMedium, Utensils, Heart, ChevronRight, Pin, Clock,
  Sparkles, GraduationCap, Gift, Globe, ChevronLeft,
  LogOut, User, Search, Building2, AlertTriangle, Cloud, FileText, Moon, Camera, Tv2, FolderOpen, ShieldCheck,
  CalendarCheck, Award, Handshake, Flag,
  Lightbulb, Rainbow, HeartHandshake,
  Droplets, LayoutDashboard,
  ShieldAlert, Network,
  Sprout,
  ArrowRightLeft, Activity, Layers,
  BadgeCheck, Leaf, LayoutGrid,
  ScrollText, Inbox,
  UserCog,
  Stethoscope,
  Eye,
  UserPlus,
  Languages,
  TrendingUp,
  ScanEye,
  ShoppingCart,
  BellRing,
  BookHeart,
  Umbrella,
  Clock3,
  MapPinned,
  Receipt,
  Wallet,
  Phone,
  Milestone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  badge?: number
  adminOnly?: boolean
  staffOnly?: boolean
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Hauptmenü',
    items: [
      { href: '/heute',        icon: SunMedium,     label: 'Heute' },
      { href: '/feed',         icon: Home,           label: 'Feed' },
      { href: '/kinder',       icon: Baby,           label: 'Kinder',    staffOnly: true },
      { href: '/nachrichten',  icon: MessageCircle,  label: 'Nachrichten' },
      { href: '/kalender',     icon: CalendarDays,   label: 'Kalender' },
      { href: '/tagesberichte',icon: ClipboardList,  label: 'Tagesberichte', staffOnly: true },
    ],
  },
  {
    title: 'Kinder-Bereich',
    items: [
      { href: '/dashboard',    icon: GraduationCap, label: 'Lern-Dashboard' },
      { href: '/lerninhalte',  icon: BookOpen,       label: 'Lerninhalte' },
      { href: '/belohnungen',  icon: Gift,           label: 'Belohnungen' },
      { href: '/community',    icon: Globe,          label: 'Community' },
    ],
  },
  {
    title: 'Verwaltung',
    items: [
      { href: '/admin',               icon: Shield,         label: 'Admin',            adminOnly: true },
      { href: '/admin/cockpit',      icon: BarChart3,      label: 'KI-Cockpit',       adminOnly: true },
      { href: '/personalplanung',    icon: Users,          label: 'Personalplanung',  adminOnly: true },
      { href: '/ifsg',               icon: ShieldCheck,    label: 'IfSG §34',         staffOnly: true },
      { href: '/seldak',             icon: Languages,      label: 'SELDAK',           staffOnly: true },
      { href: '/basik',              icon: MessageCircle,  label: 'BaSiK',            staffOnly: true },
      { href: '/perik',              icon: Heart,          label: 'PERIK',            staffOnly: true },
      { href: '/grenzsteine',        icon: Milestone,      label: 'Grenzsteine',      staffOnly: true },
      { href: '/admin/qualitaet',    icon: Star,           label: 'Qualität',         adminOnly: true },
      { href: '/admin/ifsg',         icon: AlertTriangle,  label: 'IfSG §34 (Alt)',   adminOnly: true },
      { href: '/admin/inklusion',    icon: Heart,          label: 'Inklusion',        adminOnly: true },
      { href: '/admin/aktivitaeten',   icon: CalendarDays,   label: 'Aktivitätenplan',  adminOnly: true },
      { href: '/admin/essensprotokoll', icon: Utensils,     label: 'Essensprotokoll',  adminOnly: true },
      { href: '/admin/schlafprotokoll',       icon: Moon,         label: 'Schlafprotokoll',        adminOnly: true },
      { href: '/admin/entwicklungsgespraeche', icon: MessageCircle, label: 'Entwicklungsgespräche',  adminOnly: true },
      { href: '/admin/wickelprotokoll',        icon: Heart,         label: 'Wickelprotokoll',          adminOnly: true },
      { href: '/admin/personalplan',          icon: Users,         label: 'Dienstplan',               adminOnly: true },
      { href: '/admin/raumplanung',           icon: Building2,     label: 'Raumplanung',              adminOnly: true },
      { href: '/admin/geburtstage',          icon: Gift,          label: 'Geburtstage',              adminOnly: true },
      { href: '/admin/fotos',               icon: Camera,        label: 'Foto-Dokumentation',       adminOnly: true },
      { href: '/admin/hygiene',             icon: Shield,        label: 'Hygieneprotokoll',         adminOnly: true },
      { href: '/admin/allergien',            icon: Heart,         label: 'Allergien',                adminOnly: true },
      { href: '/admin/eingewoehnungsplan', icon: Baby,          label: 'Eingewöhnungsplan',         adminOnly: true },
      { href: '/admin/mahlzeiten',          icon: Utensils,      label: 'Mahlzeiten & Speiseplan',   adminOnly: true },
      { href: '/admin/personal',             icon: Users,         label: 'Personal',                  adminOnly: true },
      { href: '/admin/notfallkontakte',     icon: Phone,         label: 'Notfallkontakte',            adminOnly: true },
      { href: '/admin/elternabende',        icon: Users,         label: 'Elternabende',               adminOnly: true },
      { href: '/admin/sprachentwicklung',   icon: MessageCircle, label: 'Sprachentwicklung',          adminOnly: true },
      { href: '/admin/motorik',             icon: Star,          label: 'Motorikentwicklung',          adminOnly: true },
      { href: '/admin/kreativprojekte',     icon: Sparkles,      label: 'Kreativprojekte',             adminOnly: true },
      { href: '/admin/bewegungsangebot',    icon: Star,          label: 'Bewegungsangebote',           adminOnly: true },
      { href: '/admin/beobachtungsnotizen', icon: BookOpen,      label: 'Beobachtungsnotizen',         adminOnly: true },
      { href: '/admin/einschulung',         icon: GraduationCap, label: 'Einschulungsplanung',          adminOnly: true },
      { href: '/admin/elternbeirat',        icon: Users,         label: 'Elternbeirat',                adminOnly: true },
      { href: '/admin/notfallprotokoll',   icon: AlertTriangle, label: 'Notfallprotokoll',            adminOnly: true },
      { href: '/admin/schluessel',         icon: Star,          label: 'Schlüsselverwaltung',          adminOnly: true },
      { href: '/admin/tagesstruktur',     icon: Clock,         label: 'Tagesstruktur',                adminOnly: true },
      { href: '/admin/feste-feiern',      icon: Star,          label: 'Feste & Feiern',               adminOnly: true },
      { href: '/admin/raumnutzung',       icon: Users,         label: 'Raumnutzung',                  adminOnly: true },
      { href: '/admin/impfstatus',        icon: CheckCircle2,  label: 'Impfstatus',                   adminOnly: true },
      { href: '/admin/dienstplanung',     icon: Users,         label: 'Dienstplanung',                adminOnly: true },
      { href: '/admin/schutzkonzept',    icon: Shield,        label: 'Schutzkonzept §8a',             adminOnly: true },
      { href: '/admin/lernwerkstatt',    icon: Sparkles,      label: 'Lernwerkstatt',                 adminOnly: true },
      { href: '/admin/kooperationspartner', icon: Globe,      label: 'Kooperationspartner',           adminOnly: true },
      { href: '/admin/uebergangsprotokoll', icon: GraduationCap, label: 'Übergangsprotokoll',          adminOnly: true },
      { href: '/admin/elternmitwirkung', icon: Users,         label: 'Elternmitwirkung',              adminOnly: true },
      { href: '/admin/konzepte',         icon: FileText,      label: 'Päd. Konzepte',                 adminOnly: true },
      { href: '/admin/sommerfest',       icon: Star,          label: 'Sommerfest Planung',             adminOnly: true },
      { href: '/admin/tagesreflexion',  icon: SunMedium,     label: 'Tagesreflexion',                  adminOnly: true },
      { href: '/admin/wochenplan',      icon: CalendarDays,  label: 'Wochenplan',                       adminOnly: true },
      { href: '/admin/portfolio-uebersicht', icon: BookOpen, label: 'Portfolio-Übersicht',               adminOnly: true },
      { href: '/admin/aufnahme',            icon: ClipboardList, label: 'Aufnahme & Anmeldungen',          adminOnly: true },
      { href: '/admin/medienplanung',       icon: Tv2,           label: 'Medienplanung',                    adminOnly: true },
      { href: '/admin/projektdokumentation', icon: FolderOpen,  label: 'Projektdokumentation',              adminOnly: true },
      { href: '/admin/sicherheit',           icon: ShieldCheck,    label: 'Sicherheit & Arbeitsschutz',         adminOnly: true },
      { href: '/admin/teambesprechung',      icon: MessageCircle,  label: 'Teambesprechungen',                  adminOnly: true },
      { href: '/admin/dienstplan',           icon: CalendarCheck,  label: 'Dienstplan',                         adminOnly: true },
      { href: '/admin/qualitaetsmanagement', icon: Award,          label: 'Qualitätsmanagement',                adminOnly: true },
      { href: '/admin/kooperationen',        icon: Handshake,      label: 'Kooperationen',                      adminOnly: true },
      { href: '/admin/beschwerdemanagement', icon: Flag,           label: 'Beschwerdemanagement',                 adminOnly: true },
      { href: '/admin/fachberatung',         icon: Lightbulb,      label: 'Fachberatung',                         adminOnly: true },
      { href: '/admin/inklusionskonzept',    icon: Rainbow,        label: 'Inklusionskonzept',                    adminOnly: true },
      { href: '/admin/elternzusammenarbeit', icon: HeartHandshake, label: 'Elternzusammenarbeit',                 adminOnly: true },
      { href: '/admin/speiseplan',           icon: Utensils,       label: 'Speiseplan',                           adminOnly: true },
      { href: '/admin/hygienekonzept',       icon: Droplets,       label: 'Hygienekonzept',                       adminOnly: true },
      { href: '/admin/belegungsplanung',     icon: LayoutDashboard,label: 'Belegungsplanung',                     adminOnly: true },
      { href: '/admin/personalakte',         icon: FolderOpen,     label: 'Personalakten',                        adminOnly: true },
      { href: '/admin/kinderschutz',         icon: ShieldAlert,    label: 'Kinderschutz §8a',                     adminOnly: true },
      { href: '/admin/vernetzung',           icon: Network,        label: 'Vernetzung',                           adminOnly: true },
      { href: '/admin/schlafenszeiten',      icon: Moon,           label: 'Schlafenszeiten',                      adminOnly: true },
      { href: '/admin/eingewoehnungsbericht',icon: Sprout,         label: 'Eingewöhnungsberichte',                adminOnly: true },
      { href: '/admin/foerderprogramme',     icon: Star,           label: 'Förderprogramme',                      adminOnly: true },
      { href: '/admin/transitionportfolio', icon: ArrowRightLeft, label: 'Transitionsportfolio',                  adminOnly: true },
      { href: '/admin/gesundheitsfoerderung',icon: Activity,      label: 'Gesundheitsförderung',                 adminOnly: true },
      { href: '/admin/raumgestaltung',      icon: Layers,         label: 'Raumgestaltung',                       adminOnly: true },
      { href: '/admin/qualitaetssicherung',icon: BadgeCheck,     label: 'Qualitätssicherung',                   adminOnly: true },
      { href: '/admin/bildungsplan',        icon: BookOpen,       label: 'Bildungsplan',                         adminOnly: true },
      { href: '/admin/nachhaltigkeit',      icon: Leaf,           label: 'Nachhaltigkeit',                       adminOnly: true },
      { href: '/admin/elternabend',         icon: Users,          label: 'Elternabende',                         adminOnly: true },
      { href: '/admin/materialverwaltung',  icon: FolderOpen,     label: 'Materialverwaltung',                   adminOnly: true },
      { href: '/admin/portfolioarbeit',     icon: BookOpen,       label: 'Portfolioarbeit',                      adminOnly: true },
      { href: '/admin/kooperation',         icon: Handshake,      label: 'Kooperationen',                        adminOnly: true },
      { href: '/admin/raumkonzept',         icon: LayoutGrid,     label: 'Raumkonzept',                          adminOnly: true },
      { href: '/admin/sicherheitsprotokoll',icon: ShieldCheck,    label: 'Sicherheitsprotokoll',                 adminOnly: true },
      { href: '/admin/dokumentation',   icon: FileText,       label: 'Dokumentation',                        adminOnly: true },
      { href: '/admin/traegervertrag',  icon: ScrollText,     label: 'Trägervertrag',                        adminOnly: true },
      { href: '/admin/bueroorganisation',icon: Inbox,         label: 'Büroorganisation',                     adminOnly: true },
      { href: '/admin/konzeptentwicklung',icon: Lightbulb,   label: 'Konzeptentwicklung',                   adminOnly: true },
      { href: '/admin/personalgespraeche',icon: UserCog,     label: 'Personalgespräche',                    adminOnly: true },
      { href: '/admin/essensversorgung', icon: Utensils,     label: 'Essensversorgung',                     adminOnly: true },
      { href: '/admin/fachberatung2',   icon: Stethoscope,  label: 'Fachdienste',                          adminOnly: true },
      { href: '/admin/elternengagement',icon: Heart,        label: 'Elternengagement',                     adminOnly: true },
      { href: '/admin/teamsitzung',     icon: Users,        label: 'Teamsitzungen',                        adminOnly: true },
      { href: '/admin/brandschutz',     icon: ShieldAlert,  label: 'Brandschutz',                          adminOnly: true },
      { href: '/admin/veranstaltungen', icon: Gift,         label: 'Veranstaltungen',                      adminOnly: true },
      { href: '/admin/aufsichtspflicht',icon: Eye,          label: 'Aufsichtspflicht',                     adminOnly: true },
      { href: '/admin/einarbeitung',    icon: UserPlus,     label: 'Einarbeitung',                         adminOnly: true },
      { href: '/admin/jahresbericht',   icon: FileText,     label: 'Jahresbericht',                        adminOnly: true },
      { href: '/admin/gesundheitsschutz',icon: ShieldCheck,  label: 'Gesundheitsschutz',                   adminOnly: true },
      { href: '/admin/ernaehrung',       icon: Utensils,    label: 'Ernährung',                            adminOnly: true },
      { href: '/admin/sprachfoerderung', icon: Languages,   label: 'Sprachförderung',                      adminOnly: true },
      { href: '/admin/personalentwicklung',icon: TrendingUp, label: 'Personalentwicklung',                 adminOnly: true },
      { href: '/admin/zusammenarbeit',    icon: Handshake,  label: 'Zusammenarbeit',                       adminOnly: true },
      { href: '/admin/beobachtung',       icon: ScanEye,    label: 'Beobachtung',                          adminOnly: true },
      { href: '/admin/beschaffung',       icon: ShoppingCart, label: 'Beschaffung',                        adminOnly: true },
      { href: '/admin/notaufnahme',       icon: BellRing,     label: 'Notaufnahme',                          adminOnly: true },
      { href: '/admin/sicherheitsplanung',icon: ShieldAlert,  label: 'Sicherheitsplanung',                   adminOnly: true },
      { href: '/admin/konzeption',        icon: BookHeart,    label: 'Konzeption',                           adminOnly: true },
      { href: '/admin/aufnahmeverfahren', icon: ClipboardList,label: 'Aufnahmeverfahren',                     adminOnly: true },
      { href: '/admin/ferienbetreuung',   icon: Umbrella,     label: 'Ferienbetreuung',                      adminOnly: true },
      { href: '/admin/tagesplanung',      icon: Clock3,       label: 'Tagesplanung',                         adminOnly: true },
      { href: '/admin/praevention',       icon: ShieldCheck,  label: 'Prävention',                           adminOnly: true },
      { href: '/admin/ausflugplanung',    icon: MapPinned,    label: 'Ausflugplanung',                       adminOnly: true },
      { href: '/admin/inklusionsplan',    icon: HeartHandshake,label: 'Inklusionsplan',                      adminOnly: true },
      { href: '/admin/traegerrechnung',  icon: Receipt,       label: 'Trägerabrechnung',                    adminOnly: true },
      { href: '/admin/finanzplanung',    icon: Wallet,        label: 'Finanzplanung',                       adminOnly: true },
      { href: '/admin/elternbeirat-kita',icon: Users,         label: 'Elternbeirat',                        adminOnly: true },
      { href: '/admin/bildungsdokumentation', icon: BookOpen, label: 'Bildungsdoku',   adminOnly: true },
      { href: '/admin/traeger',      icon: Building2,      label: 'Träger-Dashboard', adminOnly: true },
      { href: '/admin/microsoft365', icon: Cloud,          label: 'Microsoft 365',    adminOnly: true },
      { href: '/dsgvo',               icon: FileText,       label: 'DSGVO AVV',        adminOnly: true },
      { href: '/inklusion',           icon: Heart,          label: 'Inklusion (BTHG)',  staffOnly: true },
      { href: '/bildungsplaene',      icon: Globe,          label: 'Bildungspläne 16 BL', staffOnly: true },
      { href: '/gebuehren',          icon: Utensils,       label: 'Gebühren',         adminOnly: true },
      { href: '/gesundheit',         icon: Heart,          label: 'Gesundheit',       staffOnly: true },
      { href: '/ki-assistent',       icon: Sparkles,       label: 'KI-Assistent' },
    ],
  },
  {
    title: 'Persönlich',
    items: [
      { href: '/benachrichtigungen', icon: Bell,     label: 'Benachrichtigungen' },
      { href: '/profil',       icon: User,           label: 'Profil' },
      { href: '/einstellungen',icon: Settings,       label: 'Einstellungen' },
    ],
  },
]

const PINNED_KEY = 'kita-sidebar-pinned'
const RECENT_KEY = 'kita-sidebar-recent'
const COLLAPSED_KEY = 'kita-sidebar-collapsed'

function getPinned(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) ?? '[]') } catch { return [] }
}
function getRecent(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}
function addRecent(href: string) {
  const r = getRecent().filter(x => x !== href).slice(0, 4)
  localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...r]))
}

interface Props {
  isAdmin?: boolean
  isStaff?: boolean
  userName?: string
  userRole?: string
  unreadMessages?: number
  unreadNotifications?: number
}

export default function SidebarNav({
  isAdmin = false,
  isStaff = false,
  userName = '',
  userRole = '',
  unreadMessages = 0,
  unreadNotifications = 0,
}: Props) {
  const pathname = usePathname()
  const [pinned, setPinned] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setPinned(getPinned())
    setRecent(getRecent())
    const c = localStorage.getItem(COLLAPSED_KEY)
    if (c === 'true') setCollapsed(true)
  }, [])

  // Track recent pages
  useEffect(() => {
    addRecent(pathname)
    setRecent(getRecent())
  }, [pathname])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, String(next))
  }

  const togglePin = useCallback((href: string) => {
    setPinned(prev => {
      const next = prev.includes(href)
        ? prev.filter(x => x !== href)
        : [...prev, href]
      localStorage.setItem(PINNED_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // All nav items flat
  const allItems = NAV_SECTIONS.flatMap(s => s.items)

  // Filter by role
  const visibleItems = (items: NavItem[]) =>
    items.filter(i => {
      if (i.adminOnly && !isAdmin) return false
      if (i.staffOnly && !isStaff) return false
      return true
    })

  const getBadge = (href: string) => {
    if (href === '/nachrichten') return unreadMessages
    if (href === '/benachrichtigungen') return unreadNotifications
    return 0
  }

  const pinnedItems = allItems.filter(i => pinned.includes(i.href))
  const recentItems = allItems
    .filter(i => recent.includes(i.href) && !pinned.includes(i.href) && i.href !== pathname)
    .slice(0, 5)

  const initials = userName.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || 'KH'
  const roleLabel = isAdmin ? 'Admin' : isStaff ? 'Erzieher' : 'Elternteil'

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-full
        border-r transition-all duration-200 overflow-hidden
        ${collapsed ? 'w-14' : 'w-60'}
      `}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        minWidth: collapsed ? '3.5rem' : '15rem',
      }}
    >
      {/* ─── Logo + collapse ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {!collapsed && (
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-800 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 40 40" className="w-4 h-4 text-white" fill="none">
                <circle cx="20" cy="13" r="5" fill="currentColor"/>
                <circle cx="10" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                <circle cx="30" cy="24" r="4" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>KitaHub</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-brand-800 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 40 40" className="w-4 h-4 text-white" fill="none">
              <circle cx="20" cy="13" r="5" fill="currentColor"/>
              <circle cx="10" cy="24" r="4" fill="currentColor" opacity="0.7"/>
              <circle cx="30" cy="24" r="4" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Sidebar einklappen"
          >
            <ChevronLeft size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      {/* ─── Scrollable nav area ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-none">

        {/* Pinned items */}
        {pinnedItems.length > 0 && (
          <div className="mb-1">
            {!collapsed && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Angeheftet
              </p>
            )}
            {pinnedItems.map(item => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(item.href + '/')}
                badge={getBadge(item.href)}
                collapsed={collapsed}
                pinned
                onTogglePin={() => togglePin(item.href)}
              />
            ))}
          </div>
        )}

        {/* Recently visited */}
        {recentItems.length > 0 && !collapsed && (
          <div className="mb-1">
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <Clock size={10} />Zuletzt besucht
            </p>
            {recentItems.map(item => (
              <NavLink
                key={item.href}
                item={item}
                active={false}
                badge={getBadge(item.href)}
                collapsed={collapsed}
                onTogglePin={() => togglePin(item.href)}
              />
            ))}
          </div>
        )}

        {/* Main sections */}
        {NAV_SECTIONS.map(section => {
          const items = visibleItems(section.items)
          if (!items.length) return null
          return (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {section.title}
                </p>
              )}
              {items.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href || (item.href !== '/feed' && pathname.startsWith(item.href + '/'))}
                  badge={getBadge(item.href)}
                  collapsed={collapsed}
                  pinnable
                  pinned={pinned.includes(item.href)}
                  onTogglePin={() => togglePin(item.href)}
                />
              ))}
            </div>
          )
        })}
      </nav>

      {/* ─── KJM Notruf-Hinweis ──────────────────────────────────────────
          KJM §5 JMStV Pflicht: Hilfsangebote für Kinder sichtbar in App.
          Compact version when collapsed, full when expanded.
      ─────────────────────────────────────────────────────────────────── */}
      {!collapsed && (
        <div
          className="mx-2 mb-2 rounded-xl px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: 'var(--color-surface-raised, #f8fafc)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            🆘 Hilfe für Kinder
          </p>
          <a
            href="tel:116111"
            className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            📞 116 111 — Nummer gegen Kummer
          </a>
          <a
            href="tel:08002255530"
            className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-700 transition-colors mt-0.5"
          >
            📞 0800 22 55 530 — Hilfetelefon Missbrauch
          </a>
          <p className="text-[9px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            kostenlos · anonym · 24/7
          </p>
        </div>
      )}

      {/* ─── User block ───────────────────────────────────────────────── */}
      <div className="border-t p-3 flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        {collapsed ? (
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center mx-auto text-white text-xs font-bold"
            title={userName}
          >
            {initials}
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{userName || 'Nutzer'}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{roleLabel}</p>
            </div>
            <Link href="/profil" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title="Profil">
              <Settings size={13} style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

// ── NavLink ──────────────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem
  active: boolean
  badge?: number
  collapsed: boolean
  pinnable?: boolean
  pinned?: boolean
  onTogglePin: () => void
}

function NavLink({ item, active, badge = 0, collapsed, pinnable, pinned, onTogglePin }: NavLinkProps) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={item.href}
        className={`
          flex items-center gap-2.5 rounded-lg mx-1.5 px-2 py-2 text-sm font-medium
          transition-colors duration-100
          ${active
            ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
            : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
        style={!active ? { color: 'var(--color-text-secondary)' } : {}}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={16} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {badge > 0 && (
              <span className="ml-auto bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </>
        )}
        {collapsed && badge > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </Link>
      {/* Pin button on hover (not collapsed) */}
      {pinnable && !collapsed && hovered && (
        <button
          onClick={(e) => { e.preventDefault(); onTogglePin() }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600"
          title={pinned ? 'Lösen' : 'Anheften'}
        >
          <Pin size={11} className={pinned ? 'text-brand-600' : 'text-gray-400'} />
        </button>
      )}
    </div>
  )
}
