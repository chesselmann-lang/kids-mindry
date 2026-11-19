'use client'

import { useState } from 'react'
import { Network, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, Phone } from 'lucide-react'

// ── Vernetzung — kids-mindry ──────────────────────────────────────────────────
// Vernetzung · Kooperationspartner · Netzwerke · Fachdienste · Termine

type PartnerTyp = 'jugendamt' | 'schule' | 'gesundheit' | 'beratung' | 'freizeit' | 'foerderung' | 'sonstiges'
type KoopStatus = 'aktiv' | 'geplant' | 'ruhend' | 'beendet'

interface KoopPartner {
  id: string
  name: string
  typ: PartnerTyp
  status: KoopStatus
  ansprechperson: string
  kontakt: string
  koopSeit: string
  aktivitaeten: string[]
  naechsterTermin?: string
  wichtig?: boolean
}

const TYP_CFG: Record<PartnerTyp, { label: string; emoji: string; farbe: string }> = {
  jugendamt:  { label: 'Jugendamt',      emoji: '🏛️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  schule:     { label: 'Schule',         emoji: '🏫', farbe: 'bg-green-50 text-green-700 border-green-200' },
  gesundheit: { label: 'Gesundheit',     emoji: '🏥', farbe: 'bg-red-50 text-red-700 border-red-200' },
  beratung:   { label: 'Beratungsstelle',emoji: '💬', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  freizeit:   { label: 'Freizeit/Kultur',emoji: '🎨', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  foerderung: { label: 'Förderung',      emoji: '⭐', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  sonstiges:  { label: 'Sonstiges',      emoji: '🤝', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const STATUS_CFG: Record<KoopStatus, { label: string; farbe: string; dot: string }> = {
  aktiv:    { label: 'Aktiv',   farbe: 'text-green-600', dot: 'bg-green-400' },
  geplant:  { label: 'Geplant', farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  ruhend:   { label: 'Ruhend',  farbe: 'text-gray-400',  dot: 'bg-gray-300' },
  beendet:  { label: 'Beendet', farbe: 'text-red-400',   dot: 'bg-red-300' },
}

const PARTNER: KoopPartner[] = [
  {
    id: 'p1', name: 'Stadtjugendamt Musterstadt', typ: 'jugendamt', status: 'aktiv',
    ansprechperson: 'Frau Steinke (ASD)', kontakt: '0123 – 456 700',
    koopSeit: '2019', wichtig: true,
    aktivitaeten: ['§8a Kooperationsvereinbarung', 'Regelmäßige Fachgespräche', 'Gemeinsame Hilfeplanung'],
    naechsterTermin: '12.05.2026',
  },
  {
    id: 'p2', name: 'Grundschule Am Park', typ: 'schule', status: 'aktiv',
    ansprechperson: 'Fr. Dr. Maier (SL)', kontakt: '0123 – 456 800',
    koopSeit: '2021',
    aktivitaeten: ['Schulvorbereitung Kl. 0', 'Gegenseitige Hospitationen', 'Übergangsportfolio-Austausch'],
    naechsterTermin: '20.05.2026',
  },
  {
    id: 'p3', name: 'SPZ Musterstadt (Sozialpädiatrisches Zentrum)', typ: 'gesundheit', status: 'aktiv',
    ansprechperson: 'Dr. Bauer', kontakt: '0123 – 456 900',
    koopSeit: '2020', wichtig: true,
    aktivitaeten: ['Frühförderung I+E', 'Fachliche Beratung Inklusion', 'Elternberatung auf Anfrage'],
  },
  {
    id: 'p4', name: 'Erziehungsberatungsstelle', typ: 'beratung', status: 'aktiv',
    ansprechperson: 'Herr Richter', kontakt: '0123 – 456 111',
    koopSeit: '2022',
    aktivitaeten: ['Kollegiale Beratung Fachkräfte', 'Elternsprechstunde 1× monatlich'],
    naechsterTermin: '06.05.2026',
  },
  {
    id: 'p5', name: 'Musikschule Musterstadt', typ: 'freizeit', status: 'aktiv',
    ansprechperson: 'Hr. Lenz', kontakt: '0123 – 456 222',
    koopSeit: '2023',
    aktivitaeten: ['Musikalische Früherziehung 2× wöchentlich', 'Auftritt Sommerfest'],
  },
  {
    id: 'p6', name: 'Familienzentrum Nordstadt', typ: 'foerderung', status: 'geplant',
    ansprechperson: 'Frau König', kontakt: '0123 – 456 333',
    koopSeit: '—',
    aktivitaeten: ['Kooperationsvereinbarung in Vorbereitung', 'Gemeinsame Elternangebote geplant'],
    naechsterTermin: '28.04.2026',
  },
]

export default function VernetzungPage() {
  const [expanded, setExpanded] = useState<string | null>('p1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = PARTNER.filter(p => p.status === 'aktiv').length
  const mitTermin = PARTNER.filter(p => p.naechsterTermin).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PARTNER.length} Kooperationspartner, ${aktiv} aktiv. ${mitTermin} bevorstehende Termine. Familienzentrum: Kooperation in Vorbereitung. Jugendamt-Termin 12.05. nicht vergessen!`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Network className="w-6 h-6 text-teal-500" /> Vernetzung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Kooperationspartner · Netzwerke · Fachdienste · Termine</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Partner',  val: PARTNER.length, color: 'text-teal-700' },
          { label: 'Aktiv',    val: aktiv,          color: 'text-green-600' },
          { label: 'Termine',  val: mitTermin,      color: mitTermin > 0 ? 'text-blue-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Netzwerkübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Netzwerkübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {PARTNER.map(p => {
          const isOpen = expanded === p.id
          const tCfg = TYP_CFG[p.typ]
          const sCfg = STATUS_CFG[p.status]
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {p.wichtig && <Star className="w-2.5 h-2.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{p.name}</p>
                  <p className="text-[9px] text-teal-400">{p.ansprechperson}{p.naechsterTermin ? ` · 📅 ${p.naechsterTermin}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-teal-300 shrink-0" />
                    <p className="text-[9px] text-teal-700">{p.kontakt} · {p.ansprechperson} · Koop. seit {p.koopSeit}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Aktivitäten</p>
                    {p.aktivitaeten.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-300 shrink-0" />
                        <p className="text-[9px] text-teal-700">{a}</p>
                      </div>
                    ))}
                  </div>
                  {p.naechsterTermin && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] text-blue-700 font-semibold">📅 Nächster Termin: {p.naechsterTermin}</p>
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
