import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const ReportSchema = z.object({
  messageId: z.string().uuid(),
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'illegal', 'other']).default('inappropriate'),
  note: z.string().max(500).optional(),
})

// POST /api/nachrichten/report — Nachricht melden (KJM §5 JMStV)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate-Limit: 10 Reports / Stunde pro User (Missbrauchsschutz)
  const { ok: rlOk, reset } = checkRateLimit(`report:${user.id}`, 10, 3_600_000)
  if (!rlOk) {
    return NextResponse.json(
      { error: 'Zu viele Meldungen. Bitte später erneut versuchen.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  // Body parsen + validieren
  const body = await req.json().catch(() => null)
  const parsed = ReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Eingabe.', details: parsed.error.flatten() }, { status: 400 })
  }
  const { messageId, reason, note } = parsed.data

  // Prüfen ob Nachricht existiert und User Zugriff hat (er muss Teilnehmer sein)
  const { data: msg } = await (supabase as any)
    .from('messages')
    .select('id, conversation_id, sender_id')
    .eq('id', messageId)
    .single()

  if (!msg) {
    return NextResponse.json({ error: 'Nachricht nicht gefunden.' }, { status: 404 })
  }

  // Eigene Nachrichten können nicht gemeldet werden
  if (msg.sender_id === user.id) {
    return NextResponse.json({ error: 'Eigene Nachrichten können nicht gemeldet werden.' }, { status: 422 })
  }

  // Prüfen ob User Teilnehmer des Gesprächs ist
  const { data: participant } = await (supabase as any)
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', msg.conversation_id)
    .eq('user_id', user.id)
    .single()

  if (!participant) {
    return NextResponse.json({ error: 'Kein Zugriff auf dieses Gespräch.' }, { status: 403 })
  }

  // Report einfügen (unique constraint verhindert Doppel-Reports)
  const { error } = await (supabase as any)
    .from('reported_messages')
    .insert({
      message_id: messageId,
      reported_by: user.id,
      reason,
      note: note ?? null,
      status: 'pending',
    })

  if (error) {
    // unique constraint = bereits gemeldet
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Diese Nachricht wurde von dir bereits gemeldet.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
