export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { month } = await req.json() // 'yyyy-MM'
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const monthDate = new Date(month + '-01T12:00:00')
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  const monthEndStr = monthEnd.toISOString().split('T')[0]
  const monthLabel = format(monthDate, 'MMMM yyyy', { locale: de })

  const { data: children } = await supabase
    .from('children').select('id, first_name').eq('site_id', siteId).eq('status', 'active')

  const childIds = (children ?? []).map((c: any) => c.id)

  const [
    { data: attendance },
    { data: events },
    { data: observations },
    { data: milestones },
    { data: reports },
  ] = await Promise.all([
    supabase.from('attendance').select('child_id, status')
      .eq('site_id', siteId).gte('date', monthStartStr).lte('date', monthEndStr),
    supabase.from('events').select('title, starts_at')
      .eq('site_id', siteId)
      .gte('starts_at', monthStart.toISOString()).lte('starts_at', monthEnd.toISOString())
      .order('starts_at').limit(10),
    childIds.length > 0
      ? (supabase as any).from('observations').select('content, category')
          .in('child_id', childIds)
          .gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString())
          .order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
    childIds.length > 0
      ? (supabase as any).from('milestones').select('title, children(first_name)')
          .in('child_id', childIds)
          .gte('achieved_at', monthStartStr).lte('achieved_at', monthEndStr).limit(10)
      : Promise.resolve({ data: [] }),
    childIds.length > 0
      ? supabase.from('daily_reports').select('notes, activities')
          .in('child_id', childIds)
          .gte('report_date', monthStartStr).lte('report_date', monthEndStr).limit(30)
      : Promise.resolve({ data: [] }),
  ])

  const totalChildren = (children ?? []).length
  const att = attendance ?? []
  const presentTotal = att.filter((a: any) => a.status === 'present').length
  const sickTotal = att.filter((a: any) => a.status === 'absent_sick').length

  const eventList = (events ?? [])
    .map((e: any) => `• ${format(new Date(e.starts_at), 'd. MMM', { locale: de })}: ${e.title}`)
    .join('\n')

  const obsList = (observations as any[] ?? []).slice(0, 6)
    .map((o: any) => `• ${o.content?.slice(0, 100)}`)
    .join('\n')

  const mileList = (milestones as any[] ?? [])
    .map((m: any) => `• ${m.children?.first_name}: ${m.title}`)
    .join('\n')

  const activities = [...new Set(
    (reports as any[] ?? []).filter((r: any) => r.activities).map((r: any) => r.activities?.slice(0, 60))
  )].slice(0, 5).join(', ')

  const prompt = `Schreibe einen warmen, informativen Monatsrückblick-Newsletter für die Eltern der Kita.
Monat: ${monthLabel}
Aktive Kinder: ${totalChildren}, Anwesenheitstage gesamt: ${presentTotal}, Kranktage gesamt: ${sickTotal}

Veranstaltungen des Monats:
${eventList || '– keine Veranstaltungen eingetragen'}

Pädagogische Highlights und Beobachtungen:
${obsList || '– keine Beobachtungen'}

Erreichte Meilensteine (Vornamen):
${mileList || '– keine'}

Hauptaktivitäten: ${activities || '– keine'}

Schreibe einen Newsletter-Text (5-7 Sätze) auf Deutsch:
- Beginne mit einem positiven Rückblick auf die schönsten Momente des Monats
- Erwähne Highlights, Aktivitäten und besondere Ereignisse konkret
- Beschreibe 1-2 pädagogische Schwerpunkte oder Gruppenbeobachtungen
- Schließe mit einem Ausblick auf den nächsten Monat oder einem herzlichen Abschluss
- Warmer, persönlicher Ton – wie ein Brief direkt vom Erzieherteam
- KEIN Betreff, KEINE Anrede, nur der Textkörper

Antworte NUR mit dem Brieftext.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (response.content[0] as any).text?.trim() ?? ''
    return NextResponse.json({ text, month, monthLabel })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
