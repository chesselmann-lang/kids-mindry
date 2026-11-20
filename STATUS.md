# KitaHub – Stand

**Aktualisiert:** 20.11.2026 · **Aktuelle Phase:** 0 – Fundament (0a erledigt, 0b auf Branch `chore/phase-0b-next-update`, noch nicht live)

## Entscheidungen (20.11.2026)

- Zielgruppe: erst Pilot mit Katja Kochs 4 Kitas, danach SaaS für andere Kitas und Träger.
- Form: jetzt Web-App (PWA), App-Store-Apps (Expo) später.
- Ausbau: Kita-Websites, Träger-Verwaltung, Familie 360°, Lernen & Kinder-Inhalte, Schul-App.
- Reihenfolge: erst Fundament, dann Features.

## Nächste Schritte

1. Branch `chore/phase-0b-next-update` als Vorschau deployen und mit echtem Login durchklicken (Login, Chat inkl. Übersetzung, Portfolio-Foto, Dokumente, Stripe-Checkout), danach in `main` mergen und live deployen. Vercel-Projekt braucht Node ≥ 20.9.
2. DSGVO-Löschung/-Export und die übrigen Zugriffe auf fehlende Tabellen klären (siehe Typfehler unten).

## Phasen

| Phase | Inhalt | Stand |
| --- | --- | --- |
| 0 | Fundament: Sicherheit, Updates, Tests, Datenschutz | in Arbeit (0a erledigt, 0b gebaut – Merge/Deploy offen) |
| 1 | Pilot-Reife: 4 Kitas, Rollen, AVVs, Kernfunktionen | offen |
| 2 | Pilot Schatzkiste (4–6 Wochen) | offen |
| 3 | Kita-Websites mit App verbinden | offen |
| 4 | Träger-Verwaltung | offen |
| 5 | Lernen & Kinder-Inhalte | offen |
| 6 | Schul-App | offen |
| 7 | Familie 360° | offen |
| 8 | Store-Apps & SaaS | offen |

## Phase 0 – offene Punkte (Audit vom 20.11.2026)

Kritisch:
- [x] NEU gefunden: Rechteausweitung – Nutzer konnten eigene `role`/`site_id` ändern und sich bei Registrierung als admin anlegen → Trigger `protect_profile_privileges`, `handle_new_user` übernimmt Rolle/Einrichtung/Kind nur bei Einladungen (022)
- [x] Rekursion in profiles-Richtlinie behoben (jede Profilabfrage brach mit 42P17 ab), Profile nur noch für Personal der eigenen Einrichtung sichtbar (023)
- [x] `anonymize_child_data`: nur noch service_role, Admin-Prüfung im Funktionskörper (Migration 019)
- [x] Bucket `portfolio` privat, Richtlinien nach Einrichtung/Eltern-Freigabe/Gesprächsteilnehmer (021); App lädt über `/api/storage/portfolio` (signierte URLs)
- [x] `portfolio_entries` / `portfolio_photos`: `true`-Richtlinien entfernt (020)
- [x] `kiosk_pins`: Lesen Personal der Einrichtung, Verwalten Admin/Gruppenleitung (020)
- [x] Next.js 14.2.29 → 16.4.6, React 19 (Branch `chore/phase-0b-next-update`, Build grün) – **noch mergen und deployen**

Hoch:
- [x] `log_parental_action` nutzt `auth.uid()`, nur service_role; `audit_log(s)`: Insert nur mit eigener ID, Lesen nur Admin der Einrichtung (019/020)
- [x] Alle 14 Funktionen mit `search_path = public`, anon-Rechte entzogen (019). Rest-Warnung: is_admin/is_staff/my_role/my_site_id/get_unread_conversation_count für `authenticated` – gewollt (RLS bzw. nur eigener Nutzer)
- [x] `screen_time_log`: Insert/Update nur serverseitig (020)
- [x] Abhängigkeiten aktualisiert: `npm audit` von 54 auf 0 Schwachstellen (Branch 0b)

Mittel:
- [ ] Bucket `kita-docs`: Lesen/Hochladen/Löschen für alle Angemeldeten → auf Einrichtung beschränken
- [x] App-Änderungen aus 0a live (Vercel-Deploy aus GitHub `ca1a108`, 20.11.2026); Startseite/Login antworten normal
- [ ] Portfolio-Foto-Upload und Chat-Bild mit echtem Login testen
- [x] `package-lock.json` neu erzeugt und passend zu `package.json` (Branch 0b)
- [ ] Schutz vor geleakten Passwörtern in Supabase Auth einschalten
- [x] TypeScript-Fehler in `src/app/(dashboard)/admin/ernaehrung/page.tsx:135` (Syntax `>` in JSX)
- [ ] 186 weitere Typfehler – waren hinter dem Syntaxfehler und `ignoreBuildErrors` versteckt (anfangs 872). Build ignoriert sie weiterhin (`next.config.mjs`). Hauptursache: Code fragt Tabellen ab, die es in `kindergarten` nicht gibt: `weekly_reports`, `absence_requests`, `sismik_assessments`, `beobachtungen`, `calendar_events`, `child_milestones`, `group_activities`, `meal_plans`, `portfolio_items`, `protokolle`, `tagesjournal`, `tagesberichte`, `uebergabe_eintraege`, `nachrichten`, `ki_cockpit_prognosen`, `beobachtungs_audits_summary`. **Dringend:** `api/dsgvo/loeschen` und `api/dsgvo-kind-export` greifen auf fehlende Tabellen zu → DSGVO-Löschung/-Export prüfen. Danach `ignoreBuildErrors: false`.
- [ ] ESLint war nie eingerichtet; jetzt `eslint.config.mjs` (Next 16), `npm run lint` meldet 1.915 Fehler – schrittweise abbauen
- [ ] Sentry im Browser ist inaktiv (`sentry.client.config.ts` wird ohne `withSentryConfig` nie geladen) → nach `instrumentation-client.ts` umziehen
- [ ] `admin/ernaehrung`: fest eingebauter Demo-Hinweis („HACCP-Unterweisung Fr. Meier dringend!“) durch echte Daten ersetzen
- [ ] Tests für Rechte (RLS) und DSGVO ergänzen (bisher 6 E2E-Tests)
- [ ] 144 KI-Routen bündeln, Modell je Aufgabe wählen
- [ ] Repos `kids-mindry` und `katja-koch-kitas` auf privat stellen
- [ ] Doku an echtes Schema angleichen

## Aufräumen (offen)

- [ ] Vercel-Projekt `kids-mindry-deploy` löschen (Duplikat, gesichert) – nur im Dashboard möglich
- [ ] Leere Chat-Tabellen im Supabase-Projekt `katja-koch-kitas` entfernen (Migration vorbereitet, Bestätigung ausstehend)
- [ ] mittwald-Installation „kids“ prüfen (Verbindung war am 19./20.11. gestört)

## Offene Fragen

- Darf Christian als Softwareanbieter für Katjas Kitas auftreten? (rechtliche Vorgabe: er tritt dort nicht als Beteiligter auf)
- Name und Domain: bleibt es „KitaHub“ auf kids.mindry.de, auch für die Schul-App?

## Verlauf

- 20.11.2026: Phase 0b auf Branch `chore/phase-0b-next-update`: Next.js 16.4.6 (Turbopack), React 19, Sentry 11, @supabase/ssr 0.12, supabase-js 2.119, lucide-react 1.x, Anthropic SDK 1.12, ESLint 9; Stripe bleibt auf 22.0.x (API-Version `2026-03-25.dahlia` unverändert). `middleware.ts` → `proxy.ts`, Request-APIs async (Codemod, 54 Dateien), doppelte `next.config.ts` entfernt (maßgeblich war immer `.mjs`), Supabase-Typen neu erzeugt (16 Tabellen fehlten), tsconfig: Ziel ES2017, Edge Functions ausgenommen. Nebenbei behoben: Übersetzungs-Route rief `anthropic()` auf (Laufzeitfehler), Icon `Chrome` gibt es in lucide 1.x nicht mehr (Dokumente-Seite wäre abgestürzt). Build grün, `npm audit` 0, lokaler Start: Login 200, Weiterleitung und Sicherheits-Header ok.
- 20.11.2026: Phase 0a – Migrationen 019–023 auf `kindergarten` angewendet (Funktionen, RLS, Bucket portfolio privat, Rechteausweitung geschlossen); Sicherheitsberater ohne kritische Funde; App-Code live deployt (aus GitHub, Vercel-Projekt hat keine Git-Anbindung).

- 19.11.2026: Vollständige Sicherung aller Kita-Daten; Live-Stand (Vercel 06.05.2026) erstmals auf GitHub gesichert.
- 20.11.2026: Fundament-Audit, Fahrplan, Projektordner `kitahub` angelegt.
- 21.04.–06.05.2026: Phasen R1–R4 (Layout, DSGVO, Chat-Übersetzung, Jugendschutz-Filter) – siehe `docs/quality-reports/`.
