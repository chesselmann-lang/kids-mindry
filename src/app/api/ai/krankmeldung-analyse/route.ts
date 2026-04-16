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
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Admin sees all sick reports for site
  const { data: reports } = await supabase
    .from('sick_reports')
    .select('id, staff_id, start_date, end_date, status')
    .eq('site_id', siteId)
    .order('start_date', { ascending: false })
    .limit(100)

  const list = (reports ?? []) as any[]
  const open = list.filter(r => r.status === 'open' || !r.end_date).length
  const uniqueStaff = new Set(list.map(r => r.staff_id)).size

  const now = Date.now()
  const last30 = list.filter(r => {
    return r.start_date && (now - new Date(r.start_date).getTime()) < 30 * 86400000
  }).length

  const prompt = `Du bist ein KiTa-HR-Manager. Analysiere die Krankmeldungen:

Meldungen gesamt: ${list.length}
Letzte 30 Tage: ${last30}
Offene Meldungen: ${open}
Betroffene Mitarbeiter: ${uniqueStaff}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"dringend|hinweis|info","text":"..."}],"stats":{"total":${list.length},"open":${open},"last30":${last30}}}
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
