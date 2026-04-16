import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 })
  if (!['admin','educator','group_lead'].includes(profile.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { childId, datum, beobachter, werte, notizen } = await req.json()

  const vals = Object.values(werte as Record<string,number>)
  const gesamtscore = vals.length
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100
    : null

  const { data, error } = await supabase
    .from('sismik_beobachtungen')
    .insert({
      site_id: profile.site_id,
      child_id: childId,
      beobachter_id: user.id,
      beobachter_name: beobachter,
      datum,
      werte,
      notizen,
      gesamtscore,
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = req.nextUrl.searchParams.get('childId')
  const query = supabase
    .from('sismik_beobachtungen')
    .select('*')
    .order('datum', { ascending: false })
  if (childId) query.eq('child_id', childId)

  const { data } = await query.limit(50)
  return NextResponse.json(data ?? [])
}
