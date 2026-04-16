'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, Clock, Users, Search, LogIn, LogOut, Shield } from 'lucide-react'

interface Child {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  today: { status: string; checked_in_at: string | null; checked_out_at: string | null } | null
  groups: { name: string; color: string } | null
}

export default function KioskPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Child | null>(null)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; name?: string } | null>(null)
  const [time, setTime] = useState(new Date())

  // Uhr
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const loadChildren = useCallback(async () => {
    const res = await fetch('/api/kiosk/children')
    if (res.ok) setChildren(await res.json())
  }, [])

  useEffect(() => {
    loadChildren()
    const interval = setInterval(loadChildren, 30000)
    return () => clearInterval(interval)
  }, [loadChildren])

  const filtered = children.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) setPin(p => p + digit)
  }

  const handleAction = async (action: 'checkin' | 'checkout') => {
    if (!selected || pin.length !== 4) return
    setLoading(true)
    try {
      const res = await fetch('/api/kiosk/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, child_id: selected.id, action }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({
          success: true,
          message: action === 'checkin' ? 'Guten Morgen!' : 'Tschüss, bis morgen!',
          name: `${selected.first_name} ${selected.last_name}`,
        })
        await loadChildren()
      } else {
        setResult({ success: false, message: data.error ?? 'Fehler' })
      }
    } catch {
      setResult({ success: false, message: 'Verbindungsfehler' })
    }
    setLoading(false)
    setPin('')

    setTimeout(() => {
      setResult(null)
      setSelected(null)
      setSearch('')
    }, 3000)
  }

  const isCheckedIn = selected?.today?.status === 'present' && !selected?.today?.checked_out_at
  const isCheckedOut = !!selected?.today?.checked_out_at

  const checkedInCount = children.filter(c => c.today?.status === 'present' && !c.today?.checked_out_at).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center p-6">
      {/* Erfolgs-/Fehler-Overlay */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
            {result.success ? (
              <CheckCircle2 size={72} className="text-emerald-500 mx-auto mb-4" />
            ) : (
              <XCircle size={72} className="text-red-500 mx-auto mb-4" />
            )}
            {result.name && (
              <p className="text-2xl font-black text-gray-900 mb-2">{result.name}</p>
            )}
            <p className="text-lg font-semibold text-gray-600">{result.message}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl grid grid-cols-[1fr_320px] gap-6">
        {/* Linke Seite: Kinderliste */}
        <div className="bg-white rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900 tabular-nums">
                {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-400">
                {time.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
              <Users size={16} />
              <span className="font-bold text-sm">{checkedInCount} anwesend</span>
            </div>
          </div>

          {/* Suche */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kind suchen..."
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Kinderliste */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1">
            {filtered.map(child => {
              const checkedIn = child.today?.status === 'present' && !child.today?.checked_out_at
              const checkedOut = !!child.today?.checked_out_at
              const isActive = selected?.id === child.id
              return (
                <button
                  key={child.id}
                  onClick={() => { setSelected(child); setPin('') }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg scale-[1.01]'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {child.photo_url ? (
                    <img src={child.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: (child.groups as any)?.color ?? '#6366f1' }}
                    >
                      {child.first_name[0]}{child.last_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {child.first_name} {child.last_name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                      {(child.groups as any)?.name ?? 'Keine Gruppe'}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    checkedIn
                      ? isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                      : checkedOut
                      ? isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      : isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {checkedIn ? '✓ Da' : checkedOut ? 'Weg' : '–'}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Kein Kind gefunden</p>
              </div>
            )}
          </div>
        </div>

        {/* Rechte Seite: PIN-Pad */}
        <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-5 shadow-2xl">
          <Shield size={28} className="text-brand-600" />
          <h2 className="text-lg font-black text-gray-900 text-center">
            {selected ? `${selected.first_name} ${selected.last_name}` : 'Kind auswählen'}
          </h2>

          {selected && (
            <>
              {/* PIN-Anzeige */}
              <div className="flex gap-3 my-2">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${
                    i < pin.length ? 'bg-brand-600 border-brand-600 scale-110' : 'border-gray-300'
                  }`} />
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                  <button
                    key={i}
                    onClick={() => d === '⌫' ? setPin(p => p.slice(0,-1)) : d ? handlePinPress(d) : undefined}
                    disabled={!d}
                    className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-95 ${
                      d === '⌫'
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : d
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'invisible'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Aktions-Buttons */}
              <div className="w-full space-y-3 mt-2">
                {!isCheckedIn && !isCheckedOut && (
                  <button
                    onClick={() => handleAction('checkin')}
                    disabled={pin.length !== 4 || loading}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    Ankommen bestätigen
                  </button>
                )}
                {isCheckedIn && (
                  <button
                    onClick={() => handleAction('checkout')}
                    disabled={pin.length !== 4 || loading}
                    className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Abholen bestätigen
                  </button>
                )}
                {isCheckedOut && (
                  <div className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm text-center flex items-center justify-center gap-2">
                    <Clock size={18} />
                    Heute bereits abgeholt
                  </div>
                )}
                {selected?.today?.checked_in_at && (
                  <p className="text-center text-xs text-gray-400">
                    Angekommen: {new Date(selected.today.checked_in_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                  </p>
                )}
              </div>
            </>
          )}

          {!selected && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
              <p className="text-sm">Bitte wähle links ein Kind aus</p>
              <p className="text-xs">Dann PIN eingeben und Check-in/Check-out bestätigen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
