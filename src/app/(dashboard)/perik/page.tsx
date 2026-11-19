'use client';

import { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, Info, Download, Smile } from 'lucide-react';

/** PERIK — Positive Entwicklung und Resilienz im Kindergartenalltag
 *  Beobachtungsverfahren für Kinder 4–6 Jahre
 *  6 Resilienzbereiche · Bewertung 1–4 (Skala)
 */

interface PerikItem {
  id: string;
  bereich: 'Exploration' | 'Initiative' | 'Gefühlswissen' | 'Empathie' | 'Konflikt' | 'Kontakt';
  nr: string;
  beschreibung: string;
}

const ITEMS: PerikItem[] = [
  // Exploration & Entdeckerfreude
  { id: 'ex1', bereich: 'Exploration', nr: 'EX1', beschreibung: 'Erforscht neugierig neue Materialien und Umgebungen' },
  { id: 'ex2', bereich: 'Exploration', nr: 'EX2', beschreibung: 'Probiert Dinge selbstständig aus, auch wenn es schwierig wird' },
  { id: 'ex3', bereich: 'Exploration', nr: 'EX3', beschreibung: 'Zeigt Freude und Begeisterung beim Entdecken' },

  // Initiative & Selbststeuerung
  { id: 'in1', bereich: 'Initiative', nr: 'IN1', beschreibung: 'Ergreift eigenständig Initiative bei Aktivitäten' },
  { id: 'in2', bereich: 'Initiative', nr: 'IN2', beschreibung: 'Kann eigene Impulse regulieren und abwarten' },
  { id: 'in3', bereich: 'Initiative', nr: 'IN3', beschreibung: 'Plant und führt einfache Vorhaben durch' },
  { id: 'in4', bereich: 'Initiative', nr: 'IN4', beschreibung: 'Hält bei Aufgaben konzentriert durch' },

  // Gefühlswissen & Stressregulierung
  { id: 'gw1', bereich: 'Gefühlswissen', nr: 'GW1', beschreibung: 'Erkennt und benennt eigene Gefühle' },
  { id: 'gw2', bereich: 'Gefühlswissen', nr: 'GW2', beschreibung: 'Kann Gefühle anderer (aus Mimik/Situation) erkennen' },
  { id: 'gw3', bereich: 'Gefühlswissen', nr: 'GW3', beschreibung: 'Beruhigt sich nach Aufregung selbstständig wieder' },

  // Empathie & soziale Handlungskompetenz
  { id: 'em1', bereich: 'Empathie', nr: 'EM1', beschreibung: 'Tröstet andere Kinder und hilft ihnen spontan' },
  { id: 'em2', bereich: 'Empathie', nr: 'EM2', beschreibung: 'Teilt Materialien und wartet auf seine/ihre Reihenfolge' },
  { id: 'em3', bereich: 'Empathie', nr: 'EM3', beschreibung: 'Zeigt Verständnis für die Perspektive anderer' },

  // Konfliktmanagement
  { id: 'ko1', bereich: 'Konflikt', nr: 'KO1', beschreibung: 'Spricht Konflikte an, anstatt zuzuschlagen oder wegzulaufen' },
  { id: 'ko2', bereich: 'Konflikt', nr: 'KO2', beschreibung: 'Sucht gemeinsam mit anderen nach Lösungen' },
  { id: 'ko3', bereich: 'Konflikt', nr: 'KO3', beschreibung: 'Akzeptiert Kompromisse und Regeln auch wenn unvorteilhaft' },

  // Kontaktfähigkeit
  { id: 'kt1', bereich: 'Kontakt', nr: 'KT1', beschreibung: 'Nimmt aktiv Kontakt zu anderen Kindern auf' },
  { id: 'kt2', bereich: 'Kontakt', nr: 'KT2', beschreibung: 'Wird von anderen Kindern als Spielpartner gewählt' },
  { id: 'kt3', bereich: 'Kontakt', nr: 'KT3', beschreibung: 'Kann sowohl führen als auch sich einordnen in der Gruppe' },
];

const KINDER = [
  { id: '1', name: 'Emre T.',    alter: '5;3', gruppe: 'Sternschnuppen' },
  { id: '2', name: 'Hanna V.',   alter: '4;11', gruppe: 'Sonnenkinder' },
  { id: '3', name: 'Lukas B.',   alter: '5;7', gruppe: 'Regenbogen' },
];

const SCALE = ['trifft fast nie zu', 'trifft manchmal zu', 'trifft meistens zu', 'trifft fast immer zu'] as const;
const SCALE_COLOR = ['text-gray-400', 'text-orange-500', 'text-blue-600', 'text-green-600'] as const;

const BEREICH_CONFIG: Record<PerikItem['bereich'], { color: string; label: string }> = {
  Exploration:   { color: 'bg-yellow-100 text-yellow-800',  label: 'Exploration & Entdeckerfreude' },
  Initiative:    { color: 'bg-orange-100 text-orange-800',  label: 'Initiative & Selbststeuerung' },
  Gefühlswissen: { color: 'bg-pink-100 text-pink-800',      label: 'Gefühlswissen & Stressregulierung' },
  Empathie:      { color: 'bg-rose-100 text-rose-800',      label: 'Empathie & soziale Handlungskompetenz' },
  Konflikt:      { color: 'bg-red-100 text-red-800',        label: 'Konfliktmanagement' },
  Kontakt:       { color: 'bg-green-100 text-green-800',    label: 'Kontaktfähigkeit' },
};

export default function PerikPage() {
  const [selectedKind, setSelectedKind] = useState(KINDER[0].id);
  const [scores, setScores] = useState<Record<string, 0|1|2|3>>({});
  const [expandedBereich, setExpandedBereich] = useState<string | null>('Exploration');

  const cycle = (id: string) => setScores(p => ({ ...p, [id]: (((p[id] ?? 0) + 1) % 4) as 0|1|2|3 }));

  const bereiche = Array.from(new Set(ITEMS.map(i => i.bereich)));
  const gesamtPunkte = ITEMS.reduce((s, i) => s + (scores[i.id] ?? 0), 0);
  const maxPunkte = ITEMS.length * 3;
  const pct = Math.round((gesamtPunkte / maxPunkte) * 100);
  const kind = KINDER.find(k => k.id === selectedKind)!;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>PERIK</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Positive Entwicklung und Resilienz im Kindergartenalltag (4–6 J.) · 6 Resilienzbereiche
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          PERIK misst Resilienz und Sozialkompetenzen. 4-stufige Likert-Skala:
          <strong style={{ color: 'var(--color-text)' }}> trifft fast nie zu</strong> (1) ·
          <strong style={{ color: 'var(--color-text)' }}> manchmal</strong> (2) ·
          <strong style={{ color: 'var(--color-text)' }}> meistens</strong> (3) ·
          <strong style={{ color: 'var(--color-text)' }}> fast immer</strong> (4)
        </p>
      </div>

      {/* Kind auswählen */}
      <div className="flex flex-wrap gap-2">
        {KINDER.map(k => (
          <button key={k.id} onClick={() => setSelectedKind(k.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${selectedKind === k.id ? 'bg-rose-600 text-white border-rose-600' : ''}`}
            style={selectedKind !== k.id ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' } : {}}>
            {k.name} · {k.alter} J.
          </button>
        ))}
      </div>

      {/* Fortschritt + Resilienz-Score */}
      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-rose-500" />
            <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{kind.name} · {kind.alter} J. · {kind.gruppe}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-rose-600">{gesamtPunkte} / {maxPunkte} Pkt.</span>
            <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>({pct} %)</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-rose-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 justify-between text-xs pt-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>Niedrige Resilienz</span>
          <span className={pct >= 70 ? 'text-green-600 font-bold' : pct >= 40 ? 'text-amber-600 font-bold' : 'text-red-500 font-bold'}>
            {pct >= 70 ? '✓ Gut ausgeprägt' : pct >= 40 ? '~ Teilweise ausgeprägt' : '○ Förderbedarf'}
          </span>
          <span>Hohe Resilienz</span>
        </div>
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <Download className="w-3.5 h-3.5" /> PDF Export
          </button>
        </div>
      </div>

      {/* Bereiche */}
      <div className="space-y-2">
        {bereiche.map(bereich => {
          const cfg = BEREICH_CONFIG[bereich as PerikItem['bereich']];
          const bereichItems = ITEMS.filter(i => i.bereich === bereich);
          const isOpen = expandedBereich === bereich;
          const bp = bereichItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0);
          const bmax = bereichItems.length * 3;
          return (
            <div key={bereich} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => setExpandedBereich(isOpen ? null : bereich)}
                className="w-full flex items-center justify-between p-4" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-rose-600">{bp}/{bmax}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </button>
              {isOpen && (
                <div className="divide-y" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {bereichItems.map(item => {
                    const sc = scores[item.id] ?? 0;
                    return (
                      <div key={item.id} className="flex items-start gap-4 px-4 py-3" style={{ background: 'var(--color-bg)' }}>
                        <span className="text-xs font-bold text-rose-400 shrink-0 mt-0.5 w-10">{item.nr}</span>
                        <p className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{item.beschreibung}</p>
                        <button onClick={() => cycle(item.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors min-w-[130px] text-center ${SCALE_COLOR[sc]}`}
                          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                          {SCALE[sc]}
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
