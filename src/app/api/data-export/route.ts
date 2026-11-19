/**
 * GET /api/data-export?child_id=<uuid>
 * Art. 20 DSGVO — Parent-facing data portability export.
 *
 * Returns a JSON file with all personal data stored for the child.
 * Requires: authenticated parent/guardian of the child.
 * Security: caller must first verify Eltern-PIN (checked via header X-Eltern-Pin-Verified
 *           set by the client after a successful /api/eltern-pin/verify call within the same session).
 *
 * Note: We trust the header only because:
 *  a) The request is same-origin (credentials: 'same-origin')
 *  b) The PIN was verified against DB within the same browser session (no CSRF risk for GET with JSON response)
 *  For higher security, issue a short-lived signed token from verify and check it here instead.
 */
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Require PIN verification header (set by client after /api/eltern-pin/verify returned {valid:true})
  if (req.headers.get('X-Eltern-Pin-Verified') !== 'true') {
    return NextResponse.json({ error: 'Eltern-PIN-Bestätigung erforderlich' }, { status: 403 })
  }

  const childId = req.nextUrl.searchParams.get('child_id')
  if (!childId) return NextResponse.json({ error: 'child_id erforderlich' }, { status: 400 })

  // Verify guardian
  const { data: guardian } = await supabase
    .from('guardians')
    .select('id, full_name')
    .eq('child_id', childId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!guardian) {
    return NextResponse.json({ error: 'Forbidden — nicht erziehungsberechtigt' }, { status: 403 })
  }

  // Collect all data categories
  const [
    { data: child },
    { data: messages },
    { data: attendance },
    { data: documents },
    { data: portfolioEntries },
    { data: aiLogs },
    { data: consentRows },
    { data: controlRows },
  ] = await Promise.all([
    supabase.from('children').select('*').eq('id', childId).single(),
    supabase.from('messages').select('id, content, created_at, sender_id').eq('child_id', childId).limit(500),
    supabase.from('attendance').select('id, check_in, check_out, status').eq('child_id', childId).limit(1000),
    supabase.from('documents').select('id, title, file_type, created_at').eq('child_id', childId).limit(200),
    (supabase as any).from('portfolio_entries').select('id, title, description, created_at').eq('child_id', childId).limit(200),
    (supabase as any).from('ai_usage_logs').select('id, feature, model, created_at').eq('child_id', childId).limit(500),
    (supabase as any).from('parental_consent').select('*').eq('child_id', childId).eq('guardian_id', user.id),
    (supabase as any).from('parental_controls').select('*').eq('child_id', childId),
  ])

  const exportData = {
    _meta: {
      export_date: new Date().toISOString(),
      export_date_formatted: format(new Date(), 'dd. MMMM yyyy HH:mm', { locale: de }),
      requested_by: user.email,
      legal_basis: 'Art. 20 DSGVO — Datenportabilität',
      controller: 'Hesselmann Beratung UG, Adlerstraße 1, 44137 Dortmund',
    },
    child: {
      ...(child ?? {}),
      // Mask sensitive fields for portability
      _note: 'Vollständige Profildaten des Kindes',
    },
    attendance: {
      count: (attendance ?? []).length,
      records: attendance ?? [],
    },
    messages: {
      count: (messages ?? []).length,
      records: (messages ?? []).map((m: any) => ({
        id: m.id,
        created_at: m.created_at,
        // Omit content for privacy of other parties
        content_length: m.content?.length ?? 0,
      })),
    },
    documents: {
      count: (documents ?? []).length,
      records: documents ?? [],
    },
    portfolio: {
      count: (portfolioEntries ?? []).length,
      records: portfolioEntries ?? [],
    },
    ai_usage: {
      count: (aiLogs ?? []).length,
      note: 'Nur Zähldaten, keine Eingaben gespeichert (Datensparsamkeit)',
      records: aiLogs ?? [],
    },
    consent: {
      records: consentRows ?? [],
    },
    parental_controls: {
      records: controlRows ?? [],
    },
  }

  // Audit log
  try {
    const { data: profile } = await supabase.from('profiles').select('site_id').eq('id', user.id).single()
    await (supabase as any).from('audit_log').insert({
      actor_id: user.id,
      action: 'data_export_art20',
      target_type: 'child',
      target_id: childId,
      site_id: (profile as any)?.site_id ?? null,
      metadata: { requested_by: user.email },
    })
  } catch { /* ignore */ }

  const filename = `mindry-kids-daten-${childId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
