/**
 * POST /api/ai/translate
 * Übersetzt eine Nachricht in die gewünschte Zielsprache.
 *
 * Unterstützte Sprachen (12):
 *   de, en, tr, ar, ru, pl, uk, ro, bg, it, es, fr
 *
 * Body:  { text: string, targetLang: string, messageId?: string }
 * Returns: { translated: string, detectedLang: string }
 *
 * Rate-Limited: 8 Anfragen/min per User (geteilt mit allen AI-Routen).
 * Auth: Required.
 * Model: Haiku (schnell + günstig für Übersetzungen).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyAiRateLimit } from '@/lib/ai-utils'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { z } from 'zod'

const SUPPORTED_LANGS: Record<string, string> = {
  de: 'Deutsch',
  en: 'Englisch',
  tr: 'Türkisch',
  ar: 'Arabisch',
  ru: 'Russisch',
  pl: 'Polnisch',
  uk: 'Ukrainisch',
  ro: 'Rumänisch',
  bg: 'Bulgarisch',
  it: 'Italienisch',
  es: 'Spanisch',
  fr: 'Französisch',
}

const Schema = z.object({
  text:       z.string().min(1).max(2000),
  targetLang: z.enum(['de', 'en', 'tr', 'ar', 'ru', 'pl', 'uk', 'ro', 'bg', 'it', 'es', 'fr']),
  messageId:  z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit
  const rl = applyAiRateLimit(user.id)
  if (rl) return rl

  // Validate body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const { text, targetLang } = parsed.data
  const targetLangName = SUPPORTED_LANGS[targetLang]

  // Wenn der Text schon in der Zielsprache ist, früh zurückgeben
  if (text.trim().length === 0) {
    return NextResponse.json({ translated: text, detectedLang: targetLang })
  }

  try {
    const response = await anthropic().messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: `Du bist ein professioneller Übersetzer für ein deutsches Kita-Verwaltungssystem.
Übersetze den gegebenen Text präzise und natürlich in ${targetLangName}.
Antworte NUR mit dem übersetzten Text — keine Erklärungen, keine Anmerkungen, keine Anführungszeichen drum herum.
Behalte Emojis und Sonderzeichen bei.
Wenn der Text bereits in ${targetLangName} ist, gib ihn unverändert zurück.`,
      messages: [
        {
          role: 'user',
          content: `Übersetze folgenden Text in ${targetLangName}:\n\n${text}`,
        },
      ],
    })

    const translated = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : text

    // Spracherkennung: einfache Heuristik via Modell-Response
    // (Wir übergeben kein detectedLang zurück, da Haiku's Response direkt der Text ist)
    return NextResponse.json({
      translated,
      detectedLang: 'auto', // Client zeigt "Übersetzt" Badge
    })
  } catch (err) {
    console.error('[translate] Claude error:', err)
    return NextResponse.json(
      { error: 'Übersetzung momentan nicht verfügbar.' },
      { status: 503 }
    )
  }
}
