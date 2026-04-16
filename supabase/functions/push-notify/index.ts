/**
 * Supabase Edge Function: push-notify
 *
 * Called server-side to send Web Push (VAPID) notifications
 * to one or more users in the same site.
 *
 * Request body:
 * {
 *   siteId: string           // required — only send to this site's subscribers
 *   recipientIds?: string[]  // optional — if omitted, sends to ALL site subscribers
 *   title: string
 *   body: string
 *   url?: string             // deep-link within the app
 *   icon?: string
 *   sourceType?: string      // 'message' | 'announcement' | 'tagesbericht' | 'abwesenheit'
 *   sourceId?: string
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Web Push / VAPID implementation using the web-push-compatible approach
// Deno doesn't have the `web-push` npm package natively — we use the
// built-in crypto APIs to sign the VAPID JWT manually.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── VAPID JWT signing ────────────────────────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
  const binary = atob(padded)
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)))
}

async function createVapidJWT(
  audience: string,
  subject: string,
  privateKeyB64: string,
  publicKeyB64: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 12 * 3600

  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))
  )
  const payload = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ aud: audience, exp, sub: subject }))
  )

  const signingInput = `${header}.${payload}`

  // Import the private key (raw PKCS8 for ECDSA P-256)
  const privKeyBytes = base64UrlDecode(privateKeyB64)

  // The private key from VAPID tools is a raw 32-byte scalar —
  // wrap it in the PKCS8 DER structure
  const pkcs8Der = buildPkcs8(privKeyBytes)

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pkcs8Der,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(signingInput),
  )

  const signature = base64UrlEncode(new Uint8Array(sig))
  return `${signingInput}.${signature}`
}

// Build a minimal PKCS8 DER wrapper around a raw 32-byte EC private key scalar
function buildPkcs8(rawPrivKey: Uint8Array): ArrayBuffer {
  // ECPrivateKey ::= SEQUENCE { version INTEGER, privateKey OCTET STRING, publicKey [1] BIT STRING }
  // We only need version + privateKey for importing
  const ecPrivateKey = concatBytes(
    new Uint8Array([0x30, 0x77]), // SEQUENCE (119 bytes — approximate, recalculated below)
    new Uint8Array([0x02, 0x01, 0x01]), // version = 1
    new Uint8Array([0x04, 0x20]), // OCTET STRING, 32 bytes
    rawPrivKey,
    new Uint8Array([0xa0, 0x0a, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]), // OID P-256
  )

  // AlgorithmIdentifier: OID ecPublicKey + OID P-256
  const algId = new Uint8Array([
    0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // ecPublicKey OID
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // P-256 OID
  ])

  // privateKeyInfo SEQUENCE { version 0, algo, key }
  const privKeyInfo = concatBytes(
    new Uint8Array([0x02, 0x01, 0x00]), // version = 0
    algId,
    encodeOctetString(ecPrivateKey),
  )

  return encodeSequence(privKeyInfo).buffer
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

function encodeDerLength(len: number): Uint8Array {
  if (len < 128) return new Uint8Array([len])
  if (len < 256) return new Uint8Array([0x81, len])
  return new Uint8Array([0x82, (len >> 8) & 0xff, len & 0xff])
}

function encodeSequence(content: Uint8Array): Uint8Array {
  return concatBytes(new Uint8Array([0x30]), encodeDerLength(content.length), content)
}

function encodeOctetString(content: Uint8Array): Uint8Array {
  return concatBytes(new Uint8Array([0x04]), encodeDerLength(content.length), content)
}

// ── Web Push request ─────────────────────────────────────────────────────────

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const url = new URL(subscription.endpoint)
    const audience = `${url.protocol}//${url.hostname}`

    const jwt = await createVapidJWT(audience, vapidSubject, vapidPrivateKey, vapidPublicKey)

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt},k=${vapidPublicKey}`,
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: payload,
    })

    return { ok: response.ok, status: response.status }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const vapidPublicKey  = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidSubject    = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:hallo@hesselmann-service.de'

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl     = Deno.env.get('SUPABASE_URL')!
    const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseService)

    const body = await req.json()
    const { siteId, recipientIds, title, body: msgBody, url, icon, sourceType, sourceId } = body

    if (!siteId || !title) {
      return new Response(
        JSON.stringify({ error: 'siteId and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch push subscriptions
    let query = (supabase as any)
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth')
      .eq('site_id', siteId)

    if (recipientIds && recipientIds.length > 0) {
      query = query.in('user_id', recipientIds)
    }

    const { data: subscriptions, error: fetchError } = await query
    if (fetchError) throw fetchError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = JSON.stringify({
      title,
      body: msgBody ?? '',
      icon: icon ?? '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      url: url ?? '/',
    })

    // Send to all subscriptions in parallel (with concurrency limit)
    const CONCURRENCY = 10
    const results: Array<{ userId: string; ok: boolean; status?: number; error?: string }> = []
    const expiredEndpoints: string[] = []

    for (let i = 0; i < subscriptions.length; i += CONCURRENCY) {
      const batch = subscriptions.slice(i, i + CONCURRENCY)
      const batchResults = await Promise.all(
        batch.map(async (sub: any) => {
          const result = await sendPushNotification(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
            vapidPublicKey,
            vapidPrivateKey,
            vapidSubject,
          )
          if (result.status === 410 || result.status === 404) {
            expiredEndpoints.push(sub.endpoint)
          }
          return { userId: sub.user_id, ...result }
        })
      )
      results.push(...batchResults)
    }

    // Remove expired subscriptions (410 Gone = user unsubscribed)
    if (expiredEndpoints.length > 0) {
      await (supabase as any)
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
    }

    // Log notifications (fire-and-forget, best effort)
    const successRecipients = results.filter(r => r.ok).map(r => r.userId)
    if (successRecipients.length > 0 && sourceType) {
      const logRows = successRecipients.map(uid => ({
        site_id: siteId,
        recipient_id: uid,
        title,
        body: msgBody ?? null,
        url: url ?? null,
        source_type: sourceType,
        source_id: sourceId ?? null,
        status: 'sent',
      }))
      await (supabase as any).from('notification_log').insert(logRows)
    }

    const sent = results.filter(r => r.ok).length
    const failed = results.filter(r => !r.ok).length

    return new Response(
      JSON.stringify({ success: true, sent, failed, expired: expiredEndpoints.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('push-notify error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
