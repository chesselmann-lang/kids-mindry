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

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, role, phone, full_name')
    .eq('site_id', siteId)
    .in('role', ['educator', 'group_lead', 'admin', 'caretaker'])
    .order('role')

  const { count: childrenCount } = await supabase
    .from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active')

  const list = (staff ?? []) as any[]
  const roleFreq: Record<string, number> = {}
  for (const s of list) roleFreq[s.role] = (roleFreq[s.role] ?? 0) + 1
  const withPhone = list.filter(s => s.phone).length
  const total = list.length
  const ratio = total > 0 && (childrenCount ?? 0) > 0
    ? Math.round((childrenCount ?? 0) / total)
    : 0

  const prompt = `Du bist ein KiTa-Personalmanager. Analysiere das Team:

Personal gesamt: ${total}
Erziehende: ${roleFreq.educator ?? 0}
Gruppenleitung: ${roleFreq.group_lead ?? 0}
Leitung: ${roleFreq.admin ?? 0}
Betreuung: ${roleFreq.caretaker ?? 0}
Mit Telefonnummer: ${withPhone}
Aktive Kinder: ${childrenCount ?? 0}
Kind-zu-Personal-Verhältnis: ${ratio}:1

Antworte NUR mit JSON:
{"hinweise":[{"typ":"hinweis|info|positiv","text":"..."}],"stats":{"total":${total},"educators":${roleFreq.educator ?? 0},"ratio":${ratio}}}
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
