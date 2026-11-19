'use client'

/**
 * TranslateButton — Übersetzungsbutton für Chat-Nachrichten
 *
 * Erscheint auf Hover unter eingehenden Nachrichten.
 * Nutzt POST /api/ai/translate (Claude Haiku).
 * Zielsprache wird aus localStorage gelesen ('mindry_translate_lang', Default: 'de').
 *
 * States:
 *   idle     → Übersetzungs-Icon + "Übersetzen"
 *   loading  → Spinner
 *   done     → Zeigt übersetzten Text + "Original anzeigen" Toggle
 *   error    → kurze Fehlermeldung
 */

import { useState, useCallback } from 'react'
import { Languages, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export const LANG_LABELS: Record<string, string> = {
  de: '🇩🇪 Deutsch',
  en: '🇬🇧 Englisch',
  tr: '🇹🇷 Türkisch',
  ar: '🇸🇦 Arabisch',
  ru: '🇷🇺 Russisch',
  pl: '🇵🇱 Polnisch',
  uk: '🇺🇦 Ukrainisch',
  ro: '🇷🇴 Rumänisch',
  bg: '🇧🇬 Bulgarisch',
  it: '🇮🇹 Italienisch',
  es: '🇪🇸 Spanisch',
  fr: '🇫🇷 Französisch',
}

const STORAGE_KEY = 'mindry_translate_lang'

function getDefaultLang(): string {
  if (typeof window === 'undefined') return 'de'
  return localStorage.getItem(STORAGE_KEY) ?? 'de'
}

interface TranslateButtonProps {
  text: string
  messageId: string
  /** callback to show/hide translated text in parent */
  onTranslated?: (translated: string | null) => void
}

export default function TranslateButton({ text, messageId, onTranslated }: TranslateButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [translated, setTranslated] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [targetLang, setTargetLang] = useState(getDefaultLang)
  const [error, setError] = useState<string | null>(null)

  const translate = useCallback(async (lang?: string) => {
    const lang_ = lang ?? targetLang
    setStatus('loading')
    setError(null)
    setShowLangPicker(false)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: lang_, messageId }),
      })
      if (!res.ok) {
        const { error: e } = await res.json().catch(() => ({}))
        throw new Error(e ?? `HTTP ${res.status}`)
      }
      const { translated: t } = await res.json()
      setTranslated(t)
      setStatus('done')
      setShowOriginal(false)
      onTranslated?.(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
      setStatus('error')
      onTranslated?.(null)
    }
  }, [text, targetLang, messageId, onTranslated])

  const handleLangChange = (lang: string) => {
    setTargetLang(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    if (status === 'done') {
      // Re-translate with new language
      translate(lang)
    }
    setShowLangPicker(false)
  }

  const reset = () => {
    setStatus('idle')
    setTranslated(null)
    setShowOriginal(false)
    onTranslated?.(null)
  }

  if (status === 'idle' || status === 'error') {
    return (
      <div className="flex items-center gap-1 relative">
        {status === 'error' && (
          <span className="text-[10px] text-red-400">{error}</span>
        )}
        <button
          onClick={() => translate()}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-brand-600 transition-colors px-1.5 py-0.5 rounded hover:bg-brand-50"
          title={`Übersetzen nach ${LANG_LABELS[targetLang]}`}
        >
          <Languages size={11} />
          Übersetzen
        </button>
        <button
          onClick={() => setShowLangPicker(v => !v)}
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors px-0.5"
          title="Sprache wählen"
        >
          {LANG_LABELS[targetLang]?.slice(0, 2)}
        </button>
        {showLangPicker && (
          <div className="absolute bottom-full left-0 mb-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2 grid grid-cols-2 gap-0.5 min-w-[220px]">
            {Object.entries(LANG_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                className={`text-left text-xs px-2 py-1.5 rounded-lg hover:bg-brand-50 transition-colors ${
                  code === targetLang ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <span className="flex items-center gap-1 text-[10px] text-gray-400">
        <Loader2 size={10} className="animate-spin" />
        Wird übersetzt…
      </span>
    )
  }

  // done
  return (
    <div className="flex flex-col gap-0.5 w-full">
      {/* Translated text bubble */}
      {!showOriginal && (
        <div className="mt-1 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-sm text-gray-800 leading-relaxed">
          {translated}
        </div>
      )}
      {/* Controls */}
      <div className="flex items-center gap-2 mt-0.5">
        <span className="flex items-center gap-1 text-[10px] text-blue-400">
          <Languages size={10} />
          Übersetzt · {LANG_LABELS[targetLang]}
        </span>
        <button
          onClick={() => setShowOriginal(v => !v)}
          className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showOriginal ? <><ChevronDown size={10} /> Übersetzung</>
                        : <><ChevronUp size={10} /> Original</>}
        </button>
        <button
          onClick={() => setShowLangPicker(v => !v)}
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
          title="Andere Sprache"
        >
          {LANG_LABELS[targetLang]?.slice(0, 2)}
        </button>
        <button onClick={reset} className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors ml-auto">
          <X size={10} />
        </button>
      </div>
    </div>
  )
}
