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
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isParent = (profile as any)?.role === 'parent'

  if (!isStaff && !isParent) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (isParent) {
    const { data: g } = await supabase.from('guardians').select('id').eq('user_id', user.id).eq('child_id', childId).maybeSingle()
    if (!g) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: child } = await supabase
    .from('children').select('first_name, last_name, date_of_birth').eq('id', childId).single()
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let query = supabase.from('observations').select('*')
    .eq('child_id', childId)
    .order('observed_at', { ascending: false })
  if (!isStaff) query = query.eq('shared_with_parents', true)

  const { data: observations } = await query
  const obs = (observations ?? []) as any[]

  const highlights = obs.filter(o => o.is_highlight).length
  const total = obs.length
  const domainFreq: Record<string, number> = {}
  for (const o of obs) {
    const d = o.domain ?? 'general'
    domainFreq[d] = (domainFreq[d] ?? 0) + 1
  }
  const topDomains = Object.entries(domainFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
  const recentObs = obs.slice(0, 5).map(o => ({ domain: o.domain, title: o.title?.slice(0, 60) ?? '' }))

  const c = child as any
  let ageMonths: number | null = null
  if (c.date_of_birth) {
    const dob = new Date(c.date_of_birth)
    const now = new Date()
    ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
  }

  const stats = { total, highlights, topDomains, ageMonths }

  const client = new Anthropic()
  const prompt = `Du bist ein pädagogischer Assistent in einer Kita. Analysiere das Portfolio von ${c.first_name} ${c.last_name}.

Daten:
- Alter: ${ageMonths !== null ? `${Math.floor(ageMonths / 12)} Jahre ${ageMonths % 12} Monate` : 'unbekannt'}
- Beobachtungen gesamt: ${total}
- Highlights: ${highlights}
- Stärkste Bereiche: ${topDomains.join(', ') || 'keine'}
- Bereichsverteilung: ${JSON.stringify(domainFreq)}
- Neueste Beobachtungen: ${JSON.stringify(recentObs)}

Gib 2-4 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"stärke"|"empfehlung"|"info","text":"..."}]

Fokus: Entwicklungsschwerpunkte, Stärken, Förderempfehlungen, elterliches Engagement. Nur JSON, kein Markdown.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as any).text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const hinweise = JSON.parse(clean)

  return NextResponse.json({ hinweise, stats })
}
