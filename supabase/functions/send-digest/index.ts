import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL        = Deno.env.get('APP_URL') ?? 'https://kids.mindry.de'
const FROM_EMAIL     = Deno.env.get('DIGEST_FROM_EMAIL') ?? 'KitaHub <noreply@kids.mindry.de>'

Deno.serve(async (req: Request) => {
  // Allow cron invocations via Authorization header
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${SERVICE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!RESEND_API_KEY) {
    return new Response('RESEND_API_KEY not configured', { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Get all sites
  const { data: sites } = await supabase.from('sites').select('id, name')
  if (!sites) return new Response('No sites', { status: 200 })

  let sent = 0
  let errors = 0

  for (const site of sites) {
    // Get parents who have email_digest = true in notification_settings
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('user_id, profiles!inner(full_name, site_id)')
      .eq('profiles.site_id', site.id)

    if (!settings || settings.length === 0) continue

    // Get yesterday's announcements
    const { data: announcements } = await supabase
      .from('announcements')
      .select('title, body, type')
      .eq('site_id', site.id)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get yesterday's events
    const { data: events } = await supabase
      .from('events')
      .select('title, starts_at, location')
      .eq('site_id', site.id)
      .gte('created_at', yesterday)
      .order('starts_at', { ascending: true })
      .limit(5)

    if ((!announcements || announcements.length === 0) && (!events || events.length === 0)) {
      continue // Nothing to report
    }

    for (const setting of settings) {
      const profile = (setting as any).profiles
      if (!profile) continue

      // Get user email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(setting.user_id)
      if (!user?.email) continue

      const html = buildDigestHtml({
        siteName: site.name,
        userName: profile.full_name ?? 'Hallo',
        announcements: announcements ?? [],
        events: events ?? [],
        appUrl: APP_URL,
      })

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: user.email,
          subject: `${site.name} – Tägliche Zusammenfassung`,
          html,
        }),
      })

      if (res.ok) { sent++ } else { errors++ }
    }
  }

  return new Response(JSON.stringify({ sent, errors }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

interface DigestParams {
  siteName: string
  userName: string
  announcements: { title: string; body: string; type: string }[]
  events: { title: string; starts_at: string; location: string | null }[]
  appUrl: string
}

function buildDigestHtml({ siteName, userName, announcements, events, appUrl }: DigestParams): string {
  const annHtml = announcements.map(a => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0">
        <strong style="font-size:14px;color:#1a1a1a">${esc(a.title)}</strong>
        <p style="margin:4px 0 0;font-size:13px;color:#666">${esc(a.body?.slice(0, 120) ?? '')}…</p>
      </td>
    </tr>`).join('')

  const evtHtml = events.map(e => {
    const date = new Date(e.starts_at).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
    return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0">
        <strong style="font-size:14px;color:#1a1a1a">${esc(e.title)}</strong>
        <p style="margin:4px 0 0;font-size:13px;color:#666">${date}${e.location ? ' · ' + esc(e.location) : ''}</p>
      </td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <tr><td style="background:#1A3C5E;padding:24px 32px">
    <h1 style="margin:0;color:#fff;font-size:22px">${esc(siteName)}</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:13px">Tägliche Zusammenfassung</p>
  </td></tr>
  <tr><td style="padding:24px 32px">
    <p style="margin:0 0 20px;font-size:15px;color:#333">Hallo ${esc(userName)},</p>
    ${announcements.length > 0 ? `
    <h2 style="font-size:14px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Pinnwand</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${annHtml}</table>` : ''}
    ${events.length > 0 ? `
    <h2 style="font-size:14px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:.05em;margin:16px 0 8px">Termine</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${evtHtml}</table>` : ''}
    <div style="margin-top:24px;text-align:center">
      <a href="${appUrl}" style="display:inline-block;padding:12px 24px;background:#1A3C5E;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:500">Zur App öffnen →</a>
    </div>
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center">
    <p style="margin:0;font-size:12px;color:#999">Diese E-Mail wurde von KitaHub generiert · <a href="${appUrl}/benachrichtigungen/einstellungen" style="color:#1A3C5E">Abmelden</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
