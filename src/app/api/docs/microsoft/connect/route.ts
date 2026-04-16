import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMicrosoftAuthUrl } from '@/lib/microsoft-docs'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { data: profile } = await supabase.from('profiles').select('site_id, role').eq('id', user.id).single()
  if (!profile || (profile as any).role !== 'admin') {
    return NextResponse.json({ error: 'Nur Admins können Microsoft verknüpfen' }, { status: 403 })
  }

  const state = Buffer.from(JSON.stringify({ userId: user.id, siteId: (profile as any).site_id })).toString('base64url')
  return NextResponse.redirect(getMicrosoftAuthUrl(state))
}
