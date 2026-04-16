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

  const { data: requests } = await supabase
    .from('leave_requests')
    .select('id, staff_id, status, start_date, end_date, leave_type')
    .eq('site_id', siteId)
    .order('start_date', { ascending: false })
    .limit(100)

  const list = (requests ?? []) as any[]
  const pending  = list.filter(r => r.status === 'pending').length
  const approved = list.filter(r => r.status === 'approved').length
  const rejected = list.filter(r => r.status === 'rejected').length
  const uniqueStaff = new Set(list.map(r => r.staff_id)).size

  const today = new Date().toISOString().split('T')[0]
  const upcoming = list.filter(r => r.status === 'approved' && r.start_date >= today).length

  const prompt = `Du bist ein KiTa-HR-Manager. Analysiere die Urlaubsanträge:

Anträge gesamt: ${list.length}
Ausstehend: ${pending}
Genehmigt: ${approved}
Abgelehnt: ${rejected}
Bevorstehende Abwesenheiten: ${upcoming}
Verschiedene Mitarbeiter: ${uniqueStaff}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"dringend|hinweis|info","text":"..."}],"stats":{"pending":${pending},"approved":${approved},"upcoming":${upcoming}}}
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
