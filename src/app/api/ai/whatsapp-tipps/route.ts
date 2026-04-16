import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'educator', 'group_lead'].includes(profile?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist Kommunikationsberater für eine Kita.
Gib 5 kurze, praxisnahe Tipps für effektive WhatsApp-Broadcast-Nachrichten an Kita-Eltern.
Antworte NUR als JSON: {"hinweise":[{"typ":"formulierung"|"timing"|"inhalt"|"tipp","text":"..."}]}
- formulierung: Wie man Nachrichten formuliert (kurz, klar, freundlich)
- timing: Wann man Nachrichten sendet
- inhalt: Was in Nachrichten gehört
- tipp: Allgemeine Best Practices
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
