'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, Video, FileText, Cloud, CheckCircle2, XCircle,
  ExternalLink, Copy, ChevronRight, Loader2, AlertCircle, Download
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  connectUrl?: string
  connected?: boolean
  email?: string
  action?: () => void
  docs?: string
}

interface Props {
  zoomConnected: boolean
  zoomEmail?: string
  lexofficeConfigured: boolean
}

export default function IntegrationsClient({ zoomConnected, zoomEmail, lexofficeConfigured }: Props) {
  const [icalUrls, setIcalUrls] = useState<{ url?: string; googleUrl?: string; outlookUrl?: string } | null>(null)
  const [loadingIcal, setLoadingIcal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadIcalUrl = async () => {
    setLoadingIcal(true)
    try {
      const res = await fetch('/api/ical/subscribe')
      const data = await res.json()
      if (data.url) {
        setIcalUrls(data)
      } else {
        // Create new token
        const res2 = await fetch('/api/ical/subscribe', { method: 'POST' })
        const data2 = await res2.json()
        setIcalUrls(data2)
      }
    } finally {
      setLoadingIcal(false)
    }
  }

  const copyIcalUrl = async () => {
    if (!icalUrls?.url) return
    await navigator.clipboard.writeText(icalUrls.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Link kopiert!')
  }

  const integrations: {
    section: string
    items: {
      id: string
      name: string
      description: string
      iconBg: string
      icon: React.ReactNode
      connected?: boolean
      email?: string
      actions: { label: string; href?: string; onClick?: () => void; variant?: 'primary' | 'secondary' }[]
    }[]
  }[] = [
    {
      section: 'Kalender',
      items: [
        {
          id: 'ical',
          name: 'Kalender abonnieren',
          description: 'Alle Kita-Termine direkt in Google Kalender, Apple Kalender oder Outlook anzeigen',
          iconBg: 'bg-blue-100',
          icon: <Calendar size={22} className="text-blue-600" />,
          connected: !!icalUrls?.url,
          actions: icalUrls?.url
            ? [
                {
                  label: 'Google Kalender',
                  href: icalUrls.googleUrl,
                  variant: 'secondary' as const,
                },
                {
                  label: 'Outlook',
                  href: icalUrls.outlookUrl,
                  variant: 'secondary' as const,
                },
                {
                  label: copied ? 'Kopiert ✓' : 'Link kopieren',
                  onClick: copyIcalUrl,
                  variant: 'secondary' as const,
                },
              ]
            : [
                {
                  label: loadingIcal ? 'Lade...' : 'Kalender-Link erstellen',
                  onClick: loadIcalUrl,
                  variant: 'primary' as const,
                },
              ],
        },
      ],
    },
    {
      section: 'Video-Meetings',
      items: [
        {
          id: 'zoom',
          name: 'Zoom',
          description: 'Elterngespräche & Teambesprechungen direkt aus KitaHub heraus starten',
          iconBg: 'bg-sky-100',
          icon: <Video size={22} className="text-sky-600" />,
          connected: zoomConnected,
          email: zoomEmail,
          actions: zoomConnected
            ? [{ label: 'Verbunden ✓', variant: 'secondary' as const, onClick: () => {} }]
            : [{ label: 'Zoom verbinden', href: '/api/zoom/connect', variant: 'primary' as const }],
        },
      ],
    },
    {
      section: 'Buchhaltung',
      items: [
        {
          id: 'lexoffice',
          name: 'Lexoffice',
          description: 'Rechnungen automatisch aus Zahlungsposten erstellen und versenden',
          iconBg: 'bg-green-100',
          icon: <FileText size={22} className="text-green-600" />,
          connected: lexofficeConfigured,
          actions: lexofficeConfigured
            ? [{ label: 'Konfiguriert ✓', variant: 'secondary' as const, onClick: () => {} }]
            : [
                {
                  label: 'API-Key hinterlegen',
                  href: 'https://app.lexoffice.de/addons/public-api',
                  variant: 'secondary' as const,
                },
              ],
        },
      ],
    },
    {
      section: 'Cloud-Speicher',
      items: [
        {
          id: 'dropbox',
          name: 'Dropbox',
          description: 'Zusätzlich zu Google Drive und OneDrive — alle Kita-Dokumente in Dropbox',
          iconBg: 'bg-indigo-100',
          icon: <Cloud size={22} className="text-indigo-600" />,
          actions: [{ label: 'Dropbox verbinden', href: '/api/docs/dropbox/connect', variant: 'primary' as const }],
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrationen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Verbinde KitaHub mit deinen Lieblingsdiensten</p>
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      {integrations.map(section => (
        <div key={section.section} className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
            {section.section}
          </h2>
          {section.items.map(item => (
            <div key={item.id} className="card p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {item.connected && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 size={12} />
                        Verbunden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                  {item.email && (
                    <p className="text-xs text-gray-400 mt-1">Konto: {item.email}</p>
                  )}
                </div>
              </div>

              {/* iCal URL display */}
              {item.id === 'ical' && icalUrls?.url && (
                <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-600 break-all select-all">
                  {icalUrls.url}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {item.actions.map((action, i) => (
                  action.href
                    ? (
                      <a
                        key={i}
                        href={action.href}
                        target={action.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          action.variant === 'primary'
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {action.label}
                        {action.href.startsWith('http') && <ExternalLink size={12} />}
                      </a>
                    )
                    : (
                      <button
                        key={i}
                        onClick={action.onClick}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          action.variant === 'primary'
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {action.label}
                      </button>
                    )
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* DATEV Export */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
          Export & Buchhaltung
        </h2>
        <DatevExportCard />
      </div>

      {/* Not yet available section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
          Bald verfügbar
        </h2>
        {[
          { name: 'Nextcloud', description: 'Datenschutz-konformer Self-Hosted Cloud-Speicher' },
          { name: 'sevDesk', description: 'Alternative zu Lexoffice für Buchhaltung' },
        ].map(item => (
          <div key={item.name} className="card p-4 flex items-center gap-4 opacity-60">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-700">{item.name}</p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Demnächst</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- DATEV Export Card ----
function DatevExportCard() {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]
  const [year, setYear] = useState(currentYear)
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/datev-export?year=${year}`)
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `EXTF_Buchungsstapel_${year}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export konnte nicht erstellt werden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <FileText size={22} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">DATEV-Export</p>
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verfügbar</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            EXTF-Buchungsstapel für DATEV, Lexware und andere Buchhaltungsprogramme. Direkter Import beim Steuerberater.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    y === year
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {loading ? 'Wird erstellt…' : `${year} herunterladen`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
