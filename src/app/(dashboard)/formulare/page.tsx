import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ExternalLink, Download, ArrowLeft } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import FormularManager from './formular-manager'
import AiFormulareCheck from './ai-formulare-check'

export const metadata = { title: 'Formulare & Anträge' }

export default async function FormularePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: forms } = await supabase
    .from('form_templates')
    .select('*')
    .eq('site_id', siteId)
    .order('category', { ascending: true })
    .order('title', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Formulare & Anträge</h1>
          <p className="text-sm text-gray-400">{(forms ?? []).length} Dokumente</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
          <FileText size={20} className="text-orange-600" />
        </div>
      </div>

      {isAdmin && <AiFormulareCheck />}

      <FormularManager
        forms={(forms ?? []) as any[]}
        isAdmin={isAdmin}
        siteId={siteId}
      />
    </div>
  )
}
