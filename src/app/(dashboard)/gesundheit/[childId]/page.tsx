import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Plus, Shield } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import HealthManager from './health-manager'
import AiGesundheitsakte from './ai-gesundheitsakte'

export const metadata = { title: 'Gesundheitsakte' }

const RECORD_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  vaccination: { label: 'Impfung',      color: 'text-green-700',  bg: 'bg-green-100',  emoji: '💉' },
  checkup:     { label: 'Vorsorge',     color: 'text-blue-700',   bg: 'bg-blue-100',   emoji: '🩺' },
  diagnosis:   { label: 'Diagnose',     color: 'text-red-700',    bg: 'bg-red-100',    emoji: '📋' },
  medication:  { label: 'Medikament',   color: 'text-purple-700', bg: 'bg-purple-100', emoji: '💊' },
  allergy:     { label: 'Allergie',     color: 'text-amber-700',  bg: 'bg-amber-100',  emoji: '⚠️' },
  other:       { label: 'Sonstiges',    color: 'text-gray-700',   bg: 'bg-gray-100',   emoji: '📝' },
}

export default async function GesundheitPage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isParent = (profile as any)?.role === 'parent'

  // Access check for parents
  if (isParent) {
    const { data: g } = await supabase
      .from('guardians')
      .select('child_id')
      .eq('user_id', user.id)
      .eq('child_id', params.childId)
      .maybeSingle()
    if (!g) redirect('/feed')
  } else if (!isStaff) {
    redirect('/feed')
  }

  const { data: child } = await supabase
    .from('children')
    .select('id, first_name, last_name')
    .eq('id', params.childId)
    .single()

  if (!child) notFound()

  const { data: records } = await supabase
    .from('health_records')
    .select('*, profiles:created_by(full_name)')
    .eq('child_id', params.childId)
    .eq('is_confidential', false)
    .order('record_date', { ascending: false })

  const c = child as any

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/kinder" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gesundheitsakte</h1>
          <p className="text-sm text-gray-400">{c.first_name} {c.last_name}</p>
        </div>
      </div>

      <AiGesundheitsakte childId={params.childId} />

      {isStaff && (
        <HealthManager childId={params.childId} staffId={user.id} records={(records ?? []) as any[]} />
      )}

      {(!isStaff || !records || records.length === 0) && isParent && (
        <>
          {(!records || records.length === 0) ? (
            <div className="card p-10 text-center">
              <Heart size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Noch keine Einträge vorhanden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(records as any[]).map(r => {
                const cfg = RECORD_TYPE_CONFIG[r.record_type] ?? RECORD_TYPE_CONFIG.other
                return (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{cfg.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-gray-400">
                            {format(parseISO(r.record_date), 'd. MMM yyyy', { locale: de })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{r.title}</p>
                        {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
