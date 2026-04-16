import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, AlertTriangle, Phone } from 'lucide-react'
import AiGesundheitsUeberblick from './ai-gesundheits-ueberblick'

export const metadata = { title: 'Gesundheitsübersicht' }

export default async function AdminGesundheitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Get all active children
  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, group_id, groups(name, color)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('first_name')

  // Get allergy records (health_records with type=allergy)
  const childIds = (children ?? []).map((c: any) => c.id)
  const { data: allergies } = childIds.length > 0
    ? await supabase
        .from('health_records')
        .select('child_id, title, description')
        .in('child_id', childIds)
        .eq('record_type', 'allergy')
    : { data: [] }

  // Map allergies by child
  const allergyMap: Record<string, any[]> = {}
  for (const a of allergies ?? []) {
    if (!allergyMap[(a as any).child_id]) allergyMap[(a as any).child_id] = []
    allergyMap[(a as any).child_id].push(a)
  }

  // Get emergency contacts (pickup_persons marked as emergency)
  const { data: contacts } = childIds.length > 0
    ? await supabase
        .from('emergency_contacts')
        .select('child_id, full_name, relationship, phone, is_primary')
        .in('child_id', childIds)
        .order('is_primary', { ascending: false })
    : { data: [] }

  const contactMap: Record<string, any[]> = {}
  for (const c of contacts ?? []) {
    if (!contactMap[(c as any).child_id]) contactMap[(c as any).child_id] = []
    contactMap[(c as any).child_id].push(c)
  }

  // Children with allergies
  const childrenWithAllergies = (children ?? []).filter((c: any) => allergyMap[c.id]?.length > 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gesundheitsübersicht</h1>
          <p className="text-sm text-gray-400">Allergien & Notfallkontakte</p>
        </div>
      </div>

      <AiGesundheitsUeberblick />

      {/* Allergy overview */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-500" />
          <p className="text-sm font-semibold text-gray-800">Allergien & Unverträglichkeiten</p>
          <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {childrenWithAllergies.length} Kinder
          </span>
        </div>

        {childrenWithAllergies.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Keine Allergien dokumentiert</p>
        ) : (
          <div className="space-y-3">
            {(childrenWithAllergies as any[]).map(child => (
              <div key={child.id} className="border-l-2 border-amber-300 pl-3">
                <Link href={`/gesundheit/${child.id}`} className="text-sm font-medium text-gray-800 hover:text-brand-600">
                  {child.first_name} {child.last_name}
                </Link>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(allergyMap[child.id] ?? []).map((a: any, i: number) => (
                    <span key={i} className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                      {a.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All children with quick links */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Alle Kinder</p>
        <div className="space-y-2">
          {(children as any[] ?? []).map(child => {
            const childAllergies = allergyMap[child.id] ?? []
            const childContacts = contactMap[child.id] ?? []
            return (
              <Link key={child.id} href={`/gesundheit/${child.id}`}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: child.groups?.color ?? '#3B6CE8' }}>
                  {child.first_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{child.first_name} {child.last_name}</p>
                  <p className="text-xs text-gray-400">{child.groups?.name ?? 'Ohne Gruppe'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {childAllergies.length > 0 && (
                    <span className="text-amber-500" title="Allergien vorhanden">⚠️</span>
                  )}
                  {childContacts.length > 0 && (
                    <Phone size={12} className="text-green-500" />
                  )}
                  <span className="text-xs text-gray-400">›</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
