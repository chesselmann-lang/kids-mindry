import type { Metadata } from 'next'
import { Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Datenschutzerklärung | KitaHub' }

export default function DatenschutzerklaerungPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Shield size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datenschutzerklärung</h1>
          <p className="text-sm text-gray-400">Stand: April 2026</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">1. Verantwortlicher</h2>
          <p>
            Verantwortlicher für die Verarbeitung personenbezogener Daten im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-semibold">Hesselmann Beratung UG (haftungsbeschränkt)</p>
            <p>Vertreten durch: Christian Hesselmann</p>
            <p>E-Mail: datenschutz@hesselmann-service.de</p>
            <p>Web: kids.mindry.de</p>
          </div>
          <p>
            Als Auftragsverarbeiter gemäß Art. 28 DSGVO verarbeitet die Hesselmann Beratung UG personenbezogene Daten im Auftrag der jeweiligen Kindertageseinrichtung (Verantwortlicher im Sinne der DSGVO). Zwischen der Hesselmann Beratung UG und jeder Kita wird ein Auftragsverarbeitungsvertrag (AVV) abgeschlossen.
          </p>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">2. Welche Daten werden verarbeitet?</h2>
          <p>KitaHub verarbeitet folgende Kategorien personenbezogener Daten:</p>
          <div className="space-y-3">
            <div className="border-l-2 border-brand-200 pl-4">
              <p className="font-semibold text-gray-800">Nutzerdaten (Erzieher:innen, Eltern, Kitaleitungen)</p>
              <p className="text-gray-500">Vollständiger Name, E-Mail-Adresse, Telefonnummer, Profilbild (optional), Sprache, Rolle in der Einrichtung</p>
            </div>
            <div className="border-l-2 border-green-200 pl-4">
              <p className="font-semibold text-gray-800">Kinderdaten (besondere Kategorien gem. Art. 9 DSGVO)</p>
              <p className="text-gray-500">Vorname, Nachname, Geburtsdatum, Geschlecht, Profilfoto (optional), Allergien und Unverträglichkeiten, medizinische Hinweise, Anwesenheitszeiten, Tagesberichte (Stimmung, Aktivitäten, Schlaf, Mahlzeiten), Fotos aus dem Kita-Alltag, Meilensteine der Entwicklung, Portfolio-Einträge, Schlafzeiten, Hygieneprotokolle</p>
            </div>
            <div className="border-l-2 border-amber-200 pl-4">
              <p className="font-semibold text-gray-800">Kommunikationsdaten</p>
              <p className="text-gray-500">Nachrichten zwischen Eltern und Kita-Personal, Feed-Beiträge und -Reaktionen, Benachrichtigungseinstellungen</p>
            </div>
            <div className="border-l-2 border-purple-200 pl-4">
              <p className="font-semibold text-gray-800">Nutzungsdaten</p>
              <p className="text-gray-500">Login-Zeitpunkte, IP-Adresse (in Supabase Auth-Logs), Browser-Benachrichtigungs-Subscriptions (Push-Endpoint)</p>
            </div>
          </div>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">3. Rechtsgrundlagen der Verarbeitung</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Art. 6 Abs. 1 lit. b DSGVO</span> (Vertragserfüllung): Verarbeitung von Nutzerdaten zur Bereitstellung der KitaHub-Dienste.</p>
            <p><span className="font-semibold">Art. 6 Abs. 1 lit. c DSGVO</span> (Rechtliche Verpflichtung): Dokumentationspflichten gem. SGB VIII und Landesgesetzen zur Kindertagesbetreuung.</p>
            <p><span className="font-semibold">Art. 6 Abs. 1 lit. f DSGVO</span> (Berechtigte Interessen): Betrieb des sicheren Systems, Fehlerbehebung, Systemsicherheit.</p>
            <p><span className="font-semibold">Art. 9 Abs. 2 lit. a DSGVO</span> (Einwilligung bei besonderen Datenkategorien): Für Fotos von Kindern wird eine ausdrückliche Einwilligung der Erziehungsberechtigten eingeholt. Die Einwilligung kann jederzeit widerrufen werden.</p>
          </div>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">4. Speicherung & technische Infrastruktur</h2>
          <div className="bg-green-50 rounded-xl p-4 flex gap-3">
            <Shield size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Serverstandort: ausschließlich Deutschland</p>
              <p className="text-green-700 text-xs mt-1">Alle Daten werden auf Servern der Mittwald CM Service GmbH & Co. KG (Kiel, Deutschland) und der Supabase BV (EU-Region Frankfurt) gespeichert. Es findet kein Datentransfer in Drittländer außerhalb der EU/EWR statt.</p>
            </div>
          </div>
          <p>Die Übertragung aller Daten erfolgt ausschließlich verschlüsselt über HTTPS (TLS 1.3). Passwörter werden niemals im Klartext gespeichert (bcrypt-Hashing). Datenbankzugriffe sind durch Row Level Security (RLS) abgesichert – jeder Nutzer sieht ausschließlich seine eigenen Daten.</p>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">5. Weitergabe an Dritte</h2>
          <p>Personenbezogene Daten werden nicht an Dritte verkauft oder zu Werbezwecken weitergegeben. Eine Weitergabe erfolgt ausschließlich an folgende Auftragsverarbeiter, die ihrerseits DSGVO-konform handeln:</p>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-semibold text-sm">Mittwald CM Service GmbH & Co. KG</p>
                <p className="text-xs text-gray-400">Web-Hosting, Server-Infrastruktur</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Deutschland</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-semibold text-sm">Supabase BV</p>
                <p className="text-xs text-gray-400">Datenbank, Authentifizierung, Datei-Speicherung</p>
              </div>
              <span className="text-xs text-green-600 font-medium">EU (Frankfurt)</span>
            </div>
          </div>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">6. Speicherdauer</h2>
          <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist:</p>
          <ul className="space-y-1">
            <li>• Nutzerdaten (Eltern, Erzieher:innen): Bis zur Kündigung des Accounts, danach 30 Tage Aufbewahrungsfrist für Backup-Zwecke</li>
            <li>• Kinderdaten: 6 Monate nach dem regulären Austritt des Kindes aus der Einrichtung, dann automatische Anonymisierung</li>
            <li>• Kommunikationsdaten: Nachrichten werden 24 Monate nach dem Senden gespeichert</li>
            <li>• Gesetzlich aufbewahrungspflichtige Dokumente (z.B. Unfallberichte): gemäß gesetzlicher Aufbewahrungsfristen (ggf. bis 10 Jahre)</li>
          </ul>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">7. Ihre Rechte</h2>
          <p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Auskunftsrecht', 'Art. 15 DSGVO'],
              ['Berichtigungsrecht', 'Art. 16 DSGVO'],
              ['Löschungsrecht', 'Art. 17 DSGVO'],
              ['Einschränkung der Verarbeitung', 'Art. 18 DSGVO'],
              ['Datenübertragbarkeit', 'Art. 20 DSGVO'],
              ['Widerspruchsrecht', 'Art. 21 DSGVO'],
            ].map(([right, article]) => (
              <div key={right} className="bg-gray-50 rounded-xl p-3">
                <p className="font-semibold text-sm text-gray-800">{right}</p>
                <p className="text-xs text-brand-600">{article}</p>
              </div>
            ))}
          </div>
          <p>Zur Ausübung Ihrer Rechte wenden Sie sich an: <a href="mailto:datenschutz@hesselmann-service.de" className="text-brand-600 underline">datenschutz@hesselmann-service.de</a></p>
          <p className="text-xs text-gray-500">Sie haben zudem das Recht, sich bei der zuständigen Datenschutzbehörde zu beschweren. Zuständig ist der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI), Graurheindorfer Str. 153, 53117 Bonn.</p>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">8. Einwilligungen & Widerruf</h2>
          <p>Soweit Datenverarbeitungen auf einer Einwilligung beruhen (insbesondere Fotos von Kindern), können Sie diese Einwilligung jederzeit ohne Angabe von Gründen widerrufen. Den Widerruf können Sie innerhalb der App unter <span className="font-semibold">Einwilligungen</span> oder per E-Mail an uns durchführen. Der Widerruf berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.</p>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">9. Cookies & Tracking</h2>
          <p>KitaHub verwendet <span className="font-semibold text-green-700">keine Tracking-Cookies</span>, keine Google Analytics, kein Facebook Pixel und keine sonstigen Marketing-Tracker. Es werden technisch notwendige Sitzungs-Cookies für die Authentifizierung verwendet (Supabase Auth Session).</p>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">10. Push-Benachrichtigungen</h2>
          <p>Wenn Sie Browser-Benachrichtigungen aktivieren, wird ein Push-Abonnement-Endpunkt in unserer Datenbank gespeichert. Dieser wird verwendet, um Benachrichtigungen über relevante Ereignisse (neue Nachrichten, Tagesberichte) zu übermitteln. Das Abonnement kann jederzeit in den App-Einstellungen oder in den Browser-Einstellungen widerrufen werden.</p>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">11. Änderungen dieser Datenschutzerklärung</h2>
          <p>Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen der Rechtslage oder des Leistungsumfangs anzupassen. Die aktuelle Fassung ist stets in der App unter diesem Link abrufbar. Bei wesentlichen Änderungen werden wir die Nutzer über die App informieren.</p>
          <p className="text-xs text-gray-400">Zuletzt aktualisiert: April 2026</p>
        </section>

      </div>
    </div>
  )
}
