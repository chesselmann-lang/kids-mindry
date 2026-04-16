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
    if ((profile as any)?.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // All kitas
    const { data: kitas } = await supabase
      .from('sites')
      .select('id, name, city, max_children, created_at')
      .order('name')

    const kitaIds = (kitas ?? []).map((k: any) => k.id)

    const [
      { data: children },
      { data: openPayments },
      { data: announcements30 },
      { data: staffProfiles },
    ] = await Promise.all([
      supabase.from('children').select('site_id').in('site_id', kitaIds).eq('status', 'active'),
      supabase.from('payment_items').select('site_id, amount, status').in('site_id', kitaIds).eq('status', 'open'),
      supabase.from('announcements').select('site_id')
        .in('site_id', kitaIds)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()),
      supabase.from('profiles').select('site_id, role')
        .in('site_id', kitaIds)
        .in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
    ])

    // Per-kita aggregation
    const kitaStats = (kitas ?? []).map((k: any) => {
      const kinder = (children ?? []).filter((c: any) => c.site_id === k.id).length
      const offeneZahlungen = (openPayments ?? []).filter((p: any) => p.site_id === k.id).length
      const offenerBetrag = (openPayments ?? [])
        .filter((p: any) => p.site_id === k.id)
        .reduce((s: number, p: any) => s + (p.amount ?? 0), 0) / 100
      const neueMitteilungen = (announcements30 ?? []).filter((a: any) => a.site_id === k.id).length
      const personal = (staffProfiles ?? []).filter((s: any) => s.site_id === k.id).length
      const auslastung = k.max_children > 0 ? Math.round((kinder / k.max_children) * 100) : null

      return {
        name: k.name,
        city: k.city,
        kinder,
        maxKinder: k.max_children,
        auslastung,
        personal,
        offeneZahlungen,
        offenerBetrag: offenerBetrag.toFixed(2),
        neueMitteilungen,
      }
    })

    const totalKinder = kitaStats.reduce((s, k) => s + k.kinder, 0)
    const totalOffeneZahlungen = kitaStats.reduce((s, k) => s + k.offeneZahlungen, 0)
    const totalOffenerBetrag = kitaStats.reduce((s: number, k) => s + parseFloat(k.offenerBetrag), 0)
    const avgAuslastung = kitaStats.filter(k => k.auslastung !== null).length > 0
      ? Math.round(kitaStats.filter(k => k.auslastung !== null).reduce((s, k) => s + (k.auslastung ?? 0), 0) / kitaStats.filter(k => k.auslastung !== null).length)
      : null

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Du bist Verwaltungsberater für einen Kita-Träger in Deutschland.

Trägerdaten (${kitaStats.length} Kitas):
${kitaStats.map(k =>
  `- ${k.name} (${k.city}): ${k.kinder}/${k.maxKinder || '?'} Kinder (${k.auslastung !== null ? k.auslastung + '%' : '?'} Auslastung), ${k.personal} Personal, ${k.offeneZahlungen} offene Zahlungen (${k.offenerBetrag}€), ${k.neueMitteilungen} Mitteilungen (30 Tage)`
).join('\n')}

Gesamt: ${totalKinder} Kinder, ${totalOffeneZahlungen} offene Zahlungen (${totalOffenerBetrag.toFixed(2)}€), Ø Auslastung ${avgAuslastung !== null ? avgAuslastung + '%' : 'unbekannt'}

Erstelle 3-4 strategische Hinweise als JSON-Array:
[{"typ":"kritisch"|"hinweis"|"info","text":"..."}]

Fokus auf: Auslastungsunterschiede, Zahlungsrückstände, Kommunikationsaktivität.
JSON only, kein Markdown.`,
      }],
    })

    const raw = (msg.content[0] as any).text
    const hinweise = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    return NextResponse.json({
      hinweise,
      stats: {
        totalKitas: kitaStats.length,
        totalKinder,
        avgAuslastung,
        totalOffeneZahlungen,
        totalOffenerBetrag: totalOffenerBetrag.toFixed(2),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
