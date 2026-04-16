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

  const { data: templates } = await supabase
    .from('message_templates')
    .select('id, title, category')
    .eq('site_id', siteId)
    .order('category')

  const list = (templates ?? []) as any[]
  const catFreq: Record<string, number> = {}
  for (const t of list) {
    catFreq[t.category ?? 'sonstig'] = (catFreq[t.category ?? 'sonstig'] ?? 0) + 1
  }
  const topCat = Object.entries(catFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  const prompt = `Du bist ein KiTa-Verwaltungsassistent. Analysiere diese Nachrichtenvorlagen-Bibliothek:

Vorlagen gesamt: ${list.length}
Kategorien: ${Object.entries(catFreq).map(([k, v]) => `${k}: ${v}`).join(', ')}
Häufigste Kategorie: ${topCat}
Beispieltitel: ${list.slice(0, 4).map(t => t.title).join(', ')}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"tipp|info|positiv","text":"..."}],"stats":{"total":${list.length},"categories":${Object.keys(catFreq).length},"topCategory":"${topCat}"}}
Maximal 2 hinweise. Gib Tipps zur Optimierung oder fehlende Kategorien.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
