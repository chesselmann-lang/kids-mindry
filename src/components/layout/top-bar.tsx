'use client'

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile, Site } from '@/types/database'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette'

interface TopBarProps {
  user: User
  profile: Profile | null
  site: Site | null
  isStaff?: boolean
  isAdmin?: boolean
  unreadNotifications?: number
}

export default function TopBar({
  user, profile, site, isStaff, isAdmin, unreadNotifications = 0
}: TopBarProps) {
  const initials = (profile?.full_name ?? user.email ?? '?')
    .split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)

  const { open, close } = useCommandPalette()

  return (
    <>
      <CommandPalette open={open} onClose={close} isStaff={isStaff} isAdmin={isAdmin} />

      <header className="sticky top-0 z-30 border-b safe-top" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand-800 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-5 h-5 text-white" fill="none">
                <circle cx="20" cy="13" r="5" fill="currentColor"/>
                <circle cx="10" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                <circle cx="30" cy="24" r="4" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{site?.name ?? 'KitaHub'}</p>
              <p className="text-xs text-gray-400 leading-none">{isStaff ? 'Erzieher-Ansicht' : 'kids.mindry.de'}</p>
            </div>
          </Link>

          {/* Search pill — center on larger screens */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm text-gray-400 hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
            aria-label="Suche öffnen (⌘K)"
          >
            <Search size={14} />
            <span className="text-xs">Suchen…</span>
            <kbd className="ml-1 text-[10px] font-mono bg-white border border-gray-200 rounded px-1 text-gray-400">⌘K</kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            {/* Mobile search */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
              className="sm:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Suche"
            >
              <Search size={20} />
            </button>

            <Link
              href="/benachrichtigungen"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>

            <Link
              href="/profil"
              className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800 text-sm font-bold hover:bg-brand-200 transition-colors"
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
