import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { applyAiRateLimit, validateBody, AiSchemas } from '@/lib/ai-utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = applyAiRateLimit(user.id)
  if (rl) return rl

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, site_id').eq('id', user.id).single()

  const { data: body, error: bodyErr } = await validateBody(req, AiSchemas.Chat)
  if (bodyErr) return bodyErr
  const { messages } = body
  // Sicherheit: max 20 Nachrichten im Kontext (bereits durch Zod validiert)
  const safeMsgs = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content.slice(0, 4000),
  }))

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [
    { data: site },
    { count: childCount },
    { count: groupCount },
  ] = await Promise.all([
    supabase.from('sites').select('name, city').eq('id', siteId).single(),
    supabase.from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active'),
    supabase.from('groups').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
  ])

  const kitaName = (site as any)?.name ?? 'Kita'
  const systemPrompt = `Du bist der KI-Assistent von kids.mindry.de, einem digitalen Kita-Verwaltungssystem.
Du hilfst Erzieher:innen und Kita-Leitungen im Alltag: Elternbriefe, Aktivitaetsvorschlaege, Foerderplanung, DSGVO-Fragen und alles rund um den Kita-Betrieb.

Kontext:
- Kita: ${kitaName}
- Aktive Kinder: ${childCount ?? '?'}
- Gruppen: ${groupCount ?? '?'}
- Nutzer: ${(profile as any)?.full_name ?? 'Unbekannt'} (Rolle: ${(profile as any)?.role ?? 'unbekannt'})
${context ? `- Zusaetzlicher Kontext: ${context}` : ''}

Antworte immer auf Deutsch. Sei konkret, hilfreich und praxisnah.
Wenn du Vorlagen oder Texte schreibst, erstelle diese direkt – keine Rueckfragen.
Halte Antworten kurz und praegnant, ausser bei Vorlagen wo vollstaendige Texte erwartet werden.`

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: safeMsgs,
  })

  const text = (response.content[0] as any).text?.trim() ?? ''
  return NextResponse.json({ text })
}
