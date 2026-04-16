export const revalidate = 3600 // 1h Cache — Eltern-Feed ändert sich nicht minütlich

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { applyAiRateLimit, parseAiJson, logAiUsage } from '@/lib/ai-utils'
import { subDays, format } from 'date-fns'
import { de } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = applyAiRateLimit(user.id)
  if (rl) return rl

  // Nur Eltern dürfen diesen Endpunkt nutzen
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isParent = !['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isParent) return NextResponse.json({ error: 'Nur für Eltern/Erziehungsberechtigte' }, { status: 403 })

  // Kind des eingeloggten Elternteils ermitteln
  const { data: guardians } = await supabase
    .from('guardians')
    .select('child_id, children(first_name, last_name, date_of_birth, gender, groups(name))')
    .eq('user_id', user.id)

  const guardian = (guardians ?? [])[0] as any
  if (!guardian?.children) {
    return NextResponse.json({ error: 'Kein Kind verknüpft' }, { status: 404 })
  }

  const childId = guardian.child_id
  const child = guardian.children as any
  const childName = `${child.first_name}`
  const gender = child.gender === 'female' ? 'w' : 'm'

  const since7d = subDays(new Date(), 7).toISOString()
  const since14d = subDays(new Date(), 14).toISOString()
  const todayStr = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })
  const weekLabel = `${format(subDays(new Date(), 7), "d.M.", { locale: de })} – ${format(new Date(), "d.M.yyyy", { locale: de })}`

  const [
    { data: reports },
    { data: attendance },
    { data: milestones },
  ] = await Promise.all([
    supabase
      .from('daily_reports')
      .select('report_date, mood, notes, activities')
      .eq('child_id', childId)
      .gte('report_date', since7d.split('T')[0])
      .order('report_date', { ascending: false })
      .limit(7),
    supabase
      .from('attendance')
      .select('date, status')
      .eq('child_id', childId)
      .gte('date', since14d.split('T')[0])
      .order('date', { ascending: false }),
    (supabase as any)
      .from('milestones')
      .select('title, category, achieved_at')
      .eq('child_id', childId)
      .gte('achieved_at', since14d)
      .order('achieved_at', { ascending: false })
      .limit(5),
  ])

  const moodDE: Record<string, string> = {
    great: 'sehr gut', good: 'gut', okay: 'ausgeglichen', sad: 'eher ruhig', sick: 'nicht fit',
  }

  const reportsSummary = (reports ?? []).map((r: any) =>
    `${r.report_date}: Stimmung ${moodDE[r.mood] ?? r.mood}${r.notes ? `, Notiz: ${r.notes.slice(0, 80)}` : ''}${r.activities ? `, Aktivitäten: ${r.activities}` : ''}`
  ).join('\n') || 'Keine Berichte für diese Woche'

  const presentDays = (attendance ?? []).filter((a: any) => a.status === 'present').length
  const sickDays = (attendance ?? []).filter((a: any) => a.status === 'absent_sick').length
  const milestonesText = (milestones ?? []).map((m: any) => m.title).join(', ') || 'keine neuen'

  const pronoun = gender === 'w' ? 'sie' : 'er'
  const pronounPoss = gender === 'w' ? 'ihre' : 'seine'

  const prompt = `Du bist eine Kita-Fachkraft, die Eltern liebevoll und professionell über die Entwicklung ihres Kindes informiert.
Schreibe einen wöchentlichen KI-Entwicklungsfeed für die Eltern von ${childName}.

WOCHE: ${weekLabel}
ANWESENHEIT: ${presentDays} Tage anwesend, ${sickDays} Tage krank
NEUE MEILENSTEINE: ${milestonesText}

TAGESBERICHTE DER WOCHE:
${reportsSummary}

Erstelle EXAKT dieses JSON (kein Markdown):
{
  "zusammenfassung": "2-3 herzliche Sätze, wie die Woche für ${childName} war. Positiv und warmherzig.",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "entwicklungsnotiz": "1-2 Sätze über beobachtete Entwicklung oder Fortschritte diese Woche.",
  "tipp_fuer_eltern": "Ein konkreter, alltagspraktischer Tipp den Eltern zuhause umsetzen können.",
  "naechste_woche_ausblick": "1 Satz positiver Ausblick auf nächste Woche.",
  "stimmungstrend": "positiv"
}
stimmungstrend: "positiv", "ausgeglichen" oder "beobachten"
Verwende ${pronoun}/${pronounPoss} für ${childName}. Keine Klammern oder Platzhalter im Text.`

  const t0 = Date.now()
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })
  const durationMs = Date.now() - t0

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const result = await parseAiJson<any>((message.content[0] as any).text, prompt)

  logAiUsage(supabase, {
    feature: 'eltern-entwicklungs-feed',
    siteId,
    userId: user.id,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    durationMs,
  })

  return NextResponse.json({
    ...result,
    childName,
    weekLabel,
    presentDays,
    sickDays,
    newMilestones: (milestones ?? []).length,
    generatedAt: new Date().toISOString(),
  })
}
