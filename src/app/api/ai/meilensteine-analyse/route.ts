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

  const { data: milestones } = await supabase
    .from('dev_milestones')
    .select('*')
    .eq('child_id', childId)
    .order('achieved_date', { ascending: true })

  const ms = (milestones ?? []) as any[]
  const achieved = ms.filter(m => m.achieved_date)
  const pending = ms.filter(m => !m.achieved_date)

  // Category breakdown
  const categoryFreq: Record<string, number> = {}
  for (const m of achieved) {
    const cat = m.category ?? 'sonstige'
    categoryFreq[cat] = (categoryFreq[cat] ?? 0) + 1
  }

  // Age at latest milestone
  const c = child as any
  let ageMonths: number | null = null
  if (c.date_of_birth) {
    const dob = new Date(c.date_of_birth)
    const now = new Date()
    ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
  }

  const stats = {
    total: ms.length,
    achieved: achieved.length,
    pending: pending.length,
    categories: Object.keys(categoryFreq).length,
    ageMonths,
  }

  const client = new Anthropic()
  const prompt = `Du bist ein pädagogischer Assistent in einer Kita. Analysiere die Entwicklungs-Meilensteine für ${c.first_name} ${c.last_name}.

Statistiken:
- Alter: ${ageMonths !== null ? `${Math.floor(ageMonths / 12)} Jahre ${ageMonths % 12} Monate` : 'unbekannt'}
- Meilensteine gesamt: ${ms.length}
- Erreicht: ${achieved.length}
- Ausstehend: ${pending.length}
- Kategorien: ${JSON.stringify(categoryFreq)}
${achieved.length > 0 ? `- Zuletzt erreicht: ${achieved[achieved.length - 1]?.title ?? ''} (${achieved[achieved.length - 1]?.achieved_date ?? ''})` : ''}
${pending.length > 0 ? `- Nächste ausstehende: ${pending.slice(0, 3).map((m: any) => m.title).join(', ')}` : ''}

Gib 2-4 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"beobachtung"|"empfehlung"|"info","text":"..."}]

Fokus: Entwicklungsfortschritt, Stärken, nächste Schritte, elterliche Einbindung. Nur JSON, kein Markdown.`

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
