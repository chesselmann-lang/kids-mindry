# Quality-Sweep Report — kids.mindry.de

**Datum:** 2026-05-05  
**Scope:** Security Headers, /api/health, Rate-Limiting, Middleware Public Paths  
**Triggered by:** P0 Sprint Reaktivierung  

---

## Ausgangslage (vor Sweep)

| Item | Status vor Sweep |
|---|---|
| CSP | ✅ bereits stark (frame-ancestors none, upgrade-insecure-requests) |
| HSTS | ✅ bereits drin (max-age=31536000; includeSubDomains; preload) |
| X-Frame-Options, MIME, Referrer | ✅ bereits gesetzt |
| Permissions-Policy | ✅ vollständig restriktiv (Kamera, Mikro, Geo, Payment alle disabled) |
| /api/health | ⚠️ Existierte, aber HTTP 503 bei fehlenden optionalen Env-Vars (Stripe, Resend) |
| Rate-Limit /api/eltern-pin/verify | ❌ Kein Rate-Limit trotz public-unauthenticated Route |
| Middleware publicPaths | ⚠️ /api/health + /api/consent/verify fehlten → auth-blocked |
| E-8 (sidebar /dashboard) | ✅ Kein Bug — /dashboard route existiert korrekt |

---

## Durchgeführte Änderungen

### 1. /api/health — verbessert

**Datei:** `src/app/api/health/route.ts`

Vorher: 503 wenn Stripe/Resend nicht konfiguriert (zu restriktiv — Kita startet ohne Stripe).  
Nachher: Unterscheidung zwischen kritischen und optionalen Checks:

| Check | Kritisch | Fehlschlag führt zu |
|---|---|---|
| `database` | ✅ Ja | HTTP 503 `down` |
| `anthropic` | Nein | HTTP 200 `degraded` |
| `stripe` | Nein | HTTP 200 `degraded` |
| `resend` | Nein | HTTP 200 `degraded` |
| `kiosk_pin` | Nein | HTTP 200 `degraded` |

Response-Shape:
```json
{
  "status": "ok|degraded|down",
  "version": "0.1.0",
  "timestamp": "2026-05-05T...",
  "responseMs": 42,
  "checks": {
    "database": { "ok": true, "critical": true, "ms": 38 },
    "anthropic": { "ok": true, "note": "KI-Features" },
    "stripe":    { "ok": false, "note": "Zahlungen" },
    "resend":    { "ok": false, "note": "E-Mail-Versand" },
    "kiosk_pin": { "ok": true, "note": "Eltern-PIN" }
  }
}
```

Cache-Control: `no-store, no-cache, must-revalidate`  
CORS: `Access-Control-Allow-Origin: *` (erlaubt Uptime-Monitor-Zugriff)

---

### 2. Rate-Limit auf /api/eltern-pin/verify

**Datei:** `src/app/api/eltern-pin/verify/route.ts`

**Bedrohungsmodell:** Endpoint erfordert kein Auth (PIN-Modal vor Login). Ohne Rate-Limit theoretisch brute-forcebar (10.000 Kombinationen für 4-stellige PIN).

**Implementierung:** Sliding-Window, IP-Hash-basiert, module-level Map (in-memory, kein Redis benötigt):

| Parameter | Wert |
|---|---|
| Fenster | 15 Minuten |
| Max Versuche | 10 |
| Key | SHA-256(IP + Salt).slice(0,20) |
| Response bei Überschreitung | HTTP 429 + `Retry-After` Header |
| Brute-Force-Zeit (10k PINs) | ≥ 250 Stunden |

Response-Header auf allen Antworten:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
Retry-After: 847  (nur bei 429)
X-RateLimit-Reset: 1746...  (nur bei 429)
```

IP-Datenschutz: IPs werden gehashed (`SHA-256(ip + 'mindry-kids-rl')`), nie im Klartext gespeichert.

Hinweis: Für Multi-Instance-Produktionsschutz → Upstash Redis oder Vercel KV als Backing Store.

---

### 3. Middleware publicPaths ergänzt

**Datei:** `src/middleware.ts`

Hinzugefügt:
- `/api/health` — Uptime-Monitoring darf ohne Auth zugreifen
- `/api/eltern-pin/verify` — war bereits unauthenticated, jetzt explizit in publicPaths
- `/api/consent/verify` — E-Mail-Bestätigungslinks kommen unauthenticated an

---

### 4. E-8 Bug-Investigation

**Befund:** Kein Bug. `sidebar-nav.tsx` verlinkt "Lern-Dashboard" korrekt auf `/dashboard`. Die Route `src/app/(dashboard)/dashboard/page.tsx` existiert und rendert Lernfortschritts-Übersicht. Die Hauptseite `/feed` ist separat als "Feed" verlinkt. Issue geschlossen.

---

## KJM/DSGVO-Compliance-Status nach Sweep

| Anforderung | Status |
|---|---|
| Keine Tracking-Cookies für Kinder <16 | ✅ Cookie-Banner + Eltern-PIN-Gate (R2.5) |
| Eltern-Einwilligung vor optionalen Cookies | ✅ Art. 8 DSGVO implementiert (R2.3) |
| Kein Werbe-Targeting | ✅ Permissions-Policy: interest-cohort=() |
| Rate-Limit Eltern-PIN | ✅ Jetzt implementiert |
| Uptime-Monitoring-fähig | ✅ /api/health korrekt |
| Frame-Schutz (Clickjacking) | ✅ frame-ancestors none |
| HTTPS-Only | ✅ HSTS max-age=31536000 + preload |

---

## Offene P1-Punkte (nicht in diesem Sweep)

| ID | Beschreibung | Empfehlung |
|---|---|---|
| OPS-1 | `RESEND_API_KEY` in Vercel setzen | Consent-E-Mails funktionieren erst dann |
| SEC-2 | Upstash Redis für Rate-Limit bei Multi-Instance | Wenn Skalierung >1 Instance nötig |
| OPS-2 | Sentry DSN für kids.mindry.de setzen | Error-Tracking fehlt noch (Primary+School haben es) |
| OPS-3 | UptimeRobot auf /api/health konfigurieren | 5-Minuten-Intervall empfohlen |

---

## Nächste Phase: P0 Functional

**Echtzeit-Chat Eltern↔Erzieher** (Supabase Realtime)  
Das ist die wichtigste fehlende Funktion für eine Kita-App. Eltern brauchen direkte Kommunikation mit Erziehern — derzeit gibt es nur Nachrichten (keine Realtime-Benachrichtigung).

Technische Basis ist bereits vorhanden: `connect-src` in CSP erlaubt `wss://*.supabase.co`.
