import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit3 } from 'lucide-react'
import AiTagesbericht from './ai-tagesbericht'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const moodConfig = {
  great: { emoji: '😄', label: 'Super',    color: 'bg-green-50 text-green-700 border-green-200' },
  good:  { emoji: '🙂', label: 'Gut',      color: 'bg-blue-50 text-blue-700 border-blue-200' },
  okay:  { emoji: '😐', label: 'Ok',       color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  sad:   { emoji: '😢', label: 'Traurig',  color: 'bg-orange-50 text-orange-700 border-orange-200' },
  sick:  { emoji: '🤒', label: 'Krank',    color: 'bg-red-50 text-red-700 border-red-200' },
}

const mealLabels: Record<string, string> = {
  Alles: 'Alles gegessen', Viel: 'Fast alles', Halb: 'Halb', Wenig: 'Wenig', Nichts: 'Nichts'
}

const mealEmojis: Record<string, string> = {
  Alles: '😋', Viel: '🙂', Halb: '😐', Wenig: '😕', Nichts: '😔'
}

export default async function TagesberichtDetailPage({
  params
}: {
  params: { childId: string; date: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')

  // Access control: parents can only view reports for their own children
  if (!isStaff) {
    const { data: guardian } = await supabase
      .from('guardians')
      .select('id')
      .eq('user_id', user.id)
      .eq('child_id', params.childId)
      .maybeSingle()
    if (!guardian) redirect('/tagesberichte')
  }

  const { data: child } = await supabase
    .from('children')
    .select('first_name, last_name')
    .eq('id', params.childId)
    .single()
  if (!child) notFound()

  const { data: report } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('child_id', params.childId)
    .eq('report_date', params.date)
    .maybeSingle()

  if (!report) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/tagesberichte" className="text-xs text-brand-600 mb-1 block flex items-center gap-1">
            <ArrowLeft size={12} /> Tagesberichte
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{child.first_name} {child.last_name}</h1>
        </div>
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-sm">Kein Bericht für dieses Datum gefunden</p>
          {isStaff && (
            <Link href={`/tagesberichte/neu?child=${params.childId}`} className="btn-primary mt-4 inline-flex">
              <Edit3 size={16} /> Bericht erstellen
            </Link>
          )}
        </div>
      </div>
    )
  }

  const reportDate = new Date(params.date + 'T12:00:00')
  const mood = report.mood ? moodConfig[report.mood as keyof typeof moodConfig] : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meals = (report.meals as any) ?? {}
  const photoUrls: string[] = Array.isArray(report.photo_urls) ? report.photo_urls : []

  const sleepH = report.sleep_minutes ? Math.floor(report.sleep_minutes / 60) : 0
  const sleepM = report.sleep_minutes ? report.sleep_minutes % 60 : 0

  return (
    <div className="space-y-5">
      <div>
        <Link href="/tagesberichte" className="text-xs text-brand-600 mb-1 flex items-center gap-1">
          <ArrowLeft size={12} /> Tagesberichte
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{child.first_name} {child.last_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {format(reportDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
          </div>
          {isStaff && (
            <Link href={`/tagesberichte/neu?child=${params.childId}`} className="btn-secondary text-sm px-3 py-2">
              <Edit3 size={15} /> Bearbeiten
            </Link>
          )}
        </div>
      </div>

      <AiTagesbericht childId={params.childId} date={params.date} />

      {/* Mood */}
      {mood && (
        <div className={`card p-5 border-2 ${mood.color}`}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Stimmung</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xl font-bold">{mood.label}</span>
          </div>
        </div>
      )}

      {/* Fotos */}
      {photoUrls.length > 0 && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">📸 Fotos vom Tag</p>
          <div className={`grid gap-2 ${photoUrls.length === 1 ? 'grid-cols-1' : photoUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {photoUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-xl overflow-hidden bg-gray-100 ${photoUrls.length === 1 ? 'aspect-video' : 'aspect-square'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mahlzeiten */}
      {(meals.breakfast || meals.lunch || meals.snack) && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Mahlzeiten</p>
          <div className="space-y-3">
            {[
              { key: 'breakfast', label: 'Frühstück' },
              { key: 'lunch',     label: 'Mittagessen' },
              { key: 'snack',     label: 'Vesper' },
            ].map(m => {
              const val = meals[m.key]
              if (!val) return null
              return (
                <div key={m.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">{m.label}</span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-700">
                    <span>{mealEmojis[val] ?? '?'}</span>
                    <span>{mealLabels[val] ?? val}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Schlaf */}
      {report.sleep_minutes !== null && report.sleep_minutes > 0 && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schlaf / Ruhezeit</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">😴</span>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {sleepH > 0 && `${sleepH}h `}{sleepM > 0 && `${sleepM}min`}
              </p>
              {report.sleep_notes && (
                <p className="text-xs text-gray-500 mt-0.5">{report.sleep_notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aktivitäten */}
      {report.activities && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Aktivitäten</p>
          <p className="text-sm text-gray-700 leading-relaxed">🎨 {report.activities}</p>
        </div>
      )}

      {/* Notizen */}
      {report.notes && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notizen der Erzieher</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.notes}</p>
        </div>
      )}
    </div>
  )
}
