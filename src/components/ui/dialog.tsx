'use client'

import React, {
  createContext, useContext, useCallback, useState,
  useEffect, useRef
} from 'react'
import { X, AlertTriangle, Trash2, HelpCircle } from 'lucide-react'

// ─── Base Dialog ────────────────────────────────────────────────────────────────
interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Hide the X button */
  hideClose?: boolean
}

export function Dialog({ open, onClose, title, description, children, size = 'md', hideClose }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on backdrop click
  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size]

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleBackdrop}
      className={[
        'fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4',
        'transition-all duration-300',
        open
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
      ].join(' ')}
      style={{ backgroundColor: open ? 'rgba(0,0,0,0.45)' : 'transparent' }}
    >
      <div
        className={[
          'relative bg-white rounded-3xl shadow-2xl w-full p-6',
          sizeClass,
          'transition-all duration-300',
          open
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95',
        ].join(' ')}
      >
        {/* Close button */}
        {!hideClose && (
          <button
            onClick={onClose}
            aria-label="Dialog schließen"
            className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="mb-5 pr-6">
            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

// ─── Confirm Dialog ─────────────────────────────────────────────────────────────
interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>')
  return ctx.confirm
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve })
    })
  }, [])

  const handleResponse = (value: boolean) => {
    state?.resolve(value)
    setState(null)
  }

  const variant = state?.variant ?? 'default'
  const iconConfig = {
    danger:  { icon: Trash2,         iconBg: 'bg-red-50',     iconColor: 'text-red-500',    btnClass: 'bg-red-600 hover:bg-red-700 text-white' },
    warning: { icon: AlertTriangle,  iconBg: 'bg-yellow-50',  iconColor: 'text-yellow-500', btnClass: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
    default: { icon: HelpCircle,     iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',   btnClass: 'bg-brand-700 hover:bg-brand-600 text-white' },
  }[variant]

  const IconComp = iconConfig.icon

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={!!state}
        onClose={() => handleResponse(false)}
        hideClose
        size="sm"
      >
        {state && (
          <div className="text-center">
            <div className={`w-14 h-14 ${iconConfig.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <IconComp size={24} className={iconConfig.iconColor} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{state.title}</h3>
            {state.description && (
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{state.description}</p>
            )}
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => handleResponse(true)}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${iconConfig.btnClass}`}
              >
                {state.confirmLabel ?? 'Bestätigen'}
              </button>
              <button
                onClick={() => handleResponse(false)}
                className="w-full px-4 py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {state.cancelLabel ?? 'Abbrechen'}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  )
}

// ─── Bottom Sheet (mobile-first alternative to dialog) ─────────────────────────
interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className={[
        'fixed inset-0 z-[1000] flex items-end',
        'transition-all duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      style={{ backgroundColor: open ? 'rgba(0,0,0,0.4)' : 'transparent' }}
    >
      <div
        className={[
          'bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 py-4 pb-safe">
          {children}
        </div>
      </div>
    </div>
  )
}
