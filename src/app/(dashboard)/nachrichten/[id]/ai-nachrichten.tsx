'use client'

import { useState } from 'react'
import { Sparkles, MessageCircle, Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

const TYP_CONFIG: Record<string, { color: string; dot: string }> = {
  zusammenfassung: { color: 'text-brand-800 bg-brand-50', dot: 'bg-brand-400' },
  offen:           { color: 'text-amber-800 bg-amber-50', dot: 'bg-amber-400' },
  info:            { color: 'text-gray-700 bg-gray-50',   dot: 'bg-gray-400' },
}

const TON_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  formell:    { bg: 'bg-blue-50',   text: 'text-blue-800',   label: 'Formell'    },
  freundlich: { bg: 'bg-green-50',  text: 'text-green-800',  label: 'Freundlich' },
  kurz:       { bg: 'bg-gray-50',   text: 'text-gray-700',   label: 'Kurz'       },
}

type Tab = 'analyse' | 'antwort'

export default function AiNachrichten({ conversationId }: { conversationId: string }) {
  const [tab, setTab] = useState<Tab>('analyse')
  const [analyseData, setAnalyseData] = useState<any>(null)
  const [antwortData, setAntwortData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const analyse = async () => {
    setLoading(true); setError(null); setExpanded(true)
    try {
      const res = await fetch(`/api/ai/nachrichten-analyse?conversationId=${conversationId}`)
      if (!res.ok) throw new Error('Fehler')
      setAnalyseData(await res.json())
    } catch { setError('Analyse fehlgeschlagen.') }
    setLoading(false)
  }

  const antwort = async () => {
    setLoading(true); setError(null); setExpanded(true)
    try {
      const res = await fetch(`/api/ai/nachrichten-antwort?conversationId=${conversationId}`)
      if (!res.ok) throw new Error('Fehler')
      setAntwortData(await res.json())
    } catch { setError('Vorschlag fehlgeschlagen.') }
    setLoading(false)
  }

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const hasData = tab === 'analyse' ? analyseData : antwortData
  if (hasData && !expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors">
        <MessageCircle size={12} />
        KI-Assistent anzeigen
        <ChevronDown size={12} className="ml-auto" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
      <div className="bg-white rounded-2xl p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <MessageCircle size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-800">KI-Assistent</span>
          </div>
          {expanded && <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-gray-600"><ChevronUp size={14} /></button>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-2">
          {(['analyse', 'antwort'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(null) }}
              className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                tab === t
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={tab === t ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' } : {}}>
              {t === 'analyse' ? '📋 Zusammenfassung' : '✍️ Antwort vorschlagen'}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {/* Analyse Tab */}
        {tab === 'analyse' && (
          <>
            {!analyseData && !loading && (
              <button onClick={analyse}
                className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                Konversation zusammenfassen
              </button>
            )}
            {loading && tab === 'analyse' && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 size={12} className="animate-spin text-blue-500" />
                <span className="text-xs text-gray-500">Analysiere…</span>
              </div>
            )}
            {analyseData?.hinweise && expanded && (
              <div className="space-y-1.5">
                {analyseData.hinweise.map((h: any, i: number) => {
                  const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
                  return (
                    <div key={i} className={`flex items-start gap-2 rounded-lg px-2.5 py-2 ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
                      <p className="text-[10px] leading-relaxed">{h.text}</p>
                    </div>
                  )
                })}
                <p className="text-[9px] text-gray-400">KI-generiert · nur zur Orientierung</p>
              </div>
            )}
          </>
        )}

        {/* Antwort Tab */}
        {tab === 'antwort' && (
          <>
            {!antwortData && !loading && (
              <button onClick={antwort}
                className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <Sparkles size={10} />
                Antwortvorschläge generieren
              </button>
            )}
            {loading && tab === 'antwort' && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 size={12} className="animate-spin text-blue-500" />
                <span className="text-xs text-gray-500">Formuliere Vorschläge…</span>
              </div>
            )}
            {antwortData?.vorschlaege && expanded && (
              <div className="space-y-2">
                {antwortData.vorschlaege.map((v: any, i: number) => {
                  const cfg = TON_CONFIG[v.ton] ?? TON_CONFIG.freundlich
                  return (
                    <div key={i} className={`rounded-xl p-2.5 ${cfg.bg}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                        <button onClick={() => copy(v.text, i)}
                          className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-lg transition-colors ${cfg.text} hover:opacity-70`}>
                          {copied === i ? <Check size={9} /> : <Copy size={9} />}
                          {copied === i ? 'Kopiert' : 'Kopieren'}
                        </button>
                      </div>
                      <p className={`text-xs leading-relaxed ${cfg.text}`}>{v.text}</p>
                    </div>
                  )
                })}
                <div className="flex gap-2 pt-0.5">
                  <button onClick={() => setAntwortData(null)}
                    className="text-[9px] text-gray-400 hover:text-gray-600">↺ Neu generieren</button>
                  <span className="text-[9px] text-gray-300">· KI-Vorschlag · vor dem Senden prüfen</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
