import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react'
import HandbuchManager from './handbuch-manager'

export const metadata = { title: 'Eltern-Handbuch' }

export default async function HandbuchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: chapters } = await supabase
    .from('handbook_chapters')
    .select('*')
    .eq('site_id', siteId)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Eltern-Handbuch</h1>
          <p className="text-sm text-gray-400">Wichtige Informationen & Regeln</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
          <BookOpen size={20} className="text-blue-600" />
        </div>
      </div>

      <HandbuchManager
        chapters={(chapters ?? []) as any[]}
        isAdmin={isAdmin}
        siteId={siteId}
      />
    </div>
  )
}
