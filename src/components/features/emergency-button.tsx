'use client'

import { useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

export default function EmergencyButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'evacuation' | 'closure' | 'lockdown' | 'medical'>('closure')

  const TYPES = [
    { id: 'closure', label: '🚪 Notschließung', desc: 'Kita muss sofort schließen' },
    { id: 'evacuation', label: '🚒 Evakuierung', desc: 'Gebäude wird evakuiert' },
    { id: 'lockdown', label: '🔒 Lockdown', desc: 'Gebäude wird gesichert' },
    { id: 'medical', label: '🏥 Medizinischer Notfall', desc: 'Rettungsdienst alarmiert' },
  ] as const

  async function sendEmergency() {
    setLoading(true)
    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
      })
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setMessage('') }, 3000)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 shadow-float flex items-center justify-center transition-all duration-200 print:hidden"
        aria-label="Notfall"
      >
        <AlertTriangle size={20} className="text-white" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4 print:hidden">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
            <h2 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'var(--font-nunito)' }}>Notfall-Alert gesendet</h2>
            <p className="text-sm text-gray-500 mt-1">Alle Nutzer wurden benachrichtigt.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900" style={{ fontFamily: 'var(--font-nunito)' }}>Notfall-Alert</h2>
                  <p className="text-xs text-red-500 font-medium">Alle Nutzer werden sofort benachrichtigt</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    type === t.id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">Zusätzliche Information (optional)</label>
              <textarea
                className="mt-1 w-full input resize-none text-sm"
                rows={2}
                placeholder="z.B. Bitte Kinder umgehend abholen…"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <button
              onClick={sendEmergency}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
              {loading ? 'Wird gesendet…' : 'Notfall-Alert senden'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Nur für echte Notfälle. Alle Nutzer erhalten sofort eine Push-Benachrichtigung.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
