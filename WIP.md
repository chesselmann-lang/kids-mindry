# WIP — Nach Neustart committen

**Stand: 2026-04-21, vor Neustart**

## Geänderte / neue Dateien (git add + commit)

### Phase R1 — Drei-Spalten-Layout
- `src/components/layout/area-top-bar.tsx` — 56px TopBar, 6 Bereiche, PIN-Modal
- `src/components/layout/area-sidebar.tsx` — 240px Sidebar, gruppiert nach Bereich
- `src/components/layout/app-shell.tsx` — Drei-Spalten-Wrapper (neu)
- `src/components/layout/context-panel-router.tsx` — Route→Panel-Mapping (neu)
- `src/components/layout/context-panel-shell.tsx` — Drag-resize 280–520px
- `src/components/context-panels/dashboard-panel.tsx`
- `src/components/context-panels/kind-panel.tsx`
- `src/components/context-panels/eltern-panel.tsx`
- `src/components/context-panels/lerninhalte-panel.tsx`
- `src/components/context-panels/belohnungen-panel.tsx`
- `src/components/context-panels/community-panel.tsx`
- `src/app/(dashboard)/layout.tsx` — auf AppShell umgestellt
- `src/app/(dashboard)/lernen/page.tsx` (neu)
- `src/app/(dashboard)/entdecken/page.tsx` (neu)
- `src/app/(dashboard)/belohnungen/page.tsx` (neu)
- `src/app/(dashboard)/eltern/page.tsx` (neu)
- `src/app/(dashboard)/einstellungen/page.tsx` (neu)
- `docs/quality-reports/phase-r1-layout.md` (neu)

### Model-Downgrade Haiku → Sonnet
- `src/lib/anthropic.ts` — AI_MODEL = 'claude-sonnet-4-6'
- `src/app/api/ai/**/*.ts` — 132 Dateien (alle haiku→sonnet)
- `.env.example` (neu)

## Commit-Message (Vorschlag)
```
feat(layout): Phase R1 — Drei-Spalten-Layout + Sonnet default

- Lexoffice-Style TopBar (56px) mit 6 Bereichen + Eltern-PIN
- Gruppierte AreaSidebar (240px) pro Bereich
- AppShell-Wrapper ersetzt alten TopBar+BottomNav-Stack
- ContextPanelShell drag-resize 280–520px (kein react-resizable-panels)
- 6 route-spezifische Context Panels
- 5 neue Bereichs-Stub-Seiten (/lernen, /entdecken etc.)
- Alle 132 AI-Routes: claude-haiku → claude-sonnet-4-6
```

## Deployed
kids.mindry.de — dpl_8rZdbUuPPpoGZArgKZhG8BzGSxx3 (R1)
kids.mindry.de — dpl nach Sonnet-Umstellung ✅

## Nächster Schritt nach Reboot
→ Phase R2: DSGVO für Minderjährige
