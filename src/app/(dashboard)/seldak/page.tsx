'use client';

import { useState } from 'react';
import { Languages, CheckCircle2, Circle, Download, Info, ChevronDown, ChevronUp, Star } from 'lucide-react';

/** SELDAK — Sprachentwicklung und Literacy bei deutschsprachig aufwachsenden Kindern
 *  Beobachtungsverfahren für Kinder 3.5–6 J. mit Migrationshintergrund oder mehrsprachiger Erziehung
 *  Bereiche: Phonologisches Bewusstsein, Wortschatz, Grammatik, Erzählen, Schriftsprachliche Bewusstsein
 */

interface SeldakItem {
  id: string;
  bereich: 'Phonologie' | 'Wortschatz' | 'Grammatik' | 'Erzählen' | 'Schriftsprache';
  nr: string;
  beschreibung: string;
  altersgruppe: '3.5–4.5 J.' | '4.5–5.5 J.' | '5.5–6.5 J.';
}

const ITEMS: SeldakItem[] = [
  // Phonologie
  { id: 'p1', bereich: 'Phonologie', nr: 'P1', beschreibung: 'Erkennt Reime und kann reimende Wortpaare nennen', altersgruppe: '3.5–4.5 J.' },
  { id: 'p2', bereich: 'Phonologie', nr: 'P2', beschreibung: 'Segmentiert Wörter in Silben durch Klatschen', altersgruppe: '3.5–4.5 J.' },
  { id: 'p3', bereich: 'Phonologie', nr: 'P3', beschreibung: 'Erkennt den Anlaut eines Wortes', altersgruppe: '4.5–5.5 J.' },
  { id: 'p4', bereich: 'Phonologie', nr: 'P4', beschreibung: 'Lautsynthese: Zusammensetzen von Lauten zu Wörtern', altersgruppe: '5.5–6.5 J.' },
  { id: 'p5', bereich: 'Phonologie', nr: 'P5', beschreibung: 'Lautanalyse: Isoliert An-, In- und Auslaut', altersgruppe: '5.5–6.5 J.' },

  // Wortschatz
  { id: 'w1', bereich: 'Wortschatz', nr: 'W1', beschreibung: 'Benennt Alltagsobjekte und -handlungen korrekt (Bildbenennungsaufgabe)', altersgruppe: '3.5–4.5 J.' },
  { id: 'w2', bereich: 'Wortschatz', nr: 'W2', beschreibung: 'Versteht und verwendet relationale Begriffe (groß/klein, voll/leer)', altersgruppe: '3.5–4.5 J.' },
  { id: 'w3', bereich: 'Wortschatz', nr: 'W3', beschreibung: 'Verwendet Oberbegriffe (Tiere, Fahrzeuge, Möbel)', altersgruppe: '4.5–5.5 J.' },
  { id: 'w4', bereich: 'Wortschatz', nr: 'W4', beschreibung: 'Erklärt die Bedeutung von Wörtern in eigenen Worten', altersgruppe: '5.5–6.5 J.' },

  // Grammatik
  { id: 'g1', bereich: 'Grammatik', nr: 'G1', beschreibung: 'Bildet einfache Hauptsätze (SVO-Struktur) korrekt', altersgruppe: '3.5–4.5 J.' },
  { id: 'g2', bereich: 'Grammatik', nr: 'G2', beschreibung: 'Versteht und verwendet den Plural verschiedener Nomen', altersgruppe: '3.5–4.5 J.' },
  { id: 'g3', bereich: 'Grammatik', nr: 'G3', beschreibung: 'Korrekte Kasusmarkierungen (Nominativ, Akkusativ, Dativ)', altersgruppe: '4.5–5.5 J.' },
  { id: 'g4', bereich: 'Grammatik', nr: 'G4', beschreibung: 'Bildet Sätze mit Nebensatz (weil, wenn, dass)', altersgruppe: '5.5–6.5 J.' },

  // Erzählen
  { id: 'e1', bereich: 'Erzählen', nr: 'E1', beschreibung: 'Erzählt eigene Erlebnisse mit Anfang und Ende', altersgruppe: '3.5–4.5 J.' },
  { id: 'e2', bereich: 'Erzählen', nr: 'E2', beschreibung: 'Schildert Bildergeschichten in logischer Reihenfolge', altersgruppe: '4.5–5.5 J.' },
  { id: 'e3', bereich: 'Erzählen', nr: 'E3', beschreibung: 'Verwendet Konjunktionen zur Verknüpfung (dann, weil, aber)', altersgruppe: '4.5–5.5 J.' },
  { id: 'e4', bereich: 'Erzählen', nr: 'E4', beschreibung: 'Erzählt Märchen/Geschichten mit Handlung, Problem und Lösung', altersgruppe: '5.5–6.5 J.' },

  // Schriftsprache
  { id: 's1', bereich: 'Schriftsprache', nr: 'S1', beschreibung: 'Zeigt Interesse an Büchern und Schrift', altersgruppe: '3.5–4.5 J.' },
  { id: 's2', bereich: 'Schriftsprache', nr: 'S2', beschreibung: 'Erkennt den eigenen Namen in Schrift', altersgruppe: '4.5–5.5 J.' },
  { id: 's3', bereich: 'Schriftsprache', nr: 'S3', beschreibung: 'Unterscheidet Buchstaben von Zahlen und Bildern', altersgruppe: '4.5–5.5 J.' },
  { id: 's4', bereich: 'Schriftsprache', nr: 'S4', beschreibung: 'Schreibt den eigenen Namen und einige Buchstaben', altersgruppe: '5.5–6.5 J.' },
];

const KINDER = [
  { id: '1', name: 'Asel K.',      alter: '5;2', muttersprache: 'Russisch', gruppe: 'Sternschnuppen' },
  { id: '2', name: 'Mohammed Y.',  alter: '4;8', muttersprache: 'Arabisch', gruppe: 'Sonnenkinder' },
  { id: '3', name: 'Fatima Ö.',    alter: '5;10', muttersprache: 'Türkisch', gruppe: 'Regenbogen' },
  { id: '4', name: 'Nicolás R.',   alter: '4;3', muttersprache: 'Spanisch', gruppe: 'Sonnenkinder' },
];

const BEREICH_COLOR: Record<SeldakItem['bereich'], string> = {
  Phonologie:    'bg-purple-100 text-purple-800',
  Wortschatz:    'bg-blue-100 text-blue-800',
  Grammatik:     'bg-teal-100 text-teal-800',
  Erzählen:      'bg-amber-100 text-amber-800',
  Schriftsprache:'bg-green-100 text-green-800',
};

export default function SeldakPage() {
  const [selectedKind, setSelectedKind] = useState(KINDER[0].id);
  const [scores, setScores] = useState<Record<string, 0 | 1 | 2>>({});
  const [expandedBereich, setExpandedBereich] = useState<string | null>('Phonologie');

  const toggle = (id: string) => {
    setScores(prev => {
      const cur = prev[id] ?? 0;
      return { ...prev, [id]: ((cur + 1) % 3) as 0 | 1 | 2 };
    });
  };

  const scoreLabel = (s: 0 | 1 | 2 | undefined) => {
    if (s === 2) return { label: '✓ Ja', color: 'text-green-600' };
    if (s === 1) return { label: '~ Teilweise', color: 'text-amber-600' };
    return { label: '○ Nein', color: 'text-gray-400' };
  };

  const bereiche = Array.from(new Set(ITEMS.map(i => i.bereich)));
  const gesamtPunkte = ITEMS.reduce((s, item) => s + (scores[item.id] ?? 0), 0);
  const maxPunkte = ITEMS.length * 2;
  const pct = Math.round((gesamtPunkte / maxPunkte) * 100);

  const kind = KINDER.find(k => k.id === selectedKind)!;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
          <Languages className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>SELDAK</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Sprachentwicklung & Literacy bei mehrsprachig aufwachsenden Kindern (3,5–6,5 J.)
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          SELDAK ist ein alltagsintegriertes Beobachtungsverfahren für Kinder mit nicht-deutscher Erstsprache.
          Bewertung: <strong style={{ color: 'var(--color-text)' }}>✓ Ja</strong> (2 Pkt.) · <strong style={{ color: 'var(--color-text)' }}>~ Teilweise</strong> (1 Pkt.) · <strong style={{ color: 'var(--color-text)' }}>○ Nein</strong> (0 Pkt.)
        </p>
      </div>

      {/* Kind auswählen */}
      <div className="flex flex-wrap gap-2">
        {KINDER.map(k => (
          <button key={k.id} onClick={() => setSelectedKind(k.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${selectedKind === k.id ? 'bg-purple-600 text-white border-purple-600' : ''}`}
            style={selectedKind !== k.id ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' } : {}}>
            {k.name} · {k.muttersprache}
          </button>
        ))}
      </div>

      {/* Fortschritt */}
      <div className="rounded-xl border p-4 flex items-center gap-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{kind.name} · {kind.alter} J. · {kind.muttersprache}</span>
            <span className="font-bold text-purple-600">{gesamtPunkte} / {maxPunkte} Pkt. ({pct} %)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium shrink-0" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <Download className="w-3.5 h-3.5" /> PDF
        </button>
      </div>

      {/* Items nach Bereich */}
      <div className="space-y-2">
        {bereiche.map(bereich => {
          const bereichItems = ITEMS.filter(i => i.bereich === bereich);
          const isOpen = expandedBereich === bereich;
          const bereichPunkte = bereichItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0);
          const bereichMax = bereichItems.length * 2;
          return (
            <div key={bereich} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => setExpandedBereich(isOpen ? null : bereich)}
                className="w-full flex items-center justify-between p-4" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BEREICH_COLOR[bereich as SeldakItem['bereich']]}`}>{bereich}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{bereichItems.length} Items</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-600">{bereichPunkte}/{bereichMax}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </button>
              {isOpen && (
                <div className="divide-y" style={{ borderTop: '1px solid var(--color-border)', divideColor: 'var(--color-border)' }}>
                  {bereichItems.map(item => {
                    const sc = scores[item.id] ?? 0;
                    const { label, color } = scoreLabel(sc as 0|1|2);
                    return (
                      <div key={item.id} className="flex items-start gap-4 px-4 py-3" style={{ background: 'var(--color-bg)' }}>
                        <span className="text-xs font-bold text-purple-500 shrink-0 mt-0.5">{item.nr}</span>
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: 'var(--color-text)' }}>{item.beschreibung}</p>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.altersgruppe}</span>
                        </div>
                        <button onClick={() => toggle(item.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors min-w-[100px] text-center ${color}`}
                          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                          {label}
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
    </main>
  );
}
