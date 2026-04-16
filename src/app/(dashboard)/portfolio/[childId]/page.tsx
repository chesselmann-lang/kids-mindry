import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, BookOpen, FileDown } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Entwicklungsbericht from './entwicklungsbericht'
import AiPortfolio from './ai-portfolio'

export const metadata = { title: 'Portfolio' }

const DOMAIN_CONFIG: Record<string, { label: string; emoji: string }> = {
  general:   { label: 'Allgemein',   emoji: '📝' },
  social:    { label: 'Sozial',      emoji: '🤝' },
  language:  { label: 'Sprache',     emoji: '💬' },
  motor:     { label: 'Motorik',     emoji: '🏃' },
  cognitive: { label: 'Kognitiv',    emoji: '🧠' },
  creative:  { label: 'Kreativität', emoji: '🎨' },
  emotional: { label: 'Emotional',   emoji: '❤️' },
}

export default async function PortfolioPage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  // Access check
  if (!isStaff) {
    const { data: guardian } = await supabase.from('guardians').select('id')
      .eq('user_id', user.id).eq('child_id', params.childId).maybeSingle()
    if (!guardian) redirect('/mein-kind')
  }

  const { data: child } = await supabase.from('children')
    .select('first_name, last_name, date_of_birth, groups(name, color)')
    .eq('id', params.childId).single()
  if (!child) notFound()

  // Get observations (staff sees all, parents see shared only)
  let query = supabase.from('observations').select('*')
    .eq('child_id', params.childId)
    .order('observed_at', { ascending: false })

  if (!isStaff) query = query.eq('shared_with_parents', true)

  const { data: observations } = await query

  // Highlights
  const highlights = (observations ?? []).filter((o: any) => o.is_highlight)
  const regular = (observations ?? []).filter((o: any) => !o.is_highlight)

  // Domain breakdown
  const domainCounts: Record<string, number> = {}
  for (const o of observations ?? []) {
    domainCounts[(o as any).domain] = (domainCounts[(o as any).domain] ?? 0) + 1
  }

  const c = child as any
  const group = c.groups

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={isStaff ? `/admin/kinder/${params.childId}` : '/mein-kind'}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-400">{c.first_name} {c.last_name}</p>
        </div>
        {/* PDF Export */}
        <a
          href={`/api/portfolio-export?childId=${params.childId}&print=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          <FileDown size={14} />
          PDF
        </a>
      </div>

      {/* Child card */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
          style={{ backgroundColor: group?.color ?? '#6B7280' }}>
          {c.first_name[0]}{c.last_name[0]}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{c.first_name} {c.last_name}</p>
          {group && <p className="text-sm text-gray-500">{group.name}</p>}
          <p className="text-xs text-gray-400 mt-0.5">{(observations ?? []).length} Beobachtungen</p>
        </div>
      </div>

      <AiPortfolio childId={params.childId} />

      {/* AI Entwicklungsbericht — staff only */}
      {isStaff && (
        <Entwicklungsbericht childId={params.childId} childName={c.first_name} />
      )}

      {/* Domain stats */}
      {Object.keys(domainCounts).length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bereiche</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(domainCounts).map(([domain, count]) => {
              const cfg = DOMAIN_CONFIG[domain] ?? { label: domain, emoji: '📝' }
              return (
                <div key={domain} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5">
                  <span className="text-sm">{cfg.emoji}</span>
                  <span className="text-xs text-gray-700 font-medium">{cfg.label}</span>
                  <span className="text-xs text-gray-400 font-bold">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Besondere Momente</p>
          </div>
          <div className="space-y-3">
            {highlights.map((obs: any) => {
              const dom = DOMAIN_CONFIG[obs.domain] ?? { emoji: '📝', label: '' }
              return (
                <div key={obs.id} className="card p-4 border-l-4 border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{dom.emoji}</span>
                    <p className="text-xs text-gray-400">
                      {format(new Date(obs.observed_at), 'd. MMM yyyy', { locale: de })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{obs.content}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All observations */}
      {regular.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Alle Beobachtungen</p>
          <div className="card overflow-hidden p-0">
            {regular.map((obs: any, idx: number) => {
              const dom = DOMAIN_CONFIG[obs.domain] ?? { emoji: '📝', label: 'Allgemein' }
              return (
                <div key={obs.id} className={`px-4 py-4 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{dom.emoji}</span>
                      <span className="text-xs font-medium text-gray-500">{dom.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(obs.observed_at), 'd. MMM yyyy', { locale: de })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{obs.content}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(!observations || observations.length === 0) && (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Noch keine Beobachtungen</p>
          {isStaff && (
            <Link href={`/admin/beobachtungen?child=${params.childId}`} className="btn-primary mt-4 inline-flex text-sm">
              Erste Beobachtung hinzufügen
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
