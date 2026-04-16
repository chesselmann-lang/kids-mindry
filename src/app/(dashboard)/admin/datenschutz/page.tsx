import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Camera, Clock, Users, CheckCircle2 } from 'lucide-react'
import AiDatenschutzCheck from './ai-datenschutz-check'
import DsgvoExportButton from '@/components/ui/dsgvo-export-button'

export const metadata = { title: 'Datenschutz-Übersicht' }

export default async function DatenschutzPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase
      .from('children')
      .select('id, first_name, last_name, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('last_name'),
    supabase
      .from('groups')
      .select('id, name, color')
      .eq('site_id', siteId),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))
  const childIds = (children ?? []).map((c: any) => c.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let guardians: any[] = []
  if (childIds.length > 0) {
    const { data } = await supabase
      .from('guardians')
      .select('id, child_id, full_name, relationship, consent_photos, consent_signed_at')
      .in('child_id', childIds)
    guardians = data ?? []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guardiansByChild: Record<string, any[]> = {}
  for (const g of guardians) {
    if (!guardiansByChild[g.child_id]) guardiansByChild[g.child_id] = []
    guardiansByChild[g.child_id].push(g)
  }

  const totalChildren = children?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consentFull = (children ?? []).filter((c: any) => {
    const gs = guardiansByChild[c.id] ?? []
    return gs.length > 0 && gs.every((g: any) => g.consent_photos)
  }).length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consentPartial = (children ?? []).filter((c: any) => {
    const gs = guardiansByChild[c.id] ?? []
    return gs.length > 0 && gs.some((g: any) => g.consent_photos) && !gs.every((g: any) => g.consent_photos)
  }).length
  const consentMissing = totalChildren - consentFull - consentPartial

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Datenschutz</h1>
          <p className="text-sm text-gray-400">Foto-Einwilligungen im Überblick</p>
        </div>
      </div>

      <AiDatenschutzCheck />

      {/* Zusammenfassung */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{consentFull}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vollständig</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{consentPartial}</p>
          <p className="text-xs text-gray-500 mt-0.5">Teilweise</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{consentMissing}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ausstehend</p>
        </div>
      </div>

      {/* Hinweis */}
      <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl text-xs text-blue-700">
        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Einwilligungen können pro Erziehungsberechtigten unter
          {' '}<strong>Kinder → Kind → Verwalten</strong> ein- oder ausgeschaltet werden.
          Änderungen werden sofort gespeichert und mit Datum versehen.
        </span>
      </div>

      {/* Kinderliste */}
      <div className="space-y-3">
        {(children ?? []).map((child: any) => {
          const gs = guardiansByChild[child.id] ?? []
          const allConsent = gs.length > 0 && gs.every((g: any) => g.consent_photos)
          const someConsent = gs.some((g: any) => g.consent_photos)
          const noGuardians = gs.length === 0
          const group = child.group_id ? groupMap[child.group_id] : null

          return (
            <div key={child.id} className="card p-4">
              {/* Kind Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: group?.color ?? '#3B6CE8' }}
                  >
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{child.first_name} {child.last_name}</p>
                    {group && <p className="text-xs text-gray-400">{group.name}</p>}
                  </div>
                </div>

                {noGuardians ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users size={11} /> Kein Vormund
                  </span>
                ) : allConsent ? (
                  <span className="text-xs font-medium text-green-700 flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={11} /> Vollständig
                  </span>
                ) : someConsent ? (
                  <span className="text-xs font-medium text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Clock size={11} /> Teilweise
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-600 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full">
                    <Clock size={11} /> Ausstehend
                  </span>
                )}
              </div>

              {/* Vormund-Einwilligungen */}
              {gs.length > 0 && (
                <div className="space-y-1.5 py-2 border-t border-gray-100">
                  {gs.map((g: any) => (
                    <div key={g.id} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {g.full_name}
                        <span className="text-gray-400 ml-1 capitalize">({g.relationship})</span>
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${
                        g.consent_photos ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <Camera size={10} />
                        {g.consent_photos
                          ? `Erteilt${g.consent_signed_at ? ' · ' + new Date(g.consent_signed_at).toLocaleDateString('de-DE') : ''}`
                          : 'Ausstehend'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {noGuardians && (
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  Keine Erziehungsberechtigten hinterlegt
                </p>
              )}

              <div className="mt-2 pt-2 border-t border-gray-50 space-y-2">
                <Link
                  href={`/admin/kinder/${child.id}/guardians`}
                  className="text-xs text-brand-600 font-medium"
                >
                  Einwilligungen verwalten →
                </Link>
                <DsgvoExportButton
                  childId={child.id}
                  childName={`${child.first_name} ${child.last_name}`}
                />
              </div>
            </div>
          )
        })}

        {totalChildren === 0 && (
          <div className="card p-10 text-center">
            <ShieldCheck size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Noch keine aktiven Kinder erfasst</p>
          </div>
        )}
      </div>
    </div>
  )
}
