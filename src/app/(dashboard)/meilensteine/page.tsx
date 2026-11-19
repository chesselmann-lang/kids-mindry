'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star, CheckCircle2, Clock, AlertCircle, ChevronRight,
  Baby, Filter, Search, BarChart3, TrendingUp, Info,
  BookOpen, Puzzle, Heart, Music, Dumbbell, Globe,
} from 'lucide-react'

// ── Entwicklungsmeilensteine Übersicht ───────────────────────────────────────
// Gruppenübergreifende Meilenstein-Übersicht aller Kinder
// Entwicklungsbereiche: Motorik, Sprache, Kognition, Sozial-Emotional, Kreativität

type Bereich = 'motorik' | 'sprache' | 'kognition' | 'sozial' | 'kreativitaet' | 'alltagskompetenz'
type Status = 'erreicht' | 'in_fortschritt' | 'beobachten' | 'foerderung'

interface Meilenstein {
  id: string
  titel: string
  bereich: Bereich
  alterMin: number  // months
  alterMax: number
  beschreibung: string
}

interface KindStatus {
  id: string
  name: string
  gruppe: string
  alter: number   // months
  gebDatum: string
  meilensteine: Record<string, Status>
  foerdernotiz?: string
}

const BEREICHE: Record<Bereich, { label: string; icon: typeof Star; color: string; bg: string }> = {
  motorik:          { label: 'Motorik',          icon: Dumbbell, color: 'text-blue-700',   bg: 'bg-blue-50'   },
  sprache:          { label: 'Sprache',           icon: BookOpen, color: 'text-green-700',  bg: 'bg-green-50'  },
  kognition:        { label: 'Kognition',         icon: Puzzle,   color: 'text-purple-700', bg: 'bg-purple-50' },
  sozial:           { label: 'Sozial-Emotional',  icon: Heart,    color: 'text-pink-700',   bg: 'bg-pink-50'   },
  kreativitaet:     { label: 'Kreativität',       icon: Music,    color: 'text-orange-700', bg: 'bg-orange-50' },
  alltagskompetenz: { label: 'Alltagskompetenz',  icon: Globe,    color: 'text-teal-700',   bg: 'bg-teal-50'   },
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  erreicht:       { label: 'Erreicht',       color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle2 },
  in_fortschritt: { label: 'In Entwicklung', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Clock        },
  beobachten:     { label: 'Beobachten',     color: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertCircle  },
  foerderung:     { label: 'Förderung nötig',color: 'text-red-700',    bg: 'bg-red-100',    icon: AlertCircle  },
}

const MEILENSTEINE: Meilenstein[] = [
  // Motorik
  { id: 'ms-01', titel: 'Schere richtig halten',    bereich: 'motorik',   alterMin: 36, alterMax: 54, beschreibung: 'Schere korrekt halten und einfache Linien schneiden' },
  { id: 'ms-02', titel: 'Einbeinig hüpfen',         bereich: 'motorik',   alterMin: 42, alterMax: 60, beschreibung: 'Auf einem Bein mehrfach hüpfen können' },
  { id: 'ms-03', titel: 'Ball fangen',              bereich: 'motorik',   alterMin: 30, alterMax: 48, beschreibung: 'Geworfenen Ball mit beiden Händen fangen' },
  { id: 'ms-04', titel: 'Knöpfe öffnen/schließen', bereich: 'motorik',   alterMin: 36, alterMax: 54, beschreibung: 'Große Knöpfe selbstständig öffnen und schließen' },
  // Sprache
  { id: 'ms-05', titel: 'Silben klatschen',         bereich: 'sprache',   alterMin: 36, alterMax: 54, beschreibung: 'Wörter in Silben zerlegen und mitklatschen' },
  { id: 'ms-06', titel: 'Reimwörter finden',        bereich: 'sprache',   alterMin: 42, alterMax: 60, beschreibung: 'Einfache Reimwörter zu einem Wort nennen' },
  { id: 'ms-07', titel: 'Geschichte nacherzählen',  bereich: 'sprache',   alterMin: 48, alterMax: 66, beschreibung: 'Kurze Geschichte mit Anfang-Mitte-Ende nacherzählen' },
  // Kognition
  { id: 'ms-08', titel: 'Zählen bis 10',            bereich: 'kognition', alterMin: 36, alterMax: 54, beschreibung: 'Sicher bis 10 zählen und Mengen zuordnen' },
  { id: 'ms-09', titel: 'Farben benennen',          bereich: 'kognition', alterMin: 24, alterMax: 42, beschreibung: '6+ Grundfarben korrekt benennen' },
  { id: 'ms-10', titel: 'Puzzle (20 Teile)',         bereich: 'kognition', alterMin: 42, alterMax: 60, beschreibung: '20-teiliges Puzzle selbstständig legen' },
  // Sozial-Emotional
  { id: 'ms-11', titel: 'Konflikte lösen',          bereich: 'sozial',    alterMin: 42, alterMax: 66, beschreibung: 'Streitsituationen verbal lösen ohne Erwachsene' },
  { id: 'ms-12', titel: 'Empathie zeigen',          bereich: 'sozial',    alterMin: 36, alterMax: 54, beschreibung: 'Gefühle anderer erkennen und trösten' },
  // Kreativität
  { id: 'ms-13', titel: 'Mensch malen',             bereich: 'kreativitaet', alterMin: 36, alterMax: 54, beschreibung: 'Menschfigur mit Kopf, Körper, Armen und Beinen malen' },
  { id: 'ms-14', titel: 'Rollenspiel',              bereich: 'kreativitaet', alterMin: 30, alterMax: 48, beschreibung: 'Komplexes Rollenspiel mit anderen Kindern gestalten' },
  // Alltagskompetenz
  { id: 'ms-15', titel: 'Schuhe anziehen',          bereich: 'alltagskompetenz', alterMin: 36, alterMax: 54, beschreibung: 'Schuhe selbstständig an- und ausziehen' },
  { id: 'ms-16', titel: 'Händewaschen',             bereich: 'alltagskompetenz', alterMin: 24, alterMax: 42, beschreibung: 'Hände selbstständig waschen und abtrocknen' },
]

const KINDER: KindStatus[] = [
  {
    id: 'k1', name: 'Lena M.',  gruppe: 'Sonnenkäfer', alter: 52, gebDatum: '2021-08',
    meilensteine: { 'ms-01': 'erreicht', 'ms-02': 'erreicht', 'ms-03': 'erreicht', 'ms-04': 'in_fortschritt', 'ms-05': 'erreicht', 'ms-06': 'in_fortschritt', 'ms-07': 'beobachten', 'ms-08': 'erreicht', 'ms-09': 'erreicht', 'ms-10': 'erreicht', 'ms-11': 'in_fortschritt', 'ms-12': 'erreicht', 'ms-13': 'erreicht', 'ms-14': 'erreicht', 'ms-15': 'erreicht', 'ms-16': 'erreicht' },
  },
  {
    id: 'k2', name: 'Noah S.',  gruppe: 'Regenbogen', alter: 46, gebDatum: '2022-02',
    meilensteine: { 'ms-01': 'in_fortschritt', 'ms-02': 'beobachten', 'ms-03': 'in_fortschritt', 'ms-04': 'in_fortschritt', 'ms-05': 'in_fortschritt', 'ms-06': 'beobachten', 'ms-07': 'beobachten', 'ms-08': 'in_fortschritt', 'ms-09': 'erreicht', 'ms-10': 'in_fortschritt', 'ms-11': 'beobachten', 'ms-12': 'in_fortschritt', 'ms-13': 'in_fortschritt', 'ms-14': 'in_fortschritt', 'ms-15': 'in_fortschritt', 'ms-16': 'erreicht' },
    foerdernotiz: 'Sprachförderung ab 05/2025',
  },
  {
    id: 'k3', name: 'Mia K.',   gruppe: 'Sonnenkäfer', alter: 58, gebDatum: '2021-02',
    meilensteine: { 'ms-01': 'erreicht', 'ms-02': 'erreicht', 'ms-03': 'erreicht', 'ms-04': 'erreicht', 'ms-05': 'erreicht', 'ms-06': 'erreicht', 'ms-07': 'erreicht', 'ms-08': 'beobachten', 'ms-09': 'erreicht', 'ms-10': 'erreicht', 'ms-11': 'erreicht', 'ms-12': 'erreicht', 'ms-13': 'erreicht', 'ms-14': 'erreicht', 'ms-15': 'erreicht', 'ms-16': 'erreicht' },
  },
  {
    id: 'k4', name: 'Leon B.',  gruppe: 'Schmetterlinge', alter: 38, gebDatum: '2022-10',
    meilensteine: { 'ms-01': 'foerderung', 'ms-02': 'foerderung', 'ms-03': 'beobachten', 'ms-04': 'beobachten', 'ms-05': 'in_fortschritt', 'ms-06': 'beobachten', 'ms-07': 'beobachten', 'ms-08': 'in_fortschritt', 'ms-09': 'in_fortschritt', 'ms-10': 'beobachten', 'ms-11': 'foerderung', 'ms-12': 'beobachten', 'ms-13': 'beobachten', 'ms-14': 'in_fortschritt', 'ms-15': 'beobachten', 'ms-16': 'erreicht' },
    foerdernotiz: 'Motorik-Förderung + Logopädie-Abklärung empfohlen',
  },
  {
    id: 'k5', name: 'Emilia R.', gruppe: 'Regenbogen', alter: 55, gebDatum: '2021-05',
    meilensteine: { 'ms-01': 'erreicht', 'ms-02': 'erreicht', 'ms-03': 'erreicht', 'ms-04': 'erreicht', 'ms-05': 'erreicht', 'ms-06': 'erreicht', 'ms-07': 'in_fortschritt', 'ms-08': 'erreicht', 'ms-09': 'erreicht', 'ms-10': 'erreicht', 'ms-11': 'in_fortschritt', 'ms-12': 'erreicht', 'ms-13': 'erreicht', 'ms-14': 'erreicht', 'ms-15': 'erreicht', 'ms-16': 'erreicht' },
  },
]

const GRUPPEN = ['Alle Gruppen', 'Sonnenkäfer', 'Regenbogen', 'Schmetterlinge']

function getAchievementRate(kind: KindStatus): number {
  const vals = Object.values(kind.meilensteine)
  return Math.round((vals.filter(v => v === 'erreicht').length / vals.length) * 100)
}

function getStatusColor(rate: number) {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-blue-600'
  if (rate >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export default function MeilensteineOverviewPage() {
  const [gruppeFilter, setGruppeFilter] = useState('Alle Gruppen')
  const [bereichFilter, setBereichFilter] = useState<Bereich | 'alle'>('alle')
  const [suche, setSuche] = useState('')
  const [expandedKind, setExpandedKind] = useState<string | null>(null)

  const gefiltert = KINDER.filter(k => {
    const matchGruppe = gruppeFilter === 'Alle Gruppen' || k.gruppe === gruppeFilter
    const matchSuche = !suche || k.name.toLowerCase().includes(suche.toLowerCase())
    return matchGruppe && matchSuche
  })

  const bereichMeilensteine = MEILENSTEINE.filter(m => bereichFilter === 'alle' || m.bereich === bereichFilter)

  // Statistik
  const gesamtErreicht = KINDER.flatMap(k => Object.values(k.meilensteine)).filter(v => v === 'erreicht').length
  const gesamtGesamt   = KINDER.flatMap(k => Object.values(k.meilensteine)).length
  const gesamtRate     = Math.round((gesamtErreicht / gesamtGesamt) * 100)
  const foerderKinder  = KINDER.filter(k => Object.values(k.meilensteine).some(v => v === 'foerderung')).length

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <Star className="w-6 h-6 text-yellow-500" /> Entwicklungsmeilensteine
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Überblick aller Kinder · Grenzsteine der Entwicklung nach Bayley/WHO
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ø Erreichungsrate',   val: `${gesamtRate}%`,        color: 'text-green-600 bg-green-50',  icon: TrendingUp },
          { label: 'Kinder gesamt',        val: `${KINDER.length}`,      color: 'text-blue-600 bg-blue-50',    icon: Baby       },
          { label: 'Meilensteine gesamt',  val: `${gesamtErreicht}/${gesamtGesamt}`, color: 'text-purple-600 bg-purple-50', icon: CheckCircle2 },
          { label: 'Förderung empfohlen',  val: `${foerderKinder}`,      color: 'text-red-600 bg-red-50',      icon: AlertCircle },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input value={suche} onChange={e => setSuche(e.target.value)}
            placeholder="Kind suchen..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 w-36" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {GRUPPEN.map(g => (
            <button key={g} onClick={() => setGruppeFilter(g)}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-colors ${gruppeFilter === g ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Bereich Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setBereichFilter('alle')}
          className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-colors ${bereichFilter === 'alle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Alle Bereiche
        </button>
        {(Object.keys(BEREICHE) as Bereich[]).map(b => {
          const cfg = BEREICHE[b]
          const Icon = cfg.icon
          return (
            <button key={b} onClick={() => setBereichFilter(b)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl font-medium transition-colors ${bereichFilter === b ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Icon className="w-3 h-3" />{cfg.label}
            </button>
          )
        })}
      </div>

      {/* Kinder Liste */}
      <div className="space-y-2">
        {gefiltert.map(kind => {
          const rate = getAchievementRate(kind)
          const isExpanded = expandedKind === kind.id
          const hasFordering = Object.values(kind.meilensteine).some(v => v === 'foerderung')

          return (
            <div key={kind.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpandedKind(isExpanded ? null : kind.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${hasFordering ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {kind.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900">{kind.name}</p>
                    <span className="text-xs text-gray-400">{kind.gruppe}</span>
                    <span className="text-xs text-gray-400">· {Math.floor(kind.alter / 12)} J. {kind.alter % 12} M.</span>
                    {kind.foerdernotiz && (
                      <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full font-medium">Förderung</span>
                    )}
                  </div>
                  {/* Mini progress bars per Bereich */}
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {(Object.keys(BEREICHE) as Bereich[]).map(b => {
                      const bMeilensteine = MEILENSTEINE.filter(m => m.bereich === b)
                      const bErreicht = bMeilensteine.filter(m => kind.meilensteine[m.id] === 'erreicht').length
                      const bRate = Math.round((bErreicht / bMeilensteine.length) * 100)
                      const cfg = BEREICHE[b]
                      return (
                        <div key={b} className="flex items-center gap-1">
                          <span className={`text-[9px] font-medium ${cfg.color}`}>{cfg.label.slice(0, 4)}</span>
                          <div className="w-10 h-1 rounded-full bg-gray-100">
                            <div className={`h-full rounded-full ${bRate >= 80 ? 'bg-green-400' : bRate >= 50 ? 'bg-blue-400' : 'bg-yellow-400'}`}
                              style={{ width: `${bRate}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${getStatusColor(rate)}`}>{rate}%</p>
                  <p className="text-[10px] text-gray-400">erreicht</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  {kind.foerdernotiz && (
                    <div className="mt-3 mb-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-800">{kind.foerdernotiz}</p>
                    </div>
                  )}
                  <div className="mt-3 space-y-3">
                    {(Object.keys(BEREICHE) as Bereich[]).map(b => {
                      const bMeilensteine = MEILENSTEINE.filter(m =>
                        m.bereich === b && (bereichFilter === 'alle' || bereichFilter === b)
                      )
                      if (bereichFilter !== 'alle' && b !== bereichFilter) return null
                      if (bMeilensteine.length === 0) return null
                      const cfg = BEREICHE[b]
                      const BIcon = cfg.icon
                      return (
                        <div key={b}>
                          <p className={`text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1 ${cfg.color}`}>
                            <BIcon className="w-3 h-3" /> {cfg.label}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {bMeilensteine.map(ms => {
                              const status = kind.meilensteine[ms.id] || 'beobachten'
                              const sCfg = STATUS_CONFIG[status]
                              const SIcon = sCfg.icon
                              return (
                                <div key={ms.id} className={`flex items-start gap-2 p-2 rounded-xl border ${sCfg.bg} border-current/10`}>
                                  <SIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${sCfg.color}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium ${sCfg.color}`}>{ms.titel}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{ms.beschreibung}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-end mt-3">
                    <Link href={`/meilensteine/${kind.id}`}
                      className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                      Vollständige Meilensteinakte <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legende */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> Statuslegende
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
            const cfg = STATUS_CONFIG[s]
            const Icon = cfg.icon
            return (
              <div key={s} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                <Icon className="w-3 h-3" /> {cfg.label}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          Basierend auf Grenzsteinen der Entwicklung (Michaelis/Niemann) und Bayley Scales of Infant Development
        </p>
      </div>
    </div>
  )
}
