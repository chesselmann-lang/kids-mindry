'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, PanelRight, ChevronDown } from 'lucide-react'

const WIDTH_KEY = 'kita-context-panel-width'
const DEFAULT_WIDTH = 320
const MIN_WIDTH = 280
const MAX_WIDTH = 520

function getSavedWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_WIDTH
  const saved = parseInt(localStorage.getItem(WIDTH_KEY) ?? '', 10)
  return saved >= MIN_WIDTH && saved <= MAX_WIDTH ? saved : DEFAULT_WIDTH
}

interface Props {
  children?: React.ReactNode
  title?: string
  /** Force closed (e.g. on narrow viewports via parent) */
  forceHidden?: boolean
}

/**
 * Right context panel — 280–520px drag-resize.
 * Width is persisted to localStorage.
 * On mobile: Bottom-Sheet.
 * On tablet (1024–1280px): hidden by default, toggle button in topbar.
 */
export default function ContextPanelShell({ children, title, forceHidden }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [dragging, setDragging] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(DEFAULT_WIDTH)

  useEffect(() => {
    setWidth(getSavedWidth())
  }, [])

  // ─── Drag-resize logic ────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStartX.current = e.clientX
    dragStartWidth.current = width
    setDragging(true)
  }, [width])

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: MouseEvent) => {
      const delta = dragStartX.current - e.clientX // drag left = wider
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, dragStartWidth.current + delta))
      setWidth(newWidth)
    }

    const onUp = () => {
      setDragging(false)
      setWidth(prev => {
        localStorage.setItem(WIDTH_KEY, String(prev))
        return prev
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  if (forceHidden) return null

  return (
    <>
      {/* ─── Desktop / Tablet context panel ──────────────────────────────── */}
      <aside
        ref={panelRef}
        className="hidden xl:flex flex-col h-full flex-shrink-0 border-l relative"
        style={{
          width: `${width}px`,
          minWidth: `${MIN_WIDTH}px`,
          maxWidth: `${MAX_WIDTH}px`,
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          userSelect: dragging ? 'none' : 'auto',
        }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 group"
          title="Breite anpassen"
        >
          <div className={`
            absolute left-0.5 top-0 bottom-0 w-0.5 rounded-full
            transition-colors duration-100
            ${dragging ? 'bg-brand-500' : 'bg-transparent group-hover:bg-brand-300'}
          `} />
        </div>

        {/* Panel header */}
        {title && (
          <div
            className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              {title}
            </span>
            <PanelRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {children ?? <EmptyPanel />}
        </div>
      </aside>

      {/* ─── Mobile Bottom-Sheet ──────────────────────────────────────────── */}
      {children && (
        <div className="xl:hidden">
          {/* Toggle button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-brand)', color: 'white' }}
            title="Kontext-Panel öffnen"
          >
            <PanelRight size={20} />
          </button>

          {/* Backdrop */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Sheet */}
          <div
            className={`
              fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl
              transition-transform duration-300 ease-out
              max-h-[80vh] flex flex-col
              ${mobileOpen ? 'translate-y-0' : 'translate-y-full'}
            `}
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            {/* Handle + close */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-3 p-1"
              >
                <ChevronDown size={20} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            {title && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function EmptyPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-40">
      <PanelRight size={24} />
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kein Kontext verfügbar</p>
    </div>
  )
}
