import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import MaterialClient from './material-client'
import AiMaterialAnalyse from './ai-material-analyse'

export const metadata = { title: 'Materialbestellung' }

export default async function MaterialbestellungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const { data: orders } = await supabase
    .from('material_orders')
    .select('*, profiles:requested_by(full_name)')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(40)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Materialbestellung</h1>
          <p className="text-sm text-gray-400">
            {(orders ?? []).filter((o: any) => o.status === 'pending').length} offen
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <ShoppingCart size={20} className="text-emerald-600" />
        </div>
      </div>

      <AiMaterialAnalyse />

      <MaterialClient
        orders={(orders ?? []) as any[]}
        userId={user.id}
        siteId={siteId}
        isAdmin={isAdmin}
      />
    </div>
  )
}
