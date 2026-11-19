'use client'

import { useState } from 'react'
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Prävention — kids-mindry ──────────────────────────────────────────────────
// Kinderschutz · Gewaltprävention · Gesundheit · Sucht · Medien · Frühe Hilfen

type PrTyp = 'kinderschutz' | 'gewalt' | 'gesundheit' | 'medien' | 'fruehhilfen' | 'personal' | 'kooperation'
type PrStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface PrEintrag {
  id: string
  typ: PrTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: PrStatus
  punkte: string[]
}

const TYP_CFG: Record<PrTyp, { label: string; farbe: string }> = {
  kinderschutz: { label: 'Kinderschutz',   farbe: 'bg-red-50 text-red-700 border-red-200' },
  gewalt:       { label: 'Gewaltpräv.',    farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  gesundheit:   { label: 'Gesundheit',     farbe: 'bg-green-50 text-green-700 border-green-200' },
  medien:       { label: 'Medienpräv.',    farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  fruehhilfen:  { label: 'Frühe Hilfen',   farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  personal:     { label: 'Personal',       farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  kooperation:  { label: 'Kooperation',    farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<PrStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: PrEintrag[] = [
  {
    id: 'pr1', typ: 'kinderschutz', titel: 'Kinderschutzkonzept & §8a SGB VIII',
    datum: 'Konzept 2023', verantwortlich: 'Kita-Ltg. + Träger', status: 'aktiv',
    punkte: [
      'Kinderschutzkonzept: erstellt 2023 (Träger-Vorlage, §8a + §72a SGB VIII)',
      'Gefährdungseinschätzung: Risikocheck-Bogen (alle MA geschult, jährl. Auffrischung)',
      'Meldepflicht: Jugendamt — Fachkraft-Konsultation bei Verdacht (Protokoll Pflicht)',
      'Erweitertes Führungszeugnis: alle MA 5-jährl. (Kontrolle Personalakte, alle aktuell)',
      'Handlungsleitfaden: Aushang Büro + Gruppenräume (laminiert, letzte Akt. Apr 2026)',
    ],
  },
  {
    id: 'pr2', typ: 'gewalt', titel: 'Gewalt- & Übergriffsprävention',
    datum: 'Schulung fällig!', verantwortlich: 'Kita-Ltg.', status: 'faellig',
    punkte: [
      'Prävention-Schulung: letztes Mrz 2024 — Wiederholung bis Jun 2026 fällig!',
      'Körperliche Übergriffe Kinder untereinander: 3 Vorfälle SJ (Protokoll, Elterngespräch)',
      'Intervention: strukturiertes Verfahren (Trennen, Beruhigen, Aufarbeiten, Doku)',
      'Elterninformation: bei ernsthaften Übergriffen immer schriftlich (IServ)',
      'Raumgestaltung: Sichtfenster aller Gruppenräume (keine Blindräume, Richtlinien)',
    ],
  },
  {
    id: 'pr3', typ: 'gesundheit', titel: 'Gesundheitsförderung & Prävention',
    datum: 'Lfd. Maßnahmen', verantwortlich: 'Gruppenleitung + Hauswirtschaft', status: 'aktiv',
    punkte: [
      'Bewegungsförderung: tägl. Garten/Außengelände + 1 Bewegungseinheit/Gr./Tag',
      'Ernährung: gesundes Frühstück + zuckerarme Vesper (Eltern-Info Sep-Brief)',
      'Zahnarzt-Kooperation: jährl. Zahnprophylaxe Kita (Mar 2026 durchgeführt)',
      'Schlaf-/Ruhephase: Krippe tägl., Kita 12:30 (Ruhephase nicht Schlafpflicht)',
      'Impfstatus: Erinnerung an Eltern bei Einschulung (§34 IfSG Masernschutz)',
    ],
  },
  {
    id: 'pr4', typ: 'fruehhilfen', titel: 'Frühe Hilfen & Netzwerkarbeit',
    datum: 'Aktiv: 4 Familien', verantwortlich: 'Kita-Ltg. + Frühe-Hilfen-Koop.', status: 'aktiv',
    punkte: [
      'Frühe Hilfen NRW: 4 Familien mit Unterstützungsbedarf (Jugendamt koordiniert)',
      'Familienhebamme: 1 Familie in Begleitung (Übergang Krippe, Träger-Kooperation)',
      'Kooperationsvertrag Frühe Hilfen: Träger + Jugendamt (aktuell, SJ 2025/26)',
      'Rucksack-Programm: 2 Gruppen (Sprach- + Elternförderung, 3 Kurse SJ)',
      'Kindertisch-Hinweis: bei Ernährungsauffälligkeiten Jugendamt-Beratung angeboten',
    ],
  },
  {
    id: 'pr5', typ: 'kooperation', titel: 'Kooperationspartner Prävention',
    datum: 'Netzwerk aktiv', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Jugendamt Fachberatung §8a: regelmäßig (2× SJ, Schulung + Fallberatung)',
      'Kinderschutzbund: Schulungsangebote genutzt (Gewaltpräv., zuletzt Nov 2025)',
      'Gesundheitsamt: Impfberatung + Infektionsschutz (Kontakt bei Ausbrüchen)',
      'Frühe Hilfen Netzwerkkoordination: monatl. Newsletter + Fallbesprechungen',
      'Polizei: 1 Präventions-Besuch geplant (Kl.5/6-Äquivalent: Schulweg + Sicherheit)',
    ],
  },
]

export default function PraeventionPage() {
  const [expanded, setExpanded] = useState<string | null>('pr2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Gewaltpräv.-Schulung bis Jun fällig! 4 Frühe-Hilfen-Familien. 3 Übergriffsvorfälle. Kinderschutzkonzept 2023 aktuell.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShieldCheck className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Prävention
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Kinderschutz · Gewalt · Gesundheit · Frühe Hilfen · Kooperationen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Frühe Hilfen',val: 4, color: '#0d9488' },
          { label: 'Schulung!',   val: 'Jun', color: '#ef4444' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#b91c1c' }}>Gewaltpräv.-Schulung bis Jun buchen! — 3 Übergriffsvorfälle prüfen — Frühe Hilfen aktuell</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Präventionsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Präventionsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
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
