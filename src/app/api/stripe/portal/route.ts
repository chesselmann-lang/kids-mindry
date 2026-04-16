// src/app/api/stripe/portal/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-03-25.dahlia' })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!profile) return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 })

  if (!['admin'].includes(profile.role ?? '')) {
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('site_id', profile.site_id as string)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'Kein aktives Abonnement gefunden' }, { status: 404 })
  }

  const { returnUrl } = await req.json().catch(() => ({}))
  const returnURL = returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'}/admin/abonnement`

  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: returnURL,
  })

  return NextResponse.json({ url: session.url })
}
