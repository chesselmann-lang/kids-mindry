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

  const { data: documents } = await supabase
    .from('kita_documents')
    .select('id, category, created_at, title')
    .order('created_at', { ascending: false })
    .limit(100)

  const docs = (documents ?? []) as any[]
  const catFreq: Record<string, number> = {}
  for (const d of docs) {
    const cat = d.category ?? 'general'
    catFreq[cat] = (catFreq[cat] ?? 0) + 1
  }

  const now = Date.now()
  const stale = docs.filter(d => {
    const age = (now - new Date(d.created_at).getTime()) / (86400000 * 365)
    return age > 1
  }).length

  const topCategory = Object.entries(catFreq).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '–'

  const prompt = `Du bist ein KiTa-Dokumentenmanager. Analysiere die Kita-Dokumente:

Dokumente gesamt: ${docs.length}
Kategorien: ${Object.entries(catFreq).map(([k, v]) => `${k}: ${v}`).join(', ')}
Veraltet (>1 Jahr): ${stale}
Häufigste Kategorie: ${topCategory}

Wichtige Kategorien: general, contract, form, menu, other.
Antworte NUR mit JSON:
{"hinweise":[{"typ":"hinweis|info|positiv","text":"..."}],"stats":{"total":${docs.length},"categories":${Object.keys(catFreq).length},"stale":${stale}}}
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
