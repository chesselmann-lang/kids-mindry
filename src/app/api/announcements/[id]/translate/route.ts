import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function translateText(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey || apiKey === 'REPLACE_ME') return text
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `DeepL-Auth-Key ${apiKey}` },
    body: JSON.stringify({ text: [text], target_lang: targetLang.toUpperCase(), source_lang: 'DE' }),
  })
  if (!res.ok) return text
  const data = await res.json()
  return data.translations?.[0]?.text ?? text
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['educator','group_lead','admin','caretaker'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: announcement } = await (supabase as any)
    .from('announcements').select('title, content').eq('id', params.id).single()
  if (!announcement) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { languages } = await req.json().catch(() => ({ languages: ['en','tr','ar','ru','pl'] }))
  const targetLangs: string[] = languages ?? ['en','tr','ar','ru','pl']

  const results = await Promise.all(
    targetLangs.map(async (lang) => {
      const [translatedTitle, translatedContent] = await Promise.all([
        announcement.title ? translateText(announcement.title, lang) : Promise.resolve(''),
        translateText(announcement.content ?? '', lang),
      ])
      return { lang, title: translatedTitle, content: translatedContent }
    })
  )

  for (const r of results) {
    await (supabase as any).from('announcement_translations').upsert({
      announcement_id: params.id, language: r.lang,
      title: r.title, content: r.content, translated_at: new Date().toISOString(),
    }, { onConflict: 'announcement_id,language' })
  }

  await (supabase as any).from('announcements').update({ auto_translate: true }).eq('id', params.id)
  return NextResponse.json({ translated: results.length, languages: targetLangs })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') ?? 'en'
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('announcement_translations')
    .select('title, content, translated_at')
    .eq('announcement_id', params.id).eq('language', lang).single()
  if (!data) return NextResponse.json({ error: 'No translation' }, { status: 404 })
  return NextResponse.json(data)
}
