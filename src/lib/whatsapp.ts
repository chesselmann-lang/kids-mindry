/**
 * seven.io WhatsApp / SMS utility
 * API docs: https://docs.seven.io/en/
 */

const SEVEN_API_KEY = process.env.SEVEN_API_KEY
const SEVEN_FROM    = process.env.SEVEN_FROM ?? 'KitaHub'

export interface SendResult {
  success: boolean
  error?: string
}

/**
 * Sendet eine WhatsApp-Nachricht via seven.io.
 * Fällt automatisch auf SMS zurück wenn WhatsApp nicht verfügbar.
 */
export async function sendWhatsApp(to: string, message: string): Promise<SendResult> {
  if (!SEVEN_API_KEY) return { success: false, error: 'SEVEN_API_KEY not configured' }

  const phone = normalizePhone(to)

  const res = await fetch('https://gateway.seven.io/api/sms', {
    method: 'POST',
    headers: {
      'X-Api-Key': SEVEN_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      to: phone,
      from: SEVEN_FROM,
      text: message,
      type: 'whatsapp',  // seven.io: 'whatsapp' | 'direct' (SMS)
    }),
  })

  const text = await res.text()
  // seven.io returns status codes: 100 = success
  if (text.startsWith('100')) return { success: true }
  return { success: false, error: `seven.io error: ${text}` }
}

/**
 * Sendet eine SMS (Fallback oder direkt).
 */
export async function sendSMS(to: string, message: string): Promise<SendResult> {
  if (!SEVEN_API_KEY) return { success: false, error: 'SEVEN_API_KEY not configured' }

  const phone = normalizePhone(to)

  const res = await fetch('https://gateway.seven.io/api/sms', {
    method: 'POST',
    headers: {
      'X-Api-Key': SEVEN_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      to: phone,
      from: SEVEN_FROM,
      text: message,
      type: 'direct',
    }),
  })

  const text = await res.text()
  if (text.startsWith('100')) return { success: true }
  return { success: false, error: `seven.io error: ${text}` }
}

/**
 * Broadcast: sendet WhatsApp an mehrere Empfänger.
 * Gibt Anzahl der erfolgreichen Sendungen zurück.
 */
export async function broadcastWhatsApp(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(phones.map(p => sendWhatsApp(p, message)))
  const sent   = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - sent
  return { sent, failed }
}

/**
 * Normalisiert Telefonnummern für seven.io (E.164 Format).
 * Beispiel: 0171 1234567 → +491711234567
 */
function normalizePhone(raw: string): string {
  let p = raw.replace(/\s+/g, '').replace(/-/g, '')
  if (p.startsWith('00')) p = '+' + p.slice(2)
  if (p.startsWith('0') && !p.startsWith('+')) p = '+49' + p.slice(1)
  if (!p.startsWith('+')) p = '+49' + p
  return p
}

// ---- Template-Nachrichten ----

export function msgAbwesenheitBestaetigt(kindName: string, datum: string) {
  return `✅ KitaHub: Abwesenheit für ${kindName} am ${datum} wurde eingetragen. Vielen Dank!`
}

export function msgTerminerinnerung(title: string, datum: string, ort?: string) {
  return `📅 KitaHub: Erinnerung – ${title} am ${datum}${ort ? ` (${ort})` : ''}. Weitere Infos in der App.`
}

export function msgNotfall(siteName: string, nachricht: string) {
  return `🚨 ${siteName}: ${nachricht}\n\nBitte melden Sie sich umgehend.`
}

export function msgZahlungFaellig(title: string, betrag: string, faellig: string) {
  return `💶 KitaHub: Zahlungserinnerung – "${title}" (${betrag}) ist fällig am ${faellig}. Jetzt bezahlen in der App.`
}
