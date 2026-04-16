import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isParent = (profile as any)?.role === 'parent'
  if (!isParent) return NextResponse.json({ error: 'Eltern only' }, { status: 403 })

  const { data: guardians } = await supabase
    .from('guardians')
    .select('id, consent_photos, consent_signed_at, children(first_name, last_name)')
    .eq('user_id', user.id)

  const gs = (guardians ?? []) as any[]
  const total = gs.length
  const withConsent = gs.filter(g => g.consent_photos).length
  const withoutConsent = total - withConsent
  const oldConsents = gs.filter(g => {
    if (!g.consent_signed_at) return false
    const signed = new Date(g.consent_signed_at)
    const monthsAgo = (Date.now() - signed.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsAgo > 12
  }).length

  const stats = { total, withConsent, withoutConsent, oldConsents }

  const client = new Anthropic()
  const prompt = `Du bist ein datenschutzfreundlicher Kita-Assistent für Eltern. Analysiere die Einwilligungslage.

- Einträge gesamt: ${total}
- Foto-Einwilligung erteilt: ${withConsent}
- Keine Einwilligung: ${withoutConsent}
- Ältere Einwilligungen (>12 Monate): ${oldConsents}

Gib 2-3 kurze, klare Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"wichtig"|"hinweis"|"info","text":"..."}]

Fokus: Datenschutzrechte, Handlungsbedarf, Überprüfungstipps. Nur JSON, kein Markdown.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as any).text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const hinweise = JSON.parse(clean)

  return NextResponse.json({ hinweise, stats })
}
