export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: members }, { data: meetings }] = await Promise.all([
    supabase.from('council_members').select('id, position').eq('site_id', siteId).order('position_order'),
    supabase.from('council_meetings').select('id, meeting_date, title').eq('site_id', siteId)
      .order('meeting_date', { ascending: false }).limit(10),
  ])

  const memberList = (members ?? []) as any[]
  const meetingList = (meetings ?? []) as any[]
  const positions = memberList.map(m => m.position)
  const hasChair     = positions.includes('chair')
  const hasDeputy    = positions.includes('deputy')
  const hasTreasurer = positions.includes('treasurer')

  const lastMeetingDate = meetingList[0]?.meeting_date ?? null
  const daysSinceLastMeeting = lastMeetingDate
    ? Math.floor((Date.now() - new Date(lastMeetingDate).getTime()) / 86400000)
    : null

  const prompt = `Du bist ein KiTa-Koordinator. Analysiere den Elternrat:

Mitglieder: ${memberList.length}
Vorsitzende/r: ${hasChair ? 'ja' : 'nein'}
Stellvertretung: ${hasDeputy ? 'ja' : 'nein'}
Kassenwart/in: ${hasTreasurer ? 'ja' : 'nein'}
Sitzungen gesamt: ${meetingList.length}
Tage seit letzter Sitzung: ${daysSinceLastMeeting ?? 'keine Sitzung erfasst'}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"hinweis|info|positiv","text":"..."}],"stats":{"members":${memberList.length},"meetings":${meetingList.length},"daysSinceLastMeeting":${daysSinceLastMeeting ?? 0}}}
Maximal 2 hinweise.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
