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
  if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).single()

  const s = site as any ?? {}
  const hasName     = !!(s.name)
  const hasCity     = !!(s.city)
  const hasAddress  = !!(s.address)
  const hasPhone    = !!(s.phone)
  const hasEmail    = !!(s.email)
  const hasLogo     = !!(s.logo_url)
  const hasWebsite  = !!(s.website)
  const filledCount = [hasName, hasCity, hasAddress, hasPhone, hasEmail, hasLogo, hasWebsite].filter(Boolean).length
  const completeness = Math.round((filledCount / 7) * 100)

  const prompt = `Du bist ein KiTa-Qualitätsmanager. Prüfe die Kita-Stammdaten:

Name: ${hasName ? 'vorhanden' : 'fehlt'}
Stadt: ${hasCity ? 'vorhanden' : 'fehlt'}
Adresse: ${hasAddress ? 'vorhanden' : 'fehlt'}
Telefon: ${hasPhone ? 'vorhanden' : 'fehlt'}
E-Mail: ${hasEmail ? 'vorhanden' : 'fehlt'}
Logo: ${hasLogo ? 'vorhanden' : 'fehlt'}
Website: ${hasWebsite ? 'vorhanden' : 'fehlt'}
Vollständigkeit: ${completeness}%

Antworte NUR mit JSON:
{"hinweise":[{"typ":"fehlt|tipp|vollständig","text":"..."}],"stats":{"completeness":${completeness},"filled":${filledCount},"total":7}}
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
