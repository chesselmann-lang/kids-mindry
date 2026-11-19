'use client'

import Link from 'next/link'
import {
  GraduationCap, TrendingUp, Star, BookOpen,
  Brain, Target, ChevronRight, Sparkles, Award,
  BarChart3, ArrowUpRight,
} from 'lucide-react'

// ── Lern-Dashboard — KitaHub ──────────────────────────────────────────────────
// Überblick über Lernfortschritte aller Kinder
// Verknüpft mit Bildungsdokumentation + Lerninhalte

const KINDER_FORTSCHRITT = [
  { name: 'Lena M.',   gruppe: 'Sonnenkäfer', sprache: 75, mathe: 60, kreativ: 90, sozial: 85 },
  { name: 'Noah S.',   gruppe: 'Regenbogen',  sprache: 55, mathe: 70, kreativ: 65, sozial: 72 },
  { name: 'Mia K.',    gruppe: 'Sonnenkäfer', sprache: 88, mathe: 45, kreativ: 78, sozial: 91 },
  { name: 'Leon B.',   gruppe: 'Schmetterlinge', sprache: 42, mathe: 80, kreativ: 55, sozial: 60 },
  { name: 'Emilia R.', gruppe: 'Regenbogen',  sprache: 91, mathe: 75, kreativ: 82, sozial: 88 },
]

const LERNZIELE = [
  { bereich: 'Sprache & Literacy',    ziel: 'Silben klatschen bei 80% der Kinder', erreicht: 72, gesamt: 100 },
  { bereich: 'Mathematik',            ziel: 'Zählen bis 10 sicher',                 erreicht: 58, gesamt: 100 },
  { bereich: 'Kreativität',           ziel: 'Farben mischen kennen',                erreicht: 90, gesamt: 100 },
  { bereich: 'Sozial-Emotional',      ziel: 'Konflikte selbst lösen',               erreicht: 61, gesamt: 100 },
  { bereich: 'Motorik',               ziel: 'Schere richtig halten',                erreicht: 84, gesamt: 100 },
]

const HIGHLIGHTS = [
  { label: 'Ø Lernfortschritt', val: '73%',  icon: TrendingUp, color: 'text-green-600 bg-green-50' },
  { label: 'Aktive Module',     val: '12',   icon: BookOpen,   color: 'text-blue-600 bg-blue-50'  },
  { label: 'Lernziele erreicht',val: '3/5',  icon: Target,     color: 'text-purple-600 bg-purple-50' },
  { label: 'Auszeichnungen',    val: '24',   icon: Award,      color: 'text-yellow-600 bg-yellow-50' },
]

function ProgressBar({ value, color = 'bg-indigo-400' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-gray-100 w-full">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function LernDashboardPage() {
  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <GraduationCap className="w-6 h-6 text-indigo-600" /> Lern-Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Lernfortschritte, Ziele und Bildungsdokumentation im Überblick
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {HIGHLIGHTS.map(h => {
          const Icon = h.icon
          return (
            <div key={h.label} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${h.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{h.val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{h.label}</p>
            </div>
          )
        })}
      </div>

      {/* KI-Empfehlung */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-indigo-900">KI-Empfehlung dieser Woche</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            3 Kinder zeigen Potenzial in Sprachentwicklung — empfohlen: Modul &quot;Silben klatschen&quot; als Gruppenaktivität.
          </p>
          <Link href="/lerninhalte" className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-2 hover:underline">
            Zum Modul <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Lernziele */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" /> Lernziele Quartal
          </h2>
          <Link href="/admin/bildungsdokumentation" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
            Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {LERNZIELE.map(z => {
            const pct = Math.round((z.erreicht / z.gesamt) * 100)
            const color = pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-blue-400' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400'
            return (
              <div key={z.bereich}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-800">{z.bereich}</span>
                  <span className={pct >= 80 ? 'text-green-600 font-bold' : 'text-gray-500'}>{pct}%</span>
                </div>
                <ProgressBar value={pct} color={color} />
                <p className="text-xs text-gray-400 mt-0.5">{z.ziel}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Kinder Fortschritt */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Fortschritt nach Kind
          </h2>
        </div>
        <div className="space-y-4">
          {KINDER_FORTSCHRITT.map(k => {
            const avg = Math.round((k.sprache + k.mathe + k.kreativ + k.sozial) / 4)
            return (
              <div key={k.name}>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {k.name.slice(0, 2)}
                  </div>
                  <p className="text-sm font-medium text-gray-900 flex-1">{k.name}</p>
                  <span className="text-xs text-gray-400">{k.gruppe}</span>
                  <span className={`text-xs font-bold ${avg >= 75 ? 'text-green-600' : avg >= 50 ? 'text-blue-600' : 'text-orange-600'}`}>{avg}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1 pl-10">
                  {[
                    { label: 'Sprache', val: k.sprache, color: 'bg-blue-300' },
                    { label: 'Mathe',   val: k.mathe,   color: 'bg-purple-300' },
                    { label: 'Kreativ', val: k.kreativ, color: 'bg-orange-300' },
                    { label: 'Sozial',  val: k.sozial,  color: 'bg-green-300' },
                  ].map(f => (
                    <div key={f.label}>
                      <ProgressBar value={f.val} color={f.color} />
                      <p className="text-[10px] text-gray-400 mt-0.5">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/lerninhalte',              label: 'Lerninhalte',          icon: BookOpen,     color: 'bg-blue-50 text-blue-700' },
          { href: '/admin/bildungsdokumentation', label: 'Bildungsdoku',       icon: GraduationCap, color: 'bg-purple-50 text-purple-700' },
          { href: '/meilensteine',             label: 'Entwicklungsmeilensteine', icon: Star,     color: 'bg-yellow-50 text-yellow-700' },
          { href: '/ki-assistent',             label: 'KI-Assistent',         icon: Brain,        color: 'bg-indigo-50 text-indigo-700' },
        ].map(l => {
          const Icon = l.icon
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-3 rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow ${l.color}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{l.label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
