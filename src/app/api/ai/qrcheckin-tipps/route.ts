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
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist Kita-Administrator. Gib 5 praxisnahe Tipps für die Einführung und Nutzung von QR-Code-Check-in in einer Kita.
Antworte NUR als JSON: {"hinweise":[{"typ":"einrichtung"|"nutzung"|"datenschutz"|"tipp","text":"..."}]}
- einrichtung: Wie man QR-Codes aufstellt und erklärt
- nutzung: Best Practices für täglichen Einsatz
- datenschutz: DSGVO-konforme Nutzung der QR-Codes
- tipp: Allgemeine Praxistipps
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
