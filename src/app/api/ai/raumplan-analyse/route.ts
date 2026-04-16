export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: rooms }, { data: groups }] = await Promise.all([
    supabase.from('rooms').select('id, name, capacity, type, group_id').eq('site_id', siteId).order('name'),
    supabase.from('groups').select('id, name').eq('site_id', siteId),
  ])

  const roomList = (rooms ?? []) as any[]
  const groupList = (groups ?? []) as any[]

  const totalCapacity = roomList.reduce((s, r) => s + (r.capacity ?? 0), 0)
  const assignedRooms = roomList.filter(r => r.group_id).length
  const unassigned = roomList.length - assignedRooms

  const typeFreq: Record<string, number> = {}
  for (const r of roomList) {
    typeFreq[r.type ?? 'sonstig'] = (typeFreq[r.type ?? 'sonstig'] ?? 0) + 1
  }

  const prompt = `Du bist ein KiTa-Verwaltungsassistent. Analysiere den Raumplan:

Räume gesamt: ${roomList.length}
Gesamtkapazität: ${totalCapacity} Personen
Räume mit Gruppe: ${assignedRooms}
Räume ohne Gruppe: ${unassigned}
Gruppen gesamt: ${groupList.length}
Raumtypen: ${Object.entries(typeFreq).map(([k, v]) => `${k}: ${v}`).join(', ')}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"empfehlung|info|ok","text":"..."}],"stats":{"totalRooms":${roomList.length},"totalCapacity":${totalCapacity},"unassigned":${unassigned},"groups":${groupList.length}}}
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
