'use client'

import { useState } from 'react'
import { Save, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useParams } from 'next/navigation'
import AiSismik from './ai-sismik'
import AiSismikAuswertung from './ai-sismik-auswertung'

// SISMIK — Sprachverhalten und Interesse an Sprache bei Migrantenkindern in Kindertageseinrichtungen
// Vereinfachte Version der offiziellen Beobachtungsbögen

const SISMIK_BEREICHE = [
  {
    id: 'sprechfreude',
    titel: 'Sprechfreude & Sprachliche Aktivität',
    items: [
      'Das Kind spricht von sich aus andere Kinder an.',
      'Das Kind beteiligt sich aktiv an Gruppenerzählungen.',
      'Das Kind stellt Fragen auf Deutsch.',
      'Das Kind erzählt spontan von Erlebnissen.',
      'Das Kind singt oder spricht Reime mit.',
    ]
  },
  {
    id: 'verstehen',
    titel: 'Sprachverstehen',
    items: [
      'Das Kind versteht einfache Aufforderungen.',
      'Das Kind versteht komplexere Anweisungen.',
      'Das Kind versteht Wortbedeutungen im Kontext.',
      'Das Kind versteht Geschichten beim Vorlesen.',
    ]
  },
  {
    id: 'aussprache',
    titel: 'Aussprache & Grammatik',
    items: [
      'Das Kind spricht deutlich und verständlich.',
      'Das Kind bildet einfache Sätze korrekt.',
      'Das Kind verwendet Plural- und Kasusformen.',
      'Das Kind nutzt Zeitformen angemessen.',
    ]
  },
  {
    id: 'schrift',
    titel: 'Interesse an Schrift & Büchern',
    items: [
      'Das Kind zeigt Interesse an Bilderbüchern.',
      'Das Kind erkennt seinen Namen schriftlich.',
      'Das Kind interessiert sich für Buchstaben.',
    ]
  }
]

const SKALA = ['0 – nicht beobachtet', '1 – selten', '2 – manchmal', '3 – häufig', '4 – immer/sehr häufig']

export default function SismikPage() {
  const { childId } = useParams<{ childId: string }>()
  const [werte, setWerte] = useState<Record<string, number>>({})
  const [notizen, setNotizen] = useState<Record<string, string>>({})
  const [beobachter, setBeobachter] = useState('')
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0])
  const [open, setOpen] = useState<Record<string, boolean>>({ sprechfreude: true })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key: string, val: number) => setWerte(w => ({ ...w, [key]: val }))

  const gesamtScore = () => {
    const vals = Object.values(werte).filter(v => v !== undefined)
    if (vals.length === 0) return null
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/kinder/sismik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, datum, beobachter, werte, notizen }),
      })
      setSaved(true)
    } catch {}
    setSaving(false)
  }

  const drucken = () => {
    const score = gesamtScore()
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <title>SISMIK Beobachtungsbogen</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:750px;margin:30px auto;font-size:13px;color:#333;line-height:1.5}
        h1{font-size:16px}h2{font-size:14px;margin-top:20px;border-bottom:1px solid #ccc;padding-bottom:4px}
        table{width:100%;border-collapse:collapse;margin:8px 0}
        th{background:#f5f5f5;padding:6px 8px;text-align:left;font-size:12px}
        td{padding:6px 8px;border-bottom:1px solid #eee;font-size:12px}
        .score{background:#e8f5e9;padding:12px;text-align:center;font-size:20px;font-weight:bold;margin:16px 0}
        .sig{margin-top:50px;display:flex;justify-content:space-between}
        .sig div{text-align:center;width:180px;border-top:1px solid #333;padding-top:4px;font-size:11px}
      </style>
    </head><body>
      <h1>SISMIK — Sprachbeobachtungsbogen</h1>
      <p><strong>Beobachter/in:</strong> ${beobachter || '—'} &nbsp;&nbsp; <strong>Datum:</strong> ${datum}</p>
      ${score !== null ? `<div class="score">Gesamtmittelwert: ${score} / 4.0</div>` : ''}
      ${SISMIK_BEREICHE.map(bereich => `
        <h2>${bereich.titel}</h2>
        <table>
          <tr><th>Beobachtung</th><th>Wert (0–4)</th></tr>
          ${bereich.items.map((item, i) => {
            const key = `${bereich.id}_${i}`
            return `<tr><td>${item}</td><td>${werte[key] !== undefined ? `${werte[key]} – ${SKALA[werte[key]]?.split('–')[1]?.trim() ?? ''}` : '—'}</td></tr>`
          }).join('')}
          ${notizen[bereich.id] ? `<tr><td colspan="2"><em>Notiz: ${notizen[bereich.id]}</em></td></tr>` : ''}
        </table>
      `).join('')}
      <div class="sig">
        <div>${datum}<br/>Datum</div>
        <div>&nbsp;<br/>Unterschrift</div>
      </div>
    </body></html>`)
    win.document.close()
    win.print()
  }

  const score = gesamtScore()

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">SISMIK</h1>
        <p className="text-sm text-gray-400">Sprachbeobachtungsbogen für mehrsprachige Kinder</p>
      </div>

      <AiSismik />

      <div className="card p-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500">Beobachter/in</label>
          <input value={beobachter} onChange={e => setBeobachter(e.target.value)}
            placeholder="Name der Erzieherin" className="mt-1 w-full input" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Beobachtungsdatum</label>
          <input type="date" value={datum} onChange={e => setDatum(e.target.value)}
            className="mt-1 w-full input" />
        </div>
      </div>

      {score !== null && (
        <div className="card p-4 flex items-center justify-between bg-green-50 border border-green-200">
          <div>
            <p className="text-xs font-semibold text-green-700">Aktueller Gesamtmittelwert</p>
            <p className="text-2xl font-bold text-green-800">{score} <span className="text-sm font-normal">/ 4.0</span></p>
          </div>
          <div className="h-16 w-16">
            <svg viewBox="0 0 36 36">
              <path d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
              <path d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32" fill="none" stroke="#16a34a" strokeWidth="3"
                strokeDasharray={`${score/4*100} 100`} strokeLinecap="round"
                transform="rotate(-90 18 18)"/>
              <text x="18" y="21" textAnchor="middle" fontSize="8" fill="#166534" fontWeight="bold">{score}</text>
            </svg>
          </div>
        </div>
      )}

      {SISMIK_BEREICHE.map(bereich => (
        <div key={bereich.id} className="card overflow-hidden">
          <button
            onClick={() => setOpen(o => ({ ...o, [bereich.id]: !o[bereich.id] }))}
            className="w-full p-4 flex items-center justify-between text-left">
            <span className="font-semibold text-gray-900 text-sm">{bereich.titel}</span>
            {open[bereich.id] ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
          </button>

          {open[bereich.id] && (
            <div className="px-4 pb-4 space-y-4">
              {bereich.items.map((item, i) => {
                const key = `${bereich.id}_${i}`
                return (
                  <div key={i}>
                    <p className="text-sm text-gray-700 mb-2">{item}</p>
                    <div className="grid grid-cols-5 gap-1">
                      {[0, 1, 2, 3, 4].map(v => (
                        <button key={v}
                          onClick={() => set(key, v)}
                          className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            werte[key] === v
                              ? 'bg-brand-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {v}
                        </button>
                      ))}
                    </div>
                    {werte[key] !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">{SKALA[werte[key]]}</p>
                    )}
                  </div>
                )
              })}
              <div>
                <label className="text-xs font-semibold text-gray-500">Notizen zu diesem Bereich</label>
                <textarea value={notizen[bereich.id] ?? ''} rows={2}
                  onChange={e => setNotizen(n => ({ ...n, [bereich.id]: e.target.value }))}
                  className="mt-1 w-full input resize-none text-sm" />
              </div>
            </div>
          )}
        </div>
      ))}

      <AiSismikAuswertung werte={werte} bereiche={SISMIK_BEREICHE} />

      <div className="flex gap-3">
        <button onClick={save} disabled={saving}
          className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
          {saved ? '✓ Gespeichert' : 'Speichern'}
        </button>
        <button onClick={drucken}
          className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:border-brand-300">
          <FileText size={16}/> PDF
        </button>
      </div>
    </div>
  )
}
