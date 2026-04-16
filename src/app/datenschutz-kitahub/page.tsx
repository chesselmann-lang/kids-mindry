export const metadata = { title: 'Datenschutzerklärung – Kids Mindry' }

const STAND = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-6 text-sm text-gray-700">
        <div>
          <a href="/" className="text-sm text-brand-600 hover:underline">← Zurück</a>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Datenschutzerklärung</h1>
          <p className="text-xs text-gray-400 mt-1">Stand: {STAND} · Kids Mindry (kids.mindry.de)</p>
        </div>

        {/* 1. Verantwortlicher */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">1. Verantwortlicher (Art. 4 Nr. 7 DSGVO)</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-0.5">
            <p className="font-medium">Hesselmann Beratung UG (haftungsbeschränkt)</p>
            <p>Schloßstraße 184, 46535 Dinslaken</p>
            <p>E-Mail: <a href="mailto:hallo@hesselmann-its.de" className="text-brand-600">hallo@hesselmann-its.de</a></p>
            <p>Telefon: +49 (0)2064 39952-99</p>
            <p>Handelsregister: HRB 32806, AG Duisburg</p>
          </div>
          <p>„Kids Mindry" ist ein digitales Angebot der Hesselmann Beratung UG (haftungsbeschränkt), betrieben unter der Marke Hesselmann IT Services.</p>
        </section>

        {/* 2. Datenschutzbeauftragter */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">2. Datenschutzbeauftragter</h2>
          <p>Es wurde geprüft, ob die Benennung eines Datenschutzbeauftragten gemäß Art. 37 DSGVO / § 38 BDSG gesetzlich erforderlich ist. Sofern eine Pflicht besteht oder freiwillig ein Beauftragter benannt wird, werden dessen Kontaktdaten hier veröffentlicht.</p>
          <p>Datenschutzanfragen richten Sie bitte an: <a href="mailto:hallo@hesselmann-its.de" className="text-brand-600">hallo@hesselmann-its.de</a></p>
        </section>

        {/* 3. Nutzerrollen und verarbeitete Daten */}
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-base">3. Nutzerrollen und verarbeitete Daten</h2>
          <p>Kids Mindry unterscheidet folgende Nutzerrollen mit unterschiedlichen Datenkategorien:</p>
          <div className="space-y-3">
            {[
              {
                role: 'Administrator / Kita-Leitung',
                data: 'Name, E-Mail, Passwort-Hash, Rolle, Login-Zeitpunkte, IP-Adressen (Serverlogs)',
              },
              {
                role: 'Erzieherinnen / pädagogisches Personal',
                data: 'Name, E-Mail, Passwort-Hash, Rolle, Arbeitszeiterfassung (optional), Tagesberichte (Verfasser)',
              },
              {
                role: 'Erziehungsberechtigte (Eltern)',
                data: 'Name, E-Mail, Telefonnummer, Adresse, Zahlungsdaten (verschlüsselt via Stripe), SEPA-Mandat (via Stripe), Einwilligungen',
              },
              {
                role: 'Kinder (Betreuungspersonen)',
                data: 'Vorname, Nachname, Geburtsdatum, Gruppenzugehörigkeit, Anwesenheitsdaten, Tagesberichte, Meilensteine, Sprachbeobachtungen (SISMIK), Gesundheitsdaten (Allergien, Medikamente), Fotos (nur mit Einwilligung), Abholberechtigungen, Notfallkontakte',
              },
            ].map(({ role, data }) => (
              <div key={role} className="border border-gray-100 rounded-xl p-3">
                <p className="font-semibold text-gray-800 text-xs mb-1">{role}</p>
                <p className="text-xs text-gray-600">{data}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Rechtsgrundlagen */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">4. Rechtsgrundlagen der Verarbeitung</h2>
          <ul className="space-y-1 list-disc pl-5">
            <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – Vertragserfüllung (Kita-Betreuungsvertrag, SaaS-Nutzungsvertrag)</li>
            <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> – Rechtliche Verpflichtung (Unfallberichte, Buchführungspflichten gem. § 257 HGB)</li>
            <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – Berechtigtes Interesse (IT-Sicherheit, Missbrauchsprävention, Systemlogs)</li>
            <li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> – Einwilligung (Fotos von Kindern, Push-Benachrichtigungen, Newsletter)</li>
            <li><strong>Art. 9 Abs. 2 lit. h DSGVO</strong> – Gesundheitsdaten im Rahmen der Betreuung (Allergien, Medikamente)</li>
            <li><strong>Art. 8 DSGVO</strong> – Dienste der Informationsgesellschaft mit Kinderbezug: Einwilligung durch Sorgeberechtigte erforderlich</li>
          </ul>
        </section>

        {/* 5. Auftragsverarbeiter */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">5. Auftragsverarbeiter (Art. 28 DSGVO)</h2>
          <p>Mit folgenden Dienstleistern besteht oder wird ein Auftragsverarbeitungsvertrag (AVV) geschlossen:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border border-gray-200">Anbieter</th>
                  <th className="text-left p-2 border border-gray-200">Zweck</th>
                  <th className="text-left p-2 border border-gray-200">Sitz / Übermittlung</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Mittwald CM Service GmbH & Co. KG', 'Hosting, Serverinfrastruktur', 'Deutschland (Espelkamp)'],
                  ['Supabase Inc.', 'Datenbank, Authentifizierung', 'USA → EU-Region (Frankfurt), SCC'],
                  ['Stripe Inc.', 'Zahlungsabwicklung, SEPA-Lastschrift', 'USA, SCC / EU-Niederlassung'],
                  ['Anthropic PBC', 'KI-Textgenerierung (Tagesberichte, Förderanträge)', 'USA, SCC'],
                  ['Resend Inc.', 'Transaktions-E-Mails', 'USA, SCC'],
                  ['Seven Communications GmbH (sms77)', 'WhatsApp- / SMS-Benachrichtigungen', 'Deutschland'],
                  ['Zoom Video Communications Inc.', 'Videokonferenzen (Elterngespräche)', 'USA, SCC / EU-Region'],
                  ['Lexoffice (Haufe Group SE)', 'Rechnungsstellung (optional)', 'Deutschland'],
                  ['Dropbox Inc.', 'Cloud-Dokumentenspeicher (optional)', 'USA, SCC'],
                ].map(([name, zweck, sitz]) => (
                  <tr key={name} className="border-b border-gray-100">
                    <td className="p-2 border border-gray-200 font-medium">{name}</td>
                    <td className="p-2 border border-gray-200">{zweck}</td>
                    <td className="p-2 border border-gray-200">{sitz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">SCC = Standardvertragsklauseln gem. Art. 46 Abs. 2 lit. c DSGVO für Übermittlungen in Drittländer.</p>
        </section>

        {/* 6. Speicherdauer */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">6. Speicherdauer & Löschfristen</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border border-gray-200">Datenkategorie</th>
                  <th className="text-left p-2 border border-gray-200">Frist</th>
                  <th className="text-left p-2 border border-gray-200">Rechtsgrundlage</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Betreuungsunterlagen, Tagesberichte', '3 Jahre nach Austritt des Kindes', 'SGB VIII'],
                  ['Zahlungsbelege, Rechnungen', '10 Jahre', '§ 257 HGB'],
                  ['Unfallberichte', '30 Jahre', 'UV/BG-Recht'],
                  ['Fotos (mit Einwilligung)', 'Bis Widerruf, spätestens 3 Jahre nach Austritt', 'DSGVO Art. 7'],
                  ['Online-Anmeldungen (abgelehnt)', '3 Jahre', 'DSGVO Art. 5 Abs. 1 lit. e'],
                  ['Serverlogs / IP-Adressen', '90 Tage', 'Berechtigtes Interesse'],
                  ['Nutzerkonten (inaktiv)', '12 Monate nach letztem Login', 'Vertrag'],
                ].map(([kat, frist, grund]) => (
                  <tr key={kat} className="border-b border-gray-100">
                    <td className="p-2 border border-gray-200">{kat}</td>
                    <td className="p-2 border border-gray-200 font-medium">{frist}</td>
                    <td className="p-2 border border-gray-200">{grund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Besondere Kategorien */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">7. Besonders sensible Daten</h2>
          <p>Kids Mindry verarbeitet im Rahmen der Kita-Verwaltung folgende besonders schutzwürdige Datenkategorien:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Gesundheitsdaten von Kindern</strong> (Allergien, Medikamente, Erkrankungen) – Rechtsgrundlage: Art. 9 Abs. 2 lit. h DSGVO</li>
            <li><strong>Biometrische Erkennungsdaten / Fotos</strong> – nur mit ausdrücklicher schriftlicher Einwilligung der Sorgeberechtigten</li>
            <li><strong>Daten über Minderjährige</strong> – sämtliche Kinderdaten werden ausschließlich von autorisierten Einrichtungsmitarbeitern und Sorgeberechtigten eingesehen</li>
            <li><strong>Entwicklungsbeobachtungen (SISMIK)</strong> – pädagogische Dokumentation, Zugriff nur für autorisiertes Fachpersonal</li>
          </ul>
        </section>

        {/* 8. Technische Sicherheit */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">8. Technische und organisatorische Maßnahmen (TOM)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>TLS-Verschlüsselung aller Verbindungen (HTTPS)</li>
            <li>Passwort-Hashing mit bcrypt</li>
            <li>Row Level Security (RLS) in der Datenbank: Jede Einrichtung sieht nur ihre eigenen Daten</li>
            <li>Rollenbasiertes Zugriffsmodell (Admin, Erzieher, Eltern)</li>
            <li>Serverstandort Deutschland (Mittwald)</li>
            <li>Automatisches DSGVO-Löschkonzept im System implementiert</li>
            <li>Audit-Log für sicherheitsrelevante Aktionen</li>
            <li>Fehlermonitoring via Sentry (anonymisiert)</li>
          </ul>
        </section>

        {/* 9. Rechte */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">9. Ihre Rechte als Betroffene Person</h2>
          <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung / „Vergessen werden" (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            <li>Recht auf Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
          </ul>
          <p>Anfragen richten Sie an: <a href="mailto:hallo@hesselmann-its.de" className="text-brand-600">hallo@hesselmann-its.de</a></p>
        </section>

        {/* 10. Aufsichtsbehörde */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900 text-base">10. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p>Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren:</p>
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-0.5">
            <p className="font-semibold">Landesbeauftragte für Datenschutz und Informationsfreiheit NRW</p>
            <p>Postfach 20 04 44, 40102 Düsseldorf</p>
            <p>Telefon: +49 (0)211 38424-0</p>
            <p>E-Mail: <a href="mailto:poststelle@ldi.nrw.de" className="text-brand-600">poststelle@ldi.nrw.de</a></p>
            <p><a href="https://www.ldi.nrw.de" className="text-brand-600 underline" target="_blank" rel="noopener noreferrer">www.ldi.nrw.de</a></p>
          </div>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
          Hesselmann Beratung UG (haftungsbeschränkt) · Schloßstraße 184, 46535 Dinslaken ·{' '}
          <a href="/impressum" className="underline">Impressum</a>
        </p>
      </div>
    </div>
  )
}
