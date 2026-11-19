'use client'

import { useState } from 'react'
import { Languages, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Sprachförderung — kids-mindry ──────────────────────────────────────────────
// Sprachstand · DaZ · Mehrsprachigkeit · Delfin 4 · Förderpläne

type SprachTyp = 'sprachstand' | 'daz' | 'foerderplan' | 'mehrsprachigkeit' | 'logopaedie' | 'elternarbeit' | 'program'
type SprachStatus = 'aktiv' | 'faellig' | 'abgeschlossen' | 'geplant' | 'wartezeit'

interface SprachEintrag {
  id: string
  typ: SprachTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: SprachStatus
  punkte: string[]
}

const TYP_CFG: Record<SprachTyp, { label: string; farbe: string }> = {
  sprachstand:    { label: 'Sprachstand',       farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  daz:            { label: 'DaZ',               farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  foerderplan:    { label: 'Förderplan',        farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  mehrsprachigkeit:{ label: 'Mehrsprachigkeit', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  logopaedie:     { label: 'Logopädie',         farbe: 'bg-rose-50 text-rose-700 border-rose-200' },
  elternarbeit:   { label: 'Elternarbeit',      farbe: 'bg-green-50 text-green-700 border-green-200' },
  program:        { label: 'Förderprogramm',    farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<SprachStatus, { label: string; farbe: string }> = {
  aktiv:        { label: 'Aktiv',       farbe: 'text-teal-600' },
  faellig:      { label: 'Fällig',      farbe: 'text-red-500' },
  abgeschlossen:{ label: 'Abgeschl.',   farbe: 'text-gray-400' },
  geplant:      { label: 'Geplant',     farbe: 'text-blue-400' },
  wartezeit:    { label: 'Wartezeit',   farbe: 'text-orange-500' },
}

const EINTRAEGE: SprachEintrag[] = [
  {
    id: 'sf1', typ: 'sprachstand', titel: 'Sprachstandserhebung & Beobachtung',
    datum: 'Lfd. + Delfin 4: Apr abgeschlossen', verantwortlich: 'Alle Erzieher:innen', status: 'aktiv',
    punkte: [
      'SISMIK/SELDAK: alle Kinder (U3/Ü3, 2x jährl., letzte: Feb 2026)',
      'Delfin 4 (Vorschulkinder, Kl.1): Apr 2026 abgeschlossen (14 Kinder)',
      'Delfin 4-Ergebnis: 4 Kinder mit Sprachförderbedarf (Formblatt an Eltern)',
      'Grenzsteine der Entwicklung: Sprachentwicklungs-Teil (Portfolio)',
      'Beobachtungsbögen: aktuell in Kind-App (alle Gruppen erfasst)',
    ],
  },
  {
    id: 'sf2', typ: 'daz', titel: 'Deutsch als Zweitsprache (DaZ)',
    datum: 'Aktuell: 18 Kinder', verantwortlich: 'DaZ-Beauftragte Fr. Reinhardt', status: 'aktiv',
    punkte: [
      'Kinder mit DaZ-Bedarf: 18 (24% der Gruppe) — Herkunftssprachen: 9 verschiedene',
      'DaZ-Beauftragte: Fr. Reinhardt (20h Fortbildung, Zertifikat 2024)',
      'Alltagsintegrierte Sprachbildung: tägl. (Sprachanlässe, Rituale, Bilderbücher)',
      'Intensivförderung: 6 Kinder (10 min Einzelförderung tägl., Fr. Reinhardt)',
      'Kooperation: VHS Sprachkurse für Eltern (Di 18h, Schulgebäude)',
    ],
  },
  {
    id: 'sf3', typ: 'logopaedie', titel: 'Logopädie & externe Fachleistungen',
    datum: 'Aktuell: 5 Kinder', verantwortlich: 'KiTa-Leitung + Eltern', status: 'aktiv',
    punkte: [
      'Logopädie extern: 5 Kinder (Rezept Kinderarzt, Praxen in Wuppertal)',
      'Kooperation mit Praxis: Rückmeldung an Eltern (kein direkter KiTa-Kontakt)',
      'Frühförderung: 2 Kinder (Frühförderstelle, wöchentl. Hausbesuch)',
      'Abklärung empfohlen: 3 weitere Kinder (Elterngespräch Mai geplant)',
      'Schweigepflichtsentbindung: für Kooperation mit Fachstellen (Formblatt Anlage 7)',
    ],
  },
  {
    id: 'sf4', typ: 'program', titel: 'Sprachförderprogramm "Hör-mal"',
    datum: 'Mo + Mi 9–9:30h', verantwortlich: 'Fr. Bauer + Fr. Koch', status: 'aktiv',
    punkte: [
      'Programm "Hör-mal" (phonolog. Bewusstsein): 2 Gruppen (Vorschule + Ü4)',
      'Teilnehmer: 12 Kinder (nach Delfin-Ergebnis + Erzieher:innen-Beobachtung)',
      'Material: "Würzburger Trainingsprogramm" (Kopien, Eigenfinanzierung KiTa)',
      'Fortschritt: Protokoll je Kind (Ordner "Sprachförderung" Büro)',
      'Evaluation: Jun (vor Schulstart — Rückmeldung an Eltern + Grundschule)',
    ],
  },
  {
    id: 'sf5', typ: 'mehrsprachigkeit', titel: 'Mehrsprachigkeit & Herkunftssprachen',
    datum: 'Lfd. pädagogisch', verantwortlich: 'Alle Erzieher:innen', status: 'aktiv',
    punkte: [
      'Herkunftssprachen: 9 verschiedene (Türkisch 7, Arabisch 4, Russisch 2, ...)',
      'Konzept "Alle Sprachen willkommen": Begrüßungsworte aller Sprachen an Eingang',
      'Bücher in Herkunftssprachen: Bibliothekskorb (18 mehrsprachige Bilderbücher)',
      'Eltern als Sprachvorbilder: eingeladen zum Vorlesen in Muttersprache (monatl.)',
      'Dolmetscher: Träger AWO-Netzwerk (Anfrage über Leitung, 2–3 Tage Vorlauf)',
    ],
  },
]

export default function SprachfoerderungPage() {
  const [expanded, setExpanded] = useState<string | null>('sf2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 18 DaZ-Kinder (24%). Delfin 4 abgeschlossen (4 Kinder mit Förderbedarf). "Hör-mal" 12 Kinder aktiv. 3 Kinder Logopädie-Empfehlung offen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Languages className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Sprachförderung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Sprachstand · DaZ · Logopädie · Förderprogramm · Mehrsprachigkeit</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'DaZ-Kinder',val: 18, color: '#0d9488' },
          { label: 'Förderung', val: 12, color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#16a34a' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#15803d' }}>Delfin 4: 4 Kinder Förderbedarf — Logopädie-Empfehlung 3 Kinder (Elterngespräch Mai) — "Hör-mal" läuft</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Sprachübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Sprachübersicht'}
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
