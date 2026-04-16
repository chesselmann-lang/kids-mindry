import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get('childId')
  const date = req.nextUrl.searchParams.get('date')
  if (!childId || !date) return NextResponse.json({ error: 'childId and date required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isParent = (profile as any)?.role === 'parent'

  if (!isStaff && !isParent) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (isParent) {
    const { data: g } = await supabase.from('guardians').select('id').eq('user_id', user.id).eq('child_id', childId).maybeSingle()
    if (!g) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: child } = await supabase.from('children').select('first_name, last_name, date_of_birth').eq('id', childId).single()
  const { data: report } = await (supabase as any)
    .from('daily_reports')
    .select('mood, sleep_hours, sleep_mins, breakfast, lunch, snack, notes, activities')
    .eq('child_id', childId).eq('report_date', date).maybeSingle()

  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const c = child as any
  const r = report as any
  const moodMap: Record<string, string> = { great: 'sehr gut', good: 'gut', okay: 'ok', sad: 'traurig', sick: 'krank' }
  const sleepTotal = (r.sleep_hours ?? 0) * 60 + (r.sleep_mins ?? 0)

  const stats = {
    mood: moodMap[r.mood] ?? r.mood,
    sleepMinutes: sleepTotal,
    hasMeals: !!(r.breakfast || r.lunch || r.snack),
    hasNotes: !!r.notes,
  }

  const client = new Anthropic()
  const prompt = `Du bist ein pädagogischer Assistent. Erstelle einen freundlichen Kommentar zum Tagesbericht von ${c?.first_name ?? 'dem Kind'}.

Tagesbericht (${date}):
- Stimmung: ${moodMap[r.mood] ?? r.mood ?? 'nicht erfasst'}
- Schlaf: ${sleepTotal > 0 ? `${r.sleep_hours ?? 0}h ${r.sleep_mins ?? 0}min` : 'nicht erfasst'}
- Frühstück: ${r.breakfast ?? 'nicht erfasst'}
- Mittagessen: ${r.lunch ?? 'nicht erfasst'}
- Snack: ${r.snack ?? 'nicht erfasst'}
- Notizen: ${r.notes ?? 'keine'}

Gib 2-3 kurze ${isParent ? 'elternfreundliche' : 'pädagogische'} Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"positiv"|"hinweis"|"info","text":"..."}]

Fokus: ${isParent ? 'Was war besonders? Heimtipps?' : 'Pädagogische Beobachtungen, Entwicklungshinweise.'}
Warmer, unterstützender Ton. Nur JSON, kein Markdown.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as any).text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const hinweise = JSON.parse(clean)

  return NextResponse.json({ hinweise, stats })
}
