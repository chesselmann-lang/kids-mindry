'use client'

import { useState } from 'react'
import { Globe, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Users, Star } from 'lucide-react'

// ── Kooperationspartner — Mindry Kids Admin ───────────────────────────────────
// Externe Partner · Angebote · Termine · Vereinbarungen

type PartnerTyp = 'schule' | 'therapeut' | 'verein' | 'behoerde' | 'foerderung' | 'sonstiges'
type PartnerStatus = 'aktiv' | 'inaktiv' | 'geplant'

interface KoopAngebot {
  bezeichnung: string
  haeufigkeit: string
  naechsterTermin?: string
}

interface Kooperationspartner {
  id: string
  name: string
  typ: PartnerTyp
  kontaktperson: string
  telefon?: string
  email?: string
  status: PartnerStatus
  angebote: KoopAngebot[]
  notiz?: string
  vertragSeit?: string
}

const TYP_CFG: Record<PartnerTyp, { label: string; farbe: string }> = {
  schule:      { label: 'Grundschule',  farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  therapeut:   { label: 'Therapeuten', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  verein:      { label: 'Verein',       farbe: 'bg-green-50 text-green-700 border-green-200' },
  behoerde:    { label: 'Behörde',      farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  foerderung:  { label: 'Förderung',    farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  sonstiges:   { label: 'Sonstiges',    farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const STATUS_CFG: Record<PartnerStatus, { label: string; farbe: string }> = {
  aktiv:   { label: 'Aktiv',   farbe: 'text-green-600' },
  inaktiv: { label: 'Inaktiv', farbe: 'text-gray-400' },
  geplant: { label: 'Geplant', farbe: 'text-blue-600' },
}

const PARTNER: Kooperationspartner[] = [
  {
    id: 'kp1', name: 'Grundschule Sonnenhügel', typ: 'schule',
    kontaktperson: 'Fr. Lange (Schulleitung)', telefon: '0221 / 123 456', status: 'aktiv',
    vertragSeit: '01.09.2024',
    angebote: [
      { bezeichnung: 'Schnuppertag Vorschulkinder', haeufigkeit: 'jährlich', naechsterTermin: '15.06.2026' },
      { bezeichnung: 'Gemeinsame Projektwochen', haeufigkeit: '2× jährlich' },
    ],
    notiz: 'Übergangsprotokoll digital seit SJ 2024/25',
  },
  {
    id: 'kp2', name: 'Ergotherapiepraxis Schmidt', typ: 'therapeut',
    kontaktperson: 'Hr. Schmidt', email: 'info@ergo-schmidt.de', status: 'aktiv',
    vertragSeit: '01.02.2025',
    angebote: [
      { bezeichnung: 'Einzeltherapie im Haus (2 Kinder)', haeufigkeit: 'wöchentlich', naechsterTermin: '28.04.2026' },
      { bezeichnung: 'Elternberatung Feinmotorik', haeufigkeit: 'nach Bedarf' },
    ],
  },
  {
    id: 'kp3', name: 'Sportverein TSV Blau-Weiß', typ: 'verein',
    kontaktperson: 'Hr. Keller (Jugendwart)', telefon: '0221 / 987 654', status: 'aktiv',
    vertragSeit: '01.03.2023',
    angebote: [
      { bezeichnung: 'Bewegungsangebot Turnhalle', haeufigkeit: 'dienstags, 15:30 Uhr', naechsterTermin: '29.04.2026' },
      { bezeichnung: 'Fußball-AG Vorschulkinder', haeufigkeit: 'freitags Mai–Oktober' },
    ],
  },
  {
    id: 'kp4', name: 'Jugendamt Stadtbezirk Nord', typ: 'behoerde',
    kontaktperson: 'Fr. Nowak (Bezirkssozialarbeit)', email: 'nowak@jugendamt.de', status: 'aktiv',
    vertragSeit: '01.09.2022',
    angebote: [
      { bezeichnung: 'Fallkonferenz §8a SGB VIII', haeufigkeit: 'nach Bedarf' },
      { bezeichnung: 'Beratung Schutzkonzept', haeufigkeit: 'jährlich', naechsterTermin: '30.06.2026' },
    ],
    notiz: 'Insofern erfahrene Fachkraft gem. §8b SGB VIII',
  },
  {
    id: 'kp5', name: 'Caritas Fachberatung', typ: 'foerderung',
    kontaktperson: 'Fr. Huber', telefon: '0221 / 555 123', status: 'aktiv',
    angebote: [
      { bezeichnung: 'Qualitätsentwicklung & SEA', haeufigkeit: '2–3× jährlich', naechsterTermin: '20.05.2026' },
      { bezeichnung: 'Teamentwicklung', haeufigkeit: 'nach Bedarf' },
    ],
  },
]

export default function KooperationspartnerPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = PARTNER.filter(p => p.status === 'aktiv').length

  const gefiltert = PARTNER.filter(p =>
    filterTyp === 'alle' || p.typ === filterTyp
  )

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PARTNER.length} Kooperationspartner: ${aktiv} aktiv. Nächste Termine: Ergotherapie 28.04., Turnhalle 29.04., Schnuppertag Grundschule 15.06. Caritas-Fachberatung Mai vormerken.`)
      setKiLaedt(false)
    }, 950)
  }

  const typen: PartnerTyp[] = ['schule', 'therapeut', 'verein', 'behoerde', 'foerderung']

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-teal-500" /> Kooperationspartner
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Externe Partner · Angebote · Vereinbarungen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Partner',    val: PARTNER.length, color: 'text-teal-700' },
          { label: 'Aktiv',      val: aktiv,          color: 'text-green-600' },
          { label: 'Angebote',   val: PARTNER.reduce((s, p) => s + p.angebote.length, 0), color: 'text-teal-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Kooperationsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Kooperationsübersicht'}
        </button>
      )}

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilterTyp('alle')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === 'alle' ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
          Alle
        </button>
        {typen.map(t => (
          <button key={t} onClick={() => setFilterTyp(t)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-600 border-teal-200'}`}>
            {TYP_CFG[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(p => {
          const isOpen = expanded === p.id
          const typCfg = TYP_CFG[p.typ]
          const statusCfg = STATUS_CFG[p.status]
          const naechsteTermine = p.angebote.filter(a => a.naechsterTermin)
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900 truncate">{p.name}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold shrink-0 ${typCfg.farbe}`}>{typCfg.label}</span>
                  </div>
                  <p className="text-[9px] text-teal-400 mt-0.5">{p.kontaktperson}{p.vertragSeit && ` · seit ${p.vertragSeit}`}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-semibold ${statusCfg.farbe}`}>{statusCfg.label}</span>
                    {naechsteTermine.length > 0 && (
                      <span className="text-[9px] text-blue-500">
                        <Clock className="w-2.5 h-2.5 inline mr-0.5" />{naechsteTermine[0].naechsterTermin}
                      </span>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  {p.email && <p className="text-[9px] text-teal-400">✉ {p.email}</p>}
                  {p.telefon && <p className="text-[9px] text-teal-400">☎ {p.telefon}</p>}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide">Angebote</p>
                    {p.angebote.map((a, i) => (
                      <div key={i} className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] text-teal-900 font-medium">{a.bezeichnung}</p>
                          <p className="text-[9px] text-teal-400">{a.haeufigkeit}</p>
                        </div>
                        {a.naechsterTermin && (
                          <span className="text-[9px] text-blue-500 shrink-0">{a.naechsterTermin}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {p.notiz && (
                    <div className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-2 py-1.5">
                      <Star className="w-2.5 h-2.5 inline mr-1" />{p.notiz}
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
