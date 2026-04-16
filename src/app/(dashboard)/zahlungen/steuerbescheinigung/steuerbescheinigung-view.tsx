'use client'

import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  year: number
  payments: any[]
  totalCents: number
  parentName: string
  children: { first_name: string; last_name: string; date_of_birth?: string }[]
  site: { name?: string; address?: string; city?: string; zip?: string; phone?: string; email?: string }
}

function formatEuro(cents: number) {
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

export default function SteuerbescheinigungView({
  year, payments, totalCents, parentName, children, site
}: Props) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center justify-between gap-3">
        <Link href="/zahlungen" className="text-xs text-brand-600">← Zahlungen</Link>
        <div className="flex gap-2">
          {[currentYear - 1, currentYear - 2, currentYear - 3].map(y => (
            <Link
              key={y}
              href={`?year=${y}`}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                y === year ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700"
        >
          <Printer size={15} /> Als PDF speichern
        </button>
      </div>

      {/* Certificate — styled for print */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 print:border-0 print:shadow-none print:p-0 space-y-6">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Bestätigung</p>
          <h1 className="text-2xl font-bold text-gray-900">Betreuungskostenbescheinigung</h1>
          <p className="text-base text-gray-600 mt-1">für das Steuerjahr {year}</p>
        </div>

        {/* Kita info */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Einrichtung</p>
            <p className="font-semibold text-gray-900">{site.name ?? 'Kindertagesstätte'}</p>
            {site.address && <p className="text-gray-600">{site.address}</p>}
            {(site.zip || site.city) && <p className="text-gray-600">{site.zip} {site.city}</p>}
            {site.phone && <p className="text-gray-500 text-xs mt-1">Tel: {site.phone}</p>}
            {site.email && <p className="text-gray-500 text-xs">{site.email}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Elternteil</p>
            <p className="font-semibold text-gray-900">{parentName || '–'}</p>
            {children.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Betreute Kinder</p>
                {children.map((c, i) => (
                  <p key={i} className="text-gray-600">
                    {c.first_name} {c.last_name}
                    {c.date_of_birth && <span className="text-gray-400 text-xs ml-1">
                      (* {new Date(c.date_of_birth).toLocaleDateString('de-DE')})
                    </span>}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legal text */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900">
          <p>
            Hiermit wird bestätigt, dass für die Betreuung in der oben genannten Kindertageseinrichtung
            im Kalenderjahr <strong>{year}</strong> folgende Beträge entrichtet wurden.
            Diese Ausgaben können gemäß § 10 Abs. 1 Nr. 5 EStG als Sonderausgaben geltend gemacht werden
            (2/3 der Kosten, max. 4.000 € je Kind).
          </p>
        </div>

        {/* Payments table */}
        {payments.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Einzelaufstellung</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Bezeichnung</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Datum</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">{p.payment_items?.title ?? 'Betreuungsbeitrag'}</td>
                    <td className="py-2 text-right text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {formatEuro(p.payment_items?.amount_cents ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900">
                  <td className="py-3 font-bold text-gray-900" colSpan={2}>Gesamtbetrag {year}</td>
                  <td className="py-3 text-right font-bold text-gray-900 text-base">{formatEuro(totalCents)}</td>
                </tr>
                <tr>
                  <td className="pb-2 text-xs text-gray-500" colSpan={2}>
                    Davon steuerlich absetzbar (2/3, max. 4.000 €):
                  </td>
                  <td className="pb-2 text-right text-xs text-gray-500">
                    {formatEuro(Math.min(Math.round(totalCents * 2/3), 400000))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Keine Zahlungen für {year} gefunden.</p>
          </div>
        )}

        {/* Signature area */}
        <div className="grid grid-cols-2 gap-8 pt-4 mt-4 border-t border-gray-200">
          <div>
            <div className="h-16 border-b border-gray-400 mb-1"></div>
            <p className="text-xs text-gray-500">Datum, Stempel & Unterschrift der Einrichtung</p>
          </div>
          <div>
            <div className="h-16 border-b border-gray-400 mb-1"></div>
            <p className="text-xs text-gray-500">Ausgestellt am {new Date().toLocaleDateString('de-DE')}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">
          Diese Bescheinigung wurde automatisch durch KitaHub erstellt.
          Bei Fragen wenden Sie sich bitte an die Einrichtung.
        </p>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:p-0, .print\\:p-0 * { visibility: visible; }
          .print\\:p-0 { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
