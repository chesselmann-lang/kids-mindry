export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const Schema = z.object({
  payment_item_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const { payment_item_id } = parsed.data

  // Load payment item
  const { data: item } = await supabase
    .from('payment_items')
    .select('*')
    .eq('id', payment_item_id)
    .single()

  if (!item) return NextResponse.json({ error: 'Payment item not found' }, { status: 404 })

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, site_id')
    .eq('id', user.id)
    .single()

  let customerId: string
  const { data: existing } = await supabase
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    customerId = existing.customer_id!
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: (profile as any)?.full_name ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('stripe_customers').insert({ user_id: user.id, customer_id: customerId })
  }

  // Check if already paid
  const { data: existing_payment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('payment_item_id', payment_item_id)
    .eq('status', 'paid')
    .maybeSingle()

  if (existing_payment) {
    return NextResponse.json({ error: 'Already paid' }, { status: 409 })
  }

  // Create PaymentIntent
  const intent = await stripe.paymentIntents.create({
    amount: item.amount,
    currency: item.currency,
    customer: customerId,
    payment_method_types: ['card', 'sepa_debit', 'paypal'],
    metadata: {
      user_id: user.id,
      payment_item_id: item.id,
      site_id: item.site_id,
    },
    description: item.title,
  })

  // Insert pending payment record
  await supabase.from('payments').upsert({
    site_id: item.site_id,
    user_id: user.id,
    payment_item_id: item.id,
    stripe_payment_intent_id: intent.id,
    stripe_customer_id: customerId,
    amount: item.amount,
    currency: item.currency,
    status: 'pending',
    description: item.title,
  }, { onConflict: 'stripe_payment_intent_id' })

  return NextResponse.json({ client_secret: intent.client_secret })
}
