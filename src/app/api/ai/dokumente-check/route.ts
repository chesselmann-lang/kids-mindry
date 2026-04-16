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
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: documents } = await supabase
    .from('kita_documents')
    .select('id, title, category, created_at, expires_at, is_public')
    .order('created_at', { ascending: false })
    .limit(50)

  const list = (documents ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Noch keine Dokumente hochgeladen.', hinweise: [], stats: { total: 0, expiring: 0 } })
  }

  const now = new Date()
  const expiring = list.filter(d => d.expires_at && differenceInDays(new Date(d.expires_at), now) <= 30 && differenceInDays(new Date(d.expires_at), now) >= 0)
  const expired = list.filter(d => d.expires_at && new Date(d.expires_at) < now)

  // Category distribution
  const catCounts: Record<string, number> = {}
  for (const d of list) {
    const cat = d.category ?? 'ohne Kategorie'
    catCounts[cat] = (catCounts[cat] ?? 0) + 1
  }
  const catLines = Object.entries(catCounts).map(([k, v]) => `${k}: ${v}`).join(', ')

  const recentLines = list.slice(0, 5).map(d => {
    const age = differenceInDays(now, new Date(d.created_at))
    const exp = d.expires_at ? ` (läuft ab: ${format(new Date(d.expires_at), 'd. MMM yyyy', { locale: de })})` : ''
    return `${d.title ?? 'k.T.'}${exp} — vor ${age} Tagen hochgeladen`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Dokumentenverwaltung.

Statistiken:
- Dokumente gesamt: ${list.length}
- Ablaufende Dokumente (≤30 Tage): ${expiring.length}
- Abgelaufene Dokumente: ${expired.length}
- Kategorien: ${catLines}

Letzte Dokumente:
${recentLines}

Weise auf ablaufende/fehlende Dokumente und Verbesserungen hin.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "dringend"|"hinweis"|"info", "text": "Konkreter Hinweis"}
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
      stats: { total: list.length, expiring: expiring.length, expired: expired.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
