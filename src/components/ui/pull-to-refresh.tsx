'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'
import { RotateCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  /** Pixels to pull before triggering refresh (default: 80) */
  threshold?: number
  disabled?: boolean
}

type Phase = 'idle' | 'pulling' | 'ready' | 'refreshing'

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  const isAtTop = useCallback(() => {
    const el = containerRef.current
    return !el || el.scrollTop === 0
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || !isAtTop()) return
    startYRef.current = e.touches[0].clientY
  }, [disabled, isAtTop])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || startYRef.current === null || !isAtTop()) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta <= 0) return

    // Resist — feels natural, like rubber banding
    const resistance = 0.4
    const dist = Math.min(delta * resistance, threshold * 1.5)
    setPullDistance(dist)
    setPhase(dist >= threshold ? 'ready' : 'pulling')
  }, [disabled, threshold, isAtTop])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || startYRef.current === null) return
    startYRef.current = null

    if (phase === 'ready') {
      setPhase('refreshing')
      setPullDistance(threshold)
      try {
        await onRefresh()
      } finally {
        setPullDistance(0)
        setPhase('idle')
      }
    } else {
      setPullDistance(0)
      setPhase('idle')
    }
  }, [disabled, onRefresh, phase, threshold])

  const isActive = phase !== 'idle'
  const progress = Math.min(pullDistance / threshold, 1)
  const spin = phase === 'refreshing' ? 'animate-spin' : ''
  const rotate = phase !== 'refreshing' ? `rotate(${progress * 180}deg)` : undefined

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-full overflow-y-auto"
    >
      {/* Pull indicator */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 flex justify-center items-center overflow-hidden z-10 transition-all duration-200"
        style={{ height: isActive ? `${pullDistance}px` : 0, top: 0 }}
      >
        <div
          className={[
            'w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-150',
            phase === 'ready' || phase === 'refreshing'
              ? 'bg-brand-800 text-white scale-100'
              : 'bg-white text-gray-400 scale-90 border border-gray-200',
          ].join(' ')}
        >
          <RotateCw
            size={16}
            className={spin}
            style={rotate ? { transform: rotate } : undefined}
          />
        </div>
      </div>

      {/* Content — shifts down while pulling */}
      <div
        className="transition-transform duration-200"
        style={{ transform: isActive ? `translateY(${pullDistance}px)` : 'none' }}
      >
        {children}
      </div>
    </div>
  )
}
