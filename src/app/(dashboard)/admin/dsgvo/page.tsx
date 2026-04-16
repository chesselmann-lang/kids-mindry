'use client'

import { useState, useEffect } from 'react'
import { Shield, Trash2, AlertTriangle, Loader2, CheckCircle2, Eye } from 'lucide-react'

interface DryRunResult {
  stichtag3Jahre: string
  zuLoeschen: {
    kinderArchiviert: number
    kinder: { id: string; name: string; seit: string }[]
    tagesberichte: number
    onlineAnmeldungen: number
  }
}

export default function DsgvoLoeschungPage() {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<DryRunResult | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [done, setDone] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPreview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dsgvo/loeschen')
      const data = await res.json()
      setPreview(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const execute = async () => {
    if (!confirmed) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dsgvo/loeschen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DSGVO_LOESCHUNG_BESTAETIGT' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(data.geloescht)
      setPreview(null)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const total = preview
    ? (preview.zuLoeschen.kinderArchiviert + preview.zuLoeschen.tagesberichte + preview.zuLoeschen.onlineAnmeldungen)
    : 0

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={20} className="text-brand-600"/> DSGVO-Löschkonzept
        </h1>
        <p className="text-sm text-gray-400">Automatische Datenlöschung nach Aufbewahrungsfristen</p>
      </div>

      {/* Fristen-Übersicht */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 text-sm">Gesetzliche Aufbewahrungsfristen</h2>
        {[
          { label: 'Betreuungsunterlagen, Tagesberichte', frist: '3 Jahre nach Austritt', basis: 'SGB VIII' },
          { label: 'Zahlungsbelege, Rechnungen', frist: '10 Jahre', basis: '§ 257 HGB' },
          { label: 'Unfallberichte', frist: '30 Jahre', basis: 'BG/UV-Recht' },
          { label: 'Fotos (mit Einwilligung)', frist: 'Bis Widerruf, max. 3 J.', basis: 'DSGVO Art. 7' },
          { label: 'Online-Anmeldungen (abgelehnt)', frist: '3 Jahre', basis: 'DSGVO Art. 5' },
        ].map(({ label, frist, basis }) => (
          <div key={label} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{basis}</p>
            </div>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full whitespace-nowrap ml-3">{frist}</span>
          </div>
        ))}
      </div>

      {/* Preview / Vorschau */}
      {!done && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Lösch-Vorschau</h2>
            <button onClick={loadPreview} disabled={loading}
              className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold border border-brand-200 rounded-xl px-3 py-1.5 hover:bg-brand-50">
              {loading ? <Loader2 size={13} className="animate-spin"/> : <Eye size={13}/>}
              Vorschau laden
            </button>
          </div>

          {preview && (
            <>
              <p className="text-xs text-gray-500">Stichtag: Daten älter als <strong>{preview.stichtag3Jahre}</strong></p>

              {total === 0 ? (
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <CheckCircle2 size={28} className="mx-auto text-green-500 mb-1"/>
                  <p className="text-sm font-semibold text-green-800">Alles aktuell — kein Löschbedarf</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Kinder-Profile', value: preview.zuLoeschen.kinderArchiviert },
                      { label: 'Tagesberichte', value: preview.zuLoeschen.tagesberichte },
                      { label: 'Anmeldungen', value: preview.zuLoeschen.onlineAnmeldungen },
                    ].map(({ label, value }) => (
                      <div key={label} className={`rounded-xl p-3 ${value > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <p className="text-xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  {preview.zuLoeschen.kinder?.length > 0 && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {preview.zuLoeschen.kinder.map(k => (
                        <div key={k.id} className="flex justify-between py-1 border-b border-gray-50">
                          <span>{k.name}</span>
                          <span className="text-gray-400">archiviert seit {new Date(k.seit).toLocaleDateString('de-DE')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5"/>
                    <p className="text-xs text-amber-800">
                      <strong>Achtung:</strong> Diese Aktion ist unwiderruflich. Kinder-Profile werden anonymisiert, Tagesberichte und Anmeldungen dauerhaft gelöscht. Zahlungsbelege bleiben erhalten (10-Jahres-Frist).
                    </p>
                  </div>

                  <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
                      className="mt-0.5 accent-red-600" />
                    Ich bestätige, dass die Löschung gemäß DSGVO-Aufbewahrungsfristen durchgeführt werden soll und habe ein Backup geprüft.
                  </label>

                  <button onClick={execute} disabled={!confirmed || loading}
                    className="w-full py-3 rounded-2xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-red-700">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                    {loading ? 'Lösche...' : `${total} Datensätze jetzt löschen`}
                  </button>
                </>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      {done && (
        <div className="card p-6 bg-green-50 border border-green-200 text-center space-y-2">
          <CheckCircle2 size={40} className="mx-auto text-green-500"/>
          <h2 className="font-bold text-green-900">Löschung abgeschlossen</h2>
          <p className="text-sm text-green-700">
            {done.kinder} Kinder-Profile anonymisiert · {done.tagesberichte} Tagesberichte gelöscht · {done.anmeldungen} Anmeldungen gelöscht
          </p>
          <p className="text-xs text-green-600">Der Vorgang wurde im Audit-Log protokolliert.</p>
        </div>
      )}
    </div>
  )
}
