import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, photo_url, group_id, groups(name, color)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('first_name')

  // Heutige Anwesenheitsstatus
  const today = new Date().toISOString().slice(0, 10)
  const childIds = (children ?? []).map((c: any) => c.id)
  const { data: attendance } = await supabase
    .from('attendance')
    .select('child_id, status, checked_in_at, checked_out_at')
    .eq('site_id', siteId)
    .eq('date', today)
    .in('child_id', childIds)

  const attMap = Object.fromEntries((attendance ?? []).map((a: any) => [a.child_id, a]))

  const result = (children ?? []).map((c: any) => ({
    ...c,
    today: attMap[c.id] ?? null,
  }))

  return NextResponse.json(result)
}
