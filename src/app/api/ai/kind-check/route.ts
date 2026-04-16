import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', user.id).single()
    if (!['admin', 'group_lead'].includes(profile?.role ?? '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: child } = await supabase
      .from('children')
      .select('first_name, last_name, date_of_birth, gender, group_id, allergies, medical_notes, status, emergency_contact_name, doctor_name, care_days')
      .eq('id', childId).single()

    if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const c = child as any

    const hasGroup = !!c.group_id
    const hasDOB = !!c.date_of_birth
    const hasGender = !!c.gender
    const hasAllergies = !!(c.allergies?.length)
    const hasMedical = !!c.medical_notes
    const hasEmergency = !!c.emergency_contact_name
    const hasDoctor = !!c.doctor_name
    const hasCare = !!(c.care_days?.length)

    const completeness = [hasGroup, hasDOB, hasGender, hasEmergency, hasDoctor, hasCare].filter(Boolean).length
    const completenessPercent = Math.round((completeness / 6) * 100)

    const prompt = `Du bist ein KI-Assistent für eine Kita-Verwaltung. Prüfe die Datenvollständigkeit eines Kindes:

Name: ${c.first_name} ${c.last_name}
Gruppe: ${hasGroup ? 'Ja' : 'FEHLT'}
Geburtsdatum: ${hasDOB ? 'Ja' : 'FEHLT'}
Geschlecht: ${hasGender ? 'Ja' : 'FEHLT'}
Allergien vermerkt: ${hasAllergies ? 'Ja' : 'Nein (könnte fehlen)'}
Medizinische Hinweise: ${hasMedical ? 'Ja' : 'Keine'}
Notfallkontakt: ${hasEmergency ? 'Ja' : 'FEHLT'}
Kinderarzt: ${hasDoctor ? 'Ja' : 'FEHLT'}
Betreuungstage: ${hasCare ? 'Ja' : 'FEHLT'}
Profilvollständigkeit: ${completenessPercent}%

Gib 2-3 kurze, präzise Hinweise zu fehlenden Daten und nächsten Schritten.
Antworte im JSON-Format: {"hinweise": [{"typ": "vollstaendig|fehlt|tipp", "text": "..."}]}
Typ "vollstaendig" = Daten ok, "fehlt" = wichtige Daten fehlen, "tipp" = Empfehlung.
Nur JSON, kein Markdown.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as any).text
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({
      ...parsed,
      stats: { completenessPercent, hasGroup, hasDOB, hasEmergency, hasDoctor },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
