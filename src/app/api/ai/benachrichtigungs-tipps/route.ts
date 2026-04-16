import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role ?? 'parent'

  const roleLabel = role === 'admin' ? 'Kita-Leitung' :
    role === 'group_lead' ? 'Gruppenleitung' :
    role === 'educator' ? 'Erzieherin' :
    role === 'caretaker' ? 'Betreuerin' : 'Elternteil'

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist Berater für eine Kita-App. Der Nutzer ist ${roleLabel}.
Gib 5 kurze, praktische Empfehlungen welche Push-Benachrichtigungen für eine ${roleLabel} besonders wichtig sind.
Die App hat folgende Benachrichtigungstypen: Neuigkeiten/Feed, Tagesberichte, Termine, Nachrichten, Protokolle, Abwesenheiten.
Antworte NUR als JSON: {"hinweise":[{"typ":"wichtig"|"optional"|"info","text":"..."}]}
- wichtig: unbedingt aktivieren
- optional: je nach Bedarf
- info: allgemeiner Hinweis
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json({ ...data, role })
}
