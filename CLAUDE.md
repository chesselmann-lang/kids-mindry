# KitaHub – Anweisungen für Claude

KitaHub ist eine Plattform für Kitas (später auch Schulen, Träger, Familien): Eltern-App, Erzieher-Werkzeuge, Verwaltung.
Betreiber: Christian Hesselmann. Pilot: die vier Kitas von Katja Koch (Schatzkiste, Blumenwiese, Baumhaus, Kinderhaus), danach SaaS.

**Zuerst lesen:** `STATUS.md` (aktueller Stand, nächste Schritte). Gesamtplan: Doc „KitaHub – Fahrplan & Fundament-Audit“
(https://claude.ai/artifact/SA5zn1mLbDPVMm8fzhMMLi).

## Wo liegt was

| Was | Ort |
| --- | --- |
| Code App | GitHub `chesselmann-lang/kids-mindry`, lokal `Documents\Claude\Projects\kitahub\app` |
| Live | https://kids.mindry.de = Vercel-Projekt `kids-mindry` (Team mindry), Deploy per Vercel CLI |
| Datenbank | Supabase-Projekt `kindergarten` (ref `swrtduckugkxzrfrbgav`, EU West) |
| Websites der 4 Kitas | Repo `chesselmann-lang/katja-koch-kitas`, lokal `kitahub\websites`, Vercel `katja-koch-kitas`, Supabase `katja-koch-kitas`, Sanity `ebuntiof` |
| Sicherungen | `OneDrive\Backups\kita-projekte-2026-11-19` (DB-Dumps, Sanity-Export, Vercel-Stände) |
| Inventar aller Projekte | `Documents\Claude\Projects\infra\projects.yaml` |

## Stack

Next.js 16 (App Router, Turbopack, `src/proxy.ts` statt Middleware) · React 19 · TypeScript · Tailwind · Supabase (Auth, Postgres mit RLS, Storage, Realtime, Edge Functions) ·
Claude API über `src/lib/anthropic.ts` · Stripe · DeepL · Web-Push · Sentry · Playwright (`e2e/`).
Installation: `npm install --legacy-peer-deps`. Lokal `NODE_ENV` nicht auf `production` lassen (sonst fehlen Dev-Pakete).

## Regeln (nicht verhandelbar)

1. **Kinderdaten zuerst.** Jede Tabelle mit RLS, jede Richtlinie auf Einrichtung (`site_id`) und Rolle beschränkt. Nie `using (true)` für Nutzerdaten.
2. **Datenbank nur per Migration** (`supabase/migrations/`, Name `NNN_beschreibung.sql`) – nie Änderungen von Hand im Dashboard.
   Nach jeder Migration Supabase-Sicherheitsberater (`get_advisors`) prüfen.
3. **Vor dem Löschen sichern.** Keine Tabelle, kein Bucket, kein Projekt ohne vorherigen Export entfernen.
4. **Keine Geheimnisse ins Repo** (das Repo ist zurzeit öffentlich). `.env*` bleibt draußen, nur `.env.example`.
5. **SECURITY-DEFINER-Funktionen:** immer `set search_path = public`, Ausführrecht für `anon` entziehen, Rolle im Funktionskörper prüfen.
6. **KI mit Kinderdaten:** nur serverseitig, pro Einrichtung abschaltbar, keine Speicherung bei Anbietern; AVV muss vorliegen.
7. **Jeder Chat endet mit einem Update von `STATUS.md`** (erledigt, offen, nächste Schritte) und einem Commit.

## Begriffe im Code

Doku (alt, `docs/archiv/KONZEPT_1.md`) nennt deutsche Tabellennamen (`kinder`, `anwesenheit`, `einrichtungen`);
die Datenbank nutzt englische: `children`, `attendance`, `sites`, `groups`, `profiles`, `guardians`. Maßgeblich ist die Datenbank.

## Commits

Deutsche, kurze Commit-Nachrichten im Stil `feat: …`, `fix: …`, `chore: …`, `docs: …`.
