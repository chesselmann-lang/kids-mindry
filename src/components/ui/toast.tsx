'use client'

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => string
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

// ─── Context ────────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// ─── Config ────────────────────────────────────────────────────────────────────
const CONFIG: Record<ToastType, { icon: React.ElementType; classes: string; iconClass: string }> = {
  success: { icon: CheckCircle, classes: 'border-green-200 bg-white',     iconClass: 'text-green-500' },
  error:   { icon: XCircle,     classes: 'border-red-200 bg-white',       iconClass: 'text-red-500' },
  warning: { icon: AlertTriangle, classes: 'border-yellow-200 bg-white',  iconClass: 'text-yellow-500' },
  info:    { icon: Info,         classes: 'border-blue-200 bg-white',      iconClass: 'text-blue-500' },
}

// ─── Single Toast Item ──────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const duration = toast.duration ?? 4000

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLeaving(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }, [onDismiss, toast.id])

  useEffect(() => {
    // Trigger enter animation
    const raf = requestAnimationFrame(() => setVisible(true))
    // Auto-dismiss
    timerRef.current = setTimeout(dismiss, duration)
    return () => {
      cancelAnimationFrame(raf)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [dismiss, duration])

  const cfg = CONFIG[toast.type]
  const Icon = cfg.icon

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'flex items-start gap-3 w-full max-w-sm px-4 py-3.5 rounded-2xl border shadow-card-hover',
        'transition-all duration-300 ease-out',
        cfg.classes,
        visible && !leaving
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95',
      ].join(' ')}
    >
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${cfg.iconClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Benachrichtigung schließen"
        className="flex-shrink-0 -mt-0.5 -mr-1 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((opts: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]) // max 5 toasts
    return id
  }, [])

  const success = useCallback((title: string, description?: string) =>
    toast({ type: 'success', title, description }), [toast])
  const error = useCallback((title: string, description?: string) =>
    toast({ type: 'error', title, description }), [toast])
  const warning = useCallback((title: string, description?: string) =>
    toast({ type: 'warning', title, description }), [toast])
  const info = useCallback((title: string, description?: string) =>
    toast({ type: 'info', title, description }), [toast])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => setToasts([]), [])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      {/* Portal */}
      <div
        aria-label="Benachrichtigungen"
        className="fixed bottom-20 left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto w-full flex justify-center">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
