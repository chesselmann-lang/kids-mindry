'use client'

import { useState } from 'react'
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Gesundheitsschutz — kids-mindry ───────────────────────────────────────────
// Arbeitsschutz · Hygiene · Gefährdungsbeurteilung · Infektionsschutz

type GesTyp = 'arbeitsschutz' | 'hygiene' | 'infektionsschutz' | 'gefaehrdung' | 'erstehilfe' | 'nahrung' | 'psyche'
type GesStatus = 'aktuell' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface GesEintrag {
  id: string
  typ: GesTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: GesStatus
  punkte: string[]
}

const TYP_CFG: Record<GesTyp, { label: string; farbe: string }> = {
  arbeitsschutz:  { label: 'Arbeitsschutz',      farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  hygiene:        { label: 'Hygieneplan',         farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  infektionsschutz:{ label: 'Infektionsschutz',  farbe: 'bg-red-50 text-red-700 border-red-200' },
  gefaehrdung:    { label: 'Gefährdungsbeurt.',   farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  erstehilfe:     { label: 'Erste Hilfe',         farbe: 'bg-rose-50 text-rose-700 border-rose-200' },
  nahrung:        { label: 'Lebensmittel/HACCP',  farbe: 'bg-green-50 text-green-700 border-green-200' },
  psyche:         { label: 'Psychische Gesundheit', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<GesStatus, { label: string; farbe: string }> = {
  aktuell:        { label: 'Aktuell',          farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',           farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',          farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',        farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf',  farbe: 'text-orange-500' },
}

const EINTRAEGE: GesEintrag[] = [
  {
    id: 'gs1', typ: 'hygiene', titel: 'Hygieneplan & Reinigungsprotokoll',
    datum: 'Aktualisiert Jan 2026', verantwortlich: 'KiTa-Leitung + Gesundheitsamt', status: 'aktuell',
    punkte: [
      'Hygieneplan: aktualisiert Jan 2026 (alle Gruppen, Küche, WC)',
      'Reinigungsintervalle: tägl. Gruppenräume, 2x wöchentl. Kühlkette',
      'Reinigungsprotokoll: tägl. Unterschrift (Ordner "Hygiene" Küche)',
      'Schimmel-Kontrolle: halbjährl. (letzte: Dez 2025, kein Befund)',
      'Hygiene-Selbstauskunft Gesundheitsamt: bis 15.05. einreichen!',
    ],
  },
  {
    id: 'gs2', typ: 'infektionsschutz', titel: 'Infektionsschutzgesetz (IfSG)',
    datum: 'Lfd.', verantwortlich: 'KiTa-Leitung + Gesundheitsamt', status: 'aktuell',
    punkte: [
      'Belehrung nach §35 IfSG: alle MA belehrt (letztes Datum: Sep 2025)',
      'Belehrungspflicht: jährl. vor Dienstantritt (nächste: Aug 2026)',
      'Meldepflicht: 2 Masern-Verdachtsfälle SJ (beide negativ getestet)',
      'Ausschluss bei Erkrankung: Elterninfo-Aushang (Eingang + App)',
      'COVID-Regelungen: STIKO-konform (kein aktiver Ausbruch SJ)',
    ],
  },
  {
    id: 'gs3', typ: 'erstehilfe', titel: 'Erste Hilfe & Notfallversorgung',
    datum: 'EH-Auffrischung fällig', verantwortlich: 'Ersthelfer-Team (4 MA)', status: 'handlungsbedarf',
    punkte: [
      'Ersthelfer: 4 MA benannt (Quote: 1:5 lt. DGUV Vorschrift)',
      'EH-Auffrischungskurs: 2 MA überfällig (Fr. Nowak + Hr. Diaz neu, noch kein Kurs)',
      'Erste-Hilfe-Koffer: geprüft Mär 2026 (vollständig)',
      'Notfallkoffer pro Gruppe: 5x vorhanden (letzter Auffülltermin Feb 2026)',
      'EH-Kurs Anmeldung: für Jun/Jul 2026 (DGUV-Kurs, KiTa-Träger AWO)',
    ],
  },
  {
    id: 'gs4', typ: 'nahrung', titel: 'Lebensmittelsicherheit & HACCP',
    datum: 'HACCP-Protokoll lfd.', verantwortlich: 'Fr. Meier (Küche) + Leitung', status: 'faellig',
    punkte: [
      'HACCP-Konzept: vorhanden (letzte Revision Mär 2025 — Überarbeitung fällig!)',
      'Temperaturprotokoll Kühlkette: tägl. (Kühlschrank + Ausgabe)',
      'HACCP-Unterweisung: Fr. Meier (neu Apr 2026, Unterweisung ausstehend!)',
      'Lebensmittelallergien: 7 Kinder (Formblätter, ärztl. Attest vorhanden)',
      'Lieferant: Catering-Dienst GKM — Lieferscheine Ordner Küche',
    ],
  },
  {
    id: 'gs5', typ: 'gefaehrdung', titel: 'Gefährdungsbeurteilung & Arbeitsschutz',
    datum: 'Jährl. Überprüfung', verantwortlich: 'Sicherheitsbeauftragter Hr. Klein', status: 'geplant',
    punkte: [
      'Gefährdungsbeurteilung: letzte Revision Sep 2024 (neue für SJ 2025/26 geplant)',
      'Sicherheitsbegehung: mit Fachkraft für Arbeitssicherheit (Mai/Jun geplant)',
      'Stolperfallen/Hindernisse: 2 Mängel aus Jan-Begehung (beide behoben)',
      'Psychische Gefährdungsbeurteilung: erstmals 2026 (Anforderung AWO-Träger)',
      'ASA-Sitzung: nächste 12.06. (SiFa + Leitung + Betriebsarzt)',
    ],
  },
]

export default function GesundheitsschutzPage() {
  const [expanded, setExpanded] = useState<string | null>('gs4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Hygiene-Selbstauskunft bis 15.05. HACCP fällig + Fr. Meier Unterweisung ausstehend! EH-Kurs 2 MA überfällig. Gefährdungsbeurteilung geplant Jun.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShieldCheck className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Gesundheitsschutz
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Hygiene · IfSG · Erste Hilfe · HACCP · Arbeitsschutz</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',      val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Handlungsbedarf', val: EINTRAEGE.filter(e => e.status === 'faellig' || e.status === 'handlungsbedarf').length, color: '#ef4444' },
          { label: 'Ersthelfer',    val: 4, color: '#0d9488' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Hygiene-Selbstauskunft bis 15.05. — HACCP-Unterweisung Fr. Meier ausstehend! — EH-Kurs 2 MA überfällig</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Gesundheitsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Gesundheitsübersicht'}
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
