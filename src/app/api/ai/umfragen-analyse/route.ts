import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pollId = req.nextUrl.searchParams.get('pollId')
  if (!pollId) return NextResponse.json({ error: 'pollId required' }, { status: 400 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: poll } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .eq('site_id', siteId)
    .single()

  if (!poll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: allVotes } = await supabase
    .from('poll_votes')
    .select('option_indexes, user_id')
    .eq('poll_id', pollId)

  const votes = (allVotes ?? []) as any[]
  const options: string[] = (poll as any).options ?? []
  const totalVoters = votes.length

  const optionCounts = options.map((_, idx) =>
    votes.filter((v: any) => Array.isArray(v.option_indexes) && v.option_indexes.includes(idx)).length
  )

  const maxVotes = optionCounts.length > 0 ? Math.max(...optionCounts) : 0
  const winnerIdx = optionCounts.indexOf(maxVotes)
  const winnerOption = options[winnerIdx] ?? ''
  const isClosed = (poll as any).closes_at && new Date((poll as any).closes_at) < new Date()

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist ein Assistent fuer eine Kita-App. Analysiere diese Umfrage und gib 3 kurze Hinweise auf Deutsch.

Titel: ${(poll as any).title}
Beschreibung: ${(poll as any).description ?? '(keine)'}
Optionen: ${options.map((o, i) => `"${o}" (${optionCounts[i]} Stimmen)`).join(', ')}
Gesamt: ${totalVoters} Teilnehmer, Status: ${isClosed ? 'abgeschlossen' : 'offen'}
Mehrfachauswahl: ${(poll as any).multiple_choice ? 'Ja' : 'Nein'}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "ergebnis", "text": "..."},
    {"typ": "tipp", "text": "..."},
    {"typ": "info", "text": "..."}
  ],
  "stats": {
    "totalVoters": ${totalVoters},
    "winnerOption": "${winnerOption.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",
    "isClosed": ${isClosed ? true : false}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
