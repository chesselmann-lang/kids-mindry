export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, addDays } from 'date-fns'
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

  const { topic } = await req.json() // optional topic hint

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const in30Days = addDays(today, 30).toISOString().split('T')[0]
  const fourteenAgo = new Date(today); fourteenAgo.setDate(fourteenAgo.getDate() - 14)
  const fourteenAgoStr = fourteenAgo.toISOString().split('T')[0]

  const [
    { data: upcomingEvents },
    { data: recentActivities },
    { data: openOrders },
    { data: siteName },
  ] = await Promise.all([
    supabase.from('events').select('title, starts_at, description')
      .eq('site_id', siteId)
      .gte('starts_at', today.toISOString())
      .lte('starts_at', new Date(in30Days).toISOString())
      .order('starts_at').limit(8),
    supabase.from('observations').select('content, created_at')
      .eq('site_id', siteId)
      .gte('created_at', fourteenAgo.toISOString())
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('material_orders').select('title, description')
      .eq('site_id', siteId).eq('status', 'pending').limit(3),
    supabase.from('sites').select('name').eq('id', siteId).single(),
  ])

  const kitaName = (siteName as any)?.name ?? 'Unsere Kita'
  const dateStr = format(today, 'd. MMMM yyyy', { locale: de })

  const eventLines = (upcomingEvents ?? []).map((e: any) => {
    const d = format(new Date(e.starts_at), 'EEEE, d. MMM', { locale: de })
    return `• ${e.title} (${d})${e.description ? ': ' + e.description.slice(0, 80) : ''}`
  }).join('\n')

  const activityLines = (recentActivities ?? []).slice(0, 3).map((o: any) =>
    `• ${o.content?.slice(0, 100)}`
  ).join('\n')

  const topicHint = topic ? `\nThema/Anlass: ${topic}` : ''

  const prompt = `Du bist eine freundliche Kita-Leiterin und schreibst einen Newsletter an die Eltern.

Kita: ${kitaName}
Datum: ${dateStr}${topicHint}

Bevorstehende Veranstaltungen (nächste 30 Tage):
${eventLines || '– keine eingetragen'}

Aktivitäten der letzten 2 Wochen (Auszug):
${activityLines || '– keine'}

Schreibe einen freundlichen, informativen Eltern-Newsletter. Regeln:
- Herzliche Begrüßung ("Liebe Eltern,")
- Kurzer Rückblick auf Aktivitäten (1 Absatz)
- Bevorstehende Termine und Veranstaltungen (als Aufzählung)
- Freundlicher Abschluss mit Dank
- Sprache: freundlich-informell, warm, positiv, nicht zu formell
- Länge: 150-250 Wörter

Antworte NUR mit JSON:
{"titel": "Betreff des Newsletters", "zusammenfassung": "Kurze Vorschau (1 Satz)", "inhalt": "Der vollständige Newsletter-Text"}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
