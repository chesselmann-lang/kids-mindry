import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DokumentUploader from './dokument-uploader'
import AiDokumenteCheck from './ai-dokumente-check'

export const metadata = { title: 'Dokumente verwalten' }

export default async function AdminDokumentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/dokumente')

  const { data: documents } = await supabase
    .from('kita_documents')
    .select('*')
    .order('created_at', { ascending: false })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dokumente" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dokumente verwalten</h1>
          <p className="text-sm text-gray-400">Upload &amp; Verwaltung</p>
        </div>
      </div>

      <AiDokumenteCheck />

      <DokumentUploader
        siteId={siteId}
        uploaderId={user.id}
        initialDocuments={(documents ?? []) as any[]}
      />
    </div>
  )
}
