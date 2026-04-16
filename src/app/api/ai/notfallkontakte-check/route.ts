export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, emergency_contact_name, emergency_contact_phone, allergies')
    .eq('site_id', siteId)
    .eq('status', 'active')

  const list = (children ?? []) as any[]
  const missingContact = list.filter(c => !c.emergency_contact_name)
  const missingPhone = list.filter(c => c.emergency_contact_name && !c.emergency_contact_phone)
  const withAllergiesNoContact = list.filter(c => {
    const hasAllergy = c.allergies && (Array.isArray(c.allergies) ? c.allergies.length > 0 : c.allergies !== '')
    return hasAllergy && !c.emergency_contact_name
  })

  const prompt = `Du bist ein KiTa-Sicherheitsassistent. Analysiere die Notfallkontakt-Vollständigkeit:

Kinder gesamt: ${list.length}
Ohne Notfallkontakt: ${missingContact.length}
Mit Kontakt aber ohne Telefon: ${missingPhone.length}
Mit Allergie aber ohne Notfallkontakt: ${withAllergiesNoContact.length}
Ohne Kontakt: ${missingContact.slice(0, 3).map(c => c.first_name).join(', ')}${missingContact.length > 3 ? '...' : ''}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"kritisch|wichtig|ok","text":"..."}],"stats":{"total":${list.length},"missingContact":${missingContact.length},"missingPhone":${missingPhone.length},"allergiesNoContact":${withAllergiesNoContact.length}}}
Maximal 2 hinweise.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
