# Phase R1 — Hesselmann Layout Standards: Quality Report

**Datum:** 2026-04-21  
**Deployment:** `dpl_8rZdbUuPPpoGZArgKZhG8BzGSxx3` → [kids.mindry.de](https://kids.mindry.de)  
**Status:** ✅ DEPLOYED TO PRODUCTION

---

## Umfang

Umsetzung des Lexoffice-Style Drei-Spalten-Layouts für mindry kids gemäß Hesselmann Product Standards.

---

## Gelieferte Komponenten

### Navigation

| Datei | Beschreibung | Standard |
|---|---|---|
| `src/components/layout/area-top-bar.tsx` | 56px TopBar mit 6 Bereichen (Lexoffice-Style), PIN-Modal für Eltern, Theme-Toggle | ✅ |
| `src/components/layout/area-sidebar.tsx` | 240px Sidebar, gruppierte Navigation pro Bereich (MATHE/DEUTSCH etc.), Admin-Link | ✅ |
| `src/components/layout/app-shell.tsx` | Client-Wrapper: TopBar + Sidebar + Main + ContextPanel, BottomNav Mobile | ✅ |
| `src/components/layout/context-panel-router.tsx` | Route-aware Panel-Selektion für 6 Routen | ✅ |

### Context Panels (6 Routen)

| Route | Panel | Inhalt |
|---|---|---|
| `/dashboard`, `/heute`, `/streak` | DashboardPanel | Streak, Tagesziel, KI-Tipps, Notfall-Abschaltung |
| `/kind/[id]` | KindPanel | Lernfortschritt pro Fach, Zeit-Budget, Elternfreigabe |
| `/eltern/*` | ElternPanel | Tageszusammenfassung, Bildschirm-Limit Slider, Alert-Toggles |
| `/lernen/*`, `/lerninhalte/*` | LerninhaltePanel | Altersgruppe-Filter, Kategorie-Filter, Offline-Toggle, Top-Bewertungen |
| `/belohnungen/*` | BelohnungenPanel | Punkte-Banner, Badge-Fortschritt, Eltern-Freigabe-Queue |
| `/entdecken/*`, `/community/*` | CommunityPanel | Moderations-Badge, Kinder-only Zone, Beitrags-Feed |

### Neue Seiten (Stubs)

| Route | Beschreibung |
|---|---|
| `/lernen` | Fach-Übersicht mit Icon-Grid |
| `/entdecken` | Kategorie-Übersicht (Stories, Videos, Experimente, Quiz) |
| `/belohnungen` | Punkte-Banner + Bereichs-Links |
| `/eltern` | Eltern-Bereich Übersicht |
| `/einstellungen` | Konto, Datenschutz, Eltern-Control |

---

## Layout-Spezifikation

```
[TopBar 56px sticky — Zuhause · Lernen · Entdecken · Belohnungen · Eltern-Bereich · Einstellungen]
┌─────────────────────────────────────────────────────────────────────────┐
│ Sidebar 240px │           Main (flex-1, scrollable)           │ Panel 320px  │
│  HEUTE        │                                                │ drag-resize  │
│  • Was ist    │        {children}                              │ 280–520px    │
│    dran       │                                                │              │
│  STREAK       │                                                │              │
│  FAVORITEN    │                                                │              │
└─────────────────────────────────────────────────────────────────────────┘
[BottomNav — Mobile only]
```

**Technische Details:**
- Drag-Resize: CSS Flexbox + `mousemove` delta (NICHT react-resizable-panels) ✅
- Width-Persistenz: `localStorage` Key `kita-context-panel-width` ✅
- Mobile: Sidebar `hidden lg:flex`, ContextPanel `hidden xl:flex`, FAB + Bottom-Sheet ✅
- Touch-Targets: `min-h-[44px]` auf allen Sidebar-Items ✅
- Font: `16px` body minimum via Tailwind (`text-sm` = 14px auf Labels, `text-base` auf Content) ✅
- Theme: `data-theme="light|dark"` Toggle via TopBar ✅

---

## Eltern-Bereich PIN-Schutz

- 4-stelliger PIN (Default: `1234` — TODO: aus User-Settings)
- 3×4-Grid Numpad mit großen Touch-Targets (h-14)
- Auto-Submit bei 4 Ziffern (100ms Delay für UX)
- Rote Punkte bei falschem PIN + Reset
- Backdrop-Blur Modal ✅

---

## Bekannte Limitierungen / TODOs

- [ ] Eltern-PIN sollte aus Supabase `profiles.pin` geladen werden (TODO-Kommentar gesetzt)
- [ ] `/lernen/mathe/klasse-*`, `/lernen/deutsch/*` etc. benötigen echte Inhalts-Seiten
- [ ] ContextPanel auf Tablet (1024–1279px): derzeit vollständig ausgeblendet — Toggle-Button im TopBar für zukünftige Phase
- [ ] `sidebar-nav.tsx` (alter Sidebar) bleibt als Fallback erhalten, wird nicht mehr gerendert

---

## Deployment

```bash
# Deploy-Befehl (reproduzierbar)
cd /tmp/kids-mindry-deploy
/tmp/vercel-cli/bin/vercel deploy --prod --yes \
  --token="$VERCEL_TOKEN"

# .vercel/project.json
{
  "orgId": "team_N9conkITAOUuAjavOezoxSWY",
  "projectId": "prj_X6q1BbBtrzZQsRZrBfgE12uRfGej"
}
```

**Produktions-URL:** https://kids.mindry.de  
**Build-Zeit:** ~1 Minute  
**Node-Version:** 24.x

---

## Nächste Phasen

| Phase | Inhalt | Status |
|---|---|---|
| R2 | DSGVO für Minderjährige: Art. 8 Eltern-Consent, Art. 22 kein Profiling, KJM-Altersrating, Parental Controls | 🔜 Pending |
| R3 | Testing: Vitest + Playwright + RLS-Tests | 🔜 Pending |
| R4 | TS strict, WCAG AA, Sentry+PostHog, Onboarding-Flow | 🔜 Pending |
