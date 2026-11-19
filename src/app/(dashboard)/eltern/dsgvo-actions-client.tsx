'use client'

/**
 * DsgvoActionsClient
 * Art. 20 — Data Export and Art. 17 — Deletion, both PIN-gated.
 */

import { useState } from 'react'
import { Download, Trash2, Loader2, ShieldAlert, X, Check } from 'lucide-react'

interface Props {
  children: Array<{ child_id: string; child_name: string }>
}

export default function DsgvoActionsClient({ children }: Props) {
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.child_id ?? '')
  const [action, setAction] = useState<'export' | 'delete' | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [apiError, setApiError] = useState('')

  function openModal(a: 'export' | 'delete') {
    setAction(a)
    setPin('')
    setPinError(false)
    setDone(null)
    setApiError('')
  }
  function closeModal() {
    setAction(null)
    setPin('')
    setPinError(false)
    setDone(null)
    setApiError('')
  }

  async function confirm() {
    if (pin.length !== 4) return
    setLoading(true)
    setPinError(false)
    setApiError('')

    // Verify PIN first
    const verifyRes = await fetch('/api/eltern-pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.valid) {
      setLoading(false)
      setPinError(true)
      setPin('')
      return
    }

    if (action === 'export') {
      const res = await fetch(`/api/data-export?child_id=${selectedChild}`, {
        headers: { 'X-Eltern-Pin-Verified': 'true' },
        credentials: 'same-origin',
      })
      if (res.ok) {
        // Download the JSON
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mindry-daten-${selectedChild}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setDone('Daten erfolgreich exportiert.')
      } else {
        const err = await res.json()
        setApiError(err.error ?? 'Export fehlgeschlagen')
      }
    } else if (action === 'delete') {
      const res = await fetch('/api/dsgvo-kind-export', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Eltern-Pin-Verified': 'true' },
        body: JSON.stringify({ child_id: selectedChild, reason: 'parent_request_art17' }),
        credentials: 'same-origin',
      })
      if (res.ok) {
        setDone('Daten wurden anonymisiert. Das Kindprofil wurde gelöscht.')
      } else {
        const err = await res.json()
        setApiError(err.error ?? 'Löschung fehlgeschlagen')
      }
    }
    setLoading(false)
  }

  return (
    <>
      {/* Child selector */}
      {children.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
            Kind auswählen
          </label>
          <div className="flex flex-wrap gap-2">
            {children.map(c => (
              <button
                key={c.child_id}
                onClick={() => setSelectedChild(c.child_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedChild === c.child_id
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 border-brand-300 dark:border-brand-700'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
                style={selectedChild !== c.child_id ? { color: 'var(--color-text-secondary)' } : {}}
              >
                {c.child_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Art. 20 Export */}
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Download size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Daten exportieren
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Art. 20 DSGVO — Alle gespeicherten Daten Ihres Kindes als JSON-Datei
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal('export')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Download size={14} />
            Export anfordern
          </button>
        </div>

        {/* Art. 17 Deletion */}
        <div
          className="rounded-2xl border p-4 border-red-100 dark:border-red-900/50"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Daten löschen
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Art. 17 DSGVO — Persönliche Daten anonymisieren, Statistiken bleiben anonym erhalten
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal('delete')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <Trash2 size={14} />
            Löschung beantragen
          </button>
        </div>
      </div>

      {/* PIN Modal */}
      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
              <X size={16} className="text-gray-400" />
            </button>

            <div className="text-center mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${action === 'delete' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {action === 'delete'
                  ? <ShieldAlert size={28} className="text-red-600" />
                  : <Download size={28} className="text-blue-600" />
                }
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {action === 'delete' ? 'Daten löschen (Art. 17)' : 'Daten exportieren (Art. 20)'}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {action === 'delete'
                  ? 'Diese Aktion anonymisiert alle persönlichen Daten unwiderruflich.'
                  : 'Alle gespeicherten Daten werden als JSON-Datei heruntergeladen.'}
              </p>
              <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>Eltern-PIN eingeben</p>
            </div>

            {done ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-green-600" />
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">{done}</p>
                <button onClick={closeModal} className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline">Schließen</button>
              </div>
            ) : (
              <>
                {/* PIN dots */}
                <div className="flex justify-center gap-3 mb-4">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-colors ${
                      pin.length > i ? pinError ? 'bg-red-500' : action === 'delete' ? 'bg-red-600' : 'bg-blue-600' : 'border-2 border-gray-300 dark:border-slate-600'
                    }`} />
                  ))}
                </div>
                {pinError && <p className="text-center text-xs text-red-500 mb-3">Falscher PIN</p>}
                {apiError && <p className="text-center text-xs text-red-500 mb-3">{apiError}</p>}

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                    <button
                      key={i}
                      disabled={k === '' || loading}
                      onClick={() => {
                        if (k === '⌫') { setPin(p => p.slice(0, -1)); setPinError(false) }
                        else if (typeof k === 'number' && pin.length < 4) {
                          const next = pin + k
                          setPin(next)
                          setPinError(false)
                        }
                      }}
                      className={`h-14 rounded-2xl text-xl font-semibold transition-colors
                        ${k === '' ? 'opacity-0 pointer-events-none' : loading ? 'opacity-40' : 'hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95'}`}
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirm}
                  disabled={pin.length < 4 || loading}
                  className={`mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {action === 'delete' ? 'Endgültig löschen' : 'Daten herunterladen'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
