import { useEffect, useRef, useState, useCallback } from 'react'

interface Options {
  onRefresh: () => Promise<void>
  threshold?: number   // px drag needed to trigger (default 80)
  disabled?: boolean
}

interface PullState {
  pulling: boolean
  refreshing: boolean
  pullY: number        // current drag distance (0–threshold)
}

/**
 * usePullToRefresh
 *
 * Attaches a native-feel pull-to-refresh gesture to the scroll container.
 * Returns pull state for rendering the indicator, and a ref to attach to
 * the scrollable element.
 *
 * Usage:
 *   const { containerRef, pulling, refreshing, pullProgress } = usePullToRefresh({ onRefresh })
 *   <div ref={containerRef}>…</div>
 */
export function usePullToRefresh({ onRefresh, threshold = 80, disabled = false }: Options) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const startYRef = useRef<number | null>(null)
  const [state, setState] = useState<PullState>({ pulling: false, refreshing: false, pullY: 0 })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef.current
    if (!el || disabled) return
    // Only start if at very top of scroll container
    if (el.scrollTop > 0) return
    startYRef.current = e.touches[0].clientY
  }, [disabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startYRef.current === null || disabled) return
    const el = containerRef.current
    if (!el) return
    if (el.scrollTop > 0) { startYRef.current = null; return }

    const delta = e.touches[0].clientY - startYRef.current
    if (delta < 0) { startYRef.current = null; return }

    // Rubber-band: slow down drag above threshold
    const pullY = Math.min(delta * 0.5, threshold * 1.3)
    setState(s => ({ ...s, pulling: true, pullY }))

    // Prevent page scroll while pulling
    if (delta > 8) e.preventDefault()
  }, [disabled, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return
    startYRef.current = null

    setState(s => {
      if (s.pullY >= threshold * 0.6) {
        // Trigger refresh
        return { ...s, pulling: false, refreshing: true, pullY: 0 }
      }
      return { pulling: false, refreshing: false, pullY: 0 }
    })
  }, [threshold])

  // Run refresh when refreshing becomes true
  const refreshingRef = useRef(false)
  useEffect(() => {
    if (state.refreshing && !refreshingRef.current) {
      refreshingRef.current = true
      onRefresh().finally(() => {
        refreshingRef.current = false
        setState({ pulling: false, refreshing: false, pullY: 0 })
      })
    }
  }, [state.refreshing, onRefresh])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const pullProgress = Math.min(state.pullY / threshold, 1)

  return {
    containerRef,
    pulling: state.pulling,
    refreshing: state.refreshing,
    pullY: state.pullY,
    pullProgress,
  }
}
