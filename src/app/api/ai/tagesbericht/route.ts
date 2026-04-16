export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { applyAiRateLimit, validateBody, AiSchemas } from '@/lib/ai-utils'
import { z } from 'zod'

const TagesberichtBody = z.object({
  childName: z.string().max(100).optional(),
  mood: z.enum(['great', 'good', 'okay', 'sad', 'sick']).optional(),
  sleepHours: z.number().int().min(0).max(5).optional(),
  sleepMins: z.number().int().min(0).max(59).optional(),
  breakfast: z.string().max(200).optional(),
  lunch: z.string().max(200).optional(),
  snack: z.string().max(200).optional(),
  activities: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = applyAiRateLimit(user.id)
  if (rl) return rl

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: body, error: bodyErr } = await validateBody(req, TagesberichtBody)
  if (bodyErr) return bodyErr
  const { childName, mood, sleepHours, sleepMins, breakfast, lunch, snack, activities, notes } = body

  const moodLabels: Record<string, string> = {
    great: 'sehr gut gelaunt', good: 'gut gelaunt', okay: 'ausgeglichen',
    sad: 'eher traurig', sick: 'nicht ganz fit / krank',
  }

  const parts = [
    childName && `Kind: ${childName}`,
    mood && `Stimmung: ${moodLabels[mood] ?? mood}`,
    (sleepHours || sleepMins) && `Mittagsschlaf: ${sleepHours || 0}h ${sleepMins || 0}min`,
    breakfast && `Fruehstueck: ${breakfast}`,
    lunch && `Mittagessen: ${lunch}`,
    snack && `Vesper: ${snack}`,
    activities && `Aktivitaeten: ${activities}`,
    notes && `Zusaetzliche Notizen: ${notes}`,
  ].filter(Boolean).join('\n')

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Schreibe einen freundlichen, herzlichen Tagesbericht fuer Eltern auf Deutsch.
Nutze diese Informationen:

${parts}

Schreibe 3-5 Saetze, direkt als Fliesstext (kein "Liebe Eltern" oder Betreff).
Formuliere positiv und warmherzig. Erwaehne die wichtigsten Punkte natuerlich.
Vermeide Aufzaehlungen. Nur den Berichtstext, sonst nichts.`,
    }],
  })

  const generated = (message.content[0] as any).text?.trim() ?? ''
  return NextResponse.json({ text: generated })
}
