import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await (supabase as any).from('profiles').select('role, full_name').eq('id', user.id).single()
    const role = profile?.role ?? 'parent'
    const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(role)
    const today = new Date().toLocaleDateString('de-DE', { weekday: 'long' })

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

    // Get some context for suggestions
    let context = ''
    if (isStaff) {
      const { data: att } = await supabase.from('attendance').select('status', { count: 'exact', head: true })
        .eq('site_id', siteId).eq('date', new Date().toISOString().split('T')[0]).eq('status', 'present')
      context = `Heute anwesend: ca. ${(att as any)?.count ?? 0} Kinder`
    }

    const roleLabels: Record<string, string> = {
      parent: 'Elternteil', educator: 'Erzieher/in', group_lead: 'Gruppenleitung',
      admin: 'Administrator', caretaker: 'Betreuer/in',
    }

    const prompt = `Du bist ein KI-Assistent für eine Kita-App. Schlage dem Nutzer 4 kurze, relevante Suchbegriffe oder Schnellzugriffe vor.

Nutzerrolle: ${roleLabels[role] ?? role}
Wochentag: ${today}
${context}

Die Vorschläge sollen typische Alltagsaufgaben abdecken und als kurze Suchbegriffe formuliert sein (2-4 Wörter).
Antworte im JSON-Format: {"vorschlaege": [{"label": "...", "query": "...", "icon": "suche|kalender|kind|nachricht|abwesend|dokument"}]}
Nur JSON, kein Markdown.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as any).text
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ ...parsed, role })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
