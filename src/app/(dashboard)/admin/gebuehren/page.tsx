import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Euro } from 'lucide-react'
import GebuehrenManager from './gebuehren-manager'
import AiGebuehrenAnalyse from './ai-gebuehren-analyse'
import ExportButton from './export-button'

export const metadata = { title: 'Gebühren verwalten' }

export default async function AdminGebuehrenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children').select('id, first_name, last_name')
    .eq('site_id', siteId).eq('status', 'active').order('first_name')

  const { data: fees } = await supabase
    .from('fees')
    .select('*, children(first_name, last_name)')
    .eq('site_id', siteId)
    .order('period_month', { ascending: false })
    .limit(100)

  // Summary stats
  const feeList = (fees ?? []) as any[]
  const totalOpen = feeList.filter(f => f.status !== 'paid').reduce((s, f) => s + Number(f.amount), 0)
  const totalPaid = feeList.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Gebühren</h1>
          <p className="text-sm text-gray-400">Beiträge verwalten</p>
        </div>
        <ExportButton fees={feeList} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalPaid.toFixed(2)} €</p>
          <p className="text-xs text-gray-500 mt-0.5">Eingegangen</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalOpen.toFixed(2)} €</p>
          <p className="text-xs text-gray-500 mt-0.5">Ausstehend</p>
        </div>
      </div>

      <AiGebuehrenAnalyse />

      <GebuehrenManager
        siteId={siteId}
        staffId={user.id}
        children={(children ?? []) as any[]}
        fees={feeList}
      />
    </div>
  )
}
