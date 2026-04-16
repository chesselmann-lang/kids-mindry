'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode, CSSProperties } from 'react'

export interface AiWidgetShellProps {
  /** Farbverlauf für Rahmen + Button (CSS gradient string) */
  gradient: string
  /** Icon-Komponente aus lucide-react */
  Icon: LucideIcon
  /** Haupttitel */
  title: string
  /** Zweite Zeile / Beschreibung */
  subtitle: string
  /** Gilt als geladen, wenn truthy */
  data: unknown
  loading: boolean
  error: string | null
  /** Text auf dem initialen Lade-Button */
  loadLabel?: string
  /** Wird auf dem Lade-Spinner angezeigt */
  loadingLabel?: string
  /** Callback für initialen Load UND Refresh */
  onLoad: () => void
  /** Badges rechts im Header (optional) */
  headerBadges?: ReactNode
  /** Inhalt wenn Daten geladen sind */
  children?: ReactNode
  /** Zusätzlicher className auf dem äußeren Wrapper */
  className?: string
  /** Inline-Styles auf dem äußeren Wrapper */
  style?: CSSProperties
}

/**
 * Gemeinsame Shell für alle KI-Widgets.
 * Kümmert sich um: Gradient-Rahmen, Header (Icon + Titel + Badges),
 * leerer Zustand, Lade-Spinner, Fehlermeldung, Refresh-Link.
 *
 * Verwendung:
 *   <AiWidgetShell gradient="linear-gradient(135deg, #8b5cf6, #3b82f6)"
 *                  Icon={Sparkles} title="KI-Einschätzung" subtitle="..."
 *                  data={data} loading={loading} error={error} onLoad={load}>
 *     {data && <MyContent data={data} />}
 *   </AiWidgetShell>
 */
export default function AiWidgetShell({
  gradient,
  Icon,
  title,
  subtitle,
  data,
  loading,
  error,
  loadLabel = 'KI-Analyse starten',
  loadingLabel = 'Analyse läuft…',
  onLoad,
  headerBadges,
  children,
  className = '',
  style,
}: AiWidgetShellProps) {
  return (
    <div
      className={`rounded-2xl p-0.5 ${className}`}
      style={{ background: gradient, ...style }}
    >
      <div className="bg-white rounded-[14px] p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: gradient }}
            >
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-[10px] text-gray-400">{subtitle}</p>
            </div>
          </div>
          {headerBadges && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {headerBadges}
            </div>
          )}
        </div>

        {/* Leerer Zustand – initialer Button */}
        {!data && !loading && !error && (
          <button
            onClick={onLoad}
            aria-label={loadLabel}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: gradient }}
          >
            {loadLabel}
          </button>
        )}

        {/* Lade-Spinner */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{loadingLabel}</span>
          </div>
        )}

        {/* Fehlermeldung */}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex flex-col gap-2">
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={onLoad}
              aria-label="Erneut versuchen"
              className="text-xs font-semibold text-red-500 hover:text-red-700 self-start"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Daten-Inhalt */}
        {data && !loading && children}

        {/* Refresh-Link am Ende (nur wenn Daten vorhanden) */}
        {data && !loading && (
          <button
            onClick={onLoad}
            aria-label="Neu analysieren"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
          >
            <RefreshCw size={11} />
            Neu analysieren
          </button>
        )}
      </div>
    </div>
  )
}
