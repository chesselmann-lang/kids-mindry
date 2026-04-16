export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-03-25.dahlia' })
}

const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_ID ?? '',
    yearly: process.env.STRIPE_STARTER_YEARLY_ID ?? '',
  },
  professional: {
    monthly: process.env.STRIPE_PRO_MONTHLY_ID ?? '',
    yearly: process.env.STRIPE_PRO_YEARLY_ID ?? '',
  },
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'REPLACE_ME') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const { planId, jaehrlich } = await req.json()
  const priceIds = PRICE_IDS[planId]
  if (!priceIds) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const priceId = jaehrlich ? priceIds.yearly : priceIds.monthly
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 503 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      locale: 'de',
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: planId === 'professional' ? 14 : 0,
        metadata: { planId },
      },
      metadata: { planId },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
