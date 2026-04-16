import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const surveyId = req.nextUrl.searchParams.get('surveyId')
  if (!surveyId) return NextResponse.json({ error: 'surveyId required' }, { status: 400 })

  const { data: survey } = await supabase
    .from('surveys')
    .select('title, description, questions')
    .eq('id', surveyId)
    .eq('is_active', true)
    .single()

  if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const s = survey as any
  const questions = Array.isArray(s.questions) ? s.questions : []
  const questionCount = questions.length
  const questionLabels = questions.slice(0, 5).map((q: any) => q.question ?? q.label ?? q.text ?? '').filter(Boolean)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Gib 2-3 kurze Hinweise zu dieser Elternbefragung auf Deutsch, damit Eltern verstehen, worum es geht und warum ihre Teilnahme wichtig ist.

Titel: ${s.title}
Beschreibung: ${s.description ?? '(keine)'}
Anzahl Fragen: ${questionCount}
Beispielfragen: ${questionLabels.join(' | ') || '(keine Vorschau)'}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "kontext"|"motivation"|"info", "text": "..."}
  ],
  "stats": {
    "questionCount": ${questionCount}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
