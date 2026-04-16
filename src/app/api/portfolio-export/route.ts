/**
 * GET /api/portfolio-export?childId=...
 *
 * Returns an HTML document styled for print that can be printed to PDF
 * by the browser's print dialog (Ctrl+P / Cmd+P → "Als PDF speichern").
 *
 * Access control: staff see all observations; parents only see those
 * where shared_with_parents = true AND they are the child's guardian.
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const DOMAIN_CONFIG: Record<string, { label: string; icon: string }> = {
  general:   { label: 'Allgemein',    icon: '📝' },
  social:    { label: 'Sozialverhalten', icon: '🤝' },
  language:  { label: 'Sprachentwicklung', icon: '💬' },
  motor:     { label: 'Motorik',      icon: '🏃' },
  cognitive: { label: 'Kognition',    icon: '🧠' },
  creative:  { label: 'Kreativität',  icon: '🎨' },
  emotional: { label: 'Emotionalität', icon: '❤️' },
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('childId')
  if (!childId) return new NextResponse('childId fehlt', { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  // Access check for parents
  if (!isStaff) {
    const { data: guardian } = await supabase.from('guardians').select('id')
      .eq('user_id', user.id).eq('child_id', childId).maybeSingle()
    if (!guardian) return new NextResponse('Forbidden', { status: 403 })
  }

  // Fetch child + site
  const { data: child } = await supabase.from('children')
    .select('first_name, last_name, date_of_birth, groups(name, color)')
    .eq('id', childId).single()
  if (!child) return new NextResponse('Kind nicht gefunden', { status: 404 })

  const { data: site } = await supabase
    .from('sites').select('name')
    .eq('id', process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!).single()

  // Fetch observations
  let obsQuery = supabase.from('observations').select('*')
    .eq('child_id', childId)
    .order('observed_at', { ascending: false })
  if (!isStaff) obsQuery = obsQuery.eq('shared_with_parents', true)

  const { data: observations } = await obsQuery

  const c = child as any
  const g = c.groups
  const today = format(new Date(), 'd. MMMM yyyy', { locale: de })
  const dob = c.date_of_birth
    ? format(new Date(c.date_of_birth), 'd. MMMM yyyy', { locale: de })
    : null

  const highlights = (observations ?? []).filter((o: any) => o.is_highlight)
  const regular = (observations ?? []).filter((o: any) => !o.is_highlight)

  // Build domain counts
  const domainCounts: Record<string, number> = {}
  for (const o of observations ?? []) {
    domainCounts[(o as any).domain] = (domainCounts[(o as any).domain] ?? 0) + 1
  }

  function renderObs(obs: any) {
    const dom = DOMAIN_CONFIG[obs.domain] ?? { label: obs.domain, icon: '📝' }
    const dateStr = format(new Date(obs.observed_at), 'd. MMM yyyy', { locale: de })
    const photos: string[] = obs.photo_urls ?? []
    return `
      <div class="obs-card${obs.is_highlight ? ' highlight' : ''}">
        <div class="obs-meta">
          <span class="obs-domain">${dom.icon} ${dom.label}</span>
          <span class="obs-date">${dateStr}</span>
        </div>
        <p class="obs-content">${escapeHtml(obs.content ?? '')}</p>
        ${photos.length > 0 ? `<div class="obs-photos">${photos.map(url =>
          `<img src="${url}" alt="Foto" class="obs-photo" />`
        ).join('')}</div>` : ''}
      </div>`
  }

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio – ${c.first_name} ${c.last_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      max-width: 800px;
      margin: 0 auto;
      padding: 20mm 15mm;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 20mm 15mm; }
      .no-break { break-inside: avoid; }
    }
    h1 { font-size: 22pt; color: #111827; margin-bottom: 4px; }
    h2 { font-size: 14pt; color: #374151; margin-bottom: 12px; border-bottom: 2px solid #f3f4f6; padding-bottom: 6px; }
    .header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 32px; }
    .avatar {
      width: 72px; height: 72px; border-radius: 16px;
      background: ${g?.color ?? '#6366f1'};
      display: flex; align-items: center; justify-content: center;
      font-size: 24pt; font-weight: bold; color: white;
      flex-shrink: 0;
    }
    .child-info h1 { margin-bottom: 2px; }
    .group-badge {
      display: inline-block;
      background: ${g?.color ?? '#6366f1'};
      color: white;
      border-radius: 99px;
      padding: 2px 12px;
      font-size: 9pt;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .meta { font-size: 9pt; color: #6b7280; }
    .meta-line { margin-top: 2px; }
    .kita-name { font-size: 10pt; color: #6b7280; margin-top: 8px; }
    .section { margin-bottom: 28px; }
    .domain-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .domain-chip {
      background: #f9fafb; border: 1px solid #e5e7eb;
      border-radius: 8px; padding: 4px 10px;
      font-size: 9pt; color: #374151;
      display: flex; align-items: center; gap: 4px;
    }
    .domain-chip .count { font-weight: bold; color: #6366f1; }
    .obs-card {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 10px;
      break-inside: avoid;
    }
    .obs-card.highlight {
      background: #fffbeb;
      border-color: #fbbf24;
      border-left: 4px solid #f59e0b;
    }
    .obs-meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .obs-domain { font-size: 9pt; font-weight: 600; color: #6b7280; }
    .obs-date { font-size: 9pt; color: #9ca3af; }
    .obs-content { font-size: 10.5pt; color: #374151; line-height: 1.5; }
    .obs-photos { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .obs-photo { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
    .highlight-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 10pt; font-weight: 600; color: #d97706;
      margin-bottom: 12px;
    }
    .empty { color: #9ca3af; font-style: italic; font-size: 10pt; }
    .footer {
      margin-top: 40px; padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt; color: #9ca3af;
      display: flex; justify-content: space-between;
    }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="header no-break">
    <div class="avatar">${c.first_name[0]}${c.last_name[0]}</div>
    <div class="child-info">
      <h1>${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</h1>
      ${g ? `<div class="group-badge">${escapeHtml(g.name)}</div>` : ''}
      <div class="meta">
        ${dob ? `<div class="meta-line">Geburtsdatum: ${dob}</div>` : ''}
        <div class="meta-line">Beobachtungen: ${(observations ?? []).length}</div>
      </div>
    </div>
  </div>

  ${Object.keys(domainCounts).length > 0 ? `
  <div class="section no-break">
    <h2>Entwicklungsbereiche</h2>
    <div class="domain-grid">
      ${Object.entries(domainCounts).map(([domain, count]) => {
        const cfg = DOMAIN_CONFIG[domain] ?? { label: domain, icon: '📝' }
        return `<div class="domain-chip">${cfg.icon} ${cfg.label} <span class="count">${count}</span></div>`
      }).join('')}
    </div>
  </div>` : ''}

  ${highlights.length > 0 ? `
  <div class="section">
    <div class="highlight-label">⭐ Besondere Momente</div>
    ${highlights.map(renderObs).join('')}
  </div>
  <hr class="divider" />` : ''}

  ${regular.length > 0 ? `
  <div class="section">
    <h2>Beobachtungen</h2>
    ${regular.map(renderObs).join('')}
  </div>` : ''}

  ${(observations ?? []).length === 0 ? `
  <p class="empty">Noch keine Beobachtungen vorhanden.</p>
  ` : ''}

  <div class="footer">
    <span>${site ? escapeHtml((site as any).name) : 'KitaHub'} · ${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</span>
    <span>Erstellt am ${today}</span>
  </div>

  <script>
    // Auto-open print dialog when opened in a new tab
    window.addEventListener('load', () => {
      if (new URLSearchParams(location.search).get('print') === '1') {
        setTimeout(() => window.print(), 500)
      }
    })
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
