export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMonths } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { childId } = await req.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const [
    { data: child },
    { data: milestones },
    { data: observations },
  ] = await Promise.all([
    supabase.from('children')
      .select('first_name, date_of_birth')
      .eq('id', childId).single(),
    (supabase as any).from('milestones')
      .select('title, category')
      .eq('child_id', childId)
      .order('achieved_date', { ascending: false }).limit(20),
    (supabase as any).from('observations')
      .select('content, category')
      .eq('child_id', childId)
      .order('created_at', { ascending: false }).limit(10),
  ])

  if (!child) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const ageMonths = (child as any).date_of_birth
    ? differenceInMonths(new Date(), new Date((child as any).date_of_birth))
    : null

  const ageLabel = ageMonths !== null
    ? ageMonths >= 12
      ? `${Math.floor(ageMonths / 12)} Jahre ${ageMonths % 12} Monate`
      : `${ageMonths} Monate`
    : 'Alter unbekannt'

  const existingTitles = (milestones as any[] ?? []).map((m: any) => m.title).join(', ')
  const obsList = (observations as any[] ?? []).map((o: any) => `• [${o.category}] ${o.content?.slice(0, 80)}`).join('\n')

  const prompt = `Schlage passende Entwicklungs-Meilensteine für ein Kind vor.

Kind: ${(child as any).first_name}, Alter: ${ageLabel}
Bereits dokumentierte Meilensteine: ${existingTitles || '– keine'}
Aktuelle Beobachtungen:
${obsList || '– keine'}

Schlage 6-8 noch nicht dokumentierte, altersgemäße Meilensteine vor.
Berücksichtige das Alter und was das Kind noch nicht erreicht hat.

Antworte NUR mit einem JSON-Array:
[
  {"title": "Meilenstein-Bezeichnung", "category": "motor|language|social|cognitive|emotional|creative|other", "rationale": "Warum jetzt passend (1 Satz)"},
  ...
]`

  let vorschlaege: any[] = []
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    vorschlaege = JSON.parse(clean)
  } catch {
    vorschlaege = []
  }

  return NextResponse.json({ vorschlaege, ageLabel })
}
