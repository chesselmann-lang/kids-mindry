'use client'

import { useState } from 'react'
import { Calculator, FileText, Euro, Info } from 'lucide-react'

// German Sozialstaffel tables (simplified, NRW-Standard)
const STAFFEL_NRW = [
  { bis: 20000, beitrag: 0, label: 'beitragsfrei' },
  { bis: 25000, beitrag: 50, label: 'Stufe 1' },
  { bis: 30000, beitrag: 100, label: 'Stufe 2' },
  { bis: 37500, beitrag: 150, label: 'Stufe 3' },
  { bis: 45000, beitrag: 200, label: 'Stufe 4' },
  { bis: 55000, beitrag: 250, label: 'Stufe 5' },
  { bis: 70000, beitrag: 325, label: 'Stufe 6' },
  { bis: 90000, beitrag: 400, label: 'Stufe 7' },
  { bis: 999999, beitrag: 450, label: 'Höchstbeitrag' },
]

// Zuschläge für Betreuungszeit
const ZEIT_FAKTOREN = [
  { stunden: 25, faktor: 0.75, label: '25 Std./Woche' },
  { stunden: 35, faktor: 1.0, label: '35 Std./Woche (Vollzeit)' },
  { stunden: 45, faktor: 1.2, label: '45 Std./Woche (erweitert)' },
]

function berechne(einkommen: number, stunden: number, geschwister: boolean, buT: boolean) {
  const stufe = STAFFEL_NRW.find(s => einkommen <= s.bis) ?? STAFFEL_NRW[STAFFEL_NRW.length - 1]
  const zeitFaktor = ZEIT_FAKTOREN.find(z => z.stunden === stunden)?.faktor ?? 1.0
  let betrag = Math.round(stufe.beitrag * zeitFaktor)
  if (geschwister) betrag = Math.round(betrag * 0.5)
  if (buT) betrag = 0
  return { betrag, stufe: stufe.label, basis: stufe.beitrag }
}

export default function SozialstaffelPage() {
  const [einkommen, setEinkommen] = useState(40000)
  const [stunden, setStunden] = useState(35)
  const [geschwister, setGeschwister] = useState(false)
  const [buT, setBuT] = useState(false)
  const [kindName, setKindName] = useState('')
  const [elternName, setElternName] = useState('')
  const [showBescheid, setShowBescheid] = useState(false)

  const result = berechne(einkommen, stunden, geschwister, buT)

  const druckBescheid = () => {
    const heute = new Date().toLocaleDateString('de-DE')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Elternbeitragsbescheid</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;line-height:1.7;color:#333;font-size:14px}
        h2{font-size:16px;border-bottom:2px solid #333;padding-bottom:8px}
        .meta{margin:20px 0;border:1px solid #ccc;padding:16px}
        .meta table{width:100%;border-collapse:collapse}
        .meta td{padding:4px 8px;border-bottom:1px solid #eee}
        .betrag{font-size:28px;font-weight:bold;color:#1a1a1a;text-align:center;padding:20px;background:#f5f5f5;margin:20px 0}
        .legal{font-size:11px;color:#666;margin-top:30px;border-top:1px solid #ccc;padding-top:16px}
        .sig{margin-top:60px;display:flex;justify-content:space-between}
        .sig div{text-align:center;width:200px;border-top:1px solid #333;padding-top:4px;font-size:12px}
      </style>
    </head><body>
      <h2>Bescheid über den Elternbeitrag für die Kindertagesbetreuung</h2>
      <div class="meta">
        <table>
          <tr><td><strong>Einrichtung:</strong></td><td>KitaHub Einrichtung</td></tr>
          <tr><td><strong>Kind:</strong></td><td>${kindName || '—'}</td></tr>
          <tr><td><strong>Erziehungsberechtigte/r:</strong></td><td>${elternName || '—'}</td></tr>
          <tr><td><strong>Betreuungszeit:</strong></td><td>${stunden} Stunden/Woche</td></tr>
          <tr><td><strong>Jahreseinkommen (§ 90 SGB VIII):</strong></td><td>${einkommen.toLocaleString('de-DE')} €</td></tr>
          <tr><td><strong>Einkommensstufe:</strong></td><td>${result.stufe}</td></tr>
          <tr><td><strong>Geschwisterkind-Ermäßigung:</strong></td><td>${geschwister ? 'Ja (50%)' : 'Nein'}</td></tr>
          <tr><td><strong>Bildungs- und Teilhabepaket:</strong></td><td>${buT ? 'Ja (beitragsfrei)' : 'Nein'}</td></tr>
          <tr><td><strong>Ausstellungsdatum:</strong></td><td>${heute}</td></tr>
        </table>
      </div>
      <div class="betrag">
        Monatlicher Elternbeitrag: ${result.betrag.toLocaleString('de-DE')} €
      </div>
      <p>Der monatliche Elternbeitrag wird jeweils zum 1. des Monats fällig und ist bis zum 5. des laufenden Monats zu entrichten.</p>
      ${buT ? '<p><strong>Hinweis:</strong> Der Elternbeitrag wird vollständig durch Leistungen nach dem Bildungs- und Teilhabepaket (BuT) übernommen.</p>' : ''}
      ${geschwister ? '<p><strong>Geschwisterkind-Ermäßigung:</strong> Gemäß Satzung wird für das zweite und jedes weitere Kind eine Ermäßigung von 50% gewährt.</p>' : ''}
      <p><strong>Rechtsbehelfsbelehrung:</strong> Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch eingelegt werden.</p>
      <div class="legal">
        Grundlage: § 90 SGB VIII i.V.m. der Satzung über die Erhebung von Elternbeiträgen. Die Einkommensfeststellung erfolgte auf Basis der vorgelegten Nachweise für das Vorjahr.
      </div>
      <div class="sig">
        <div>${heute}<br/>Datum</div>
        <div>&nbsp;<br/>Unterschrift / Stempel</div>
      </div>
    </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sozialstaffel-Rechner</h1>
        <p className="text-sm text-gray-400">Elternbeitrag berechnen & Bescheid generieren</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Name des Kindes</label>
            <input value={kindName} onChange={e => setKindName(e.target.value)}
              placeholder="Max Mustermann" className="mt-1 w-full input" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Erziehungsberechtigte/r</label>
            <input value={elternName} onChange={e => setElternName(e.target.value)}
              placeholder="Erika Mustermann" className="mt-1 w-full input" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">
            Jahreseinkommen (§ 90 SGB VIII): <strong>{einkommen.toLocaleString('de-DE')} €</strong>
          </label>
          <input type="range" min="0" max="120000" step="2500"
            value={einkommen} onChange={e => setEinkommen(Number(e.target.value))}
            className="mt-2 w-full accent-brand-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span><span>60.000 €</span><span>120.000 €</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Betreuungszeit</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {ZEIT_FAKTOREN.map(z => (
              <button key={z.stunden}
                onClick={() => setStunden(z.stunden)}
                className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                  stunden === z.stunden
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 text-gray-600 hover:border-brand-300'
                }`}>
                {z.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={geschwister} onChange={e => setGeschwister(e.target.checked)}
              className="rounded accent-brand-600" />
            Geschwisterkind (50% Ermäßigung)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={buT} onChange={e => setBuT(e.target.checked)}
              className="rounded accent-brand-600" />
            BuT-berechtigt (beitragsfrei)
          </label>
        </div>
      </div>

      {/* Result */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Euro size={22} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Berechneter Monatsbeitrag</p>
            <p className="text-3xl font-bold text-gray-900">{result.betrag.toLocaleString('de-DE')} €</p>
          </div>
          <div className="ml-auto text-right">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">{result.stufe}</span>
            <p className="text-xs text-gray-400 mt-1">Jahresbeitrag: {(result.betrag * 12).toLocaleString('de-DE')} €</p>
          </div>
        </div>

        {/* Staffel-Tabelle */}
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 text-gray-500 font-semibold">Einkommensstufe</th>
                <th className="text-left p-2 text-gray-500 font-semibold">Bis Einkommen</th>
                <th className="text-right p-2 text-gray-500 font-semibold">Beitrag/Monat</th>
              </tr>
            </thead>
            <tbody>
              {STAFFEL_NRW.map((s, i) => (
                <tr key={i} className={`border-t border-gray-50 ${s.label === result.stufe ? 'bg-brand-50' : ''}`}>
                  <td className="p-2 font-medium text-gray-700">{s.label}</td>
                  <td className="p-2 text-gray-500">{s.bis >= 999999 ? 'unbegrenzt' : `bis ${s.bis.toLocaleString('de-DE')} €`}</td>
                  <td className="p-2 text-right font-semibold text-gray-900">{s.beitrag} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
          <Info size={12}/> Richtwerte NRW — kommunale Satzung beachten
        </div>

        <button onClick={druckBescheid}
          className="mt-4 w-full btn-primary py-3 flex items-center justify-center gap-2">
          <FileText size={16}/> Bescheid drucken / als PDF speichern
        </button>
      </div>
    </div>
  )
}
