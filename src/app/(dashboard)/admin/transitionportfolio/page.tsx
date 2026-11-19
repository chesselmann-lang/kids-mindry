'use client'

import { useState } from 'react'
import { ArrowRightLeft, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock } from 'lucide-react'

// ── Transitionsportfolio — kids-mindry ────────────────────────────────────────
// Übergang Kita → Grundschule · Portfolio · Entwicklungsdokumentation

type TransitionsBereich = 'entwicklung' | 'sprache' | 'sozial' | 'motorik' | 'kreativitaet' | 'selbststaendigkeit' | 'interessen'
type PortfolioStatus = 'aktuell' | 'in_bearbeitung' | 'uebergeben' | 'archiviert'

interface PortfolioEintrag {
  id: string
  kind: string
  alter: string
  bereich: TransitionsBereich
  titel: string
  status: PortfolioStatus
  erstelltVon: string
  datum: string
  zielschule?: string
  inhalte: string[]
  hinweis?: string
}

const BEREICH_CFG: Record<TransitionsBereich, { label: string; emoji: string; farbe: string }> = {
  entwicklung:      { label: 'Entwicklung',       emoji: '🌱', farbe: 'bg-green-50 text-green-700 border-green-200' },
  sprache:          { label: 'Sprache & Literacy', emoji: '💬', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  sozial:           { label: 'Sozial-Emotional',   emoji: '🤝', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  motorik:          { label: 'Motorik',            emoji: '🏃', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  kreativitaet:     { label: 'Kreativität',        emoji: '🎨', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  selbststaendigkeit:{ label: 'Selbstständigkeit', emoji: '⭐', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  interessen:       { label: 'Interessen',         emoji: '🔍', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<PortfolioStatus, { label: string; farbe: string; dot: string }> = {
  aktuell:       { label: 'Aktuell',        farbe: 'text-green-600', dot: 'bg-green-400' },
  in_bearbeitung:{ label: 'In Bearbeitung', farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  uebergeben:    { label: 'Übergeben',      farbe: 'text-teal-600',  dot: 'bg-teal-400' },
  archiviert:    { label: 'Archiviert',     farbe: 'text-gray-400',  dot: 'bg-gray-300' },
}

const EINTRAEGE: PortfolioEintrag[] = [
  {
    id: 'tp1', kind: 'Lena M.', alter: '5 J. 8 M.', bereich: 'entwicklung',
    titel: 'Ganzheitliches Entwicklungsportfolio',
    status: 'aktuell', erstelltVon: 'Fr. Müller', datum: '15.04.2026',
    zielschule: 'Grundschule Am Park',
    inhalte: ['Entwicklungsbeobachtungen Kita-Zeit (3 Jahre)', 'Meilensteine Sprache, Motorik, Soziales', 'Fotos + Werkproben chronologisch', 'Elternrückmeldungen integriert'],
  },
  {
    id: 'tp2', kind: 'Ben K.', alter: '5 J. 11 M.', bereich: 'sprache',
    titel: 'Sprachentwicklungsdokumentation',
    status: 'in_bearbeitung', erstelltVon: 'Fr. Schmidt', datum: '20.04.2026',
    zielschule: 'Grundschule Sonnenhof',
    inhalte: ['Delfin-4 Sprachstandserhebung (03/2026)', 'Deutschförderkurs 2× wöchentlich', 'Mehrsprachigkeit: DE + TR', 'Abschluss-Sprachprofil bis 30.04.'],
    hinweis: 'Noch ausstehend: Elternunterschrift',
  },
  {
    id: 'tp3', kind: 'Sofia R.', alter: '6 J. 1 M.', bereich: 'selbststaendigkeit',
    titel: 'Übergangsportfolio — Schulfähigkeitsprofil',
    status: 'uebergeben', erstelltVon: 'Fr. Müller', datum: '01.04.2026',
    zielschule: 'Grundschule Mitte',
    inhalte: ['Schulfähigkeitsprofil NRW ausgefüllt', 'Elterngespräch 28.03.2026', 'Übergabe an Grundschule erfolgt', 'Datenschutzeinwilligung unterschrieben'],
  },
  {
    id: 'tp4', kind: 'Max T.', alter: '5 J. 5 M.', bereich: 'sozial',
    titel: 'Sozial-emotionale Entwicklungsdokumentation',
    status: 'aktuell', erstelltVon: 'Hr. Weber', datum: '10.04.2026',
    inhalte: ['Beobachtungsbogen sozial-emotional', 'Peer-Interaktionen dokumentiert', 'Besondere Stärken: Empathie + Kooperation', 'Empfehlung: keine Rückstellung nötig'],
  },
  {
    id: 'tp5', kind: 'Hanna W.', alter: '5 J. 9 M.', bereich: 'motorik',
    titel: 'Fein- und Grobmotorik-Profil',
    status: 'in_bearbeitung', erstelltVon: 'Fr. Schmidt', datum: '18.04.2026',
    inhalte: ['Motorischer Entwicklungstest (MOTEFIT)', 'Ergotherapeutische Empfehlung liegt vor', 'Stiftführung + Schere: förderbedürftig', 'Elternberatung: 28.04.2026'],
    hinweis: 'Ergotherapie-Bericht noch ausstehend',
  },
]

export default function TransitionsportfolioPage() {
  const [expanded, setExpanded] = useState<string | null>('tp1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktuell = EINTRAEGE.filter(e => e.status === 'aktuell').length
  const uebergeben = EINTRAEGE.filter(e => e.status === 'uebergeben').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Portfolios, ${aktuell} aktuell, ${uebergeben} übergeben. Ben K.: Elternunterschrift fehlt. Hanna W.: Ergotherapie-Bericht ausstehend. Übergabe GS Mitte abgeschlossen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24 text-teal-900">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-teal-500" /> Transitionsportfolio
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Übergang Kita → Schule · Entwicklungsdokumentation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Portfolios', val: EINTRAEGE.length,  color: 'text-teal-700' },
          { label: 'Aktuell',   val: aktuell,            color: 'text-green-600' },
          { label: 'Übergeben', val: uebergeben,         color: 'text-teal-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Portfolioübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Portfolioübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const bCfg = BEREICH_CFG[e.bereich]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 bg-white flex items-center justify-center shrink-0 text-lg">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{e.kind} · {e.titel}</p>
                  <p className="text-[9px] text-teal-400">{e.alter} · {e.erstelltVon} · {e.datum}{e.zielschule ? ` → ${e.zielschule}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div>
                    {e.inhalte.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-teal-500" />
                        <p className="text-[9px] text-teal-800">{item}</p>
                      </div>
                    ))}
                  </div>
                  {e.hinweis && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      <p className="text-[8px] text-amber-700">{e.hinweis}</p>
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
