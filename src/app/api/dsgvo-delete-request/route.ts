/**
 * POST /api/dsgvo-delete-request
 *
 * Allows a user to submit a DSGVO Art. 17 Recht auf Löschung request.
 * - Creates a deletion_requests record
 * - Notifies admins via in-app notification
 * - Auto-schedules deletion after 30 days (unless manually cancelled)
 *
 * DELETE /api/dsgvo-delete-request
 * Admin only: process (approve) a deletion request by deleting the user's data.
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reason } = await req.json().catch(() => ({ reason: '' }))

  // Check for existing open request
  const { data: existing } = await (supabase as any)
    .from('deletion_requests')
    .select('id, status, created_at')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      error: 'Sie haben bereits eine offene Löschanfrage.',
      existingId: existing.id,
    }, { status: 409 })
  }

  const { data: request, error } = await (supabase as any)
    .from('deletion_requests')
    .insert({
      user_id: user.id,
      reason: reason?.trim() || null,
      status: 'pending',
      scheduled_deletion_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify all admins of this site
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('site_id', siteId)
    .in('role', ['admin'])

  if (admins && admins.length > 0) {
    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single()
    const name = (profile as any)?.full_name ?? user.email ?? 'Ein Nutzer'

    await Promise.all(
      admins.map((a: any) =>
        (supabase as any).from('notifications').insert({
          user_id: a.id,
          type: 'dsgvo_request',
          title: 'DSGVO: Datenlöschanfrage eingegangen',
          body: `${name} hat eine Löschanfrage gestellt (Art. 17 DSGVO).`,
          data: { url: '/admin/datenschutz/loeschanfragen', requestId: request?.id },
        })
      )
    )
  }

  return NextResponse.json({ success: true, requestId: request?.id })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Nur Admins können Löschanfragen bearbeiten' }, { status: 403 })
  }

  const { requestId } = await req.json()
  if (!requestId) return NextResponse.json({ error: 'requestId fehlt' }, { status: 400 })

  // Get the request
  const { data: request } = await (supabase as any)
    .from('deletion_requests')
    .select('user_id, status')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 })
  if (request.status === 'completed') return NextResponse.json({ error: 'Bereits abgeschlossen' }, { status: 409 })

  const targetUserId = request.user_id

  // Anonymize user data (DSGVO compliant: replace personal data with anonymized values)
  // We don't hard-delete the auth user here — that requires admin service role
  // The admin must also delete the Supabase Auth user separately
  await Promise.all([
    // Clear profile PII
    supabase.from('profiles').update({
      full_name: '[Gelöscht]',
      phone: null,
      avatar_url: null,
    }).eq('id', targetUserId),

    // Remove guardianship links
    supabase.from('guardians').delete().eq('user_id', targetUserId),

    // Remove conversations participation (soft: anonymize messages)
    (supabase as any).from('messages').update({ body: '[Nachricht gelöscht]', meta: null })
      .eq('sender_id', targetUserId),

    // Mark request as completed
    (supabase as any).from('deletion_requests').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: user.id,
    }).eq('id', requestId),
  ])

  return NextResponse.json({ success: true, message: 'Nutzerdaten anonymisiert. Bitte Auth-Account in Supabase-Dashboard löschen.' })
}
