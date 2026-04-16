import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import KindDokumentManager from './kind-dokument-manager'
import AiKindDokumenteAnalyse from './ai-kind-dokumente-analyse'

export const metadata = { title: 'Kind-Dokumente' }

export default async function KindDokumentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children').select('id, first_name, last_name')
    .eq('site_id', siteId).eq('status', 'active').order('first_name')

  const { data: docs } = await supabase
    .from('child_documents')
    .select('*, children(first_name, last_name)')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kind-Dokumente</h1>
          <p className="text-sm text-gray-400">Verträge, Atteste & Unterlagen</p>
        </div>
      </div>

      {isStaff && <AiKindDokumenteAnalyse />}

      <KindDokumentManager
        siteId={siteId}
        staffId={user.id}
        children={(children ?? []) as any[]}
        docs={(docs ?? []) as any[]}
      />
    </div>
  )
}
