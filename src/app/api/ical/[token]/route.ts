import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function icsDate(dateStr: string): string {
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
  if (line.length <= 75) return line
  const parts: string[] = []
  let pos = 0, first = true
  while (pos < line.length) {
    const chunk = first ? line.slice(0, 75) : ' ' + line.slice(pos, pos + 74)
    parts.push(chunk)
    pos += first ? 75 : 74
    first = false
  }
  return parts.join('\r\n')
}

// Public iCal feed — no session auth, uses token
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = await createClient()

  const { data: tokenRow } = await supabase
    .from('ical_tokens')
    .select('site_id')
    .eq('token', params.token)
    .single()

  if (!tokenRow) {
    return new NextResponse('Not found', { status: 404 })
  }

  const siteId = tokenRow.site_id

  const [{ data: events }, { data: site }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, starts_at, ends_at, description, location')
      .eq('site_id', siteId)
      .gte('starts_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('starts_at', { ascending: true })
      .limit(500),
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
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    `X-PUBLISHED-TTL:PT1H`,
  ]

  for (const ev of (events ?? [])) {
    const start = new Date(ev.starts_at)
    const end = ev.ends_at ? new Date(ev.ends_at) : new Date(start.getTime() + 60 * 60 * 1000)

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@kitahub`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART:${icsDateTime(start)}`)
    lines.push(`DTEND:${icsDateTime(end)}`)
    lines.push(foldLine(`SUMMARY:${escapeIcs(ev.title)}`))
    if (ev.description) lines.push(foldLine(`DESCRIPTION:${escapeIcs(ev.description)}`))
    if ((ev as any).location) lines.push(foldLine(`LOCATION:${escapeIcs((ev as any).location)}`))
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  return new NextResponse(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, max-age=3600',
    },
  })
}
