'use client'

import { useState } from 'react'
import {
  MessageSquare, Star, ChevronDown, ChevronUp, Sparkles,
  CheckCircle2, Calendar, Users, AlertTriangle, Plus,
  Heart, TrendingUp, FileText, Clock,
} from 'lucide-react'

// ── Entwicklungsgespräche — Mindry Kids ──────────────────────────────────────
// Elterngespräche zur Entwicklung · Leiterin / Pädagoginnen

type GespraechStatus = 'geplant' | 'stattgefunden' | 'ausstehend' | 'abgesagt'
type Bereich = 'Motorik' | 'Sprache' | 'Sozial' | 'Kognitiv' | 'Emotional' | 'Selbständigkeit'

interface EntwicklungsNotiz {
  bereich: Bereich
  notiz: string
  niveau: 1 | 2 | 3
}

interface Gespraech {
  id: string
  kind: string
  gruppe: string
  alter: number
  eltern: string
  datum?: string
  uhrzeit?: string
  status: GespraechStatus
  erzieherin: string
  notizen?: EntwicklungsNotiz[]
  vereinbarungen?: string
  naechsterTermin?: string
  kiText?: string
}

const STATUS_CFG: Record<GespraechStatus, { label: string; farbe: string; bg: string }> = {
  geplant:       { label: 'Geplant',        farbe: 'text-blue-700',   bg: 'bg-blue-50' },
  stattgefunden: { label: 'Abgeschlossen',  farbe: 'text-green-700',  bg: 'bg-green-50' },
  ausstehend:    { label: 'Ausstehend',     farbe: 'text-orange-700', bg: 'bg-orange-50' },
  abgesagt:      { label: 'Abgesagt',       farbe: 'text-gray-600',   bg: 'bg-gray-100' },
}

const NIVEAU_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Förderbedarf', 2: 'Altersgemäß', 3: 'Sehr gut'
}
const NIVEAU_FARBE: Record<1 | 2 | 3, string> = {
  1: 'text-red-600', 2: 'text-yellow-600', 3: 'text-green-600'
}

const GESPRAECHE: Gespraech[] = [
  {
    id: 'g1', kind: 'Mia S.', gruppe: 'Bienen', alter: 3,
    eltern: 'Fam. Sommer', datum: 'Di, 29. Apr. 2025', uhrzeit: '15:00',
    status: 'geplant', erzieherin: 'Fr. Bauer',
    notizen: [
      { bereich: 'Sprache',         notiz: 'Wortschatz sehr gut für Alter. Satzbildung klar.',                niveau: 3 },
      { bereich: 'Sozial',          notiz: 'Sehr einfühlsam, spielt gerne mit anderen.',                     niveau: 3 },
      { bereich: 'Motorik',         notiz: 'Feinmotorik: Schere noch unsicher.',                             niveau: 2 },
      { bereich: 'Selbständigkeit', notiz: 'Zieht sich selbst an, braucht noch Hilfe beim Schuhebinden.',    niveau: 2 },
    ],
  },
  {
    id: 'g2', kind: 'Paul H.', gruppe: 'Schmetterlinge', alter: 3,
    eltern: 'Fam. Hoffmann', datum: 'Mo, 28. Apr. 2025', uhrzeit: '16:30',
    status: 'stattgefunden', erzieherin: 'Fr. Klein',
    notizen: [
      { bereich: 'Emotional',   notiz: 'Trennungsangst morgens. Braucht mehr Zeit.',                        niveau: 1 },
      { bereich: 'Sozial',      notiz: 'Spielt lieber allein, sucht noch Kontakt zu Gleichaltrigen.',       niveau: 1 },
      { bereich: 'Sprache',     notiz: 'Altersgemäße Entwicklung.',                                        niveau: 2 },
      { bereich: 'Motorik',     notiz: 'Grobmotorik stark: Klettern, Toben, Balancieren.',                 niveau: 3 },
    ],
    vereinbarungen: 'Behutsame Eingewöhnung am Morgen verlängern (15 Min.). Pate-Kind für Paul auswählen. Wiedervorstellung in 6 Wochen.',
    naechsterTermin: 'Jun 2025',
    kiText: 'Pauls Trennungsangst ist für sein Alter nicht ungewöhnlich. Empfehlung: "Übergangsobjekt" (Kuscheltier) einführen, Abschiedsritual mit Eltern etablieren.',
  },
  {
    id: 'g3', kind: 'Emma W.', gruppe: 'Bienen', alter: 3,
    eltern: 'Fr. Weber', datum: 'Fr, 25. Apr. 2025', uhrzeit: '14:30',
    status: 'stattgefunden', erzieherin: 'Fr. Bauer',
    notizen: [
      { bereich: 'Kognitiv',        notiz: 'Hohes Interesse an Zahlen und Buchstaben. Lernfreudig.',        niveau: 3 },
      { bereich: 'Sprache',         notiz: 'Spricht in vollständigen Sätzen, fragt viel nach.',             niveau: 3 },
      { bereich: 'Sozial',          notiz: 'Gut integriert, hat beste Freundin (Mia).',                     niveau: 3 },
      { bereich: 'Selbständigkeit', notiz: 'Sehr selbständig beim Aufräumen und Anziehen.',                 niveau: 3 },
    ],
    vereinbarungen: 'Förderangebote für Vorschulkinder anbieten (Zahlenland, Buchstabenland).',
    kiText: 'Emma zeigt herausragende Vorschulreife. Empfehlung: Übergangsberatung mit Grundschule früh beginnen, evtl. vorzeitige Einschulung prüfen.',
  },
  {
    id: 'g4', kind: 'Finn A.', gruppe: 'Schmetterlinge', alter: 3,
    eltern: 'Fam. Albrecht', status: 'ausstehend', erzieherin: 'Fr. Klein',
  },
]

export default function EntwicklungsgespraechePage() {
  const [gespraeche, setGespraeche] = useState(GESPRAECHE)
  const [expanded, setExpanded] = useState<string | null>('g2')
  const [kiLaedt, setKiLaedt] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<GespraechStatus | 'alle'>('alle')

  function kiAnfordern(id: string) {
    setKiLaedt(id)
    setTimeout(() => {
      setGespraeche(prev => prev.map(g => {
        if (g.id !== id) return g
        if (!g.notizen) return { ...g, kiText: 'Keine Notizen vorhanden. Bitte zunächst Beobachtungen eintragen.' }
        const foerderbedarf = g.notizen.filter(n => n.niveau === 1)
        const text = foerderbedarf.length > 0
          ? `Förderbedarf in: ${foerderbedarf.map(n => n.bereich).join(', ')}. Konkrete Maßnahmen: individuelle Förderangebote einrichten, enge Beobachtung, Eltern regelmäßig informieren.`
          : `Gute Gesamtentwicklung. ${g.kind.split(' ')[0]} zeigt in allen Bereichen altersgemäße oder überdurchschnittliche Entwicklung. Weiter begleiten.`
        return { ...g, kiText: text }
      }))
      setKiLaedt(null)
    }, 1100)
  }

  const gefiltert = filterStatus === 'alle' ? gespraeche : gespraeche.filter(g => g.status === filterStatus)
  const geplant = gespraeche.filter(g => g.status === 'geplant').length
  const foerderbedarf = gespraeche.filter(g => g.notizen?.some(n => n.niveau === 1)).length

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-500" /> Entwicklungsgespräche
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Elterngespräche · Entwicklungsdokumentation · KI-Unterstützung</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Gesamt',       val: gespraeche.length,                                              color: 'text-amber-700' },
          { label: 'Geplant',      val: geplant,                                                        color: 'text-blue-700' },
          { label: 'Förderbedarf', val: foerderbedarf,                                                  color: foerderbedarf > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Abgeschlossen',val: gespraeche.filter(g => g.status === 'stattgefunden').length,    color: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-amber-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 'geplant', 'stattgefunden', 'ausstehend', 'abgesagt'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: filterStatus === s ? '#f59e0b' : '#fef3c7',
              color: filterStatus === s ? 'white' : '#92400e',
            }}>
            {s === 'alle' ? 'Alle' : STATUS_CFG[s].label}
          </button>
        ))}
      </div>

      {/* Gespräche */}
      <div className="space-y-2">
        {gefiltert.map(g => {
          const isOpen = expanded === g.id
          const sCfg = STATUS_CFG[g.status]
          const hasFoerderbedarf = g.notizen?.some(n => n.niveau === 1)
          return (
            <div key={g.id} className={`rounded-2xl border overflow-hidden bg-white ${
              hasFoerderbedarf ? 'border-red-200' :
              g.status === 'stattgefunden' ? 'border-green-200' :
              g.status === 'geplant' ? 'border-blue-200' : 'border-amber-100'
            }`}>
              <button onClick={() => setExpanded(isOpen ? null : g.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                  {g.kind.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-amber-900">{g.kind}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.label}</span>
                    {hasFoerderbedarf && <AlertTriangle className="w-3 h-3 text-red-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-700/60 flex-wrap">
                    <span>{g.gruppe} · {g.alter} J. · {g.eltern}</span>
                    {g.datum && <><Calendar className="w-3 h-3" />{g.datum} {g.uhrzeit}</>}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-100 px-4 pb-4 pt-3 space-y-3">
                  <p className="text-xs text-amber-700/70">Erzieherin: <span className="font-medium text-amber-900">{g.erzieherin}</span></p>

                  {g.notizen && g.notizen.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mb-2">Entwicklungsbereiche</p>
                      <div className="space-y-1.5">
                        {g.notizen.map(n => (
                          <div key={n.bereich} className="flex items-start gap-2.5 rounded-xl px-3 py-2 bg-amber-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs font-semibold text-amber-900">{n.bereich}</p>
                                <span className={`text-[9px] font-bold ${NIVEAU_FARBE[n.niveau]}`}>{NIVEAU_LABEL[n.niveau]}</span>
                              </div>
                              <p className="text-xs text-amber-700/70">{n.notiz}</p>
                            </div>
                            <div className="flex gap-0.5 mt-0.5">
                              {([1, 2, 3] as const).map(s => (
                                <div key={s} className={`w-2.5 h-2.5 rounded-full ${s <= n.niveau ? (n.niveau === 3 ? 'bg-green-400' : n.niveau === 2 ? 'bg-yellow-400' : 'bg-red-400') : 'bg-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {g.vereinbarungen && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mb-1">Vereinbarungen</p>
                      <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-green-800 leading-relaxed">{g.vereinbarungen}</p>
                      </div>
                    </div>
                  )}

                  {g.naechsterTermin && (
                    <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <p className="text-xs text-blue-800">Nächster Termin: <span className="font-semibold">{g.naechsterTermin}</span></p>
                    </div>
                  )}

                  {g.kiText ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" /> KI-Empfehlung
                      </p>
                      <p className="text-xs text-amber-900 leading-relaxed">{g.kiText}</p>
                    </div>
                  ) : (
                    <button onClick={() => kiAnfordern(g.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" />
                      {kiLaedt === g.id ? 'KI analysiert...' : 'KI-Empfehlung anfordern'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
