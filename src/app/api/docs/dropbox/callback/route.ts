import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getDropboxTokens, getDropboxUserEmail } from '@/lib/dropbox'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect('/dokumente?error=' + (error ?? 'missing_code'))
  }

  let userId: string, siteId: string
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = parsed.userId
    siteId = parsed.siteId
  } catch {
    return NextResponse.redirect('/dokumente?error=bad_state')
  }

  const tokens = await getDropboxTokens(code)
  if (!tokens.access_token) {
    return NextResponse.redirect('/dokumente?error=token_exchange_failed')
  }

  const email = await getDropboxUserEmail(tokens.access_token)

  const supabase = await createClient()
  await supabase.from('document_integrations').upsert({
    site_id: siteId,
    provider: 'dropbox',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null,
    email,
    connected_by: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'site_id,provider' })

  return NextResponse.redirect('/dokumente?connected=dropbox')
}
