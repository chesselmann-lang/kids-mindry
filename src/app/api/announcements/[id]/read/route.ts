import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/announcements/[id]/read — mark announcement as read
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  await supabase.from('announcement_reads').upsert({
    announcement_id: params.id,
    user_id: user.id,
    read_at: new Date().toISOString(),
  }, { onConflict: 'announcement_id,user_id' })

  return NextResponse.json({ ok: true })
}

// GET /api/announcements/[id]/read — admin: who has read this?
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isStaff = ['admin', 'educator', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: reads, count } = await supabase
    .from('announcement_reads')
    .select('user_id, read_at, profiles(full_name)', { count: 'exact' })
    .eq('announcement_id', params.id)
    .order('read_at', { ascending: false })

  return NextResponse.json({ reads: reads ?? [], count: count ?? 0 })
}
