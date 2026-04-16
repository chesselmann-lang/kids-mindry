/**
 * POST /api/push-send
 *
 * Internal Next.js API that calls the Supabase Edge Function `push-notify`.
 * Used by server actions and other API routes to trigger push notifications
 * after creating messages, tagesberichte, announcements, etc.
 *
 * Body: {
 *   recipientIds?: string[]   // omit for site-wide broadcast
 *   title: string
 *   body?: string
 *   url?: string
 *   sourceType?: string
 *   sourceId?: string
 * }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE_ID      = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

export async function POST(req: NextRequest) {
  try {
    // Validate caller is authenticated staff
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { recipientIds, title, body: msgBody, url, sourceType, sourceId } = body

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

    const edgeFnUrl = `${SUPABASE_URL}/functions/v1/push-notify`

    const response = await fetch(edgeFnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        siteId: SITE_ID,
        recipientIds,
        title,
        body: msgBody,
        url,
        sourceType,
        sourceId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('push-notify edge function error:', errorText)
      // Non-fatal: we don't want to fail the main action because of push
      return NextResponse.json({ success: false, error: errorText }, { status: 200 })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('push-send error:', err)
    // Non-fatal
    return NextResponse.json({ success: false, error: String(err) }, { status: 200 })
  }
}
