export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at, last_sign_in_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  const list = (users ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Noch keine Nutzer vorhanden.', hinweise: [], stats: { total: 0 } })
  }

  // Role breakdown
  const roles: Record<string, number> = {}
  for (const u of list) { roles[u.role ?? 'unknown'] = (roles[u.role ?? 'unknown'] ?? 0) + 1 }

  // Inactive: no sign-in in >90 days (or never)
  const inactive = list.filter(u => {
    if (!u.last_sign_in_at) return false
    return differenceInDays(new Date(), new Date(u.last_sign_in_at)) > 90
  })

  const recentJoins = list.filter(u => differenceInDays(new Date(), new Date(u.created_at)) <= 30).length

  const roleLines = Object.entries(roles).map(([r, c]) => `${r}: ${c}`).join(', ')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Nutzerverwaltung.

Statistiken:
- Nutzer gesamt: ${list.length}
- Rollen: ${roleLines}
- Inaktiv (>90 Tage): ${inactive.length}
- Neu im letzten Monat: ${recentJoins}

Gib kurze Hinweise zu inaktiven Nutzern, fehlenden Rollen und Verbesserungen.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "hinweis"|"info"|"positiv", "text": "Konkreter Hinweis"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      hinweise: result.hinweise ?? [],
      stats: { total: list.length, inactive: inactive.length, recentJoins },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
