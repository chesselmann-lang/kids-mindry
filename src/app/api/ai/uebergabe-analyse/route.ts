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
  const today = new Date().toISOString().split('T')[0]

  const [{ data: children }, { data: checks }] = await Promise.all([
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('child_handover_checks').select('child_id, pickup_confirmed, notes').eq('date', today),
  ])

  const totalChildren = (children ?? []).length
  const checkList = (checks ?? []) as any[]
  const confirmed = checkList.filter(c => c.pickup_confirmed).length
  const withNotes = checkList.filter(c => c.notes).length
  const notCheckedIn = Math.max(0, totalChildren - checkList.length)

  const prompt = `Du bist ein KiTa-Erzieher. Analysiere die heutigen Kind-Übergaben:

Aktive Kinder: ${totalChildren}
Übergabe-Einträge heute: ${checkList.length}
Abholung bestätigt: ${confirmed}
Noch nicht erfasst: ${notCheckedIn}
Mit Notizen: ${withNotes}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"wichtig|info|ok","text":"..."}],"stats":{"total":${totalChildren},"confirmed":${confirmed},"notCheckedIn":${notCheckedIn}}}
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
