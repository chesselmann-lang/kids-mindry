import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { getYear } from 'date-fns'
import JahresplanungForm from './jahresplanung-form'
import AiJahresplanungIdeen from './ai-jahresplanung-ideen'

export const metadata = { title: 'Jahresplanung verwalten' }

export default async function AdminJahresplanungPage({
  searchParams,
}: { searchParams: { year?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const year = searchParams.year ? parseInt(searchParams.year) : getYear(new Date())

  const { data: events } = await supabase
    .from('annual_events')
    .select('*')
    .eq('site_id', siteId)
    .gte('event_date', `${year}-01-01`)
    .lte('event_date', `${year}-12-31`)
    .order('event_date')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jahresplanung {year}</h1>
          <p className="text-sm text-gray-400">Termine & Schließtage verwalten</p>
        </div>
      </div>

      {/* Year navigation */}
      <div className="flex items-center justify-between card p-3">
        <Link href={`/admin/jahresplanung?year=${year - 1}`} className="text-sm text-brand-600 font-medium">‹ {year - 1}</Link>
        <Link href="/jahresplanung" className="text-sm font-bold text-gray-700 hover:text-brand-600">{year} · Vorschau</Link>
        <Link href={`/admin/jahresplanung?year=${year + 1}`} className="text-sm text-brand-600 font-medium">{year + 1} ›</Link>
      </div>

      <AiJahresplanungIdeen year={year} />

      <JahresplanungForm
        staffId={user.id}
        siteId={siteId}
        events={(events ?? []) as any[]}
      />
    </div>
  )
}
