import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Impressum | KitaHub' }

export default function ImpressumPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Building2 size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impressum</h1>
          <p className="text-sm text-gray-400">Angaben gemäß § 5 TMG</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-gray-700">

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Anbieter</h2>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">Hesselmann Beratung UG (haftungsbeschränkt)</p>
            <p>Vertreten durch: Christian Hesselmann (Geschäftsführer)</p>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Kontakt</h2>
          <div className="space-y-1">
            <p>E-Mail: <a href="mailto:hallo@hesselmann-service.de" className="text-brand-600 underline">hallo@hesselmann-service.de</a></p>
            <p>Web: <a href="https://kids.mindry.de" className="text-brand-600 underline">kids.mindry.de</a></p>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Registrierung</h2>
          <div className="space-y-1">
            <p>Registergericht: Amtsgericht Münster</p>
            <p>Registernummer: (HRB – bitte eintragen)</p>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: (bitte eintragen)</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Verantwortlicher für den Inhalt (§ 55 Abs. 2 RStV)</h2>
          <p>Christian Hesselmann</p>
          <p className="text-xs text-gray-400">(Adresse auf Anfrage gemäß § 13 Abs. 6 TMG)</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Haftungsausschluss</h2>
          <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
            <p><span className="font-semibold">Haftung für Inhalte:</span> Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
            <p><span className="font-semibold">Haftung für Links:</span> Unser Angebot enthält Links zu externen Webseiten Dritter. Auf deren Inhalte haben wir keinen Einfluss. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>
            <p><span className="font-semibold">Urheberrecht:</span> Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-base">Hosting</h2>
          <div className="space-y-1 text-xs text-gray-500">
            <p>Diese App wird gehostet bei:</p>
            <p className="font-semibold text-gray-700">Mittwald CM Service GmbH & Co. KG</p>
            <p>Königsberger Straße 4–6</p>
            <p>32339 Espelkamp</p>
            <p>Deutschland</p>
          </div>
          <p className="text-xs text-gray-400">Alle Daten werden auf Servern in Deutschland gespeichert und verarbeitet.</p>
        </div>

      </div>
    </div>
  )
}
