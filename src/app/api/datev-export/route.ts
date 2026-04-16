import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// DATEV Buchungsstapel export (EXTF format)
// Spec: DATEV Schnittstellen-Beschreibung EXTF
// Used by: DATEV, Lexware, sevDesk, Collmex, etc.
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()
  const isAdmin = ['admin'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Year parameter (default: current year)
  const url = new URL(req.url)
  const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()))

  // Load site info
  const { data: site } = await supabase
    .from('sites')
    .select('name, tax_id')
    .eq('id', siteId)
    .single()

  // Load all succeeded payments for the year with parent and child info
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id,
      created_at,
      amount,
      status,
      user_id,
      payment_item_id,
      payment_items(title, amount_cents, description),
      profiles:user_id(full_name, email)
    `)
    .eq('site_id', siteId)
    .eq('status', 'succeeded')
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)
    .order('created_at', { ascending: true })

  // Also load fee_records
  const { data: feeRecords } = await supabase
    .from('fee_records')
    .select(`
      id,
      amount,
      paid_at,
      due_date,
      status,
      fee_type,
      notes,
      children(first_name, last_name),
      profiles:parent_id(full_name, email)
    `)
    .eq('site_id', siteId)
    .eq('status', 'paid')
    .gte('paid_at', `${year}-01-01`)
    .lt('paid_at', `${year + 1}-01-01`)
    .order('paid_at', { ascending: true })

  // DATEV EXTF header
  // Format: "EXTF";Versionsnummer;Kategorienummer;Bezeichnung;...
  const now = new Date()
  const exportDate = formatDateTimeForHeader(now)
  const beraternummer = '00000' // Placeholder
  const mandantennummer = '00000'
  const wirtschaftsjahrBeginn = `${year}0101`
  const sachkontolaenge = '4'

  // Header line 1 (metadata)
  const headerLine1 = [
    '"EXTF"',  // Format-Kennzeichen
    '700',     // Versionsnummer
    '21',      // Datenkategorie (21 = Buchungsstapel)
    '"Buchungsstapel"', // Formatname
    '12',      // Formatversion
    exportDate,  // Erstellungsdatum
    '',          // Exportiert von (leer)
    '"KitaHub"',  // Exportiert von Programm
    '',
    '',
    beraternummer,  // Beraternummer
    mandantennummer, // Mandantennummer
    wirtschaftsjahrBeginn,  // Wirtschaftsjahr-Beginn
    sachkontolaenge,  // Sachkontenlänge
    `${year}0101`,  // Datumvon
    `${year}1231`,  // Datumbis
    `"KitaHub-Export ${year}"`,  // Bezeichnung
    '',  // Diktatkürzel
    '1',  // Buchungstyp (1 = Buchungsstapel)
    '0',  // Rechnungslegungszweck
    '0',  // Festschreibung
    '',
    '',
    '',
  ].join(';')

  // Header line 2 (column names)
  const headerLine2 = [
    'Umsatz (ohne Soll/Haben-Kz)',
    'Soll/Haben-Kennzeichen',
    'WKZ Umsatz',
    'Kurs',
    'Basis-Umsatz',
    'WKZ Basis-Umsatz',
    'Konto',
    'Gegenkonto (ohne BU-Schlüssel)',
    'BU-Schlüssel',
    'Belegdatum',
    'Belegfeld 1',
    'Belegfeld 2',
    'Skonto',
    'Buchungstext',
    'Postensperre',
    'Diverse Adressnummer',
    'Geschäftspartnerbank',
    'Sachverhalt',
    'Zinssperre',
    'Beleglink',
    'Beleginfo - Art 1',
    'Beleginfo - Inhalt 1',
    'Beleginfo - Art 2',
    'Beleginfo - Inhalt 2',
    'Beleginfo - Art 3',
    'Beleginfo - Inhalt 3',
    'KOST1 - Kostenstelle',
    'KOST2 - Kostenstelle',
    'KOST-Menge',
    'EU-Land u. UStID',
    'EU-Steuersatz',
    'Abw. Versteuerungsart',
    'Sachkonto-L-Kz',
    'Funktionsergänzung',
    'BU 49 Hauptfunktionstyp',
    'BU 49 Hauptfunktionsnummer',
    'BU 49 Funktionsergänzung',
    'Zusatzinformation - Art 1',
    'Zusatzinformation - Inhalt 1',
  ].map(h => `"${h}"`).join(';')

  const rows: string[] = []

  // Process payment_items payments
  for (const p of payments ?? []) {
    const amount = ((p as any).payment_items?.amount_cents ?? 0) / 100
    if (amount <= 0) continue

    const date = formatDateForDATEV(new Date((p as any).created_at))
    const parentName = (p as any).profiles?.full_name ?? ''
    const title = (p as any).payment_items?.title ?? 'Betreuungsbeitrag'
    const belegNr = `KB${(p as any).id.slice(0, 8).toUpperCase()}`

    rows.push([
      formatAmount(amount),  // Umsatz
      'S',                    // Soll/Haben
      'EUR',                  // WKZ
      '', '', '',             // Kurs, Basis, WKZ-Basis
      '8400',                 // Konto (Erlöskonto Dienstleistungen)
      '1000',                 // Gegenkonto (Kasse/Bank)
      '',                     // BU-Schlüssel
      date,                   // Belegdatum
      belegNr,                // Belegfeld 1
      '',                     // Belegfeld 2
      '',                     // Skonto
      datevText(`${title} - ${parentName}`),  // Buchungstext
      ...Array(25).fill(''),  // Remaining empty fields
    ].join(';'))
  }

  // Process fee_records
  for (const f of feeRecords ?? []) {
    const amount = (f as any).amount ?? 0
    if (amount <= 0) continue

    const date = formatDateForDATEV(new Date((f as any).paid_at))
    const parentName = (f as any).profiles?.full_name ?? ''
    const childName = (f as any).children
      ? `${(f as any).children.first_name} ${(f as any).children.last_name}`
      : ''
    const title = (f as any).fee_type ?? 'Betreuungsgebühr'
    const belegNr = `GE${(f as any).id.slice(0, 8).toUpperCase()}`

    rows.push([
      formatAmount(amount),   // Umsatz
      'S',                     // Soll/Haben
      'EUR',
      '', '', '',
      '8400',                  // Erlöskonto
      '1000',                  // Gegenkonto
      '',
      date,
      belegNr,
      '',
      '',
      datevText(`${title} ${childName} - ${parentName}`),
      ...Array(25).fill(''),
    ].join(';'))
  }

  if (rows.length === 0) {
    // Return file with just headers (no data)
    const csvContent = [headerLine1, headerLine2].join('\n')
    return new NextResponse('\uFEFF' + csvContent + '\n', {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="EXTF_Buchungsstapel_${year}.csv"`,
      },
    })
  }

  const csvContent = [headerLine1, headerLine2, ...rows].join('\n')

  return new NextResponse('\uFEFF' + csvContent + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="EXTF_Buchungsstapel_${year}.csv"`,
    },
  })
}

// ---- Helpers ----

function formatDateTimeForHeader(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}000`
}

function formatDateForDATEV(d: Date): string {
  // DATEV format: DDMM (without year, year is in header)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}${pad(d.getMonth() + 1)}`
}

function formatAmount(amount: number): string {
  // DATEV uses comma as decimal separator
  return amount.toFixed(2).replace('.', ',')
}

function datevText(text: string): string {
  // Max 60 chars, remove semicolons and quotes
  const clean = text.replace(/[;"]/g, ' ').trim().slice(0, 60)
  return `"${clean}"`
}
