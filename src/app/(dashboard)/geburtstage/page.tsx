import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Cake } from 'lucide-react'
import AiGeburtstagserinnerung from './ai-geburtstags-erinnerung'

export const metadata = { title: 'Geburtstage' }

function getNextBirthday(dobStr: string): { date: Date; turnsAge: number; daysUntil: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dob = new Date(dobStr + 'T12:00:00')
  const thisYear = today.getFullYear()

  let next = new Date(thisYear, dob.getMonth(), dob.getDate())
  if (next < today) next = new Date(thisYear + 1, dob.getMonth(), dob.getDate())

  const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const turnsAge  = next.getFullYear() - dob.getFullYear()

  return { date: next, turnsAge, daysUntil }
}

export default async function GeburtstagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase
      .from('children')
      .select('id, first_name, last_name, date_of_birth, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .not('date_of_birth', 'is', null),
    supabase
      .from('groups')
      .select('id, name, color')
      .eq('site_id', siteId),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))

  // Annotate and sort by days until birthday
  const annotated = (children ?? [])
    .map((c: any) => ({ ...c, ...getNextBirthday(c.date_of_birth) }))
    .sort((a: any, b: any) => a.daysUntil - b.daysUntil)

  const today   = annotated.filter((c: any) => c.daysUntil === 0)
  const week    = annotated.filter((c: any) => c.daysUntil > 0 && c.daysUntil <= 7)
  const month   = annotated.filter((c: any) => c.daysUntil > 7 && c.daysUntil <= 30)
  const later   = annotated.filter((c: any) => c.daysUntil > 30)

  function Section({
    label, items, highlight = false,
  }: {
    label: string
    items: any[]
    highlight?: boolean
  }) {
    if (items.length === 0) return null
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">{label}</p>
        <div className="card overflow-hidden p-0">
          {items.map((child: any, idx: number) => {
            const group = child.group_id ? groupMap[child.group_id] : null
            const isToday = child.daysUntil === 0
            return (
              <div
                key={child.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-100' : ''} ${isToday ? 'bg-yellow-50' : ''}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: group?.color ?? '#3B6CE8' }}
                >
                  {isToday ? '🎂' : child.first_name[0] + child.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {child.first_name} {child.last_name}
                    {isToday && (
                      <span className="ml-2 text-yellow-600 font-bold">🎉 Heute!</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {child.date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                    {' · '}wird {child.turnsAge} Jahre alt
                    {group && ` · ${group.name}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {isToday ? (
                    <span className="text-xs font-bold text-yellow-600">Heute</span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      in {child.daysUntil} Tag{child.daysUntil === 1 ? '' : 'en'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
          <Cake size={22} className="text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geburtstage</h1>
          <p className="text-sm text-gray-500 mt-0.5">{annotated.length} Kinder</p>
        </div>
      </div>

      <AiGeburtstagserinnerung />

      {annotated.length === 0 ? (
        <div className="card p-12 text-center">
          <Cake size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Keine Geburtstagsdaten vorhanden</p>
        </div>
      ) : (
        <>
          <Section label="Heute 🎂" items={today} highlight />
          <Section label="Diese Woche" items={week} />
          <Section label="Diesen Monat" items={month} />
          <Section label="Später" items={later} />
        </>
      )}
    </div>
  )
}
