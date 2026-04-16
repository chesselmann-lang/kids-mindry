import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Du bist Pädagogik-Fachkraft in einer Kita. Gib 6 präzise Schreibhilfen für ein Kita-Sitzungsprotokoll.
Antworte NUR als JSON: {"hinweise":[{"typ":"struktur"|"inhalt"|"formulierung"|"tipp","text":"..."}]}
- struktur: Aufbau und Gliederung eines guten Protokolls
- inhalt: Was zwingend ins Protokoll gehört (Beschlüsse, Anwesende, etc.)
- formulierung: Wie man sachlich und klar formuliert
- tipp: Praktische Tipps für effiziente Protokollführung
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
