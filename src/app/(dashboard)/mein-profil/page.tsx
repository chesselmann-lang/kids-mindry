import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilForm from './profil-form'
import AiMeinProfil from './ai-mein-profil'

export const metadata = { title: 'Mein Profil' }

export default async function MeinProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-4">
      <AiMeinProfil />
      <ProfilForm
        userId={user.id}
        email={user.email ?? ''}
        initialFullName={profile?.full_name ?? ''}
        initialPhone={profile?.phone ?? ''}
        initialLanguage={profile?.language ?? 'de'}
      />
    </div>
  )
}
