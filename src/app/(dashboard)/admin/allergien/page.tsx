'use client'

import { useState } from 'react'
import { AlertTriangle, Heart, Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

// ── Allergien & Unverträglichkeiten — Mindry Kids ────────────────────────────
// Übersicht aller Kinder mit allergischen Erkrankungen · Notfallinfo · IfSG

type Schwere = 'leicht' | 'mittel' | 'schwer' | 'anaphylaxie'
type Allergengruppe = 'lebensmittel' | 'umwelt' | 'tier' | 'medikament' | 'kontakt'

interface Allergie {
  allergen: string
  gruppe: Allergengruppe
  schwere: Schwere
  reaktion: string
  massnahme: string
}

interface KindAllergie {
  id: string
  name: string
  alter: number
  gruppe: string
  allergien: Allergie[]
  notfallkontakt: string
  epipen: boolean
  arzt: string
}

const SCHWERE_CFG: Record<Schwere, { label: string; farbe: string; bg: string; emoji: string }> = {
  leicht:      { label: 'Leicht',      farbe: 'text-yellow-700', bg: 'bg-yellow-50',  emoji: '🟡' },
  mittel:      { label: 'Mittel',      farbe: 'text-orange-700', bg: 'bg-orange-50',  emoji: '🟠' },
  schwer:      { label: 'Schwer',      farbe: 'text-red-700',    bg: 'bg-red-50',     emoji: '🔴' },
  anaphylaxie: { label: 'Anaphylaxie', farbe: 'text-red-800',    bg: 'bg-red-100',    emoji: '🚨' },
}

const GRUPPE_CFG: Record<Allergengruppe, { label: string; emoji: string }> = {
  lebensmittel: { label: 'Lebensmittel', emoji: '🍽️' },
  umwelt:       { label: 'Umwelt',       emoji: '🌿' },
  tier:         { label: 'Tier',         emoji: '🐾' },
  medikament:   { label: 'Medikament',   emoji: '💊' },
  kontakt:      { label: 'Kontakt',      emoji: '✋' },
}

const INIT_KINDER: KindAllergie[] = [
  {
    id: 'k1', name: 'Leon Maier', alter: 4, gruppe: 'Bienen',
    notfallkontakt: 'Fr. Maier · 0171 5551234', epipen: true, arzt: 'Dr. Fischer, Allergiologie',
    allergien: [
      { allergen: 'Erdnüsse', gruppe: 'lebensmittel', schwere: 'anaphylaxie', reaktion: 'Anaphylaktischer Schock', massnahme: 'EpiPen sofort, Notruf 112' },
      { allergen: 'Baumnüsse', gruppe: 'lebensmittel', schwere: 'schwer', reaktion: 'Quincke-Ödem, Atemnot', massnahme: 'EpiPen, Arzt benachrichtigen' },
    ],
  },
  {
    id: 'k2', name: 'Sophie Weber', alter: 3, gruppe: 'Schmetterlinge',
    notfallkontakt: 'Hr. Weber · 0152 7772345', epipen: false, arzt: 'Dr. Lange, Kinderarzt',
    allergien: [
      { allergen: 'Kuhmilch', gruppe: 'lebensmittel', schwere: 'mittel', reaktion: 'Bauchschmerzen, Erbrechen', massnahme: 'Laktosefreie Kost, ggf. Antihistaminikum' },
      { allergen: 'Gräserpollen', gruppe: 'umwelt', schwere: 'leicht', reaktion: 'Niesen, gerötete Augen', massnahme: 'Augentropfen, im Freien Brille' },
    ],
  },
  {
    id: 'k3', name: 'Max Schulz', alter: 5, gruppe: 'Drachen',
    notfallkontakt: 'Fr. Schulz · 0160 9998876', epipen: false, arzt: 'Dr. Berger, Pädiatrie',
    allergien: [
      { allergen: 'Katzen', gruppe: 'tier', schwere: 'mittel', reaktion: 'Asthmaanfall, Juckreiz', massnahme: 'Inhalator, tierfreie Räume' },
      { allergen: 'Hausstaub', gruppe: 'umwelt', schwere: 'leicht', reaktion: 'Niesen, verstopfte Nase', massnahme: 'Regelmäßiges Lüften, Staubwischen' },
    ],
  },
  {
    id: 'k4', name: 'Emma Klein', alter: 4, gruppe: 'Bienen',
    notfallkontakt: 'Fr. Klein · 0176 3334455', epipen: true, arzt: 'Dr. Hoffmann, Allergologie',
    allergien: [
      { allergen: 'Bienengift', gruppe: 'umwelt', schwere: 'anaphylaxie', reaktion: 'Schock, Kreislaufversagen', massnahme: 'EpiPen, Notruf 112, hinlegen' },
      { allergen: 'Penicillin', gruppe: 'medikament', schwere: 'schwer', reaktion: 'Hautausschlag, Atemnot', massnahme: 'Arzt sofort informieren — kein Penicillin!' },
    ],
  },
  {
    id: 'k5', name: 'Noah Fischer', alter: 3, gruppe: 'Schmetterlinge',
    notfallkontakt: 'Hr. Fischer · 0178 1112233', epipen: false, arzt: 'Dr. Wagner, Kinderarzt',
    allergien: [
      { allergen: 'Latex', gruppe: 'kontakt', schwere: 'mittel', reaktion: 'Rötung, Quaddeln', massnahme: 'Kein Latexkontakt, latexfreie Handschuhe' },
      { allergen: 'Weizen/Gluten', gruppe: 'lebensmittel', schwere: 'schwer', reaktion: 'Zöliakie-Reaktion, starke Bauchschmerzen', massnahme: 'Glutenfreie Ernährung strikt einhalten' },
    ],
  },
]

export default function AllergienPage() {
  const [expanded, setExpanded] = useState<string | null>('k1')
  const [suchtext, setSuchtext] = useState('')
  const [filterSchwere, setFilterSchwere] = useState<Schwere | 'alle'>('alle')
  const [kiText, setKiText] = useState<string | null>(null)
  const [kiLaedt, setKiLaedt] = useState(false)

  const gefiltert = INIT_KINDER.filter(k => {
    const match = k.name.toLowerCase().includes(suchtext.toLowerCase()) ||
      k.allergien.some(a => a.allergen.toLowerCase().includes(suchtext.toLowerCase()))
    const schwerematch = filterSchwere === 'alle' || k.allergien.some(a => a.schwere === filterSchwere)
    return match && schwerematch
  })

  const anaphylaxieKinder = INIT_KINDER.filter(k => k.allergien.some(a => a.schwere === 'anaphylaxie'))
  const epipenKinder = INIT_KINDER.filter(k => k.epipen)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Allergienprofil: ${INIT_KINDER.length} Kinder mit Allergien erfasst. ${anaphylaxieKinder.length} mit Anaphylaxie-Risiko (${anaphylaxieKinder.map(k => k.name.split(' ')[0]).join(', ')}). EpiPen vorhanden: ${epipenKinder.length} Kinder — EpiPens täglich auf Verfügbarkeit prüfen. Küche: Erdnüsse und Baumnüsse strikt ausschließen (Leon). Glutenfreie Kost für Noah. Bei Ausflügen Notfallblätter mitführen.`)
      setKiLaedt(false)
    }, 1000)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-amber-500" /> Allergien & Unverträglichkeiten
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Notfallinfo · Ernährungshinweise · IfSG</p>
      </div>

      {/* Notfall-Banner */}
      {anaphylaxieKinder.length > 0 && (
        <div className="rounded-xl px-3 py-2.5 bg-red-50 border border-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-800">Anaphylaxie-Risiko: {anaphylaxieKinder.map(k => k.name.split(' ')[0]).join(', ')}</p>
            <p className="text-[10px] text-red-700 mt-0.5">EpiPen-Standort bekannt? Alle Erzieher eingewiesen? Notfallnummern griffbereit?</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Betroffene', val: INIT_KINDER.length, color: 'text-amber-700' },
          { label: 'Anaphylaxie', val: anaphylaxieKinder.length, color: 'text-red-700' },
          { label: 'EpiPen', val: epipenKinder.length, color: 'text-orange-700' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
        <input value={suchtext} onChange={e => setSuchtext(e.target.value)}
          placeholder="Kind oder Allergen suchen…"
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-400 text-amber-900" />
      </div>

      {/* Schwere-Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 'leicht', 'mittel', 'schwer', 'anaphylaxie'] as const).map(s => (
          <button key={s} onClick={() => setFilterSchwere(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterSchwere === s ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {s === 'alle' ? 'Alle' : `${SCHWERE_CFG[s].emoji} ${SCHWERE_CFG[s].label}`}
          </button>
        ))}
      </div>

      {/* Kinder-Liste */}
      <div className="space-y-2">
        {gefiltert.map(k => {
          const maxSchwere = k.allergien.reduce((max, a) => {
            const order: Schwere[] = ['leicht', 'mittel', 'schwer', 'anaphylaxie']
            return order.indexOf(a.schwere) > order.indexOf(max) ? a.schwere : max
          }, 'leicht' as Schwere)
          const sCfg = SCHWERE_CFG[maxSchwere]
          const isOpen = expanded === k.id
          return (
            <div key={k.id} className="rounded-2xl border bg-white overflow-hidden"
              style={{ borderColor: maxSchwere === 'anaphylaxie' ? '#fca5a5' : maxSchwere === 'schwer' ? '#fed7aa' : '#fde68a' }}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
                  {k.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-amber-900">{k.name}</p>
                    {k.epipen && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">EpiPen</span>}
                  </div>
                  <p className="text-[9px] text-amber-600">{k.alter} Jahre · {k.gruppe} · {k.allergien.length} Allergie(n)</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe} shrink-0`}>{sCfg.emoji} {sCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="border-t border-amber-100 px-3 pb-3 pt-2 space-y-2.5">
                  {k.allergien.map((a, i) => (
                    <div key={i} className={`rounded-xl p-2.5 border ${SCHWERE_CFG[a.schwere].bg}`}
                      style={{ borderColor: a.schwere === 'anaphylaxie' ? '#fca5a5' : a.schwere === 'schwer' ? '#fdba74' : '#fde68a' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{GRUPPE_CFG[a.gruppe].emoji}</span>
                        <p className="text-xs font-bold text-amber-900">{a.allergen}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${SCHWERE_CFG[a.schwere].bg} ${SCHWERE_CFG[a.schwere].farbe}`}>
                          {SCHWERE_CFG[a.schwere].emoji} {SCHWERE_CFG[a.schwere].label}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800"><span className="font-semibold">Reaktion:</span> {a.reaktion}</p>
                      <p className="text-[10px] text-amber-900 mt-0.5 font-semibold">→ {a.massnahme}</p>
                    </div>
                  ))}
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-2">
                    <p className="text-[9px] font-bold text-amber-700 mb-0.5">Notfall</p>
                    <p className="text-[9px] text-amber-800">{k.notfallkontakt}</p>
                    <p className="text-[9px] text-amber-600">{k.arzt}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {kiText ? (
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-bold flex items-center gap-1 mb-1 text-amber-700"><Sparkles className="w-3 h-3" /> KI-Übersicht</p>
          <p className="text-xs leading-relaxed text-amber-900">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Übersicht generieren'}
        </button>
      )}
    </div>
  )
}
