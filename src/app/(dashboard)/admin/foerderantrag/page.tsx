'use client'

import { useState } from 'react'
import { Sparkles, FileText, Download, Loader2, ChevronDown, ChevronUp, Save } from 'lucide-react'

const ANTRAG_TYPEN = [
  { value: 'kibiz_betriebskosten', label: 'KiBiz Betriebskostenabrechnung (NRW)' },
  { value: 'kita_qualitaet', label: 'Qualitätsentwicklung nach KiföG' },
  { value: 'investition', label: 'Investitionskostenförderung' },
  { value: 'digitalisierung', label: 'Digitalisierungsförderung' },
  { value: 'inklusion', label: 'Inklusionsförderung' },
]

export default function FoerderantragPage() {
  const [form, setForm] = useState({
    antragTyp: 'kibiz_betriebskosten',
    jahr: new Date().getFullYear() - 1,
    kitaName: '',
    traegerName: '',
    plaetze: 25,
    belegung: 23,
    personalkosten: 420000,
    sachkosten: 85000,
    sonstigeKosten: 15000,
    elternbeitraege: 68000,
    sonstigeEinnahmen: 12000,
    bundesland: 'NRW',
    ansprechpartner: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ text: string; foerderbedarf: number; gesamtkosten: number; gesamteinnahmen: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/foerderantrag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setSaved(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!result) return
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Foerderantrag_${form.kitaName || 'Kita'}_${form.jahr}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printAntrag = () => {
    const win = window.open('', '_blank')
    if (!win || !result) return
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Förderantrag ${form.jahr}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #333; }
        h1 { font-size: 18px; } .meta { background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .meta table { width: 100%; } .meta td { padding: 2px 8px; }
        pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
        @media print { body { margin: 20px; } }
      </style>
    </head><body>
      <div class="meta">
        <table>
          <tr><td><strong>Einrichtung:</strong></td><td>${form.kitaName}</td><td><strong>Träger:</strong></td><td>${form.traegerName || '—'}</td></tr>
          <tr><td><strong>Antrag:</strong></td><td>${ANTRAG_TYPEN.find(t=>t.value===form.antragTyp)?.label}</td><td><strong>Jahr:</strong></td><td>${form.jahr}</td></tr>
          <tr><td><strong>Förderbedarf:</strong></td><td colspan="3"><strong>${result.foerderbedarf.toLocaleString('de-DE')} €</strong></td></tr>
        </table>
      </div>
      <pre>${result.text}</pre>
    </body></html>`)
    win.document.close()
    win.print()
  }

  const foerderbedarf = form.personalkosten + form.sachkosten + form.sonstigeKosten - form.elternbeitraege - form.sonstigeEinnahmen

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">KI-Förderantrag</h1>
        <p className="text-sm text-gray-400">Automatisch generierter Antrag auf Basis Ihrer Betriebsdaten</p>
      </div>

      <div className="card p-5 space-y-4">
        {/* Antrag-Typ */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antragsart</label>
          <select value={form.antragTyp} onChange={e => set('antragTyp', e.target.value)}
            className="mt-1 w-full input">
            {ANTRAG_TYPEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Kita-Name</label>
            <input value={form.kitaName} onChange={e => set('kitaName', e.target.value)}
              placeholder="z.B. Kita Sonnenschein" className="mt-1 w-full input" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Berichtsjahr</label>
            <input type="number" value={form.jahr} onChange={e => set('jahr', Number(e.target.value))}
              className="mt-1 w-full input" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Träger (optional)</label>
            <input value={form.traegerName} onChange={e => set('traegerName', e.target.value)}
              placeholder="z.B. AWO Ortsverband" className="mt-1 w-full input" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Bundesland</label>
            <select value={form.bundesland} onChange={e => set('bundesland', e.target.value)}
              className="mt-1 w-full input">
              {['NRW','Bayern','Baden-Württemberg','Niedersachsen','Hessen','Sachsen','Berlin','Hamburg'].map(l =>
                <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Kosteneingabe */}
        <div>
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm font-semibold text-brand-600">
            {showAdvanced ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            Betriebskosten & Einnahmen
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-gray-500">Personalkosten (€)</label>
              <input type="number" value={form.personalkosten} onChange={e => set('personalkosten', Number(e.target.value))}
                className="mt-1 w-full input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Sachkosten (€)</label>
              <input type="number" value={form.sachkosten} onChange={e => set('sachkosten', Number(e.target.value))}
                className="mt-1 w-full input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Sonstige Kosten (€)</label>
              <input type="number" value={form.sonstigeKosten} onChange={e => set('sonstigeKosten', Number(e.target.value))}
                className="mt-1 w-full input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Elternbeiträge (€)</label>
              <input type="number" value={form.elternbeitraege} onChange={e => set('elternbeitraege', Number(e.target.value))}
                className="mt-1 w-full input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Sonstige Einnahmen (€)</label>
              <input type="number" value={form.sonstigeEinnahmen} onChange={e => set('sonstigeEinnahmen', Number(e.target.value))}
                className="mt-1 w-full input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Belegung (Ø Kinder)</label>
              <input type="number" value={form.belegung} onChange={e => set('belegung', Number(e.target.value))}
                className="mt-1 w-full input" />
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="rounded-xl bg-brand-50 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-600 font-semibold">Berechneter Förderbedarf</p>
            <p className="text-xl font-bold text-brand-700">{foerderbedarf.toLocaleString('de-DE')} €</p>
          </div>
          <button onClick={generate} disabled={loading}
            className="btn-primary px-5 py-2.5 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>}
            {loading ? 'Generiere...' : 'KI-Antrag erstellen'}
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {result && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-brand-600"/>
              Generierter Antrag
            </h2>
            <div className="flex items-center gap-2">
              {saved && <span className="text-xs text-green-600 font-medium">✓ Gespeichert</span>}
              <button onClick={download}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 border border-gray-200 rounded-lg px-3 py-1.5">
                <Download size={13}/> TXT
              </button>
              <button onClick={printAntrag}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 border border-gray-200 rounded-lg px-3 py-1.5">
                <FileText size={13}/> Drucken / PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Gesamtkosten', value: result.gesamtkosten },
              { label: 'Einnahmen', value: result.gesamteinnahmen },
              { label: 'Förderbedarf', value: result.foerderbedarf },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-bold text-gray-900 text-sm">{value.toLocaleString('de-DE')} €</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {result.text}
            </pre>
          </div>

          <p className="text-xs text-gray-400 text-center">
            ⚠️ KI-generierter Entwurf — vor Einreichung bitte rechtlich prüfen lassen
          </p>
        </div>
      )}
    </div>
  )
}
