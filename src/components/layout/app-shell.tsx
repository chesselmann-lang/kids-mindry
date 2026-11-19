'use client'

import { usePathname } from 'next/navigation'
import AreaTopBar, { AREAS } from '@/components/layout/area-top-bar'
import AreaSidebar from '@/components/layout/area-sidebar'
import ContextPanelShell from '@/components/layout/context-panel-shell'
import ContextPanelRouter, { useContextPanelTitle } from '@/components/layout/context-panel-router'
import BottomNav from '@/components/layout/bottom-nav'
import InstallBanner from '@/components/pwa/install-banner'
import { OfflineBanner } from '@/components/ui/offline-banner'
import type { AppArea } from '@/components/layout/area-top-bar'

function getActiveArea(pathname: string): AppArea {
  if (pathname.startsWith('/lernen') || pathname.startsWith('/lerninhalte') || pathname.startsWith('/kind')) return 'lernen'
  if (pathname.startsWith('/entdecken') || pathname.startsWith('/community')) return 'entdecken'
  if (pathname.startsWith('/belohnungen')) return 'belohnungen'
  if (pathname.startsWith('/eltern')) return 'eltern'
  if (pathname.startsWith('/einstellungen') || pathname.startsWith('/profil') || pathname.startsWith('/datenschutz') || pathname.startsWith('/einwilligungen')) return 'einstellungen'
  return 'zuhause'
}

interface Props {
  children: React.ReactNode
  isAdmin?: boolean
  isStaff?: boolean
  userName?: string
  unreadNotifications?: number
  unreadMessages?: number
}

/**
 * Three-column App Shell (Hesselmann Standards Phase R1):
 *   [AreaTopBar 56px]
 *   [AreaSidebar 240px | main flex-1 | ContextPanelShell 320px]
 *   [BottomNav — mobile only]
 *
 * Sidebar: hidden on mobile (<lg)
 * ContextPanel: hidden on mobile (<xl), accessible via Bottom-Sheet FAB
 */
export default function AppShell({
  children,
  isAdmin = false,
  isStaff = false,
  userName = '',
  unreadNotifications = 0,
  unreadMessages = 0,
}: Props) {
  const pathname = usePathname()
  const activeArea = getActiveArea(pathname)
  const panelTitle = useContextPanelTitle()

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ─── Top Navigation Bar (56px) ──────────────────────────────────────── */}
      <AreaTopBar
        isAdmin={isAdmin}
        isStaff={isStaff}
        userName={userName}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
      />

      {/* ─── Body: Sidebar + Main + Context Panel ───────────────────────────── */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 56px)' }}
      >
        {/* Left sidebar — 240px, desktop only */}
        <AreaSidebar
          activeArea={activeArea}
          isAdmin={isAdmin}
          isStaff={isStaff}
        />

        {/* Main content — scrollable, fills available space */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {/* Inner padding: top/bottom/sides. pb-24 on mobile for bottom nav clearance */}
          <div className="px-4 pt-5 pb-24 lg:pb-8 max-w-4xl mx-auto lg:mx-0 lg:max-w-none">
            {children}
          </div>
        </main>

        {/* Right context panel — 320px default, drag-resize 280–520px, xl+ only */}
        <ContextPanelShell title={panelTitle}>
          <ContextPanelRouter />
        </ContextPanelShell>
      </div>

      {/* ─── Mobile bottom navigation ───────────────────────────────────────── */}
      <BottomNav
        isStaff={isStaff}
        isAdmin={isAdmin}
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications}
      />

      {/* ─── Global UI overlays ─────────────────────────────────────────────── */}
      <InstallBanner />
      <OfflineBanner />
    </div>
  )
}
