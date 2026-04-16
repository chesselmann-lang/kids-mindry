import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load fee records
  const { data: fees } = await supabase
    .from('fee_records')
    .select(`
      id,
      amount,
      due_date,
      paid_at,
      status,
      fee_type,
      notes,
      children(first_name, last_name, date_of_birth),
      profiles:parent_id(full_name, email)
    `)
    .eq('site_id', siteId)
    .order('due_date', { ascending: false })
    .limit(500)

  if (!fees || fees.length === 0) {
    // Return empty CSV with headers
    const headers = 'Vorname;Nachname;Geburtsdatum;Elternteil;E-Mail;Betrag;Fälligkeitsdatum;Bezahlt am;Status;Typ;Notizen\n'
    return new NextResponse(headers, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="gebuehren_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  function csvVal(v: string | null | undefined): string {
    if (v == null || v === undefined) return ''
    const s = String(v)
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  function formatDate(d: string | null | undefined): string {
    if (!d) return ''
    return d.split('T')[0]
  }

  function formatAmount(a: number | null | undefined): string {
    if (a == null) return ''
    return String(a).replace('.', ',') + ' €'
  }

  const statusLabel: Record<string, string> = {
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    overdue: 'Überfällig',
    cancelled: 'Storniert',
    partial: 'Teilbezahlt',
  }

  const rows = [
    'Vorname;Nachname;Geburtsdatum;Elternteil;E-Mail;Betrag;Fälligkeitsdatum;Bezahlt am;Status;Typ;Notizen',
    ...(fees as any[]).map(f => [
      csvVal(f.children?.first_name),
      csvVal(f.children?.last_name),
      csvVal(formatDate(f.children?.date_of_birth)),
      csvVal(f.profiles?.full_name),
      csvVal(f.profiles?.email),
      csvVal(formatAmount(f.amount)),
      csvVal(formatDate(f.due_date)),
      csvVal(formatDate(f.paid_at)),
      csvVal(statusLabel[f.status] ?? f.status),
      csvVal(f.fee_type),
      csvVal(f.notes),
    ].join(';')),
  ]

  const csv = '\uFEFF' + rows.join('\n') // BOM for Excel UTF-8

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="gebuehren_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
