'use client'

import { useState } from 'react'
import { Handshake, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star } from 'lucide-react'

// ── Kooperation — kids-mindry ──────────────────────────────────────────────────
// Partner · Grundschulen · Frühförderung · Netzwerke · Jugendamt

type KoopTyp = 'grundschule' | 'fruehfoerderung' | 'jugendamt' | 'therapeuten' | 'verein' | 'kirche' | 'netzwerk'
type KoopStatus = 'aktiv' | 'angebahnt' | 'pausiert' | 'beendet'

interface KoopEintrag {
  id: string
  typ: KoopTyp
  name: string
  ansprechpartner: string
  status: KoopStatus
  seit?: string
  naechsterKontakt?: string
  wichtig?: boolean
  aktivitaeten: string[]
}

const TYP_CFG: Record<KoopTyp, { label: string; emoji: string; farbe: string }> = {
  grundschule:    { label: 'Grundschule',        emoji: '🏫', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  fruehfoerderung:{ label: 'Frühförderung',      emoji: '🌱', farbe: 'bg-green-50 text-green-700 border-green-200' },
  jugendamt:      { label: 'Jugendamt/ASD',      emoji: '🏛️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  therapeuten:    { label: 'Therapeuten',        emoji: '🩺', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  verein:         { label: 'Verein/Ehrenamt',    emoji: '🤝', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  kirche:         { label: 'Kirche/Träger',      emoji: '⛪', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  netzwerk:       { label: 'Netzwerk/Verbund',   emoji: '🌐', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<KoopStatus, { label: string; farbe: string }> = {
  aktiv:     { label: 'Aktiv',     farbe: 'text-green-600' },
  angebahnt: { label: 'Angebahnt', farbe: 'text-blue-500' },
  pausiert:  { label: 'Pausiert',  farbe: 'text-orange-400' },
  beendet:   { label: 'Beendet',   farbe: 'text-gray-400' },
}

const KOOPERATION: KoopEintrag[] = [
  {
    id: 'ko1', typ: 'grundschule', name: 'Grundschule Am Park — Übergang Kita→Schule',
    ansprechpartner: 'Rektorin Fr. Weber', status: 'aktiv', seit: 'Sep 2020',
    naechsterKontakt: '15.05.2026 (Übergabegespräch)',
    wichtig: true,
    aktivitaeten: ['Jährliches Übergabegespräch: Mai 2026 (7 Kinder)', 'Gegenseitige Besuche: Vorschulkinder besuchen Kl.1 (Jun)', 'Schulfähigkeitsprofil: gemeinsam ausgefüllt', 'Kooperationsvereinbarung: unterschrieben 2020, läuft weiter', 'Kontakt Kindergartenkinder: bei Needs auch außerplanmäßig'],
  },
  {
    id: 'ko2', typ: 'fruehfoerderung', name: 'Sozialpädiatrisches Zentrum (SPZ) — Frühförderung',
    ansprechpartner: 'Hr. Lange (Koordinator)', status: 'aktiv', seit: 'Jan 2022',
    aktivitaeten: ['Aktuell: 3 Kinder in Frühförderung (SPZ-Maßnahme)', 'Fachgespräche: nach Bedarf (Schweigepflichtsentbindung vorhanden)', 'Überleitung: nach §79 SGB VIII (rechtzeitig einleiten)', 'Frühförderplan: in Kita-Akte hinterlegt', 'Bericht: jährlich durch SPZ an Kita'],
  },
  {
    id: 'ko3', typ: 'jugendamt', name: 'Allgemeiner Sozialer Dienst (ASD) — Familienbegleitung',
    ansprechpartner: 'Fr. Bauer (Bez.sozialarbeiterin)', status: 'aktiv', seit: 'laufend',
    wichtig: true,
    aktivitaeten: ['Meldepflicht §8a SGB VIII: Verfahren in Kraft', 'Aktuelle Schutzfälle: 1 (vertraulich, Akte SL)', 'Fallkonferenz: nach Bedarf (nächste auf Anfrage)', 'Insofern erfahrene Fachkraft: Fr. Schmidt (zertifiziert)', 'Notfallkontakt ASD: 0211-8995600'],
  },
  {
    id: 'ko4', typ: 'netzwerk', name: 'Kita-Verbund Stadtmitte — 6 Einrichtungen',
    ansprechpartner: 'Koordinatorin Fr. Otto (AWO)', status: 'aktiv', seit: 'Mär 2023',
    naechsterKontakt: '03.06.2026 (Verbundtreffen)',
    aktivitaeten: ['Treffen: 4× jährlich (nächstes: Jun 2026)', 'Thema Jun: Inklusionskonzept + Fachkräftemangel', 'Gemeinsame Fortbildungen: 2× im Jahr', 'Qualitätszirkel: monatlich (digital, 1h)', 'Vernetzung mit Jugendamt via Verbund'],
  },
  {
    id: 'ko5', typ: 'therapeuten', name: 'Logopädie + Ergotherapie — Praxis Martini',
    ansprechpartner: 'Fr. Martini', status: 'aktiv', seit: 'Apr 2021',
    aktivitaeten: ['2 Kinder derzeit in Logopädie (Verordnung vorhanden)', '1 Kind Ergotherapie (Elternzustimmung vorhanden)', 'Kurzinformation an Kita: nach Bedarf (mit Elterneinwilligung)', 'Empfehlungen: an Eltern bei Bedarf durch Fachkraft', 'Hausbesuche auf Wunsch: einmalig möglich'],
  },
]

export default function KooperationPage() {
  const [expanded, setExpanded] = useState<string | null>('ko1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = KOOPERATION.filter(k => k.status === 'aktiv').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${KOOPERATION.length} Kooperationspartner, ${aktiv} aktiv. Übergabegespräch GS Am Park: 15.05. (7 Kinder). ASD: 1 aktiver Schutzfall. Kita-Verbund: Jun-Treffen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Handshake className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Kooperationen
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Grundschule · Frühförderung · Jugendamt · Therapeuten · Netzwerk</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Partner', val: KOOPERATION.length, color: 'text-teal-600' },
          { label: 'Aktiv',   val: aktiv,              color: 'text-green-600' },
          { label: 'Wichtig', val: KOOPERATION.filter(k => k.wichtig).length, color: 'text-amber-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Kooperationsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Kooperationsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {KOOPERATION.map(k => {
          const isOpen = expanded === k.id
          const tCfg = TYP_CFG[k.typ]
          const sCfg = STATUS_CFG[k.status]
          return (
            <div key={k.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {k.wichtig && <Star className="w-2.5 h-2.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{k.name}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{k.ansprechpartner}{k.seit ? ` · seit ${k.seit}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {k.naechsterKontakt && (
                    <p className="text-[9px] font-semibold" style={{ color: 'var(--color-primary)' }}>Nächster Kontakt: {k.naechsterKontakt}</p>
                  )}
                  {k.aktivitaeten.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
