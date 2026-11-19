/**
 * content-filter.ts — Inhaltsfilter für Chat-Nachrichten
 *
 * KJM §5 JMStV Compliance für kids.mindry.de.
 * Einfacher regelbasierter Filter (kein AI-Aufruf, keine Latenz).
 *
 * Strategie: Blockliste für eindeutig grobe Beleidigungen / Hassrede.
 * Bewusst konservativ — nur klare Verstöße, keine False-Positives.
 *
 * Einschränkungen:
 *   - Leetar-Umgehungen (h.a.s.s) werden nicht erkannt (bewusst: kein Regex-Overhead)
 *   - Eltern↔Erzieher-Chat, kein Kind-zu-Kind-Chat → moderates Schutzniveau ausreichend
 *   - Upgrade auf AI-Moderation möglich wenn nötig
 */

// ─── Blockliste (DE + häufige Fremdsprach-Einträge) ────────────────────────────
// Bewusst: nur schwere Begriffe. Alltags-Kraftausdrücke werden nicht geblockt.
const BLOCKED_TERMS: string[] = [
  // Schwere Beleidigungen (Auswahl, keine vollständige Liste)
  'hurensohn', 'wichser', 'scheiß', 'fotze', 'ficker',
  // Hass & Diskriminierung
  'kanake', 'nigger', 'zigeuner', 'judensau',
  // Sexuell explizit
  'pädophil', 'kinderporno', 'kindersex',
  // Englisch
  'nigger', 'faggot', 'cunt',
]

// Normalisierung: Kleinbuchstaben, Umlaute vereinfacht, mehrfache Leerzeichen entfernen
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s]/g, ' ')  // Sonderzeichen → Leerzeichen (verhindert Wort-Splitting als Umgehung)
    .replace(/\s+/g, ' ')
    .trim()
}

export interface FilterResult {
  blocked: boolean
  reason?: 'content' | 'length' | 'empty'
  message?: string
}

const MAX_MSG_LENGTH = 4000  // Spam-Schutz

/**
 * Prüft eine Chat-Nachricht auf unzulässige Inhalte.
 * Gibt { blocked: false } zurück wenn OK, sonst { blocked: true, reason, message }.
 */
export function checkMessage(text: string): FilterResult {
  if (!text || text.trim().length === 0) {
    return { blocked: true, reason: 'empty', message: 'Nachricht darf nicht leer sein.' }
  }

  if (text.length > MAX_MSG_LENGTH) {
    return {
      blocked: true,
      reason: 'length',
      message: `Nachricht zu lang (max. ${MAX_MSG_LENGTH} Zeichen).`,
    }
  }

  const normalized = normalize(text)

  for (const term of BLOCKED_TERMS) {
    // Wortgrenzen-Check: sperrt "hurensohn" aber nicht "Sohn" in anderem Kontext
    const pattern = new RegExp(`(^|\\s)${term}(\\s|$)`)
    if (pattern.test(normalized)) {
      return {
        blocked: true,
        reason: 'content',
        message: 'Diese Nachricht enthält unzulässige Inhalte und wurde nicht gesendet.',
      }
    }
  }

  return { blocked: false }
}
