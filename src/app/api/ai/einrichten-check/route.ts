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
  if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [
    { data: site },
    { data: groups },
    { count: childrenCount },
    { count: staffCount },
    { count: parentCount },
  ] = await Promise.all([
    supabase.from('sites').select('name, city, max_children, logo_url').eq('id', siteId).single(),
    supabase.from('groups').select('id').eq('site_id', siteId),
    supabase.from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('site_id', siteId).in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('role', 'parent'),
  ])

  const siteData = site as any
  const hasLogo = !!(siteData?.logo_url)
  const hasCity = !!(siteData?.city)
  const groupCount = (groups ?? []).length

  const prompt = `Du bist ein KiTa-Setup-Experte. Prüfe den Einrichtungsstatus:

Kita-Name: ${siteData?.name ?? 'nicht gesetzt'}
Stadt: ${hasCity ? 'gesetzt' : 'fehlt'}
Logo: ${hasLogo ? 'hochgeladen' : 'fehlt'}
Gruppen: ${groupCount}
Aktive Kinder: ${childrenCount ?? 0}
Personal: ${staffCount ?? 0}
Eltern-Accounts: ${parentCount ?? 0}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"fehlt|tipp|vollständig","text":"..."}],"stats":{"groups":${groupCount},"children":${childrenCount ?? 0},"staff":${staffCount ?? 0}}}
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
