/**
 * GET /api/monatsabrechnung?month=YYYY-MM
 *
 * Returns an HTML document designed for browser-print → PDF.
 * Shows all fee records for the given month, grouped by family/child.
 * Also includes attendance summary for context.
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })

  const { searchParams } = new URL(req.url)
  const monthParam = searchParams.get('month')
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()
  if (monthParam) {
    const [y, m] = monthParam.split('-').map(Number)
    if (!isNaN(y) && !isNaN(m)) { year = y; month = m - 1 }
  }

  const monthStart = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd')
  const monthLabel = format(new Date(year, month), 'MMMM yyyy', { locale: de })
  const siteId     = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: site } = await supabase
    .from('sites').select('name, address, email, phone')
    .eq('id', siteId).single()

  // Fees for the month (by due_date)
  const { data: fees } = await (supabase as any)
    .from('fee_records')
    .select(`
      id, amount, due_date, paid_at, status, fee_type, notes,
      children(first_name, last_name),
      profiles:parent_id(full_name, email)
    `)
    .eq('site_id', siteId)
    .gte('due_date', monthStart)
    .lte('due_date', monthEnd)
    .order('due_date', { ascending: true })

  // Attendance summary for the month
  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, group_id, groups(name)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('last_name')

  const childIds = (children ?? []).map((c: any) => c.id)
  let attendance: any[] = []
  if (childIds.length > 0) {
    const { data: att } = await supabase
      .from('attendance')
      .select('child_id, status')
      .in('child_id', childIds)
      .gte('date', monthStart)
      .lte('date', monthEnd)
    attendance = att ?? []
  }

  const attByChild: Record<string, { present: number; sick: number; vacation: number; other: number }> = {}
  for (const a of attendance) {
    if (!attByChild[a.child_id]) attByChild[a.child_id] = { present: 0, sick: 0, vacation: 0, other: 0 }
    if (a.status === 'present')         attByChild[a.child_id].present++
    else if (a.status === 'absent_sick')     attByChild[a.child_id].sick++
    else if (a.status === 'absent_vacation') attByChild[a.child_id].vacation++
    else                                     attByChild[a.child_id].other++
  }

  const feeList = fees ?? []
  const totalAmount = feeList.reduce((s: number, f: any) => s + (f.amount ?? 0), 0)
  const paidAmount = feeList.filter((f: any) => f.status === 'paid').reduce((s: number, f: any) => s + (f.amount ?? 0), 0)
  const openAmount = totalAmount - paidAmount

  const today = format(new Date(), 'd. MMMM yyyy', { locale: de })
  const s = site as any

  function fmtEuro(cents: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  }

  const feeRows = feeList.map((f: any) => {
    const child = f.children
    const parent = f.profiles
    const statusLabel = f.status === 'paid' ? '✅ Bezahlt' : f.status === 'overdue' ? '❌ Überfällig' : '⏳ Offen'
    const statusColor = f.status === 'paid' ? '#15803d' : f.status === 'overdue' ? '#dc2626' : '#d97706'
    const paidDate = f.paid_at ? format(new Date(f.paid_at), 'd. MMM yyyy', { locale: de }) : '–'
    return `<tr>
      <td>${child ? `${escHtml(child.first_name)} ${escHtml(child.last_name)}` : '–'}</td>
      <td>${parent ? escHtml(parent.full_name ?? '') : '–'}</td>
      <td>${f.fee_type ? escHtml(f.fee_type) : 'Monatsbeitrag'}</td>
      <td style="text-align:right; font-weight:600">${fmtEuro(f.amount ?? 0)}</td>
      <td style="color:${statusColor}; font-weight:600">${statusLabel}</td>
      <td>${paidDate}</td>
      ${f.notes ? `<td style="color:#6b7280;font-size:9pt">${escHtml(f.notes)}</td>` : '<td>–</td>'}
    </tr>`
  }).join('')

  const attRows = (children ?? []).map((c: any) => {
    const a = attByChild[c.id] ?? { present: 0, sick: 0, vacation: 0, other: 0 }
    const total = a.present + a.sick + a.vacation + a.other
    const rate = total > 0 ? Math.round(a.present / total * 100) : 0
    return `<tr>
      <td>${escHtml(c.last_name)}, ${escHtml(c.first_name)}</td>
      <td>${c.groups?.name ?? '–'}</td>
      <td style="text-align:center">${a.present}</td>
      <td style="text-align:center">${a.sick}</td>
      <td style="text-align:center">${a.vacation}</td>
      <td style="text-align:center; font-weight:600">${rate}%</td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Monatsabrechnung ${monthLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #111827;
      padding: 20mm 15mm;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 20mm 15mm; size: A4; }
      .page-break { page-break-before: always; }
    }
    h1 { font-size: 18pt; color: #111827; }
    h2 { font-size: 12pt; color: #374151; margin: 20px 0 10px; border-bottom: 2px solid #f3f4f6; padding-bottom: 4px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .kita-info { font-size: 9pt; color: #6b7280; }
    .kita-info p { margin-top: 2px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card {
      background: #f9fafb; border: 1px solid #e5e7eb;
      border-radius: 10px; padding: 12px;
      text-align: center;
    }
    .summary-card .label { font-size: 8pt; color: #6b7280; margin-bottom: 4px; }
    .summary-card .amount { font-size: 16pt; font-weight: bold; }
    .summary-card.total .amount { color: #1f2937; }
    .summary-card.paid .amount { color: #15803d; }
    .summary-card.open .amount { color: #d97706; }
    table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    th {
      background: #f3f4f6; text-align: left;
      padding: 6px 8px; font-weight: 600; font-size: 8.5pt;
      color: #374151; border-bottom: 2px solid #e5e7eb;
    }
    td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
    tr:hover td { background: #fafafa; }
    .footer {
      margin-top: 32px; padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt; color: #9ca3af;
      display: flex; justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Monatsabrechnung</h1>
      <p style="color:#6b7280;font-size:10pt;margin-top:4px">${monthLabel}</p>
    </div>
    <div class="kita-info" style="text-align:right">
      <p style="font-weight:700;color:#111827">${s ? escHtml(s.name) : 'Kindertageseinrichtung'}</p>
      ${s?.address ? `<p>${escHtml(s.address)}</p>` : ''}
      ${s?.email ? `<p>${escHtml(s.email)}</p>` : ''}
      ${s?.phone ? `<p>${escHtml(s.phone)}</p>` : ''}
    </div>
  </div>

  <!-- Summary cards -->
  <div class="summary-grid">
    <div class="summary-card total">
      <div class="label">Gesamt</div>
      <div class="amount">${fmtEuro(totalAmount)}</div>
    </div>
    <div class="summary-card paid">
      <div class="label">Bezahlt</div>
      <div class="amount">${fmtEuro(paidAmount)}</div>
    </div>
    <div class="summary-card open">
      <div class="label">Offen</div>
      <div class="amount">${fmtEuro(openAmount)}</div>
    </div>
  </div>

  <!-- Fee records -->
  <h2>Gebühren</h2>
  ${feeList.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Kind</th>
        <th>Erziehungsberechtigte/r</th>
        <th>Art</th>
        <th style="text-align:right">Betrag</th>
        <th>Status</th>
        <th>Bezahlt am</th>
        <th>Notiz</th>
      </tr>
    </thead>
    <tbody>${feeRows}</tbody>
  </table>` : '<p style="color:#9ca3af;font-style:italic">Keine Gebühren für diesen Monat.</p>'}

  <!-- Attendance summary (page 2) -->
  <div class="page-break"></div>
  <h2>Anwesenheitsübersicht ${monthLabel}</h2>
  ${childIds.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Kind</th>
        <th>Gruppe</th>
        <th style="text-align:center">Anwesend</th>
        <th style="text-align:center">Krank</th>
        <th style="text-align:center">Urlaub</th>
        <th style="text-align:center">Quote</th>
      </tr>
    </thead>
    <tbody>${attRows}</tbody>
  </table>` : '<p style="color:#9ca3af;font-style:italic">Keine Kinder gefunden.</p>'}

  <div class="footer">
    <span>KitaHub · kids.mindry.de</span>
    <span>Erstellt am ${today}</span>
  </div>

  <script>
    window.addEventListener('load', () => {
      if (new URLSearchParams(location.search).get('print') === '1') {
        setTimeout(() => window.print(), 400)
      }
    })
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escHtml(str: string): string {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
