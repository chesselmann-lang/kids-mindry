# KONZEPT 1 — KitaHub AI Platform: Vollständige Anforderungen R88–R93

> **Projektname:** kids.mindry.de / KitaHub  
> **Stack:** Next.js 14 · Supabase · Anthropic Claude Haiku · Vercel  
> **Zeitrahmen:** Konzept erstellt 2026-04-17  
> **Scope:** Konzept 1 definiert die Ausbaustufe, die das MVP (R1–R87) zur voll produktiven KI-Plattform für Kindertagesstätten erweitert.

---

## Überblick

KitaHub ist eine vollständige Verwaltungs- und KI-Plattform für Kindertagesstätten. Die Rounds R1–R87 haben das Fundament gelegt:
- Vollständige Authentifizierung (Admin, Erzieher, Eltern)
- Kind-Verwaltung, Gruppen, Anwesenheitslisten
- Tagesjournal, Beobachtungen, Entwicklungsberichte
- KI-Assistent (Claude Haiku) für alle Rollen
- DSGVO-Export, Notifications (Push), Sentry-Monitoring

**Konzept 1** schließt die kritischen Lücken für den Echtbetrieb:

| Round | Feature | Priorität |
|-------|---------|-----------|
| R88 | Echtzeit-Anwesenheit (Supabase Realtime) | KRITISCH |
| R89 | KI-Tages-Cockpit (Admin Live-Dashboard) | HOCH |
| R90 | Eltern-Direktnachrichten + KI-Antwort-Assist | HOCH |
| R91 | Foto-Galerie mit Upload + Consent-Guard | MITTEL |
| R92 | Globale Volltext-Suche | MITTEL |
| R93 | KI-Qualitätssicherung (Beobachtungs-Audit) | HOCH |

---

## R88: Echtzeit-Anwesenheit mit Supabase Realtime

### Ziel
Die Anwesenheitsliste aktualisiert sich live — ohne Seitenreload. Wenn ein Kind ein- oder auscheckt, sehen alle verbundenen Geräte die Änderung sofort.

### Technische Anforderungen

**Supabase Realtime Kanal:**
```
channel: anwesenheit-live
table: anwesenheit (INSERT, UPDATE, DELETE)
filter: datum=eq.TODAY
```

**Neues Datenbankfeld:**
```sql
ALTER TABLE anwesenheit ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE anwesenheit ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;
```

**Neue Seite:** `/admin/anwesenheit/live`
- Realtime-Hook `useAnwesenheitRealtime(date)` 
- Optimistische UI-Updates (sofort bei eigenem Check-in, Bestätigung via Realtime)
- Live-Badge: grüne Pulsanimation für anwesende Kinder
- Statistikleiste: Anwesend X / Abwesend Y / Gesamt Z (live)
- Sound-Feedback optional (kurzer Ton bei Check-in)

**API-Route:** `PUT /api/anwesenheit/[id]/checkout` (für Checkout-Timestamp)

**Berechtigungen:** Admin + Erzieher können Check-in/out steuern; Eltern sehen read-only Live-Status ihres Kindes

### Datenbankänderungen
- Realtime für Tabelle `anwesenheit` aktivieren (via Supabase Dashboard oder Migration)
- RLS: Erzieher sehen alle Kinder ihrer Einrichtung; Eltern nur ihr eigenes Kind

---

## R89: KI-Tages-Cockpit

### Ziel
Ein Admin-Dashboard das täglich um 07:00 Uhr eine KI-generierte Tagesprognose erstellt und während des Tages live KPIs anzeigt.

### Seite: `/admin/cockpit`

**Linke Spalte — Live KPIs:**
- Anwesenheitsquote heute (live via Realtime)
- Neue Nachrichten ungelesen
- Offene Beobachtungen ohne Feedback
- Eltern-Reaktionsrate (letzte 7 Tage)

**Rechte Spalte — KI-Tagesprognose:**
- Claude Haiku analysiert: gestrige Anwesenheitsdaten, offene Todos, Geburtstage heute, letzte Beobachtungen
- Gibt strukturierte Prognose aus: Erwartete Besonderheiten, Handlungsempfehlungen, Risiken
- Automatische Regenerierung um 07:00 täglich (Cron oder On-Demand bei erstem Seitenaufruf)
- Persistenz: Tagesprognose wird in `ki_cockpit_prognosen` Tabelle gespeichert

**Neue DB-Tabelle:**
```sql
CREATE TABLE ki_cockpit_prognosen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einrichtung_id UUID REFERENCES einrichtungen(id),
  datum DATE NOT NULL,
  prognose_text TEXT NOT NULL,
  kpis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(einrichtung_id, datum)
);
```

**API-Routen:**
- `GET /api/ai/cockpit-prognose` — gibt Tagesprognose zurück (erstellt wenn nicht vorhanden)
- `POST /api/ai/cockpit-prognose/regenerate` — erzwingt Neuberechnung

---

## R90: Eltern-Direktnachrichten mit KI-Antwort-Assist

### Ziel
Erzieher können Eltern direkt anschreiben. KI schlägt Antwort-Entwürfe vor. Echtzeit via Supabase Realtime.

### Datenmodell

**Neue Tabellen:**
```sql
CREATE TABLE direktnachrichten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einrichtung_id UUID REFERENCES einrichtungen(id),
  thread_id UUID NOT NULL, -- Gruppiert Konversation
  sender_id UUID REFERENCES auth.users(id),
  empfaenger_id UUID REFERENCES auth.users(id),
  kind_id UUID REFERENCES kinder(id), -- Bezugskind
  text TEXT NOT NULL,
  gelesen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE direktnachrichten_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einrichtung_id UUID REFERENCES einrichtungen(id),
  kind_id UUID REFERENCES kinder(id),
  eltern_id UUID REFERENCES auth.users(id),
  erzieher_id UUID REFERENCES auth.users(id),
  betreff TEXT,
  letzte_nachricht_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Seiten

**Erzieher-Ansicht:** `/erzieher/nachrichten`
- Thread-Liste mit Badges für ungelesene Nachrichten
- Chat-Interface für einzelnen Thread
- KI-Antwort-Assist: "KI-Entwurf" Button → Claude generiert passende Antwort basierend auf Thread-Kontext
- Realtime: neue Nachrichten erscheinen sofort

**Eltern-Ansicht:** `/eltern/nachrichten`
- Vereinfachte Thread-Ansicht
- Kann antworten, aber kein KI-Assist (nur Erzieher)
- Lesestatus wird automatisch gesetzt

**API-Routen:**
- `GET /api/nachrichten/threads` — alle Threads für eingeloggten User
- `POST /api/nachrichten/threads` — neuen Thread starten
- `GET /api/nachrichten/threads/[id]` — Nachrichten eines Threads
- `POST /api/nachrichten/threads/[id]` — Nachricht senden
- `POST /api/ai/nachrichten-antwort` — KI-Antwort-Entwurf generieren

---

## R91: Foto-Galerie mit Upload + Consent-Guard

### Ziel
Erzieher können Fotos vom Kita-Alltag hochladen. Nur Kinder, deren Eltern der Fotofreigabe zugestimmt haben, erscheinen in den Fotos (Consent-Guard).

### Datenmodell

**Neues Feld in `kinder`:**
```sql
ALTER TABLE kinder ADD COLUMN IF NOT EXISTS foto_freigabe BOOLEAN DEFAULT FALSE;
ALTER TABLE kinder ADD COLUMN IF NOT EXISTS foto_freigabe_datum DATE;
```

**Neue Tabelle:**
```sql
CREATE TABLE galerie_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einrichtung_id UUID REFERENCES einrichtungen(id),
  uploader_id UUID REFERENCES auth.users(id),
  storage_path TEXT NOT NULL, -- Supabase Storage path
  beschreibung TEXT,
  datum DATE DEFAULT CURRENT_DATE,
  kinder_ids UUID[], -- referenzierte Kinder im Foto
  ki_beschreibung TEXT, -- KI-generierte Bildbeschreibung
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Supabase Storage Bucket:** `galerie` (private, RLS-geschützt)

### Features

**Upload-Flow:**
1. Erzieher wählt Foto aus
2. System prüft: Welche Kinder hat der Erzieher markiert?
3. Consent-Guard: Kinder ohne `foto_freigabe = TRUE` werden in der Vorschau geschwärzt
4. KI-Beschreibung wird generiert (claude-haiku-4-5, vision)
5. Foto wird in Supabase Storage hochgeladen
6. Metadaten in `galerie_fotos` gespeichert

**Galerie-Ansicht:**
- `/admin/galerie` — alle Fotos der Einrichtung (Admin)
- `/erzieher/galerie` — Fotos eigener Gruppen
- Filterbar: nach Datum, Gruppe, Kind
- Eltern sehen nur Fotos, auf denen ihr Kind markiert ist UND Freigabe erteilt haben

**API-Routen:**
- `POST /api/galerie/upload` — Foto hochladen + KI-Analyse
- `GET /api/galerie` — Fotos abrufen (gefiltert nach Rolle)
- `DELETE /api/galerie/[id]` — Foto löschen (Admin only)
- `POST /api/ai/foto-beschreibung` — KI-Beschreibung regenerieren

---

## R92: Globale Volltext-Suche

### Ziel
Admin und Erzieher können die gesamte Kita-Datenbank durchsuchen: Kinder, Beobachtungen, Journaleinträge, Nachrichten.

### Technische Umsetzung

**Supabase Full-Text Search** mit `tsvector` und `tsquery`:

```sql
-- Kinder
ALTER TABLE kinder ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('german', coalesce(vorname, '') || ' ' || coalesce(nachname, '') || ' ' || coalesce(notizen, ''))
  ) STORED;
CREATE INDEX kinder_search_idx ON kinder USING GIN(search_vector);

-- Beobachtungen
ALTER TABLE beobachtungen ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('german', coalesce(text, '') || ' ' || coalesce(entwicklungsbereich, ''))
  ) STORED;
CREATE INDEX beobachtungen_search_idx ON beobachtungen USING GIN(search_vector);

-- Tagesjournal
ALTER TABLE tagesjournal ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('german', coalesce(eintrag, '') || ' ' || coalesce(stimmung, ''))
  ) STORED;
CREATE INDEX tagesjournal_search_idx ON tagesjournal USING GIN(search_vector);
```

**Supabase RPC-Funktion:**
```sql
CREATE OR REPLACE FUNCTION global_search(query TEXT, einrichtung UUID)
RETURNS TABLE(typ TEXT, id UUID, titel TEXT, beschreibung TEXT, datum DATE, relevanz FLOAT) AS $$
BEGIN
  -- Kinder
  RETURN QUERY SELECT 'kind'::TEXT, k.id, (k.vorname || ' ' || k.nachname), k.notizen::TEXT, NULL::DATE,
    ts_rank(k.search_vector, plainto_tsquery('german', query)) AS relevanz
    FROM kinder k WHERE k.einrichtung_id = einrichtung AND k.search_vector @@ plainto_tsquery('german', query);
  -- Beobachtungen
  RETURN QUERY SELECT 'beobachtung'::TEXT, b.id, b.entwicklungsbereich, b.text, b.datum::DATE,
    ts_rank(b.search_vector, plainto_tsquery('german', query)) AS relevanz
    FROM beobachtungen b JOIN kinder k ON b.kind_id = k.id WHERE k.einrichtung_id = einrichtung AND b.search_vector @@ plainto_tsquery('german', query);
  -- Tagesjournal
  RETURN QUERY SELECT 'journal'::TEXT, tj.id, tj.stimmung, tj.eintrag, tj.datum::DATE,
    ts_rank(tj.search_vector, plainto_tsquery('german', query)) AS relevanz
    FROM tagesjournal tj WHERE tj.einrichtung_id = einrichtung AND tj.search_vector @@ plainto_tsquery('german', query);
END;
$$ LANGUAGE plpgsql;
```

**Seite:** `/admin/suche` (globale Suchseite)
- Suchfeld mit Debounce (300ms)
- Ergebnisse gruppiert nach Typ
- Klick → direkte Navigation zur Detailseite
- Keyboard-Shortcut: `Cmd+K` öffnet Suchmodal von überall

**Komponente:** `GlobalSearchModal` in Navigation eingebettet

**API-Route:** `GET /api/suche?q=...` → ruft RPC auf, gibt geclusterte Ergebnisse zurück

---

## R93: KI-Qualitätssicherung (Beobachtungs-Audit)

### Ziel
KI prüft alle Beobachtungen der letzten 30 Tage auf Qualität, Vollständigkeit und pädagogische Tiefe. Generiert Verbesserungsvorschläge und ein Audit-Bericht.

### Features

**Qualitätsdimensionen (KI bewertet 1–10):**
1. **Vollständigkeit** — Sind alle Pflichtfelder ausgefüllt?
2. **Konkretheit** — Beschreibt die Beobachtung konkrete Handlungen?
3. **Entwicklungsbezug** — Ist der Entwicklungsbereich klar benannt?
4. **Handlungsempfehlung** — Enthält die Beobachtung Folgeschritte?
5. **DSGVO-Konformität** — Keine unzulässigen persönlichen Daten Dritter?

**Neue Tabelle:**
```sql
CREATE TABLE beobachtungs_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beobachtung_id UUID REFERENCES beobachtungen(id),
  einrichtung_id UUID REFERENCES einrichtungen(id),
  vollstaendigkeit INT CHECK (vollstaendigkeit BETWEEN 1 AND 10),
  konkretheit INT CHECK (konkretheit BETWEEN 1 AND 10),
  entwicklungsbezug INT CHECK (entwicklungsbezug BETWEEN 1 AND 10),
  handlungsempfehlung INT CHECK (handlungsempfehlung BETWEEN 1 AND 10),
  dsgvo_konformitaet INT CHECK (dsgvo_konformitaet BETWEEN 1 AND 10),
  gesamt_score FLOAT GENERATED ALWAYS AS ((vollstaendigkeit + konkretheit + entwicklungsbezug + handlungsempfehlung + dsgvo_konformitaet) / 5.0) STORED,
  verbesserungsvorschlag TEXT,
  erstellt_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Audit-Prozess:**
1. Admin startet Audit über `/admin/qualitaet`
2. System lädt alle Beobachtungen der letzten 30 Tage (max 100 für Token-Budget)
3. Pro Beobachtung: Claude Haiku bewertet alle 5 Dimensionen + gibt Verbesserungsvorschlag
4. Batch-Processing: 10 Beobachtungen parallel, max 30s Gesamtzeit
5. Ergebnis: Audit-Bericht mit Durchschnittswerten, Verbesserungspotenzial, Top-10 schwächste Beobachtungen

**Seite:** `/admin/qualitaet`
- Audit starten (Button mit Fortschrittsanzeige)
- Historische Audits anzeigen (Vergleich Monat zu Monat)
- Einzelne Beobachtung anklicken → Details + Verbesserungsvorschlag
- Export als PDF/CSV

**API-Routen:**
- `POST /api/ai/beobachtungs-audit` — startet Audit (streaming progress)
- `GET /api/ai/beobachtungs-audit/[id]` — Audit-Ergebnis abrufen
- `GET /api/ai/beobachtungs-audit/list` — vergangene Audits

---

## Nicht-funktionale Anforderungen

### Performance
- Alle API-Routen: < 2s Response (außer Audit: < 30s)
- Realtime-Latenz: < 500ms für Check-in Updates
- Suche: < 300ms für Ergebnisse

### DSGVO
- Fotos: Consent-pflicht vor Anzeige (R91)
- Direktnachrichten: Gelöschte Nachrichten werden nach 365 Tagen automatisch gelöscht
- Audit-Logs: Alle KI-Bewertungen müssen nachvollziehbar sein
- Export: DSGVO-Vollexport umfasst alle neuen Daten (Nachrichten, Fotos-Metadaten, Audit-Ergebnisse)

### Sicherheit
- RLS auf allen neuen Tabellen
- Erzieher sehen nur Daten ihrer Einrichtung
- Eltern sehen nur Daten ihrer Kinder
- Fotos: Private Storage Bucket, signed URLs mit 1h Ablauf

### Monitoring
- Sentry-Integration für alle neuen API-Routen
- Realtime-Verbindungsabbrüche werden als Warning geloggt
- KI-Audit-Fehler (Token-Budget) werden automatisch abgefangen

---

## Abhängigkeiten & Reihenfolge

```
R88 (Realtime) ← Basis für R89 (nutzt Realtime für Live-KPIs)
R90 (Nachrichten) ← unabhängig
R91 (Galerie) ← unabhängig, braucht Storage Bucket
R92 (Suche) ← unabhängig, braucht DB-Migrationen
R93 (Audit) ← abhängig von bestehenden Beobachtungen (R1–R87)
```

**Empfohlene Implementierungsreihenfolge:** R88 → R89 → R93 → R90 → R91 → R92

---

## Technische Architektur-Entscheidungen

### Supabase Realtime
- Channels werden clientseitig abonniert
- Server-Side Rendering initial; dann Hydration des Realtime-State
- Reconnect-Logik: exponentielles Backoff bis max 30s
- Channel-Cleanup in `useEffect` return

### KI-Optimierungen
- Lazy Proxy Singleton (bereits implementiert) für alle neuen AI-Calls
- System-Prompts werden nicht bei jedem Request neu generiert (Caching)
- Audit: Batch-Verarbeitung mit Promise.allSettled (Fehler einzelner Beobachtungen blockieren nicht den Gesamtaudit)

### State Management
- Kein Redux / Zustand — React Server Components + `useOptimistic` für Realtime
- Realtime-State: `useState` + Supabase Channel Subscription
- Suchzustand: URL-Parameter (`?q=...`) für Shareable Links

---

*Konzept 1 — Stand 2026-04-17 — KitaHub kids.mindry.de*
