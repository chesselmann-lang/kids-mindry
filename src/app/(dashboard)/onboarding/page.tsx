import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from './onboarding-wizard'
import AiOnboarding from './ai-onboarding'

export const metadata = { title: 'Willkommen' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, onboarding_completed').eq('id', user.id).single()

  // Skip onboarding for staff
  if ((profile as any)?.role !== 'parent') redirect('/feed')

  // If already completed, go to feed
  if ((profile as any)?.onboarding_completed) redirect('/feed')

  // Get first child's name for personalisation
  const { data: g } = await supabase
    .from('guardians')
    .select('children(first_name)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const childName = (g as any)?.children?.first_name ?? undefined

  return (
    <div className="space-y-4">
      <AiOnboarding childName={childName} />
      <OnboardingWizard userId={user.id} childName={childName} />
    </div>
  )
}
