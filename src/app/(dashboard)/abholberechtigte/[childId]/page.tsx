import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Phone, UserCheck, Trash2 } from 'lucide-react'
import PickupManager from './pickup-manager'
import AiAbholberechtigte from './ai-abholberechtigte'

export const metadata = { title: 'Abholberechtigte' }

export default async function AbholberechtigtePage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  // Access check: parent must be guardian of this child
  if (!isStaff) {
    const { data: guardian } = await supabase
      .from('guardians').select('id').eq('user_id', user.id).eq('child_id', params.childId).maybeSingle()
    if (!guardian) redirect('/mein-kind')
  }

  const { data: child } = await supabase
    .from('children').select('first_name, last_name').eq('id', params.childId).single()
  if (!child) notFound()

  const { data: pickupPersons } = await supabase
    .from('pickup_persons')
    .select('*')
    .eq('child_id', params.childId)
    .order('full_name')

  return (
    <div className="space-y-4">
      <AiAbholberechtigte childId={params.childId} />
      <PickupManager
        childId={params.childId}
        childName={`${child.first_name} ${child.last_name}`}
        initialPersons={(pickupPersons ?? []) as any[]}
        userId={user.id}
      />
    </div>
  )
}
