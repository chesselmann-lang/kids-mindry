'use client'

import { useState, useEffect } from 'react'
import { Tablet, Key, CheckCircle2, Loader2 } from 'lucide-react'

export default function KioskPinWidget({ childId }: { childId: string }) {
  const [hasPin, setHasPin] = useState(false)
  const [pinInfo, setPinInfo] = useState<{ label: string; created_at: string } | null>(null)
  const [newPin, setNewPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/kiosk/pin?child_id=${childId}`)
      .then(r => r.json())
      .then(d => { setHasPin(d.has_pin); setPinInfo(d.pin_info) })
      .catch(() => {})
  }, [childId])

  const handleSave = async () => {
    if (!/^\d{4}$/.test(newPin)) { setError('Bitte genau 4 Ziffern eingeben'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/kiosk/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId, pin: newPin }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSaved(true); setHasPin(true); setNewPin('')
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(data.error ?? 'Fehler')
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Tablet size={16} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900">Kiosk-PIN</h3>
          <p className="text-xs text-gray-400">
            {hasPin
              ? `PIN aktiv seit ${pinInfo ? new Date(pinInfo.created_at).toLocaleDateString('de-DE') : '–'}`
              : 'Noch kein PIN gesetzt'}
          </p>
        </div>
        {hasPin && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} /> Aktiv
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder={hasPin ? 'Neuen PIN eingeben' : '4-stelliger PIN'}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading || newPin.length !== 4}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : saved ? '✓' : 'Speichern'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {saved && <p className="text-xs text-emerald-600 mt-2">✓ PIN gespeichert</p>}
    </div>
  )
}
