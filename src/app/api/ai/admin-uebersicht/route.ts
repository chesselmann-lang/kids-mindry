import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
    const today = new Date().toISOString().split('T')[0]
    const thirtyAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0]

    const [
      { count: activeChildren },
      { count: waitlistCount },
      { count: neuAnmeldungen },
      { data: attendanceToday },
      { data: openSickReports },
      { data: openPayments },
      { data: recentAnnouncements },
      { data: staffProfiles },
    ] = await Promise.all([
      supabase.from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active'),
      supabase.from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'waitlist'),
      supabase.from('online_anmeldungen').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'neu'),
      supabase.from('attendance').select('child_id, status').eq('site_id', siteId).eq('date', today),
      supabase.from('sick_reports').select('id').eq('site_id', siteId).is('end_date', null),
      supabase.from('payment_items').select('amount').eq('site_id', siteId).eq('status', 'open'),
      supabase.from('announcements').select('id').eq('site_id', siteId).gte('created_at', thirtyAgo + 'T00:00:00'),
      supabase.from('profiles').select('id, role').eq('site_id', siteId)
        .in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
    ])

    const att = attendanceToday ?? []
    const presentToday = att.filter((a: any) => a.status === 'present').length
    const absentToday = att.filter((a: any) => a.status?.startsWith('absent')).length
    const attendanceRate = activeChildren ? Math.round((presentToday / (activeChildren as number)) * 100) : 0

    const totalStaff = (staffProfiles ?? []).length
    const staffSick = (openSickReports ?? []).length
    const openPaymentsCount = (openPayments ?? []).length
    const openPaymentsAmount = ((openPayments ?? []) as any[]).reduce((s, p) => s + (p.amount ?? 0), 0) / 100

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Du bist Kita-Managementberater. Analysiere den aktuellen Kita-Status:

Tagesübersicht (${today}):
- Aktive Kinder: ${activeChildren ?? 0}
- Anwesend heute: ${presentToday} (${attendanceRate}%)
- Abwesend heute: ${absentToday}
- Wartelist: ${waitlistCount ?? 0}
- Neue Anmeldungen (unbearbeitet): ${neuAnmeldungen ?? 0}

Personal:
- Mitarbeiter gesamt: ${totalStaff}
- Kranke Mitarbeiter: ${staffSick}

Finanzen & Kommunikation:
- Offene Zahlungen: ${openPaymentsCount} (${openPaymentsAmount.toFixed(0)}€)
- Ankündigungen (30 Tage): ${(recentAnnouncements ?? []).length}

Erstelle 3-4 priorisierte Handlungsempfehlungen als JSON:
[{"typ":"dringend"|"hinweis"|"info","text":"..."}]

Fokus auf: aktuell dringende Punkte, nicht erledigte Aufgaben.
JSON only.`,
      }],
    })

    const raw = (msg.content[0] as any).text
    const hinweise = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    return NextResponse.json({
      hinweise,
      stats: {
        activeChildren: activeChildren ?? 0,
        attendanceRate,
        staffSick,
        openPaymentsCount,
        neuAnmeldungen: neuAnmeldungen ?? 0,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
