export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// POST /api/payments/setup-sepa → creates a SetupIntent for SEPA Direct Debit
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Get or create Stripe customer
  let { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .eq('site_id', siteId)
    .single()

  let customerId = customer?.stripe_customer_id

  if (!customerId) {
    const { data: profile } = await supabase
      .from('profiles').select('full_name, email').eq('id', user.id).single()

    const stripeCustomer = await stripe.customers.create({
      email: (profile as any)?.email ?? undefined,
      name: (profile as any)?.full_name ?? undefined,
      metadata: { userId: user.id, siteId },
    })
    customerId = stripeCustomer.id

    await supabase.from('stripe_customers').upsert({
      user_id: user.id,
      site_id: siteId,
      stripe_customer_id: customerId,
    }, { onConflict: 'user_id,site_id' })
  }

  // Create SetupIntent for SEPA debit
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['sepa_debit'],
    usage: 'off_session',
    metadata: { userId: user.id, siteId },
  })

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
    customerId,
  })
}

// GET /api/payments/setup-sepa → check if SEPA mandate exists
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id, sepa_mandate_id, sepa_last4, sepa_bank_code')
    .eq('user_id', user.id)
    .eq('site_id', siteId)
    .single()

  if (!customer?.sepa_mandate_id) {
    return NextResponse.json({ hasMandate: false })
  }

  return NextResponse.json({
    hasMandate: true,
    last4: customer.sepa_last4,
    bankCode: customer.sepa_bank_code,
  })
}
