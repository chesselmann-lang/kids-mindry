import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rate limiting: max 10 check-ins per IP per minute
const rateLimitMap = new Map<string, { count: number; reset: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 })
    return false
  }
  if (entry.count >= 10) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { childId, action } = await req.json()
  if (!childId || !['in', 'out'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Use service role to update attendance without user auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify child exists and is active
  const { data: child } = await supabase
    .from('children')
    .select('id, site_id, status')
    .eq('id', childId)
    .eq('status', 'active')
    .single()

  if (!child) return NextResponse.json({ error: 'Kind nicht gefunden' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  if (action === 'in') {
    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        child_id: childId,
        site_id: child.site_id,
        date: today,
        status: 'present',
        check_in_at: now,
      }, { onConflict: 'child_id,date' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out_at: now })
      .eq('child_id', childId)
      .eq('date', today)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
}
