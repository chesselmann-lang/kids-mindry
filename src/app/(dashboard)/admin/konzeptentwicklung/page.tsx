'use client'

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Konzeptentwicklung — kids-mindry ───────────────────────────────────────────
// Pädagogisches Konzept · KTK · Qualitätsentwicklung · Leitbild · Bildungsauftrag

type KonzeptTyp = 'paedkonzept' | 'qualitaet' | 'leitbild' | 'bildungsbereiche' | 'inklusion' | 'sprache' | 'partizipation'
type KonzeptStatus = 'aktuell' | 'ueberarbeitung' | 'geplant' | 'abgeschlossen' | 'dringend'

interface KonzeptEintrag {
  id: string
  typ: KonzeptTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: KonzeptStatus
  punkte: string[]
}

const TYP_CFG: Record<KonzeptTyp, { label: string; emoji: string; farbe: string }> = {
  paedkonzept:     { label: 'Päd. Konzept',      emoji: '📘', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  qualitaet:       { label: 'Qualitätsentw.',    emoji: '⭐', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  leitbild:        { label: 'Leitbild',          emoji: '🌟', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  bildungsbereiche:{ label: 'Bildungsbereiche',  emoji: '🧩', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  inklusion:       { label: 'Inklusion',         emoji: '🌈', farbe: 'bg-green-50 text-green-700 border-green-200' },
  sprache:         { label: 'Sprachförderkonz.', emoji: '💬', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  partizipation:   { label: 'Partizipation',     emoji: '🤝', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
}

const STATUS_CFG: Record<KonzeptStatus, { label: string; farbe: string }> = {
  aktuell:      { label: 'Aktuell',       farbe: 'text-green-600' },
  ueberarbeitung:{ label: 'Überarbeitung', farbe: 'text-orange-500' },
  geplant:      { label: 'Geplant',       farbe: 'text-blue-400' },
  abgeschlossen:{ label: 'Abgeschlossen', farbe: 'text-gray-400' },
  dringend:     { label: 'Dringend!',     farbe: 'text-red-600' },
}

const EINTRAEGE: KonzeptEintrag[] = [
  {
    id: 'kk1', typ: 'paedkonzept', titel: 'Pädagogisches Konzept 2025 — Hauptdokument',
    datum: 'Letzte Revision: Sep 2025', verantwortlich: 'SL + Team', status: 'ueberarbeitung',
    punkte: ['Konzeptstand: Sep 2025 (KiBiz-Vorlage + eigene Schwerpunkte)', 'Nächste Revision: Jun 2026 (jährl. Pflichtüberprüfung § 4 KiBiz)', 'Schwerpunkte: Bewegung, Sprache, Natur (gewählt von Team Feb 2025)', 'Elternmitwirkung: Konzeptvorstellung jährl. Elternabend', 'Träger-Freigabe: erforderlich (Vorlage Sep 2026)'],
  },
  {
    id: 'kk2', typ: 'qualitaet', titel: 'Qualitätsentwicklung — KTK-Gütesiegel',
    datum: 'Audit: Dez 2026', verantwortlich: 'SL + QE-Beauftragte Fr. Wagner', status: 'geplant',
    punkte: ['KTK-Gütesiegel: angestrebt (Audittermin Dez 2026)', 'Voraudit-Selbstbewertung: geplant Sep 2026', 'Handlungsfelder: Führung, Personal, Erziehungspartnerschaft, Pädagogik', 'QE-Schulung Team: 2-tägige Fortbildung geplant Okt 2026', 'Dokumentationsordner: SL legt an (Mai 2026)'],
  },
  {
    id: 'kk3', typ: 'bildungsbereiche', titel: 'Bildungsbereiche — Umsetzungsplanung',
    datum: 'Lfd.', verantwortlich: 'Gruppenteams', status: 'aktuell',
    punkte: ['Grundlage: Bildungsgrundsätze NRW (10 Bildungsbereiche)', 'Schwerpunkte Kita: Sprache (1), Bewegung (2), Natur/Umwelt (3)', 'Dokumentation: halbjährl. Bildungsberichte je Gruppe', 'Raumkonzept spiegelt Bildungsbereiche (s. Raumkonzept)', 'Fortbildung aktuell: "Bildung im Dialog" (3 TN, Jun 2026)'],
  },
  {
    id: 'kk4', typ: 'sprache', titel: 'Sprachförderkonzept',
    datum: 'Aktualisiert: Jan 2026', verantwortlich: 'Sprachförderkraft Fr. Özdemir', status: 'aktuell',
    punkte: ['Grundlage: DJI-Handlungsempfehlungen + Sismik/BaSiK', 'Alltagsintegrierte Sprachbildung: in jeder Aktivität', 'Intensive Förderung: Sismik-Wert < 3,0 (4 Kinder)', 'Elternpartnerschaft: Mehrsprachigkeit als Ressource (Konzept)', 'Kooperation: Sprachförderzentrum Kreis (Beratung 2x/Jahr)'],
  },
  {
    id: 'kk5', typ: 'partizipation', titel: 'Kinderparlament & Partizipationskonzept',
    datum: 'Treffen: 1x/Monat (Ü3)', verantwortlich: 'Fr. Schmidt (Partizipationsbeauftragte)', status: 'aktuell',
    punkte: ['Kinderparlament: Ü3-Gruppe (ab 3 J.), monatlich', 'Themen Apr: Spielzeug-Wunschliste, Frühstücksregel', 'Entscheidungsbereiche: Raumgestaltung, Regeln, Aktivitäten', 'Dokumentation: "Kinderparlament-Buch" (Fotos + Protokoll)', 'UN-Kinderrechtskonvention: Basis des Konzepts'],
  },
]

export default function KonzeptentwicklungPage() {
  const [expanded, setExpanded] = useState<string | null>('kk1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Konzeptbereiche. Päd. Konzept: Revision Jun 2026 fällig. KTK-Gütesiegel: Audit Dez 2026 angestrebt. Sprachförderkonzept + Kinderparlament aktiv.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Lightbulb className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Konzeptentwicklung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Päd. Konzept · KTK · Qualität · Sprache · Partizipation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',     val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'Aktuell',      val: EINTRAEGE.filter(e => e.status === 'aktuell').length, color: 'text-green-600' },
          { label: 'Überarbeitung',val: EINTRAEGE.filter(e => e.status === 'ueberarbeitung').length, color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <p className="text-[10px] text-orange-700 font-semibold">Päd. Konzept: jährl. Pflichtrevision Jun 2026 — Überarbeitung starten (§ 4 KiBiz)!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Konzeptübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Konzeptübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'ueberarbeitung' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
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
