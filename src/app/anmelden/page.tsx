'use client'

import { useState } from 'react'
import { Baby, CheckCircle2, ChevronRight, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const BETREUUNGSZEITEN = ['25 Std./Woche', '35 Std./Woche', '45 Std./Woche']
const BETREUUNGSARTEN = ['Krippe (0–3 Jahre)', 'Kindergarten (3–6 Jahre)', 'Hort (Grundschulkind)']

type Step = 'kind' | 'eltern' | 'wunsch' | 'success'

export default function AnmeldenPage() {
  const [step, setStep] = useState<Step>('kind')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    // Kind
    kindVorname: '',
    kindNachname: '',
    kindGeburtsdatum: '',
    betreuungsart: 'Kindergarten (3–6 Jahre)',
    // Eltern
    elternName: '',
    email: '',
    telefon: '',
    adresse: '',
    // Wunsch
    wunschDatum: '',
    betreuungszeit: '35 Std./Woche',
    geschwisterkind: false,
    anmerkungen: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/anmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler')
      setStep('success')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4"/>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Anmeldung eingegangen!</h1>
          <p className="text-gray-500 text-sm mb-2">
            Wir haben die Anmeldung für <strong>{form.kindVorname}</strong> erhalten und melden uns in Kürze bei <strong>{form.email}</strong>.
          </p>
          <p className="text-gray-400 text-xs">
            Ihre Anmeldung wurde auf unsere Warteliste gesetzt. Sobald ein Platz frei wird, nehmen wir Kontakt auf.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center">
          <span className="text-2xl font-black text-brand-700 tracking-tight">KitaHub</span>
          <p className="text-sm text-gray-500 mt-1">Online-Anmeldung</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1">
          {(['kind', 'eltern', 'wunsch'] as Step[]).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              step === s ? 'bg-brand-600' :
              (['eltern','wunsch'].indexOf(step) > i - 1 ? 'bg-brand-200' : 'bg-gray-200')
            }`}/>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          {/* Step 1: Kind */}
          {step === 'kind' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Baby size={16} className="text-brand-600"/>
                </div>
                <h2 className="font-bold text-gray-900">Angaben zum Kind</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Vorname *</label>
                  <input value={form.kindVorname} onChange={e => set('kindVorname', e.target.value)}
                    className="mt-1 w-full input" placeholder="Max" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Nachname *</label>
                  <input value={form.kindNachname} onChange={e => set('kindNachname', e.target.value)}
                    className="mt-1 w-full input" placeholder="Mustermann" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Geburtsdatum *</label>
                <input type="date" value={form.kindGeburtsdatum} onChange={e => set('kindGeburtsdatum', e.target.value)}
                  className="mt-1 w-full input" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Betreuungsart</label>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {BETREUUNGSARTEN.map(b => (
                    <button key={b} onClick={() => set('betreuungsart', b)}
                      className={`py-2.5 px-3 rounded-xl text-sm text-left border transition-colors ${
                        form.betreuungsart === b
                          ? 'bg-brand-50 border-brand-400 text-brand-700 font-medium'
                          : 'border-gray-200 text-gray-600'
                      }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('eltern')}
                disabled={!form.kindVorname || !form.kindNachname || !form.kindGeburtsdatum}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40">
                Weiter <ChevronRight size={18}/>
              </button>
            </>
          )}

          {/* Step 2: Eltern */}
          {step === 'eltern' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep('kind')} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={18}/>
                </button>
                <h2 className="font-bold text-gray-900">Kontaktdaten</h2>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Name (Erziehungsberechtigte/r) *</label>
                <input value={form.elternName} onChange={e => set('elternName', e.target.value)}
                  className="mt-1 w-full input" placeholder="Erika Mustermann" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">E-Mail *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="mt-1 w-full input" placeholder="erika@beispiel.de" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Telefon</label>
                <input type="tel" value={form.telefon} onChange={e => set('telefon', e.target.value)}
                  className="mt-1 w-full input" placeholder="+49 151 12345678" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Adresse</label>
                <input value={form.adresse} onChange={e => set('adresse', e.target.value)}
                  className="mt-1 w-full input" placeholder="Musterstraße 1, 12345 Musterstadt" />
              </div>

              <button
                onClick={() => setStep('wunsch')}
                disabled={!form.elternName || !form.email}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40">
                Weiter <ChevronRight size={18}/>
              </button>
            </>
          )}

          {/* Step 3: Wünsche */}
          {step === 'wunsch' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep('eltern')} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={18}/>
                </button>
                <h2 className="font-bold text-gray-900">Betreuungswunsch</h2>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Gewünschter Betreuungsstart</label>
                <input type="date" value={form.wunschDatum} onChange={e => set('wunschDatum', e.target.value)}
                  className="mt-1 w-full input" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Betreuungsumfang</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {BETREUUNGSZEITEN.map(b => (
                    <button key={b} onClick={() => set('betreuungszeit', b)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                        form.betreuungszeit === b
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-gray-200 text-gray-600'
                      }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.geschwisterkind} onChange={e => set('geschwisterkind', e.target.checked)}
                  className="rounded accent-brand-600" />
                Geschwisterkind bereits in dieser Kita
              </label>

              <div>
                <label className="text-xs font-semibold text-gray-500">Anmerkungen (optional)</label>
                <textarea value={form.anmerkungen} rows={3}
                  onChange={e => set('anmerkungen', e.target.value)}
                  className="mt-1 w-full input resize-none text-sm"
                  placeholder="Allergien, besondere Bedürfnisse, Fragen..." />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button onClick={submit} disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>}
                {loading ? 'Wird gesendet...' : 'Anmeldung abschicken'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Mit der Anmeldung stimmen Sie der Verarbeitung Ihrer Daten gemäß DSGVO zu.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
