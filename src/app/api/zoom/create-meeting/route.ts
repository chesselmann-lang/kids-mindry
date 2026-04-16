import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createZoomMeeting, refreshZoomToken } from '@/lib/zoom'
import { z } from 'zod'

const schema = z.object({
  topic: z.string().min(1).max(200),
  startTime: z.string(), // ISO 8601
  durationMinutes: z.number().int().min(15).max(480),
  agenda: z.string().optional(),
  childId: z.string().uuid().optional(),
  elterngespraechId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!['admin', 'educator', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const siteId = (profile as any).site_id

  // Get Zoom integration
  const { data: zoomInt } = await supabase
    .from('zoom_integrations')
    .select('*')
    .eq('site_id', siteId)
    .single()

  if (!zoomInt) {
    return NextResponse.json({ error: 'Zoom not connected' }, { status: 400 })
  }

  // Refresh token if needed
  let accessToken = zoomInt.access_token
  if (zoomInt.expires_at && new Date(zoomInt.expires_at) < new Date()) {
    const refreshed = await refreshZoomToken(zoomInt.refresh_token ?? '')
    if (refreshed.access_token) {
      accessToken = refreshed.access_token
      await supabase.from('zoom_integrations').update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token ?? zoomInt.refresh_token,
        expires_at: refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }).eq('site_id', siteId)
    }
  }

  const meeting = await createZoomMeeting(accessToken, {
    topic: body.data.topic,
    startTime: body.data.startTime,
    durationMinutes: body.data.durationMinutes,
    agenda: body.data.agenda,
  })

  // Store meeting reference
  await supabase.from('zoom_meetings').insert({
    site_id: siteId,
    meeting_id: String(meeting.id),
    topic: meeting.topic,
    join_url: meeting.join_url,
    start_url: meeting.start_url,
    password: meeting.password,
    start_time: meeting.start_time,
    duration: meeting.duration,
    child_id: body.data.childId ?? null,
    elterngespräch_id: body.data.elterngespraechId ?? null,
    created_by: user.id,
  })

  return NextResponse.json({
    meetingId: meeting.id,
    joinUrl: meeting.join_url,
    startUrl: meeting.start_url,
    password: meeting.password,
  })
}
