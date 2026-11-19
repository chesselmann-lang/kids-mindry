'use client'

import { useState } from 'react'
import {
  BookOpen, Play, Star, Lock, ChevronRight, Search,
  Music, Palette, Calculator, Globe, Leaf, Heart,
  Sparkles, CheckCircle2, Clock,
} from 'lucide-react'

// ── Lerninhalte — KitaHub Lernbibliothek ─────────────────────────────────────
// Altersgerechte Lernmodule für U3 / Ü3 Kinder
// Bereiche: Sprache, Mathe, Musik, Kreativität, Natur, Soziales

type Bereich = 'Alle' | 'Sprache' | 'Mathe & Logik' | 'Musik' | 'Kreativität' | 'Natur & Umwelt' | 'Sozial-Emotional'
type Alter = 'Alle' | 'U3 (0-3 J.)' | 'Ü3 (3-6 J.)'

interface Modul {
  id: string
  titel: string
  bereich: Bereich
  alter: 'U3 (0-3 J.)' | 'Ü3 (3-6 J.)'
  dauer: string
  level: 1 | 2 | 3
  abgeschlossen?: number // % kinder
  neu?: boolean
  locked?: boolean
  beschreibung: string
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  'Sprache': Globe,
  'Mathe & Logik': Calculator,
  'Musik': Music,
  'Kreativität': Palette,
  'Natur & Umwelt': Leaf,
  'Sozial-Emotional': Heart,
}

const COLOR_MAP: Record<string, { bg: string; text: string; badge: string }> = {
  'Sprache':         { bg: 'bg-blue-50',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  'Mathe & Logik':   { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  'Musik':           { bg: 'bg-pink-50',   text: 'text-pink-700',   badge: 'bg-pink-100 text-pink-700' },
  'Kreativität':     { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  'Natur & Umwelt':  { bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  'Sozial-Emotional':{ bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
}

const MODULE: Modul[] = [
  { id:'1', titel:'Buchstaben entdecken', bereich:'Sprache',         alter:'Ü3 (3-6 J.)', dauer:'15 Min',  level:1, abgeschlossen:72, beschreibung:'ABC lernen mit Tieren und Alltagsgegenständen. Interaktive Lieder.' },
  { id:'2', titel:'Zahlen bis 10',       bereich:'Mathe & Logik',    alter:'Ü3 (3-6 J.)', dauer:'10 Min',  level:1, abgeschlossen:58, beschreibung:'Zählen, Sortieren und erste Mengen vergleichen.' },
  { id:'3', titel:'Klangreise',          bereich:'Musik',            alter:'U3 (0-3 J.)', dauer:'8 Min',   level:1, abgeschlossen:85, beschreibung:'Einfache Rhythmen klopfen, Instrumente kennenlernen.' },
  { id:'4', titel:'Farben mischen',      bereich:'Kreativität',      alter:'U3 (0-3 J.)', dauer:'20 Min',  level:1, abgeschlossen:90, neu:true, beschreibung:'Was entsteht wenn man Gelb und Blau mischt? Entdecken durch Malen.' },
  { id:'5', titel:'Jahreszeiten',        bereich:'Natur & Umwelt',   alter:'Ü3 (3-6 J.)', dauer:'12 Min',  level:1, abgeschlossen:43, beschreibung:'Frühling, Sommer, Herbst, Winter — was verändert sich in der Natur?' },
  { id:'6', titel:'Wie fühle ich mich?', bereich:'Sozial-Emotional', alter:'Ü3 (3-6 J.)', dauer:'15 Min',  level:1, abgeschlossen:61, beschreibung:'Emotionen benennen, Empathie entwickeln. Mit Bildkarten und Geschichten.' },
  { id:'7', titel:'Silben klatschen',    bereich:'Sprache',          alter:'Ü3 (3-6 J.)', dauer:'10 Min',  level:2, abgeschlossen:35, beschreibung:'Wörter in Silben aufteilen — wichtige Vorbereitung fürs Lesen.' },
  { id:'8', titel:'Formen und Muster',   bereich:'Mathe & Logik',    alter:'Ü3 (3-6 J.)', dauer:'15 Min',  level:2, abgeschlossen:29, beschreibung:'Kreis, Dreieck, Viereck. Muster erkennen und fortführen.' },
  { id:'9', titel:'Liederschatz',        bereich:'Musik',            alter:'U3 (0-3 J.)', dauer:'20 Min',  level:1, abgeschlossen:95, beschreibung:'Klassische Kinderlieder mit Gesten und Bewegung.' },
  { id:'10',titel:'Tiere der Welt',      bereich:'Natur & Umwelt',   alter:'Ü3 (3-6 J.)', dauer:'15 Min',  level:1, abgeschlossen:67, neu:true, beschreibung:'Welche Tiere leben wo? Afrika, Polareis, Regenwald.' },
  { id:'11',titel:'Freundschaft üben',   bereich:'Sozial-Emotional', alter:'U3 (0-3 J.)', dauer:'12 Min',  level:1, abgeschlossen:78, beschreibung:'Teilen, helfen, trösten — erste soziale Kompetenzen.' },
  { id:'12',titel:'Schreiben lernen',    bereich:'Sprache',          alter:'Ü3 (3-6 J.)', dauer:'20 Min',  level:3, locked:true,     beschreibung:'Erste Buchstaben schreiben — für die Schulvorbereitung.' },
]

const BEREICHE: Bereich[] = ['Alle', 'Sprache', 'Mathe & Logik', 'Musik', 'Kreativität', 'Natur & Umwelt', 'Sozial-Emotional']
const ALTERSGRUPPEN: Alter[] = ['Alle', 'U3 (0-3 J.)', 'Ü3 (3-6 J.)']

export default function LerninhalttePage() {
  const [bereich, setBereich] = useState<Bereich>('Alle')
  const [alter, setAlter] = useState<Alter>('Alle')
  const [suche, setSuche] = useState('')

  const gefiltert = MODULE.filter(m => {
    if (bereich !== 'Alle' && m.bereich !== bereich) return false
    if (alter !== 'Alle' && m.alter !== alter) return false
    if (suche && !m.titel.toLowerCase().includes(suche.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <BookOpen className="w-6 h-6 text-indigo-600" /> Lerninhalte
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Altersgerechte Lernmodule für Kita · {MODULE.length} Module verfügbar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Module gesamt', val: MODULE.length, icon: BookOpen, color: 'indigo' },
          { label: 'Neue Inhalte',  val: MODULE.filter(m => m.neu).length,    icon: Sparkles, color: 'yellow' },
          { label: 'Ø Fortschritt', val: `${Math.round(MODULE.reduce((s,m) => s + (m.abgeschlossen||0), 0) / MODULE.length)}%`, icon: CheckCircle2, color: 'green' },
        ].map(s => {
          const Icon = s.icon
          const cls: Record<string, string> = { indigo:'bg-indigo-50 text-indigo-600', yellow:'bg-yellow-50 text-yellow-600', green:'bg-green-50 text-green-600' }
          return (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${cls[s.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            value={suche} onChange={e => setSuche(e.target.value)}
            placeholder="Modul suchen..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALTERSGRUPPEN.map(a => (
            <button key={a} onClick={() => setAlter(a)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${alter === a ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {a}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {BEREICHE.map(b => {
            const Icon = b !== 'Alle' ? ICON_MAP[b] : BookOpen
            return (
              <button key={b} onClick={() => setBereich(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${bereich === b ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Icon className="w-3 h-3" /> {b}
              </button>
            )
          })}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {gefiltert.map(m => {
          const colors = COLOR_MAP[m.bereich] || { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' }
          const Icon = ICON_MAP[m.bereich] || BookOpen
          return (
            <div key={m.id} className={`rounded-2xl border border-gray-200 bg-white p-4 ${m.locked ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900 truncate">{m.titel}</p>
                    {m.neu && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">NEU</span>}
                    {m.locked && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>{m.bereich}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{m.dauer}</span>
                    <span className="text-xs text-gray-400">{'⭐'.repeat(m.level)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.alter}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{m.beschreibung}</p>
                  {m.abgeschlossen !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Fortschritt</span><span>{m.abgeschlossen}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${m.abgeschlossen}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!m.locked && (
                <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors">
                  <Play className="w-3.5 h-3.5" /> Starten
                </button>
              )}
            </div>
          )
        })}
        {gefiltert.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine Module gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
}
