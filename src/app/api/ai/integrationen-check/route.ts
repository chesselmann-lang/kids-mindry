export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, site_id').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: zoomInt } = await supabase
    .from('zoom_integrations').select('email').eq('site_id', siteId).maybeSingle()

  const hasZoom = !!zoomInt
  const hasLexoffice = !!(process.env.LEXOFFICE_API_KEY)
  const hasAnthropicAi = !!(process.env.ANTHROPIC_API_KEY)
  const connected = [hasZoom, hasLexoffice, hasAnthropicAi].filter(Boolean).length

  const prompt = `Du bist ein KiTa-IT-Berater. Bewerte den Integrationsstatus:

Zoom: ${hasZoom ? 'verbunden (' + zoomInt.email + ')' : 'nicht verbunden'}
LexOffice: ${hasLexoffice ? 'konfiguriert' : 'nicht konfiguriert'}
KI (Anthropic): ${hasAnthropicAi ? 'aktiv' : 'nicht aktiv'}
Verbundene Integrationen: ${connected}/3

Antworte NUR mit JSON:
{"hinweise":[{"typ":"tipp|info|vollständig","text":"..."}],"stats":{"connected":${connected},"total":3,"zoom":${hasZoom}}}
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
