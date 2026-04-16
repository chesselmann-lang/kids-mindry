# KitaHub – kids.mindry.de

Kita-App für Eltern und Erzieher · gebaut mit Next.js 14 + Supabase

## Setup

```bash
npm install
cp .env.example .env.local   # Werte bereits vorkonfiguriert
npm run dev                   # http://localhost:3000
```

## Deployment (Mittwald mStudio)

```bash
npm run build
npm start                     # PORT via Umgebungsvariable
```

mStudio-Projekt: https://studio.mittwald.de/app/projects/4367aaa0-6fe8-4d5e-a044-d6bdae01ac0f
Supabase-Projekt: https://supabase.com/dashboard/project/swrtduckugkxzrfrbgav
Domain: kids.mindry.de

## Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (öffentlich) |
| `NEXT_PUBLIC_SITE_URL` | Produktions-URL |
| `NEXT_PUBLIC_DEFAULT_SITE_ID` | UUID der Demo-Einrichtung |

## Features (MVP)

- Elterninformationen / Newsfeed
- Anwesenheit & Krankmeldung
- Foto-Galerie
- Veranstaltungen & Termine
- Profilverwaltung

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Hosting**: Mittwald mStudio
