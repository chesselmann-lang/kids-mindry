/**
 * POST /api/consent/revoke
 * Revoke parental consent for a child (Art. 7 Abs. 3 DSGVO).
 * Sets revoked_at on the parental_consent record.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { child_id } = await req.json()
  if (!child_id) return NextResponse.json({ error: 'child_id erforderlich' }, { status: 400 })

  // Verify guardian
  const { data: guardian } = await supabase
    .from('guardians')
    .select('id')
    .eq('child_id', child_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!guardian) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await (supabase as any)
    .from('parental_consent')
    .update({ revoked_at: new Date().toISOString() })
    .eq('child_id', child_id)
    .eq('guardian_id', user.id)
    .is('revoked_at', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit log
  try {
    const { data: profile } = await supabase.from('profiles').select('site_id').eq('id', user.id).single()
    await (supabase as any).from('audit_log').insert({
      actor_id: user.id,
      action: 'consent_revoked',
      target_type: 'child',
      target_id: child_id,
      site_id: (profile as any)?.site_id ?? null,
      metadata: { guardian: user.email, reason: 'parent_revocation' },
    })
  } catch { /* audit failure must not block */ }

  return NextResponse.json({ success: true })
}
