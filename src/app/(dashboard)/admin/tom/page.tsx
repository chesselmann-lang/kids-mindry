"use client"

// src/app/(dashboard)/admin/tom/page.tsx

interface TomMassnahme {
  kategorie: string
  icon: string
  massnahmen: {
    titel: string
    beschreibung: string
    status: 'umgesetzt' | 'teilweise' | 'geplant'
  }[]
}

const TOM_KATEGORIEN: TomMassnahme[] = [
  {
    kategorie: 'Zutrittskontrolle',
    icon: '🏢',
    massnahmen: [
      {
        titel: 'Serverstandort in Deutschland',
        beschreibung: 'Alle Produktivdaten werden auf Servern der Mittwald CM Service GmbH & Co. KG in Espelkamp, Deutschland, gehostet. Physischer Zugang ist auf autorisiertes Rechenzentrum-Personal beschränkt.',
        status: 'umgesetzt',
      },
      {
        titel: 'Kein eigenes Rechenzentrum',
        beschreibung: 'Als SaaS-Betreiber verfügen wir über keine eigenen Serverräume. Die physische Zutrittskontrolle obliegt vollständig Mittwald als ISO-27001-zertifiziertem Rechenzentrumsbetreiber.',
        status: 'umgesetzt',
      },
    ],
  },
  {
    kategorie: 'Zugangskontrolle',
    icon: '🔐',
    massnahmen: [
      {
        titel: 'Passwort-Hashing mit bcrypt',
        beschreibung: 'Alle Passwörter werden ausschließlich als bcrypt-Hash (cost factor ≥ 12) gespeichert. Klartextpasswörter werden zu keinem Zeitpunkt persistiert.',
        status: 'umgesetzt',
      },
      {
        titel: 'HTTPS / TLS 1.2+',
        beschreibung: 'Alle Verbindungen zur Anwendung werden über TLS 1.2 oder höher verschlüsselt. HTTP-Verbindungen werden serverseitig auf HTTPS umgeleitet.',
        status: 'umgesetzt',
      },
      {
        titel: 'JWT Session-Token',
        beschreibung: 'Sitzungen werden durch kurzlebige JWT-Token (Ablauf nach 1 Stunde) verwaltet. Refresh-Token laufen nach 7 Tagen ab.',
        status: 'umgesetzt',
      },
      {
        titel: 'Rate-Limiting auf Login-Endpunkten',
        beschreibung: 'Brute-Force-Angriffe werden durch IP-basiertes Rate-Limiting auf allen Authentifizierungsendpunkten abgewehrt.',
        status: 'umgesetzt',
      },
      {
        titel: 'Zwei-Faktor-Authentifizierung (2FA)',
        beschreibung: 'TOTP-basierte 2FA kann für Admin-Accounts aktiviert werden. Für alle Admin-Nutzer empfohlen.',
        status: 'geplant',
      },
    ],
  },
  {
    kategorie: 'Zugriffskontrolle',
    icon: '👥',
    massnahmen: [
      {
        titel: 'Row Level Security (RLS)',
        beschreibung: 'Supabase RLS-Policies gewährleisten, dass Nutzer ausschließlich auf Daten ihrer eigenen Einrichtung zugreifen können. Datenbankzugriffe ohne gültigen Auth-Kontext sind blockiert.',
        status: 'umgesetzt',
      },
      {
        titel: 'Rollenbasiertes Zugriffsmodell',
        beschreibung: 'Vier Rollen: admin (Kita-Leitung), erzieher (pädagogisches Personal), eltern (Erziehungsberechtigte), system (interne APIs). Jede Rolle hat exakt definierte Lese- und Schreibrechte.',
        status: 'umgesetzt',
      },
      {
        titel: 'Service-Role-Key Isolation',
        beschreibung: 'Der Supabase Service-Role-Key wird ausschließlich serverseitig in Next.js API-Routes verwendet. Er ist niemals im Client-Bundle enthalten.',
        status: 'umgesetzt',
      },
      {
        titel: 'Multi-Tenancy Isolation',
        beschreibung: 'Kinderdaten, Tagesberichte und Zahlungsdaten sind durch die kita_id-Spalte und entsprechende RLS-Policies strikt zwischen verschiedenen Einrichtungen getrennt.',
        status: 'umgesetzt',
      },
    ],
  },
  {
    kategorie: 'Trennungskontrolle',
    icon: '🔀',
    massnahmen: [
      {
        titel: 'Mandantentrennung auf Datenbankebene',
        beschreibung: 'Jede Kita-Einrichtung erhält eine eindeutige kita_id. RLS-Policies stellen sicher, dass keine Daten zwischen Mandanten sichtbar sind.',
        status: 'umgesetzt',
      },
      {
        titel: 'Produktiv- vs. Entwicklungsumgebung',
        beschreibung: 'Produktionsdaten werden nicht in Entwicklungs- oder Testumgebungen eingesetzt. Testdaten sind synthetisch.',
        status: 'umgesetzt',
      },
      {
        titel: 'Staging-Umgebung',
        beschreibung: 'Vor Produktions-Deployments wird ein separater Staging-Branch auf Vercel genutzt. Staging verwendet eine separate Supabase-Branch-Datenbank.',
        status: 'geplant',
      },
    ],
  },
  {
    kategorie: 'Pseudonymisierung & Verschlüsselung',
    icon: '🔒',
    massnahmen: [
      {
        titel: 'Datenverschlüsselung at rest',
        beschreibung: 'Alle Datenbankdaten werden durch Mittwald und Supabase (AWS-basiert) at-rest verschlüsselt (AES-256).',
        status: 'umgesetzt',
      },
      {
        titel: 'Verschlüsselung in transit',
        beschreibung: 'Alle Datenübertragungen zwischen Client, Server und Datenbank erfolgen ausschließlich über TLS-verschlüsselte Verbindungen.',
        status: 'umgesetzt',
      },
      {
        titel: 'DSGVO-konforme Anonymisierung',
        beschreibung: 'Bei Löschung von Kinderdaten werden Name, Adresse und Kontaktdaten anonymisiert (nicht gelöscht), um gesetzliche Aufbewahrungspflichten zu erfüllen ohne unnötige PII zu behalten.',
        status: 'umgesetzt',
      },
      {
        titel: 'Zahlungsdaten via PCI-DSS-konformem Anbieter',
        beschreibung: 'Vollständige Bankverbindungsdaten werden ausschließlich bei Stripe gespeichert. KitaHub speichert lediglich Stripe-Payment-Method-IDs.',
        status: 'umgesetzt',
      },
    ],
  },
  {
    kategorie: 'Verfügbarkeitskontrolle',
    icon: '✅',
    massnahmen: [
      {
        titel: 'Automatische Datenbankbackups (Supabase)',
        beschreibung: 'Supabase erstellt täglich automatisierte Backups der PostgreSQL-Datenbank. Point-in-Time-Recovery ist für die letzten 7 Tage möglich.',
        status: 'umgesetzt',
      },
      {
        titel: 'Health-Check Endpoint',
        beschreibung: 'Der Endpoint /api/health überwacht DB-Latenz, externe Dienste und liefert den Systemzustand. Kann mit Monitoring-Diensten (z. B. UptimeRobot) verbunden werden.',
        status: 'umgesetzt',
      },
      {
        titel: 'Fehler-Monitoring via Sentry',
        beschreibung: 'Sentry (Functional Software Inc.) überwacht Laufzeitfehler in Produktionsumgebung und benachrichtigt das Team bei kritischen Fehlern.',
        status: 'umgesetzt',
      },
      {
        titel: 'Uptime-Monitoring',
        beschreibung: 'Externer Monitoring-Dienst (UptimeRobot oder gleichwertig) überwacht die Verfügbarkeit alle 5 Minuten und alarmiert bei Ausfall.',
        status: 'geplant',
      },
      {
        titel: 'CDN / Edge-Caching',
        beschreibung: 'Statische Assets werden über Mittwalds CDN ausgeliefert. API-Responses sind nicht gecacht.',
        status: 'umgesetzt',
      },
    ],
  },
  {
    kategorie: 'Auftragskontrolle',
    icon: '📄',
    massnahmen: [
      {
        titel: 'AVV mit Mittwald',
        beschreibung: 'Auftragsverarbeitungsvertrag mit Mittwald CM Service GmbH & Co. KG gemäß Art. 28 DSGVO geschlossen.',
        status: 'umgesetzt',
      },
      {
        titel: 'AVV mit Supabase',
        beschreibung: 'Auftragsverarbeitungsvertrag mit Supabase Inc. über das Supabase-Kundenportal abgeschlossen. Standardvertragsklauseln für Drittlandübermittlung aktiviert.',
        status: 'teilweise',
      },
      {
        titel: 'AVV mit Stripe',
        beschreibung: 'Stripe Data Processing Agreement (DPA) über Stripe-Dashboard akzeptiert.',
        status: 'teilweise',
      },
      {
        titel: 'AVV mit Anthropic',
        beschreibung: 'Anthropic Data Processing Addendum über die Anthropic-Konsole abzuschließen.',
        status: 'geplant',
      },
      {
        titel: 'AVV mit Resend',
        beschreibung: 'Datenverarbeitungsvertrag mit Resend Inc. für E-Mail-Versand abzuschließen.',
        status: 'geplant',
      },
      {
        titel: 'AVV mit Sentry',
        beschreibung: 'Sentry DPA über das Sentry-Konto (Einstellungen → Legal → Data Processing Agreement) abzuschließen.',
        status: 'geplant',
      },
    ],
  },
  {
    kategorie: 'Eingabekontrolle & Audit',
    icon: '📋',
    massnahmen: [
      {
        titel: 'Audit-Log für kritische Aktionen',
        beschreibung: 'Kritische Operationen (DSGVO-Löschungen, Admin-Aktionen) werden in der audit_log-Tabelle protokolliert mit Timestamp, User-ID und Aktionsbeschreibung.',
        status: 'umgesetzt',
      },
      {
        titel: 'Supabase Auth-Logs',
        beschreibung: 'Alle Login- und Logout-Ereignisse werden von Supabase Auth protokolliert und sind im Supabase-Dashboard einsehbar.',
        status: 'umgesetzt',
      },
      {
        titel: 'Input-Validierung',
        beschreibung: 'Alle API-Endpoints validieren eingehende Daten serverseitig. SQL-Injection wird durch parametrisierte Queries (Supabase SDK) verhindert.',
        status: 'umgesetzt',
      },
    ],
  },
  {
    kategorie: 'Organisatorische Maßnahmen',
    icon: '🏛️',
    massnahmen: [
      {
        titel: 'Datenschutzfolgeabschätzung (DSFA)',
        beschreibung: 'Für Verarbeitungen mit besonderem Risiko (Kinderdaten, Gesundheitsdaten, KI-Einsatz) ist eine DSFA gemäß Art. 35 DSGVO durchzuführen.',
        status: 'geplant',
      },
      {
        titel: 'Mitarbeiterschulungen',
        beschreibung: 'Kita-Personal und Administratoren werden über den datenschutzkonformen Umgang mit KitaHub jährlich informiert.',
        status: 'geplant',
      },
      {
        titel: 'Incident-Response-Prozess',
        beschreibung: 'Bei Datenpannen (Art. 4 Nr. 12 DSGVO) ist die Meldepflicht an LDI NRW innerhalb von 72 Stunden (Art. 33 DSGVO) dokumentiert und bekannt.',
        status: 'teilweise',
      },
      {
        titel: 'Regelmäßige Überprüfung des VVT und der TOM',
        beschreibung: 'Das Verarbeitungsverzeichnis und diese TOM-Dokumentation werden mindestens jährlich sowie bei wesentlichen Änderungen aktualisiert.',
        status: 'umgesetzt',
      },
    ],
  },
]

const statusConfig = {
  umgesetzt: { label: 'Umgesetzt', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
  teilweise: { label: 'Teilweise', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  geplant: { label: 'Geplant', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
}

export default function TOMPage() {
  const stats = TOM_KATEGORIEN.flatMap((k) => k.massnahmen).reduce(
    (acc, m) => { acc[m.status]++; return acc },
    { umgesetzt: 0, teilweise: 0, geplant: 0 } as Record<string, number>
  )
  const total = stats.umgesetzt + stats.teilweise + stats.geplant
  const pct = Math.round(((stats.umgesetzt + stats.teilweise * 0.5) / total) * 100)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Technisch-organisatorische Maßnahmen (TOM)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gemäß Art. 25 &amp; 32 DSGVO | Stand: April 2025 | Hesselmann Beratung UG (haftungsbeschränkt)
          </p>
        </div>
        <button
          onClick={() => typeof window !== 'undefined' && window.print()}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 print:hidden shrink-0"
        >
          🖨️ Drucken
        </button>
      </div>

      {/* Status-Übersicht */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className={`rounded-lg border ${cfg.border} ${cfg.bg} px-5 py-4 text-center`}>
            <div className={`text-2xl font-bold ${cfg.text}`}>{stats[key as keyof typeof stats]}</div>
            <div className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Fortschrittsbalken */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Umsetzungsfortschritt</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Kategorien */}
      <div className="space-y-6">
        {TOM_KATEGORIEN.map((kategorie) => (
          <div key={kategorie.kategorie} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b">
              <h2 className="font-semibold text-gray-900">
                {kategorie.icon} {kategorie.kategorie}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {kategorie.massnahmen.map((m) => {
                const cfg = statusConfig[m.status]
                return (
                  <div key={m.titel} className="px-5 py-4 flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{m.titel}</p>
                      <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{m.beschreibung}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t pt-6 text-xs text-gray-400">
        <p>Dieses Dokument beschreibt die implementierten und geplanten technisch-organisatorischen Maßnahmen gemäß Art. 25 DSGVO (Privacy by Design/Default) und Art. 32 DSGVO (Sicherheit der Verarbeitung) für die KitaHub SaaS-Plattform.</p>
        <p className="mt-1">Verantwortlicher: Hesselmann Beratung UG (haftungsbeschränkt) · hallo@hesselmann-its.de · Letzte Aktualisierung: April 2025</p>
      </div>
    </div>
  )
}
