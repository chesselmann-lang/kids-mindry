# Health-Check Report — kids.mindry.de
**Datum:** 2026-04-21  
**Deployment:** `dpl_kids-mindry-1j8ibnlod` — READY  
**Auditor:** Claude (automatisiert)

---

## A — Security Headers

**Vorher:** Nur HSTS vorhanden. 5 kritische Header fehlten.  
**Nachher:** 8/8 Header live. Gemessen via `curl -sI https://kids.mindry.de/`.

| Header | Wert | Status |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests; ...` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), ...` (12 APIs) | ✅ |
| `X-XSS-Protection` | `1; mode=block` | ✅ |
| `X-DNS-Prefetch-Control` | `on` | ✅ |

**Kinder-App-spezifische Härtung:**
- `frame-ancestors 'none'` — App nicht in Fremd-Frames einbettbar (Clickjacking-Schutz)
- `Permissions-Policy` sperrt alle 12 Browser-APIs inkl. Kamera, Mikrofon, Geolocation
- CSP `connect-src` explizit auf Supabase-Domains begrenzt
- `upgrade-insecure-requests` erzwingt HTTPS für alle Sub-Requests

---

## B — Konzept-Match: Live vs. Stub

**151 Routen gesamt** (inkl. Admin). Für die 6 Hauptbereiche:

### Vollständig implementiert (≥200 Zeilen, echte Funktionalität)
| Route | Zeilen | Status |
|---|---|---|
| `/feed` (Neuigkeiten) | 273 | ✅ Pinnwand, Schnellzugriff, Kategorie-Filter |
| `/heute` | 447 | ✅ Tagesplan, KI-Assistent, Wetter, Events |
| `/mein-kind` | 376 | ✅ Kindprofil, Portfolio, Entwicklung |
| `/anwesenheit` | 308 | ✅ Check-In/Out, Statistik |
| `/galerie` | 252 | ✅ Media-Browser, Upload |
| `/profil` | 251 | ✅ Account-Settings, Avatar |
| `/tagesjournal` | 247 | ✅ |
| `/nachrichten` | 233 | ✅ Conversation-List, Direktnachrichten |
| `/kalender` | 194 | ✅ |
| `/speiseplan` | 199 | ✅ |

### Stubs (< 80 Zeilen — Navigationsshell ohne echten Inhalt)
| Route | Zeilen | Bemerkung |
|---|---|---|
| `/lernen` | 44 | Fächer-Grid, kein tatsächlicher Lerninhalt |
| `/belohnungen` | 72 | Punkte-Banner + Links, keine echte Gamification-DB |
| `/entdecken` | 72 | Kategorie-Kacheln, kein Content-Backend |
| `/einstellungen` | 72 | Platzhalter-Kacheln |
| `/dienstplan` | 77 | Stub |
| `/aufgaben` | 44 | Stub |
| `/einwilligungen` | 38 | ⚠️ Wichtig für DSGVO — noch Stub |
| `/onboarding` | 37 | Stub |
| + 17 weitere | <80 | Stubs |

**Fazit:** Kern-Kita-Funktionen (Neuigkeiten, Anwesenheit, Kind-Profil, Nachrichten, Kalender, Speiseplan) sind real implementiert. Die R1-Lernbereiche (Lernen, Entdecken, Belohnungen) sind UI-Shells ohne Daten-Backend. `/einwilligungen` ist DSGVO-kritisch und muss in R2 gefüllt werden.

---

## C — Dev-Readiness

| Kriterium | Befund | Bewertung |
|---|---|---|
| **Tests** | 0 Test-Dateien | ❌ Keine Unit/Integration-Tests |
| **TypeScript** | `ignoreBuildErrors: true` | ⚠️ Build läuft durch, TS-Fehler unklar |
| **ESLint** | `ignoreDuringBuilds: true` | ⚠️ Linting deaktiviert |
| **TODO-Dichte** | 360 Dateien mit TODO/FIXME/`@ts-ignore` | ⚠️ Hoch |
| **Env-Vars** | 32 env vars referenziert, nur 5 in `.env.example` | ⚠️ Viele undokumentiert |
| **Undeploy-bare APIs** | Stripe, Zoom, DeepL, LexOffice, Google/MS OAuth | 🔵 Nicht konfiguriert (kein Blocker für MVP) |
| **Build** | ✅ `next build` erfolgreich, 191 statische Seiten | ✅ |
| **Bundle** | Next.js 14.2.29, Tailwind, 601 Pakete | ✅ |

**Kritische fehlende Env-Vars für Produktion:**
```
KIOSK_PIN_SALT          # PIN-Hashing (aktuell Plaintext-Fallback!)
RESEND_API_KEY          # E-Mail-Versand
NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY  # Push-Benachrichtigungen
```

---

## D — Datenbank-Status

**Supabase-Projekt:** `swrtduckugkxzrfrbgav` (kindergarten), eu-west-1

### RLS-Übersicht
| Bereich | Tabellen | RLS-Status |
|---|---|---|
| Kern-Daten | profiles, children, groups, sites | ✅ alle ON |
| Kommunikation | messages, conversations, announcements | ✅ alle ON |
| Medizin/Gesundheit | health_records, medication_logs, allergies | ✅ alle ON |
| Dokumente | documents, child_documents, kita_documents | ✅ alle ON |
| AI-Logs | ai_usage_logs | ✅ RLS aktiviert (heute gefixt, war OFF) |
| Gesamt | 107 Tabellen | **107/107 RLS ON** ✅ |

### DSGVO-Relevant
| Anforderung | Tabelle | Status |
|---|---|---|
| Art. 17 — Löschrecht | `deletion_requests` (mit `scheduled_deletion_at`) | ✅ vorhanden |
| Art. 20 — Datenportabilität | Kein Export-Mechanismus | ❌ fehlt |
| **Art. 8 — Eltern-Einwilligung** | **Keine `parental_consent`-Tabelle** | **❌ KRITISCH** |
| Art. 22 — kein Profiling | `ai_usage_logs` hat nur Zähldaten, kein Profiling | ✅ ok |
| Datensparsamkeit | `ai_usage_logs` speichert kein Eingabe-Prompt | ✅ ok |

**Art. 8-Gap:** Es gibt keine Tabelle für formale Einwilligungserklärungen von Erziehungsberechtigten. Die `/einwilligungen`-Route ist ein Stub. Dies ist **Phase-R2-Priorität #1**.

---

## E — Bug-Liste

### Kritisch (gefixt in diesem Deploy)
| # | Bug | Fix |
|---|---|---|
| E-1 | `Zuhause`-Tab in TopBar → `href: '/dashboard'` → 404 | `href: '/feed'` in `area-top-bar.tsx` |
| E-2 | Logo-Link → `/dashboard` → 404 | `href: '/feed'` in `area-top-bar.tsx` |
| E-3 | Sidebar „Was ist dran" → `/dashboard` → 404 | `href: '/feed'` in `area-sidebar.tsx` |
| E-4 | `ai_usage_logs` ohne RLS — User-IDs öffentlich lesbar | RLS + 2 Policies aktiviert |
| E-5 | `/feed` hatte kein Context-Panel | `ContextPanelRouter` um `/feed` erweitert |

### Offen — Hoch
| # | Bug | Datei | Impact |
|---|---|---|---|
| E-6 | **Eltern-PIN hardcoded `'1234'`** | `area-top-bar.tsx:47` | Sicherheitsrisiko — jeder kann den Elternbereich öffnen. `KIOSK_PIN_SALT` + DB-Lookup fehlt. |
| E-7 | **Keine Art. 8 DSGVO Einwilligung** | DB + `/einwilligungen` | Rechtlich kritisch für Kinder-App |

### Offen — Mittel
| # | Bug | Impact |
|---|---|---|
| E-8 | `sidebar-nav.tsx` referenziert `/dashboard` für Lern-Dashboard | Stub-Route, kein 404 aber falsche Route |
| E-9 | 0 Tests — keine Regressionssicherheit | Jedes Deploy potenziell regressionsbehaftet |
| E-10 | `ignoreBuildErrors: true` — TS-Fehler unsichtbar | Laufzeitfehler möglich |

### Offen — Niedrig
| # | Bug | Impact |
|---|---|---|
| E-11 | Area-Tabs `min-h-[40px]` — 4px unter WCAG 2.5.5 AAA (44px) | WCAG 2.5.8 AA (24px) wird erfüllt |
| E-12 | `user-scalable=no` in viewport-meta | Behindert Barrierefreiheit (Zoom) |
| E-13 | HydrationWarning in HTML (intentional `suppressHydrationWarning`) | Kein echter Fehler |

---

## F — Layout-Verifikation

Alle 6 Punkte der Hesselmann-Standards-Checkliste **visuell bestätigt** (Screenshots + JS-Messung):

| Punkt | Messung | Status |
|---|---|---|
| **TopBar 56px** | `header.getBoundingClientRect().height = 56` | ✅ |
| **6 Bereich-Tabs** | Zuhause · Lernen · Entdecken · Belohnungen · Eltern-Bereich🔒 · Einstellungen | ✅ |
| **Eltern-PIN-Modal** | 4-Kreise + Ziffernpad 1–9/0/⌫, schöne Blurring | ✅ |
| **Sidebar 240px, gruppiert** | `aside.getBoundingClientRect().width = 240`, sektionierte Labels | ✅ |
| **Context-Panel ≥280px rechts** | `/lernen` → INHALTE, `/belohnungen` → BELOHNUNGEN, `/feed` → HEUTE | ✅ |
| **Tailwind CSS lädt** | Alle Styles korrekt gerendert, keine FOUC | ✅ |

---

## Zusammenfassung

| Bereich | Vorher | Nachher |
|---|---|---|
| Security Headers | 1/8 ✗ | **8/8 ✅** |
| RLS-Abdeckung | 106/107 | **107/107 ✅** |
| Kritische Bugs (404, RLS) | 5 offen | **0 offen** |
| Layout-Checkliste | 6/6 ✅ | 6/6 ✅ |
| DSGVO Art. 8 Consent | ❌ fehlt | ❌ **→ R2 Priorität #1** |
| Tests | 0 | 0 → **→ R3** |

---

## Nächste Schritte

**Phase R2 — DSGVO für Minderjährige** (sofort):
1. `parental_consent`-Tabelle mit `consent_version`, `consented_at`, `revoked_at`
2. `/einwilligungen`-Seite: echte Consent-UI mit Art. 8 Text
3. Eltern-PIN aus DB (`kiosk_pins`-Tabelle existiert bereits) + KIOSK_PIN_SALT setzen
4. Art. 20 Datenexport-Endpoint
5. KJM-Altersrating in `<meta>` und robots.txt

**Phase R3 — Testing:**
6. Vitest + React Testing Library für kritische Components
7. Playwright E2E für Login, Eltern-PIN, Anwesenheit
8. Supabase RLS-Tests

**Phase R4 — TypeScript/Qualität:**
9. `ignoreBuildErrors: false` aktivieren + alle TS-Fehler beheben
10. ESLint aktivieren + Auto-Fix
11. `user-scalable=no` aus viewport entfernen
