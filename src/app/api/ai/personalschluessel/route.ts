export const revalidate = 900

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'



export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: children },
    { data: staff },
    { data: groups },
    { data: todayAttendance },
    { data: staffAbsences },
  ] = await Promise.all([
    supabase.from('children').select('id, group_id, date_of_birth').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('profiles').select('id, role, full_name').eq('site_id', siteId)
      .in('role', ['educator', 'group_lead', 'caretaker']),
    supabase.from('groups').select('id, name, capacity').eq('site_id', siteId),
    supabase.from('attendance').select('child_id, status').eq('site_id', siteId).eq('date', today),
    supabase.from('absence_requests').select('user_id, start_date, end_date, status')
      .eq('site_id', siteId).lte('start_date', today).gte('end_date', today).eq('status', 'approved'),
  ])

  const allChildren = (children ?? []) as any[]
  const allStaff = (staff ?? []) as any[]
  const allGroups = (groups ?? []) as any[]
  const todayAtt = (todayAttendance ?? []) as any[]
  const absentStaff = new Set(((staffAbsences ?? []) as any[]).map((a: any) => a.user_id))

  // Present children today
  const presentChildIds = new Set(todayAtt.filter((a: any) => a.status === 'present').map((a: any) => a.child_id))
  const presentChildren = allChildren.filter(c => presentChildIds.has(c.id))
  const presentCount = presentChildren.length
  const totalActiveChildren = allChildren.length

  // Available staff today
  const availableStaff = allStaff.filter(s => !absentStaff.has(s.id))
  const staffCount = availableStaff.length

  // Age groups for ratio calculation (German standards: KiTaG/BKJHG)
  const now = new Date()
  const infants = presentChildren.filter((c: any) => {
    if (!c.date_of_birth) return false
    const age = (now.getTime() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return age < 2
  }).length
  const toddlers = presentChildren.filter((c: any) => {
    if (!c.date_of_birth) return false
    const age = (now.getTime() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return age >= 2 && age < 3
  }).length
  const preschool = presentCount - infants - toddlers

  // Simplified ratio (mix of age groups, Germany average ~1:9 for Kiga, 1:4 for Krippe)
  const requiredStaff = Math.ceil(infants / 4) + Math.ceil(toddlers / 6) + Math.ceil(preschool / 9)
  const staffRatio = staffCount > 0 ? (presentCount / staffCount).toFixed(1) : 'N/A'
  const isCompliant = staffCount >= requiredStaff

  const groupStats = allGroups.map(g => {
    const groupKinder = presentChildren.filter((c: any) => c.group_id === g.id).length
    return { name: g.name, kinder: groupKinder, capacity: g.capacity ?? 0 }
  })

  const prompt = `Du bist Experte für Kita-Personalplanung und deutsches Kita-Recht. Analysiere den aktuellen Personalschlüssel.

HEUTE (${today}):
Anwesende Kinder: ${presentCount} (von ${totalActiveChildren} gesamt)
Verfügbares Personal: ${staffCount} (${absentStaff.size} abwesend)
Aktueller Betreuungsschlüssel: 1:${staffRatio}
Benötigtes Mindestpersonal (Schätzung): ${requiredStaff} Personen
Altersverteilung: ${infants} Krippenkinder (0–2J), ${toddlers} Übergangskinder (2–3J), ${preschool} Kindergartenkinder
Gruppen: ${groupStats.map(g => `${g.name}: ${g.kinder} Kinder`).join(', ')}

Erstelle EXAKT dieses JSON:
{
  "status": "ok"|"kritisch"|"warnung",
  "schluessel": "${staffRatio}",
  "benoetigtes_personal": ${requiredStaff},
  "verfuegbares_personal": ${staffCount},
  "compliance": ${isCompliant},
  "bewertung": "...",
  "massnahmen": ["...", "...", "..."],
  "hinweis": "..."
}

- Status: ok wenn compliant und Schlüssel ≤ 1:10, warnung wenn grenzwertig, kritisch wenn non-compliant
- Bewertung: kurze Einschätzung der Situation (1–2 Sätze)
- 3 konkrete Maßnahmen (priorisiert)
- Hinweis: wichtigster rechtlicher/praktischer Hinweis für heute`

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(raw)
  return NextResponse.json({ ...result, meta: { presentCount, staffCount, totalActiveChildren, absentStaff: absentStaff.size } })
}
