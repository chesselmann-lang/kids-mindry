/**
 * Zentraler Anthropic-Client-Singleton.
 * Alle AI-Routen importieren von hier – nie direkt `new Anthropic()` aufrufen.
 * Lazy-init: Client wird erst beim ersten API-Call erstellt, damit Next.js-Build
 * nicht schon beim "collecting page data" abbricht wenn ANTHROPIC_API_KEY fehlt.
 */
import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('[kids-mindry] ANTHROPIC_API_KEY ist nicht gesetzt.')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Convenience-Proxy: verhält sich wie ein Anthropic-Objekt, initialisiert lazy
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    return (getAnthropicClient() as any)[prop]
  },
})

export const AI_MODEL = 'claude-haiku-4-5-20251001' as const
