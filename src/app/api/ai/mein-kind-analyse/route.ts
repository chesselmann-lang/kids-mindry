import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  // This is a parent-focused page
  const isParent = (profile as any)?.role === 'parent'
  if (!isParent) return NextResponse.json({ error: 'Eltern only' }, { status: 403 })

  // Get parent's children
  const { data: guardians } = await supabase
    .from('guardians').select('child_id, children(id, first_name, last_name, date_of_birth)')
    .eq('user_id', user.id)

  const children = (guardians ?? []).filter((g: any) => g.children).map((g: any) => g.children as any)
  if (children.length === 0) return NextResponse.json({ hinweise: [{ typ: 'info', text: 'Noch keine Kinder verknüpft.' }], stats: {} })

  const childIds = children.map((c: any) => c.id)

  // Attendance last 30 days
  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  const { data: attendance } = await supabase
    .from('attendance').select('child_id, date, status')
    .in('child_id', childIds).gte('date', since30)

  const att = (attendance ?? []) as any[]
  const presentDays = att.filter(a => a.status === 'present').length
  const sickDays = att.filter(a => a.status === 'absent_sick').length
  const totalDays = att.length

  // Latest daily report
  const { data: latestReport } = await (supabase as any)
    .from('daily_reports').select('child_id, report_date, mood, notes')
    .in('child_id', childIds).order('report_date', { ascending: false }).limit(1).maybeSingle()

  const moodMap: Record<string, string> = { great: 'super', good: 'gut', okay: 'ok', sad: 'traurig', sick: 'krank' }
  const latestMood = (latestReport as any)?.mood ? moodMap[(latestReport as any).mood] ?? '' : null

  const stats = { totalChildren: children.length, presentDays, sickDays, totalDays, latestMood }

  const client = new Anthropic()
  const prompt = `Du bist ein freundlicher Assistent für Eltern in einer Kita. Analysiere den aktuellen Stand für ${children.map((c: any) => c.first_name).join(' und ')}.

Letzte 30 Tage:
- Anwesenheitstage: ${presentDays} von ${totalDays}
- Krankmeldungen: ${sickDays}
- Letzte Stimmung: ${latestMood ?? 'nicht erfasst'}

Gib 2-3 kurze, freundliche Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"info"|"tipp"|"hinweis","text":"..."}]

Fokus: Wohlbefinden des Kindes, Anwesenheitsmuster, Elterntipps. Warmherziger Ton. Nur JSON, kein Markdown.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as any).text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const hinweise = JSON.parse(clean)

  return NextResponse.json({ hinweise, stats })
}
