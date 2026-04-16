// src/app/api/stripe/webhook/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-03-25.dahlia' })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      // ─── Checkout abgeschlossen → Abo anlegen ───────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const siteId = session.metadata?.site_id
        const plan = session.metadata?.plan ?? 'professional'

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const subAny = subscription as any
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null

        await supabase.from('subscriptions').upsert({
          site_id: siteId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: subscription.status,
          trial_ends_at: trialEnd,
          current_period_start: subAny.current_period_start
            ? new Date(subAny.current_period_start * 1000).toISOString()
            : null,
          current_period_end: subAny.current_period_end
            ? new Date(subAny.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'site_id' })

        console.log(`✅ Subscription created for site ${siteId}: ${plan}`)
        break
      }

      // ─── Abo aktualisiert (Plan-Wechsel, Verlängerung) ──────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const subAny = sub as any
        const planNickname = sub.items.data[0]?.price?.nickname?.toLowerCase() ?? 'professional'

        await supabase.from('subscriptions')
          .update({
            status: sub.status,
            plan: planNickname.includes('starter') ? 'starter'
              : planNickname.includes('traeger') ? 'traeger' : 'professional',
            trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
            current_period_start: subAny.current_period_start
              ? new Date(subAny.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subAny.current_period_end
              ? new Date(subAny.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)

        console.log(`🔄 Subscription updated: ${sub.id} → ${sub.status}`)
        break
      }

      // ─── Abo gekündigt / abgelaufen ─────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        await supabase.from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)

        console.log(`❌ Subscription canceled: ${sub.id}`)
        break
      }

      // ─── Zahlung erfolgreich ─────────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription ?? invoice.subscription_id
        if (!subscriptionId) break

        await supabase.from('subscriptions')
          .update({
            status: 'active',
            last_payment_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId as string)

        console.log(`💰 Payment succeeded for subscription: ${subscriptionId}`)
        break
      }

      // ─── Zahlung fehlgeschlagen ──────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription ?? invoice.subscription_id
        if (!subscriptionId) break

        await supabase.from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId as string)

        console.log(`⚠️ Payment failed for subscription: ${subscriptionId}`)
        break
      }

      // ─── Trial läuft aus ────────────────────────────────────────────────
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        console.log(`⏰ Trial ending soon for subscription: ${sub.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
