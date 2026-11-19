'use client'

import { useState } from 'react'
import {
  Utensils, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, Star, RotateCcw, Clock,
} from 'lucide-react'

// ── Essensprotokoll — KiTa / Kindergarten ─────────────────────────────────────
// Tägliche Mahlzeiten-Dokumentation pro Kind · Allergien · Mengenerfassung

type MahlzeitTyp = 'fruehstueck' | 'mittagessen' | 'vesper'
type EssMenge = 'alles' | 'viel' | 'wenig' | 'nichts'

interface KindEintrag {
  id: string
  name: string
  gruppe: 'Bienen' | 'Schmetterlinge'
  allergie?: string
  fruehstueck: EssMenge
  mittagessen: EssMenge
  vesper: EssMenge
  notiz?: string
  abwesend?: boolean
}

const MENGE_CFG: Record<EssMenge, { label: string; farbe: string; bg: string; icon: string }> = {
  alles:  { label: 'Alles',   farbe: 'text-green-700',  bg: 'bg-green-50',  icon: '😄' },
  viel:   { label: 'Viel',    farbe: 'text-teal-700',   bg: 'bg-teal-50',   icon: '🙂' },
  wenig:  { label: 'Wenig',   farbe: 'text-yellow-700', bg: 'bg-yellow-50', icon: '😐' },
  nichts: { label: 'Nichts',  farbe: 'text-red-700',    bg: 'bg-red-50',    icon: '😟' },
}

const INIT_KINDER: KindEintrag[] = [
  { id: 'k1', name: 'Emma S.',    gruppe: 'Bienen',          fruehstueck: 'alles',  mittagessen: 'alles', vesper: 'viel' },
  { id: 'k2', name: 'Ben A.',     gruppe: 'Bienen',          fruehstueck: 'viel',   mittagessen: 'wenig', vesper: 'alles', notiz: 'Klagt über Bauchschmerzen' },
  { id: 'k3', name: 'Lara K.',    gruppe: 'Bienen',          fruehstueck: 'alles',  mittagessen: 'alles', vesper: 'alles', allergie: 'Laktose' },
  { id: 'k4', name: 'Tom H.',     gruppe: 'Schmetterlinge',  fruehstueck: 'wenig',  mittagessen: 'viel',  vesper: 'viel' },
  { id: 'k5', name: 'Mia R.',     gruppe: 'Schmetterlinge',  fruehstueck: 'nichts', mittagessen: 'wenig', vesper: 'alles', notiz: 'Isst am Morgen nie viel, normal für sie' },
  { id: 'k6', name: 'Felix E.',   gruppe: 'Bienen',          fruehstueck: 'alles',  mittagessen: 'alles', vesper: 'alles', abwesend: true },
  { id: 'k7', name: 'Hannah G.',  gruppe: 'Schmetterlinge',  fruehstueck: 'viel',   mittagessen: 'alles', vesper: 'viel', allergie: 'Nüsse' },
  { id: 'k8', name: 'David C.',   gruppe: 'Bienen',          fruehstueck: 'alles',  mittagessen: 'wenig', vesper: 'alles' },
]

const SPEISEPLAN_HEUTE = {
  fruehstueck: 'Brot, Butter, Aufschnitt, Obst, Milch',
  mittagessen: 'Spaghetti Bolognese (vegetarisch), Salat, Wasser',
  vesper: 'Joghurt, Obst, Cracker',
}

const DATUM = 'Freitag, 25. April 2025'

export default function EssensprotokollPage() {
  const [kinder, setKinder] = useState(INIT_KINDER)
  const [filterGruppe, setFilterGruppe] = useState<'Alle' | 'Bienen' | 'Schmetterlinge'>('Alle')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState(false)

  function setMenge(kindId: string, mahlzeit: MahlzeitTyp, menge: EssMenge) {
    setKinder(prev => prev.map(k =>
      k.id === kindId ? { ...k, [mahlzeit]: menge } : k
    ))
  }

  function setNotiz(kindId: string, notiz: string) {
    setKinder(prev => prev.map(k => k.id === kindId ? { ...k, notiz } : k))
  }

  function save() {
    setGespeichert(true)
    setTimeout(() => setGespeichert(false), 2000)
  }

  const anwesend = kinder.filter(k => !k.abwesend)
  const gefiltert = anwesend.filter(k => filterGruppe === 'Alle' || k.gruppe === filterGruppe)
  const probleme = kinder.filter(k => k.mittagessen === 'nichts' && !k.abwesend).length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-amber-600" /> Essensprotokoll
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Kita Sonnenschein · {DATUM}</p>
      </div>

      {/* Tagesmenü */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
        <p className="text-sm font-bold text-amber-800">Speiseplan heute</p>
        {([
          { label: 'Frühstück', val: SPEISEPLAN_HEUTE.fruehstueck },
          { label: 'Mittagessen', val: SPEISEPLAN_HEUTE.mittagessen },
          { label: 'Vesper', val: SPEISEPLAN_HEUTE.vesper },
        ]).map(s => (
          <div key={s.label} className="flex gap-2 text-xs">
            <span className="font-semibold text-amber-700 w-24 shrink-0">{s.label}:</span>
            <span className="text-gray-700">{s.val}</span>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Anwesend', val: anwesend.length, color: 'text-green-600' },
          { label: 'Abwesend', val: kinder.filter(k => k.abwesend).length, color: 'text-gray-500' },
          { label: 'Auffälligkeiten', val: probleme, color: probleme > 0 ? 'text-red-500' : 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gruppen-Filter */}
      <div className="flex gap-2">
        {(['Alle', 'Bienen', 'Schmetterlinge'] as const).map(g => (
          <button key={g} onClick={() => setFilterGruppe(g)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              filterGruppe === g ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {g === 'Alle' ? 'Alle Gruppen' : `🐝 ${g}`}
          </button>
        ))}
      </div>

      {/* Kinder-Liste */}
      <div className="space-y-2">
        {gefiltert.map(k => {
          const isOpen = expanded === k.id
          const hatAllergie = !!k.allergie
          const hatNotiz = !!k.notiz
          return (
            <div key={k.id} className={`rounded-2xl border overflow-hidden bg-white ${
              k.mittagessen === 'nichts' ? 'border-red-200' : hatAllergie ? 'border-yellow-200' : 'border-gray-200'
            }`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-100 text-amber-700">
                  {k.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{k.name}</p>
                    {hatAllergie && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> {k.allergie}
                      </span>
                    )}
                  </div>
                  {/* Mahlzeit-Schnellübersicht */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {(['fruehstueck', 'mittagessen', 'vesper'] as MahlzeitTyp[]).map(m => {
                      const mCfg = MENGE_CFG[k[m]]
                      return (
                        <span key={m} className={`px-1.5 py-0.5 rounded-full font-semibold ${mCfg.bg} ${mCfg.farbe}`}>
                          {m === 'fruehstueck' ? '🌅' : m === 'mittagessen' ? '☀️' : '🌙'} {mCfg.label}
                        </span>
                      )
                    })}
                    {hatNotiz && <span className="text-yellow-500">📝</span>}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                  {/* Mahlzeiten bearbeiten */}
                  {([
                    { key: 'fruehstueck' as MahlzeitTyp, label: '🌅 Frühstück' },
                    { key: 'mittagessen' as MahlzeitTyp, label: '☀️ Mittagessen' },
                    { key: 'vesper' as MahlzeitTyp, label: '🌙 Vesper' },
                  ]).map(({ key, label }) => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
                      <div className="flex gap-1.5">
                        {(Object.entries(MENGE_CFG) as [EssMenge, typeof MENGE_CFG[EssMenge]][]).map(([menge, cfg]) => (
                          <button key={menge} onClick={() => setMenge(k.id, key, menge)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                              k[key] === menge ? `${cfg.bg} ${cfg.farbe} ring-1 ring-current` : 'bg-gray-100 text-gray-500'
                            }`}>
                            {cfg.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Notiz */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Notiz (optional)</p>
                    <input className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="z. B. klagt über Bauchschmerzen..."
                      value={k.notiz ?? ''} onChange={e => setNotiz(k.id, e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Speichern */}
      <button onClick={save}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2 transition-colors">
        <CheckCircle2 className="w-4 h-4" /> Protokoll speichern
      </button>

      {gespeichert && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Protokoll gespeichert — {DATUM}
        </div>
      )}
    </div>
  )
}
