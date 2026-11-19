export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
  typ: 'kind' | 'beobachtung' | 'journal' | 'ankuendigung' | 'protokoll'
  id: string
  titel: string
  beschreibung: string
  datum: string | null
  href: string
  gruppe?: string
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ results: [], query: q })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const search = `%${q}%`
  const results: SearchResult[] = []

  await Promise.allSettled([
    // ─── Kinder (staff only) ──────────────────────────────────────────────
    (async () => {
      if (!isStaff) return
      const { data } = await supabase
        .from('children')
        .select('id, first_name, last_name, date_of_birth, groups(name)')
        .eq('site_id', siteId)
        .eq('status', 'active')
        .or(`first_name.ilike.${search},last_name.ilike.${search}`)
        .limit(8)

      for (const c of data ?? []) {
        const child = c as any
        results.push({
          typ: 'kind',
          id: child.id,
          titel: `${child.first_name} ${child.last_name}`,
          beschreibung: child.date_of_birth
            ? `Geb.: ${new Date(child.date_of_birth).toLocaleDateString('de-DE')}`
            : '',
          datum: null,
          href: `/admin/kinder/${child.id}`,
          gruppe: child.groups?.name,
        })
      }
    })(),

    // ─── Beobachtungen ────────────────────────────────────────────────────
    (async () => {
      if (!isStaff) return
      const { data } = await (supabase as any)
        .from('beobachtungen')
        .select('id, text, beschreibung, entwicklungsbereich, datum, kind_id')
        .eq('site_id', siteId)
        .or(`text.ilike.${search},beschreibung.ilike.${search},entwicklungsbereich.ilike.${search}`)
        .order('datum', { ascending: false })
        .limit(6)

      for (const b of data ?? []) {
        const textShort = (b.text || b.beschreibung || '')?.slice(0, 100)
        results.push({
          typ: 'beobachtung',
          id: b.id,
          titel: `Beobachtung: ${b.entwicklungsbereich || 'Allgemein'}`,
          beschreibung: textShort + (textShort.length === 100 ? '…' : ''),
          datum: b.datum,
          href: `/admin/beobachtungen/${b.id}`,
        })
      }
    })(),

    // ─── Tagesjournal ─────────────────────────────────────────────────────
    (async () => {
      if (!isStaff) return
      const { data } = await (supabase as any)
        .from('tagesjournal')
        .select('id, eintrag, stimmung, datum')
        .eq('site_id', siteId)
        .ilike('eintrag', search)
        .order('datum', { ascending: false })
        .limit(6)

      for (const j of data ?? []) {
        const textShort = (j.eintrag || '')?.slice(0, 100)
        results.push({
          typ: 'journal',
          id: j.id,
          titel: `Tagesjournal ${j.datum ? new Date(j.datum).toLocaleDateString('de-DE') : ''}`,
          beschreibung: textShort + (textShort.length === 100 ? '…' : ''),
          datum: j.datum,
          href: `/admin/tagesjournal`,
        })
      }
    })(),

    // ─── Ankündigungen / Announcements ────────────────────────────────────
    (async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, body, published_at')
        .eq('site_id', siteId)
        .or(`title.ilike.${search},body.ilike.${search}`)
        .order('published_at', { ascending: false })
        .limit(5)

      for (const a of data ?? []) {
        const body = (a as any).body || ''
        results.push({
          typ: 'ankuendigung',
          id: (a as any).id,
          titel: (a as any).title ?? 'Ankündigung',
          beschreibung: body.slice(0, 100) + (body.length > 100 ? '…' : ''),
          datum: (a as any).published_at,
          href: `/ankuendigungen`,
        })
      }
    })(),

    // ─── Protokolle ───────────────────────────────────────────────────────
    (async () => {
      if (!isAdmin) return
      const { data } = await (supabase as any)
        .from('protokolle')
        .select('id, titel, inhalt, datum')
        .eq('site_id', siteId)
        .or(`titel.ilike.${search},inhalt.ilike.${search}`)
        .order('datum', { ascending: false })
        .limit(5)

      for (const p of data ?? []) {
        const inhalt = (p.inhalt || '')?.slice(0, 100)
        results.push({
          typ: 'protokoll',
          id: p.id,
          titel: p.titel ?? 'Protokoll',
          beschreibung: inhalt + (inhalt.length === 100 ? '…' : ''),
          datum: p.datum,
          href: `/admin/protokolle/${p.id}`,
        })
      }
    })(),
  ])

  // Sort by relevance: typ order + date desc
  const typOrder = { kind: 0, beobachtung: 1, journal: 2, ankuendigung: 3, protokoll: 4 }
  results.sort((a, b) => {
    const tDiff = typOrder[a.typ] - typOrder[b.typ]
    if (tDiff !== 0) return tDiff
    if (a.datum && b.datum) return new Date(b.datum).getTime() - new Date(a.datum).getTime()
    return 0
  })

  return NextResponse.json({ results: results.slice(0, 30), query: q })
}
