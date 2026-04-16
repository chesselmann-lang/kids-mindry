import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role, full_name, phone').eq('id', user.id).single()
    const isParent = (profile as any)?.role === 'parent'

    let childCount = 0
    let attendanceCount = 0
    let reportCount = 0

    if (isParent) {
      const { data: guardianships } = await supabase.from('guardians').select('child_id').eq('user_id', user.id)
      const childIds = (guardianships ?? []).map((g: any) => g.child_id)
      childCount = childIds.length
      if (childIds.length > 0) {
        const [att, rpts] = await Promise.all([
          supabase.from('attendance').select('id', { count: 'exact', head: true }).in('child_id', childIds),
          supabase.from('daily_reports').select('id', { count: 'exact', head: true }).in('child_id', childIds),
        ])
        attendanceCount = (att as any).count ?? 0
        reportCount = (rpts as any).count ?? 0
      }
    }

    const { data: deletionReq } = await (supabase as any)
      .from('deletion_requests').select('status').eq('user_id', user.id).in('status', ['pending', 'approved']).maybeSingle()

    const prompt = `Du bist ein datenschutzfreundlicher KI-Assistent für eine Kindertagesstätte. Erkläre dem Nutzer seine DSGVO-Rechte basierend auf seinem Kontext:

Rolle: ${(profile as any)?.role ?? 'Unbekannt'}
Gespeicherte Datensätze: Profil (1), Kinder (${childCount}), Anwesenheitseinträge (${attendanceCount}), Tagesberichte (${reportCount})
Löschanfrage aktiv: ${deletionReq ? 'Ja (' + deletionReq.status + ')' : 'Nein'}

Gib 2-3 kurze, verständliche Hinweise zu DSGVO-Rechten und was der Nutzer wissen sollte.
Antworte im JSON-Format: {"hinweise": [{"typ": "recht|info|tipp", "text": "..."}]}
Typ "recht" = konkretes DSGVO-Recht, "info" = nützliche Info, "tipp" = Handlungsempfehlung.
Nur JSON, kein Markdown. Verweise nicht auf externe Dienste.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as any).text
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({
      ...parsed,
      stats: { childCount, attendanceCount, reportCount, hasDeletionRequest: !!deletionReq },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
