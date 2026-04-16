export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dayLabel = format(today, 'EEEE, d. MMMM yyyy', { locale: de })

  const [
    { data: attendance },
    { data: children },
    { data: reports },
    { data: incidents },
    { data: observations },
    { data: uebergaben },
  ] = await Promise.all([
    supabase.from('attendance').select('status')
      .eq('site_id', siteId).eq('date', todayStr),
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
    (supabase as any).from('daily_reports')
      .select('mood, activities, notes, sleep_hours, sleep_mins')
      .eq('site_id', siteId).eq('report_date', todayStr).limit(30),
    supabase.from('incidents').select('title, severity')
      .eq('site_id', siteId)
      .gte('created_at', today.toISOString().replace(/T.*/, 'T00:00:00Z'))
      .lte('created_at', today.toISOString().replace(/T.*/, 'T23:59:59Z')),
    supabase.from('observations').select('content, category')
      .eq('site_id', siteId)
      .gte('created_at', today.toISOString().replace(/T.*/, 'T00:00:00Z'))
      .lte('created_at', today.toISOString().replace(/T.*/, 'T23:59:59Z'))
      .limit(5),
    (supabase as any).from('uebergabe_eintraege')
      .select('content, shift')
      .eq('site_id', siteId).eq('datum', todayStr)
      .order('created_at', { ascending: false }).limit(3),
  ])

  const att = attendance ?? []
  const present = att.filter((a: any) => a.status === 'present').length
  const sick = att.filter((a: any) => a.status === 'absent_sick').length
  const total = (children ?? []).length

  const repArr = (reports ?? []) as any[]
  const moodCounts: Record<string, number> = {}
  repArr.forEach((r: any) => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1 })
  const moodMap: Record<string, string> = { great: '😄 Super', good: '🙂 Gut', okay: '😐 Ok', sad: '😢 Traurig', sick: '🤒 Krank' }
  const moodLine = Object.entries(moodCounts).map(([k, v]) => `${moodMap[k] ?? k}: ${v}×`).join(', ')

  const actSet = new Set<string>()
  repArr.forEach((r: any) => { if (r.activities) actSet.add(r.activities.slice(0, 60)) })
  const activitiesLine = [...actSet].slice(0, 4).join(', ') || '– keine'

  const incidentLines = (incidents ?? []).map((i: any) =>
    `• ${i.title}${i.severity === 'high' ? ' [ERNST]' : ''}`
  ).join('\n') || '– keine'

  const obsLines = (observations ?? []).map((o: any) =>
    `• [${o.category ?? 'allgemein'}] ${o.content?.slice(0, 80)}`
  ).join('\n') || '– keine'

  const uebergabeLines = (uebergaben ?? []).map((u: any) =>
    `• [${u.shift ?? 'allgemein'}] ${u.content?.slice(0, 80)}`
  ).join('\n') || '– keine'

  const prompt = `Erstelle eine kurze, professionelle Tages-Abschluss-Zusammenfassung für das Kita-Team.

Datum: ${dayLabel}
Kinder aktiv: ${total}, Anwesend heute: ${present}, Krank: ${sick}
Stimmungsbild (aus Tagesberichten): ${moodLine || 'keine Daten'}
Aktivitäten: ${activitiesLine}
Vorfälle: ${incidentLines}
Beobachtungen:
${obsLines}
Übergabenotizen:
${uebergabeLines}

Erstelle eine strukturierte Tages-Zusammenfassung mit:
1. Kurzes Tages-Highlight (1 Satz positiv)
2. Wichtige Hinweise für morgen (Vorfälle, kranke Kinder, Besonderes)
3. Kurze pädagogische Notiz (was lief gut)

Halte es kurz und praktisch (max. 100 Wörter gesamt).

Antworte NUR mit JSON:
{
  "highlight": "1 positiver Satz über den Tag",
  "hinweise": ["Hinweis 1", "Hinweis 2"],
  "paedagogik": "1 Satz pädagogische Notiz"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({ ...result, dayLabel, present, sick, total })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
