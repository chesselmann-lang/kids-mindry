'use client'

import { useState } from 'react'
import { Handshake, ChevronDown, ChevronUp, Sparkles, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Kooperationen — Mindry Kids Admin ─────────────────────────────────────────
// Kooperationspartner · Netzwerke · Vereinbarungen · Kontakte

type KoopTyp = 'schule' | 'gesundheit' | 'jugendhilfe' | 'sport' | 'kultur' | 'behoerde' | 'foerderer'
type KoopStatus = 'aktiv' | 'in_vorbereitung' | 'ruhend' | 'beendet'

interface KoopAktivitaet {
  beschreibung: string
  datum: string
  erledigt?: boolean
}

interface KoopEintrag {
  id: string
  typ: KoopTyp
  partner: string
  kontakt: string
  vereinbarungSeit: string
  status: KoopStatus
  beschreibung: string
  aktivitaeten: KoopAktivitaet[]
  naechsterKontakt?: string
  notiz?: string
}

const TYP_CFG: Record<KoopTyp, { label: string; emoji: string; farbe: string }> = {
  schule:      { label: 'Schule/Übergang',   emoji: '🏫', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  gesundheit:  { label: 'Gesundheit',        emoji: '🏥', farbe: 'bg-green-50 text-green-700 border-green-200' },
  jugendhilfe: { label: 'Jugendhilfe',       emoji: '🤝', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  sport:       { label: 'Sport & Bewegung',  emoji: '⚽', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  kultur:      { label: 'Kultur & Musik',    emoji: '🎨', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  behoerde:    { label: 'Behörde / Amt',     emoji: '🏛️', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
  foerderer:   { label: 'Förderverein',      emoji: '💛', farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

const STATUS_CFG: Record<KoopStatus, { label: string; farbe: string; dot: string }> = {
  aktiv:         { label: 'Aktiv',          farbe: 'text-green-600',  dot: 'bg-green-400' },
  in_vorbereitung:{ label: 'In Vorbereitung', farbe: 'text-blue-600',  dot: 'bg-blue-400' },
  ruhend:        { label: 'Ruhend',         farbe: 'text-orange-500', dot: 'bg-orange-400' },
  beendet:       { label: 'Beendet',        farbe: 'text-gray-400',   dot: 'bg-gray-300' },
}

const KOOPERATIONEN: KoopEintrag[] = [
  {
    id: 'ko1', typ: 'schule', partner: 'Grundschule Sonnenschein',
    kontakt: 'Fr. Brandt (SL) · 0511/12345', vereinbarungSeit: 'Sept. 2022',
    status: 'aktiv',
    beschreibung: 'Übergangskooperation Kita → Grundschule. Gemeinsame Schnuppertage, Vorschulprogramm, gegenseitige Hospitationen.',
    aktivitaeten: [
      { beschreibung: 'Schnuppertag Vorschulkinder', datum: '18.05.2026' },
      { beschreibung: 'Übergabegespräche Lehrkräfte', datum: 'Jun. 2026' },
      { beschreibung: 'Gemeinsamer Elternabend', datum: 'Apr. 2026', erledigt: true },
    ],
    naechsterKontakt: '18.05.2026',
  },
  {
    id: 'ko2', typ: 'gesundheit', partner: 'Kinderärztliche Gemeinschaftspraxis Dr. Heller',
    kontakt: 'Fr. Dr. Heller · info@praxis-heller.de', vereinbarungSeit: 'Jan. 2024',
    status: 'aktiv',
    beschreibung: 'Kooperation für Frühförderung und U-Untersuchungen. Empfehlungsschreiben, Informationsaustausch (mit Elternzustimmung).',
    aktivitaeten: [
      { beschreibung: 'Jahrestreffen Kooperation', datum: 'Mrz. 2026', erledigt: true },
      { beschreibung: 'Infomaterial aktualisieren', datum: 'Mai 2026' },
    ],
    notiz: 'Datenweitergabe nur mit Elterneinwilligung (§ 203 StGB).',
  },
  {
    id: 'ko3', typ: 'sport', partner: 'TSV Grün-Weiß e.V.',
    kontakt: 'Hr. Klemm (Sportwart) · 0163/55443', vereinbarungSeit: 'Aug. 2023',
    status: 'aktiv',
    beschreibung: 'Bewegungsförderung: monatliches Turnangebot in der Kita durch TSV-Übungsleiter. Beitrag aus Vereinsmitteln.',
    aktivitaeten: [
      { beschreibung: 'Turnstunde Mai', datum: '08.05.2026' },
      { beschreibung: 'Sommerfest gemeinsam', datum: 'Jul. 2026' },
    ],
    naechsterKontakt: '08.05.2026',
  },
  {
    id: 'ko4', typ: 'jugendhilfe', partner: 'Frühförderstelle Kreis',
    kontakt: 'Fr. Vogel · 0511/9988', vereinbarungSeit: 'Okt. 2021',
    status: 'aktiv',
    beschreibung: 'Frühförderung für Kinder mit Entwicklungsverzögerungen nach § 35a SGB VIII. Regelmäßige Fallbesprechungen.',
    aktivitaeten: [
      { beschreibung: 'Fallbesprechung (3 Kinder)', datum: '15.04.2026', erledigt: true },
      { beschreibung: 'Bedarfsmeldung Q2', datum: '30.04.2026' },
    ],
    notiz: 'Vertraulich — Infos nur mit Elternzustimmung weitergeben.',
  },
]

export default function KooperationenPage() {
  const [expanded, setExpanded] = useState<string | null>('ko1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = KOOPERATIONEN.filter(k => k.status === 'aktiv').length
  const offeneAkt = KOOPERATIONEN.flatMap(k => k.aktivitaeten).filter(a => !a.erledigt).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${KOOPERATIONEN.length} Kooperationspartner: ${aktiv} aktiv. ${offeneAkt} geplante Aktivitäten. Schnuppertag Grundschule 18.05.! Frühförderstelle: Bedarfsmeldung Q2 bis 30.04. Datenschutz beachten.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Handshake className="w-6 h-6 text-teal-500" /> Kooperationen
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Netzwerke · Partner · Vereinbarungen · Aktivitäten</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Partner',   val: KOOPERATIONEN.length, color: 'text-teal-700' },
          { label: 'Aktiv',     val: aktiv,                color: 'text-green-600' },
          { label: 'Aktivit.',  val: offeneAkt,            color: offeneAkt > 0 ? 'text-blue-600' : 'text-gray-400' },
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

      <div className="space-y-2">
        {KOOPERATIONEN.map(k => {
          const isOpen = expanded === k.id
          const tCfg = TYP_CFG[k.typ]
          const sCfg = STATUS_CFG[k.status]
          return (
            <div key={k.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{k.partner}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{k.kontakt} · seit {k.vereinbarungSeit}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-700 leading-relaxed">{k.beschreibung}</p>
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Aktivitäten</p>
                    {k.aktivitaeten.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${a.erledigt ? 'bg-green-400' : 'bg-blue-400'}`} />
                        <p className={`text-[9px] flex-1 ${a.erledigt ? 'line-through text-teal-300' : 'text-teal-800'}`}>{a.beschreibung}</p>
                        <span className="text-[8px] text-teal-400">{a.datum}</span>
                      </div>
                    ))}
                  </div>
                  {k.naechsterKontakt && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-blue-700 font-semibold">→ Nächster Kontakt: {k.naechsterKontakt}</p>
                    </div>
                  )}
                  {k.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{k.notiz}</p>
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
