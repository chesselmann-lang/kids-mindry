'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Star, Clock, Search, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Beobachtungsnotizen — Mindry Kids ─────────────────────────────────────────
// Tägliche Kurznotizen · Dokumentation · Entwicklungsbeobachtung

type BeobachtungsBereich = 'sozial' | 'sprache' | 'motorik' | 'kreativitaet' | 'emotional' | 'kognitiv'
type StimmungTag = 'sehr_gut' | 'gut' | 'mittel' | 'aufgeregt' | 'zurueckgezogen'

interface Beobachtung {
  id: string
  kind: string
  gruppe: string
  datum: string
  stimmung: StimmungTag
  bereiche: BeobachtungsBereich[]
  notiz: string
  auffaellig?: boolean
  verfasst: string // Erzieher:in
}

const BEREICH_CFG: Record<BeobachtungsBereich, { label: string; farbe: string }> = {
  sozial:       { label: 'Sozial',     farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  sprache:      { label: 'Sprache',    farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  motorik:      { label: 'Motorik',    farbe: 'bg-green-50 text-green-700 border-green-200' },
  kreativitaet: { label: 'Kreativität',farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  emotional:    { label: 'Emotional',  farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  kognitiv:     { label: 'Kognitiv',   farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STIMMUNG_CFG: Record<StimmungTag, { emoji: string; label: string }> = {
  sehr_gut:       { emoji: '😄', label: 'Sehr gut' },
  gut:            { emoji: '😊', label: 'Gut' },
  mittel:         { emoji: '😐', label: 'Mittel' },
  aufgeregt:      { emoji: '😤', label: 'Aufgeregt' },
  zurueckgezogen: { emoji: '😶', label: 'Zurückgezogen' },
}

const INIT_BEOBACHTUNGEN: Beobachtung[] = [
  {
    id: 'b1', kind: 'Leon M.', gruppe: 'Sonnenkäfer', datum: 'Heute, 09:15', stimmung: 'gut',
    bereiche: ['sozial', 'sprache'],
    notiz: 'Leon hat heute aktiv in der Morgenrunde mitgemacht und zwei neue Wörter benutzt ("Kooperieren" und "vereinbaren"). Wirkt deutlich selbstsicherer beim Sprechen vor der Gruppe.',
    verfasst: 'Fr. Weber', auffaellig: false,
  },
  {
    id: 'b2', kind: 'Mia S.', gruppe: 'Sonnenkäfer', datum: 'Heute, 10:30', stimmung: 'sehr_gut',
    bereiche: ['kreativitaet', 'motorik'],
    notiz: 'Mia hat ein detailliertes Bild ihrer Familie gemalt — sehr feine Pinselführung für ihr Alter (3,2 Jahre). Hält Pinsel mit Dreipunktgriff.',
    verfasst: 'Hr. Schulze',
  },
  {
    id: 'b3', kind: 'Tom R.', gruppe: 'Marienkäfer', datum: 'Heute, 11:45', stimmung: 'aufgeregt',
    bereiche: ['emotional', 'sozial'],
    notiz: 'Tom hatte heute mehrere Konflikte beim Freispiel wegen des roten Autos. Konnte sich nur schwer beruhigen. Gespräch geführt — er wollte aber nicht darüber reden.',
    verfasst: 'Fr. Weber', auffaellig: true,
  },
  {
    id: 'b4', kind: 'Anna K.', gruppe: 'Marienkäfer', datum: 'Gestern, 14:00', stimmung: 'zurueckgezogen',
    bereiche: ['emotional', 'sprache'],
    notiz: 'Anna war ungewöhnlich still. Hat kaum gesprochen und spielte ausschließlich alleine. Eltern fragen ob es Gründe zuhause gibt.',
    verfasst: 'Fr. Weber', auffaellig: true,
  },
  {
    id: 'b5', kind: 'Noah P.', gruppe: 'Sonnenkäfer', datum: 'Gestern, 09:30', stimmung: 'gut',
    bereiche: ['motorik', 'kognitiv'],
    notiz: 'Noah hat den Kletterturm heute zum ersten Mal ohne Hilfe erklommen — strahlendes Lächeln! Zuvor 3 Wochen Übung nötig gewesen.',
    verfasst: 'Hr. Schulze',
  },
  {
    id: 'b6', kind: 'Emma W.', gruppe: 'Krippenkinder', datum: 'Di 29.04.', stimmung: 'sehr_gut',
    bereiche: ['sprache', 'kognitiv'],
    notiz: 'Emma (21 Monate) hat heute "Mama", "Bau" und "nein" klar artikuliert. Aktiver Wortschatz wächst gut.',
    verfasst: 'Fr. Weber',
  },
]

export default function BeobachtungsNotizenPage() {
  const [expanded, setExpanded] = useState<string | null>('b1')
  const [suchtext, setSuchtext] = useState('')
  const [filterBereich, setFilterBereich] = useState<'alle' | BeobachtungsBereich>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const auffaellig = INIT_BEOBACHTUNGEN.filter(b => b.auffaellig).length

  const gefiltert = INIT_BEOBACHTUNGEN.filter(b => {
    const matchSearch = suchtext === '' || b.kind.toLowerCase().includes(suchtext.toLowerCase()) || b.notiz.toLowerCase().includes(suchtext.toLowerCase())
    const matchBereich = filterBereich === 'alle' || b.bereiche.includes(filterBereich)
    return matchSearch && matchBereich
  })

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${auffaellig} auffällige Beobachtungen heute. Tom R. (Marienkäfer) — emotionale Regulierung weiter beobachten. Anna K. (Marienkäfer) — Rückzug, Elternkontakt empfohlen. Positive Entwicklungen: Leon (Sprachfortschritt), Noah (Motorik-Meilenstein). Empfehlung: Elterngespräch für Tom und Anna zeitnah einplanen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-600" /> Beobachtungsnotizen
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Tägliche Beobachtungen · alle Gruppen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Heute',     val: INIT_BEOBACHTUNGEN.filter(b=>b.datum.startsWith('Heute')).length, color: 'text-teal-700' },
          { label: 'Auffällig', val: auffaellig, color: auffaellig > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Gesamt',    val: INIT_BEOBACHTUNGEN.length, color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-200 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {auffaellig > 0 && (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-800">{auffaellig} Beobachtung(en) als auffällig markiert — bitte prüfen</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Auswertung</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Tagesauswertung'}
        </button>
      )}

      {/* Suche */}
      <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-2xl px-3 py-2">
        <Search className="w-3.5 h-3.5 text-teal-400" />
        <input value={suchtext} onChange={e => setSuchtext(e.target.value)}
          placeholder="Kind oder Notiz suchen..."
          className="flex-1 bg-transparent text-xs text-teal-900 placeholder-teal-400 outline-none" />
      </div>

      {/* Bereich-Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilterBereich('alle')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterBereich === 'alle' ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
          Alle
        </button>
        {(Object.keys(BEREICH_CFG) as BeobachtungsBereich[]).map(b => (
          <button key={b} onClick={() => setFilterBereich(b)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterBereich === b ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
            {BEREICH_CFG[b].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(b => {
          const stiCfg = STIMMUNG_CFG[b.stimmung]
          const isOpen = expanded === b.id
          return (
            <div key={b.id} className={`rounded-2xl border overflow-hidden ${b.auffaellig ? 'border-orange-200 bg-orange-50/20' : 'border-teal-100 bg-white'}`}>
              <button onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <span className="text-lg shrink-0">{stiCfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{b.kind}</p>
                    <span className="text-[9px] text-teal-500">{b.gruppe}</span>
                    {b.auffaellig && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                  </div>
                  <p className="text-[9px] text-teal-500 mt-0.5">{b.datum} · {b.verfasst}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {b.bereiche.map((br, i) => (
                      <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded-full border ${BEREICH_CFG[br].farbe}`}>{BEREICH_CFG[br].label}</span>
                    ))}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-teal-300" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-2.5 pt-2 space-y-1.5">
                  <p className="text-[10px] text-teal-800 leading-relaxed">{b.notiz}</p>
                  {b.auffaellig && (
                    <div className="flex items-center gap-1 text-[9px] text-orange-700 bg-orange-50 rounded-lg px-2 py-1 border border-orange-200">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> Als auffällig markiert — Elternkontakt prüfen
                    </div>
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
