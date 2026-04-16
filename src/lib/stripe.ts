import Stripe from 'stripe'

// Lazy singleton — avoids build-time crash when STRIPE_SECRET_KEY is absent
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Proxy so callers can use `stripe.customers.create(...)` unchanged
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string) {
    return (getStripe() as unknown as Record<string, unknown>)[prop]
  },
})

export function formatAmount(cents: number, currency = 'eur') {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}
