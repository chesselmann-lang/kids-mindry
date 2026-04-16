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
    .select('id, allergies, dietary_restrictions, medical_notes')
    .eq('site_id', siteId)
    .eq('status', 'active')

  const list = (children ?? []) as any[]
  const allergyFreq: Record<string, number> = {}
  let withAllergies = 0, withDiet = 0, withNotes = 0

  for (const c of list) {
    const items = [
      ...(Array.isArray(c.allergies) ? c.allergies : c.allergies ? [c.allergies] : []),
      ...(Array.isArray(c.dietary_restrictions) ? c.dietary_restrictions : c.dietary_restrictions ? [c.dietary_restrictions] : []),
    ]
    if (items.length > 0) withAllergies++
    if ((Array.isArray(c.dietary_restrictions) ? c.dietary_restrictions.length > 0 : !!c.dietary_restrictions)) withDiet++
    if (c.medical_notes) withNotes++
    for (const a of items) allergyFreq[String(a)] = (allergyFreq[String(a)] ?? 0) + 1
  }

  const topAllergies = Object.entries(allergyFreq).sort(([, a], [, b]) => b - a).slice(0, 5)

  const prompt = `Du bist ein KiTa-Gesundheitsassistent. Analysiere die Allergie-/Gesundheitsdaten:

Kinder gesamt: ${list.length}
Mit Allergien/Unverträglichkeiten: ${withAllergies}
Mit Ernährungseinschränkungen: ${withDiet}
Mit medizinischen Notizen: ${withNotes}
Häufigste Allergene: ${topAllergies.map(([a, n]) => `${a} (${n}x)`).join(', ') || 'keine Daten'}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"kritisch|wichtig|info","text":"..."}],"stats":{"total":${list.length},"withAllergies":${withAllergies},"withDiet":${withDiet},"withNotes":${withNotes}}}
Maximal 2 hinweise. Praxistipps für Küche/Betreuung.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
