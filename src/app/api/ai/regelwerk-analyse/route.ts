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

  const { data: rules } = await supabase
    .from('rulebook_entries')
    .select('id, title, category')
    .eq('site_id', siteId)
    .order('category')

  const list = (rules ?? []) as any[]
  const catFreq: Record<string, number> = {}
  for (const r of list) {
    catFreq[r.category ?? 'allgemein'] = (catFreq[r.category ?? 'allgemein'] ?? 0) + 1
  }
  const categories = Object.keys(catFreq)

  const prompt = `Du bist ein KiTa-Qualitätsmanager. Analysiere das Regelwerk:

Regeln gesamt: ${list.length}
Kategorien: ${Object.entries(catFreq).map(([k, v]) => `${k}: ${v}`).join(', ')}
Erste Regeln: ${list.slice(0, 4).map(r => r.title).join(', ')}

Wichtige Kategorien für KiTas: Aufnahme, Betreuung, Sicherheit, Hygiene, Kommunikation, Notfall.
Antworte NUR mit JSON:
{"hinweise":[{"typ":"tipp|vollständig|info","text":"..."}],"stats":{"total":${list.length},"categories":${categories.length}}}
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
