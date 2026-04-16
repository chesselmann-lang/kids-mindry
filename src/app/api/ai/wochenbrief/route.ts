export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  // For parents (or staff previewing)
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')

  const { childId } = await req.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  // Access check for parents
  if (!isStaff) {
    const { data: guardian } = await supabase.from('guardians')
      .select('id').eq('user_id', user.id).eq('child_id', childId).maybeSingle()
    if (!guardian) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Last complete week (Mon–Fri)
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const fromStr = lastWeekStart.toISOString().split('T')[0]
  const toStr = lastWeekEnd.toISOString().split('T')[0]

  const [
    { data: child },
    { data: reports },
    { data: attendance },
    { data: milestones },
    { data: observations },
  ] = await Promise.all([
    supabase.from('children').select('first_name, last_name, date_of_birth').eq('id', childId).single(),
    supabase.from('daily_reports').select('report_date, mood, notes, activities, breakfast, lunch, snack, sleep_hours, sleep_mins')
      .eq('child_id', childId).gte('report_date', fromStr).lte('report_date', toStr).order('report_date'),
    supabase.from('attendance').select('date, status, check_in_at, check_out_at')
      .eq('child_id', childId).gte('date', fromStr).lte('date', toStr),
    (supabase as any).from('milestones').select('title, achieved_at, category')
      .eq('child_id', childId).gte('achieved_at', lastWeekStart.toISOString()).lte('achieved_at', lastWeekEnd.toISOString()),
    (supabase as any).from('observations').select('content, created_at')
      .eq('child_id', childId).gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
  ])

  if (!child) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const moodEmoji: Record<string, string> = { great: '😄', good: '🙂', okay: '😐', sad: '😢', sick: '🤒' }
  const dayNames: Record<string, string> = { '1': 'Mo', '2': 'Di', '3': 'Mi', '4': 'Do', '5': 'Fr' }

  const reportSummary = (reports ?? []).map((r: any) => {
    const d = new Date(r.report_date + 'T12:00:00')
    const day = dayNames[String(d.getDay())] ?? r.report_date
    const parts = [`${day}: ${moodEmoji[r.mood] ?? '🙂'}`]
    if (r.notes) parts.push(r.notes.slice(0, 100))
    if (r.activities) parts.push(`Aktivitäten: ${r.activities.slice(0, 60)}`)
    return parts.join(' — ')
  }).join('\n')

  const attSummary = (attendance ?? []).map((a: any) => {
    const d = new Date(a.date + 'T12:00:00')
    const day = dayNames[String(d.getDay())] ?? a.date
    return `${day}: ${a.status === 'present' ? 'anwesend' : a.status === 'absent_sick' ? 'krank' : 'abwesend'}`
  }).join(', ')

  const firstName = (child as any).first_name

  const prompt = `Schreibe einen warmherzigen, persönlichen Wochenbrief für die Eltern von ${firstName}.
Dieser Brief fasst die Woche aus Sicht des Kindes zusammen und soll die Eltern über Erlebnisse, Entwicklungen und Highlights informieren.

Tagesberichte der Woche:
${reportSummary || '– keine Berichte vorhanden'}

Anwesenheit:
${attSummary || '– keine Daten'}

Erreichte Meilensteine diese Woche:
${((milestones ?? []) as any[]).map((m: any) => `• ${m.title}`).join('\n') || '– keine'}

Pädagogische Beobachtungen:
${((observations ?? []) as any[]).map((o: any) => `• ${o.content?.slice(0, 120)}`).join('\n') || '– keine'}

Schreibe einen kurzen Brief (4-6 Sätze) auf Deutsch:
- Persönlich und warmherzig, als käme er direkt vom Erzieher
- Beginne mit einem Highlight der Woche
- Erwähne konkrete Beobachtungen und Aktivitäten
- Positive Formulierungen, Entwicklungsfortschritte betonen
- Kurzer Ausblick oder herzlicher Abschluss
- KEIN Betreff, KEINE Anrede, einfach der Textkörper

Antworte NUR mit dem Brieftext (kein JSON, keine Formatierung).`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (response.content[0] as any).text?.trim() ?? ''
    return NextResponse.json({ text, weekFrom: fromStr, weekTo: toStr, childName: firstName })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
