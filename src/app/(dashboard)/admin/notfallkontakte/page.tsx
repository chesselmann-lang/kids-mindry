'use client'

import { useState } from 'react'
import { Phone, Search, ChevronDown, ChevronUp, AlertTriangle, Star } from 'lucide-react'

// ── Notfallkontakte — Mindry Kids ─────────────────────────────────────────────
// Elternkontakte · Ärzte · Behörden · Sofortmaßnahmen

interface Notfallkontakt {
  id: string
  name: string
  relation: string
  telefon: string
  mobil?: string
  prioritaet: 1 | 2 | 3
  verfuegbar: string
  notiz?: string
  kategorie: 'kind' | 'arzt' | 'behoerde' | 'dienst'
  kindName?: string
}

const KAT_CFG = {
  kind:      { label: 'Elternkontakt', emoji: '👨‍👩‍👧', farbe: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  arzt:      { label: 'Arzt/Klinik',   emoji: '🏥', farbe: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  behoerde:  { label: 'Behörde',       emoji: '🏛️', farbe: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  dienst:    { label: 'Notfalldienst', emoji: '🚨', farbe: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
}

const INIT_KONTAKTE: Notfallkontakt[] = [
  // Notfalldienste
  { id: 'n1', name: 'Notruf Feuerwehr/Rettung', relation: 'Notruf', telefon: '112', prioritaet: 1, verfuegbar: '24/7', kategorie: 'dienst' },
  { id: 'n2', name: 'Polizei Notruf',            relation: 'Notruf', telefon: '110', prioritaet: 1, verfuegbar: '24/7', kategorie: 'dienst' },
  { id: 'n3', name: 'Giftnotruf Berlin',          relation: 'Vergiftung', telefon: '030 19240', prioritaet: 1, verfuegbar: '24/7', kategorie: 'dienst', notiz: 'Bei Verdacht auf Vergiftung — Gift-Etikett bereitlegen' },
  { id: 'n4', name: 'Kinderärztlicher Bereitschaftsdienst', relation: 'Ärztl. Bereitschaft', telefon: '116 117', prioritaet: 1, verfuegbar: 'Nachts + Wochenende', kategorie: 'dienst' },
  // Ärzte
  { id: 'a1', name: 'Kinderarztpraxis Dr. Fischer', relation: 'Kita-Kinderarzt', telefon: '030 4455667', prioritaet: 2, verfuegbar: 'Mo–Fr 8–18', kategorie: 'arzt', notiz: 'Kita-Kooperationsarzt — bevorzugte Behandlung bei Notfällen' },
  { id: 'a2', name: 'Kinderklinik Charité',         relation: 'Kinderklinik',   telefon: '030 450 566122', prioritaet: 2, verfuegbar: '24/7', kategorie: 'arzt', notiz: 'Notaufnahme Kinder: Eingang West' },
  // Behörden
  { id: 'b1', name: 'Jugendamt Bezirk Mitte',  relation: 'Jugendamt',    telefon: '030 9018 30000', prioritaet: 2, verfuegbar: 'Mo–Fr 8–16', kategorie: 'behoerde' },
  { id: 'b2', name: 'Gesundheitsamt Bezirk',   relation: 'Gesundheitsamt',telefon: '030 9018 22900', prioritaet: 3, verfuegbar: 'Mo–Fr 8–16', kategorie: 'behoerde', notiz: 'IfSG-Meldepflicht — bei Verdacht auf Infektionskrankheiten' },
  // Elternkontakte (Auswahl kritischer Fälle)
  { id: 'e1', name: 'Fam. Maier (Leon)', relation: 'Mutter + Vater', telefon: '0171 5551234', mobil: '0162 9998877', prioritaet: 1, verfuegbar: 'Erreichbar ganztags', kategorie: 'kind', kindName: 'Leon Maier', notiz: 'Leon: Anaphylaxie-Risiko Erdnüsse — EpiPen im Rucksack' },
  { id: 'e2', name: 'Fam. Klein (Emma)', relation: 'Mutter',         telefon: '0176 3334455', prioritaet: 1, verfuegbar: 'Bitte SMS bei Notruf', kategorie: 'kind', kindName: 'Emma Klein', notiz: 'Emma: Bienengift-Allergie — EpiPen im Büro Fr. Jung' },
]

export default function NotfallkontaktePage() {
  const [expanded, setExpanded] = useState<string | null>('n1')
  const [filterKat, setFilterKat] = useState<'alle' | 'kind' | 'arzt' | 'behoerde' | 'dienst'>('alle')
  const [suchtext, setSuchtext] = useState('')

  const gefiltert = INIT_KONTAKTE.filter(k => {
    const katMatch = filterKat === 'alle' || k.kategorie === filterKat
    const suchMatch = k.name.toLowerCase().includes(suchtext.toLowerCase()) ||
      (k.kindName ?? '').toLowerCase().includes(suchtext.toLowerCase())
    return katMatch && suchMatch
  })

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Phone className="w-6 h-6 text-amber-500" /> Notfallkontakte
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Schnellzugriff · Eltern · Ärzte · Behörden</p>
      </div>

      {/* Notruf-Banner */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: '🚑 Notruf', tel: '112', bg: 'bg-red-500' },
          { name: '👮 Polizei',  tel: '110', bg: 'bg-blue-600' },
        ].map(n => (
          <a key={n.tel} href={`tel:${n.tel}`}
            className={`${n.bg} text-white rounded-2xl py-3 flex flex-col items-center gap-0.5 hover:opacity-90 transition-opacity`}>
            <span className="text-xs font-bold">{n.name}</span>
            <span className="text-xl font-black">{n.tel}</span>
          </a>
        ))}
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
        <input value={suchtext} onChange={e => setSuchtext(e.target.value)}
          placeholder="Name oder Kind suchen…"
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-400 text-amber-900" />
      </div>

      {/* Kategorie-Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 'dienst', 'kind', 'arzt', 'behoerde'] as const).map(k => (
          <button key={k} onClick={() => setFilterKat(k)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterKat === k ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {k === 'alle' ? 'Alle' : `${KAT_CFG[k].emoji} ${KAT_CFG[k].label}`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(k => {
          const kCfg = KAT_CFG[k.kategorie]
          const isOpen = expanded === k.id
          return (
            <div key={k.id} className={`rounded-2xl border ${kCfg.bg} overflow-hidden`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <span className="text-lg shrink-0">{kCfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{k.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-amber-600">{k.relation}</span>
                    {k.prioritaet === 1 && <Star className="w-2.5 h-2.5 text-yellow-500" />}
                  </div>
                </div>
                <a href={`tel:${k.telefon}`} onClick={e => e.stopPropagation()}
                  className="text-sm font-black text-amber-800 px-2 py-1 rounded-lg bg-white/60 hover:bg-white/80 transition-colors">
                  {k.telefon}
                </a>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-200/50 px-3 pb-3 pt-2 space-y-1.5">
                  <div className="flex gap-3 flex-wrap">
                    {k.mobil && (
                      <a href={`tel:${k.mobil}`} className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:underline">
                        📱 {k.mobil}
                      </a>
                    )}
                    <span className="text-[9px] text-amber-600">⏰ {k.verfuegbar}</span>
                  </div>
                  {k.kindName && <p className="text-[10px] font-semibold text-amber-800">Kind: {k.kindName}</p>}
                  {k.notiz && (
                    <div className="flex items-start gap-1.5 bg-orange-50 rounded-lg px-2 py-1.5 border border-orange-200">
                      <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-orange-800">{k.notiz}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
