import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Ausgehende Webhooks — sendet Events an registrierte Endpoints
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { event, payload } = await req.json()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Alle aktiven Webhook-Endpoints laden
  const { data: endpoints } = await (supabase as any)
    .from('webhook_endpoints')
    .select('id, url, secret, events')
    .eq('site_id', siteId)
    .eq('active', true)

  if (!endpoints || endpoints.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  await Promise.allSettled(
    endpoints
      .filter((ep: any) => !ep.events || ep.events.includes(event))
      .map(async (ep: any) => {
        const body = JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString(),
          site_id: siteId,
        })

        const signature = ep.secret
          ? 'sha256=' + crypto.createHmac('sha256', ep.secret).update(body).digest('hex')
          : undefined

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-KitaHub-Event': event,
        }
        if (signature) headers['X-KitaHub-Signature'] = signature

        const res = await fetch(ep.url, { method: 'POST', headers, body })

        // Status loggen
        await (supabase as any).from('webhook_deliveries').insert({
          endpoint_id: ep.id,
          event,
          status: res.ok ? 'success' : 'failed',
          status_code: res.status,
        })

        if (res.ok) sent++
      })
  )

  return NextResponse.json({ sent })
}

// GET — Webhook-Endpoints verwalten
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data } = await (supabase as any)
    .from('webhook_endpoints')
    .select('id, url, events, active, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
