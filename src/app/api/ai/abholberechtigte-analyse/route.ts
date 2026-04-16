import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = req.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  if (!isStaff) {
    const { data: guardian } = await supabase
      .from('guardians').select('id').eq('user_id', user.id).eq('child_id', childId).maybeSingle()
    if (!guardian) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: child } = await supabase
    .from('children').select('first_name, last_name').eq('id', childId).single()

  const { data: persons } = await supabase
    .from('pickup_persons').select('full_name, phone, relationship, notes').eq('child_id', childId)

  const personList = (persons ?? []) as any[]
  const totalCount = personList.length
  const hasPhone = personList.filter(p => p.phone).length
  const relationships = personList.map(p => p.relationship).filter(Boolean)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 450,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Gib 3 kurze Hinweise zu den Abholberechtigten auf Deutsch.

Kind: ${(child as any)?.first_name} ${(child as any)?.last_name}
Anzahl berechtigter Personen: ${totalCount}
Davon mit Telefonnummer: ${hasPhone}
Beziehungen: ${relationships.join(', ') || '(keine angegeben)'}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "status"|"hinweis"|"info", "text": "..."}
  ],
  "stats": {
    "totalCount": ${totalCount},
    "hasPhone": ${hasPhone}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
