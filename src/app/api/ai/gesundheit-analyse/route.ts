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
    const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: child } = await supabase
      .from('children')
      .select('first_name, last_name, allergies, medical_notes, emergency_contact_name, emergency_contact_phone, doctor_name, doctor_phone, care_days, care_start_time, care_end_time')
      .eq('id', childId)
      .single()

    if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const c = child as any
    const hasAllergies = (c.allergies ?? []).length > 0
    const hasMedicalNotes = !!c.medical_notes
    const hasEmergencyContact = !!(c.emergency_contact_name && c.emergency_contact_phone)
    const hasDoctorInfo = !!(c.doctor_name && c.doctor_phone)
    const careDays = (c.care_days ?? []).length

    const prompt = `Du bist ein KI-Assistent für eine Kindertagesstätte. Analysiere die Gesundheits- und Betreuungsdaten eines Kindes:

Kind: ${c.first_name} ${c.last_name}
Allergien: ${hasAllergies ? c.allergies.join(', ') : 'keine'}
Medizinische Hinweise: ${hasMedicalNotes ? c.medical_notes : 'keine'}
Notfallkontakt: ${hasEmergencyContact ? `${c.emergency_contact_name} (${c.emergency_contact_phone})` : 'FEHLT'}
Kinderarzt: ${hasDoctorInfo ? `${c.doctor_name}` : 'FEHLT'}
Betreuungstage: ${careDays}/Woche
Betreuungszeit: ${c.care_start_time ?? '?'} – ${c.care_end_time ?? '?'}

Gib 2-3 kurze, hilfreiche Hinweise zu Vollständigkeit und Sicherheit.
Antworte im JSON-Format: {"hinweise": [{"typ": "gesundheit|hinweis|info", "text": "..."}]}
Typ "gesundheit" = medizinische Info, "hinweis" = Handlungsbedarf, "info" = allgemeine Info.
Nur JSON, kein Markdown.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as any).text
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({
      ...parsed,
      stats: { hasAllergies, hasMedicalNotes, hasEmergencyContact, hasDoctorInfo, careDays },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
