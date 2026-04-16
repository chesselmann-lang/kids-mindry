import webpush from 'web-push'

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@kitahub.de'

let configured = false
function ensureVapid() {
  if (!configured && VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
    configured = true
  }
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

export async function sendPushToUser(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T> ? T : never,
  userId: string,
  payload: PushPayload
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return
  ensureVapid()

  const { data: subs } = await (supabase as any)
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  const message = JSON.stringify({
    ...payload,
    icon: payload.icon ?? '/icon-192.png',
    badge: '/badge-72.png',
    url: payload.url ?? '/',
  })

  const results = await Promise.allSettled(
    subs.map((sub: any) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        message,
        { TTL: 86400 }
      )
    )
  )

  // Clean up expired/invalid subscriptions
  const toDelete: string[] = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'rejected') {
      const err = r.reason as any
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        toDelete.push(subs[i].endpoint)
      }
    }
  }
  if (toDelete.length > 0) {
    await (supabase as any).from('push_subscriptions')
      .delete()
      .in('endpoint', toDelete)
      .eq('user_id', userId)
  }
}

export async function sendPushToSite(
  supabase: any,
  siteId: string,
  payload: PushPayload
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return
  ensureVapid()

  // Get all users of this site
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('site_id', siteId)

  if (!profiles) return

  await Promise.allSettled(
    profiles.map((p: any) => sendPushToUser(supabase, p.id, payload))
  )
}
