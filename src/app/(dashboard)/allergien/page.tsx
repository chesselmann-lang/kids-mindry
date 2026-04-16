import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import AiAllergienAnalyse from './ai-allergien-analyse'

export const metadata = { title: 'Allergien & Unverträglichkeiten' }

export default async function AllergienPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase.from('children')
      .select('id, first_name, last_name, group_id, allergies, dietary_restrictions, medical_notes')
      .eq('site_id', siteId).eq('status', 'active').order('first_name'),
    supabase.from('groups').select('id, name, color').eq('site_id', siteId),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))

  // Children with any allergy / dietary / medical info
  const withAllergies = (children ?? []).filter((c: any) =>
    (c.allergies && c.allergies.length > 0) ||
    (c.dietary_restrictions && c.dietary_restrictions.length > 0) ||
    c.medical_notes
  )

  // Build allergy frequency map
  const allergyFreq: Record<string, number> = {}
  ;(children ?? []).forEach((c: any) => {
    const items = [
      ...(Array.isArray(c.allergies) ? c.allergies : c.allergies ? [c.allergies] : []),
      ...(Array.isArray(c.dietary_restrictions) ? c.dietary_restrictions : c.dietary_restrictions ? [c.dietary_restrictions] : []),
    ]
    items.forEach((a: string) => {
      allergyFreq[a] = (allergyFreq[a] ?? 0) + 1
    })
  })
  const topAllergies = Object.entries(allergyFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Allergien & Unverträglichkeiten</h1>
          <p className="text-sm text-gray-400">{withAllergies.length} Kinder betroffen</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
      </div>

      <AiAllergienAnalyse />

      {/* Summary bar */}
      {topAllergies.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Häufigste Allergien</p>
          <div className="flex flex-wrap gap-2">
            {topAllergies.map(([name, count]) => (
              <span key={name}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                ⚠️ {name}
                <span className="bg-amber-200 text-amber-900 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{count}×</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {withAllergies.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertTriangle size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Allergien oder Unverträglichkeiten erfasst</p>
          <p className="text-xs text-gray-400 mt-1">Daten können im Kinderprofil hinterlegt werden.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {withAllergies.map((child: any) => {
            const group = child.group_id ? groupMap[child.group_id] : null
            const allergies = Array.isArray(child.allergies) ? child.allergies : child.allergies ? [child.allergies] : []
            const dietary  = Array.isArray(child.dietary_restrictions) ? child.dietary_restrictions : child.dietary_restrictions ? [child.dietary_restrictions] : []

            return (
              <Link key={child.id} href={`/kinder/${child.id}`}
                className="card p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow block">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: group?.color ?? '#3B6CE8' }}>
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{child.first_name} {child.last_name}</p>
                    {group && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: (group.color ?? '#3B6CE8') + '20', color: group.color ?? '#3B6CE8' }}>
                        {group.name}
                      </span>
                    )}
                  </div>
                  {allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {allergies.map((a: string) => (
                        <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                          🚫 {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dietary.map((d: string) => (
                        <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">
                          🥗 {d}
                        </span>
                      ))}
                    </div>
                  )}
                  {child.medical_notes && (
                    <p className="text-xs text-gray-500 mt-1.5 italic leading-relaxed">{child.medical_notes}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-2">
        Daten werden aus den Kinderprofilen geladen · bei Änderungen Kindprofil bearbeiten
      </p>
    </div>
  )
}
