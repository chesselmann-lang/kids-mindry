import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import MeilensteinClient from './meilenstein-client'
import AiMeilensteine from './ai-meilensteine'

export const metadata = { title: 'Entwicklungs-Meilensteine' }

export default async function MeilensteinePage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  // Access check for parents
  if (!isStaff) {
    const { data: guard } = await supabase
      .from('guardians').select('id').eq('child_id', params.childId).eq('user_id', user.id).single()
    if (!guard) redirect('/feed')
  }

  const { data: child } = await supabase
    .from('children').select('id, first_name, last_name, date_of_birth').eq('id', params.childId).single()
  if (!child) notFound()

  const { data: milestones } = await supabase
    .from('dev_milestones')
    .select('*')
    .eq('child_id', params.childId)
    .order('achieved_date', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Meilensteine</h1>
          <p className="text-sm text-gray-400">{(child as any).first_name} {(child as any).last_name}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
          <Star size={20} className="text-yellow-500" />
        </div>
      </div>

      <AiMeilensteine childId={params.childId} />

      <MeilensteinClient
        milestones={(milestones ?? []) as any[]}
        childId={params.childId}
        isStaff={isStaff}
        dateOfBirth={(child as any).date_of_birth}
      />
    </div>
  )
}
