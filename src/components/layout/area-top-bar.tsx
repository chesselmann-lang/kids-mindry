'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, BookOpen, Compass, Gift, Users, Settings,
  Bell, Search, Moon, Sun, ChevronDown
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette'

export type AppArea = 'zuhause' | 'lernen' | 'entdecken' | 'belohnungen' | 'eltern' | 'einstellungen'

export interface AreaConfig {
  id: AppArea
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  href: string
  /** Eltern-PIN erforderlich */
  protected?: boolean
}

export const AREAS: AreaConfig[] = [
  { id: 'zuhause',      label: 'Zuhause',       icon: Home,     href: '/feed' },
  { id: 'lernen',       label: 'Lernen',         icon: BookOpen, href: '/lernen' },
  { id: 'entdecken',    label: 'Entdecken',      icon: Compass,  href: '/entdecken' },
  { id: 'belohnungen',  label: 'Belohnungen',    icon: Gift,     href: '/belohnungen' },
  { id: 'eltern',       label: 'Eltern-Bereich', icon: Users,    href: '/eltern', protected: true },
  { id: 'einstellungen',label: 'Einstellungen',  icon: Settings, href: '/einstellungen' },
]

function getActiveArea(pathname: string): AppArea {
  if (pathname.startsWith('/lernen') || pathname.startsWith('/lerninhalte') || pathname.startsWith('/kind')) return 'lernen'
  if (pathname.startsWith('/entdecken')) return 'entdecken'
  if (pathname.startsWith('/belohnungen')) return 'belohnungen'
  if (pathname.startsWith('/eltern')) return 'eltern'
  if (pathname.startsWith('/einstellungen') || pathname.startsWith('/profil')) return 'einstellungen'
  return 'zuhause'
}

interface Props {
  isAdmin?: boolean
  isStaff?: boolean
  userName?: string
  unreadNotifications?: number
  unreadMessages?: number
}

export default function AreaTopBar({
  isAdmin = false,
  isStaff = false,
  userName = '',
  unreadNotifications = 0,
  unreadMessages = 0,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const activeArea = getActiveArea(pathname)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { open, close } = useCommandPalette()
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinChecking, setPinChecking] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  function handleAreaClick(area: AreaConfig) {
    if (area.protected && activeArea !== 'eltern') {
      setPinModalOpen(true)
      return
    }
    router.push(area.href)
  }

  async function verifyPinRemote(candidate: string): Promise<boolean> {
    try {
      const res = await fetch('/api/eltern-pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: candidate }),
      })
      if (!res.ok) return false
      const data = await res.json()
      return data.valid === true
    } catch {
      return false
    }
  }

  async function submitPin() {
    if (pinChecking) return
    setPinChecking(true)
    const valid = await verifyPinRemote(pin)
    setPinChecking(false)
    if (valid) {
      setPinModalOpen(false)
      setPin('')
      setPinError(false)
      router.push('/eltern')
    } else {
      setPinError(true)
      setPin('')
    }
  }

  const initials = userName.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || 'KH'
  const totalBadge = unreadNotifications + unreadMessages

  return (
    <>
      <CommandPalette open={open} onClose={close} isStaff={isStaff} isAdmin={isAdmin} />

      <header
        className="sticky top-0 z-30 border-b safe-top flex-shrink-0"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          height: '56px',
        }}
      >
        <div className="h-full flex items-center px-4 gap-3 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <div className="w-7 h-7 rounded-lg bg-brand-800 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-4 h-4 text-white" fill="none">
                <circle cx="20" cy="13" r="5" fill="currentColor"/>
                <circle cx="10" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                <circle cx="30" cy="24" r="4" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            <span className="text-sm font-bold hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
              mindry <span className="text-brand-600 font-extrabold">kids</span>
            </span>
          </Link>

          {/* Area navigation — Desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {AREAS.map(area => {
              const Icon = area.icon
              const active = activeArea === area.id
              return (
                <button
                  key={area.id}
                  onClick={() => handleAreaClick(area)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold
                    transition-colors duration-100 min-h-[40px]
                    ${active
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    }
                  `}
                  style={!active ? { color: 'var(--color-text-secondary)' } : {}}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  <span>{area.label}</span>
                  {area.protected && (
                    <span className="text-[10px] opacity-60">🔒</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Mobile: active area dropdown */}
          <div className="lg:hidden flex-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {AREAS.find(a => a.id === activeArea)?.label ?? 'Zuhause'}
            </span>
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Search / Cmd+K */}
            <button
              onClick={() => open && close()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hidden md:flex min-h-[36px]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              title="Suche (⌘K)"
            >
              <Search size={13} />
              <span>Suche</span>
              <kbd className="ml-1 text-[10px] px-1 border rounded" style={{ borderColor: 'var(--color-border)' }}>⌘K</kbd>
            </button>
            <button
              className="p-2 rounded-lg md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Suche"
            >
              <Search size={18} style={{ color: 'var(--color-text-secondary)' }} />
            </button>

            {/* Notifications */}
            <Link
              href="/benachrichtigungen"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />
              {totalBadge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {totalBadge > 9 ? '9+' : totalBadge}
                </span>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Erscheinungsbild wechseln"
            >
              {theme === 'light'
                ? <Moon size={16} style={{ color: 'var(--color-text-secondary)' }} />
                : <Sun size={16} style={{ color: 'var(--color-text-secondary)' }} />
              }
            </button>

            {/* User avatar */}
            <Link
              href="/profil"
              className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 min-w-[32px]"
              title={userName}
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── PIN-Modal für Eltern-Bereich ──────────────────────────────────── */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => { setPinModalOpen(false); setPin('') }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-3">
                <Users size={28} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Eltern-Bereich</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Bitte Eltern-PIN eingeben</p>
            </div>

            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-4">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    pinChecking
                      ? 'bg-brand-400 animate-pulse'
                      : pin.length > i
                        ? pinError ? 'bg-red-500' : 'bg-brand-600'
                        : 'border-2 border-gray-300 dark:border-slate-600'
                  }`}
                />
              ))}
            </div>
            {pinError && <p className="text-center text-xs text-red-500 mb-3">Falscher PIN</p>}
            {pinChecking && <p className="text-center text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Prüfe…</p>}

            {/* Number pad — large touch targets for adults in a hurry */}
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                <button
                  key={i}
                  disabled={k === '' || pinChecking}
                  onClick={() => {
                    if (k === '⌫') setPin(p => p.slice(0, -1))
                    else if (typeof k === 'number' && pin.length < 4) {
                      const next = pin + k
                      setPin(next)
                      setPinError(false)
                      if (next.length === 4) {
                        // Auto-verify after short delay so 4th dot renders
                        setTimeout(async () => {
                          setPinChecking(true)
                          const valid = await verifyPinRemote(next)
                          setPinChecking(false)
                          if (valid) {
                            setPinModalOpen(false); setPin(''); setPinError(false)
                            router.push('/eltern')
                          } else {
                            setPinError(true); setPin('')
                          }
                        }, 150)
                      }
                    }
                  }}
                  className={`
                    h-14 rounded-2xl text-xl font-semibold transition-colors
                    ${k === '' ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95'}
                  `}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
