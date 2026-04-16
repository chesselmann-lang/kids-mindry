export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
  }

  const { id, status, internal_note, processed_by } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })

  const validStatuses = ['neu', 'in_bearbeitung', 'aufgenommen', 'abgelehnt', 'wartend']
  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { error } = await supabase
    .from('online_anmeldungen')
    .update({
      status: validStatuses.includes(status) ? status : 'in_bearbeitung',
      internal_note: internal_note?.trim() ?? null,
      processed_by,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('site_id', siteId)

  if (error) {
    console.error('Update anmeldung error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
