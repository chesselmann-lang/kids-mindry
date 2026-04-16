'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { CheckCircle2, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentItem {
  id: string
  title: string
  description: string | null
  amount: number
  currency: string
  due_date: string | null
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: submitErr } = await elements.submit()
    if (submitErr) { setError(submitErr.message ?? 'Fehler'); setLoading(false); return }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (confirmErr) {
      setError(confirmErr.message ?? 'Zahlung fehlgeschlagen')
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Wird verarbeitet…' : 'Jetzt bezahlen'}
      </button>
    </form>
  )
}

interface Props {
  item: PaymentItem
  onClose: () => void
  onPaid: () => void
}

export default function PaymentModal({ item, onClose, onPaid }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amount = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: item.currency.toUpperCase(),
  }).format(item.amount / 100)

  async function initPayment() {
    setLoading(true)
    const res = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_item_id: item.id }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setClientSecret(data.client_secret)
    setLoading(false)
  }

  function handleSuccess() {
    setPaid(true)
    setTimeout(() => { onPaid(); onClose() }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
            {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Amount */}
        <div className="bg-brand-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-brand-700">{amount}</p>
          {item.due_date && (
            <p className="text-xs text-brand-500 mt-1">
              Fällig: {new Date(item.due_date).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>

        {paid ? (
          <div className="flex flex-col items-center gap-2 py-4 text-green-600">
            <CheckCircle2 size={40} />
            <p className="font-semibold">Zahlung erfolgreich!</p>
          </div>
        ) : !clientSecret ? (
          <div className="space-y-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={initPayment}
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Zur Zahlung
            </button>
            <button onClick={onClose} className="w-full text-sm text-gray-400 py-1">Abbrechen</button>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#1A3C5E' } },
              locale: 'de',
            }}
          >
            <CheckoutForm onSuccess={handleSuccess} />
          </Elements>
        )}
      </div>
    </div>
  )
}
