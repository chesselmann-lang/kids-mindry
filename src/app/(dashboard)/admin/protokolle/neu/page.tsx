import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProtokollForm from './protokoll-form'
import AiProtokollNeu from './ai-protokoll-neu'
import AiProtokollEntwurf from './ai-protokoll-entwurf'

export const metadata = { title: 'Protokoll bearbeiten' }

export default async function NeuesProtokollPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/protokolle')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load existing protocol if editing
  let existing = null
  if (searchParams.id) {
    const { data } = await supabase
      .from('protocols')
      .select('id, title, content, meeting_date, published_at')
      .eq('id', searchParams.id)
      .single()
    existing = data as any
  }

  return (
    <div className="space-y-4">
      {!existing && <AiProtokollNeu />}
      {!existing && <AiProtokollEntwurf />}
      <ProtokollForm
        authorId={user.id}
        siteId={siteId}
        existing={existing}
      />
    </div>
  )
}
