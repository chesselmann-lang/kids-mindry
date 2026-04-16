import * as deepl from 'deepl-node'

const DEEPL_API_KEY = process.env.DEEPL_API_KEY

let _translator: deepl.Translator | null = null

function getTranslator(): deepl.Translator {
  if (!_translator) {
    if (!DEEPL_API_KEY) throw new Error('DEEPL_API_KEY not configured')
    _translator = new deepl.Translator(DEEPL_API_KEY)
  }
  return _translator
}

export type SupportedLang = 'TR' | 'AR' | 'RU' | 'PL' | 'RO' | 'UK' | 'HR' | 'SR' | 'VI' | 'FA'

export const SUPPORTED_LANGUAGES: { code: SupportedLang; label: string; flag: string }[] = [
  { code: 'TR', label: 'Türkçe',    flag: '🇹🇷' },
  { code: 'AR', label: 'العربية',   flag: '🇸🇦' },
  { code: 'RU', label: 'Русский',   flag: '🇷🇺' },
  { code: 'PL', label: 'Polski',    flag: '🇵🇱' },
  { code: 'RO', label: 'Română',    flag: '🇷🇴' },
  { code: 'UK', label: 'Українська',flag: '🇺🇦' },
  { code: 'HR', label: 'Hrvatski',  flag: '🇭🇷' },
]

export async function translateText(
  text: string,
  targetLang: SupportedLang
): Promise<string> {
  const translator = getTranslator()
  const result = await translator.translateText(text, 'de', targetLang as deepl.TargetLanguageCode)
  const r = result as unknown as { text: string } | { text: string }[]
  return Array.isArray(r) ? r[0].text : r.text
}

export async function translateBatch(
  texts: string[],
  targetLang: SupportedLang
): Promise<string[]> {
  if (texts.length === 0) return []
  const translator = getTranslator()
  const results = await translator.translateText(texts, 'de', targetLang as deepl.TargetLanguageCode)
  const r = results as unknown as { text: string } | { text: string }[]
  return Array.isArray(r) ? r.map((item: { text: string }) => item.text) : [r.text]
}
