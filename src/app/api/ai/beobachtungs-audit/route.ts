export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { subDays, format } from 'date-fns'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface AuditScore {
  vollstaendigkeit: number
  konkretheit: number
  entwicklungsbezug: number
  handlungsempfehlung: number
  dsgvo_konformitaet: number
  gesamt_score: number
  verbesserungsvorschlag: string
}

async function auditBeobachtung(obs: any): Promise<AuditScore> {
  const prompt = `Du bist Qualitätsprüferin für pädagogische Beobachtungen in einer Kita.

Bewerte folgende Beobachtung auf 5 Dimensionen (jeweils 1–10):

BEOBACHTUNG:
Text: "${obs.text || obs.beschreibung || '(kein Text)'}"
Entwicklungsbereich: "${obs.entwicklungsbereich || obs.kategorie || '(kein Bereich)'}"
Datum: ${obs.datum || obs.created_at || 'unbekannt'}
Maßnahmen: "${obs.massnahmen || obs.notizen || '(keine)'}"

DIMENSIONEN:
1. vollstaendigkeit (1–10): Sind alle Pflichtfelder ausgefüllt? (Text, Bereich, Datum)
2. konkretheit (1–10): Beschreibt der Text konkrete, beobachtbare Handlungen (kein "immer/nie")?
3. entwicklungsbezug (1–10): Ist der Entwicklungsbereich klar und nachvollziehbar benannt?
4. handlungsempfehlung (1–10): Gibt es klare Folgeschritte / pädagogische Maßnahmen?
5. dsgvo_konformitaet (1–10): Keine unzulässigen Daten Dritter, keine Diagnosen, kein DSGVO-Problem?

Antworte NUR mit diesem JSON:
{
  "vollstaendigkeit": <1–10>,
  "konkretheit": <1–10>,
  "entwicklungsbezug": <1–10>,
  "handlungsempfehlung": <1–10>,
  "dsgvo_konformitaet": <1–10>,
  "verbesserungsvorschlag": "<max 2 Sätze: Was fehlt? Was verbessern?>"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (response.content[0] as any).text?.trim() ?? '{}'
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(clean)

  const scores = [
    result.vollstaendigkeit,
    result.konkretheit,
    result.entwicklungsbezug,
    result.handlungsempfehlung,
    result.dsgvo_konformitaet,
  ].map(s => Math.max(1, Math.min(10, parseInt(s) || 5)))

  return {
    vollstaendigkeit: scores[0],
    konkretheit: scores[1],
    entwicklungsbezug: scores[2],
    handlungsempfehlung: scores[3],
    dsgvo_konformitaet: scores[4],
    gesamt_score: Math.round((scores.reduce((a, b) => a + b, 0) / 5) * 10) / 10,
    verbesserungsvorschlag: result.verbesserungsvorschlag ?? '',
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  // Load beobachtungen from last 30 days
  const { data: beobachtungen, error: obsError } = await (supabase as any)
    .from('beobachtungen')
    .select('id, text, beschreibung, entwicklungsbereich, kategorie, datum, created_at, massnahmen, notizen, kind_id')
    .eq('site_id', siteId)
    .gte('datum', since)
    .order('datum', { ascending: false })
    .limit(50)

  if (obsError) {
    // Try alternative table name
    const { data: altObs } = await (supabase as any)
      .from('observations')
      .select('id, content, development_area, created_at, notes, child_id')
      .eq('site_id', siteId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!altObs || altObs.length === 0) {
      return NextResponse.json({ error: 'Keine Beobachtungen gefunden' }, { status: 404 })
    }

    // Map to standard format
    const mapped = altObs.map((o: any) => ({
      id: o.id,
      text: o.content,
      entwicklungsbereich: o.development_area,
      datum: o.created_at,
      massnahmen: o.notes,
      kind_id: o.child_id,
    }))

    return processAudit(supabase, siteId, mapped)
  }

  if (!beobachtungen || beobachtungen.length === 0) {
    return NextResponse.json({ error: 'Keine Beobachtungen im Zeitraum gefunden' }, { status: 404 })
  }

  return processAudit(supabase, siteId, beobachtungen)
}

async function processAudit(supabase: any, siteId: string, beobachtungen: any[]) {
  const auditId = crypto.randomUUID()
  const results: any[] = []
  const errors: string[] = []

  // Batch: 5 parallel at a time
  const BATCH_SIZE = 5
  for (let i = 0; i < Math.min(beobachtungen.length, 30); i += BATCH_SIZE) {
    const batch = beobachtungen.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map(async (obs: any) => {
        const score = await auditBeobachtung(obs)
        return { ...obs, ...score }
      })
    )

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        results.push(r.value)
      } else {
        errors.push(r.reason?.message ?? 'unknown error')
      }
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ error: 'Audit fehlgeschlagen', errors }, { status: 500 })
  }

  // Aggregate stats
  const avgScore = results.reduce((s, r) => s + r.gesamt_score, 0) / results.length
  const schwachste = [...results].sort((a, b) => a.gesamt_score - b.gesamt_score).slice(0, 5)
  const staerkste = [...results].sort((a, b) => b.gesamt_score - a.gesamt_score).slice(0, 5)

  const dimAvgs = {
    vollstaendigkeit: avg(results, 'vollstaendigkeit'),
    konkretheit: avg(results, 'konkretheit'),
    entwicklungsbezug: avg(results, 'entwicklungsbezug'),
    handlungsempfehlung: avg(results, 'handlungsempfehlung'),
    dsgvo_konformitaet: avg(results, 'dsgvo_konformitaet'),
  }

  // Speichere Audit-Zusammenfassung
  await (supabase as any)
    .from('beobachtungs_audits_summary')
    .insert({
      id: auditId,
      einrichtung_id: siteId,
      anzahl_beobachtungen: results.length,
      gesamt_score_avg: Math.round(avgScore * 10) / 10,
      dimensionen: dimAvgs,
      schwachste_ids: schwachste.map((r: any) => r.id),
      erstellt_at: new Date().toISOString(),
    })
    .catch(() => {}) // Table may not exist yet — non-fatal

  return NextResponse.json({
    auditId,
    datum: new Date().toISOString(),
    anzahl: results.length,
    fehler: errors.length,
    gesamt_score: Math.round(avgScore * 10) / 10,
    dimensionen: dimAvgs,
    schwachste: schwachste.map((r: any) => ({
      id: r.id,
      gesamt_score: r.gesamt_score,
      text: r.text?.slice(0, 80) + '…' ?? '(kein Text)',
      datum: r.datum || r.created_at,
      verbesserungsvorschlag: r.verbesserungsvorschlag,
      scores: {
        vollstaendigkeit: r.vollstaendigkeit,
        konkretheit: r.konkretheit,
        entwicklungsbezug: r.entwicklungsbezug,
        handlungsempfehlung: r.handlungsempfehlung,
        dsgvo_konformitaet: r.dsgvo_konformitaet,
      },
    })),
    staerkste: staerkste.map((r: any) => ({
      id: r.id,
      gesamt_score: r.gesamt_score,
      text: r.text?.slice(0, 80) + '…' ?? '(kein Text)',
      datum: r.datum || r.created_at,
    })),
    alle: results.map((r: any) => ({
      id: r.id,
      gesamt_score: r.gesamt_score,
      text: r.text?.slice(0, 60) + '…' ?? '(kein Text)',
      datum: r.datum || r.created_at,
      verbesserungsvorschlag: r.verbesserungsvorschlag,
      scores: {
        vollstaendigkeit: r.vollstaendigkeit,
        konkretheit: r.konkretheit,
        entwicklungsbezug: r.entwicklungsbezug,
        handlungsempfehlung: r.handlungsempfehlung,
        dsgvo_konformitaet: r.dsgvo_konformitaet,
      },
    })),
  })
}

function avg(arr: any[], key: string): number {
  const vals = arr.map(r => r[key] ?? 0).filter(v => v > 0)
  if (!vals.length) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}
