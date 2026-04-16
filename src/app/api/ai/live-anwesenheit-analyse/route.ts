import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', user.id).single()
    const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
    if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
    const today = new Date().toISOString().split('T')[0]

    const [{ data: children }, { data: attendance }] = await Promise.all([
      supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
      supabase.from('attendance').select('status').eq('site_id', siteId).eq('date', today),
    ])

    const totalCount = (children ?? []).length
    const attList = attendance ?? []
    const presentCount = attList.filter((a: any) => a.status === 'present').length
    const absentSickCount = attList.filter((a: any) => a.status === 'absent_sick').length
    const absentVacCount = attList.filter((a: any) => a.status === 'absent_vacation').length
    const absentOtherCount = attList.filter((a: any) => a.status === 'absent_other').length
    const absentCount = absentSickCount + absentVacCount + absentOtherCount
    const unknownCount = totalCount - presentCount - absentCount
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    const prompt = `Du bist ein KI-Assistent für eine Kindertagesstätte. Analysiere die heutige Live-Anwesenheit:

Datum: ${today}
Gesamtkinder: ${totalCount}
Anwesend: ${presentCount} (${attendanceRate}%)
Abwesend krank: ${absentSickCount}
Abwesend Urlaub: ${absentVacCount}
Sonstig abwesend: ${absentOtherCount}
Noch unbekannt: ${unknownCount}

Gib 2-3 kurze, nützliche Hinweise für den Betrieb des Tages.
Antworte im JSON-Format: {"hinweise": [{"typ": "live|hinweis|info", "text": "..."}]}
Typ "live" = aktuelle Situation, "hinweis" = wichtiger Hinweis, "info" = allgemeine Info.
Nur JSON, kein Markdown.`

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
      stats: { presentCount, absentCount, unknownCount, totalCount, attendanceRate },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
