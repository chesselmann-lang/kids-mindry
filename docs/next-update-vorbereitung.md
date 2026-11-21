# Next.js-Update – Vorbereitung (Stand 20.11.2026)

Ziel: Next.js 14 → 15 (danach 16). Dieses Dokument hält fest, was vorbereitet ist und was beim Update selbst zu tun bleibt.

## Ausgangslage nach der Vorbereitung

| Punkt | Stand |
| --- | --- |
| Next.js | 16.4.6 seit 21.11.2026 (Phase 0b) – Abschnitt „Was beim Update anfällt“ ist erledigt |
| React | 18.3 – Next 15 braucht React 19 |
| `@supabase/ssr` | 0.12.7 (vorher 0.6.1 – Ursache vieler `never`-Typfehler) |
| Datenbank-Typen | `src/types/database.ts` frisch aus dem Live-Schema erzeugt |
| Konfiguration | nur noch `next.config.mjs` (doppelte `next.config.ts` entfernt, Inhalte übernommen) |
| Typprüfung | 257 Fehler in 47 Dateien (vorher 809 in 79, davor durch Syntaxfehler verdeckt) |
| Build | läuft; `ignoreBuildErrors` / `ignoreDuringBuilds` noch aktiv |
| npm audit | 35 Lücken (vorher 54); Rest nur mit Major-Updates lösbar: `next` 16, `@sentry/nextjs` 11, `eslint-config-next` 16 |
| Lockfile | synchron mit `package.json` |

## Was beim Update auf Next 15 anfällt

1. **Codemod:** `npx @next/codemod@canary upgrade latest` – stellt `params`, `searchParams`, `cookies()`, `headers()` auf async um.
   - 31 Seiten/Routen mit `params`, 19 Seiten mit `searchParams`
   - 12 Stellen `cookies()` ohne `await`
2. **React 19:** `react`, `react-dom`, `@types/react`, `@types/react-dom` mit anheben; Bibliotheken mit React-18-Peer prüfen (`npm install --legacy-peer-deps` wird aktuell gebraucht).
3. **Caching-Default:** In Next 15 werden `fetch`-Aufrufe und GET-Route-Handler nicht mehr automatisch gecacht.
   241 `fetch`-Aufrufe und 95 GET-Route-Handler – meist gewollt dynamisch, aber stichprobenartig prüfen.
4. **Sentry:** `@sentry/nextjs` 8 → aktuelle Version (Breaking, eigene Migrationsanleitung).
5. **ESLint:** `eslint-config-next` passend zur Next-Version; ggf. Flat-Config.
6. **Danach:** `ignoreBuildErrors` entfernen, sobald die Typfehler bereinigt sind.

## Restliche Typfehler (257)

Größtenteils echte Fehler im Code, nicht nur Typen:

### Code fragt Tabellen ab, die es nicht gibt (Funktion liefert still nichts)

| Tabelle im Code | Wo (Beispiel) | Vermutlich gemeint |
| --- | --- | --- |
| `weekly_reports` (6×) | `admin/wochenberichte/page.tsx` | fehlt – Tabelle anlegen oder Funktion entfernen |
| `absence_requests` (3×) | `admin/statistiken/page.tsx` | `sick_reports` / `leave_requests` |
| `beobachtungen` (3×), `beobachtungs_audits_summary` | `api/ai/beobachtungs-audit` | `observations` |
| `sismik_assessments` (3×) | `api/ai/foerderbedarf-radar` | `sismik_beobachtungen` |
| `calendar_events` | `api/kalender-export` | `events` / `annual_events` |
| `child_milestones` | `api/ai/kind-verlauf-analyse` | `milestones` |
| `meal_plans` | `api/ai/speiseplan-analyse` | `weekly_menus` |
| `nachrichten`, `ki_cockpit_prognosen` | `api/ai/cockpit-prognose` | `messages` / fehlt |
| `protokolle`, `tagesjournal` | `api/suche` | `protocols` / fehlt |
| `portfolio_items` | `api/ai/qualitaets-check` | `portfolio_entries` |
| `group_activities` | `api/ai/gruppen-newsletter` | fehlt |
| `uebergabe_eintraege` | `api/ai/tages-abschluss` | `group_handovers` |
| `tagesberichte` | `api/dsgvo/loeschen` (Aufbewahrungs-Bereinigung) | fehlt – Bereinigung wirkt dort nicht |

### Weitere Fehlerarten
- Spalten, die es in der Tabelle nicht gibt (z. B. `pickup_persons` in `abholberechtigte/…/pickup-manager.tsx`)
- `null` wird an Stellen übergeben, die `string` erwarten
- E2E-Tests (`e2e/*.spec.ts`, ca. 50 Fehler) mit fehlenden Typen für Parameter

Liste neu erzeugen: `npx tsc --noEmit -p . | grep "error TS"`.

## Speicher (Storage)

Alle drei Buckets (`portfolio`, `media`, `kita-docs`) sind privat. Die App lädt Dateien nur noch über
`/api/storage/<bucket>?path=…` (signierte URLs, Zugriff entscheiden die Storage-Richtlinien).
Hilfsfunktion: `storageFileUrl()` in `src/lib/portfolio-url.ts`. `getPublicUrl` wird nirgends mehr verwendet.
