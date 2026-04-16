import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/push-subscribe  — save a Web Push subscription
// DELETE /api/push-subscribe — remove a subscription (unsubscribe)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { endpoint, keys, userAgent } = await req.json()
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Ungültige Subscription-Daten' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles').select('site_id').eq('id', user.id).single()

    const { error } = await (supabase as any)
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        site_id: profile?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,endpoint' })

    if (error) {
      console.error('push_subscribe error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('push-subscribe POST error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Endpoint fehlt' }, { status: 400 })

    await (supabase as any)
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('push-subscribe DELETE error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
