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

  const [{ data: children }, { data: docs }] = await Promise.all([
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('child_documents').select('id, child_id, document_type, category').eq('site_id', siteId).limit(200),
  ])

  const totalChildren = (children ?? []).length
  const docList = (docs ?? []) as any[]
  const uniqueChildren = new Set(docList.map((d: any) => d.child_id)).size
  const typeFreq: Record<string, number> = {}
  for (const d of docList) {
    const t = d.document_type ?? d.category ?? 'Sonstige'
    typeFreq[t] = (typeFreq[t] ?? 0) + 1
  }
  const topType = Object.entries(typeFreq).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '–'
  const childrenWithoutDocs = Math.max(0, totalChildren - uniqueChildren)

  const prompt = `Du bist ein KiTa-Verwaltungsexperte. Analysiere die Kind-Dokumente:

Aktive Kinder: ${totalChildren}
Kinder mit Dokumenten: ${uniqueChildren}
Kinder ohne Dokumente: ${childrenWithoutDocs}
Dokumente gesamt: ${docList.length}
Dokumenttypen: ${Object.entries(typeFreq).map(([k, v]) => `${k}: ${v}`).join(', ')}

Wichtige Dokumenttypen: Betreuungsvertrag, Einwilligungserklärung, Attest, Datenschutz, Notfallkarte.
Antworte NUR mit JSON:
{"hinweise":[{"typ":"dringend|hinweis|info","text":"..."}],"stats":{"totalDocs":${docList.length},"childrenWithDocs":${uniqueChildren},"uniqueChildren":${uniqueChildren}}}
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
