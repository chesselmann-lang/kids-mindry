import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

    const [{ data: children }, { data: guardians }] = await Promise.all([
      supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
      supabase.from('guardians').select('child_id, consent_photos, consent_signed_at'),
    ])

    const childIds = new Set((children ?? []).map((c: any) => c.id))
    const activeGuardians = (guardians ?? []).filter((g: any) => childIds.has(g.child_id))

    const guardiansByChild: Record<string, any[]> = {}
    for (const g of activeGuardians) {
      if (!guardiansByChild[g.child_id]) guardiansByChild[g.child_id] = []
      guardiansByChild[g.child_id].push(g)
    }

    const totalChildren = children?.length ?? 0
    const consentFull = (children ?? []).filter((c: any) => {
      const gs = guardiansByChild[c.id] ?? []
      return gs.length > 0 && gs.every((g: any) => g.consent_photos)
    }).length
    const consentPartial = (children ?? []).filter((c: any) => {
      const gs = guardiansByChild[c.id] ?? []
      return gs.length > 0 && gs.some((g: any) => g.consent_photos) && !gs.every((g: any) => g.consent_photos)
    }).length
    const noGuardians = (children ?? []).filter((c: any) => (guardiansByChild[c.id] ?? []).length === 0).length
    const consentMissing = totalChildren - consentFull - consentPartial

    // Old consents (>12 months since signing)
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()
    const oldConsents = activeGuardians.filter((g: any) =>
      g.consent_photos && g.consent_signed_at && g.consent_signed_at < twelveMonthsAgo
    ).length

    const consentRate = totalChildren > 0 ? Math.round((consentFull / totalChildren) * 100) : 0

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Du bist Datenschutzberaterin für eine Kita.

Einwilligungsstatus:
- Kinder gesamt: ${totalChildren}
- Vollständige Einwilligung (alle Erziehungsberechtigten): ${consentFull} (${consentRate}%)
- Teilweise Einwilligung: ${consentPartial}
- Keine Einwilligung: ${consentMissing}
- Kinder ohne Erziehungsberechtigte im System: ${noGuardians}
- Veraltete Einwilligungen (>12 Monate): ${oldConsents}

Erstelle 3 Datenschutz-Hinweise als JSON:
[{"typ":"dringend"|"hinweis"|"info","text":"..."}]

Fokus auf: DSGVO-Konformität, fehlende Einwilligungen, Handlungsempfehlungen.
JSON only.`,
      }],
    })

    const raw = (msg.content[0] as any).text
    const hinweise = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    return NextResponse.json({
      hinweise,
      stats: {
        totalChildren,
        consentFull,
        consentRate,
        consentMissing,
        oldConsents,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
