import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Baby } from 'lucide-react'
import TimelineClient from './timeline-client'
import AiKindVerlaufAnalyse from './ai-kind-verlauf-analyse'

export const metadata = { title: 'Kind-Timeline' }

export default async function KindTimelinePage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = (profile as any)?.role ?? ''
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(role)

  const { childId } = params

  // Access check: parents must be guardians
  if (!isStaff) {
    const { data: guard } = await supabase
      .from('guardians').select('id').eq('child_id', childId).eq('user_id', user.id).single()
    if (!guard) redirect('/feed')
  }

  const { data: child } = await supabase
    .from('children').select('id, first_name, last_name, group_id').eq('id', childId).single()
  if (!child) notFound()

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load events from multiple tables
  const [
    { data: reports },
    { data: observations },
    { data: healthRecords },
    { data: attendance },
    { data: foerderGoals },
  ] = await Promise.all([
    supabase.from('daily_reports').select('id, report_date, mood, activities, notes, created_at')
      .eq('child_id', childId).order('report_date', { ascending: false }).limit(30),
    supabase.from('observations').select('id, observation_date, title, notes, created_at')
      .eq('child_id', childId).order('observation_date', { ascending: false }).limit(20),
    isStaff ? supabase.from('health_records').select('id, record_date, record_type, title, created_at')
      .eq('child_id', childId).order('record_date', { ascending: false }).limit(20)
      : { data: [] },
    supabase.from('attendance').select('id, date, check_in_at, check_out_at')
      .eq('child_id', childId).order('date', { ascending: false }).limit(30),
    isStaff ? supabase.from('foerder_goals').select('id, created_at, title, status')
      .eq('child_id', childId).order('created_at', { ascending: false }).limit(10)
      : { data: [] },
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Verlauf</h1>
          <p className="text-sm text-gray-400">{(child as any).first_name} {(child as any).last_name}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Baby size={20} className="text-brand-600" />
        </div>
      </div>

      <AiKindVerlaufAnalyse
        childId={childId}
        childName={(child as any).first_name}
        isStaff={isStaff}
      />

      <TimelineClient
        reports={(reports ?? []) as any[]}
        observations={(observations ?? []) as any[]}
        healthRecords={(healthRecords ?? []) as any[]}
        attendance={(attendance ?? []) as any[]}
        foerderGoals={(foerderGoals ?? []) as any[]}
        isStaff={isStaff}
        childId={childId}
      />
    </div>
  )
}
