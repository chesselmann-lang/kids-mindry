export const revalidate = 900

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { startOfMonth, endOfMonth, format, eachDayOfInterval, getDay, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'



export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  const workDays = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) })
    .filter(d => getDay(d) >= 1 && getDay(d) <= 5).length

  const [
    { data: groups },
    { data: children },
    { data: waitlist },
    { data: attendance },
    { data: leavingChildren },
  ] = await Promise.all([
    supabase.from('groups').select('id, name, color, capacity').eq('site_id', siteId).order('name'),
    supabase.from('children').select('id, group_id, status, date_of_birth, care_days').eq('site_id', siteId),
    supabase.from('children').select('id, date_of_birth, requested_start_date').eq('site_id', siteId).eq('status', 'waitlist'),
    supabase.from('attendance').select('child_id, date, status').eq('site_id', siteId)
      .gte('date', monthStart).lte('date', monthEnd),
    supabase.from('children').select('id, group_id, care_end_date')
      .eq('site_id', siteId).eq('status', 'active')
      .not('care_end_date', 'is', null)
      .gte('care_end_date', monthStart),
  ])

  const activeChildren = (children ?? []).filter((c: any) => c.status === 'active')
  const allGroups = (groups ?? []) as any[]
  const allAttendance = (attendance ?? []) as any[]

  const groupStats = allGroups.map(g => {
    const groupChildren = activeChildren.filter((c: any) => c.group_id === g.id)
    const enrolled = groupChildren.length
    const capacity = g.capacity ?? 0
    const utilization = capacity > 0 ? Math.round(enrolled / capacity * 100) : 0

    // Average daily attendance this month
    const presentThisMonth = allAttendance.filter((a: any) =>
      groupChildren.some((c: any) => c.id === a.child_id) && a.status === 'present'
    ).length
    const avgAttendance = workDays > 0 ? Math.round(presentThisMonth / (enrolled || 1) / workDays * 100) : 0

    return { name: g.name, enrolled, capacity, utilization, avgAttendance }
  })

  const totalCapacity = allGroups.reduce((s: number, g: any) => s + (g.capacity ?? 0), 0)
  const totalEnrolled = activeChildren.length
  const totalWaitlist = (waitlist ?? []).length
  const leavingSoon = (leavingChildren ?? []).length

  const monthLabel = format(today, 'MMMM yyyy', { locale: de })

  const prompt = `Du bist Experte für Kita-Belegungsplanung. Analysiere die Kapazitäten und gib strategische Empfehlungen.

KITA-BELEGUNG (${monthLabel}):
Gesamtkapazität: ${totalCapacity} Plätze
Belegt: ${totalEnrolled} Kinder (${totalCapacity > 0 ? Math.round(totalEnrolled / totalCapacity * 100) : 0}% Auslastung)
Warteliste: ${totalWaitlist} Kinder
Demnächst abgehend: ${leavingSoon} Kinder

GRUPPEN:
${groupStats.map(g => `- ${g.name}: ${g.enrolled}/${g.capacity} (${g.utilization}%), Ø Anwesenheit ${g.avgAttendance}%`).join('\n')}

Erstelle EXAKT dieses JSON:
{
  "gesamtauslastung": ${totalCapacity > 0 ? Math.round(totalEnrolled / totalCapacity * 100) : 0},
  "status": "kritisch"|"niedrig"|"optimal"|"ausgelastet"|"überbelegt",
  "gruppen": [
    {
      "name": "...",
      "auslastung": [0-100],
      "status": "unterbelegt"|"optimal"|"voll"|"überbelegt",
      "empfehlung": "..."
    }
  ],
  "freie_plaetze": ${totalCapacity - totalEnrolled},
  "warteliste_empfehlung": "...",
  "massnahmen": ["...", "...", "..."],
  "prognose": "..."
}

- status Gesamtkita: <60% = niedrig, 60-85% = optimal, 85-100% = ausgelastet, >100% = überbelegt
- Gruppen-status: <50% = unterbelegt, 50-85% = optimal, 85-100% = voll, >100% = überbelegt
- Empfehlung je Gruppe: spezifisch und umsetzbar
- Warteliste: konkrete Empfehlung zu Aufnahmen
- 3 Maßnahmen: priorisiert, sofort umsetzbar
- Prognose: kurze Einschätzung der nächsten 3 Monate (1 Satz)`

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(raw)
  return NextResponse.json({ ...result, meta: { totalCapacity, totalEnrolled, totalWaitlist, leavingSoon, monthLabel } })
}
