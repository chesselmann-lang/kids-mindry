import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format } from 'date-fns'
import { de } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })

  const { searchParams } = new URL(req.url)
  const monthParam = searchParams.get('month')

  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()

  if (monthParam) {
    const [y, m] = monthParam.split('-').map(Number)
    if (!isNaN(y) && !isNaN(m)) { year = y; month = m - 1 }
  }

  const monthStart = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd')

  // Working days in month
  const workDays = eachDayOfInterval({
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  }).filter(d => getDay(d) >= 1 && getDay(d) <= 5)

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase
      .from('children')
      .select('id, first_name, last_name, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('last_name'),
    supabase.from('groups').select('id, name').eq('site_id', siteId),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g.name]))
  const childIds = (children ?? []).map((c: any) => c.id)

  let attendance: any[] = []
  if (childIds.length > 0) {
    const { data } = await supabase
      .from('attendance')
      .select('child_id, status, date')
      .in('child_id', childIds)
      .gte('date', monthStart)
      .lte('date', monthEnd)
    attendance = data ?? []
  }

  // Build per-child stats
  const attByChild: Record<string, Record<string, string>> = {}
  for (const a of attendance) {
    if (!attByChild[a.child_id]) attByChild[a.child_id] = {}
    attByChild[a.child_id][a.date] = a.status
  }

  // CSV Header
  const dateHeaders = workDays.map(d => format(d, 'EE dd.MM', { locale: de }))
  const header = ['Nachname', 'Vorname', 'Gruppe', 'Anwesend', 'Krank', 'Urlaub', 'Sonstig', 'Rate (%)', ...dateHeaders]

  const rows: string[][] = [header]

  for (const child of (children ?? []) as any[]) {
    const dayMap = attByChild[child.id] ?? {}
    let present = 0, sick = 0, vacation = 0, other = 0
    const dayCells = workDays.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const s = dayMap[dateStr]
      if (s === 'present')         { present++;  return 'A' }  // A = anwesend
      if (s === 'absent_sick')     { sick++;     return 'K' }  // K = krank
      if (s === 'absent_vacation') { vacation++; return 'U' }  // U = urlaub
      if (s === 'absent_other')    { other++;    return 'X' }
      return ''
    })
    const rate = workDays.length > 0 ? Math.round(present / workDays.length * 100) : 0
    rows.push([
      child.last_name,
      child.first_name,
      groupMap[child.group_id] ?? '',
      String(present),
      String(sick),
      String(vacation),
      String(other),
      `${rate}%`,
      ...dayCells,
    ])
  }

  const monthLabel = format(new Date(year, month), 'yyyy-MM')
  const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="anwesenheit-${monthLabel}.csv"`,
    },
  })
}
