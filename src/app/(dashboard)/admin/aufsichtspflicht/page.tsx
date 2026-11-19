'use client'

import { useState } from 'react'
import { Eye, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Aufsichtspflicht — kids-mindry ─────────────────────────────────────────────
// Aufsichtsplan · Bring-/Abholzeiten · Unfälle · Dokumentation · Rechtliches

type AufsichtTyp = 'aufsichtsplan' | 'bringabholzeit' | 'unfall' | 'dokumentation' | 'abholrecht' | 'allein' | 'rechtliches'
type AufsichtStatus = 'ok' | 'aktiv' | 'faellig' | 'handlungsbedarf' | 'kritisch'

interface AufsichtEintrag {
  id: string
  typ: AufsichtTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: AufsichtStatus
  punkte: string[]
}

const TYP_CFG: Record<AufsichtTyp, { label: string; emoji: string; farbe: string }> = {
  aufsichtsplan:{ label: 'Aufsichtsplan',    emoji: '📋', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  bringabholzeit:{ label: 'Bring-/Abholzeit', emoji: '⏰', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  unfall:       { label: 'Unfallerfassung',  emoji: '🩹', farbe: 'bg-red-50 text-red-700 border-red-200' },
  dokumentation:{ label: 'Dokumentation',   emoji: '📝', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  abholrecht:   { label: 'Abholberechtigte',emoji: '👤', farbe: 'bg-green-50 text-green-700 border-green-200' },
  allein:       { label: 'Allein-nach-Hause',emoji: '🚶', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  rechtliches:  { label: 'Rechtliches',      emoji: '⚖️', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<AufsichtStatus, { label: string; farbe: string }> = {
  ok:             { label: 'OK',             farbe: 'text-teal-600' },
  aktiv:          { label: 'Aktiv',          farbe: 'text-blue-500' },
  faellig:        { label: 'Fällig',         farbe: 'text-orange-500' },
  handlungsbedarf:{ label: 'Handlungsbedarf',farbe: 'text-orange-500' },
  kritisch:       { label: 'Kritisch',       farbe: 'text-red-500' },
}

const EINTRAEGE: AufsichtEintrag[] = [
  {
    id: 'ap1', typ: 'aufsichtsplan', titel: 'Aufsichtsplan Kita',
    datum: 'Aktuell SJ 2025/26', verantwortlich: 'SL + Gruppenleitung', status: 'ok',
    punkte: ['Aufsichtsplan: aushängen (Büro SL, Gruppenräume)', 'Schlüsselzeiten: Frühaufsicht ab 7:00 (mind. 2 Erzieher:innen)', 'Mittagszeit: 12:00–14:00 erhöhter Bedarf (U3: 1:4, Ü3: 1:6)', 'Spätaufsicht: letzte Fachkraft weg wenn letztes Kind abgeholt', 'Vertretung Aufsicht: Springerpool (bei Krankheit sofort melden)'],
  },
  {
    id: 'ap2', typ: 'bringabholzeit', titel: 'Bring- und Abholzeiten',
    datum: 'Betriebszeiten 7:00–17:00', verantwortlich: 'Erzieher:innen', status: 'aktiv',
    punkte: ['Bringzeit: 7:00–9:00 (pünktlich — danach Gruppenaktivitäten)', 'Abholzeit: 12:00–14:00 (Kernzeit) + 15:00–17:00', 'Verspätete Abholung: ab 17:10 — 1. Versuch Eltern (Notfallnummer)', 'Protokoll: verspätete Abholungen (nach 17:00) — Gespräch mit Eltern', 'Notfall keine Abholung: JA informieren (nach 2h ohne Kontakt)'],
  },
  {
    id: 'ap3', typ: 'unfall', titel: 'Unfallerfassung & Meldung',
    datum: 'SJ 2025/26: 2 Unfälle', verantwortlich: 'Ersthelfer + SL', status: 'ok',
    punkte: ['Unfälle SJ 2025/26: 2 (1x Sturz Klettergerüst Nov, 1x Bissverletzung Feb)', 'Meldepflicht: alle Unfälle mit Arztbesuch → GUV (Formular 24h)', 'Erste Hilfe: alle MA haben Ersthelfer-Zertifikat (aktuell)', 'Ersthelfer-Auffrischung: nächste Schulung Sep 2026', 'Unfallbuch: Büro SL (chronologisch, 10 Jahre aufbewahren)'],
  },
  {
    id: 'ap4', typ: 'abholrecht', titel: 'Abholberechtigte & Vollmachten',
    datum: 'Aktuell', verantwortlich: 'Gruppenerzieher:innen', status: 'handlungsbedarf',
    punkte: ['Abholberechtigte: in Anmeldungsunterlagen (Foto bei Unbekannten)', '2 Kinder: nur ein Elternteil abholberechtigt (Sorgerechtsregelung)', 'Vollmachten: schriftlich (Formular Büro), jährl. aktualisieren', 'Aufgabe: 3 Familien müssen Vollmacht erneuern (bis 15.05.)', 'Unbekannte Person: Kind NICHT mitgeben — SL sofort informieren'],
  },
  {
    id: 'ap5', typ: 'allein', titel: 'Allein-nach-Hause-Regelung',
    datum: 'Ab Ü3 auf Antrag', verantwortlich: 'Eltern (Antrag) + SL', status: 'ok',
    punkte: ['Allein nach Hause: ab Ü3 (ca. 4 Jahre) auf schriftlichen Elternantrag', 'Formular: "Erlaubnis Allein nach Hause" (Büro)', 'Derzeit: 4 Kinder mit Genehmigung (Ü3-Gruppe)', 'Aufsichtspflicht endet: an Kita-Tür (nach Verabschiedung)', 'Unfall auf Heimweg: nicht Kita-Verantwortung (nach Abholung)'],
  },
]

export default function AufsichtspflichtPage() {
  const [expanded, setExpanded] = useState<string | null>('ap1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Aufsichtsbereiche. 2 Unfälle SJ. 3 Vollmachten erneuern bis 15.05. Abholzeit 7:00–17:00. 4 Kinder: Allein-nach-Hause-Genehmigung aktiv.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Eye className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Aufsichtspflicht
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Aufsichtsplan · Bring-/Abholzeit · Unfälle · Abholrechte</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'OK',        val: EINTRAEGE.filter(e => e.status === 'ok' || e.status === 'aktiv').length, color: 'text-teal-600' },
          { label: 'Aktion',    val: EINTRAEGE.filter(e => e.status === 'handlungsbedarf').length, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <p className="text-[10px] text-orange-700 font-semibold">3 Abholberechtigte-Vollmachten bis 15.05. erneuern — Liste im Büro!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Aufsichtsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Aufsichtsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'handlungsbedarf' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
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
