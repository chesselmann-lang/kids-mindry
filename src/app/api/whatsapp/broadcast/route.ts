import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { broadcastWhatsApp, sendWhatsApp } from '@/lib/whatsapp'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const Schema = z.object({
  message: z.string().min(1).max(1000),
  target: z.enum(['all', 'single']),
  phone: z.string().optional(),  // nur bei target=single
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = checkRateLimit(`whatsapp:${ip}`, 10, 60_000)
  if (!rl.ok) return rateLimitResponse(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('site_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'erzieher'].includes((profile as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const { message, target, phone } = parsed.data

  if (target === 'single') {
    if (!phone) return NextResponse.json({ error: 'Phone required for single target' }, { status: 400 })
    const result = await sendWhatsApp(phone, message)
    return NextResponse.json(result)
  }

  // Broadcast an alle Eltern der site
  const { data: profiles } = await supabase
    .from('profiles')
    .select('phone')
    .eq('site_id', (profile as any).site_id)
    .eq('role', 'parent')
    .not('phone', 'is', null)

  const phones = (profiles ?? []).map(p => (p as any).phone).filter(Boolean)
  if (phones.length === 0) return NextResponse.json({ sent: 0, failed: 0, info: 'No phone numbers found' })

  const result = await broadcastWhatsApp(phones, message)
  return NextResponse.json(result)
}
