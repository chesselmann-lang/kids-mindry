import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GesundheitForm from './gesundheit-form'
import AiGesundheit from './ai-gesundheit'

export const metadata = { title: 'Gesundheit & Betreuung' }

export default async function GesundheitPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const { data: child } = await supabase
    .from('children')
    .select('id, first_name, last_name, allergies, medical_notes, emergency_contact_name, emergency_contact_phone, doctor_name, doctor_phone, care_days, care_start_time, care_end_time')
    .eq('id', params.id)
    .single()

  if (!child) notFound()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/kinder/${params.id}`} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gesundheit & Betreuung</h1>
          <p className="text-sm text-gray-400">{(child as any).first_name} {(child as any).last_name}</p>
        </div>
      </div>
      <AiGesundheit childId={params.id} />
      <GesundheitForm child={child as any} />
    </div>
  )
}
