import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
    if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
    const thirtyAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    const today = new Date().toISOString()

    const [
      { data: recentAnn },
      { data: allAnn },
      { data: upcomingEvents },
    ] = await Promise.all([
      supabase.from('announcements').select('type, pinned, published_at, group_id')
        .eq('site_id', siteId).not('published_at', 'is', null)
        .gte('published_at', thirtyAgo).order('published_at', { ascending: false }),
      supabase.from('announcements').select('published_at')
        .eq('site_id', siteId).not('published_at', 'is', null)
        .order('published_at', { ascending: false }).limit(1),
      supabase.from('events').select('id').eq('site_id', siteId).gte('starts_at', today),
    ])

    const ann = recentAnn ?? []
    const total30 = ann.length
    const pinned30 = ann.filter((a: any) => a.pinned).length
    const groupSpecific = ann.filter((a: any) => a.group_id).length
    const siteWide = total30 - groupSpecific

    // Type frequency
    const typeFreq: Record<string, number> = {}
    ann.forEach((a: any) => {
      const t = a.type ?? 'info'
      typeFreq[t] = (typeFreq[t] ?? 0) + 1
    })

    const lastAnn = allAnn?.[0]?.published_at
    const daysSinceLast = lastAnn
      ? Math.round((Date.now() - new Date(lastAnn).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const upcomingCount = (upcomingEvents ?? []).length

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Du bist Kommunikationsberater für eine Kita.

Neuigkeiten & Kommunikation (letzte 30 Tage):
- Beiträge gesamt: ${total30}
- Angepinnte Beiträge: ${pinned30}
- Kita-weit: ${siteWide}, Gruppen-spezifisch: ${groupSpecific}
- Typen: ${JSON.stringify(typeFreq)}
- Tage seit letztem Beitrag: ${daysSinceLast ?? 'unbekannt'}
- Bevorstehende Events: ${upcomingCount}

Erstelle 3 Hinweise zur Kommunikationsqualität als JSON:
[{"typ":"hinweis"|"tipp"|"info","text":"..."}]

Fokus auf: Kommunikationsfrequenz, Diversität, Eltern-Engagement.
JSON only.`,
      }],
    })

    const raw = (msg.content[0] as any).text
    const hinweise = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    return NextResponse.json({
      hinweise,
      stats: {
        total30,
        daysSinceLast,
        upcomingCount,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
