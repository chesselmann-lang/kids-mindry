import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConsentManager from './consent-manager'
import AiEinwilligungen from './ai-einwilligungen'

export const metadata = { title: 'Einwilligungen' }

export default async function EinwilligungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  // Staff → redirect to admin GDPR page
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (isStaff) redirect('/admin/datenschutz')

  // Load this parent's guardian records with children
  const { data: guardians } = await supabase
    .from('guardians')
    .select('id, child_id, full_name, consent_photos, consent_signed_at, children(id, first_name, last_name, date_of_birth)')
    .eq('user_id', user.id)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einwilligungen</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Datenschutz & Foto-Einwilligungen für Ihre Kinder
        </p>
      </div>
      <AiEinwilligungen />
      <ConsentManager guardians={(guardians ?? []) as any[]} />
    </div>
  )
}
