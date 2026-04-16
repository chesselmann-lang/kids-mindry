import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET: list of monthly notices
// POST: generate notices for a given month
export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('elternbeitrags_bescheide')
    .select('*, profiles(full_name, email)')
    .order('erstellt_am', { ascending: false })
    .limit(100)

  return NextResponse.json(data ?? [])
}

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
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { monat, jahr } = await req.json()
  // monat: 1-12, jahr: 2025

  // Alle aktiven Familien mit Betreuungsvertrag
  const { data: children } = await supabase
    .from('children')
    .select('id, name, guardian_id, monthly_fee')
    .eq('site_id', profile.site_id)
    .not('guardian_id', 'is', null)

  if (!children?.length) return NextResponse.json({ created: 0 })

  const monatLabel = `${String(monat).padStart(2, '0')}/${jahr}`
  let created = 0

  for (const child of children) {
    const betrag = child.monthly_fee ?? 0
    const { error } = await supabase
      .from('elternbeitrags_bescheide')
      .upsert({
        child_id: child.id,
        guardian_id: child.guardian_id,
        site_id: profile.site_id,
        monat: monat,
        jahr: jahr,
        monat_label: monatLabel,
        betrag,
        status: 'erstellt',
        erstellt_am: new Date().toISOString(),
        erstellt_von: user.id,
      }, { onConflict: 'child_id,monat,jahr' })

    if (!error) created++
  }

  return NextResponse.json({ created, monatLabel })
}
