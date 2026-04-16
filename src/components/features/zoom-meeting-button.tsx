'use client'

import { useState } from 'react'
import { Video, ExternalLink, Loader2, X } from 'lucide-react'

interface Props {
  childId?: string
  gespraechId?: string
  defaultTopic?: string
  defaultDate?: string // YYYY-MM-DD
}

export default function ZoomMeetingButton({ childId, gespraechId, defaultTopic, defaultDate }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ joinUrl: string; startUrl: string; password?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [topic, setTopic] = useState(defaultTopic ?? 'Elterngespräch')
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState(30)

  const createMeeting = async () => {
    setLoading(true)
    setError(null)
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString()
      const res = await fetch('/api/zoom/create-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          startTime,
          durationMinutes: duration,
          childId,
          elterngespraechId: gespraechId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler beim Erstellen')
      setResult({ joinUrl: data.joinUrl, startUrl: data.startUrl, password: data.password })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl text-sm font-medium hover:bg-sky-100 transition-colors"
      >
        <Video size={15} />
        Zoom-Meeting
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Zoom-Meeting erstellen</h3>
              <button onClick={() => { setOpen(false); setResult(null); setError(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>

            {!result ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Thema</label>
                  <input
                    className="mt-1 w-full input"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Elterngespräch"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Datum</label>
                    <input type="date" className="mt-1 w-full input" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Uhrzeit</label>
                    <input type="time" className="mt-1 w-full input" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Dauer (Minuten)</label>
                  <select className="mt-1 w-full input" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                    {[15, 30, 45, 60, 90, 120].map(d => (
                      <option key={d} value={d}>{d} Min.</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                    {error.includes('not connected')
                      ? 'Zoom ist noch nicht verbunden. Bitte unter Admin → Integrationen verbinden.'
                      : error}
                  </p>
                )}

                <button
                  onClick={createMeeting}
                  disabled={loading}
                  className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                  Meeting erstellen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-green-800">Meeting erstellt! ✅</p>
                  {result.password && (
                    <p className="text-xs text-green-700">Passwort: <strong>{result.password}</strong></p>
                  )}
                </div>
                <a
                  href={result.startUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700"
                >
                  <Video size={16} /> Meeting starten <ExternalLink size={14} />
                </a>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Link für Eltern:</p>
                  <p className="text-xs font-mono text-gray-700 break-all select-all">{result.joinUrl}</p>
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(result.joinUrl)
                  }}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
                >
                  Link kopieren
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
