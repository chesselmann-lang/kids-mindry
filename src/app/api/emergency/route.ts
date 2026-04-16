import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToSite } from '@/lib/push'

const TYPE_LABELS: Record<string, string> = {
  closure: '🚪 Notschließung',
  evacuation: '🚒 Evakuierung',
  lockdown: '🔒 Lockdown',
  medical: '🏥 Medizinischer Notfall',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, site_id').eq('id', user.id).single()

  const isAdmin = ['admin'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { type, message } = await req.json()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const label = TYPE_LABELS[type] ?? '🚨 Notfall'
  const body = message || 'Bitte beachten Sie die Anweisungen des Kita-Teams.'

  // Feed-Announcement erstellen (pinned)
  await (supabase as any).from('announcements').insert({
    site_id: siteId,
    author_id: user.id,
    title: `NOTFALL: ${label}`,
    body: body,
    pinned: true,
    published_at: new Date().toISOString(),
  })

  // Push an alle Nutzer
  await sendPushToSite(supabase, siteId, {
    title: `⚠️ NOTFALL: ${label}`,
    body: body,
    url: '/feed',
    icon: '/icon-192.png',
  })

  // Audit-Log
  await supabase.from('audit_logs').insert({
    action: 'emergency_alert',
    user_id: user.id,
    changes: { type, message: body },
  })

  return NextResponse.json({ success: true })
}
