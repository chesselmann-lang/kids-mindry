import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import AiQRCodesAnalyse from './ai-qrcodes-analyse'

export const metadata = { title: 'QR-Codes' }

function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=1e293b&margin=10`
}

export default async function QRCodesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, group_id, groups(name, color)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('first_name')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR-Codes</h1>
          <p className="text-sm text-gray-400">Check-in & Anwesenheit</p>
        </div>
      </div>

      <AiQRCodesAnalyse />

      <div className="card p-4 bg-brand-50 border-none">
        <p className="text-sm text-brand-800 font-medium">So funktioniert's</p>
        <p className="text-xs text-brand-600 mt-1">
          Jedes Kind hat einen individuellen QR-Code. Eltern scannen diesen beim Bringen/Abholen,
          um die Anwesenheit automatisch zu erfassen.
        </p>
      </div>

      {(!children || children.length === 0) ? (
        <div className="card p-10 text-center">
          <QrCode size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Keine aktiven Kinder gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(children as any[]).map(child => {
            const checkinUrl = `${baseUrl}/checkin/${child.id}`
            return (
              <div key={child.id} className="card p-3 text-center">
                {/* QR Code via external API */}
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl(checkinUrl)}
                    alt={`QR Code ${child.first_name}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {child.first_name} {child.last_name}
                </p>
                {child.groups?.name && (
                  <p className="text-[10px] text-gray-400">{child.groups.name}</p>
                )}
                <a href={checkinUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[10px] text-brand-600 hover:underline">
                  <ExternalLink size={9} /> Link öffnen
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
