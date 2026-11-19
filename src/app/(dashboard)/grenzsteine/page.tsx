'use client';

import { useState } from 'react';
import { Milestone, CheckCircle2, Circle, Info, Download, AlertTriangle } from 'lucide-react';

/** Grenzsteine der Entwicklung — Saarbrücker Grenzsteine
 *  Beobachtungsverfahren: Altersstufen 3, 4, 5, 6 Jahre
 *  Bereiche: Motorik, Wahrnehmung, Sprache, Kognition, Sozialverhalten
 *  Bewertung: Vorhanden / Nicht vorhanden (binär)
 *  Bei Nicht-Vorhandensein: → Frühförderstelle empfohlen
 */

interface Grenzstein {
  id: string;
  alter: 3 | 4 | 5 | 6;
  bereich: 'Motorik' | 'Wahrnehmung' | 'Sprache' | 'Kognition' | 'Sozialverhalten';
  beschreibung: string;
  hinweis?: string;
}

const STEINE: Grenzstein[] = [
  // Alter 3
  { id: '3m1', alter: 3, bereich: 'Motorik', beschreibung: 'Hüpft auf einem Bein (mind. 3× hintereinander)', hinweis: 'Gleichgewicht und Körperstabilität' },
  { id: '3m2', alter: 3, bereich: 'Motorik', beschreibung: 'Malt einen Kreis nach (erkennbar rund)', hinweis: 'Feinmotorische Koordination' },
  { id: '3w1', alter: 3, bereich: 'Wahrnehmung', beschreibung: 'Sortiert Objekte nach Farbe und Form korrekt' },
  { id: '3w2', alter: 3, bereich: 'Wahrnehmung', beschreibung: 'Erkennt sich selbst im Spiegel und auf Fotos' },
  { id: '3s1', alter: 3, bereich: 'Sprache', beschreibung: 'Spricht in 3–4 Wort-Sätzen verständlich', hinweis: 'Kernaspekt der Sprachentwicklung' },
  { id: '3s2', alter: 3, bereich: 'Sprache', beschreibung: 'Kennt und verwendet den eigenen Vornamen' },
  { id: '3k1', alter: 3, bereich: 'Kognition', beschreibung: 'Versteht einfache Wenn-Dann-Zusammenhänge' },
  { id: '3so1', alter: 3, bereich: 'Sozialverhalten', beschreibung: 'Spielt für kurze Zeit (10 Min.) allein' },

  // Alter 4
  { id: '4m1', alter: 4, bereich: 'Motorik', beschreibung: 'Fährt Dreirad oder Laufrad sicher und zielgerichtet' },
  { id: '4m2', alter: 4, bereich: 'Motorik', beschreibung: 'Zeichnet einen erkennbaren Menschen (Kopffüßler)' },
  { id: '4w1', alter: 4, bereich: 'Wahrnehmung', beschreibung: 'Unterscheidet links/rechts am eigenen Körper korrekt' },
  { id: '4s1', alter: 4, bereich: 'Sprache', beschreibung: 'Erzählt kurze Ereignisse in verständlicher Reihenfolge' },
  { id: '4s2', alter: 4, bereich: 'Sprache', beschreibung: 'Stellt Warum-Fragen und versteht einfache Erklärungen' },
  { id: '4k1', alter: 4, bereich: 'Kognition', beschreibung: 'Zählt sicher bis 5 und versteht Mengen bis 3' },
  { id: '4k2', alter: 4, bereich: 'Kognition', beschreibung: 'Unterscheidet Vergangenheit und Zukunft (gestern/morgen)' },
  { id: '4so1', alter: 4, bereich: 'Sozialverhalten', beschreibung: 'Spielt kooperativ mit anderen (gemeinsame Spielidee)' },

  // Alter 5
  { id: '5m1', alter: 5, bereich: 'Motorik', beschreibung: 'Hüpft auf einem Bein durch eine Hindernislinie' },
  { id: '5m2', alter: 5, bereich: 'Motorik', beschreibung: 'Schneidet mit der Schere einer Linie entlang (±0,5 cm)' },
  { id: '5w1', alter: 5, bereich: 'Wahrnehmung', beschreibung: 'Erkennt Spiegelbilder und gespiegelte Buchstaben als gleich' },
  { id: '5s1', alter: 5, bereich: 'Sprache', beschreibung: 'Bildet Sätze mit Nebensätzen (weil, dass, wenn)', hinweis: 'Wichtiger Indikator für Schulreife' },
  { id: '5s2', alter: 5, bereich: 'Sprache', beschreibung: 'Kennt Anlaute von Wörtern und reimt spielerisch' },
  { id: '5k1', alter: 5, bereich: 'Kognition', beschreibung: 'Zählt sicher bis 10 und versteht Mehr/Weniger bis 5' },
  { id: '5so1', alter: 5, bereich: 'Sozialverhalten', beschreibung: 'Hält Spielregeln ein und akzeptiert Verlieren' },

  // Alter 6
  { id: '6m1', alter: 6, bereich: 'Motorik', beschreibung: 'Schreibt den eigenen Namen leserlich nach' },
  { id: '6m2', alter: 6, bereich: 'Motorik', beschreibung: 'Fährt Fahrrad (ohne Stützräder) oder zeigt gleichwertige Grobmotorik' },
  { id: '6s1', alter: 6, bereich: 'Sprache', beschreibung: 'Erzählt strukturiert mit Anfang, Mitte und Ende', hinweis: 'Schulreifeindikator' },
  { id: '6s2', alter: 6, bereich: 'Sprache', beschreibung: 'Spricht alle Laute korrekt aus (außer evtl. R)' },
  { id: '6k1', alter: 6, bereich: 'Kognition', beschreibung: 'Zählt bis 20 und addiert/subtrahiert im Zahlenraum bis 5' },
  { id: '6k2', alter: 6, bereich: 'Kognition', beschreibung: 'Erkennt einfache Buchstaben und Zahlen (Vorläuferfähigkeit)' },
  { id: '6so1', alter: 6, bereich: 'Sozialverhalten', beschreibung: 'Hält Konzentration bei Gruppenaufgaben ≥10 Minuten' },
];

const KINDER = [
  { id: '1', name: 'Yasmin A.',  alter: 5, gruppe: 'Sternschnuppen' },
  { id: '2', name: 'Paul M.',    alter: 4, gruppe: 'Sonnenkinder' },
  { id: '3', name: 'Mia L.',     alter: 6, gruppe: 'Regenbogen' },
];

const BEREICH_COLOR: Record<Grenzstein['bereich'], string> = {
  Motorik:       'bg-blue-100 text-blue-800',
  Wahrnehmung:   'bg-purple-100 text-purple-800',
  Sprache:       'bg-teal-100 text-teal-800',
  Kognition:     'bg-amber-100 text-amber-800',
  Sozialverhalten:'bg-green-100 text-green-800',
};

const ALTER_COLOR: Record<number, string> = {
  3: 'bg-yellow-50 border-yellow-200',
  4: 'bg-blue-50 border-blue-200',
  5: 'bg-purple-50 border-purple-200',
  6: 'bg-green-50 border-green-200',
};

export default function GrenzsteinePage() {
  const [selectedKind, setSelectedKind] = useState(KINDER[0].id);
  const [erreicht, setErreicht] = useState<Record<string, boolean>>({});
  const [selectedAlter, setSelectedAlter] = useState<3|4|5|6|'alle'>('alle');

  const toggle = (id: string) => setErreicht(p => ({ ...p, [id]: !p[id] }));

  const kind = KINDER.find(k => k.id === selectedKind)!;
  const visibleSteine = selectedAlter === 'alle' ? STEINE : STEINE.filter(s => s.alter === selectedAlter);
  const alterGruppen = [3, 4, 5, 6] as const;

  const gesamtErreicht = STEINE.filter(s => erreicht[s.id]).length;
  const gesamtTotal = STEINE.length;
  const pct = Math.round((gesamtErreicht / gesamtTotal) * 100);

  // Warnungen: Nicht-erreichte Steine im Alter des Kindes
  const kindAlter = kind.alter;
  const fehlend = STEINE.filter(s => s.alter <= kindAlter && !erreicht[s.id]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
          <Milestone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Grenzsteine der Entwicklung</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Saarbrücker Grenzsteine · Altersgruppen 3–6 Jahre · 5 Entwicklungsbereiche
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Grenzsteine sind Mindestanforderungen der Entwicklung. Ein nicht erreichter Stein im entsprechenden Alter ist ein Hinweis auf möglichen Förderbedarf — keine Diagnose. Bei mehreren fehlenden Steinen: Rücksprache mit Frühförderstelle empfohlen.
        </p>
      </div>

      {/* Kind auswählen */}
      <div className="flex flex-wrap gap-2">
        {KINDER.map(k => (
          <button key={k.id} onClick={() => setSelectedKind(k.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${selectedKind === k.id ? 'bg-emerald-600 text-white border-emerald-600' : ''}`}
            style={selectedKind !== k.id ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' } : {}}>
            {k.name} · {k.alter} J. · {k.gruppe}
          </button>
        ))}
      </div>

      {/* Warnung: fehlende Steine */}
      {fehlend.length > 0 && (
        <div className="rounded-xl border-l-4 border-amber-500 p-4 flex gap-3" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {fehlend.length} Grenzstein{fehlend.length !== 1 ? 'e' : ''} im Altersbereich von {kind.name} noch nicht markiert
            </p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Bitte dokumentieren und bei Bedarf Elterngespräch führen.
            </p>
          </div>
        </div>
      )}

      {/* Fortschritt */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>Gesamt: {gesamtErreicht} / {gesamtTotal} Grenzsteine erreicht</span>
          <span className="font-bold text-emerald-600">{pct} %</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {alterGruppen.map(a => {
            const aSteine = STEINE.filter(s => s.alter === a);
            const aOk = aSteine.filter(s => erreicht[s.id]).length;
            return (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full border font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                {a}J: {aOk}/{aSteine.length}
              </span>
            );
          })}
        </div>
        <div className="flex justify-end mt-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <Download className="w-3.5 h-3.5" /> PDF Export
          </button>
        </div>
      </div>

      {/* Filter nach Alter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 3, 4, 5, 6] as const).map(a => (
          <button key={a} onClick={() => setSelectedAlter(a)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${selectedAlter === a ? 'bg-emerald-600 text-white border-emerald-600' : ''}`}
            style={selectedAlter !== a ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' } : {}}>
            {a === 'alle' ? 'Alle Altersgruppen' : `${a} Jahre`}
          </button>
        ))}
      </div>

      {/* Grenzsteine nach Alter gruppiert */}
      <div className="space-y-4">
        {(selectedAlter === 'alle' ? alterGruppen : [selectedAlter as 3|4|5|6]).map(alter => {
          const steine = STEINE.filter(s => s.alter === alter);
          if (!steine.length) return null;
          const ok = steine.filter(s => erreicht[s.id]).length;
          return (
            <div key={alter} className={`rounded-xl border-2 overflow-hidden ${ALTER_COLOR[alter]}`}>
              <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Altersgruppe: {alter} Jahre</span>
                  {alter <= kindAlter && ok < steine.length && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                      {steine.length - ok} ausstehend
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-emerald-600">{ok}/{steine.length}</span>
              </div>
              <div className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                {steine.map(stein => {
                  const ok = erreicht[stein.id] ?? false;
                  return (
                    <div key={stein.id} className="flex items-start gap-3 px-4 py-3" style={{ background: 'var(--color-bg)' }}>
                      <button onClick={() => toggle(stein.id)} className="shrink-0 mt-0.5">
                        {ok
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <Circle className="w-5 h-5 text-gray-300" />
                        }
                      </button>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: 'var(--color-text)', textDecoration: ok ? 'line-through' : 'none', opacity: ok ? 0.6 : 1 }}>
                          {stein.beschreibung}
                        </p>
                        {stein.hinweis && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>💡 {stein.hinweis}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${BEREICH_COLOR[stein.bereich as Grenzstein['bereich']]}`}>
                        {stein.bereich}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
