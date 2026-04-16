'use client'

import { useState } from 'react'
import { FileText, Send, Loader2, CheckCircle2, Euro, Calendar } from 'lucide-react'
import AiBescheide from './ai-bescheide'

const MONATE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']

export default function BescheideAdminPage() {
  const heute = new Date()
  const [monat, setMonat] = useState(heute.getMonth() + 1)
  const [jahr, setJahr] = useState(heute.getFullYear())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; monatLabel: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payments/bescheide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monat, jahr }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const druckMuster = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const monatName = MONATE[monat - 1]
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Elternbeitrag ${monatName} ${jahr}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:650px;margin:40px auto;font-size:13px;line-height:1.6;color:#333}
        h2{font-size:15px}
        .box{border:1px solid #ccc;padding:16px;margin:16px 0}
        .betrag{font-size:24px;font-weight:bold;text-align:right}
        .footer{font-size:11px;color:#777;margin-top:30px;border-top:1px solid #ccc;padding-top:12px}
        .sig{margin-top:50px;display:flex;justify-content:space-between}
        .sig div{text-align:center;width:180px;border-top:1px solid #333;padding-top:4px;font-size:11px}
      </style>
    </head><body>
      <p style="text-align:right">Datum: ${new Date().toLocaleDateString('de-DE')}</p>
      <h2>Elternbeitragsrechnung ${monatName} ${jahr}</h2>
      <div class="box">
        <table style="width:100%;border-collapse:collapse">
          <tr><td><strong>Einrichtung:</strong></td><td>KitaHub Einrichtung</td></tr>
          <tr><td><strong>Kind:</strong></td><td>[Kindname]</td></tr>
          <tr><td><strong>Erziehungsberechtigte/r:</strong></td><td>[Elternname]</td></tr>
          <tr><td><strong>Betreuungsmonat:</strong></td><td>${monatName} ${jahr}</td></tr>
        </table>
      </div>
      <div class="box">
        <table style="width:100%">
          <tr><td>Monatlicher Betreuungsbeitrag</td><td class="betrag">[Betrag] €</td></tr>
          <tr style="border-top:1px solid #ccc"><td><strong>Gesamtbetrag</strong></td><td class="betrag"><strong>[Betrag] €</strong></td></tr>
        </table>
      </div>
      <p><strong>Fälligkeit:</strong> 1. ${monatName} ${jahr}</p>
      <p><strong>Zahlungsweise:</strong> SEPA-Lastschrift — der Betrag wird automatisch eingezogen.</p>
      <div class="footer">
        Fragen zu dieser Rechnung? Wenden Sie sich an die Einrichtungsleitung.<br/>
        Generiert mit KitaHub am ${new Date().toLocaleDateString('de-DE')}.
      </div>
      <div class="sig">
        <div>${new Date().toLocaleDateString('de-DE')}<br/>Datum</div>
        <div>&nbsp;<br/>Einrichtungsleitung</div>
      </div>
    </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Monatsbescheide</h1>
        <p className="text-sm text-gray-400">Elternbeitragsrechnungen generieren & versenden</p>
      </div>

      <AiBescheide />

      <div className="card p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Zeitraum wählen</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Monat</label>
            <select value={monat} onChange={e => setMonat(Number(e.target.value))}
              className="mt-1 w-full input">
              {MONATE.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Jahr</label>
            <select value={jahr} onChange={e => setJahr(Number(e.target.value))}
              className="mt-1 w-full input">
              {[heute.getFullYear()-1, heute.getFullYear(), heute.getFullYear()+1].map(y =>
                <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={generate} disabled={loading}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : <FileText size={16}/>}
            {loading ? 'Generiere...' : `Bescheide für ${MONATE[monat-1]} ${jahr} erstellen`}
          </button>
          <button onClick={druckMuster}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:border-brand-300">
            Muster
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {result && (
        <div className="card p-5 bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-green-600 flex-shrink-0"/>
            <div>
              <p className="font-semibold text-green-900">
                {result.created} Bescheide für {result.monatLabel} erstellt
              </p>
              <p className="text-sm text-green-700">
                Alle Familien wurden erfasst. SEPA-Einzug läuft zum 1. des Monats.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info-Karte */}
      <div className="card p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Automatisierter Ablauf</p>
        {[
          { icon: FileText, text: 'Bescheide werden aus Betreuungsverträgen generiert' },
          { icon: Euro, text: 'Beträge nach Sozialstaffel-Einstellungen' },
          { icon: Send, text: 'SEPA-Einzug am 1. des Monats' },
          { icon: Calendar, text: 'Eltern sehen Bescheide in der App unter Zahlungen' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
            <Icon size={14} className="text-brand-600 flex-shrink-0"/>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
