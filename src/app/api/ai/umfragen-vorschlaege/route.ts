import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Du bist Kita-Pädagogin. Gib 6 konkrete Ideen für sinnvolle Elternumfragen in einer Kita.
Antworte NUR als JSON: {"vorschlaege":[{"typ":"zufriedenheit"|"ernaehrung"|"programm"|"kommunikation"|"sicherheit","text":"...","fragenbeispiel":"..."}]}
- zufriedenheit: Allgemeine Betreuungsqualität
- ernaehrung: Essen und Ernährung
- programm: Aktivitäten und pädagogisches Programm
- kommunikation: Informationsfluss zwischen Kita und Eltern
- sicherheit: Sicherheit und Gesundheit
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
