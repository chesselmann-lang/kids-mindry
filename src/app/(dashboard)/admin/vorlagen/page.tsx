import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import VorlagenManager from './vorlagen-manager'
import AiVorlagenAnalyse from './ai-vorlagen-analyse'

export const metadata = { title: 'Nachrichtenvorlagen' }

export default async function VorlagenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: templates } = await supabase
    .from('message_templates')
    .select('*')
    .eq('site_id', siteId)
    .order('category', { ascending: true })
    .order('title', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Nachrichtenvorlagen</h1>
          <p className="text-sm text-gray-400">Wiederverwendbare Texte für Elternkommunikation</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
          <FileText size={20} className="text-rose-600" />
        </div>
      </div>

      <AiVorlagenAnalyse />

      <VorlagenManager
        templates={(templates ?? []) as any[]}
        siteId={siteId}
      />
    </div>
  )
}
