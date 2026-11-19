'use client'

import { useState } from 'react'
import {
  Sparkles, Plus, Trash2, CheckCircle2, Calendar, Clock,
  ChevronDown, ChevronUp, Users, Music, Palette, Leaf,
  BookOpen, Heart, Star, RotateCcw, Filter,
} from 'lucide-react'

// ── Aktivitätenplanung — KiTa / Kindergarten ──────────────────────────────────
// Wochenplan für pädagogische Aktivitäten · Gruppen-Zuordnung · KI-Ideen

type Tag = 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag'
type Bereich = 'Bewegung' | 'Kreativität' | 'Sprache' | 'Natur' | 'Musik' | 'Soziales' | 'Kognitiv'
type Gruppe = 'Bienen' | 'Schmetterlinge' | 'Alle'

interface Aktivitaet {
  id: string
  titel: string
  beschreibung: string
  tag: Tag
  uhrzeit: string
  dauer: number // Minuten
  bereich: Bereich
  gruppe: Gruppe
  material?: string
  abgeschlossen: boolean
  ki?: boolean
}

const BEREICH_CFG: Record<Bereich, { farbe: string; bg: string; icon: typeof Sparkles }> = {
  Bewegung:    { farbe: 'text-green-700',   bg: 'bg-green-50',   icon: Heart },
  Kreativität: { farbe: 'text-pink-700',    bg: 'bg-pink-50',    icon: Palette },
  Sprache:     { farbe: 'text-blue-700',    bg: 'bg-blue-50',    icon: BookOpen },
  Natur:       { farbe: 'text-teal-700',    bg: 'bg-teal-50',    icon: Leaf },
  Musik:       { farbe: 'text-purple-700',  bg: 'bg-purple-50',  icon: Music },
  Soziales:    { farbe: 'text-orange-700',  bg: 'bg-orange-50',  icon: Users },
  Kognitiv:    { farbe: 'text-indigo-700',  bg: 'bg-indigo-50',  icon: Star },
}

const TAGE: Tag[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']

const INIT_AKT: Aktivitaet[] = [
  {
    id: 'a1', titel: 'Morgenkreis',
    beschreibung: 'Begrüßungslied, Wetterbericht von den Kindern, gemeinsamer Tagesausblick.',
    tag: 'Montag', uhrzeit: '08:30', dauer: 20,
    bereich: 'Soziales', gruppe: 'Alle', abgeschlossen: true,
  },
  {
    id: 'a2', titel: 'Fingerfarben — Frühling',
    beschreibung: 'Mit Fingerfarben Blumen und Schmetterlinge malen. Papier A3, Schürzen mitbringen.',
    tag: 'Montag', uhrzeit: '10:00', dauer: 45,
    bereich: 'Kreativität', gruppe: 'Schmetterlinge', material: 'Fingerfarben, A3-Papier, Schürzen', abgeschlossen: false,
  },
  {
    id: 'a3', titel: 'Zahlen 1–5 entdecken',
    beschreibung: 'Zählen mit Bausteinen und Tierbildern. Jedes Kind bekommt sein eigenes Zählblatt.',
    tag: 'Montag', uhrzeit: '10:00', dauer: 30,
    bereich: 'Kognitiv', gruppe: 'Bienen', material: 'Bausteine, Tierbildkärtchen, Zählblätter', abgeschlossen: false,
  },
  {
    id: 'a4', titel: 'Bewegungsbaustelle',
    beschreibung: 'Hindernisparcours im Garten aufbauen. Kriechen, Balancieren, Springen.',
    tag: 'Dienstag', uhrzeit: '09:30', dauer: 60,
    bereich: 'Bewegung', gruppe: 'Alle', abgeschlossen: false,
  },
  {
    id: 'a5', titel: 'Vorlesen: "Der Regenbogenfisch"',
    beschreibung: 'Vorlesen + Gesprächsrunde: Was ist Teilen? Haben wir Lieblingssachen?',
    tag: 'Dienstag', uhrzeit: '11:00', dauer: 25,
    bereich: 'Sprache', gruppe: 'Alle', material: 'Buch "Der Regenbogenfisch"', abgeschlossen: false,
  },
  {
    id: 'a6', titel: 'Klangreise — Tier-Geräusche',
    beschreibung: 'Kinder hören Tier-Sounds (App), raten + bewegen sich wie das Tier.',
    tag: 'Mittwoch', uhrzeit: '09:00', dauer: 30,
    bereich: 'Musik', gruppe: 'Alle', material: 'Bluetooth-Lautsprecher, Tier-Sound-App', abgeschlossen: false, ki: true,
  },
  {
    id: 'a7', titel: 'Schneckenpost — Briefe schreiben',
    beschreibung: 'Kinder "schreiben" (zeichnen) einen Brief an jemanden. Gemeinsam in Briefumschläge stecken.',
    tag: 'Donnerstag', uhrzeit: '10:00', dauer: 40,
    bereich: 'Sprache', gruppe: 'Schmetterlinge', material: 'Briefpapier, Briefumschläge, Stifte', abgeschlossen: false,
  },
  {
    id: 'a8', titel: 'Garten erkunden — Frühlingssuche',
    beschreibung: 'Spaziergang im Garten: Welche Pflanzen wachsen? Käfer und Würmer beobachten.',
    tag: 'Freitag', uhrzeit: '09:30', dauer: 45,
    bereich: 'Natur', gruppe: 'Alle', material: 'Lupen, Beobachtungsbögen', abgeschlossen: false,
  },
]

const KI_IDEEN: Record<Bereich, { titel: string; beschreibung: string; material?: string }[]> = {
  Bewegung: [
    { titel: 'Yoga für Kinder', beschreibung: 'Einfache Tier-Yoga-Posen: Katze, Hund, Schmetterling. 5 Posen mit Geschichte verbinden.' },
    { titel: 'Stille Post Staffel', beschreibung: 'Kinder flüstern ein Tierbild weiter und stellen es dann gemeinsam dar.' },
  ],
  Kreativität: [
    { titel: 'Collagen aus Naturmaterialien', beschreibung: 'Blätter, Gräser, Steine auf Papier kleben und Landschaften gestalten.', material: 'Leim, A3-Papier, Naturmaterialien' },
    { titel: 'Schattentheater', beschreibung: 'Handschattenbilder mit Taschenlampe an die Wand werfen.', material: 'Taschenlampe, dunkler Raum' },
  ],
  Sprache: [
    { titel: 'Reimland', beschreibung: 'Reime mit einfachen Wörtern (Maus-Haus, Stern-Kern) gemeinsam erfinden.' },
    { titel: 'Bilderbuch selbst machen', beschreibung: 'Jedes Kind zeichnet eine Seite, zusammen entsteht eine Geschichte.' },
  ],
  Natur: [
    { titel: 'Regenwürmer beobachten', beschreibung: 'Nach Regen Regenwürmer suchen, anfassen, zurücksetzen. Lebenszyklus besprechen.' },
    { titel: 'Kräuter riechen', beschreibung: 'Basilikum, Minze, Lavendel — riechen, benennen, in Erde pflanzen.', material: 'Kräutertöpfe, Erde, Töpfchen' },
  ],
  Musik: [
    { titel: 'Eigenbausteine — Rasseln', beschreibung: 'Yoghurtbecher mit Reis/Linsen befüllen und bekleben als selbstgebaute Rasseln.', material: 'Joghurtbecher, Reis, Klebeband' },
    { titel: 'Trommelkreis', beschreibung: 'Gemeinsamer Trommelrhythmus, einer fängt an, alle machen nach.' },
  ],
  Soziales: [
    { titel: 'Gefühle-Memory', beschreibung: 'Kärtchen mit Gesichtsausdrücken zuordnen. Was fühlt die Person? Wann fühle ich das?' },
    { titel: 'Hilfe-Stationen', beschreibung: 'Kinder übernehmen Verantwortung: Tisch decken, Pflanzen gießen, aufräumen.' },
  ],
  Kognitiv: [
    { titel: 'Sortieraufgaben Farbe/Form', beschreibung: 'Holzbausteine nach Farbe oder Form in Schachteln sortieren.' },
    { titel: 'Muster legen', beschreibung: 'Einfache Muster aus Naturmaterialien oder Bausteinen nachbauen und weiterführen.' },
  ],
}

export default function AktivitaetenPage() {
  const [aktivitaeten, setAktivitaeten] = useState(INIT_AKT)
  const [filterTag, setFilterTag] = useState<Tag | 'Alle'>('Alle')
  const [filterGruppe, setFilterGruppe] = useState<Gruppe | 'Alle'>('Alle')
  const [expanded, setExpanded] = useState<string | null>('a1')
  const [showForm, setShowForm] = useState(false)
  const [kiBereich, setKiBereich] = useState<Bereich>('Kreativität')
  const [kiVorschlag, setKiVorschlag] = useState<null | { titel: string; beschreibung: string; material?: string }>(null)
  const [kiLaedt, setKiLaedt] = useState(false)
  const [gespeichert, setGespeichert] = useState(false)

  // Formular
  const [neuTitel, setNeuTitel] = useState('')
  const [neuBeschreibung, setNeuBeschreibung] = useState('')
  const [neuTag, setNeuTag] = useState<Tag>('Montag')
  const [neuUhrzeit, setNeuUhrzeit] = useState('09:00')
  const [neuBereich, setNeuBereich] = useState<Bereich>('Kreativität')
  const [neuGruppe, setNeuGruppe] = useState<Gruppe>('Alle')
  const [neuMaterial, setNeuMaterial] = useState('')

  function kiIdeeFinden() {
    setKiLaedt(true)
    setTimeout(() => {
      const ideen = KI_IDEEN[kiBereich]
      setKiVorschlag(ideen[Math.floor(Math.random() * ideen.length)])
      setKiLaedt(false)
    }, 1000)
  }

  function kiUebernehmen() {
    if (!kiVorschlag) return
    setNeuTitel(kiVorschlag.titel)
    setNeuBeschreibung(kiVorschlag.beschreibung)
    if (kiVorschlag.material) setNeuMaterial(kiVorschlag.material)
    setNeuBereich(kiBereich)
    setKiVorschlag(null)
    setShowForm(true)
  }

  function addAkt() {
    if (!neuTitel.trim()) return
    const neu: Aktivitaet = {
      id: `a${Date.now()}`, titel: neuTitel, beschreibung: neuBeschreibung,
      tag: neuTag, uhrzeit: neuUhrzeit, dauer: 30,
      bereich: neuBereich, gruppe: neuGruppe,
      material: neuMaterial || undefined, abgeschlossen: false,
    }
    setAktivitaeten(prev => [...prev, neu])
    setShowForm(false)
    setNeuTitel(''); setNeuBeschreibung(''); setNeuMaterial('')
    setGespeichert(true)
    setTimeout(() => setGespeichert(false), 2000)
  }

  function toggleAbgeschlossen(id: string) {
    setAktivitaeten(prev => prev.map(a => a.id === id ? { ...a, abgeschlossen: !a.abgeschlossen } : a))
  }

  function removeAkt(id: string) {
    setAktivitaeten(prev => prev.filter(a => a.id !== id))
  }

  const gefiltert = aktivitaeten.filter(a => {
    if (filterTag !== 'Alle' && a.tag !== filterTag) return false
    if (filterGruppe !== 'Alle' && a.gruppe !== filterGruppe && a.gruppe !== 'Alle') return false
    return true
  })

  const abgeschlossenCount = aktivitaeten.filter(a => a.abgeschlossen).length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-violet-600" /> Aktivitätenplanung
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Wochenübersicht · Kita Sonnenschein · KW 18</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Aktivitäten', val: aktivitaeten.length, color: 'text-violet-600' },
          { label: 'Diese Woche', val: gefiltert.length, color: 'text-violet-600' },
          { label: 'Abgeschlossen', val: abgeschlossenCount, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* KI-Ideen-Generator */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 space-y-3">
        <p className="text-sm font-bold text-violet-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> KI-Aktivitätsideen
        </p>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(BEREICH_CFG) as Bereich[]).map(b => {
            const cfg = BEREICH_CFG[b]
            return (
              <button key={b} onClick={() => setKiBereich(b)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                  kiBereich === b ? `${cfg.bg} ${cfg.farbe} ring-1 ring-current` : 'bg-white text-gray-500 border border-gray-200'
                }`}>
                {b}
              </button>
            )
          })}
        </div>
        <button onClick={kiIdeeFinden}
          className={`w-full py-2 text-sm font-semibold rounded-xl text-white transition-colors ${kiLaedt ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700'}`}>
          {kiLaedt ? 'Idee wird generiert...' : 'Idee generieren'}
        </button>
        {kiVorschlag && (
          <div className="rounded-xl bg-white border border-violet-200 p-3 space-y-1.5">
            <p className="text-sm font-semibold text-violet-800">{kiVorschlag.titel}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{kiVorschlag.beschreibung}</p>
            {kiVorschlag.material && <p className="text-[10px] text-gray-400">Material: {kiVorschlag.material}</p>}
            <button onClick={kiUebernehmen}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
              + Zum Wochenplan hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          {(['Alle', ...TAGE] as const).map(t => (
            <button key={t} onClick={() => setFilterTag(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                filterTag === t ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {t === 'Alle' ? 'Alle Tage' : t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['Alle', 'Bienen', 'Schmetterlinge'] as const).map(g => (
            <button key={g} onClick={() => setFilterGruppe(g)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                filterGruppe === g ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {g === 'Alle' ? 'Alle Gruppen' : `🐝 ${g}` }
            </button>
          ))}
        </div>
      </div>

      {/* Neue Aktivität */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Aktivität planen
        </button>
      )}

      {showForm && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-4 space-y-3">
          <p className="text-sm font-bold text-violet-700">Neue Aktivität planen</p>

          <input className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Titel der Aktivität..."
            value={neuTitel} onChange={e => setNeuTitel(e.target.value)} />

          <textarea rows={2} className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            placeholder="Kurzbeschreibung..."
            value={neuBeschreibung} onChange={e => setNeuBeschreibung(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tag</label>
              <select className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                value={neuTag} onChange={e => setNeuTag(e.target.value as Tag)}>
                {TAGE.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Uhrzeit</label>
              <input type="time" className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                value={neuUhrzeit} onChange={e => setNeuUhrzeit(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Bereich</label>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(BEREICH_CFG) as Bereich[]).map(b => {
                const cfg = BEREICH_CFG[b]
                return (
                  <button key={b} onClick={() => setNeuBereich(b)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                      neuBereich === b ? `${cfg.bg} ${cfg.farbe}` : 'bg-gray-100 text-gray-500'
                    }`}>
                    {b}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Gruppe</label>
            <div className="flex gap-2">
              {(['Alle', 'Bienen', 'Schmetterlinge'] as Gruppe[]).map(g => (
                <button key={g} onClick={() => setNeuGruppe(g)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    neuGruppe === g ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <input className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
            placeholder="Material (optional)..."
            value={neuMaterial} onChange={e => setNeuMaterial(e.target.value)} />

          <div className="flex gap-2">
            <button onClick={addAkt}
              className="flex-1 py-2 text-sm font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700">
              Eintragen
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600">
              Abbruch
            </button>
          </div>
        </div>
      )}

      {gespeichert && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Aktivität gespeichert
        </div>
      )}

      {/* Aktivitäten gruppiert nach Tag */}
      {(filterTag === 'Alle' ? TAGE : [filterTag]).map(tag => {
        const tagAkt = gefiltert.filter(a => a.tag === tag)
        if (tagAkt.length === 0) return null
        return (
          <div key={tag}>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{tag}</h2>
            <div className="space-y-2">
              {tagAkt.sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit)).map(a => {
                const bCfg = BEREICH_CFG[a.bereich]
                const BIcon = bCfg.icon
                const isOpen = expanded === a.id
                return (
                  <div key={a.id} className={`rounded-2xl border overflow-hidden bg-white transition-opacity ${a.abgeschlossen ? 'opacity-60' : ''}`}
                    style={{ borderColor: '#e5e7eb' }}>
                    <button onClick={() => setExpanded(isOpen ? null : a.id)}
                      className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bCfg.bg}`}>
                        <BIcon className={`w-4 h-4 ${bCfg.farbe}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className={`text-sm font-semibold text-gray-800 ${a.abgeschlossen ? 'line-through' : ''}`}>{a.titel}</p>
                          {a.ki && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">KI</span>}
                          {a.abgeschlossen && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-wrap">
                          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{a.uhrzeit}</span>
                          <span>· {a.dauer} Min</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${bCfg.bg} ${bCfg.farbe}`}>{a.bereich}</span>
                          {a.gruppe !== 'Alle' && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">🐝 {a.gruppe}</span>
                          )}
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-1 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 pb-3 pt-2.5 space-y-2">
                        <p className="text-xs text-gray-600 leading-relaxed">{a.beschreibung}</p>
                        {a.material && <p className="text-[10px] text-gray-400">Material: {a.material}</p>}
                        <div className="flex gap-2">
                          <button onClick={() => toggleAbgeschlossen(a.id)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                              a.abgeschlossen
                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}>
                            {a.abgeschlossen ? 'Wiederherstellen' : '✓ Als erledigt markieren'}
                          </button>
                          <button onClick={() => removeAkt(a.id)} className="px-3 py-1.5 text-xs rounded-xl text-red-400 hover:text-red-600 border border-gray-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
