import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleTokens, getGoogleOAuthClient } from '@/lib/google-docs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) return NextResponse.redirect(new URL('/dokumente?error=missing_params', req.url))

  let userId: string, siteId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
    siteId = decoded.siteId
  } catch {
    return NextResponse.redirect(new URL('/dokumente?error=invalid_state', req.url))
  }

  const tokens = await getGoogleTokens(code)

  // Get user email
  const client = getGoogleOAuthClient()
  client.setCredentials(tokens)
  const oauth2 = new (await import('googleapis')).google.auth.OAuth2()
  oauth2.setCredentials(tokens)
  const userInfo = await (await import('googleapis')).google.oauth2({ version: 'v2', auth: oauth2 }).userinfo.get()
  const email = userInfo.data.email ?? ''

  const supabase = await createClient()
  await supabase.from('document_integrations').upsert({
    site_id:       siteId,
    provider:      'google',
    access_token:  tokens.access_token!,
    refresh_token: tokens.refresh_token ?? undefined,
    expires_at:    tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined,
    email,
    connected_by:  userId,
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'site_id,provider' })

  return NextResponse.redirect(new URL('/dokumente?connected=google', req.url))
}
