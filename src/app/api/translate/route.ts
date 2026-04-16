import { NextRequest, NextResponse } from 'next/server'
import { translateText, SupportedLang } from '@/lib/translate'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const Schema = z.object({
  text: z.string().min(1).max(5000),
  lang: z.enum(['TR', 'AR', 'RU', 'PL', 'RO', 'UK', 'HR']),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = checkRateLimit(`translate:${ip}`, 30, 60_000)
  if (!rl.ok) return rateLimitResponse(rl.reset)

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  try {
    const translated = await translateText(parsed.data.text, parsed.data.lang as SupportedLang)
    return NextResponse.json({ translated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
