'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, RotateCcw, Copy, Check, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  { label: '📝 Elternbrief', prompt: 'Schreibe einen Elternbrief für das bevorstehende Sommerfest am letzten Freitag im Juli. Freundlich, informell, mit Bitte um Rückmeldung bis eine Woche vorher.' },
  { label: '🎨 Aktivität 3–6 J.', prompt: 'Schlage 5 kreative Aktivitäten für Kindergartenkinder (3–6 Jahre) zum Thema "Wasser & Natur" vor. Mit Material und Dauer.' },
  { label: '💡 Förderantrag', prompt: 'Erkläre mir, welche Angaben ich für einen Sprachförderantrag nach dem Bundeskinderschutzgesetz brauche und wie ich ihn strukturieren soll.' },
  { label: '🔒 DSGVO-Frage', prompt: 'Darf ich Fotos von Kindern in der Kita auf der kita-eigenen Website veröffentlichen? Was muss ich dabei beachten?' },
  { label: '📊 Beobachtung', prompt: 'Schreibe eine pädagogische Beobachtung für ein 4-jähriges Mädchen, das heute beim Malen besonders konzentriert und kreativ war. Kein Name, neutral formuliert.' },
  { label: '📅 Elterngespräch', prompt: 'Wie bereite ich ein Elterngespräch zu einem Kind mit Sprachentwicklungsverzögerung vor? Was sollte ich ansprechen, wie formuliere ich es einfühlsam?' },
]

export default function KiAssistentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: content.trim() }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.text }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.' }])
    } finally {
      setLoading(false)
    }
  }

  function copyMessage(text: string, idx: number) {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mx-4 -mt-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-nunito)' }}>KI-Assistent</h1>
              <p className="text-xs text-gray-400">Dein Kita-Experte für den Alltag</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-5">
            {/* Welcome */}
            <div className="text-center pt-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={28} className="text-brand-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'var(--font-nunito)' }}>Wie kann ich helfen?</h2>
              <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Elternbriefe, Aktivitäten, Förderplanung, DSGVO — frag mich alles rund um deine Kita.</p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.prompt)}
                  className="text-left p-3 rounded-2xl bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all duration-150 shadow-sm"
                >
                  <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] group relative ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(msg.content, idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 self-start"
                  >
                    {copied === idx ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 input resize-none text-sm min-h-[44px] max-h-32"
            rows={1}
            placeholder="Frag mich etwas…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 128) + 'px'
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-40 flex-shrink-0"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
