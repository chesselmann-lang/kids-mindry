/**
 * POST /api/parental-controls/save
 * Upsert parental controls for a child (screen time, KJM filter, weekly report).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_RATINGS = ['0+', '3+', '6+', '10+', '12+', '16+', '18+']

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    child_id,
    daily_limit_minutes,
    max_age_rating,
    weekly_report_enabled,
    weekly_report_email,
  } = body

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

  // Validate inputs
  const limit = Number(daily_limit_minutes ?? 60)
  if (isNaN(limit) || limit < 0 || limit > 1440) {
    return NextResponse.json({ error: 'Ungültiges Zeitlimit' }, { status: 400 })
  }
  const rating = String(max_age_rating ?? '6+')
  if (!VALID_RATINGS.includes(rating)) {
    return NextResponse.json({ error: 'Ungültige Altersfreigabe' }, { status: 400 })
  }

  const { error } = await (supabase as any)
    .from('parental_controls')
    .upsert({
      child_id,
      parent_id: user.id,
      daily_limit_minutes: limit,
      max_age_rating: rating,
      weekly_report_enabled: !!weekly_report_enabled,
      weekly_report_email: weekly_report_enabled ? (weekly_report_email ?? user.email) : null,
    }, {
      onConflict: 'child_id',
      ignoreDuplicates: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit log
  try {
    const { data: profile } = await supabase.from('profiles').select('site_id').eq('id', user.id).single()
    await (supabase as any).from('audit_log').insert({
      actor_id: user.id,
      action: 'parental_controls_updated',
      target_type: 'child',
      target_id: child_id,
      site_id: (profile as any)?.site_id ?? null,
      metadata: { daily_limit_minutes: limit, max_age_rating: rating, weekly_report_enabled: !!weekly_report_enabled },
    })
  } catch { /* audit must not block */ }

  return NextResponse.json({ success: true })
}
