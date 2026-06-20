"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function RulesPage() {
  const [tab, setTab] = useState<'timeline' | 'trivia'>('timeline');

  return (
    <main className="min-h-screen bg-grid flex items-start justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl bg-glass border border-ink/10 shadow-2xl backdrop-blur-xl p-10 space-y-8">

        {/* Back + Header */}
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80 transition mb-4">
            ← Zurück
          </Link>
          <h1 className="text-3xl font-display font-semibold text-ink">📖 Spielregeln</h1>
        </div>

        {/* Tab-Umschalter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('timeline')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border transition ${
              tab === 'timeline' ? 'bg-ink text-inkDark border-ink' : 'border-ink/20 text-ink/70 hover:border-ink/40'
            }`}
          >
            🕰️ Timeline
          </button>
          <button
            onClick={() => setTab('trivia')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border transition ${
              tab === 'trivia' ? 'bg-ink text-inkDark border-ink' : 'border-ink/20 text-ink/70 hover:border-ink/40'
            }`}
          >
            🎮 Trivia
          </button>
        </div>

        {/* ─── TIMELINE ─── */}
        {tab === 'timeline' && (
          <div className="space-y-6 text-sm leading-relaxed text-ink/80">

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ziel</h2>
              <p>
                Jede Gruppe baut ihre eigene Zeitreihe auf. Wer als Erste eine vorher festgelegte Anzahl
                Karten korrekt eingeordnet hat, gewinnt (Standard: <strong className="text-ink">10 Karten</strong>).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf pro Runde</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Die <strong className="text-ink">aktive Gruppe</strong> sieht eine neue Karte (Song, Zitat, Flagge, …) ohne Jahresangabe.</li>
                <li>Die Gruppe wählt eine Position in ihrer persönlichen Zeitreihe, links oder rechts von bereits liegenden Karten.</li>
                <li>Der Host deckt das Jahr auf und bewertet: richtig oder falsch.</li>
                <li>
                  <strong className="text-ink">Richtig:</strong> Karte bleibt in der Zeitreihe — die Gruppe rückt der Siegbedingung näher.<br />
                  <strong className="text-ink">Falsch:</strong> Karte verlässt die Zeitreihe (außer ein Flex-Tipp war erfolgreich — siehe unten).
                </li>
                <li>Danach ist die nächste Gruppe dran.</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">⚡ Flex-Buttons & Flex-Tipps</h2>
              <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-3">
                <p><strong className="text-ink">Flex-Button verdienen:</strong> Wer eine Karte korrekt einordnet <em>und</em> zusätzlich Titel, Interpret, Zitatgeber o.Ä. richtig nennt, bekommt einen <strong className="text-ink">Flex-Button</strong> vom Host gutgeschrieben.</p>
                <p><strong className="text-ink">Flex-Tipp abgeben:</strong> Sobald die aktive Gruppe ihre Position gewählt hat (aber bevor der Host auswertet), können alle anderen Gruppen einen ihrer Flex-Buttons einsetzen und eine alternative Position tippen.</p>
                <p><strong className="text-ink">First-come-first-served:</strong> Jede Position kann nur einmal getippt werden. Wer zuerst tippt, sichert sich die Position.</p>
                <p><strong className="text-ink">Auswertung:</strong> Liegt die aktive Gruppe falsch, aber ein Flex-Tipp trifft die korrekte Position → diese Gruppe bekommt die Karte. Der eingesetzte Flex-Button ist in jedem Fall verbraucht.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Kategorien</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">Musik</strong> – Song hören, Interpret &amp; Titel nennen</li>
                <li><strong className="text-ink">Zitat</strong> – Zitat einer Person oder aus einem Werk zuordnen</li>
                <li><strong className="text-ink">Flagge</strong> – Land erkennen</li>
                <li><strong className="text-ink">Länderumriss</strong> – Land anhand der Form erkennen</li>
                <li><strong className="text-ink">Film &amp; Serien</strong> – Szene, Plakat oder Zitat zuordnen</li>
              </ul>
            </section>
          </div>
        )}

        {/* ─── TRIVIA ─── */}
        {tab === 'trivia' && (
          <div className="space-y-6 text-sm leading-relaxed text-ink/80">

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ziel</h2>
              <p>
                Es gibt zwei Gewinnmodi, die beim Erstellen des Spiels gewählt werden:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">Kategorien-Modus:</strong> Sammle aus jeder verfügbaren Kategorie mindestens eine richtige Antwort. Wer zuerst alle Kategorien abgehakt hat, gewinnt.</li>
                <li><strong className="text-ink">Punkte-Modus:</strong> Meiste Punkte wenn das Deck aufgebraucht ist.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf pro Runde</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Jede Gruppe spielt reihum. Die aktive Gruppe sieht eine Frage aus der aktuellen Kategorie.</li>
                <li>Die Gruppe berät sich und gibt dem Host ihre Antwort.</li>
                <li>Der Host deckt die Lösung auf und bewertet: richtig oder falsch.</li>
                <li><strong className="text-ink">Richtig:</strong> +1 Punkt, Kategorie wird als gesammelt markiert (Kategorien-Modus).</li>
                <li><strong className="text-ink">Falsch:</strong> Kein Punkt. Die nächste Gruppe kommt dran.</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">🔢 Schätzfragen</h2>
              <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2">
                <p>Bei Schätzfragen antworten <strong className="text-ink">alle Gruppen gleichzeitig</strong> — nicht nur die aktive.</p>
                <p>Jede Gruppe gibt eine Zahl ein. Die Gruppe mit der <strong className="text-ink">nächstliegenden Schätzung</strong> gewinnt den Punkt und sammelt die Kategorie.</p>
                <p>Gleichstand ist möglich — der Punkt wird dann geteilt.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">🃏 Joker</h2>
              <p>Wenn Joker aktiviert sind, startet jede Gruppe mit vier einmalig einsetzbaren Jokern:</p>
              <div className="space-y-3 mt-2">
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">🔄 Neue Frage</p>
                  <p>Die aktuelle Frage wird übersprungen und durch eine neue ersetzt. Kein Punkt, kein Verlust.</p>
                </div>
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">➡️ NEXT</p>
                  <p>Die Frage wird an die nächste Gruppe weitergegeben. Beantwortet diese sie <strong className="text-ink">falsch</strong>, bekommt die ursprüngliche Gruppe den Punkt. Beantwortet sie sie <strong className="text-ink">richtig</strong>, bekommt niemand einen Punkt.</p>
                </div>
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">🎲 Würfel</p>
                  <p>Die Gruppe würfelt (1–6):</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-ink/70">
                    <li><strong className="text-ink">5 oder 6 — Jackpot:</strong> +1 Punkt &amp; aktuelle Kategorie gesammelt</li>
                    <li><strong className="text-ink">1 — Pech:</strong> −1 Punkt &amp; eine gesammelte Kategorie verloren</li>
                    <li><strong className="text-ink">2–4:</strong> Kein Effekt</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">� STEAL</p>
                  <p>Kann von jeder Gruppe genutzt werden, die <strong className="text-ink">nicht</strong> an der Reihe ist. Die Frage der aktiven Gruppe wird geklaut (first come, first served).</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-ink/70">
                    <li><strong className="text-ink">Richtig:</strong> Stealer bekommt Punkt + Kategorie</li>
                    <li><strong className="text-ink">Falsch:</strong> Gestohlene Gruppe bekommt Punkt + Kategorie</li>
                  </ul>
                  <p className="text-ink/70 mt-1">Die gestohlene Gruppe erhält danach immer eine neue Ersatzfrage.</p>
                </div>
              </div>
              <p className="text-ink/60 text-xs mt-1">Hinweis: Joker können nicht bei Schätzfragen eingesetzt werden. Wer eine Schätzfrage gewinnt, erhält einen zufällig gewählten bereits verbrauchten Joker zurück.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">🚫 Ban-Phase (optional)</h2>
              <p>Wenn beim Erstellen des Spiels aktiviert, darf jede Gruppe vor Spielbeginn reihum eine Kategorie sperren. Gesperrte Kategorien kommen im Spiel nicht vor. <strong className="text-ink">Schätzfragen können nicht gebannt werden</strong> — sie sind Pflichtbestandteil des Spiels.</p>
              <p>Jede Gruppe hat <strong className="text-ink">20 Sekunden</strong> Zeit — wer nicht reagiert, überspringt automatisch.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">🏁 Spielende &amp; Gleichstand</h2>
              <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2">
                <p><strong className="text-ink">Kategorien-Modus:</strong> Sobald eine Gruppe alle Kategorien gesammelt hat, dürfen alle anderen Gruppen noch ihren letzten Zug in der aktuellen Kategorie-Runde spielen. Danach endet das Spiel.</p>
                <p><strong className="text-ink">Gleichstand Kategorien:</strong> Mehrere Gruppen beenden gleichzeitig → Punkte entscheiden. Immer noch Gleichstand → Schätzfragen-Stechen zwischen den punktgleichen Gruppen.</p>
                <p><strong className="text-ink">Punkte-Modus:</strong> Spiel endet wenn das Deck leer ist. Meiste Punkte gewinnt.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Kategorien</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li>Musik, Film &amp; Serien, Geografie, Sport &amp; Freizeit</li>
                <li>Natur &amp; Technik, Essen &amp; Trinken, Gaming &amp; Esports</li>
                <li>Religion &amp; Glaube, Berühmte Zitate, GZSZ</li>
                <li>Schätzfragen (alle Gruppen gleichzeitig)</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}