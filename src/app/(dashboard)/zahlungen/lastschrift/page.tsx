'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, IbanElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CheckCircle2, Loader2, CreditCard, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const IBAN_STYLE = {
  base: {
    color: '#1a1a1a',
    fontSize: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    '::placeholder': { color: '#9ca3af' },
  },
}

function SepaForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const ibanElement = elements.getElement(IbanElement)
    if (!ibanElement) return

    const result = await stripe.confirmSepaDebitSetup(clientSecret, {
      payment_method: {
        sepa_debit: ibanElement,
        billing_details: { name, email },
      },
    })

    if (result.error) {
      setError(result.error.message ?? 'Fehler beim Einrichten der Lastschrift')
      setLoading(false)
    } else {
      // Save mandate info
      const pm = result.setupIntent.payment_method as string
      await fetch('/api/payments/save-sepa-mandate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: pm }),
      })
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Vollständiger Name</label>
        <input
          className="input w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Max Mustermann"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">E-Mail</label>
        <input
          type="email"
          className="input w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="max@beispiel.de"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">IBAN</label>
        <div className="input p-3">
          <IbanElement options={{ supportedCountries: ['SEPA'], style: IBAN_STYLE }} />
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700 mb-1">SEPA-Lastschriftmandat</p>
        <p>Durch Bestätigung ermächtigen Sie die Kindertagesstätte, Zahlungen von Ihrem Konto
        einzuziehen. Sie haben das Recht, innerhalb von 8 Wochen, beginnend mit dem Belastungsdatum,
        die Erstattung des belasteten Betrages zu verlangen.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !email}
        className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
        Lastschriftmandat erteilen
      </button>
    </form>
  )
}

export default function SepaSetupPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [hasMandate, setHasMandate] = useState<{ last4?: string } | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payments/setup-sepa')
      .then(r => r.json())
      .then(data => {
        if (data.hasMandate) {
          setHasMandate(data)
        } else {
          // Get setup intent
          fetch('/api/payments/setup-sepa', { method: 'POST' })
            .then(r => r.json())
            .then(d => setClientSecret(d.clientSecret))
        }
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-brand-500" />
    </div>
  )

  if (success || hasMandate) return (
    <div className="max-w-md mx-auto py-8 px-4 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Lastschrift eingerichtet</h2>
      <p className="text-gray-500 text-sm mb-6">
        Ihre Kita-Gebühren werden zukünftig automatisch von Ihrem Konto eingezogen.
        {hasMandate?.last4 && ` (Konto endet auf ${hasMandate.last4})`}
      </p>
      <Link href="/zahlungen" className="btn-primary px-6 py-2 inline-block">
        Zurück zu Zahlungen
      </Link>
    </div>
  )

  if (!clientSecret) return null

  return (
    <div className="max-w-md mx-auto py-4 px-4 space-y-5">
      <Link href="/zahlungen" className="text-xs text-brand-600 flex items-center gap-1">
        <ArrowLeft size={14} /> Zurück
      </Link>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
          <CreditCard size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lastschrift einrichten</h1>
          <p className="text-sm text-gray-400">Einmalige Einrichtung — dann automatisch</p>
        </div>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <SepaForm clientSecret={clientSecret} onSuccess={() => setSuccess(true)} />
      </Elements>
    </div>
  )
}
