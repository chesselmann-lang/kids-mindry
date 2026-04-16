import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format, parseISO } from 'date-fns'

function icsDate(dateStr: string): string {
  // All-day event format: YYYYMMDD
  return dateStr.replace(/-/g, '')
}

function icsDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let pos = 0
  let first = true
  while (pos < line.length) {
    const chunk = first ? line.slice(0, 75) : ' ' + line.slice(pos, pos + 74)
    parts.push(chunk)
    pos += first ? 75 : 74
    first = false
  }
  return parts.join('\r\n')
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load calendar events
  const [{ data: events }, { data: site }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, title, start_date, end_date, event_type, description')
      .eq('site_id', siteId)
      .gte('start_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(200),
    supabase.from('sites').select('name').eq('id', siteId).single(),
  ])

  const siteName = (site as any)?.name ?? 'KitaHub'
  const now = icsDateTime(new Date())

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//KitaHub//DE`,
    `X-WR-CALNAME:${escapeIcs(siteName)}`,
    'X-WR-TIMEZONE:Europe/Berlin',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const ev of (events ?? [])) {
    const uid = `${ev.id}@kitahub`
    const dtstart = icsDate(ev.start_date)
    // For all-day events, DTEND is exclusive (next day)
    const endDate = ev.end_date ?? ev.start_date
    const dtend = icsDate(
      endDate === ev.start_date
        ? (() => {
            const d = parseISO(endDate)
            d.setDate(d.getDate() + 1)
            return d.toISOString().split('T')[0]
          })()
        : (() => {
            const d = parseISO(endDate)
            d.setDate(d.getDate() + 1)
            return d.toISOString().split('T')[0]
          })()
    )

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART;VALUE=DATE:${dtstart}`)
    lines.push(`DTEND;VALUE=DATE:${dtend}`)
    lines.push(foldLine(`SUMMARY:${escapeIcs(ev.title)}`))
    if (ev.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeIcs(ev.description)}`))
    }
    if (ev.event_type) {
      lines.push(`CATEGORIES:${escapeIcs(ev.event_type)}`)
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const icsContent = lines.join('\r\n') + '\r\n'
  const filename = `kitahub-kalender.ics`

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
}
