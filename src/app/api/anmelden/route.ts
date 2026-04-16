export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    kindVorname, kindNachname, kindGeburtsdatum, betreuungsart,
    elternName, email, telefon, adresse,
    wunschDatum, betreuungszeit, geschwisterkind, anmerkungen,
  } = body

  if (!kindVorname || !kindNachname || !email || !elternName) {
    return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data, error } = await supabase
    .from('online_anmeldungen')
    .insert({
      site_id: siteId,
      kind_vorname: kindVorname,
      kind_nachname: kindNachname,
      kind_geburtsdatum: kindGeburtsdatum || null,
      betreuungsart,
      eltern_name: elternName,
      email,
      telefon: telefon || null,
      adresse: adresse || null,
      wunsch_datum: wunschDatum || null,
      betreuungszeit,
      geschwisterkind,
      anmerkungen: anmerkungen || null,
      status: 'neu',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Push in-app notifications to all admins/group_leads
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('site_id', siteId)
      .in('role', ['admin', 'group_lead'])
    if (admins && admins.length > 0) {
      await supabase.from('notifications').insert(
        admins.map((a: any) => ({
          user_id: a.id,
          type: 'new_anmeldung',
          title: 'Neue Online-Anmeldung',
          body: `${kindVorname} ${kindNachname} — ${betreuungsart}`,
          data: { anmeldung_id: data.id, email },
        }))
      )
    }
  } catch { /* non-critical */ }

  // Notify admin via email (if Resend is configured)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'REPLACE_ME') {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'KitaHub <noreply@kids.mindry.de>',
          to: process.env.ADMIN_EMAIL ?? email,
          subject: `Neue Kita-Anmeldung: ${kindVorname} ${kindNachname}`,
          html: `<h2>Neue Online-Anmeldung</h2>
            <p><strong>Kind:</strong> ${kindVorname} ${kindNachname} (geb. ${kindGeburtsdatum})</p>
            <p><strong>Betreuungsart:</strong> ${betreuungsart}</p>
            <p><strong>Elternteil:</strong> ${elternName}</p>
            <p><strong>E-Mail:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${telefon || '—'}</p>
            <p><strong>Gewünschter Start:</strong> ${wunschDatum || '—'}</p>
            <p><strong>Betreuungszeit:</strong> ${betreuungszeit}</p>
            <p><strong>Geschwisterkind:</strong> ${geschwisterkind ? 'Ja' : 'Nein'}</p>
            ${anmerkungen ? `<p><strong>Anmerkungen:</strong> ${anmerkungen}</p>` : ''}`,
        }),
      })
    } catch {}
  }

  return NextResponse.json({ success: true, id: data.id })
}
