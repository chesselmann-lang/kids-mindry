'use client'

import { Building2, Users, Euro, Bell, TrendingUp, ChevronRight, MapPin } from 'lucide-react'

interface Kita {
  id: string
  name: string
  city: string | null
  max_children: number | null
  created_at: string
}

interface KitaStats {
  kinder: number
  offeneZahlungen: number
  offenerBetrag: number
  neueMitteilungen: number
}

interface Props {
  kitas: Kita[]
  statsMap: Record<string, KitaStats>
}

export default function TraegerClient({ kitas, statsMap }: Props) {
  const totals = {
    kinder: kitas.reduce((s, k) => s + (statsMap[k.id]?.kinder ?? 0), 0),
    offenerBetrag: kitas.reduce((s, k) => s + (statsMap[k.id]?.offenerBetrag ?? 0), 0),
    offeneZahlungen: kitas.reduce((s, k) => s + (statsMap[k.id]?.offeneZahlungen ?? 0), 0),
    mitteilungen: kitas.reduce((s, k) => s + (statsMap[k.id]?.neueMitteilungen ?? 0), 0),
  }

  const auslastung = (kita: Kita) => {
    if (!kita.max_children) return null
    const kids = statsMap[kita.id]?.kinder ?? 0
    return Math.round(kids / kita.max_children * 100)
  }

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Träger-Dashboard</h1>
        <p className="text-sm text-gray-400">{kitas.length} Einrichtungen im Überblick</p>
      </div>

      {/* Gesamt-KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Users, label: 'Kinder gesamt', value: totals.kinder, color: 'bg-blue-50 text-blue-600' },
          { icon: Building2, label: 'Einrichtungen', value: kitas.length, color: 'bg-purple-50 text-purple-600' },
          { icon: Euro, label: 'Offene Beiträge', value: `${(totals.offenerBetrag/100).toLocaleString('de-DE')} €`, color: 'bg-amber-50 text-amber-600' },
          { icon: Bell, label: 'Mitteilungen (30T)', value: totals.mitteilungen, color: 'bg-green-50 text-green-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18}/>
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kita-Liste */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Einrichtungen</p>
        <div className="space-y-3">
          {kitas.map(kita => {
            const stats = statsMap[kita.id] ?? { kinder: 0, offeneZahlungen: 0, offenerBetrag: 0, neueMitteilungen: 0 }
            const auslas = auslastung(kita)
            return (
              <div key={kita.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{kita.name}</p>
                    {kita.city && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11}/>{kita.city}
                      </p>
                    )}
                  </div>
                  {auslas !== null && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      auslas >= 95 ? 'bg-red-50 text-red-600' :
                      auslas >= 80 ? 'bg-green-50 text-green-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {auslas}% belegt
                    </span>
                  )}
                </div>

                {/* Auslastungsbalken */}
                {auslas !== null && kita.max_children && (
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        auslas >= 95 ? 'bg-red-400' : auslas >= 80 ? 'bg-green-400' : 'bg-amber-400'
                      }`} style={{ width: `${Math.min(auslas, 100)}%` }}/>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{stats.kinder} / {kita.max_children} Plätze</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-400">Kinder</p>
                    <p className="font-bold text-gray-900 text-sm">{stats.kinder}</p>
                  </div>
                  <div className={`rounded-xl p-2 ${stats.offeneZahlungen > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">Offen</p>
                    <p className={`font-bold text-sm ${stats.offeneZahlungen > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                      {stats.offeneZahlungen > 0 ? `${(stats.offenerBetrag/100).toLocaleString('de-DE')} €` : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-400">Mitteilungen</p>
                    <p className="font-bold text-gray-900 text-sm">{stats.neueMitteilungen}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Schnellaktionen */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Träger-Aktionen</p>
        <div className="space-y-2">
          {[
            { href: '/admin/foerderantrag', label: 'KI-Förderantrag erstellen', sub: 'KiBiz, Investition, Digitalisierung' },
            { href: '/zahlungen/bescheide', label: 'Monatsbescheide versenden', sub: 'Elternbeiträge für alle Einrichtungen' },
            { href: '/admin/integrationen', label: 'Integrationen verwalten', sub: 'Zoom, Lexoffice, Google Drive' },
          ].map(a => (
            <a key={a.href} href={a.href} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <TrendingUp size={18} className="text-brand-600 flex-shrink-0"/>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                <p className="text-xs text-gray-400">{a.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300"/>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
