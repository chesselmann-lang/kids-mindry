import type { Metadata } from 'next'
import { FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Allgemeine Geschäftsbedingungen | KitaHub' }

export default function AgbPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <FileText size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allgemeine Geschäftsbedingungen</h1>
          <p className="text-sm text-gray-400">Stand: April 2026</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        Diese AGB gelten für die Nutzung der KitaHub-Plattform (kids.mindry.de) durch Kindertageseinrichtungen und deren Mitarbeiter:innen sowie Erziehungsberechtigte.
      </div>

      <div className="space-y-4 text-sm text-gray-700">

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 1 Geltungsbereich und Anbieter</h2>
          <p>(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Nutzungsverträge über die Nutzung der Software-as-a-Service-Plattform „KitaHub" (im Folgenden „Plattform"), die zwischen der Hesselmann Beratung UG (haftungsbeschränkt) (im Folgenden „Anbieter") und Kindertageseinrichtungen oder anderen Betreuungseinrichtungen (im Folgenden „Auftraggeber") geschlossen werden.</p>
          <p>(2) Maßgeblich ist die jeweils zum Zeitpunkt des Vertragsschlusses gültige Fassung der AGB.</p>
          <p>(3) Abweichende Bedingungen des Auftraggebers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 2 Leistungsgegenstand</h2>
          <p>(1) Der Anbieter stellt dem Auftraggeber eine webbasierte Software-Plattform zur Verwaltung von Kindertageseinrichtungen zur Verfügung. Der Funktionsumfang umfasst insbesondere:</p>
          <ul className="space-y-1 ml-4 text-gray-600">
            <li>• Digitale Anwesenheitserfassung</li>
            <li>• Kommunikationsfunktionen (Direktnachrichten, Gruppenankündigungen)</li>
            <li>• Tagesberichte und Dokumentation der Kindesentwicklung</li>
            <li>• Kalender- und Veranstaltungsverwaltung</li>
            <li>• Personalplanung und Zeiterfassung</li>
            <li>• Dateiverwaltung und Portfolio-Funktion</li>
            <li>• Gebührenübersicht und Verwaltungsfunktionen</li>
          </ul>
          <p>(2) Der genaue Leistungsumfang ergibt sich aus der jeweils gebuchten Leistungsstufe (Tarif). Der Anbieter ist berechtigt, den Funktionsumfang weiterzuentwickeln und zu erweitern.</p>
          <p>(3) Die Plattform wird als Progressive Web App und ggf. als native App bereitgestellt. Eine Verfügbarkeit von 99 % im Jahresmittel wird angestrebt (kein rechtlich verbindliches SLA in der kostenfreien Phase).</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 3 Vertragsschluss und Nutzungsberechtigung</h2>
          <p>(1) Der Vertrag kommt durch Registrierung des Auftraggebers und Freischaltung des Accounts durch den Anbieter zustande.</p>
          <p>(2) Berechtigt zur Nutzung sind: Mitarbeiter:innen der Einrichtung (mit vom Auftraggeber zugewiesenen Zugangsdaten) sowie Erziehungsberechtigte der betreuten Kinder (auf Einladung).</p>
          <p>(3) Der Auftraggeber stellt sicher, dass Zugangsdaten nicht an unbefugte Dritte weitergegeben werden.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 4 Pflichten des Auftraggebers</h2>
          <p>(1) Der Auftraggeber ist verpflichtet, die Plattform nur im Einklang mit dem geltenden Recht zu nutzen, insbesondere den Vorschriften des Datenschutzes (DSGVO, BDSG, Landesdatenschutzgesetze).</p>
          <p>(2) Vor der produktiven Nutzung ist ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO mit dem Anbieter abzuschließen.</p>
          <p>(3) Der Auftraggeber ist für die Einholung der erforderlichen Einwilligungen der Erziehungsberechtigten (insbesondere für die Verarbeitung von Kinderdaten und Fotos) verantwortlich.</p>
          <p>(4) Der Auftraggeber stellt sicher, dass hochgeladene Inhalte keine Rechte Dritter verletzen und nicht gegen geltendes Recht verstoßen.</p>
          <p>(5) Der Auftraggeber benennt einen internen Datenschutzansprechpartner (bei Pflicht: Datenschutzbeauftragten) und teilt dessen Kontaktdaten dem Anbieter mit.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 5 Vergütung</h2>
          <p>(1) Die Vergütung richtet sich nach dem jeweils aktuellen Preismodell des Anbieters. Die aktuellen Preise sind auf der Website des Anbieters einsehbar.</p>
          <p>(2) In der aktuellen Pilot-Phase (bis auf Weiteres) wird die Plattform kostenlos zur Verfügung gestellt. Der Anbieter behält sich vor, nach Ablauf der Pilotphase auf ein entgeltliches Modell umzustellen. Der Auftraggeber wird hierüber mindestens 30 Tage im Voraus informiert.</p>
          <p>(3) Alle Preise verstehen sich zzgl. der gesetzlichen Umsatzsteuer.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 6 Laufzeit und Kündigung</h2>
          <p>(1) Der Vertrag wird auf unbestimmte Zeit geschlossen.</p>
          <p>(2) Beide Parteien können den Vertrag mit einer Frist von 30 Tagen zum Monatsende ordentlich kündigen. Die Kündigung ist in Textform (E-Mail an hallo@hesselmann-service.de) zu erklären.</p>
          <p>(3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
          <p>(4) Nach Vertragsende werden die Daten des Auftraggebers 30 Tage aufbewahrt, danach endgültig gelöscht. Der Auftraggeber hat die Möglichkeit, einen Datenexport vor Vertragsende zu veranlassen.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 7 Haftung</h2>
          <p>(1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzlich oder grob fahrlässig verursachte Schäden.</p>
          <p>(2) Im Übrigen ist die Haftung des Anbieters auf den vertragstypisch vorhersehbaren Schaden begrenzt.</p>
          <p>(3) Der Anbieter haftet nicht für Datenverluste, die durch fehlerhafte Bedienung oder mangelnde Datensicherung seitens des Auftraggebers entstehen. Regelmäßige Datensicherungen werden durch den Anbieter durchgeführt, ersetzen jedoch keine eigenverantwortliche Datensicherung des Auftraggebers.</p>
          <p>(4) Die Haftung für mittelbare Schäden, entgangenen Gewinn oder Datenverlust ist – soweit gesetzlich zulässig – ausgeschlossen.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 8 Datenschutz und Auftragsverarbeitung</h2>
          <p>(1) Die Parteien verpflichten sich, die anwendbaren Datenschutzvorschriften einzuhalten.</p>
          <p>(2) Soweit der Anbieter personenbezogene Daten im Auftrag des Auftraggebers verarbeitet, schließen die Parteien einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO ab. Dieser ist Bestandteil des Nutzungsvertrags.</p>
          <p>(3) Die Datenschutzerklärung des Anbieters ist unter kids.mindry.de/datenschutzerklaerung abrufbar.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 9 Nutzungsrechte an der Software</h2>
          <p>Der Anbieter räumt dem Auftraggeber für die Dauer des Vertrags ein einfaches, nicht übertragbares, nicht unterlizenzierbares Recht zur Nutzung der Plattform für die internen Zwecke seiner Einrichtung ein. Jede darüber hinausgehende Nutzung, insbesondere die Vervielfältigung, das Reverse Engineering oder die Weitergabe an Dritte, ist untersagt.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 10 Änderungen der AGB</h2>
          <p>Der Anbieter ist berechtigt, diese AGB mit einer Ankündigungsfrist von mindestens 30 Tagen zu ändern. Die Änderungen werden dem Auftraggeber per E-Mail und/oder über eine Benachrichtigung in der App mitgeteilt. Widerspricht der Auftraggeber nicht innerhalb von 30 Tagen nach Erhalt der Änderungsmitteilung, gilt die Änderung als angenommen.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">§ 11 Schlussbestimmungen</h2>
          <p>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</p>
          <p>(2) Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters.</p>
          <p>(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht.</p>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">Stand: April 2026 · Hesselmann Beratung UG (haftungsbeschränkt)</p>
      </div>
    </div>
  )
}
