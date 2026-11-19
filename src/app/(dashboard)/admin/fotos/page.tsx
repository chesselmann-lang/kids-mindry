'use client'

import { useState } from 'react'
import {
  Camera, Star, ChevronDown, ChevronUp,
  Users, CalendarDays, Heart, Lock,
  CheckCircle2, AlertTriangle, Plus, Eye,
} from 'lucide-react'

// ── Foto-Dokumentation — Mindry Kids ─────────────────────────────────────────
// Bildungsdokumentation · DSGVO-konform · Freigaben · Leiterin

type FotoStatus = 'entwurf' | 'freigegeben' | 'gesperrt' | 'archiviert'
type FotoKategorie = 'projekt' | 'alltag' | 'fest' | 'entwicklung' | 'ausflug'

interface FotoEintrag {
  id: string
  titel: string
  datum: string
  gruppe: string
  kategorie: FotoKategorie
  status: FotoStatus
  anzahl: number
  freigabe_eltern: boolean
  beschreibung: string
  kinder?: string[]
}

const STATUS_CFG: Record<FotoStatus, { label: string; farbe: string; bg: string; emoji: string }> = {
  entwurf:    { label: 'Entwurf',    farbe: 'text-gray-600',   bg: 'bg-gray-100',  emoji: '📝' },
  freigegeben:{ label: 'Freigegeben',farbe: 'text-green-700',  bg: 'bg-green-50',  emoji: '✅' },
  gesperrt:   { label: 'Gesperrt',   farbe: 'text-red-700',    bg: 'bg-red-50',    emoji: '🔒' },
  archiviert: { label: 'Archiviert', farbe: 'text-amber-700',  bg: 'bg-amber-50',  emoji: '📦' },
}

const KAT_CFG: Record<FotoKategorie, { label: string; emoji: string; farbe: string }> = {
  projekt:    { label: 'Projekt',    emoji: '🔬', farbe: 'text-blue-700' },
  alltag:     { label: 'Alltag',     emoji: '☀️', farbe: 'text-amber-700' },
  fest:       { label: 'Fest',       emoji: '🎉', farbe: 'text-pink-700' },
  entwicklung:{ label: 'Entwicklung',emoji: '🌱', farbe: 'text-green-700' },
  ausflug:    { label: 'Ausflug',    emoji: '🚌', farbe: 'text-purple-700' },
}

const INIT_FOTOS: FotoEintrag[] = [
  {
    id: 'f1',
    titel: 'Frühlingsprojekt — Blumen pflanzen',
    datum: 'Mo, 22. Apr. 2025', gruppe: 'Schmetterlinge',
    kategorie: 'projekt', status: 'freigegeben',
    anzahl: 12, freigabe_eltern: true,
    beschreibung: 'Kinder pflanzen Tomaten und Blumen im Kita-Garten. Wunderschöne Gruppenfotos.',
    kinder: ['Mia', 'Luca', 'Emma', 'Ben', 'Sophie'],
  },
  {
    id: 'f2',
    titel: 'Morgenkreis Bienen-Gruppe',
    datum: 'Fr, 25. Apr. 2025', gruppe: 'Bienen',
    kategorie: 'alltag', status: 'entwurf',
    anzahl: 5, freigabe_eltern: false,
    beschreibung: 'Alltag im Morgenkreis — Lieder und Bewegungsspiele.',
  },
  {
    id: 'f3',
    titel: 'Ausflug Zoo Hannover',
    datum: 'Do, 10. Apr. 2025', gruppe: 'Alle Gruppen',
    kategorie: 'ausflug', status: 'freigegeben',
    anzahl: 34, freigabe_eltern: true,
    beschreibung: 'Großer Ausflug mit allen Kindern. Elefanten, Giraffen und Pinguine.',
    kinder: ['alle Kinder'],
  },
  {
    id: 'f4',
    titel: 'Geburtstag Finn — 4 Jahre',
    datum: 'Di, 15. Apr. 2025', gruppe: 'Bienen',
    kategorie: 'fest', status: 'gesperrt',
    anzahl: 8, freigabe_eltern: false,
    beschreibung: 'Geburtstagsfeier mit Kuchen und Krone. Freigabe der Eltern noch ausstehend.',
    kinder: ['Finn', 'Freunde'],
  },
  {
    id: 'f5',
    titel: 'Entwicklungsdokumentation Krabbelkäfer',
    datum: 'Mo, 7. Apr. 2025', gruppe: 'Krabbelkäfer',
    kategorie: 'entwicklung', status: 'archiviert',
    anzahl: 16, freigabe_eltern: true,
    beschreibung: 'Motorische Entwicklung — Krabbeln, Stehen, erste Schritte. Portfolio-Fotos.',
  },
]

export default function FotoPage() {
  const [fotos, setFotos] = useState(INIT_FOTOS)
  const [expanded, setExpanded] = useState<string | null>('f1')
  const [filterKat, setFilterKat] = useState<FotoKategorie | 'alle'>('alle')
  const [filterStatus, setFilterStatus] = useState<FotoStatus | 'alle'>('alle')

  function statusWechseln(id: string) {
    setFotos(prev => prev.map(f => {
      if (f.id !== id) return f
      const order: FotoStatus[] = ['entwurf', 'freigegeben', 'gesperrt', 'archiviert']
      const next = order[(order.indexOf(f.status) + 1) % order.length]
      return { ...f, status: next }
    }))
  }

  function freigabeToggle(id: string) {
    setFotos(prev => prev.map(f =>
      f.id === id ? { ...f, freigabe_eltern: !f.freigabe_eltern } : f
    ))
  }

  const filtered = fotos
    .filter(f => filterKat === 'alle' || f.kategorie === filterKat)
    .filter(f => filterStatus === 'alle' || f.status === filterStatus)

  const gesamtFotos = fotos.reduce((s, f) => s + f.anzahl, 0)
  const ohneFreigabe = fotos.filter(f => !f.freigabe_eltern && f.status !== 'archiviert').length

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-amber-500" /> Foto-Dokumentation
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Bildungsdokumentation · DSGVO-konform</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Galerien',     val: fotos.length,                                       color: 'text-amber-700' },
          { label: 'Fotos gesamt', val: gesamtFotos,                                        color: 'text-blue-700' },
          { label: 'Freigegeben',  val: fotos.filter(f => f.status === 'freigegeben').length, color: 'text-green-700' },
          { label: 'Keine Einw.', val: ohneFreigabe,                                        color: ohneFreigabe > 0 ? 'text-red-600' : 'text-gray-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* DSGVO-Hinweis */}
      <div className="rounded-xl flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100">
        <Lock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">Fotos von Kindern erfordern schriftliche Einwilligung der Erziehungsberechtigten (§ 22 KUG, DSGVO Art. 6). Gesperrte Galerien nicht für Eltern sichtbar.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', ...Object.keys(KAT_CFG)] as (FotoKategorie | 'alle')[]).map(k => (
          <button key={k} onClick={() => setFilterKat(k)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterKat === k ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {k === 'alle' ? 'Alle' : `${KAT_CFG[k as FotoKategorie].emoji} ${KAT_CFG[k as FotoKategorie].label}`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(f => {
          const isOpen = expanded === f.id
          const sCfg = STATUS_CFG[f.status]
          const kCfg = KAT_CFG[f.kategorie]
          return (
            <div key={f.id} className={`rounded-2xl border overflow-hidden bg-white ${
              !f.freigabe_eltern && f.status !== 'archiviert' ? 'border-orange-200' : 'border-amber-100'
            }`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpanded(isOpen ? null : f.id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                    {kCfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-amber-900 truncate">{f.titel}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.label}</span>
                      {!f.freigabe_eltern && <Lock className="w-3 h-3 text-orange-400" />}
                    </div>
                    <p className="text-xs text-amber-700/60">{f.datum} · {f.gruppe} · {f.anzahl} Fotos</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
                <button onClick={() => statusWechseln(f.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ml-1 ${sCfg.bg} ${sCfg.farbe}`}>
                  ↻
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-amber-100 px-4 pb-4 pt-3 space-y-3">
                  <p className="text-xs text-amber-800">{f.beschreibung}</p>

                  {f.kinder && f.kinder.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 mb-1.5 uppercase tracking-wide">Abgebildete Kinder</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.kinder.map(k => (
                          <span key={k} className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-semibold text-amber-800">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-100">
                    <div>
                      <p className="text-xs font-semibold text-amber-900">Eltern-Einwilligung</p>
                      <p className="text-[10px] text-amber-700/60">DSGVO § Art. 6 / KUG § 22</p>
                    </div>
                    <button onClick={() => freigabeToggle(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        f.freigabe_eltern ? 'bg-green-500 text-white' : 'bg-red-100 text-red-700'
                      }`}>
                      {f.freigabe_eltern ? '✓ Erteilt' : '✗ Fehlend'}
                    </button>
                  </div>

                  {/* Foto-Platzhalter Grid */}
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 mb-1.5 uppercase tracking-wide">{f.anzahl} Fotos</p>
                    <div className="grid grid-cols-6 gap-1">
                      {Array.from({ length: Math.min(f.anzahl, 12) }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-lg ${f.status === 'gesperrt' ? 'bg-gray-200' : 'bg-amber-100'} flex items-center justify-center`}>
                          {f.status === 'gesperrt' ? <Lock className="w-2.5 h-2.5 text-gray-400" /> : <Camera className="w-2.5 h-2.5 text-amber-400" />}
                        </div>
                      ))}
                      {f.anzahl > 12 && (
                        <div className="aspect-square rounded-lg bg-amber-200 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-amber-700">+{f.anzahl - 12}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
