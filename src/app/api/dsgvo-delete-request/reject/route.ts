import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Nur Admins können Löschanfragen ablehnen' }, { status: 403 })
  }

  const { requestId, reason } = await req.json()
  if (!requestId) return NextResponse.json({ error: 'requestId fehlt' }, { status: 400 })

  const { error } = await (supabase as any)
    .from('deletion_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason?.trim() || null,
      completed_at: new Date().toISOString(),
      completed_by: user.id,
    })
    .eq('id', requestId)
    .eq('status', 'pending')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
