import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/feed'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      const meta = data.user.user_metadata ?? {}
      const role = meta.role || 'parent'
      const siteId = meta.site_id || process.env.NEXT_PUBLIC_DEFAULT_SITE_ID

      // Ensure profile is up to date (the DB trigger creates it on insert,
      // but full_name / role may come from the invite metadata)
      if (meta.full_name || meta.role || meta.site_id) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: meta.full_name || data.user.email?.split('@')[0] || '',
          role,
          site_id: siteId,
        }, { onConflict: 'id', ignoreDuplicates: false })
      }

      // Smart redirect: if this was an invite link (next=/willkommen),
      // send parents to onboarding, staff to feed
      const isInviteFlow = next === '/willkommen'
      if (isInviteFlow) {
        const redirectTarget = role === 'parent' ? '/onboarding' : '/feed'
        return NextResponse.redirect(`${origin}${redirectTarget}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
