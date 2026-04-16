export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { parseAiJson, assertSiteChild, logAiUsage, applyAiRateLimit } from '@/lib/ai-utils'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = applyAiRateLimit(user.id)
    if (rl) return rl

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
    if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const childId = req.nextUrl.searchParams.get('childId')
    if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

    // Site-Isolation
    try {
      await assertSiteChild(supabase, childId, siteId)
    } catch {
      return NextResponse.json({ error: 'Kind nicht gefunden oder kein Zugriff.' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]
    const thirtyAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0]

    const [
      { data: child },
      { data: reports },
      { data: attendance },
      { data: healthRecords },
      { data: observations },
    ] = await Promise.all([
      supabase.from('children').select('first_name, last_name, date_of_birth, notes').eq('id', childId).single(),
      supabase.from('daily_reports').select('report_date, mood, notes, sleep_minutes, activities')
        .eq('child_id', childId).order('report_date', { ascending: false }).limit(10),
      supabase.from('attendance').select('date, status')
        .eq('child_id', childId).gte('date', thirtyAgo).order('date', { ascending: false }),
      supabase.from('health_records').select('type, description, created_at')
        .eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
      supabase.from('observations').select('domain, text, created_at')
        .eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
    ])

    if (!child) return NextResponse.json({ error: 'Kind nicht gefunden' }, { status: 404 })

    const att = attendance ?? []
    const presentDays = att.filter((a: any) => a.status === 'present').length
    const sickDays = att.filter((a: any) => a.status === 'absent_sick').length
    const totalDays = att.length

    const reps = reports ?? []
    const moodCounts: Record<string, number> = {}
    reps.forEach((r: any) => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1 })
    const avgSleep = reps.filter((r: any) => r.sleep_minutes).length > 0
      ? Math.round(reps.filter((r: any) => r.sleep_minutes).reduce((s: number, r: any) => s + r.sleep_minutes, 0) / reps.filter((r: any) => r.sleep_minutes).length)
      : null

    const recentNotes = reps.slice(0, 3).map((r: any) => r.notes).filter(Boolean)
    const recentObservations = (observations ?? []).map((o: any) => `${o.domain}: ${o.text?.slice(0, 80)}`).filter(Boolean)

    const age = (child as any).date_of_birth
      ? Math.floor((Date.now() - new Date((child as any).date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : null

    const prompt = `Du bist paedagogische Fachkraft in einer Kita. Erstelle eine kurze KI-Einschaetzung fuer:

Kind: ${(child as any).first_name} ${(child as any).last_name}${age ? ` (${age} Jahre)` : ''}
Anwesenheit (30 Tage): ${presentDays} Tage anwesend, ${sickDays} Tage krank, ${totalDays} Tage insgesamt
Stimmungsverteilung (letzte Berichte): ${JSON.stringify(moodCounts)}
Durchschnittlicher Schlaf: ${avgSleep ? avgSleep + ' Min' : 'unbekannt'}
Gesundheitseintraege: ${(healthRecords ?? []).map((h: any) => h.type).join(', ') || 'keine'}
Beobachtungen: ${recentObservations.join(' | ') || 'keine'}
Notizen: ${recentNotes.join(' | ') || 'keine'}

Erstelle 2-3 paedagogische Hinweise als JSON-Array:
[{"typ":"beobachtung","text":"..."},{"typ":"empfehlung","text":"..."}]
Typen: "beobachtung", "empfehlung" oder "info". Nur JSON, kein Markdown.`

    const t0 = Date.now()
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const durationMs = Date.now() - t0

    const hinweise = await parseAiJson<any[]>((msg.content[0] as any).text, prompt)

    logAiUsage(supabase, {
      feature: 'kind-snapshot',
      siteId,
      userId: user.id,
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
      durationMs,
    })

    return NextResponse.json({
      hinweise,
      stats: { presentDays, sickDays, totalDays, moodCounts },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
