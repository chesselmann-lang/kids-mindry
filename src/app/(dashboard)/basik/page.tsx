'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Info, Download, BarChart2 } from 'lucide-react';

/** BaSiK — Beobachtungsbogen zur Sprachentwicklung in Kindertageseinrichtungen
 *  Beobachtungsverfahren 3–6 Jahre
 *  Bereiche: Kommunikation, Wortschatz, Grammatik, Phonologie, Literacy
 *  Bewertung: 0 = Noch nicht, 1 = Vereinzelt, 2 = Häufig, 3 = Sicher
 */

interface BasikItem {
  id: string;
  bereich: 'Kommunikation' | 'Wortschatz' | 'Grammatik' | 'Phonologie' | 'Literacy';
  nr: string;
  beschreibung: string;
  alter: '3–4 J.' | '4–5 J.' | '5–6 J.';
}

const ITEMS: BasikItem[] = [
  // Kommunikation
  { id: 'k1', bereich: 'Kommunikation', nr: 'K1', beschreibung: 'Nimmt Blickkontakt auf und hält ihn aufrecht', alter: '3–4 J.' },
  { id: 'k2', bereich: 'Kommunikation', nr: 'K2', beschreibung: 'Beteiligt sich aktiv an Gesprächen in der Gruppe', alter: '3–4 J.' },
  { id: 'k3', bereich: 'Kommunikation', nr: 'K3', beschreibung: 'Schildert Erlebnisse und Ereignisse zusammenhängend', alter: '4–5 J.' },
  { id: 'k4', bereich: 'Kommunikation', nr: 'K4', beschreibung: 'Passt Sprache der Situation an (Fachkraft vs. Gleichaltrige)', alter: '5–6 J.' },

  // Wortschatz
  { id: 'w1', bereich: 'Wortschatz', nr: 'W1', beschreibung: 'Benennt alltägliche Objekte, Tiere und Personen korrekt', alter: '3–4 J.' },
  { id: 'w2', bereich: 'Wortschatz', nr: 'W2', beschreibung: 'Versteht und verwendet Adjektive (Farben, Formen, Größen)', alter: '3–4 J.' },
  { id: 'w3', bereich: 'Wortschatz', nr: 'W3', beschreibung: 'Kennt und nutzt Verben für alltägliche Handlungen differenziert', alter: '4–5 J.' },
  { id: 'w4', bereich: 'Wortschatz', nr: 'W4', beschreibung: 'Verwendet Oberbegriffe spontan und korrekt', alter: '4–5 J.' },
  { id: 'w5', bereich: 'Wortschatz', nr: 'W5', beschreibung: 'Erklärt Wörter und umschreibt unbekannte Begriffe', alter: '5–6 J.' },

  // Grammatik
  { id: 'g1', bereich: 'Grammatik', nr: 'G1', beschreibung: 'Bildet einfache Aussagesätze korrekt (SVO)', alter: '3–4 J.' },
  { id: 'g2', bereich: 'Grammatik', nr: 'G2', beschreibung: 'Verwendet regelmäßige Pluralformen korrekt', alter: '3–4 J.' },
  { id: 'g3', bereich: 'Grammatik', nr: 'G3', beschreibung: 'Konjugiert Verben in Präsens und Vergangenheit', alter: '4–5 J.' },
  { id: 'g4', bereich: 'Grammatik', nr: 'G4', beschreibung: 'Verwendet Artikel korrekt (Nominativ, Akkusativ)', alter: '4–5 J.' },
  { id: 'g5', bereich: 'Grammatik', nr: 'G5', beschreibung: 'Bildet Nebensätze mit Konjunktionen (weil, dass, wenn)', alter: '5–6 J.' },

  // Phonologie
  { id: 'p1', bereich: 'Phonologie', nr: 'P1', beschreibung: 'Spricht alle Vokale und häufige Konsonanten deutlich aus', alter: '3–4 J.' },
  { id: 'p2', bereich: 'Phonologie', nr: 'P2', beschreibung: 'Erkennt Reime und kann reimende Wörter nennen', alter: '4–5 J.' },
  { id: 'p3', bereich: 'Phonologie', nr: 'P3', beschreibung: 'Segmentiert Wörter in Silben korrekt', alter: '4–5 J.' },
  { id: 'p4', bereich: 'Phonologie', nr: 'P4', beschreibung: 'Identifiziert Anlaute von Wörtern zuverlässig', alter: '5–6 J.' },

  // Literacy
  { id: 'l1', bereich: 'Literacy', nr: 'L1', beschreibung: 'Zeigt Interesse an Büchern, Geschichten und Vorlesen', alter: '3–4 J.' },
  { id: 'l2', bereich: 'Literacy', nr: 'L2', beschreibung: 'Hält Buch korrekt, blättert seitenweise, versteht Leserichtung', alter: '4–5 J.' },
  { id: 'l3', bereich: 'Literacy', nr: 'L3', beschreibung: 'Erkennt eigenen Namen in Schrift; unterscheidet Buchstaben von Zahlen', alter: '5–6 J.' },
  { id: 'l4', bereich: 'Literacy', nr: 'L4', beschreibung: 'Schreibt Namen und einzelne Buchstaben; buchstabiert erste Wörter', alter: '5–6 J.' },
];

const KINDER = [
  { id: '1', name: 'Lena M.',      alter: '4;5', gruppe: 'Sternschnuppen' },
  { id: '2', name: 'Omar F.',      alter: '5;1', gruppe: 'Regenbogen' },
  { id: '3', name: 'Sofia P.',     alter: '3;8', gruppe: 'Sonnenkinder' },
];

const SCORES_LABEL = ['Noch nicht', 'Vereinzelt', 'Häufig', 'Sicher'] as const;
const SCORES_COLOR = ['text-gray-400', 'text-orange-500', 'text-blue-600', 'text-green-600'] as const;

const BEREICH_COLOR: Record<BasikItem['bereich'], string> = {
  Kommunikation: 'bg-blue-100 text-blue-800',
  Wortschatz:    'bg-green-100 text-green-800',
  Grammatik:     'bg-teal-100 text-teal-800',
  Phonologie:    'bg-purple-100 text-purple-800',
  Literacy:      'bg-amber-100 text-amber-800',
};

export default function BasikPage() {
  const [selectedKind, setSelectedKind] = useState(KINDER[0].id);
  const [scores, setScores] = useState<Record<string, 0|1|2|3>>({});
  const [expandedBereich, setExpandedBereich] = useState<string | null>('Kommunikation');

  const cycle = (id: string) => setScores(p => ({ ...p, [id]: ((( p[id] ?? 0) + 1) % 4) as 0|1|2|3 }));

  const bereiche = Array.from(new Set(ITEMS.map(i => i.bereich)));
  const gesamtPunkte = ITEMS.reduce((s, i) => s + (scores[i.id] ?? 0), 0);
  const maxPunkte = ITEMS.length * 3;
  const pct = Math.round((gesamtPunkte / maxPunkte) * 100);
  const kind = KINDER.find(k => k.id === selectedKind)!;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>BaSiK</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Beobachtungsbogen zur Sprachentwicklung in Kindertageseinrichtungen (3–6 J.)
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          BaSiK erfasst die Sprachentwicklung in 5 Bereichen alltagsintegriert.
          Bewertung: <strong style={{ color: 'var(--color-text)' }}>Noch nicht</strong> (0) ·
          <strong style={{ color: 'var(--color-text)' }}> Vereinzelt</strong> (1) ·
          <strong style={{ color: 'var(--color-text)' }}> Häufig</strong> (2) ·
          <strong style={{ color: 'var(--color-text)' }}> Sicher</strong> (3)
        </p>
      </div>

      {/* Kind auswählen */}
      <div className="flex flex-wrap gap-2">
        {KINDER.map(k => (
          <button key={k.id} onClick={() => setSelectedKind(k.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${selectedKind === k.id ? 'bg-blue-600 text-white border-blue-600' : ''}`}
            style={selectedKind !== k.id ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' } : {}}>
            {k.name} · {k.alter} J.
          </button>
        ))}
      </div>

      {/* Fortschritt */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>{kind.name} · {kind.alter} J. · {kind.gruppe}</span>
          <span className="font-bold text-blue-600">{gesamtPunkte} / {maxPunkte} Pkt. ({pct} %)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-end mt-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <Download className="w-3.5 h-3.5" /> PDF Export
          </button>
        </div>
      </div>

      {/* Bereiche */}
      <div className="space-y-2">
        {bereiche.map(bereich => {
          const bereichItems = ITEMS.filter(i => i.bereich === bereich);
          const isOpen = expandedBereich === bereich;
          const bp = bereichItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0);
          const bmax = bereichItems.length * 3;
          return (
            <div key={bereich} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => setExpandedBereich(isOpen ? null : bereich)}
                className="w-full flex items-center justify-between p-4" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BEREICH_COLOR[bereich as BasikItem['bereich']]}`}>{bereich}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{bereichItems.length} Items</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600">{bp}/{bmax}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </button>
              {isOpen && (
                <div className="divide-y" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {bereichItems.map(item => {
                    const sc = scores[item.id] ?? 0;
                    return (
                      <div key={item.id} className="flex items-start gap-4 px-4 py-3" style={{ background: 'var(--color-bg)' }}>
                        <span className="text-xs font-bold text-blue-500 shrink-0 mt-0.5 w-8">{item.nr}</span>
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: 'var(--color-text)' }}>{item.beschreibung}</p>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.alter}</span>
                        </div>
                        <button onClick={() => cycle(item.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors min-w-[110px] text-center ${SCORES_COLOR[sc]}`}
                          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                          {SCORES_LABEL[sc]}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bereichs-Übersicht */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Bereichsübersicht</span>
        </div>
        <div className="space-y-2">
          {bereiche.map(bereich => {
            const bp = ITEMS.filter(i => i.bereich === bereich).reduce((s, i) => s + (scores[i.id] ?? 0), 0);
            const bmax = ITEMS.filter(i => i.bereich === bereich).length * 3;
            const bpct = Math.round((bp / bmax) * 100);
            return (
              <div key={bereich} className="flex items-center gap-3">
                <span className="text-xs w-28 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{bereich}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${bpct}%` }} />
                </div>
                <span className="text-xs font-semibold w-10 text-right text-blue-600">{bpct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
