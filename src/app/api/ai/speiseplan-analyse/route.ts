export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, startOfWeek } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const MEALS = ['breakfast', 'lunch', 'snack']
const DAY_LABEL: Record<string, string> = { monday: 'Mo', tuesday: 'Di', wednesday: 'Mi', thursday: 'Do', friday: 'Fr' }
const MEAL_LABEL: Record<string, string> = { breakfast: 'Frühstück', lunch: 'Mittagessen', snack: 'Snack' }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { weekStart: weekStartParam } = await req.json()

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Determine week start
  let weekStartDate: Date
  if (weekStartParam) {
    weekStartDate = new Date(weekStartParam + 'T00:00:00')
  } else {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    weekStartDate = new Date(now)
    weekStartDate.setDate(now.getDate() + diff)
    weekStartDate.setHours(0, 0, 0, 0)
  }
  const weekStartStr = weekStartDate.toISOString().split('T')[0]
  const weekLabel = format(weekStartDate, 'dd. MMMM yyyy', { locale: de })

  const { data: plan } = await (supabase as any)
    .from('meal_plans')
    .select('*')
    .eq('site_id', siteId)
    .eq('week_start', weekStartStr)
    .maybeSingle()

  if (!plan) {
    return NextResponse.json({ error: 'Kein Speiseplan für diese Woche gefunden.' }, { status: 404 })
  }

  // Also get allergies across active children
  const { data: children } = await supabase
    .from('children').select('allergies').eq('site_id', siteId).eq('status', 'active')

  const allergySet = new Set<string>()
  for (const c of (children ?? []) as any[]) {
    if (Array.isArray(c.allergies)) c.allergies.forEach((a: string) => allergySet.add(a))
  }
  const allergyList = [...allergySet].join(', ') || 'keine bekannt'

  // Format meal plan
  const mealLines: string[] = []
  for (const day of DAYS) {
    const dayMeals: string[] = []
    for (const meal of MEALS) {
      const val = plan[`${day}_${meal}`]
      if (val && val.trim()) dayMeals.push(`${MEAL_LABEL[meal]}: ${val.trim()}`)
    }
    if (dayMeals.length > 0) mealLines.push(`${DAY_LABEL[day]}: ${dayMeals.join(' | ')}`)
  }
  const planText = mealLines.join('\n') || '– Speiseplan leer'

  const prompt = `Analysiere den folgenden Kita-Speiseplan pädagogisch-ernährungswissenschaftlich.

Woche: ${weekLabel}
Bekannte Allergien in der Gruppe: ${allergyList}

Speiseplan:
${planText}

Bewerte den Speiseplan nach:
1. Ausgewogenheit (Nährstoffe, Obst/Gemüse, Proteine, Kohlenhydrate)
2. Abwechslung und Wiederholungen
3. Allergierisiken (basierend auf bekannten Allergien)
4. Kindgerechte Portionierung und Gerichte

Gib 3-4 konkrete Erkenntnisse und Empfehlungen.

Antworte NUR mit JSON-Array:
[
  {"typ": "positiv"|"hinweis"|"warnung", "titel": "Kurztitel", "text": "1-2 Sätze"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const bewertung = JSON.parse(clean)
    return NextResponse.json({ bewertung: Array.isArray(bewertung) ? bewertung : [], weekLabel })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
