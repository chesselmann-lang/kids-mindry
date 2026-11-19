'use client'

import { usePathname } from 'next/navigation'
import DashboardPanel from '@/components/context-panels/dashboard-panel'
import KindPanel from '@/components/context-panels/kind-panel'
import ElternPanel from '@/components/context-panels/eltern-panel'
import LerninhaltePanel from '@/components/context-panels/lerninhalte-panel'
import BelohnungenPanel from '@/components/context-panels/belohnungen-panel'
import CommunityPanel from '@/components/context-panels/community-panel'

interface PanelConfig {
  title: string
  content: React.ReactNode
}

function getPanelConfig(pathname: string): PanelConfig | null {
  // Dashboard / Zuhause — /feed is the main landing page
  if (
    pathname === '/feed' ||
    pathname === '/dashboard' ||
    pathname === '/heute' ||
    pathname === '/streak' ||
    pathname === '/anwesenheit' ||
    pathname === '/favoriten' ||
    pathname === '/benachrichtigungen' ||
    pathname === '/aufgaben'
  ) {
    return { title: 'Heute', content: <DashboardPanel /> }
  }

  // Kind-Profil
  if (pathname.startsWith('/kind/')) {
    const kindId = pathname.split('/')[2] ?? ''
    return { title: 'Kind-Info', content: <KindPanel kindId={kindId} /> }
  }

  // Eltern-Bereich
  if (pathname.startsWith('/eltern')) {
    return { title: 'Eltern', content: <ElternPanel /> }
  }

  // Lerninhalte & Lernen
  if (
    pathname.startsWith('/lerninhalte') ||
    pathname.startsWith('/lernen') ||
    pathname.startsWith('/kind')
  ) {
    return { title: 'Inhalte', content: <LerninhaltePanel /> }
  }

  // Belohnungen
  if (pathname.startsWith('/belohnungen')) {
    return { title: 'Belohnungen', content: <BelohnungenPanel /> }
  }

  // Community / Entdecken
  if (pathname.startsWith('/community') || pathname.startsWith('/entdecken')) {
    return { title: 'Community', content: <CommunityPanel /> }
  }

  return null
}

interface Props {
  onTitleChange?: (title: string | undefined) => void
}

/**
 * Selects the correct context-panel content based on the current route.
 * Returns null (empty panel) when no panel is defined for the route.
 */
export default function ContextPanelRouter({ onTitleChange }: Props) {
  const pathname = usePathname()
  const config = getPanelConfig(pathname)

  return config?.content ?? null
}

/** Exported separately so the shell can use the title. */
export function useContextPanelTitle(): string | undefined {
  const pathname = usePathname()
  return getPanelConfig(pathname)?.title
}
