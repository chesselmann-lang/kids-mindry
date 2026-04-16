import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, site_id').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = (profile as any)?.site_id
  if (!siteId) return NextResponse.json({ error: 'No site' }, { status: 400 })

  const { data: sub } = await supabase
    .from('subscriptions').select('plan, status, trial_ends_at, current_period_end, cancel_at_period_end')
    .eq('site_id', siteId).single()

  const { data: site } = await supabase.from('sites').select('max_children').eq('id', siteId).single()
  const { data: childCount } = await supabase.from('children').select('id', { count: 'exact', head: true })
    .eq('site_id', siteId).eq('status', 'active')

  const s = sub as any
  const daysUntilExpiry = s?.current_period_end
    ? Math.floor((new Date(s.current_period_end).getTime() - Date.now()) / 86400000)
    : null
  const daysUntilTrial = s?.trial_ends_at
    ? Math.floor((new Date(s.trial_ends_at).getTime() - Date.now()) / 86400000)
    : null
  const maxChildren = (site as any)?.max_children ?? null

  const stats = { plan: s?.plan ?? 'unbekannt', status: s?.status ?? 'unbekannt', daysUntilExpiry, daysUntilTrial, childCount: childCount ?? 0, maxChildren }

  const client = new Anthropic()
  const prompt = `Du bist ein Account-Assistent für eine Kita-Software. Analysiere den Abonnement-Status.

- Plan: ${s?.plan ?? 'unbekannt'}
- Status: ${s?.status ?? 'unbekannt'}
- Tage bis Ablauf: ${daysUntilExpiry ?? 'unbekannt'}
- Tage bis Trial-Ende: ${daysUntilTrial ?? 'kein Trial'}
- Kündigung zum Periodenende: ${s?.cancel_at_period_end ? 'ja' : 'nein'}
- Aktive Kinder: ${childCount ?? 0} / ${maxChildren ?? '?'}

Gib 2-3 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"dringend"|"hinweis"|"info","text":"..."}]

Fokus: Ablaufdaten, Kapazitätsauslastung, Upgrade-Bedarf. Nur JSON, kein Markdown.`

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
