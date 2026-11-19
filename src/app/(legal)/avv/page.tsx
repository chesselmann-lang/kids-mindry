'use client'

import { useState } from 'react'
import { FileText, Download, Copy, Check, Shield, Baby, AlertCircle } from 'lucide-react'

// ── AVV-Text Generierung ──────────────────────────────────────────────────────

function buildAvvText(einrichtung: string, traeger: string, stadt: string, datum: string): string {
  return `AUFTRAGSVERARBEITUNGSVERTRAG (AVV)
gemäß Art. 28 DSGVO
Besondere Anforderungen: DSGVO Art. 8 (Kinder), KitaG, § 22a SGB VIII

Stand: ${datum}

════════════════════════════════════════════════════════════════

ZWISCHEN

${traeger}
${einrichtung}
${stadt}
(nachfolgend „Auftraggeber" / „Verantwortlicher" / „Träger")

UND

Hesselmann Beratung UG (haftungsbeschränkt)
Musterstraße 1, 48149 Münster
Geschäftsführung: Christian Hesselmann
E-Mail: datenschutz@mindry.de
Datenschutzbeauftragter: datenschutz@mindry.de
(nachfolgend „Auftragnehmer" / „Auftragsverarbeiter")

════════════════════════════════════════════════════════════════

§ 1  GEGENSTAND UND DAUER

(1) Der Auftragnehmer verarbeitet personenbezogene Daten im Auftrag des
Auftraggebers gemäß Art. 28 DSGVO im Rahmen der Nutzung der Software
„mindry kids" (SaaS-Plattform für Kita-Verwaltung, kids.mindry.de).

(2) Die Dauer der Verarbeitung entspricht der Laufzeit des Hauptvertrages.
Nach Beendigung sind alle Daten gem. § 9 dieses Vertrages zu löschen.

§ 2  ART DER PERSONENBEZOGENEN DATEN / BETROFFENE PERSONEN

(1) Verarbeitete Datenkategorien:

   a) Kinderdaten (DSGVO Art. 8 — besonderer Schutz):
      - Stammdaten: Vorname, Nachname, Geburtsdatum, Nationalität
      - Betreuungsdaten: Gruppenname, Betreuungszeiten, Anwesenheiten
      - Gesundheitsdaten (Art. 9 DSGVO): Allergien, Erkrankungen,
        Medikamentenpläne, IfSG-§34-Meldungen
      - Entwicklungsdaten: Beobachtungsbögen (BaSiK, SISMIK, PERIK),
        Portfolio, Bildungsdokumentationen, Förderpläne
      - Eingewöhnungsdaten: Berliner/Münchner Modell, Anpassungsverläufe

   b) Eltern-/Erziehungsberechtigtendaten:
      - Name, Anschrift, E-Mail, Telefon
      - Einwilligungserklärungen (Art. 6 Abs. 1 lit. a DSGVO)
      - Kommunikationsinhalte (Nachrichten, Elterngespräche)
      - Bankverbindung (Kita-Gebühren) — nur bei Zahlungsmodul

   c) Mitarbeiterdaten:
      - Name, dienstliche E-Mail, Qualifikationen
      - Arbeitszeitnachweise, Urlaubsanträge, Fortbildungen

(2) Kategorien betroffener Personen:
      Kinder (Minderjährige i.S.d. Art. 8 DSGVO / § 13 Abs. 1 TMG),
      Erziehungsberechtigte, Fachkräfte, Leitungspersonal

§ 3  ZWECKE DER VERARBEITUNG

Die Verarbeitung dient ausschließlich:
   - Verwaltung der Kindertagesbetreuung gem. § 22a SGB VIII
   - Dokumentationspflichten nach den Kita-Gesetzen der Länder (KitaG)
   - Gesundheitsschutz gem. IfSG §§ 33–36
   - Förderplanung gem. § 22a Abs. 2 SGB VIII (Inklusion)
   - DSGVO-konforme Elternkommunikation

§ 4  WEISUNGSGEBUNDENHEIT

(1) Der Auftragnehmer verarbeitet Daten ausschließlich auf dokumentierte
Weisung des Auftraggebers. Weisungen erfolgen schriftlich oder per
gesicherter digitaler Kommunikation.

(2) Hält der Auftragnehmer eine Weisung für rechtswidrig, informiert er
den Auftraggeber unverzüglich (Art. 28 Abs. 3 lit. h DSGVO).

§ 5  TECHNISCHE UND ORGANISATORISCHE MASSNAHMEN (TOM)
     gem. Art. 32 DSGVO

Der Auftragnehmer gewährleistet folgende TOMs:

   Verschlüsselung:
   ✓ TLS 1.3 für alle Datenübertragungen
   ✓ AES-256 für Daten im Ruhezustand
   ✓ Ende-zu-Ende-Verschlüsselung für Eltern-Nachrichten

   Zugriffskontrolle:
   ✓ Rollenbasierter Zugriff (RBAC): Leitung, Fachkraft, Eltern, Träger
   ✓ Zwei-Faktor-Authentifizierung für Leitungskräfte
   ✓ Automatische Sitzungssperrung nach 30 Minuten Inaktivität

   Verfügbarkeit:
   ✓ SLA 99,5 % Uptime
   ✓ Tägliche verschlüsselte Backups (Retention: 30 Tage)
   ✓ Georedundantes Hosting (Mittwald AG & Co. KG, Deutschland)

   Kinderschutz (DSGVO Art. 8):
   ✓ Keine Werbe-Targeting, keine Profilerstellung
   ✓ Fotos nur mit expliziter Eltern-Einwilligung (Opt-in)
   ✓ Gesundheitsdaten nur für autorisiertes Fachpersonal sichtbar
   ✓ PostHog: autocapture deaktiviert, mask_all_text aktiv

§ 6  UNTERAUFTRAGSVERARBEITER

Der Auftragnehmer setzt folgende geprüfte Unterauftragsverarbeiter ein:

   Mittwald CM Service GmbH & Co. KG
   Königsberger Str. 4–6, 32339 Espelkamp
   Zweck: Hosting, Serverinfrastruktur (ISO 27001)
   Standort: Deutschland (EU)

   Supabase Inc.
   Zweck: Datenbank, Authentifizierung
   Standort: EU-Region (Frankfurt)

   PostHog Inc. (EU-Cloud)
   Zweck: Produktanalyse (DSGVO-konform, keine Kinderdaten)
   Standort: EU (Frankfurt)

Änderungen werden dem Auftraggeber 30 Tage vorab schriftlich mitgeteilt.

§ 7  AUSKUNFTS- UND BERICHTIGUNGSPFLICHTEN

Der Auftragnehmer unterstützt den Auftraggeber bei:
   - Auskunftsersuchen Betroffener (Art. 15 DSGVO)
   - Löschanträgen (Art. 17 DSGVO)
   - Datenübertragbarkeit (Art. 20 DSGVO)
   - Datenschutz-Folgenabschätzung (Art. 35 DSGVO)

§ 8  MELDEPFLICHTEN BEI DATENPANNEN

Datenpannen werden dem Auftraggeber innerhalb von 72 Stunden nach
Bekanntwerden gemeldet (Art. 33 DSGVO). Besondere Sorgfalt gilt für
Datenpannen, die Kinder betreffen (Art. 8 DSGVO).

§ 9  LÖSCHUNG NACH VERTRAGSENDE

Nach Beendigung des Hauptvertrages werden alle personenbezogenen Daten
innerhalb von 30 Tagen gelöscht oder dem Auftraggeber in maschinenlesbarem
Format (JSON/CSV) übergeben. Kinderdaten werden nach Schuljahresende
automatisch anonymisiert (konfigurierbar).

§ 10  HAFTUNG UND HAFTUNGSAUSSCHLUSS

Die Parteien haften gegenüber Betroffenen nach den Regelungen der DSGVO.
Im Innenverhältnis gilt: Haftet eine Partei für einen Verstoß, der durch
die andere Partei verursacht wurde, kann sie anteiligen Regress nehmen.

§ 11  RECHTSGRUNDLAGEN (KINDER-SPEZIFISCH)

   - Art. 28 DSGVO: Auftragsverarbeitung
   - Art. 8 DSGVO: Einwilligung Minderjähriger (Eltern-Consent)
   - Art. 9 DSGVO: Besondere Datenkategorien (Gesundheitsdaten)
   - § 22a SGB VIII: Förderungsauftrag Tageseinrichtungen
   - KitaG (länderspezifisch): Dokumentationspflichten
   - IfSG § 34: Infektionsschutz, Meldepflichten
   - BDSG § 26: Beschäftigtendatenschutz (Mitarbeiterdaten)

════════════════════════════════════════════════════════════════

ANLAGEN

Anlage 1: Verarbeitungsverzeichnis (Art. 30 DSGVO)
Anlage 2: Sicherheitskonzept / TOM-Dokumentation
Anlage 3: Unterauftragsverarbeiter-Liste (aktuell)
Anlage 4: Einwilligungsformulare Eltern (Fotos, KI-Funktionen)

════════════════════════════════════════════════════════════════

UNTERSCHRIFTEN

Ort, Datum: _______________________

Auftraggeber (Träger):            Auftragnehmer (mindry):
_______________________           _______________________
(Unterschrift, Stempel)           (Unterschrift)
`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AvvPage() {
  const [copied, setCopied] = useState(false)
  const [einrichtung, setEinrichtung] = useState('Kita Sonnenschein e.V.')
  const [traeger, setTraeger] = useState('Musterkita Träger gGmbH')
  const [stadt, setStadt] = useState('48149 Münster')
  const [datum] = useState(
    new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  )
  const [showPreview, setShowPreview] = useState(false)

  const avvText = buildAvvText(einrichtung, traeger, stadt, datum)

  function handleCopy() {
    navigator.clipboard.writeText(avvText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([avvText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AVV_mindry_kids_${einrichtung.replace(/\s+/g, '_')}_${datum.replace(/\./g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--color-primary)]" />
          Auftragsverarbeitungsvertrag (AVV)
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          gemäß Art. 28 DSGVO · DSGVO Art. 8 (Kinder) · § 22a SGB VIII · KitaG · IfSG §34
        </p>
      </div>

      {/* Legal Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Shield className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Rechtliche Pflicht:</strong> Als Kita müssen Sie mit mindry einen AVV abschließen, bevor
          personenbezogene Daten verarbeitet werden (Art. 28 Abs. 3 DSGVO). Besondere Schutzpflicht gilt
          für Kinderdaten (Art. 8 DSGVO) und Gesundheitsdaten (Art. 9 DSGVO).
        </div>
      </div>

      {/* Formular */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Baby className="w-4 h-4 text-[var(--color-primary)]" />
          Angaben Ihrer Einrichtung
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">Name der Einrichtung</label>
            <input
              value={einrichtung}
              onChange={e => setEinrichtung(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">Träger / Rechtsträger</label>
            <input
              value={traeger}
              onChange={e => setTraeger(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">PLZ und Stadt</label>
            <input
              value={stadt}
              onChange={e => setStadt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">Datum</label>
            <input
              value={datum}
              readOnly
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Hinweis Kinder */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Kinder-Datenschutz (Art. 8 DSGVO):</strong> mindry kids verarbeitet ausschließlich
          Daten von Minderjährigen. Einwilligungen müssen durch Erziehungsberechtigte erteilt werden.
          PostHog Analytics ist für Kinder deaktiviert (autocapture: false). Gesundheitsdaten
          (IfSG §34, Medikamente) sind Art.-9-Daten und nur für autorisiertes Fachpersonal sichtbar.
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowPreview(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <FileText className="w-4 h-4" />
          {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Kopiert!' : 'Text kopieren'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          AVV herunterladen (.txt)
        </button>
      </div>

      {/* Vorschau */}
      {showPreview && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
          <pre className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[600px]">
            {avvText}
          </pre>
        </div>
      )}

      {/* Rechtliche Grundlagen */}
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { icon: Shield, title: 'Art. 28 DSGVO', desc: 'Auftragsverarbeitungsvertrag — Pflichtdokument vor Datenbeginn' },
          { icon: Baby,   title: 'Art. 8 DSGVO',  desc: 'Einwilligung Minderjähriger — Eltern als gesetzliche Vertreter' },
          { icon: FileText, title: '§ 22a SGB VIII', desc: 'Förderungsauftrag — Dokumentationspflichten in Kitas' },
          { icon: AlertCircle, title: 'IfSG § 34',  desc: 'Infektionsschutz — Meldepflichten für Kindergemeinschaften' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <Icon className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[var(--color-text)]">{title}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
