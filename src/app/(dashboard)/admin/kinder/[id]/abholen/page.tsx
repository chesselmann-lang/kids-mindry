import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck } from 'lucide-react'
import AbholenManager from './abholen-manager'
import AiAbholen from './ai-abholen'

export const metadata = { title: 'Abholberechtigte' }

export default async function AbholenPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const { data: child } = await supabase
    .from('children').select('id, first_name, last_name').eq('id', params.id).single()
  if (!child) return notFound()

  const { data: pickupPersons } = await supabase
    .from('pickup_persons')
    .select('*')
    .eq('child_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/kinder/${params.id}`} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Abholberechtigte</h1>
          <p className="text-sm text-gray-400">{(child as any).first_name} {(child as any).last_name}</p>
        </div>
      </div>

      <AiAbholen childId={params.id} />

      <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl text-xs text-amber-700">
        <UserCheck size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Nur hier eingetragene Personen (zusätzlich zu den Erziehungsberechtigten) sind berechtigt,
          das Kind abzuholen. Bitte Ausweise bei der Abholung kontrollieren.
        </span>
      </div>

      <AbholenManager
        childId={params.id}
        pickupPersons={(pickupPersons ?? []) as any[]}
      />
    </div>
  )
}
