import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE_ID      = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'

/**
 * POST /api/feed/announcements
 *
 * Create a new announcement and trigger push notifications to site members.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await (supabase as any)
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { title, body, groupId, pinned, imageUrl } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titel fehlt' }, { status: 400 })

  const { data: announcement, error } = await (supabase as any)
    .from('announcements')
    .insert({
      site_id: SITE_ID,
      author_id: user.id,
      title: title.trim(),
      body: body?.trim() || null,
      group_id: groupId || null,
      pinned: pinned ?? false,
      image_url: imageUrl || null,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire-and-forget push to all site subscribers (no recipientIds = broadcast)
  fetch(`${SUPABASE_URL}/functions/v1/push-notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      siteId: SITE_ID,
      title,
      body: body ? (body.length > 100 ? body.slice(0, 100) + '…' : body) : undefined,
      url: `${APP_URL}/feed`,
      sourceType: 'announcement',
      sourceId: announcement?.id,
    }),
  }).catch(() => {/* non-fatal */})

  return NextResponse.json({ success: true, id: announcement?.id })
}

/**
 * GET /api/feed/announcements?offset=0&limit=15&siteId=...
 *
 * Returns paginated announcements. Respects parent group visibility.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10))
  const limit  = Math.min(30, parseInt(searchParams.get('limit') ?? '15', 10))
  const siteId = searchParams.get('siteId') ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')

  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('site_id', siteId)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (!isStaff) {
    const { data: guardians } = await supabase
      .from('guardians')
      .select('children(group_id)')
      .eq('user_id', user.id)

    const parentGroupIds = (guardians ?? [])
      .flatMap((g: any) => g.children ? [g.children.group_id] : [])
      .filter(Boolean) as string[]

    if (parentGroupIds.length > 0) {
      query = query.or(`group_id.is.null,group_id.in.(${parentGroupIds.join(',')})`)
    } else {
      query = query.is('group_id', null)
    }
  }

  const { data: announcements, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    announcements: announcements ?? [],
    total: count ?? 0,
    offset,
    limit,
    hasMore: (count ?? 0) > offset + limit,
  })
}
