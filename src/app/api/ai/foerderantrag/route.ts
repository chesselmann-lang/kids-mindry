import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    antragTyp = 'kibiz_betriebskosten',
    jahr = new Date().getFullYear() - 1,
    kitaName = 'Kita',
    traegerName = '',
    plaetze = 25,
    belegung = 23,
    personalkosten = 420000,
    sachkosten = 85000,
    sonstigeKosten = 15000,
    elternbeitraege = 68000,
    sonstigeEinnahmen = 12000,
    bundesland = 'NRW',
    ansprechpartner = '',
  } = body

  const gesamtkosten = personalkosten + sachkosten + sonstigeKosten
  const gesamteinnahmen = elternbeitraege + sonstigeEinnahmen
  const foerderbedarf = gesamtkosten - gesamteinnahmen
  const kostenProPlatz = Math.round(gesamtkosten / belegung)

  const prompt = `Du bist ein Experte für Kita-Förderanträge in ${bundesland}. 
Erstelle einen professionellen, formellen Förderantrag für eine Kindertageseinrichtung.

Antragtyp: ${antragTyp === 'kibiz_betriebskosten' ? 'KiBiz Betriebskostenabrechnung NRW' : antragTyp}
Berichtsjahr: ${jahr}

Einrichtungsdaten:
- Kita: ${kitaName}${traegerName ? ` (Träger: ${traegerName})` : ''}
- Genehmigter Plätze: ${plaetze}
- Durchschnittliche Belegung: ${belegung} Kinder (${Math.round(belegung/plaetze*100)}%)

Kosten ${jahr}:
- Personalkosten: ${personalkosten.toLocaleString('de-DE')} €
- Sachkosten: ${sachkosten.toLocaleString('de-DE')} €
- Sonstige Kosten: ${sonstigeKosten.toLocaleString('de-DE')} €
- GESAMT: ${gesamtkosten.toLocaleString('de-DE')} €

Einnahmen ${jahr}:
- Elternbeiträge: ${elternbeitraege.toLocaleString('de-DE')} €
- Sonstige Einnahmen: ${sonstigeEinnahmen.toLocaleString('de-DE')} €
- GESAMT: ${gesamteinnahmen.toLocaleString('de-DE')} €

Förderungsbedarf: ${foerderbedarf.toLocaleString('de-DE')} €
Kosten pro betreutem Kind: ${kostenProPlatz.toLocaleString('de-DE')} €/Jahr

Schreibe einen vollständigen Antrag mit:
1. Formeller Betreff und Einleitung
2. Beschreibung der Einrichtung und pädagogischen Arbeit
3. Detaillierte Darstellung der Betriebskosten mit Erläuterungen
4. Begründung des Förderbedarfs
5. Qualitätssicherungsmaßnahmen
6. Abschluss mit Unterschriftsblock

Der Text soll professionell, sachlich und überzeugend sein. Nutze korrekte Fachbegriffe.
Länge: ca. 600-800 Wörter.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to DB
    await supabase.from('foerderantraege').insert({
      site_id: profile.site_id,
      created_by: user.id,
      antrag_typ: antragTyp,
      jahr,
      kita_name: kitaName,
      betrag: foerderbedarf,
      inhalt: text,
      status: 'entwurf',
    }).select().single()

    return NextResponse.json({ text, foerderbedarf, gesamtkosten, gesamteinnahmen })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('foerderantraege')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data ?? [])
}
