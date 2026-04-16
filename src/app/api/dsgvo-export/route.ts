import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get child data if parent
  const isParent = (profile as any)?.role === 'parent'

  let childrenData: any[] = []
  let attendanceData: any[] = []
  let reportsData: any[] = []
  let meetingsData: any[] = []

  if (isParent) {
    const { data: guardianships } = await supabase
      .from('guardians')
      .select('child_id, children(*)')
      .eq('user_id', user.id)

    const childIds = (guardianships ?? []).map((g: any) => g.child_id)
    childrenData = (guardianships ?? []).map((g: any) => g.children).filter(Boolean)

    if (childIds.length > 0) {
      const [att, reports, meetings] = await Promise.all([
        supabase.from('attendance').select('date, status').in('child_id', childIds).limit(500),
        supabase.from('daily_reports').select('report_date, mood, activities, notes').in('child_id', childIds).limit(200),
        supabase.from('parent_meetings').select('meeting_date, attendees, topics, agreements, next_meeting').in('child_id', childIds).limit(50),
      ])
      attendanceData = att.data ?? []
      reportsData = reports.data ?? []
      meetingsData = meetings.data ?? []
    }
  }

  const exportData = {
    export_date: new Date().toISOString(),
    export_version: '1.0',
    profile: {
      id: user.id,
      email: user.email,
      full_name: (profile as any)?.full_name,
      phone: (profile as any)?.phone,
      role: (profile as any)?.role,
      language: (profile as any)?.language,
      created_at: (profile as any)?.created_at,
    },
    ...(isParent && {
      children: childrenData,
      attendance_records: attendanceData,
      daily_reports: reportsData,
      parent_meetings: meetingsData,
    }),
  }

  // Log the export action
  await supabase.from('audit_logs').insert({
    site_id: (profile as any)?.site_id,
    user_id: user.id,
    action: 'dsgvo_export',
    table_name: 'profiles',
    record_id: user.id,
    changes: { exported_at: new Date().toISOString() },
  }).then(() => {})

  const filename = `kitahub_dsgvo_export_${new Date().toISOString().split('T')[0]}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
