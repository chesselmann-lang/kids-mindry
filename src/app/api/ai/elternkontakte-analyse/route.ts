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

  const { data: children } = await supabase
    .from('children')
    .select('id, parent_contacts(id, name, phone, email, is_primary)')
    .eq('site_id', siteId)
    .eq('status', 'active')

  const list = (children ?? []) as any[]
  const withContact = list.filter(c => (c.parent_contacts?.length ?? 0) > 0)
  const withPhone = list.filter(c => c.parent_contacts?.some((p: any) => p.phone))
  const withEmail = list.filter(c => c.parent_contacts?.some((p: any) => p.email))
  const noContact = list.length - withContact.length
  const completeness = list.length > 0 ? Math.round(withContact.length / list.length * 100) : 0

  const prompt = `Du bist ein KiTa-Assistent. Analysiere die Elternkontaktdaten:

Kinder gesamt: ${list.length}
Mit Elternkontakt: ${withContact.length} (${completeness}%)
Mit Telefonnummer: ${withPhone.length}
Mit E-Mail: ${withEmail.length}
Ohne Kontakt: ${noContact}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"achtung|hinweis|vollständig","text":"..."}],"stats":{"total":${list.length},"withContact":${withContact.length},"completeness":${completeness},"noContact":${noContact}}}
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
