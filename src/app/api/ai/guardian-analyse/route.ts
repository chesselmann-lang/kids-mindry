import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: child } = await supabase
    .from('children').select('first_name, last_name').eq('id', childId).single()

  const { data: guardians } = await supabase
    .from('guardians').select('full_name, relationship, consent_photos, consent_signed_at, user_id')
    .eq('child_id', childId)

  const gs = (guardians ?? []) as any[]
  const total = gs.length
  const withAccount = gs.filter(g => g.user_id).length
  const withConsent = gs.filter(g => g.consent_photos).length
  const hasPrimary = gs.some(g => g.relationship === 'mother' || g.relationship === 'father' || g.relationship === 'parent')

  const stats = { total, withAccount, withConsent, withoutConsent: total - withConsent }

  const c = child as any
  const client = new Anthropic()
  const prompt = `Du bist ein Kita-Verwaltungsassistent. Analysiere die Erziehungsberechtigten-Situation für ${c?.first_name ?? 'das Kind'} ${c?.last_name ?? ''}.

- Erziehungsberechtigte gesamt: ${total}
- Mit Kita-App-Konto: ${withAccount}
- Foto-Einwilligung erteilt: ${withConsent}
- Ohne Einwilligung: ${total - withConsent}
- Hauptbezugsperson (Elternteil) vorhanden: ${hasPrimary ? 'ja' : 'nein'}

Gib 2-3 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"wichtig"|"hinweis"|"info","text":"..."}]

Fokus: Vollständigkeit der Daten, fehlende Konten, Einwilligungslücken. Nur JSON, kein Markdown.`

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
