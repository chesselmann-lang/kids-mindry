import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role, full_name, phone, avatar_url, language').eq('id', user.id).single()
    const p = profile as any

    const hasFullName = !!p?.full_name
    const hasPhone = !!p?.phone
    const hasAvatar = !!p?.avatar_url
    const role = p?.role ?? 'parent'

    let childCount = 0
    if (role === 'parent') {
      const { data: guardians } = await supabase.from('guardians').select('child_id').eq('user_id', user.id)
      childCount = (guardians ?? []).length
    }

    const roleLabels: Record<string, string> = {
      parent: 'Elternteil', educator: 'Erzieher/in', group_lead: 'Gruppenleitung',
      admin: 'Administrator', caretaker: 'Betreuer/in',
    }

    const completeness = [hasFullName, hasPhone, hasAvatar].filter(Boolean).length
    const completenessPercent = Math.round((completeness / 3) * 100)

    const prompt = `Du bist ein hilfsbereiter KI-Assistent für eine Kita-App. Analysiere das Nutzerprofil:

Rolle: ${roleLabels[role] ?? role}
Name hinterlegt: ${hasFullName ? 'Ja' : 'Nein'}
Telefon hinterlegt: ${hasPhone ? 'Ja' : 'Nein'}
Profilfoto hinterlegt: ${hasAvatar ? 'Ja' : 'Nein'}
Profilkomplettheit: ${completenessPercent}%
${role === 'parent' ? `Verknüpfte Kinder: ${childCount}` : ''}

Gib 2-3 kurze Tipps zur Profiloptimierung und Nutzung der App.
Antworte im JSON-Format: {"hinweise": [{"typ": "tipp|info|status", "text": "..."}]}
Typ "tipp" = Verbesserungsvorschlag, "info" = nützliche Info, "status" = aktueller Stand.
Nur JSON, kein Markdown.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as any).text
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({
      ...parsed,
      stats: { hasFullName, hasPhone, hasAvatar, completenessPercent, role, childCount },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
