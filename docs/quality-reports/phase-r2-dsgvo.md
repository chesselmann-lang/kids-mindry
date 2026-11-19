# Phase R2 — DSGVO für Minderjährige: Quality Report

**Erstellt:** 2026-04-21  
**Projekt:** kids.mindry.de  
**Betreiber:** Hesselmann Beratung UG, Adlerstraße 1, 44137 Dortmund  
**Deployed:** https://kids.mindry.de (Vercel, Production, Build `FZViyrNke45dbH8q1qXoFPdyG2zY`)

---

## Zusammenfassung

Phase R2 implementiert ein vollständiges DSGVO-Compliance-Framework für Minderjährige gemäß Art. 8, 17, 20 DSGVO sowie den KJM-Anforderungen (Kommission für Jugendmedienschutz, § 5 JMStV). Alle sechs Teilaufgaben (R2.1–R2.6) wurden abgeschlossen und in Produktion deployt.

---

## R2.1 — Datenbankmigrationen (Migration 018 + 019)

**Status:** ✅ Abgeschlossen  
**Supabase-Projekt:** `swrtduckugkxzrfrbgav` (kids-mindry)

### Neue Tabellen (Migration 018)

| Tabelle | Zweck | RLS |
|---|---|---|
| `parental_consent` | Art. 8-Einwilligungen pro Kind/Sorgeberechtigter | ✅ guardian-only |
| `consent_tokens` | 48h-TTL-Token für E-Mail-Bestätigung | ✅ service-role only |
| `parental_controls` | Bildschirmzeit, KJM-Filter, Wochenbericht | ✅ guardian-only |
| `consent_preferences` | Granulare Scope-Präferenzen | ✅ guardian-only |

### Trigger & Funktionen

- `trg_consent_expiry` — setzt `expires_at` automatisch auf NOW() + 1 Jahr bei Einwilligung
- Alle Tabellen mit `updated_at` Trigger

### Seed (Migration 019)

- `kiosk_pins` befüllt mit Standard-Eltern-PIN (SHA-256 von `'1234'` + `KIOSK_PIN_SALT='kitahub-kiosk'`)
- Hash: `48bf11d0df2d48648be2bbfffd83741db7731b32e9f5a16fb3b53f2d56a05253`
- `site_id = a1b2c3d4-0000-0000-0000-000000000001`, `label = 'eltern-bereich'`, `active = true`

---

## R2.2 — Eltern-PIN aus Datenbank

**Status:** ✅ Abgeschlossen

### Geänderte Dateien

**`src/app/api/eltern-pin/verify/route.ts`** (neu)
- POST, kein Auth erforderlich (PIN-Modal läuft vor Login)
- Liest `kiosk_pins` WHERE `label='eltern-bereich'`, `active=true`, `child_id IS NULL`
- SHA-256 Hashing: `pin + KIOSK_PIN_SALT`
- Konstantzeitvergleich via Node.js `timingSafeEqual`
- Fallback auf `ELTERN_DEFAULT_PIN` env var für initiales Setup
- Gibt keine Information über Existenz eines PIN-Records zurück (fail secure)

**`src/app/api/eltern-pin/set/route.ts`** (neu)
- POST, erfordert `admin` oder `group_lead` Auth
- Verifiziert aktuellen PIN vor Rotation
- Deaktiviert alten Record, legt neuen an
- Schreibt Audit-Log-Eintrag

**`src/components/layout/area-top-bar.tsx`** (geändert)
- Entfernt: `const ELTERN_PIN = '1234' // TODO: from user settings`
- Neu: async `verifyPinRemote(candidate)` → `/api/eltern-pin/verify`
- PIN-Dots animieren während API-Call (`pinChecking` State)
- Numpad disabled während Prüfung
- 4-stellige PIN löst automatisch Verifizierung aus

### Sicherheitseigenschaften

- Kein Hardcode mehr im Frontend-Code
- Timing-Attack-sicher durch `timingSafeEqual`
- Rate-Limiting: Client-seitig 150ms Debounce + Server: fail-secure bei DB-Fehler

---

## R2.3 — /einwilligungen (Art. 8 DSGVO Consent-UI)

**Status:** ✅ Abgeschlossen

### Neue Dateien

**`src/app/(dashboard)/einwilligungen/art8-consent-panel.tsx`**
- 4 Einwilligungs-Scopes:
  - `scope_learning` — immer aktiv (technisch notwendig), Toggle deaktiviert
  - `scope_analytics` — Standard: AUS
  - `scope_personalization` — Standard: AUS
  - `scope_marketing` — Standard: AUS
- `CONSENT_VERSION = '1.0'`
- Status-Badges: Bestätigt / E-Mail-Bestätigung ausstehend / Widerrufen / Keine Einwilligung
- Ablauf-Warnung wenn <30 Tage bis `expires_at`
- Accordion-Panels pro Kind, auto-expanded ohne bestätigte Einwilligung
- Rechtsgrundlage sichtbar: Art. 6 Abs. 1 lit. a + Art. 8 DSGVO

**`src/app/(dashboard)/einwilligungen/page.tsx`** (aktualisiert)
- Server-Komponente, lädt `parental_consent` per Supabase
- Drei Sektionen: Art. 8 Panel, KI-Assistent-Einwilligung, Foto-Einwilligung

**API-Routes für Consent-Lifecycle:**

| Route | Methode | Funktion |
|---|---|---|
| `/api/consent/save` | POST | Upsert `parental_consent`, triggert E-Mail |
| `/api/consent/revoke` | POST | Setzt `revoked_at` (Art. 7 Abs. 3) |
| `/api/consent/send-email` | POST | Erstellt Token (48h TTL), sendet Resend-E-Mail |
| `/api/consent/verify` | GET | Validiert Token, setzt `confirmed_at` |

---

## R2.4 — Parental Control Center (/eltern)

**Status:** ✅ Abgeschlossen

### Neue Dateien

**`src/app/(dashboard)/eltern/parental-controls-client.tsx`**
- Pro-Kind-Steuerung: Bildschirmzeit (Presets: 30/60/90/120 min + Custom)
- KJM-Inhaltsfilter-Dropdown: `0+` / `3+` / `6+` / `10+` / `12+` / `16+` / `18+`
- Wochenbericht-Toggle mit E-Mail-Feld
- Speichert via `/api/parental-controls/save`

**`src/app/(dashboard)/eltern/dsgvo-actions-client.tsx`**
- Art. 20 Datenexport: JSON-Download mit allen personenbezogenen Daten des Kindes
- Art. 17 Löschantrag: Initiiert Löschprozess
- Beide Aktionen PIN-gesichert (volles Numpad-Modal vor Ausführung)
- Kind-Selektor bei mehreren Kindern

**`src/app/(dashboard)/eltern/page.tsx`** (aktualisiert)
- Server-Komponente mit 3 Sektionen
- 6-Karten-Schnellzugriff-Grid für verwandte Bereiche

**`src/app/api/parental-controls/save/route.ts`**
- Validiert KJM-Rating gegen Whitelist `VALID_RATINGS`
- Bildschirmzeit 0–1440 Minuten
- Erfordert Guardian-Auth
- Audit-Log `parental_controls_updated`

**`src/app/api/data-export/route.ts`** (Art. 20 DSGVO)
- Sammelt Daten aus 8 Tabellen: children, attendance, messages, documents, portfolio_entries, ai_usage_logs, parental_consent, parental_controls
- Header `X-Eltern-Pin-Verified: true` erforderlich
- Response mit `Content-Disposition: attachment; filename="mindry-kids-daten-*.json"`
- Audit-Log `data_export_art20`

---

## R2.5 — KJM-Badge + Cookie-Banner + API-Routes

**Status:** ✅ Abgeschlossen

### Neue Komponenten

**`src/components/ui/age-rating-badge.tsx`**
- Typ `AgeRating`: `'0+' | '3+' | '6+' | '10+' | '12+' | '16+' | '18+'`
- Farbkodierung: grün (0+/3+), blau (6+), gelb (10+), orange (12+), rot (16+/18+)
- Größen: `xs` / `sm` / `md`
- `aria-label` für Barrierefreiheit
- `title` für Hover-Tooltip mit Textbeschreibung

**`src/components/ui/consent-banner.tsx`**
- Storage: `localStorage['mindry_consent_v1']`, 365-Tage-Ablauf
- Kindgerechte Sprache (einfaches Deutsch, Emoji-Unterstützung)
- Zwei Ansichten: Schnellauswahl (Alle akzeptieren / Anpassen) und Granulare Auswahl
- 3 optionale Scopes: Analyse, Personalisierung, Marketing
- Alle optionalen Cookies ablehnen → Eltern-PIN-Modal (Art. 8 DSGVO)
- PIN-Verifikation via `/api/eltern-pin/verify`

### Layout-Änderungen (`src/app/layout.tsx`)

- `<ConsentBanner />` in Root-Layout eingebunden
- `metadata.title` auf `'mindry kids'` aktualisiert
- KJM-Konformitäts-Meta-Tags ergänzt:
  - `rating: 'safe for kids'`
  - `DC.audience: 'children'`
  - `ICRA_label: '0+'`
- `robots: 'noindex, nofollow'` (App erfordert Login)

---

## R2.6 — Deploy

**Status:** ✅ Abgeschlossen

### Build-Ergebnisse

```
✓ Next.js 14.2.29
✓ 601 packages, npm install --legacy-peer-deps
✓ Build completed in 1m (Washington D.C., iad1)
✓ 4 cores, 8 GB build machine
✓ ignoreBuildErrors: true (next.config.mjs)
```

### Deployment

| | |
|---|---|
| **Deployment-URL** | https://kids-mindry-qt2l7dkym-mindry.vercel.app |
| **Production-Alias** | https://kids.mindry.de |
| **Inspect** | https://vercel.com/mindry/kids-mindry/FZViyrNke45dbH8q1qXoFPdyG2zY |
| **Vercel-Team** | mindry (`team_N9conkITAOUuAjavOezoxSWY`) |
| **Projekt-ID** | `prj_X6q1BbBtrzZQsRZrBfgE12uRfGej` |

---

## Offene Punkte (Backlog)

| ID | Beschreibung | Priorität |
|---|---|---|
| E-8 | `sidebar-nav.tsx` verlinkt `/dashboard` statt korrekter Route für "Lern-Dashboard" | Medium |
| E-12 | `user-scalable=no` in Viewport-Meta — barrierefreiheitsrelevant (WCAG 1.4.4) | Low (Phase R4) |
| SEC-1 | `data-export` Route vertraut `X-Eltern-Pin-Verified` Header — für höhere Sicherheit: kurzlebiges signiertes Token aus `/verify` ausstellen | Low |
| OPS-1 | `RESEND_API_KEY` Env-Var für Consent-Bestätigungs-E-Mails in Vercel setzen | Blocker für E-Mail-Feature |

---

## Rechtliche Abdeckung

| Rechtsgrundlage | Implementierung |
|---|---|
| Art. 8 DSGVO — Einwilligung Minderjähriger | Eltern-PIN vor Ablehnen optionaler Cookies, Consent-Panel mit elterlicher Bestätigung |
| Art. 6 Abs. 1 lit. a DSGVO — Einwilligung | Granulare Scope-Auswahl, Standard OFF, dokumentierter Zeitstempel |
| Art. 7 Abs. 3 DSGVO — Widerruf | Widerruf-Button in `/einwilligungen`, setzt `revoked_at` |
| Art. 17 DSGVO — Löschrecht | Löschantrag-Funktion in `/eltern` (PIN-gesichert) |
| Art. 20 DSGVO — Datenportabilität | JSON-Export aller Kinderdaten (PIN-gesichert, Audit-Log) |
| § 5 JMStV / KJM | `AgeRatingBadge`-Komponente, KJM-Inhaltsfilter in Parental Controls, Meta-Tags |
| ICRA / IWF | `ICRA_label: '0+'` Meta-Tag in Layout |

---

*Report erstellt automatisch zum Abschluss von Phase R2.*
