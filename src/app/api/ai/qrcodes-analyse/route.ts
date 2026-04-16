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
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: checkins }] = await Promise.all([
    supabase.from('children').select('id, group_id').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('child_id, check_in_method').eq('site_id', siteId)
      .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
      .limit(500),
  ])

  const totalChildren = (children ?? []).length
  const checkinList = (checkins ?? []) as any[]
  const qrCheckins = checkinList.filter(c => c.check_in_method === 'qr').length
  const childrenWithQr = new Set(checkinList.filter(c => c.check_in_method === 'qr').map(c => c.child_id)).size
  const adoptionRate = totalChildren > 0 ? Math.round((childrenWithQr / totalChildren) * 100) : 0

  const prompt = `Du bist ein KiTa-Digitalisierungsexperte. Analysiere die QR-Code Check-in Nutzung:

Aktive Kinder: ${totalChildren}
Check-ins letzter 30 Tage: ${checkinList.length}
QR-Code Check-ins: ${qrCheckins}
Kinder mit QR-Nutzung: ${childrenWithQr}
QR-Adoptionsrate: ${adoptionRate}%

Antworte NUR mit JSON:
{"hinweise":[{"typ":"tipp|info|positiv","text":"..."}],"stats":{"total":${totalChildren},"qrUsers":${childrenWithQr},"adoptionRate":${adoptionRate}}}
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
