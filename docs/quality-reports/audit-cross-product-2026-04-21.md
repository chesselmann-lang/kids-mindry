# Cross-Product Audit — kids.mindry.de
**Datum:** 2026-04-21  
**Auditor:** Claude (automatisiert)  
**URL:** https://kids.mindry.de  
**Login:** audit@test.de (Supabase-Testacc, via SQL erstellt)

---

## Checkliste

| Prüfpunkt | Ergebnis | Messwert |
|---|---|---|
| TopBar Höhe 56px | ✅ PASS | `header.getBoundingClientRect().height = 56` |
| 6 Bereich-Tabs vorhanden | ✅ PASS | Zuhause · Lernen · Entdecken · Belohnungen · Eltern-Bereich🔒 · Einstellungen |
| Eltern-Bereich PIN-Modal | ✅ PASS | 4-stellige PIN-Eingabe mit Zifferntastatur |
| Sidebar 240px, gruppiert | ✅ PASS | `aside.getBoundingClientRect().width = 240` |
| Context-Panel 320px rechts | ✅ PASS | `/lernen` → INHALTE-Panel, `/belohnungen` → BELOHNUNGEN-Panel, `/feed` → HEUTE-Panel |
| Tailwind CSS lädt | ✅ PASS | Alle Stile korrekt gerendert |

**Gesamtergebnis: 6/6 ✅**

---

## Befund & Fix

**Problem:** `context-panel-router.tsx` enthielt `/feed` nicht in der Route-Liste für den Dashboard-Panel.  
`/feed` ist die tatsächliche Startseite der App — `/dashboard` war ein 404.

**Fix:** `getPanelConfig()` um `/feed`, `/benachrichtigungen`, `/aufgaben` erweitert.

```diff
- if (pathname === '/dashboard' || pathname === '/heute' || ...)
+ if (
+   pathname === '/feed' ||
+   pathname === '/dashboard' ||
+   pathname === '/heute' ||
+   pathname === '/benachrichtigungen' ||
+   pathname === '/aufgaben' || ...
+ )
```

**Deploy:** Vercel Production `dpl_9pkELoXsBbLckiRGPzZQYSHyUm8Q` — `readyState: READY`

---

## Screenshots

| Route | Panel |
|---|---|
| `/feed` | HEUTE-Panel (Streak-Badge, Tagesziel-Progress, KI-Tipps, Notfall) |
| `/lernen` | INHALTE-Panel (Altersgruppen-Filter, Bereichs-Filter, Top-Bewertungen) |
| `/belohnungen` | BELOHNUNGEN-Panel (Punkte-Stand, Badges mit Progress, Eltern-Freigabe) |
| Eltern-Bereich-Click | PIN-Modal (4 Kreise + Ziffernpad 1–9, 0, ⌫) |

---

## Modell-Audit (Sonnet-Switch)

```bash
grep -r "claude-haiku" src/ --include="*.ts" --include="*.tsx" | wc -l  # → 0
grep -r "claude-sonnet-4-6" src/ --include="*.ts" --include="*.tsx" | wc -l  # → 132+
```

Alle AI-Routen verwenden `claude-sonnet-4-6`. ✅

---

## Nächste Phase

**Phase R2 — DSGVO für Minderjährige:**
- Art. 8 Eltern-Consent (Verarbeitungseinwilligung für Kinder)
- Art. 22 kein automatisiertes Profiling
- KJM-Altersrating-Metadaten
- Parental Controls UI (Zeitlimits, Inhaltsfilter, Löschanfragen)
