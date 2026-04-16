import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: guardians } = await supabase
    .from('guardians').select('child_id, children(first_name, last_name)').eq('user_id', user.id)

  const children = ((guardians ?? []) as any[]).filter(g => g.children).map(g => g.children)
  const childIds = children.map((c: any) => c.id)

  if (childIds.length === 0) return NextResponse.json({ hinweise: [], stats: { absenceCount: 0, childCount: 0 } })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: absences } = await supabase
    .from('attendance')
    .select('child_id, date, status, absence_note')
    .in('child_id', childIds)
    .neq('status', 'present')
    .neq('status', 'unknown')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const absenceList = (absences ?? []) as any[]
  const absenceCount = absenceList.length
  const sickCount = absenceList.filter(a => a.status === 'absent_sick').length
  const vacationCount = absenceList.filter(a => a.status === 'absent_vacation').length
  const childNames = children.map((c: any) => `${c.first_name} ${c.last_name}`).join(', ')

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent fuer Eltern. Gib 3 kurze Hinweise basierend auf den Fehlzeiten der letzten 30 Tage auf Deutsch.

Kinder: ${childNames || '(keine)'}
Fehlzeiten gesamt: ${absenceCount}
Davon krank: ${sickCount}
Urlaub/Reise: ${vacationCount}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "muster"|"tipp"|"info", "text": "..."}
  ],
  "stats": {
    "absenceCount": ${absenceCount},
    "sickCount": ${sickCount},
    "childCount": ${children.length}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
