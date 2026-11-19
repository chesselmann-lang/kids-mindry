'use client'

import { useState } from 'react'
import {
  BookOpen, Plus, Search, Filter, Download, Eye,
  FileText, Star, Camera, ChevronDown, ChevronUp,
  User, Calendar, Tag, Sparkles, Pencil, CheckCircle,
  Clock, Archive, Share2, Baby, Heart, Lightbulb
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DokTyp = 'lerngeschichte' | 'entwicklungsbericht' | 'beobachtung' | 'portfolio-eintrag'
type DokStatus = 'entwurf' | 'fertig' | 'freigegeben' | 'archiviert'
type Bildungsbereich =
  | 'Sprache & Kommunikation'
  | 'Soziale & emotionale Entwicklung'
  | 'Bewegung & Körper'
  | 'Mathematik & Naturwissenschaft'
  | 'Kreativität & Ästhetik'
  | 'Natur & Umwelt'
  | 'Gesundheit & Wohlbefinden'

interface Dokument {
  id: string
  typ: DokTyp
  titel: string
  kind: string
  kindAlter: string
  gruppe: string
  datum: string
  erstelltVon: string
  status: DokStatus
  bildungsbereiche: Bildungsbereich[]
  kurzfassung: string
  bilder: number
  elternFreigabe: boolean
  lernziel?: string
}

// ─── Mock-Daten ───────────────────────────────────────────────────────────────

const DOKUMENTE: Dokument[] = [
  {
    id: 'd1',
    typ: 'lerngeschichte',
    titel: 'Lena baut eine Brücke',
    kind: 'Lena M.',
    kindAlter: '4 J. 2 M.',
    gruppe: 'Sonnenblumen',
    datum: '2025-04-18',
    erstelltVon: 'Sarah K.',
    status: 'freigegeben',
    bildungsbereiche: ['Mathematik & Naturwissenschaft', 'Kreativität & Ästhetik'],
    kurzfassung:
      'Lena entdeckte heute beim Bauen mit Holzklötzen das Prinzip des Gleichgewichts. Sie versuchte wiederholt, einen langen Klotz über eine Lücke zu legen, bis sie eine stabile Konstruktion gefunden hatte.',
    bilder: 3,
    elternFreigabe: true,
    lernziel: 'Problemlösefähigkeit, räumliches Denken',
  },
  {
    id: 'd2',
    typ: 'entwicklungsbericht',
    titel: 'Halbjahresbericht Frühling 2025',
    kind: 'Noah S.',
    kindAlter: '3 J. 8 M.',
    gruppe: 'Schmetterlinge',
    datum: '2025-04-10',
    erstelltVon: 'Maria L.',
    status: 'fertig',
    bildungsbereiche: [
      'Sprache & Kommunikation',
      'Soziale & emotionale Entwicklung',
    ],
    kurzfassung:
      'Noah hat sich im letzten Halbjahr sprachlich stark weiterentwickelt. Er formuliert nun vollständige Sätze und nimmt aktiv an Morgenkreisen teil. Sozial zeigt er zunehmend Empathie gegenüber Mitkindern.',
    bilder: 0,
    elternFreigabe: false,
    lernziel: undefined,
  },
  {
    id: 'd3',
    typ: 'lerngeschichte',
    titel: 'Mias erstes Wort auf Türkisch',
    kind: 'Mia T.',
    kindAlter: '5 J. 1 M.',
    gruppe: 'Sonnenblumen',
    datum: '2025-04-15',
    erstelltVon: 'Sarah K.',
    status: 'freigegeben',
    bildungsbereiche: ['Sprache & Kommunikation', 'Soziale & emotionale Entwicklung'],
    kurzfassung:
      'Mia lernte heute von ihrer Freundin Zeynep das Wort "merhaba". Sie übte es den ganzen Tag und begrüßte alle Kinder damit. Ein wunderschöner Moment der interkulturellen Begegnung.',
    bilder: 1,
    elternFreigabe: true,
    lernziel: 'Mehrsprachigkeit, Weltoffen­heit',
  },
  {
    id: 'd4',
    typ: 'portfolio-eintrag',
    titel: 'Selbstporträt mit Fingerfarben',
    kind: 'Felix B.',
    kindAlter: '4 J. 6 M.',
    gruppe: 'Igel',
    datum: '2025-04-20',
    erstelltVon: 'Petra W.',
    status: 'freigegeben',
    bildungsbereiche: ['Kreativität & Ästhetik', 'Gesundheit & Wohlbefinden'],
    kurzfassung:
      'Felix malte ein ausdrucksstarkes Selbstporträt. Er mischte Farben bewusst, benannte alle Körperteile und kommentierte sein Bild mit: "Das bin ich, wenn ich lache."',
    bilder: 2,
    elternFreigabe: true,
    lernziel: 'Körperwahrnehmung, Selbstausdruck',
  },
  {
    id: 'd5',
    typ: 'beobachtung',
    titel: 'Konfliktlösung im Rollenspiel',
    kind: 'Emma P.',
    kindAlter: '5 J. 4 M.',
    gruppe: 'Schmetterlinge',
    datum: '2025-04-22',
    erstelltVon: 'Maria L.',
    status: 'entwurf',
    bildungsbereiche: ['Soziale & emotionale Entwicklung'],
    kurzfassung:
      'Emma schlichtete einen Streit zwischen zwei Kindern um eine Puppenhaustür. Sie schlug abwechselndes Spielen vor — ohne Erwachsenen-Eingriff.',
    bilder: 0,
    elternFreigabe: false,
    lernziel: 'Konfliktfähigkeit, Empathie',
  },
  {
    id: 'd6',
    typ: 'entwicklungsbericht',
    titel: 'Jahresbericht 2024/25',
    kind: 'Leon H.',
    kindAlter: '6 J. 0 M.',
    gruppe: 'Sternschnuppen',
    datum: '2025-03-28',
    erstelltVon: 'Klaus M.',
    status: 'archiviert',
    bildungsbereiche: [
      'Mathematik & Naturwissenschaft',
      'Sprache & Kommunikation',
      'Bewegung & Körper',
    ],
    kurzfassung:
      'Leon schließt das Kindergartenjahr mit hervorragenden Entwicklungsschritten ab. Schulreife in allen Bereichen festgestellt. Detaillierter Übergabebericht für die Grundschule beigefügt.',
    bilder: 4,
    elternFreigabe: true,
    lernziel: undefined,
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

const TYP_LABELS: Record<DokTyp, string> = {
  lerngeschichte: 'Lerngeschichte',
  entwicklungsbericht: 'Entwicklungsbericht',
  beobachtung: 'Beobachtung',
  'portfolio-eintrag': 'Portfolio-Eintrag',
}

const TYP_COLORS: Record<DokTyp, string> = {
  lerngeschichte: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  entwicklungsbericht: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  beobachtung: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'portfolio-eintrag': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

const TYP_ICONS: Record<DokTyp, React.ReactNode> = {
  lerngeschichte: <Star className="w-4 h-4" />,
  entwicklungsbericht: <FileText className="w-4 h-4" />,
  beobachtung: <Eye className="w-4 h-4" />,
  'portfolio-eintrag': <BookOpen className="w-4 h-4" />,
}

const STATUS_LABELS: Record<DokStatus, string> = {
  entwurf: 'Entwurf',
  fertig: 'Fertig',
  freigegeben: 'Freigegeben',
  archiviert: 'Archiviert',
}

const STATUS_COLORS: Record<DokStatus, string> = {
  entwurf: 'text-yellow-600 dark:text-yellow-400',
  fertig: 'text-blue-600 dark:text-blue-400',
  freigegeben: 'text-green-600 dark:text-green-400',
  archiviert: 'text-[var(--color-text-muted)]',
}

const STATUS_ICONS: Record<DokStatus, React.ReactNode> = {
  entwurf: <Pencil className="w-3.5 h-3.5" />,
  fertig: <Clock className="w-3.5 h-3.5" />,
  freigegeben: <CheckCircle className="w-3.5 h-3.5" />,
  archiviert: <Archive className="w-3.5 h-3.5" />,
}

const BEREICHE_ICONS: Record<Bildungsbereich, React.ReactNode> = {
  'Sprache & Kommunikation': <BookOpen className="w-3.5 h-3.5" />,
  'Soziale & emotionale Entwicklung': <Heart className="w-3.5 h-3.5" />,
  'Bewegung & Körper': <Baby className="w-3.5 h-3.5" />,
  'Mathematik & Naturwissenschaft': <Lightbulb className="w-3.5 h-3.5" />,
  'Kreativität & Ästhetik': <Sparkles className="w-3.5 h-3.5" />,
  'Natur & Umwelt': <Star className="w-3.5 h-3.5" />,
  'Gesundheit & Wohlbefinden': <CheckCircle className="w-3.5 h-3.5" />,
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ─── Statistik-Karten ─────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3 items-start">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Dokument-Karte ───────────────────────────────────────────────────────────

function DokumentCard({ dok }: { dok: Dokument }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${TYP_COLORS[dok.typ]}`}>
              {TYP_ICONS[dok.typ]}
              {TYP_LABELS[dok.typ]}
            </span>
            {dok.elternFreigabe && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 shrink-0">
                <Share2 className="w-3 h-3" />
                Eltern
              </span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${STATUS_COLORS[dok.status]}`}>
            {STATUS_ICONS[dok.status]}
            {STATUS_LABELS[dok.status]}
          </span>
        </div>

        <h3 className="font-semibold text-[var(--color-text)] mb-1">{dok.titel}</h3>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] mb-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {dok.kind} · {dok.kindAlter}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {dok.gruppe}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {fmtDate(dok.datum)}
          </span>
          <span className="flex items-center gap-1">
            <Pencil className="w-3.5 h-3.5" />
            {dok.erstelltVon}
          </span>
          {dok.bilder > 0 && (
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              {dok.bilder} Foto{dok.bilder !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Bildungsbereiche */}
        <div className="flex flex-wrap gap-1 mb-3">
          {dok.bildungsbereiche.map(b => (
            <span
              key={b}
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
            >
              {BEREICHE_ICONS[b]}
              {b}
            </span>
          ))}
        </div>

        {/* Kurzfassung */}
        <p className={`text-sm text-[var(--color-text-muted)] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {dok.kurzfassung}
        </p>

        {/* Lernziel */}
        {expanded && dok.lernziel && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-0.5 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Beobachtetes Lernziel
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">{dok.lernziel}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
          <div className="flex gap-2">
            <button className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              Anzeigen
            </button>
            <button className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            {dok.status !== 'freigegeben' && dok.status !== 'archiviert' && (
              <button className="text-xs px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                Freigeben
              </button>
            )}
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-0.5 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Weniger' : 'Mehr'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BildungsdokumentationPage() {
  const [suche, setSuche] = useState('')
  const [filterTyp, setFilterTyp] = useState<DokTyp | 'alle'>('alle')
  const [filterStatus, setFilterStatus] = useState<DokStatus | 'alle'>('alle')

  const filtered = DOKUMENTE.filter(d => {
    const matchSuche =
      suche === '' ||
      d.titel.toLowerCase().includes(suche.toLowerCase()) ||
      d.kind.toLowerCase().includes(suche.toLowerCase()) ||
      d.gruppe.toLowerCase().includes(suche.toLowerCase())
    const matchTyp = filterTyp === 'alle' || d.typ === filterTyp
    const matchStatus = filterStatus === 'alle' || d.status === filterStatus
    return matchSuche && matchTyp && matchStatus
  })

  const stats = {
    gesamt: DOKUMENTE.length,
    lerngeschichten: DOKUMENTE.filter(d => d.typ === 'lerngeschichte').length,
    freigegeben: DOKUMENTE.filter(d => d.status === 'freigegeben').length,
    ohneFreigabe: DOKUMENTE.filter(d => d.status === 'fertig' && !d.elternFreigabe).length,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--color-primary)]" />
            Bildungsdokumentation
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Lerngeschichten · Entwicklungsberichte · Portfolio-Einträge · Beobachtungen
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Neu erstellen
        </button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Dokumente gesamt"
          value={stats.gesamt}
          sub="dieses Kita-Jahr"
          icon={<FileText className="w-4 h-4 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          label="Lerngeschichten"
          value={stats.lerngeschichten}
          sub="narrative Doku"
          icon={<Star className="w-4 h-4 text-yellow-600" />}
          color="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <StatCard
          label="Freigegeben"
          value={stats.freigegeben}
          sub="für Eltern sichtbar"
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          label="Ausstehend"
          value={stats.ohneFreigabe}
          sub="Freigabe erforderlich"
          icon={<Clock className="w-4 h-4 text-orange-600" />}
          color="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>

      {/* Rahmenplan-Hinweis */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Bildungsdokumentation nach dem <strong>Nationalen Kriterienkatalog</strong> (Leu et al.) und
          den Bildungsplänen der Länder. Lerngeschichten orientieren sich am Ansatz von
          <strong> Carr & Lee</strong> — ressourcenorientiert, stärkenbasiert.
        </span>
      </div>

      {/* Filter & Suche */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Kind, Titel, Gruppe …"
              value={suche}
              onChange={e => setSuche(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={filterTyp}
              onChange={e => setFilterTyp(e.target.value as DokTyp | 'alle')}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            >
              <option value="alle">Alle Typen</option>
              {(Object.keys(TYP_LABELS) as DokTyp[]).map(t => (
                <option key={t} value={t}>{TYP_LABELS[t]}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as DokStatus | 'alle')}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            >
              <option value="alle">Alle Status</option>
              {(Object.keys(STATUS_LABELS) as DokStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <Download className="w-4 h-4" />
            Alle exportieren
          </button>
        </div>
      </div>

      {/* Ergebnis-Info */}
      <p className="text-xs text-[var(--color-text-muted)]">
        {filtered.length} von {DOKUMENTE.length} Dokument{DOKUMENTE.length !== 1 ? 'en' : ''}
        {filterTyp !== 'alle' && ` · Typ: ${TYP_LABELS[filterTyp]}`}
        {filterStatus !== 'alle' && ` · Status: ${STATUS_LABELS[filterStatus]}`}
      </p>

      {/* Dokument-Grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(dok => (
            <DokumentCard key={dok.id} dok={dok} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Keine Dokumente gefunden</p>
          <p className="text-sm mt-1">Suchbegriff anpassen oder Filter zurücksetzen</p>
        </div>
      )}

      {/* Footer-Legende */}
      <div className="border-t border-[var(--color-border)] pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(TYP_LABELS) as DokTyp[]).map(t => (
          <div key={t} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TYP_COLORS[t]}`}>
              {TYP_ICONS[t]}
              {TYP_LABELS[t]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
