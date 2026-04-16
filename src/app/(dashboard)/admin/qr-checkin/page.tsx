import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode } from 'lucide-react'
import QrCheckinClient from './qr-checkin-client'
import AiQrCheckin from './ai-qrcheckin'

export const metadata = { title: 'QR-Code Check-in | Admin' }

export default async function QrCheckinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, group_id, groups(name, color)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('first_name')

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, color')
    .eq('site_id', siteId)
    .order('name')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR-Code Check-in</h1>
          <p className="text-sm text-gray-400">QR-Codes ausdrucken oder anzeigen</p>
        </div>
      </div>

      <AiQrCheckin />

      {/* Info */}
      <div className="flex gap-3 p-4 bg-brand-50 rounded-2xl text-xs text-brand-800">
        <QrCode size={16} className="flex-shrink-0 mt-0.5 text-brand-600" />
        <span>
          Jedes Kind erhält einen persönlichen QR-Code. Eltern scannen diesen morgens am Eingang,
          um ihr Kind an- oder abzumelden. Kein Einloggen nötig – die URL enthält alle Informationen.
        </span>
      </div>

      <QrCheckinClient
        children={(children ?? []) as any[]}
        groups={(groups ?? []) as any[]}
        appUrl={appUrl}
      />
    </div>
  )
}
