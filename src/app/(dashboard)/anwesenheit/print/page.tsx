import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Anwesenheitsliste drucken' }

export default async function PrintAnwesenheitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const [{ data: children }, { data: groups }, { data: attendance }, { data: site }] = await Promise.all([
    supabase.from('children').select('id, first_name, last_name, group_id, date_of_birth, allergies')
      .eq('site_id', siteId).eq('status', 'active').order('last_name'),
    supabase.from('groups').select('id, name, color').eq('site_id', siteId).order('name'),
    supabase.from('attendance').select('child_id, status, check_in_at, check_out_at')
      .eq('site_id', siteId).eq('date', today),
    supabase.from('sites').select('name, address').eq('id', siteId).single(),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))
  const attMap = Object.fromEntries((attendance ?? []).map((a: any) => [a.child_id, a]))

  const byGroup: Record<string, any[]> = {}
  ;(children ?? []).forEach((c: any) => {
    const gid = c.group_id ?? 'none'
    if (!byGroup[gid]) byGroup[gid] = []
    byGroup[gid].push(c)
  })

  const sortedGroups = Object.entries(byGroup).sort(([a], [b]) => {
    const nameA = groupMap[a]?.name ?? 'Zzz'
    const nameB = groupMap[b]?.name ?? 'Zzz'
    return nameA.localeCompare(nameB)
  })

  function attLabel(status: string | undefined) {
    const m: Record<string, string> = {
      present: 'Anwesend', absent_sick: 'Krank', absent_vacation: 'Urlaub',
      absent_other: 'Abwesend', unknown: '–'
    }
    return m[status ?? 'unknown'] ?? '–'
  }

  function formatTime(ts: string | null | undefined) {
    if (!ts) return '–'
    return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <html lang="de">
      <head>
        <title>Anwesenheitsliste – {todayFormatted}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; padding: 15mm 15mm 10mm; }
          h1 { font-size: 16pt; margin-bottom: 3pt; }
          h2 { font-size: 12pt; margin: 10pt 0 5pt; border-bottom: 2px solid #333; padding-bottom: 3pt; }
          .meta { font-size: 9pt; color: #555; margin-bottom: 12pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 14pt; }
          th { background: #f3f4f6; font-weight: bold; border: 1px solid #aaa; padding: 5px 8px; text-align: left; }
          td { border: 1px solid #ddd; padding: 4px 8px; }
          tr:nth-child(even) td { background: #f9fafb; }
          .present { color: #16a34a; font-weight: bold; }
          .absent-sick { color: #dc2626; }
          .absent { color: #6b7280; }
          .allergy { color: #d97706; font-size: 8pt; }
          .summary { font-size: 9pt; color: #555; margin-top: 8pt; }
          @media print {
            button { display: none; }
            body { padding: 10mm; }
          }
        `}</style>
      </head>
      <body>
        <h1>Anwesenheitsliste</h1>
        <p className="meta">
          {(site as any)?.name ?? 'KitaHub'} · {todayFormatted}
        </p>

        {sortedGroups.map(([gid, kids]) => {
          const group = groupMap[gid]
          const presentCount = kids.filter(c => attMap[c.id]?.status === 'present').length

          return (
            <div key={gid}>
              <h2>{group?.name ?? 'Ohne Gruppe'} ({kids.length} Kinder · {presentCount} anwesend)</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Geburtsdatum</th>
                    <th>Status</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Unterschrift</th>
                  </tr>
                </thead>
                <tbody>
                  {kids.map((child: any, i: number) => {
                    const att = attMap[child.id]
                    const status = att?.status ?? 'unknown'
                    const cls = status === 'present' ? 'present' : status.startsWith('absent_sick') ? 'absent-sick' : 'absent'
                    return (
                      <tr key={child.id}>
                        <td>
                          {i + 1}. {child.last_name}, {child.first_name}
                          {child.allergies && child.allergies.length > 0 && (
                            <span className="allergy"> ⚠️</span>
                          )}
                        </td>
                        <td>{child.date_of_birth ? new Date(child.date_of_birth).toLocaleDateString('de-DE') : '–'}</td>
                        <td className={cls}>{attLabel(status)}</td>
                        <td>{formatTime(att?.check_in_at)}</td>
                        <td>{formatTime(att?.check_out_at)}</td>
                        <td style={{ width: '80px' }}>&nbsp;</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}

        <p className="summary">
          Gesamt: {(children ?? []).length} Kinder ·{' '}
          Anwesend: {(attendance ?? []).filter((a: any) => a.status === 'present').length} ·{' '}
          Ausdruck: {new Date().toLocaleString('de-DE')}
        </p>
      </body>
    </html>
  )
}
