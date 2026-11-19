'use client'

import { useState } from 'react'
import { Utensils, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Essensversorgung — kids-mindry ─────────────────────────────────────────────
// Mittagessen · HACCP · Speiseplan · Lieferant · Allergene · DGE

type EssensTyp = 'lieferant' | 'speiseplan' | 'haccp' | 'allergene' | 'dge' | 'beschwerden' | 'kueche'
type EssensStatus = 'ok' | 'pruefung' | 'massnahme' | 'kritisch' | 'abgeschlossen'

interface EssensEintrag {
  id: string
  typ: EssensTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: EssensStatus
  punkte: string[]
}

const TYP_CFG: Record<EssensTyp, { label: string; emoji: string; farbe: string }> = {
  lieferant:  { label: 'Lieferant/Catering', emoji: '🚚', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  speiseplan: { label: 'Speiseplan',         emoji: '📋', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  haccp:      { label: 'HACCP-Kontrolle',    emoji: '🔬', farbe: 'bg-red-50 text-red-700 border-red-200' },
  allergene:  { label: 'Allergene/Diäten',   emoji: '⚠️', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  dge:        { label: 'DGE-Qualität',       emoji: '🥗', farbe: 'bg-green-50 text-green-700 border-green-200' },
  beschwerden:{ label: 'Beschwerden/Rückm.', emoji: '💬', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  kueche:     { label: 'Küche/Ausstattung',  emoji: '🍳', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<EssensStatus, { label: string; farbe: string }> = {
  ok:          { label: 'OK',           farbe: 'text-green-600' },
  pruefung:    { label: 'In Prüfung',   farbe: 'text-teal-600' },
  massnahme:   { label: 'Maßnahme',     farbe: 'text-orange-500' },
  kritisch:    { label: 'Kritisch!',    farbe: 'text-red-600' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-400' },
}

const EINTRAEGE: EssensEintrag[] = [
  {
    id: 'ev1', typ: 'lieferant', titel: 'Cateringvertrag — Küchenservice Schulze',
    datum: 'Vertrag bis: Aug 2027', verantwortlich: 'Träger + SL', status: 'ok',
    punkte: ['Lieferant: Küchenservice Schulze GmbH (zertifiziert)', 'Liefertage: Mo–Fr 11:45 Uhr (Warmhalten bis 12:30)', 'Vertrag: bis Aug 2027 (nächste Ausschreibung Jun 2027)', 'Preis: 3,60 €/Kind (davon: Eltern 2,00 €, Träger 1,00 €, Zuschuss 0,60 €)', 'Rechnung: monatlich (Anwesenheitsliste Basis)'],
  },
  {
    id: 'ev2', typ: 'haccp', titel: 'HACCP-Eigenkontrolle & Küchenhygiene',
    datum: 'Letzte Prüfung: 15.04.2026', verantwortlich: 'Fr. Wagner (HACCP-Beauftragte)', status: 'ok',
    punkte: ['HACCP-Beauftragte: Fr. Wagner (Zertifikat gültig bis Dez 2027)', 'Temperaturkontrollen: täglich (Kühlschrank + Anlieferung)', 'HACCP-Kontrollbuch: täglich geführt, Träger-Einsicht jährl.', 'Letzte Lebensmittelkontrolle (LKA): Mär 2026 — keine Beanstandungen', 'Reinigungsplan: wöchentlich + monatlich Tiefenreinigung'],
  },
  {
    id: 'ev3', typ: 'allergene', titel: 'Allergene & besondere Ernährungsbedürfnisse',
    datum: 'Aktualisiert: Sep 2025', verantwortlich: 'Fr. Wagner + Gruppenteams', status: 'ok',
    punkte: ['Kinder mit Allergien/Diäten: 5 (Erdnuss: 1, Laktose: 2, Gluten: 1, vegetarisch: 1)', 'Allergenmatrix: täglich ausgehängt (EU-Lebensmittelinformationsverordnung)', 'Cateringvertrag: Sondermahlzeiten bestellt (Mehrpreis 0,40 €/Kind)', 'Notfallplan Allergie: Adrenalin-Autoinjektor (1 Kind), Elternanweisung', 'Eltern-Info-Bogen: bei Aufnahme (Update jährl.)'],
  },
  {
    id: 'ev4', typ: 'dge', titel: 'DGE-Qualitätsstandard Kitaverpflegung',
    datum: 'Lfd. Überprüfung', verantwortlich: 'SL + Lieferant', status: 'pruefung',
    punkte: ['DGE-Standards: angestrebt (kein Zertifikat, aber Orientierung)', 'Bisher erfüllt: Gemüse 3x/Woche, Vollkorn >50%, kein Schwein bei Bedarf', 'Bio-Anteil: ca. 20 % (Ziel 30 % — Lieferant befragt)', 'Zucker/Salz: Caterer zugesagt (Zielwert DGE einhalten)', 'Nächste Speiseplanbewertung: Jun 2026 (Eltern-AG Cafeteria)'],
  },
  {
    id: 'ev5', typ: 'beschwerden', titel: 'Rückmeldungen & Beschwerdemanagement Essen',
    datum: 'Lfd.', verantwortlich: 'SL', status: 'massnahme',
    punkte: ['Beschwerden Apr: 3 (Portionsgröße U3 zu klein, 1x Temperatur)', 'Maßnahme: Caterer angesprochen (Portionen U3 +20 % ab Mai)', 'Rückmeldebogen: ausliegen im Eingang (anonym)', 'Kinderbefragung: halbjährl. (Daumen-hoch-System)', 'Letztes Ergebnis Dez 2025: 72 % Daumen hoch'],
  },
]

export default function EssensversorgungPage() {
  const [expanded, setExpanded] = useState<string | null>('ev2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const massnahme = EINTRAEGE.filter(e => e.status === 'massnahme' || e.status === 'kritisch').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Essensbereiche. HACCP: Apr-Kontrolle ok. 5 Kinder mit Allergien/Diäten. Portionsgröße U3: Maßnahme läuft (ab Mai +20%). DGE-Bio-Anteil: 20 %.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Utensils className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Essensversorgung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Mittagessen · HACCP · Allergene · DGE · Lieferant</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche', val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'OK',       val: EINTRAEGE.filter(e => e.status === 'ok').length, color: 'text-green-600' },
          { label: 'Maßnahme', val: massnahme, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {massnahme > 0 && (
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Portionsgröße U3: Maßnahme läuft — ab Mai +20%, nächste Elternbefragung Jun 2026</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Essensübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Essensübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'massnahme' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
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
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
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
