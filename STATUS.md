# KitaHub – Stand

**Aktualisiert:** 20.11.2026 · **Aktuelle Phase:** 0 – Fundament (noch nicht begonnen)

## Entscheidungen (20.11.2026)

- Zielgruppe: erst Pilot mit Katja Kochs 4 Kitas, danach SaaS für andere Kitas und Träger.
- Form: jetzt Web-App (PWA), App-Store-Apps (Expo) später.
- Ausbau: Kita-Websites, Träger-Verwaltung, Familie 360°, Lernen & Kinder-Inhalte, Schul-App.
- Reihenfolge: erst Fundament, dann Features.

## Phasen

| Phase | Inhalt | Stand |
| --- | --- | --- |
| 0 | Fundament: Sicherheit, Updates, Tests, Datenschutz | offen |
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
- [ ] `anonymize_child_data` ist für `anon` ausführbar und prüft keine Rolle → Recht entziehen, nur serverseitig
- [ ] Storage-Bucket `portfolio` ist öffentlich → privat + signierte URLs
- [ ] `portfolio_entries` / `portfolio_photos`: Richtlinie `true` für alle Angemeldeten → auf Einrichtung/Rolle/eigenes Kind
- [ ] `kiosk_pins`: alle Angemeldeten dürfen alles → nur Personal der Einrichtung
- [ ] Next.js 14.2.29 hat kritische Lücke → Update auf 15/16

Hoch:
- [ ] `log_parental_action` / `audit_logs`: Täter-ID fälschbar → `auth.uid()`, Insert nur serverseitig
- [ ] 8 SECURITY-DEFINER-Funktionen für anon ausführbar, 14 ohne festen `search_path`
- [ ] `screen_time_log`: Update/Insert für alle
- [ ] 43 weitere Schwachstellen in Abhängigkeiten (`npm audit`)

Mittel:
- [ ] Schutz vor geleakten Passwörtern in Supabase Auth einschalten
- [ ] TypeScript-Fehler in `src/app/(dashboard)/admin/ernaehrung/page.tsx:135`
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
- Next.js-Ziel: 15 oder direkt 16?

## Verlauf

- 19.11.2026: Vollständige Sicherung aller Kita-Daten; Live-Stand (Vercel 06.05.2026) erstmals auf GitHub gesichert.
- 20.11.2026: Fundament-Audit, Fahrplan, Projektordner `kitahub` angelegt.
- 21.04.–06.05.2026: Phasen R1–R4 (Layout, DSGVO, Chat-Übersetzung, Jugendschutz-Filter) – siehe `docs/quality-reports/`.
