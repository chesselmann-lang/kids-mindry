'use client'

import { useState } from 'react'
import { ShieldAlert, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Brandschutz — kids-mindry ──────────────────────────────────────────────────
// Brandschutzbeauftragter · Feuerlöscher · Evakuierung · Übung · Mängel

type BrandTyp = 'beauftragter' | 'loescher' | 'evakuierung' | 'uebung' | 'rauchmelder' | 'fluchtweg' | 'maengel'
type BrandStatus = 'ok' | 'geprueft' | 'faellig' | 'handlungsbedarf' | 'kritisch'

interface BrandEintrag {
  id: string
  typ: BrandTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: BrandStatus
  punkte: string[]
}

const TYP_CFG: Record<BrandTyp, { label: string; emoji: string; farbe: string }> = {
  beauftragter:{ label: 'Brandschutzbeauftragter', emoji: '👷', farbe: 'bg-red-50 text-red-700 border-red-200' },
  loescher:    { label: 'Feuerlöscher',             emoji: '🧯', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  evakuierung: { label: 'Evakuierungsplan',         emoji: '🚨', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  uebung:      { label: 'Brandschutzübung',         emoji: '🔔', farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rauchmelder: { label: 'Rauchmelder',              emoji: '🔥', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  fluchtweg:   { label: 'Fluchtwege',               emoji: '🚪', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  maengel:     { label: 'Mängelmeldung',            emoji: '⚠️', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<BrandStatus, { label: string; farbe: string }> = {
  ok:             { label: 'OK',             farbe: 'text-teal-600' },
  geprueft:       { label: 'Geprüft',        farbe: 'text-green-600' },
  faellig:        { label: 'Fällig',         farbe: 'text-orange-500' },
  handlungsbedarf:{ label: 'Handlungsbedarf',farbe: 'text-orange-500' },
  kritisch:       { label: 'Kritisch',       farbe: 'text-red-500' },
}

const EINTRAEGE: BrandEintrag[] = [
  {
    id: 'bs1', typ: 'beauftragter', titel: 'Brandschutzbeauftragter Kita',
    datum: 'Zertifizierung: Mär 2025', verantwortlich: 'Hr. Klein (Brandschutzbeauftragter)', status: 'geprueft',
    punkte: ['Brandschutzbeauftragter: Hr. Klein (zertifiziert, § 10 ArbSchG)', 'Unterrichtung neuer Mitarbeiter:innen: innerhalb Probezeit', 'Jährliche Unterweisung: alle MA (Nachweis im Unterweisungsnachweis)', 'Nachweis Apr: 8/9 MA unterwiesen (Fr. Neumann: Probezeit, bis 01.06.)', 'Kontakt Träger-BS-Beauftragter: Dez-Prüfung bestanden (keine Mängel)'],
  },
  {
    id: 'bs2', typ: 'loescher', titel: 'Feuerlöscher & Brandschutzausrüstung',
    datum: 'Nächste Prüfung: Dez 2026', verantwortlich: 'Hr. Klein + Schulträger', status: 'geprueft',
    punkte: ['Feuerlöscher: 4 Stück (Dez 2025 geprüft, nächste Prüfung Dez 2026)', 'Typ: CO2 (Gruppenräume), Pulver (Küche)', 'Löschdecke: Küche (geprüft)', 'Standorte: Flur OG, Gruppenraum U3, Küche, Treppenhaus', 'Defekter Löscher: sofort an Träger melden (Formular Büro)'],
  },
  {
    id: 'bs3', typ: 'evakuierung', titel: 'Evakuierungsplan & Sammelplatz',
    datum: 'Aktualisiert: Sep 2025', verantwortlich: 'SL + Hr. Klein', status: 'ok',
    punkte: ['Evakuierungsplan: aushängen (alle Gruppenräume + Flure)', 'Sammelplatz: Parkplatz Fichtestraße (Schild vorhanden)', 'Aufgabenverteilung: SL (Meldung 112), Gruppenleit. (Kinderzählung)', 'Rollstuhlabstellplatz: EG (kein Aufzug — U-Rollstuhl-Kind: nicht aktuell)', 'Letzter Plan-Update: Sep 2025 (nach Raumumbau Krippegruppe)'],
  },
  {
    id: 'bs4', typ: 'uebung', titel: 'Brandschutzübungen',
    datum: 'Nächste: Jun 2026', verantwortlich: 'SL + Hr. Klein', status: 'faellig',
    punkte: ['Pflicht: 2x/Jahr (§ 22 ArbSchG + Kita-Betriebsordnung)', 'Letzte Übung: Dez 2025 (9 min Evakuierung, gut)', 'Nächste Übung: Jun 2026 (angemeldet Feuerwehr Wuppertal)', 'Kinder werden vorbereitet: Geschichte "Der mutige Feuermann"', 'Protokoll: 10 Jahre aufbewahren (Muster: Büro SL)'],
  },
  {
    id: 'bs5', typ: 'rauchmelder', titel: 'Rauchmelder & Brandmeldung',
    datum: 'Jährl. Prüfung', verantwortlich: 'Schulträger', status: 'geprueft',
    punkte: ['Rauchmelder: alle Räume (Pflicht seit BauO NRW 2018)', 'Letzte Prüfung: Nov 2025 (Schulträger-Gebäudedienst)', 'Nächste Prüfung: Nov 2026 (Termin Schulträger)', 'Brandmeldeanlage: direkte Aufschaltung Feuerwehr (Gebäude)', 'Fehlalarm: 0 in SJ 2025/26 (Vorgabe: Fehlalarme dokumentieren)'],
  },
]

export default function BrandschutzPage() {
  const [expanded, setExpanded] = useState<string | null>('bs4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Brandschutzbereiche. Feuerlöscher geprüft (Dez 2025). Brandschutzübung fällig Jun. Unterweisung: Fr. Neumann bis 01.06. Evakuierungsplan aktuell.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShieldAlert className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Brandschutz
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Beauftragter · Löscher · Evakuierung · Übungen · Rauchmelder</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'OK',        val: EINTRAEGE.filter(e => e.status === 'ok' || e.status === 'geprueft').length, color: 'text-teal-600' },
          { label: 'Fällig',    val: EINTRAEGE.filter(e => e.status === 'faellig' || e.status === 'handlungsbedarf').length, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <p className="text-[10px] text-orange-700 font-semibold">Brandschutzübung Jun 2026 fällig — Fr. Neumann Unterweisung bis 01.06. nachholen!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Brandschutzübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Brandschutzübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${(e.status === 'faellig' || e.status === 'handlungsbedarf') ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
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
