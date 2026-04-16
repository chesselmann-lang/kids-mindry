'use client'

import { useState } from 'react'
import { Languages, Loader2, X } from 'lucide-react'

// Inline — do NOT import from @/lib/translate (deepl-node uses Node.js fs)
const SUPPORTED_LANGUAGES = [
  { code: 'TR', label: 'Türkisch',   flag: '🇹🇷' },
  { code: 'AR', label: 'Arabisch',   flag: '🇸🇦' },
  { code: 'RU', label: 'Russisch',   flag: '🇷🇺' },
  { code: 'PL', label: 'Polnisch',   flag: '🇵🇱' },
  { code: 'RO', label: 'Rumänisch',  flag: '🇷🇴' },
  { code: 'UK', label: 'Ukrainisch', flag: '🇺🇦' },
  { code: 'HR', label: 'Kroatisch',  flag: '🇭🇷' },
]

interface Props {
  text: string
  className?: string
}

export default function TranslateButton({ text, className }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [translated, setTranslated] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<string | null>(null)

  async function translate(lang: string) {
    if (activeLang === lang && translated) { setOpen(false); return }
    setLoading(true)
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
    })
    const data = await res.json()
    if (data.translated) {
      setTranslated(data.translated)
      setActiveLang(lang)
    }
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <button
        onClick={() => { setOpen(!open); setTranslated(null); setActiveLang(null) }}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors"
        title="Übersetzen"
      >
        <Languages size={13} />
        {activeLang ? SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.flag : 'Übersetzen'}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20 flex flex-wrap gap-1 w-48">
          {SUPPORTED_LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => translate(l.code)}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50 text-xs text-gray-700 w-full"
            >
              <span>{l.flag}</span> {l.label}
              {loading && activeLang === l.code && <Loader2 size={10} className="animate-spin ml-auto" />}
            </button>
          ))}
        </div>
      )}

      {translated && (
        <div className="mt-2 p-3 bg-blue-50 rounded-xl text-sm text-gray-700 relative">
          <button
            onClick={() => { setTranslated(null); setActiveLang(null) }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X size={12} />
          </button>
          <p className="pr-4">{translated}</p>
          <p className="text-xs text-blue-400 mt-1">
            {SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.flag}{' '}
            {SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.label} · powered by DeepL
          </p>
        </div>
      )}
    </div>
  )
}
