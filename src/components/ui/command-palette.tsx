'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Home, CalendarDays, MessageCircle, User, Baby,
  ClipboardList, Shield, Utensils, Bell, BookOpen, Users,
  FileText, BarChart3, ChevronRight, Clock, LogOut,
  Heart, Euro, QrCode, Star, SunMedium, Settings,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  group: string
  href?: string
  action?: () => void
  keywords?: string[]
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close  = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  return { open, setOpen, close }
}

// ── Recent ────────────────────────────────────────────────────────────────────

const RECENT_KEY = 'kita-cmd-recent'
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}
function addRecent(id: string) {
  const r = getRecent().filter((x) => x !== id).slice(0, 4)
  localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...r]))
}

// ── Commands ──────────────────────────────────────────────────────────────────

const PARENT_COMMANDS: CommandItem[] = [
  { id: 'feed',        label: 'Neuigkeiten',       icon: Home,          group: 'Navigation', href: '/feed' },
  { id: 'kalender',    label: 'Termine',            icon: CalendarDays,  group: 'Navigation', href: '/kalender' },
  { id: 'nachrichten', label: 'Nachrichten',        icon: MessageCircle, group: 'Navigation', href: '/nachrichten', keywords: ['chat', 'schreiben'] },
  { id: 'speiseplan',  label: 'Speiseplan',         icon: Utensils,      group: 'Navigation', href: '/speiseplan' },
  { id: 'profil',      label: 'Mein Profil',        icon: User,          group: 'Navigation', href: '/profil' },
  { id: 'mein-kind',   label: 'Mein Kind',          icon: Baby,          group: 'Navigation', href: '/mein-kind' },
  { id: 'notizen',     label: 'Notizen',            icon: BookOpen,      group: 'Navigation', href: '/notizen' },
  { id: 'benachrichtigungen', label: 'Benachrichtigungen', icon: Bell, group: 'Navigation', href: '/benachrichtigungen' },
]

const STAFF_COMMANDS: CommandItem[] = [
  { id: 'heute',        label: 'Heute',              icon: SunMedium,     group: 'Navigation', href: '/heute' },
  { id: 'kinder',       label: 'Kinder',             icon: Baby,          group: 'Navigation', href: '/kinder', keywords: ['anwesenheit', 'checkin'] },
  { id: 'nachrichten',  label: 'Nachrichten',        icon: MessageCircle, group: 'Navigation', href: '/nachrichten' },
  { id: 'tagesberichte',label: 'Tagesberichte',      icon: ClipboardList, group: 'Navigation', href: '/tagesberichte' },
  { id: 'tb-neu',       label: 'Neuer Tagesbericht', icon: ClipboardList, group: 'Aktionen',   href: '/tagesberichte/neu', keywords: ['erstellen', 'schreiben', 'bericht'] },
  { id: 'kalender',     label: 'Termine',            icon: CalendarDays,  group: 'Navigation', href: '/kalender' },
  { id: 'speiseplan',   label: 'Speiseplan',         icon: Utensils,      group: 'Navigation', href: '/speiseplan' },
  { id: 'benachrichtigungen', label: 'Benachrichtigungen', icon: Bell,    group: 'Navigation', href: '/benachrichtigungen' },
  { id: 'profil',       label: 'Mein Profil',        icon: User,          group: 'Navigation', href: '/profil' },
]

const ADMIN_COMMANDS: CommandItem[] = [
  { id: 'admin',          label: 'Admin-Übersicht',   icon: Shield,   group: 'Admin', href: '/admin' },
  { id: 'admin-kinder',   label: 'Kinder verwalten',  icon: Baby,     group: 'Admin', href: '/admin/kinder', keywords: ['kind', 'hinzufügen'] },
  { id: 'admin-gruppen',  label: 'Gruppen',           icon: Users,    group: 'Admin', href: '/admin/gruppen' },
  { id: 'admin-nutzer',   label: 'Nutzer & Einladungen', icon: Users, group: 'Admin', href: '/admin/nutzer', keywords: ['einladen', 'eltern'] },
  { id: 'admin-statistik',label: 'Statistik',         icon: BarChart3, group: 'Admin', href: '/admin/statistik' },
  { id: 'admin-gebuehren',label: 'Gebühren',          icon: Euro,      group: 'Admin', href: '/admin/gebuehren' },
  { id: 'admin-gesundheit',label: 'Gesundheit',       icon: Heart,     group: 'Admin', href: '/admin/gesundheit', keywords: ['allergie', 'impfung'] },
  { id: 'admin-qrcodes',  label: 'QR-Codes',          icon: QrCode,    group: 'Admin', href: '/admin/qrcodes' },
  { id: 'admin-einstellungen', label: 'Einstellungen', icon: Settings, group: 'Admin', href: '/admin/einstellungen' },
  { id: 'admin-warteliste', label: 'Warteliste',      icon: ClipboardList, group: 'Admin', href: '/admin/warteliste' },
  { id: 'admin-foerderplaene', label: 'Förderpläne',  icon: Star,      group: 'Admin', href: '/admin/foerderplaene' },
  { id: 'admin-dokumente', label: 'Dokumente',        icon: FileText,  group: 'Admin', href: '/admin/dokumente' },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  isStaff?: boolean
  isAdmin?: boolean
}

export function CommandPalette({ open, onClose, isStaff = false, isAdmin = false }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery(''); setActiveIdx(0); setRecent(getRecent())
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  const ALL: CommandItem[] = [
    ...(isAdmin ? [...STAFF_COMMANDS, ...ADMIN_COMMANDS] : isStaff ? STAFF_COMMANDS : PARENT_COMMANDS),
  ].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)

  const go = useCallback((item: CommandItem) => {
    addRecent(item.id); setRecent(getRecent())
    if (item.href) router.push(item.href)
    else item.action?.()
    onClose()
  }, [router, onClose])

  const filtered = query.trim()
    ? ALL.filter((c) => {
        const q = query.toLowerCase()
        return c.label.toLowerCase().includes(q) ||
               c.description?.toLowerCase().includes(q) ||
               c.keywords?.some((k) => k.includes(q)) ||
               c.group.toLowerCase().includes(q)
      })
    : ALL.filter((c) => recent.includes(c.id) || c.group === 'Navigation').slice(0, 9)

  const groups: Record<string, CommandItem[]> = {}
  for (const item of filtered) {
    if (!groups[item.group]) groups[item.group] = []
    groups[item.group].push(item)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIdx]) go(filtered[activeIdx]) }
    else if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  useEffect(() => { setActiveIdx(0) }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Seite suchen oder Aktion ausführen…"
            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">✕</button>
          )}
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-96 overflow-y-auto py-2 scrollbar-none">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">Nichts gefunden für „{query}"</div>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group}</p>
              {items.map((item) => {
                const idx = filtered.indexOf(item)
                const isActive = idx === activeIdx
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? '' : 'hover:bg-gray-50'}`}
                    style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, transparent)' } : {}}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                      {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {recent.includes(item.id) && !query && <Clock size={11} className="text-gray-300" />}
                      {isActive && <ChevronRight size={14} className="text-gray-300" />}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t text-[11px] text-gray-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
          <span>↑↓ navigieren · Enter öffnen · Esc schließen</span>
          <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-400">⌘K</kbd>
        </div>
      </div>
    </div>
  )
}
