import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, Plus, ChevronRight, Camera } from 'lucide-react'
import type { Child } from '@/types/database'
import AiTagesberichteUeberblick from './ai-tagesberichte-ueberblick'

export const metadata = { title: 'Tagesberichte' }

const moodConfig = {
  great: { emoji: '😄', label: 'Super',    color: 'bg-green-100 text-green-700' },
  good:  { emoji: '🙂', label: 'Gut',      color: 'bg-blue-100 text-blue-700' },
  okay:  { emoji: '😐', label: 'Ok',       color: 'bg-yellow-100 text-yellow-700' },
  sad:   { emoji: '😢', label: 'Traurig',  color: 'bg-orange-100 text-orange-700' },
  sick:  { emoji: '🤒', label: 'Krank',    color: 'bg-red-100 text-red-700' },
}

export default async function TagesberichtePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  // --- ERZIEHER-ANSICHT ---
  if (isStaff) {
    const { data: children } = await supabase
      .from('children')
      .select('id, first_name, last_name, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('first_name')

    const childIds = (children ?? []).map(c => c.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let todayReports: Record<string, any> = {}
    if (childIds.length > 0) {
      const { data: reports } = await supabase
        .from('daily_reports')
        .select('*')
        .in('child_id', childIds)
        .eq('report_date', today)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(reports ?? []).forEach((r: any) => { todayReports[r.child_id] = r })
    }

    const doneCount = Object.keys(todayReports).length
    const totalCount = (children ?? []).length

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tagesberichte</h1>
            <p className="text-sm text-gray-500 mt-0.5">Heute: {doneCount} von {totalCount} ausgefüllt</p>
          </div>
          <Link href="/tagesberichte/neu" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Neuer Bericht
          </Link>
        </div>

        <AiTagesberichteUeberblick />

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Heutiger Fortschritt</span>
            <span className="text-xs font-bold text-brand-600">
              {totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${doneCount / totalCount * 100}%` : '0%' }}
            />
          </div>
        </div>

        {!children || children.length === 0 ? (
          <div className="card p-12 text-center">
            <ClipboardList size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Noch keine Kinder erfasst</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(children as any[]).map((child, idx) => {
              const report = todayReports[child.id]
              const mood = report?.mood ? moodConfig[report.mood as keyof typeof moodConfig] : null
              return (
                <Link
                  key={child.id}
                  href={report ? `/tagesberichte/${child.id}/${today}` : `/tagesberichte/neu?child=${child.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${idx > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{child.first_name} {child.last_name}</p>
                    {report ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mood?.color ?? 'bg-gray-100 text-gray-500'}`}>
                          {mood?.emoji} {mood?.label ?? 'Ausgefüllt'}
                        </span>
                        {report.sleep_minutes && (
                          <span className="text-xs text-gray-400">😴 {Math.floor(report.sleep_minutes / 60)}h{report.sleep_minutes % 60 > 0 ? `${report.sleep_minutes % 60}m` : ''}</span>
                        )}
                        {report.photo_urls?.length > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5"><Camera size={10} /> {report.photo_urls.length}</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Noch kein Bericht</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // --- ELTERN-ANSICHT ---
  const { data: guardians } = await supabase
    .from('guardians')
    .select('child_id, children(id, first_name, last_name)')
    .eq('user_id', user.id)

  const myChildren = (guardians ?? [])
    .filter(g => g.children)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(g => g.children as any as Child)

  // Last 7 days of reports for each child
  const childIds = myChildren.map(c => c.id)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentReports: any[] = []
  if (childIds.length > 0) {
    const { data } = await supabase
      .from('daily_reports')
      .select('*')
      .in('child_id', childIds)
      .gte('report_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('report_date', { ascending: false })
    recentReports = data ?? []
  }

  const childMap = Object.fromEntries(myChildren.map(c => [c.id, c]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tagesberichte</h1>
        <p className="text-sm text-gray-500 mt-0.5">Berichte der letzten 7 Tage</p>
      </div>

      {myChildren.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Kein Kind mit Ihrem Konto verknüpft</p>
          <p className="text-gray-400 text-xs mt-1">Bitte wenden Sie sich an die Kita</p>
        </div>
      ) : recentReports.length === 0 ? (
        <div className="card p-10 text-center">
          <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Noch keine Berichte vorhanden</p>
          <p className="text-gray-400 text-xs mt-1">Die Erzieher füllen die Berichte täglich aus</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {recentReports.map((report: any) => {
            const child = childMap[report.child_id]
            const mood = report.mood ? moodConfig[report.mood as keyof typeof moodConfig] : null
            const reportDate = new Date(report.report_date + 'T12:00:00')
            const isReportToday = report.report_date === today

            return (
              <Link
                key={report.id}
                href={`/tagesberichte/${report.child_id}/${report.report_date}`}
                className="card p-5 block hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {child?.first_name?.[0]}{child?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {child?.first_name} {child?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isReportToday ? 'Heute' : reportDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  {mood && (
                    <span className={`text-lg`}>{mood.emoji}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {mood && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${mood.color}`}>
                      {mood.label}
                    </span>
                  )}
                  {report.sleep_minutes !== null && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      😴 {Math.floor(report.sleep_minutes / 60)}h{report.sleep_minutes % 60 > 0 ? ` ${report.sleep_minutes % 60}m` : ''} geschlafen
                    </span>
                  )}
                  {report.activities && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      🎨 {report.activities.length > 40 ? report.activities.slice(0, 40) + '…' : report.activities}
                    </span>
                  )}
                  {report.photo_urls?.length > 0 && (
                    <span className="text-xs text-brand-500 flex items-center gap-1 font-medium">
                      <Camera size={11} /> {report.photo_urls.length} {report.photo_urls.length === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  )}
                </div>

                {report.notes && (
                  <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-xl p-2.5 line-clamp-2">
                    {report.notes}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
