export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { thema, tonalitaet } = await req.json()
  // thema: free text topic / subject
  // tonalitaet: 'informell' | 'formell' | 'dringend' (optional, default informell)

  const ton = tonalitaet ?? 'informell'
  const tonDesc: Record<string, string> = {
    informell: 'herzlich-informell, wie ein Brief einer Kita-Leiterin',
    formell: 'professionell und sachlich',
    dringend: 'klar und direkt, mit Betonung der Dringlichkeit',
  }

  const prompt = `Schreibe eine kurze, prägnante Elternnachricht für eine Kita.

Thema / Anlass: ${thema || 'Allgemeine Information'}
Tonalität: ${tonDesc[ton] ?? tonDesc.informell}

Regeln:
- Direkte Ansprache ("Liebe Eltern," oder "Liebe Familien,")
- Klar und auf den Punkt, keine unnötigen Floskeln
- Freundlich und wertschätzend
- Maximal 80 Wörter
- Schließe mit einem freundlichen Abschluss (kein Name)

Antworte NUR mit dem Nachrichtentext, ohne JSON, ohne Anführungszeichen.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (response.content[0] as any).text?.trim() ?? ''
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
