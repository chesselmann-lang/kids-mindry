export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const { data: tasks } = await supabase
    .from('staff_tasks')
    .select('id, title, description, priority, status, due_date, assigned_to, profiles!assigned_to(full_name)')
    .eq('site_id', siteId)
    .neq('status', 'done')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(30)

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({
      hinweise: [],
      message: 'Keine offenen Aufgaben vorhanden. Alles erledigt! 🎉',
    })
  }

  const now = new Date()
  const overdue = tasks.filter((t: any) => t.due_date && new Date(t.due_date) < now)
  const dueSoon = tasks.filter((t: any) => {
    if (!t.due_date) return false
    const d = differenceInDays(new Date(t.due_date), now)
    return d >= 0 && d <= 3
  })
  const highPriority = tasks.filter((t: any) => t.priority === 'high')

  const taskLines = tasks.slice(0, 20).map((t: any) => {
    const assignee = (t.profiles as any)?.full_name ?? 'niemand'
    const dueStr = t.due_date
      ? format(new Date(t.due_date), 'd. MMM', { locale: de })
      : 'kein Datum'
    const overFlag = t.due_date && new Date(t.due_date) < now ? ' ⚠️ÜBERFÄLLIG' : ''
    return `• [${t.priority ?? 'normal'}] ${t.title} → ${assignee}, Fällig: ${dueStr}${overFlag}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin und analysierst die offenen Aufgaben deines Teams.

Datum: ${format(now, "d. MMMM yyyy", { locale: de })}
Offene Aufgaben gesamt: ${tasks.length}
Überfällig: ${overdue.length}
Fällig in 3 Tagen: ${dueSoon.length}
Hohe Priorität: ${highPriority.length}

Aufgabenliste:
${taskLines}

Gib 3-4 konkrete Hinweise zur Aufgabenverwaltung. Antworte NUR mit JSON-Array:
[
  {"typ": "positiv"|"hinweis"|"warnung", "titel": "Kurztitel", "text": "1-2 Sätze mit konkreter Handlungsempfehlung"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const hinweise = JSON.parse(clean)
    return NextResponse.json({
      hinweise: Array.isArray(hinweise) ? hinweise : [],
      stats: { total: tasks.length, overdue: overdue.length, dueSoon: dueSoon.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
