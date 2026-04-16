import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Activity } from 'lucide-react'
import AktivitaetClient from './aktivitaet-client'
import AiAktivitaetsIdeen from './ai-aktivitaets-ideen'

export const metadata = { title: 'Aktivitätsfeed' }

export default async function AktivitaetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Fetch recent activity from multiple tables in parallel
  const [
    { data: observations },
    { data: healthRecords },
    { data: incidents },
    { data: sickReports },
    { data: materialOrders },
    { data: attendanceToday },
    { data: foerderGoals },
  ] = await Promise.all([
    supabase.from('observations')
      .select('id, created_at, content, children(first_name, last_name), profiles:author_id(full_name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase.from('health_records')
      .select('id, created_at, record_type, description, children:child_id(first_name, last_name), profiles:created_by(full_name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('incidents')
      .select('id, created_at, title, severity, children(first_name, last_name), profiles:reported_by(full_name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('sick_reports')
      .select('id, created_at, start_date, end_date, profiles:staff_id(full_name, role)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('material_orders')
      .select('id, created_at, item_name, quantity, status, profiles:requested_by(full_name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('attendance')
      .select('id, created_at, status, children:child_id(first_name, last_name), profiles:reported_by(full_name)')
      .eq('site_id', siteId)
      .eq('date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('foerder_goals')
      .select('id, created_at, title, status, children(first_name, last_name), profiles:created_by(full_name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Aktivitätsfeed</h1>
          <p className="text-sm text-gray-400">Alle Ereignisse auf einen Blick</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Activity size={20} className="text-indigo-600" />
        </div>
      </div>

      <AiAktivitaetsIdeen />

      <AktivitaetClient
        observations={(observations ?? []) as any[]}
        healthRecords={(healthRecords ?? []) as any[]}
        incidents={(incidents ?? []) as any[]}
        sickReports={(sickReports ?? []) as any[]}
        materialOrders={(materialOrders ?? []) as any[]}
        attendanceToday={(attendanceToday ?? []) as any[]}
        foerderGoals={(foerderGoals ?? []) as any[]}
      />
    </div>
  )
}
