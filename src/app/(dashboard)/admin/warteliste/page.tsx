import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ListOrdered, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import WartlisteActions from './warteliste-actions'
import AiWartelisteAnalyse from './ai-warteliste-analyse'

export const metadata = { title: 'Warteliste' }

export default async function WartelistePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children')
    .select('*, groups(name, color)')
    .eq('site_id', siteId)
    .eq('status', 'waitlist')
    .order('created_at', { ascending: true })

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, color')
    .eq('site_id', siteId)
    .order('name')

  const waitlist = (children ?? []) as any[]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Warteliste</h1>
          <p className="text-sm text-gray-400">{waitlist.length} {waitlist.length === 1 ? 'Kind' : 'Kinder'} auf der Warteliste</p>
        </div>
      </div>

      <AiWartelisteAnalyse />

      {waitlist.length === 0 ? (
        <div className="card p-10 text-center">
          <ListOrdered size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-600 text-sm">Keine Kinder auf der Warteliste</p>
          <p className="text-xs text-gray-400 mt-1">Kinder können im Kinderverwaltungs-Bereich hinzugefügt werden.</p>
          <Link href="/admin/kinder/neu" className="btn-primary mt-5 inline-flex">
            Kind hinzufügen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {waitlist.map((child, idx) => (
            <div key={child.id} className="card p-4">
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{child.first_name} {child.last_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {child.date_of_birth && (
                      <span className="text-xs text-gray-400">
                        * {format(new Date(child.date_of_birth), 'd. MMM yyyy', { locale: de })}
                      </span>
                    )}
                    {child.groups && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                        style={{ backgroundColor: child.groups.color }}>
                        {child.groups.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Eingetragen: {format(new Date(child.created_at), 'd. MMM yyyy', { locale: de })}
                    </span>
                  </div>
                </div>

                {/* Edit link */}
                <Link href={`/admin/kinder/${child.id}/bearbeiten`}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>
              </div>

              {/* Actions */}
              <WartlisteActions
                childId={child.id}
                childName={`${child.first_name} ${child.last_name}`}
                groups={(groups ?? []) as any[]}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl text-xs text-blue-700">
        <ListOrdered size={16} className="flex-shrink-0 mt-0.5" />
        <span>Kinder werden in der Reihenfolge angezeigt, in der sie eingetragen wurden (ältester Eintrag zuerst).</span>
      </div>
    </div>
  )
}
