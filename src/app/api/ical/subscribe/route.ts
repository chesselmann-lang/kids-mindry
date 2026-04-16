import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// POST /api/ical/subscribe → creates a subscription token and returns subscribe URLs
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const token = randomBytes(24).toString('hex')

  await supabase.from('ical_tokens').upsert({
    user_id: user.id,
    site_id: siteId,
    token,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,site_id' })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'
  const url = `${baseUrl}/api/ical/${token}`

  return NextResponse.json({
    url,
    googleUrl: `https://www.google.com/calendar/render?cid=${encodeURIComponent(url)}`,
    outlookUrl: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(url)}`,
  })
}

// GET /api/ical/subscribe → get existing token for user
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data } = await supabase
    .from('ical_tokens')
    .select('token')
    .eq('user_id', user.id)
    .eq('site_id', siteId)
    .single()

  if (!data) return NextResponse.json({ url: null })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'
  const url = `${baseUrl}/api/ical/${data.token}`

  return NextResponse.json({
    url,
    googleUrl: `https://www.google.com/calendar/render?cid=${encodeURIComponent(url)}`,
    outlookUrl: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(url)}`,
  })
}
