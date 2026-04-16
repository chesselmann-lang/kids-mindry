import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import AiWochenbericht from './ai-wochenbericht'

export const metadata = { title: 'Wochenbericht' }

export default async function WochenberichtDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: report } = await supabase
    .from('weekly_reports')
    .select('*, groups(name, color), profiles:author_id(full_name)')
    .eq('id', params.id)
    .single()

  if (!report) notFound()

  const r = report as any

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/wochenberichte" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{r.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            KW {format(parseISO(r.week_start), 'w · d. MMM yyyy', { locale: de })}
            {r.profiles?.full_name && ` · ${r.profiles.full_name}`}
          </p>
        </div>
      </div>

      {/* Group badge */}
      {r.groups?.name && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: r.groups.color + '20' }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.groups.color }} />
          <span className="text-xs font-medium" style={{ color: r.groups.color }}>{r.groups.name}</span>
        </div>
      )}

      <AiWochenbericht reportId={params.id} />

      {/* Photos */}
      {r.photo_urls?.length > 0 && (
        <div className={`grid gap-2 ${r.photo_urls.length === 1 ? 'grid-cols-1' : r.photo_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {r.photo_urls.map((url: string, i: number) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img src={url} alt="" className={`w-full object-cover rounded-xl ${r.photo_urls.length === 1 ? 'aspect-video' : 'aspect-square'}`} />
            </a>
          ))}
        </div>
      )}

      {/* Summary */}
      {r.summary && (
        <div className="card p-4 bg-brand-50 border-none">
          <p className="text-sm font-medium text-brand-800">{r.summary}</p>
        </div>
      )}

      {/* Content */}
      <div className="card p-4">
        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{r.content}</p>
      </div>

      {/* Highlights */}
      {r.highlights?.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Highlights der Woche ✨</p>
          <div className="space-y-2">
            {(r.highlights as string[]).map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">•</span>
                <p className="text-sm text-gray-700">{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
