# KitaHub – KI-gestützte Kindergarten-Management-App

**Live:** [kids.mindry.de](https://kids.mindry.de) | **Stack:** Next.js 14 · Supabase · Anthropic Claude · Tailwind CSS · Vercel

---

## Öffentlicher Zugang

| Was | Link |
|-----|------|
| 🌐 Live-App | https://kids.mindry.de |
| 📦 Quellcode (dieses Repo) | https://github.com/chesselmann-lang/kids-mindry |
| ⬇️ ZIP-Download | https://github.com/chesselmann-lang/kids-mindry/archive/refs/heads/main.zip |
| 🔍 Alle Dateien durchsuchen | https://github.com/chesselmann-lang/kids-mindry/find/main |
| 🚀 Vercel Deployments | https://vercel.com/mindry/kids-mindry |

**Klonen (kein Login nötig):**
```bash
git clone https://github.com/chesselmann-lang/kids-mindry.git
cd kids-mindry
```

---

## Projektstruktur

```
kids-mindry/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Alle App-Seiten (geschützt)
│   │   │   ├── admin/            # Admin-Bereich
│   │   │   │   ├── datenschutz/  # DSGVO-Übersicht + Export
│   │   │   │   ├── kinder/       # Kinderverwaltung
│   │   │   │   └── ai-*/         # KI-Admin-Widgets
│   │   │   ├── feed/             # Tages-Feed
│   │   │   ├── mein-kind/        # Eltern-Ansicht
│   │   │   └── ...               # 30+ weitere Seiten
│   │   ├── api/
│   │   │   ├── ai/               # KI-API-Routen (Anthropic)
│   │   │   │   ├── chat/         # Pädagogen-KI-Chat
│   │   │   │   ├── kind-snapshot/       # KI-Kinderprofil
│   │   │   │   ├── grundschul-bericht/  # KI-Schulbericht
│   │   │   │   ├── jahresrueckblick/    # KI-Jahresrückblick
│   │   │   │   ├── tagesplan/           # KI-Tagesplan
│   │   │   │   ├── tagesbericht/        # KI-Tagesbericht
│   │   │   │   └── eltern-entwicklungs-feed/ # KI-Eltern-Feed
│   │   │   ├── dsgvo-kind-export/  # DSGVO Art.20 ZIP-Export
│   │   │   └── ...               # 20+ weitere API-Routen
│   │   └── (auth)/               # Login / Registrierung
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ai-widget-shell.tsx      # Base-Komponente für alle KI-Widgets
│   │   │   ├── dsgvo-export-button.tsx  # DSGVO ZIP-Download
│   │   │   └── ...               # 40+ UI-Komponenten
│   │   └── ...
│   └── lib/
│       ├── anthropic.ts          # Anthropic Singleton (Lazy Proxy)
│       ├── ai-utils.ts           # validateBody() + AiSchemas (Zod)
│       └── supabase/             # Supabase Client (Server + Browser)
├── supabase/
│   └── migrations/               # 17 SQL-Migrationen (001–017)
└── ...
```

---

## KI-Features (Anthropic claude-haiku-4-5)

| Feature | Route | Beschreibung |
|---------|-------|--------------|
| Kind-Snapshot | `GET /api/ai/kind-snapshot` | Ganzheitliches KI-Profil eines Kindes |
| Grundschul-Bericht | `POST /api/ai/grundschul-bericht` | Automatischer Übergabebericht |
| Jahresrückblick | `POST /api/ai/jahresrueckblick` | Jahresbericht mit Entwicklungsanalyse |
| Tagesplan | `POST /api/ai/tagesplan` | KI-generierter pädagogischer Tagesplan |
| Tagesbericht | `POST /api/ai/tagesbericht` | Automatischer Tagesbericht |
| Pädagogen-Chat | `POST /api/ai/chat` | Freier KI-Chat für Fachkräfte |
| Eltern-Feed | `GET /api/ai/eltern-entwicklungs-feed` | Personalisierter KI-Feed für Eltern |
| Datenschutz-Check | `GET /api/ai/datenschutz-check` | DSGVO-Compliance-Analyse |

---

## Entwicklungsrunden (Feature-Übersicht)

### Runden 1–50: Grundplattform
- Supabase Schema: Kinder, Gruppen, Erziehungsberechtigte, Profile
- Authentifizierung (Magic Link + Email/Passwort)
- Tages-Feed, Anwesenheit, Tagesberichte
- Zahlungsverwaltung (Stripe Integration)
- Elterngespräche, Meilensteine, Beobachtungen
- Web Push Notifications (VAPID)
- PWA-Setup (Manifest, Service Worker)

### Runden 51–70: Erweiterte Features
- Förderpläne, SISMIK-Assessments
- Portfolio-Einträge
- Umfragen & Online-Anmeldungen
- Urlaubsverwaltung, Zeiterfassung
- Wochenberichte, Jahresrückblicke
- DeepL-Übersetzung für Elternkommunikation

### Runden 71–80: KI-Schicht (Phase 1)
- Anthropic SDK Integration
- Kind-Snapshot Widget
- Grundschul-Bericht Generator
- Jahresrückblick Generator
- Tagesplan Generator
- Pädagogen-KI-Chat

### Runden 81–87: KI-Schicht (Phase 2) + Audit
- **M1:** Sentry Error Monitoring (sentry.*.config.ts, lazy guard)
- **M2:** AiWidgetShell Base-Komponente (einheitliches KI-Widget-Design)
- **M3:** aria-label Accessibility auf allen KI-Buttons
- **M4:** Eltern-KI-Entwicklungs-Feed (`/mein-kind`)
- **M5:** Zod-Validierung auf allen POST-Routen (`validateBody()` + `AiSchemas`)
- **M6:** DSGVO Art.20 Daten-Export als ZIP (10 Tabellen, fflate)
- Supabase Migration: `ai_usage_logs` Tabelle
- Vercel Deployment: Neues `kids-mindry` Projekt auf `kids.mindry.de`

---

## Technische Besonderheiten

### Anthropic Singleton (Lazy Proxy)
```typescript
// src/lib/anthropic.ts
// Verhindert Build-Time-Fehler wenn ANTHROPIC_API_KEY nicht gesetzt
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) { return (getAnthropicClient() as any)[prop] },
})
```

### Zod-Validierung auf API-Routen
```typescript
// src/lib/ai-utils.ts
const { data, error } = await validateBody(req, AiSchemas.KindSnapshot)
if (error) return error
```

### DSGVO ZIP-Export (Art. 20)
- Lädt 10 Tabellen parallel (attendance, reports, milestones, observations, guardians, meetings, Förderpläne, SISMIK, Gesundheit, Portfolio)
- Erstellt ZIP mit fflate (serverseitig)
- Schreibt Audit-Log-Eintrag

---

## Umgebungsvariablen

```bash
# Supabase (öffentlich)
NEXT_PUBLIC_SUPABASE_URL=https://swrtduckugkxzrfrbgav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Supabase (geheim)
SUPABASE_SERVICE_ROLE_KEY=...

# KI
ANTHROPIC_API_KEY=...

# App
NEXT_PUBLIC_SITE_URL=https://kids.mindry.de
NEXT_PUBLIC_DEFAULT_SITE_ID=a1b2c3d4-0000-0000-0000-000000000001

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:hallo@hesselmann-service.de
```

---

## Lokale Entwicklung

```bash
git clone https://github.com/chesselmann-lang/kids-mindry.git
cd kids-mindry
npm install --legacy-peer-deps
cp .env.example .env.local
# .env.local mit eigenen Keys befüllen
npm run dev
```

---

*Entwickelt mit [Claude](https://claude.ai) (Anthropic) via Cowork Mode*
