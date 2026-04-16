/**
 * Gemeinsame Hilfsfunktionen für alle AI-Routen.
 *
 * parseAiJson     – Parst die Haiku-Antwort robust; einmaliger Retry bei Fehler.
 * assertSiteChild – Validiert dass ein Kind zur Site des Nutzers gehört.
 * logAiUsage      – Schreibt Verbrauch in ai_usage_logs (non-blocking).
 * validateBody    – Zod-Validierung für POST-Request-Body.
 * AiSchemas       – Fertige Zod-Schemas für alle AI-POST-Routen.
 */
import { anthropic, AI_MODEL } from './anthropic'
import { checkRateLimit } from './rate-limit'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// ─── Rate-Limiting ────────────────────────────────────────────────────────────

/**
 * Prüft Nutzer-Rate-Limit für AI-Anfragen (8/min per User).
 * Gibt NextResponse 429 zurück wenn geblockt, sonst null.
 * Aufruf am Anfang jeder AI-Route: const rl = applyAiRateLimit(user.id); if (rl) return rl
 */
export function applyAiRateLimit(userId: string): NextResponse | null {
  const { ok, reset } = checkRateLimit(`ai:user:${userId}`, 8, 60_000)
  if (!ok) return NextResponse.json(
    { error: 'Zu viele KI-Anfragen. Bitte warte eine Minute.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Limit': '8',
        'X-RateLimit-Remaining': '0',
      },
    }
  )
  return null
}

// ─── JSON-Parsing ────────────────────────────────────────────────────────────

function extractJson(raw: string): string {
  // Entferne Markdown-Code-Fences
  const stripped = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  // Extrahiere erstes vollständiges JSON-Objekt oder -Array
  const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  return match ? match[0] : stripped
}

/**
 * Parst den Text einer Haiku-Antwort als JSON.
 * Bei Parse-Fehler: ein Retry mit explizitem JSON-Only-Prompt.
 */
export async function parseAiJson<T>(
  raw: string,
  retryPrompt?: string
): Promise<T> {
  try {
    return JSON.parse(extractJson(raw)) as T
  } catch {
    if (!retryPrompt) throw new Error('AI-Antwort ist kein valides JSON und kein Retry-Prompt angegeben.')

    // Einmaliger Retry
    const retry = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 100,
      messages: [
        { role: 'user', content: retryPrompt },
        { role: 'assistant', content: raw },
        {
          role: 'user',
          content:
            'Deine Antwort war kein valides JSON. Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne Markdown, ohne Text davor oder danach.',
        },
      ],
    })
    const retryRaw = (retry.content[0] as { type: string; text: string }).text
    return JSON.parse(extractJson(retryRaw)) as T
  }
}

// ─── Site-Isolation ───────────────────────────────────────────────────────────

/**
 * Wirft einen Fehler wenn childId nicht zur siteId des Nutzers gehört.
 * Gegen Cross-Kita-Datenzugriff (Audit-Finding K3).
 */
export async function assertSiteChild(
  supabase: SupabaseClient,
  childId: string,
  siteId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('site_id', siteId)
    .maybeSingle()

  if (error || !data) {
    throw new Error('Kind nicht gefunden oder kein Zugriff.')
  }
}

// ─── Zod-Validierung ─────────────────────────────────────────────────────────

/**
 * Validiert den POST-Request-Body gegen ein Zod-Schema.
 * Gibt { data, error } zurück. Bei Fehler: error ist ein NextResponse 400.
 *
 * Verwendung:
 *   const { data, error } = await validateBody(req, AiSchemas.KindSnapshot)
 *   if (error) return error
 *   // data ist jetzt typsicher
 */
export async function validateBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: 'Ungültiges JSON im Request-Body.' }, { status: 400 }),
    }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const messages = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return {
      data: null,
      error: NextResponse.json({ error: `Validierungsfehler: ${messages}` }, { status: 400 }),
    }
  }
  return { data: parsed.data, error: null }
}

/** Fertige Zod-Schemas für alle AI-POST-Routen */
export const AiSchemas = {
  /** /api/ai/kind-snapshot */
  KindSnapshot: z.object({
    childId: z.string().uuid('childId muss eine gültige UUID sein'),
  }),

  /** /api/ai/grundschul-bericht */
  GrundschulBericht: z.object({
    childId: z.string().uuid('childId muss eine gültige UUID sein'),
  }),

  /** /api/ai/jahresrueckblick */
  Jahresrueckblick: z.object({
    childId: z.string().uuid('childId muss eine gültige UUID sein'),
    year: z.number().int().min(2020).max(2030),
  }),

  /** /api/ai/tagesbericht */
  Tagesbericht: z.object({
    childId: z.string().uuid(),
    mood: z.enum(['great', 'good', 'okay', 'sad', 'sick']).optional(),
    notes: z.string().max(2000).optional(),
    activities: z.array(z.string().max(200)).max(20).optional(),
  }),

  /** /api/ai/tagesplan */
  Tagesplan: z.object({
    altersgruppe: z.enum(['krippe', 'kiga', 'gemischt', 'hort']),
    schwerpunkt: z.enum(['bewegung', 'kreativ', 'sprache', 'natur', 'sozial', 'kognitiv']),
    notizen: z.string().max(500).optional().default(''),
  }),

  /** /api/ai/chat */
  Chat: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().max(4000),
        })
      )
      .min(1)
      .max(20),
    childId: z.string().uuid().optional(),
  }),
}

// ─── Usage-Logging ────────────────────────────────────────────────────────────

interface UsageLog {
  feature: string
  siteId: string
  userId: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

/**
 * Schreibt AI-Verbrauch in ai_usage_logs. Non-blocking: Fehler werden ignoriert.
 */
export function logAiUsage(supabase: SupabaseClient, log: UsageLog): void {
  supabase
    .from('ai_usage_logs')
    .insert({
      feature: log.feature,
      site_id: log.siteId,
      user_id: log.userId,
      input_tokens: log.inputTokens,
      output_tokens: log.outputTokens,
      duration_ms: log.durationMs,
      model: AI_MODEL,
    })
    .then(() => {})
    .catch(() => {}) // Non-blocking – Logging-Fehler stoppen nie die eigentliche Route
}
