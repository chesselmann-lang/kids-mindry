export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, site_id')
    .eq('id', user.id)
    .single()

  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = format(new Date(), 'yyyy-MM-dd')
  const forceRegen = req.nextUrl.searchParams.get('regen') === '1'

  // ─── Try cached prognose for today ────────────────────────────────────────
  if (!forceRegen) {
    const { data: cached } = await (supabase as any)
      .from('ki_cockpit_prognosen')
      .select('*')
      .eq('einrichtung_id', siteId)
      .eq('datum', today)
      .single()

    if (cached) return NextResponse.json(cached)
  }

  // ─── Collect KPIs ─────────────────────────────────────────────────────────
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const [
    { data: children },
    { data: todayAtt },
    { data: yesterdayAtt },
    { data: unreadMessages },
    { data: openBeobachtungen },
    { data: todayBirthdays },
  ] = await Promise.all([
    supabase.from('children').select('id, first_name, last_name, date_of_birth, status')
      .eq('site_id', siteId).eq('status', 'active'),
    (supabase as any).from('attendance').select('child_id, status, check_in_at')
      .eq('site_id', siteId).eq('date', today),
    (supabase as any).from('attendance').select('child_id, status')
      .eq('site_id', siteId).eq('date', yesterday),
    (supabase as any).from('nachrichten').select('id')
      .eq('site_id', siteId).is('gelesen_at', null).limit(50),
    (supabase as any).from('beobachtungen').select('id, kind_id, datum')
      .eq('site_id', siteId).is('feedback_at', null).gte('datum', yesterday).limit(20),
    supabase.from('children').select('id, first_name, last_name, date_of_birth')
      .eq('site_id', siteId).eq('status', 'active'),
  ])

  const activeChildren = children ?? []
  const totalCount = activeChildren.length
  const presentToday = (todayAtt ?? []).filter((a: any) => a.status === 'present').length
  const presentYesterday = (yesterdayAtt ?? []).filter((a: any) => a.status === 'present').length
  const absentSick = (todayAtt ?? []).filter((a: any) => a.status === 'absent_sick').length
  const unread = (unreadMessages ?? []).length
  const openObs = (openBeobachtungen ?? []).length

  // Birthday check
  const todayMMDD = format(new Date(), 'MM-dd')
  const birthdays = (todayBirthdays ?? []).filter((c: any) => {
    if (!c.date_of_birth) return false
    return format(new Date(c.date_of_birth), 'MM-dd') === todayMMDD
  })

  const attendanceRate = totalCount > 0 ? Math.round((presentToday / totalCount) * 100) : 0
  const yesterdayRate = totalCount > 0 ? Math.round((presentYesterday / totalCount) * 100) : 0
  const trend = attendanceRate - yesterdayRate

  // ─── Build KPI snapshot ────────────────────────────────────────────────────
  const kpis = {
    anwesenheitsquote: attendanceRate,
    anwesend: presentToday,
    abwesend_krank: absentSick,
    gesamt: totalCount,
    trend_vs_gestern: trend,
    ungelesene_nachrichten: unread,
    offene_beobachtungen: openObs,
    geburtstage: birthdays.map((c: any) => `${c.first_name} ${c.last_name}`),
  }

  // ─── Generate KI prognose ─────────────────────────────────────────────────
  const wochentag = format(new Date(), 'EEEE', { locale: de })
  const datumLang = format(new Date(), "d. MMMM yyyy", { locale: de })

  const prompt = `Du bist die KI-Assistentin einer Kindertagesstätte. Heute ist ${wochentag}, der ${datumLang}.

AKTUELLE DATEN:
- Anwesenheit heute: ${presentToday}/${totalCount} Kinder (${attendanceRate}%)
- Trend vs. gestern: ${trend > 0 ? '+' + trend : trend}%
- Krank gemeldet: ${absentSick} Kinder
- Ungelesene Elternnachrichten: ${unread}
- Beobachtungen ohne Feedback: ${openObs}
${birthdays.length > 0 ? `- Geburtstage heute: ${birthdays.map((c: any) => c.first_name).join(', ')}` : ''}

Erstelle eine kurze, motivierende Tagesprognose für das Leitungsteam.
Antworte NUR mit diesem JSON (keine Erklärungen außerhalb):
{
  "begruessung": "Kurze, motivierende Begrüßung für das Team",
  "tagesprognose": "2-3 Sätze: Was erwartet das Team heute? Worauf sollten sie achten?",
  "prioritaeten": [
    {"icon": "🎂"|"📨"|"👁"|"⚠️"|"✅", "text": "Konkrete Priorität für heute"}
  ],
  "stimmung": "positiv"|"neutral"|"aufmerksamkeit"
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const aiResult = JSON.parse(clean)

    // ─── Persist prognose ──────────────────────────────────────────────────
    const prognoseData = {
      einrichtung_id: siteId,
      datum: today,
      prognose_text: aiResult.tagesprognose ?? '',
      kpis: { ...kpis, begruessung: aiResult.begruessung, prioritaeten: aiResult.prioritaeten, stimmung: aiResult.stimmung },
    }

    await (supabase as any)
      .from('ki_cockpit_prognosen')
      .upsert(prognoseData, { onConflict: 'einrichtung_id,datum' })

    return NextResponse.json({
      datum: today,
      begruessung: aiResult.begruessung ?? `Guten Morgen! Schöner ${wochentag}!`,
      tagesprognose: aiResult.tagesprognose ?? '',
      prioritaeten: aiResult.prioritaeten ?? [],
      stimmung: aiResult.stimmung ?? 'neutral',
      kpis,
    })
  } catch (err) {
    console.error('[cockpit-prognose]', err)
    // Return KPIs even if AI fails
    return NextResponse.json({
      datum: today,
      begruessung: `Guten Morgen! Schöner ${wochentag}!`,
      tagesprognose: 'KI-Prognose vorübergehend nicht verfügbar.',
      prioritaeten: [],
      stimmung: 'neutral',
      kpis,
    })
  }
}
