import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
    const isParent = (profile as any)?.role === 'parent'
    if (!isStaff && !isParent) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const childId = req.nextUrl.searchParams.get('childId')
    if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

    // Parent access check
    if (isParent) {
      const { data: g } = await supabase.from('guardians')
        .select('child_id').eq('user_id', user.id).eq('child_id', childId).maybeSingle()
      if (!g) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [{ data: child }, { data: records }] = await Promise.all([
      supabase.from('children').select('first_name, last_name, date_of_birth').eq('id', childId).single(),
      supabase.from('health_records').select('type, description, record_date, created_at')
        .eq('child_id', childId).order('record_date', { ascending: false }),
    ])

    if (!child) return NextResponse.json({ error: 'Kind nicht gefunden' }, { status: 404 })

    const recs = records ?? []
    const typeFreq: Record<string, number> = {}
    recs.forEach((r: any) => { typeFreq[r.type] = (typeFreq[r.type] ?? 0) + 1 })

    const vaccinations = recs.filter((r: any) => r.type === 'vaccination').length
    const diagnoses = recs.filter((r: any) => r.type === 'diagnosis').length
    const allergies = recs.filter((r: any) => r.type === 'allergy').length
    const lastRecord = recs[0]

    const age = (child as any).date_of_birth
      ? Math.floor((Date.now() - new Date((child as any).date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : null

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 450,
      messages: [{
        role: 'user',
        content: `Du bist medizinisch-pädagogische Fachkraft in einer Kita.

Gesundheitsakte: ${(child as any).first_name} ${(child as any).last_name}${age ? ` (${age} Jahre)` : ''}
Einträge gesamt: ${recs.length}
Impfungen: ${vaccinations}
Diagnosen: ${diagnoses}
Allergien: ${allergies}
Letzter Eintrag: ${lastRecord ? new Date(lastRecord.record_date || lastRecord.created_at).toLocaleDateString('de-DE') : 'keiner'}
Eintragstypen: ${JSON.stringify(typeFreq)}

Erstelle 2-3 Gesundheits-Hinweise als JSON:
[{"typ":"wichtig"|"hinweis"|"info","text":"..."}]

Fokus auf: Vollständigkeit, Auffälligkeiten, Vorsorge.
JSON only, kein Markdown. Keine medizinische Diagnose stellen.`,
      }],
    })

    const raw = (msg.content[0] as any).text
    const hinweise = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    return NextResponse.json({
      hinweise,
      stats: { total: recs.length, vaccinations, diagnoses, allergies },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
