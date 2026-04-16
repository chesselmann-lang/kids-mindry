import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMicrosoftTokens, getMicrosoftUserEmail } from '@/lib/microsoft-docs'

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

  const tokens = await getMicrosoftTokens(code)
  if (!tokens.access_token) return NextResponse.redirect(new URL('/dokumente?error=token_failed', req.url))

  const email = await getMicrosoftUserEmail(tokens.access_token)

  const supabase = await createClient()
  await supabase.from('document_integrations').upsert({
    site_id:       siteId,
    provider:      'microsoft',
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token ?? undefined,
    expires_at:    tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : undefined,
    email,
    connected_by:  userId,
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'site_id,provider' })

  return NextResponse.redirect(new URL('/dokumente?connected=microsoft', req.url))
}
