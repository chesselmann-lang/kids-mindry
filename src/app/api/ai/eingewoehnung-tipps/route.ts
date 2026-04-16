export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays, differenceInMonths } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PHASE_DESC: Record<number, string> = {
  1: 'Grundphase – Kind und Elternteil gemeinsam in der Kita (Tag 1-3)',
  2: 'Erweiterungsphase – Erste Trennungsversuche, Elternteil kurz weg (Tag 4-6)',
  3: 'Stabilisierungsphase – Längere Trennungen, Kind bleibt mehrere Stunden (Woche 2-3)',
  4: 'Schlussphase – Volle Integration, regulärer Kita-Besuch (Woche 4)',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { processId } = await req.json()
  if (!processId) return NextResponse.json({ error: 'processId required' }, { status: 400 })

  const { data: process } = await (supabase as any)
    .from('eingewoehnung_processes')
    .select('*, children:child_id(first_name, last_name, date_of_birth)')
    .eq('id', processId).single()

  if (!process) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const child = process.children as any
  const ageMonths = child?.date_of_birth
    ? differenceInMonths(new Date(), new Date(child.date_of_birth))
    : null
  const ageLabel = ageMonths != null
    ? ageMonths >= 12 ? `${Math.floor(ageMonths / 12)} Jahre ${ageMonths % 12} Monate` : `${ageMonths} Monate`
    : 'unbekannt'

  const daysSinceStart = differenceInDays(new Date(), new Date(process.start_date))
  const currentPhase = process.phase as number
  const phaseDesc = PHASE_DESC[currentPhase] ?? `Phase ${currentPhase}`

  const notesHint = process.notes ? `\nAktuelle Notizen: ${process.notes.slice(0, 200)}` : ''

  const prompt = `Du bist eine erfahrene Kita-Pädagogin und gibst Tipps zur Eingewöhnung.

Kind: ${child?.first_name}, ${ageLabel}
Eingewöhnung seit: ${daysSinceStart} Tagen
Aktuelle Phase: ${currentPhase} – ${phaseDesc}${notesHint}

Gib 4-5 konkrete, praktische Tipps für diese Eingewöhnungsphase. Die Tipps sollen:
- Dem aktuellen Alter und der Phase angepasst sein
- Konkrete Handlungsanleitungen für die Erzieherin geben
- Eltern-Kind-Beziehung und Kita-Beziehung stärken
- Positiv formuliert sein

Antworte NUR mit JSON-Array:
[
  {"titel": "Kurztitel", "tipp": "Konkreter Tipp in 1-2 Sätzen", "prioritaet": "hoch"|"mittel"|"niedrig"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const tipps = JSON.parse(clean)
    return NextResponse.json({ tipps: Array.isArray(tipps) ? tipps : [], phase: currentPhase, phaseDesc, childName: child?.first_name })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
