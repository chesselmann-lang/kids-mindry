const ZOOM_CLIENT_ID     = process.env.ZOOM_CLIENT_ID!
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!
const ZOOM_REDIRECT_URI  = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de') + '/api/zoom/callback'

export function getZoomAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ZOOM_CLIENT_ID,
    redirect_uri: ZOOM_REDIRECT_URI,
    state,
  })
  return `https://zoom.us/oauth/authorize?${params}`
}

export async function getZoomTokens(code: string) {
  const creds = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: ZOOM_REDIRECT_URI,
    }),
  })
  return res.json()
}

export async function refreshZoomToken(refreshToken: string) {
  const creds = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  return res.json()
}

export async function getZoomUserEmail(accessToken: string): Promise<string> {
  const res = await fetch('https://api.zoom.us/v2/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return data.email ?? ''
}

export interface CreateMeetingOptions {
  topic: string
  startTime: string // ISO 8601
  durationMinutes: number
  agenda?: string
  password?: string
}

export async function createZoomMeeting(accessToken: string, opts: CreateMeetingOptions) {
  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2, // scheduled
      start_time: opts.startTime,
      duration: opts.durationMinutes,
      agenda: opts.agenda ?? '',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
        auto_recording: 'none',
        password: opts.password ?? '',
      },
    }),
  })
  if (!res.ok) throw new Error(`Zoom API error: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function listZoomMeetings(accessToken: string) {
  const res = await fetch('https://api.zoom.us/v2/users/me/meetings?type=upcoming&page_size=30', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return data.meetings ?? []
}
