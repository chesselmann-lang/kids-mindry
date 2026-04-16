import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Target } from 'lucide-react'
import FoerderplanManager from './foerderplan-manager'
import AiFoerderplaeneUeberblick from './ai-foerderplaene-ueberblick'
import AiFoerderbedarfRadar from './ai-foerderbedarf-radar'

export const metadata = { title: 'Förderpläne' }

export default async function FoerderplaenePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children').select('id, first_name, last_name, group_id, groups(name, color)')
    .eq('site_id', siteId).eq('status', 'active').order('first_name')

  const { data: plans } = await supabase
    .from('foerderplaene')
    .select('*, children(first_name, last_name), profiles:created_by(full_name)')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Förderpläne</h1>
          <p className="text-sm text-gray-400">Individuelle Entwicklungsziele</p>
        </div>
      </div>

      <AiFoerderplaeneUeberblick />
      <AiFoerderbedarfRadar />

      <FoerderplanManager
        siteId={siteId}
        staffId={user.id}
        children={(children ?? []) as any[]}
        plans={(plans ?? []) as any[]}
      />
    </div>
  )
}
