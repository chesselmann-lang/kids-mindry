"use client"

// src/app/(dashboard)/admin/vvt/page.tsx

const VERANTWORTLICHER = {
  name: 'Hesselmann Beratung UG (haftungsbeschränkt)',
  strasse: 'Schloßstraße 184',
  ort: '46535 Dinslaken',
  email: 'hallo@hesselmann-its.de',
  telefon: '+49 (0)2064 39952-99',
}

interface Verarbeitungstaetigkeit {
  id: string
  bezeichnung: string
  zweck: string
  rechtsgrundlage: string
  kategorienPersonen: string[]
  kategorienDaten: string[]
  empfaenger: string[]
  drittland: string | null
  loeschfrist: string
  technischeMassnahmen: string[]
}

const VERARBEITUNGEN: Verarbeitungstaetigkeit[] = [
  {
    id: 'VVT-001',
    bezeichnung: 'Kinderverwaltung / Kita-Management',
    zweck: 'Verwaltung von Kinddaten, Betreuungsverträgen, Gruppenplanung und Anwesenheitserfassung im Rahmen des Betriebs einer Kindertagesstätte',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 9 Abs. 2 lit. b DSGVO (Gesundheitsdaten), KiBiz NRW',
    kategorienPersonen: ['Kinder (Minderjährige)', 'Erziehungsberechtigte'],
    kategorienDaten: [
      'Name, Geburtsdatum, Adresse des Kindes',
      'Kontaktdaten der Erziehungsberechtigten',
      'Betreuungszeiten, Gruppe',
      'Gesundheitsrelevante Hinweise (Allergien, Medikamente)',
      'Fotos (sofern Einwilligung vorliegt)',
      'Anwesenheitszeiten (Check-in/Check-out)',
    ],
    empfaenger: ['Kita-Personal (intern)', 'Träger (intern)', 'Mittwald CM Service GmbH & Co. KG (Hosting)'],
    drittland: null,
    loeschfrist: 'Löschung 3 Jahre nach Ende des Betreuungsverhältnisses, Anonymisierung gesetzlich erforderlicher Daten nach 10 Jahren (§ 257 HGB)',
    technischeMassnahmen: ['TLS-Verschlüsselung', 'RLS (Row Level Security)', 'Rollentrennung', 'Audit-Log'],
  },
  {
    id: 'VVT-002',
    bezeichnung: 'Nutzerverwaltung / Authentifizierung',
    zweck: 'Verwaltung von Zugangsdaten und Sitzungen für Kita-Personal und Erziehungsberechtigte',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: IT-Sicherheit)',
    kategorienPersonen: ['Mitarbeitende (Kita-Personal)', 'Erziehungsberechtigte'],
    kategorienDaten: [
      'E-Mail-Adresse',
      'Passwort-Hash (bcrypt)',
      'Rolle (admin, erzieher, eltern)',
      'Login-Zeitstempel',
      'Session-Token',
    ],
    empfaenger: ['Supabase Ireland Limited (Auth-Dienst, EU-Hosting)', 'Mittwald (Hosting)'],
    drittland: 'Supabase: Daten in EU (eu-west-1 Ireland); Muttergesellschaft USA → Standardvertragsklauseln (SCC)',
    loeschfrist: 'Sofort bei Kündigung des Nutzerkontos; Session-Token: bei Abmeldung / max. 7 Tage',
    technischeMassnahmen: ['bcrypt Passwort-Hashing', 'HTTPS/TLS', 'Kurzlebige JWT-Tokens', 'IP-basiertes Rate-Limiting'],
  },
  {
    id: 'VVT-003',
    bezeichnung: 'Elternkommunikation / Mitteilungen',
    zweck: 'Versand von Elternbriefen, Ankündigungen und Lesebestätigungen innerhalb der KitaHub-Plattform',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung Betreuungsvertrag)',
    kategorienPersonen: ['Erziehungsberechtigte', 'Kita-Personal'],
    kategorienDaten: [
      'Name, E-Mail der Empfänger',
      'Nachrichteninhalt',
      'Lesestatus / Lesebestätigung mit Zeitstempel',
      'Anhänge (z. B. PDFs)',
    ],
    empfaenger: ['Mittwald (Hosting)', 'Resend Inc. (E-Mail-Zustellung, USA)'],
    drittland: 'Resend: USA → Standardvertragsklauseln (SCC) gemäß Art. 46 DSGVO',
    loeschfrist: '3 Jahre nach Versand, dann Löschung',
    technischeMassnahmen: ['TLS', 'RLS', 'Zugriffskontrolle nach Rolle'],
  },
  {
    id: 'VVT-004',
    bezeichnung: 'Zahlungsverwaltung / Elternbeiträge',
    zweck: 'Verwaltung von Elternbeiträgen, SEPA-Lastschriften, Beitragsbescheiden und Steuerbescheinigungen (§ 10 EStG)',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Pflicht: § 10 EStG, § 257 HGB)',
    kategorienPersonen: ['Erziehungsberechtigte / Zahlungspflichtige'],
    kategorienDaten: [
      'Name, Adresse, E-Mail',
      'IBAN (verschlüsselt via Stripe)',
      'Zahlungsbeträge, -daten',
      'Steuerbescheinigungsdaten',
      'Sozialstaffel-Einstufung',
    ],
    empfaenger: ['Stripe Payments Europe Ltd. (Zahlungsabwicklung, Irland)', 'Mittwald (Hosting)'],
    drittland: 'Stripe: EU-Verarbeitung (Irland); Muttergesellschaft USA → SCC + Privacy Shield-Nachfolger',
    loeschfrist: '10 Jahre nach Ablauf des Steuerjahres (§ 147 AO, § 257 HGB)',
    technischeMassnahmen: ['PCI-DSS-konforme Verarbeitung via Stripe', 'Keine Speicherung vollständiger Kartendaten', 'TLS'],
  },
  {
    id: 'VVT-005',
    bezeichnung: 'Tagesberichte und pädagogische Dokumentation',
    zweck: 'Erstellung und Speicherung pädagogischer Tagesberichte zu Kindern, optional mit KI-Textunterstützung',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO, Art. 9 Abs. 2 lit. b DSGVO (pädagogische Dokumentationspflicht)',
    kategorienPersonen: ['Kinder', 'Kita-Personal (Autor)'],
    kategorienDaten: [
      'Name und ID des Kindes',
      'Pädagogische Beobachtungen (Freitext)',
      'Datum, Erstellungszeitpunkt',
      'KI-generierter Text (sofern genutzt)',
    ],
    empfaenger: ['Anthropic Inc. (KI-Dienst, USA) – nur bei Nutzung der KI-Funktion', 'Mittwald (Hosting)'],
    drittland: 'Anthropic: USA → SCC gemäß Art. 46 DSGVO; Daten werden nach API-Aufruf nicht gespeichert',
    loeschfrist: '3 Jahre nach Ende des Betreuungsverhältnisses',
    technischeMassnahmen: ['RLS (nur Kita-interner Zugriff)', 'Keine Namensübermittlung an KI-API (nur anonymisierter Text)'],
  },
  {
    id: 'VVT-006',
    bezeichnung: 'SISMIK-Sprachbeobachtung',
    zweck: 'Dokumentation der Sprachentwicklung von Kindern mit Migrationshintergrund gemäß SISMIK-Verfahren',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Pflicht: Sprachstandsfeststellung nach KiBiz NRW), Art. 9 Abs. 2 lit. b DSGVO',
    kategorienPersonen: ['Kinder'],
    kategorienDaten: [
      'Kind-ID, Name',
      'Sprachbeobachtungswerte (4 Domänen, Skala 0–4)',
      'Gesamtscore',
      'Beobachtungsdatum, Beobachter',
    ],
    empfaenger: ['Kita-Personal (intern)', 'Träger (intern)', 'Mittwald (Hosting)'],
    drittland: null,
    loeschfrist: '3 Jahre nach Ende der Betreuung, dann Anonymisierung',
    technischeMassnahmen: ['RLS', 'Zugriff nur für autorisiertes pädagogisches Personal'],
  },
  {
    id: 'VVT-007',
    bezeichnung: 'Online-Anmeldung / Warteliste',
    zweck: 'Entgegennahme von Betreuungsanfragen über das öffentliche Anmeldeportal',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen)',
    kategorienPersonen: ['Erziehungsberechtigte (Interessenten)', 'Kinder (Interessenten)'],
    kategorienDaten: [
      'Name, Geburtsdatum des Kindes',
      'Name, Adresse, E-Mail, Telefon der Erziehungsberechtigten',
      'Gewünschte Betreuungszeit und -beginn',
      'Geschwisterkinder in der Einrichtung',
    ],
    empfaenger: ['Kita-Personal / Träger', 'Resend Inc. (Bestätigungsmail)', 'Mittwald (Hosting)'],
    drittland: 'Resend: USA → SCC',
    loeschfrist: '6 Monate nach Ablehnung oder Rücknahme der Anfrage',
    technischeMassnahmen: ['HTTPS/TLS', 'Rate-Limiting', 'Kein Account erforderlich'],
  },
  {
    id: 'VVT-008',
    bezeichnung: 'Förderantrag-Assistent (KI)',
    zweck: 'KI-gestützte Erstellung von Förderanträgen (z. B. KiBiz, Digitalisierungsförderung)',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung mit Kita-Betreiber)',
    kategorienPersonen: ['Kita-Personal / Leitungen', 'Kita (als Institution)'],
    kategorienDaten: [
      'Name und Standort der Kita',
      'Finanzdaten (Kosten, Förderbedarf)',
      'Antragsinhalte (Freitext)',
    ],
    empfaenger: ['Anthropic Inc. (USA)', 'Mittwald (Hosting)'],
    drittland: 'Anthropic: USA → SCC; keine personenbezogenen Kinderdaten werden übermittelt',
    loeschfrist: '5 Jahre (steuerrechtliche Aufbewahrungspflicht)',
    technischeMassnahmen: ['Zugriff nur für Admin-Rolle', 'Keine Übermittlung sensibler Kinderdaten an KI'],
  },
  {
    id: 'VVT-009',
    bezeichnung: 'Fehler- und Performance-Monitoring (Sentry)',
    zweck: 'Technische Fehlerüberwachung und Performance-Monitoring der KitaHub-Anwendung',
    rechtsgrundlage: 'Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Systemstabilität und Sicherheit)',
    kategorienPersonen: ['Alle Nutzer der Anwendung'],
    kategorienDaten: [
      'IP-Adresse (gekürzt)',
      'Fehlermeldungen / Stack Traces',
      'Browser-Typ, Betriebssystem',
      'URL der fehlerhaften Seite',
    ],
    empfaenger: ['Sentry (Functional Software Inc., USA)'],
    drittland: 'USA → SCC gemäß Art. 46 DSGVO; Daten werden nach 90 Tagen automatisch gelöscht',
    loeschfrist: '90 Tage (automatische Sentry-Löschung)',
    technischeMassnahmen: ['IP-Kürzung', 'Kein Scraping von Formularinhalten', 'PII-Scrubbing aktiviert'],
  },
]

export default function VVTPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Verzeichnis der Verarbeitungstätigkeiten (VVT)
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gemäß Art. 30 DSGVO | Stand: April 2025
        </p>
      </div>

      {/* Verantwortlicher */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h2 className="font-semibold text-blue-900 mb-3">Verantwortlicher (Art. 30 Abs. 1 lit. a DSGVO)</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <span className="font-medium">Unternehmen:</span> {VERANTWORTLICHER.name}
          </div>
          <div>
            <span className="font-medium">Anschrift:</span> {VERANTWORTLICHER.strasse}, {VERANTWORTLICHER.ort}
          </div>
          <div>
            <span className="font-medium">E-Mail:</span> {VERANTWORTLICHER.email}
          </div>
          <div>
            <span className="font-medium">Telefon:</span> {VERANTWORTLICHER.telefon}
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          Datenschutzbeauftragter: Kein DSB benannt (Schwellenwert gemäß Art. 37 DSGVO nicht erreicht).
          Verantwortliche Kontaktperson: Christa Hesselmann, {VERANTWORTLICHER.email}
        </p>
      </div>

      {/* Hinweis Ausdruck */}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 print:hidden"
        >
          🖨️ Drucken / PDF exportieren
        </button>
      </div>

      {/* Verarbeitungen */}
      <div className="space-y-6">
        {VERARBEITUNGEN.map((v) => (
          <div key={v.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b">
              <h3 className="font-semibold text-gray-900">
                <span className="text-gray-400 text-xs mr-2 font-mono">{v.id}</span>
                {v.bezeichnung}
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 block mb-1">Zweck der Verarbeitung</span>
                <p className="text-gray-600">{v.zweck}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 block mb-1">Rechtsgrundlage</span>
                <p className="text-gray-600">{v.rechtsgrundlage}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 block mb-1">Kategorien betroffener Personen</span>
                <ul className="text-gray-600 space-y-0.5">
                  {v.kategorienPersonen.map((p) => (
                    <li key={p} className="before:content-['•'] before:mr-1.5">{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium text-gray-700 block mb-1">Kategorien personenbezogener Daten</span>
                <ul className="text-gray-600 space-y-0.5">
                  {v.kategorienDaten.map((d) => (
                    <li key={d} className="before:content-['•'] before:mr-1.5">{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium text-gray-700 block mb-1">Empfänger / Auftragsverarbeiter</span>
                <ul className="text-gray-600 space-y-0.5">
                  {v.empfaenger.map((e) => (
                    <li key={e} className="before:content-['•'] before:mr-1.5">{e}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium text-gray-700 block mb-1">Lösch-/Aufbewahrungsfrist</span>
                <p className="text-gray-600">{v.loeschfrist}</p>
              </div>
              {v.drittland && (
                <div className="md:col-span-2">
                  <span className="font-medium text-amber-700 block mb-1">⚠ Drittlandübermittlung</span>
                  <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">{v.drittland}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700 block mb-1">Technisch-organisatorische Maßnahmen (TOM)</span>
                <div className="flex flex-wrap gap-2">
                  {v.technischeMassnahmen.map((t) => (
                    <span key={t} className="bg-green-50 border border-green-200 text-green-800 text-xs rounded px-2 py-1">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t pt-6 text-xs text-gray-400 print:block">
        <p>Dieses Verzeichnis wurde gemäß Art. 30 DSGVO erstellt und ist der zuständigen Aufsichtsbehörde auf Anfrage vorzulegen.</p>
        <p className="mt-1">Aufsichtsbehörde: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf</p>
        <p className="mt-1">Letzte Aktualisierung: April 2025 | {VERANTWORTLICHER.name}</p>
      </div>

      {/* Print styles */}
    </div>
  )
}
