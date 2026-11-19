'use client'

import { useState } from 'react'
import { ScrollText, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Trägervertrag — kids-mindry ────────────────────────────────────────────────
// KiBiz · Betriebserlaubnis · Träger-Kita-Vereinbarung · Finanzierung · Jugendamt

type VertragTyp = 'betriebserlaubnis' | 'traegervertrag' | 'kibiz' | 'jugendamt' | 'finanzierung' | 'versicherung' | 'satzung'
type VertragStatus = 'gueltig' | 'pruefung' | 'erneuerung' | 'abgelaufen' | 'kritisch'

interface VertragEintrag {
  id: string
  typ: VertragTyp
  titel: string
  gueltigBis?: string
  verantwortlich: string
  status: VertragStatus
  punkte: string[]
}

const TYP_CFG: Record<VertragTyp, { label: string; emoji: string; farbe: string }> = {
  betriebserlaubnis: { label: 'Betriebserlaubnis', emoji: '🏛️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  traegervertrag:    { label: 'Träger-Kita-Vertrag', emoji: '📋', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kibiz:             { label: 'KiBiz-Vereinbarung', emoji: '📜', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  jugendamt:         { label: 'Jugendamt',          emoji: '🏢', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  finanzierung:      { label: 'Finanzierung',       emoji: '💰', farbe: 'bg-green-50 text-green-700 border-green-200' },
  versicherung:      { label: 'Versicherung',       emoji: '🛡️', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  satzung:           { label: 'Satzung/Statuten',   emoji: '📑', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
}

const STATUS_CFG: Record<VertragStatus, { label: string; farbe: string }> = {
  gueltig:    { label: 'Gültig',         farbe: 'text-green-600' },
  pruefung:   { label: 'In Prüfung',     farbe: 'text-teal-600' },
  erneuerung: { label: 'Erneuerung fäl.', farbe: 'text-orange-500' },
  abgelaufen: { label: 'Abgelaufen!',    farbe: 'text-red-600' },
  kritisch:   { label: 'Kritisch!',      farbe: 'text-red-600' },
}

const EINTRAEGE: VertragEintrag[] = [
  {
    id: 'tv1', typ: 'betriebserlaubnis', titel: 'Betriebserlaubnis LVR / Landesjugendamt',
    gueltigBis: 'Unbefristet (Auflagen jährl.)', verantwortlich: 'SL + Träger', status: 'gueltig',
    punkte: ['Unbefristete Erlaubnis: erteilt LVR (§ 45 SGB VIII)', 'Betriebserlaubnisauflagen: Jahresbericht bis 31.03. (abgegeben)', 'Kapazität: 30 Plätze (U3: 10, Ü3: 20) — wie genehmigt', 'Fachkraft-Kind-Schlüssel: KiBiz-konform (monatliche Meldung)', 'Änderungen meldepflichtig: Personal, Räume, Konzeption'],
  },
  {
    id: 'tv2', typ: 'kibiz', titel: 'KiBiz-Betriebsvereinbarung 2025/26',
    gueltigBis: 'Jul 2026', verantwortlich: 'Träger + Jugendamt Stadt', status: 'gueltig',
    punkte: ['KiBiz NRW (§ 12): jährliche Betriebskostenvereinbarung', 'Kindpauschalen: U3 (3.052 €/Kind/Mon lt. MSW 2025)', 'Landeszuschuss 86,7 %: monatliche Auszahlung Träger', 'Elternbeiträge: lt. städtischer Satzung (einkommensabhängig)', 'Folge-Vereinbarung 2026/27: Verhandlung Sep–Okt 2026'],
  },
  {
    id: 'tv3', typ: 'traegervertrag', titel: 'Träger-Kita-Dienstvereinbarung',
    gueltigBis: 'Dez 2026', verantwortlich: 'SL + Geschäftsführung Träger', status: 'gueltig',
    punkte: ['Interne Vereinbarung: SL-Kompetenzen, Budget, Personalverantwortung', 'Qualitätsziele: verankert (jährl. Auswertungsgespräch Sep)', 'Letztes Auswertungsgespräch: 18.09.2025 (Protokoll abgelegt)', 'Weiterentwicklung Konzept: mit Träger abzustimmen', 'Kündigung/Änderung: 3 Monate Frist (§ 8 Vereinbarung)'],
  },
  {
    id: 'tv4', typ: 'jugendamt', titel: 'Jugendamtsmeldungen & Betriebsaufsicht',
    gueltigBis: 'Lfd.', verantwortlich: 'SL', status: 'pruefung',
    punkte: ['Meldepflichten: Schutzfälle (§ 8a SGB VIII), Unfälle, Personalwechsel', 'Aktuell: 1 §8a-Fall gemeldet (ASD informiert Apr 2026)', 'Jahresbericht: abgegeben 31.03.2026', 'Beratungsbesuch JA: geplant Q3 2026 (Routinebesuch)', 'Kontakt JA: Fr. Kramer (zuständige Sachbearbeiterin)'],
  },
  {
    id: 'tv5', typ: 'versicherung', titel: 'Versicherungen & GUV-Träger',
    gueltigBis: 'Dez 2026', verantwortlich: 'Träger (Verwaltung)', status: 'erneuerung',
    punkte: ['GUV (Unfallkasse NRW): Kinder + Personal versichert', 'Haftpflicht: Träger-Sammelversicherung (läuft Dez 2026 — Erneuerung nötig!)', 'Inventarversicherung: Einrichtungsinhalt 85.000 €', 'Vermögensschadenhaftpflicht: Träger-Ebene', 'Erneuerung Haftpflicht: Träger bis Okt 2026 klären'],
  },
]

export default function TraegervertragPage() {
  const [expanded, setExpanded] = useState<string | null>('tv2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const erneuerung = EINTRAEGE.filter(e => e.status === 'erneuerung' || e.status === 'abgelaufen' || e.status === 'kritisch').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Vertragsbereiche. Betriebserlaubnis unbefristet. KiBiz-Vereinbarung gültig bis Jul 2026. Haftpflicht: Erneuerung Dez 2026 → Träger informieren.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ScrollText className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Trägervertrag
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>KiBiz · Betriebserlaubnis · Jugendamt · Finanzierung · Versicherung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',   val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'Gültig',     val: EINTRAEGE.filter(e => e.status === 'gueltig').length, color: 'text-green-600' },
          { label: 'Erneuerung', val: erneuerung, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {erneuerung > 0 && (
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Haftpflichtversicherung läuft Dez 2026 aus — Träger bis Okt informieren!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Vertragsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Vertragsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'erneuerung' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.gueltigBis ? ` · bis ${e.gueltigBis}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {e.punkte.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{p}</p>
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
