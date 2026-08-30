"use client";

import Link from 'next/link';
import { useState } from 'react';

type RuleTab = 'timeline' | 'trivia' | 'familienduell' | 'partnerkann' | 'tabu' | 'begriffetopf';

const TABS: { key: RuleTab; icon: string; label: string }[] = [
  { key: 'timeline', icon: '🕰️', label: 'Timeline' },
  { key: 'trivia', icon: '🎮', label: 'Trivia' },
  { key: 'familienduell', icon: '🎉', label: 'Familienduell' },
  { key: 'partnerkann', icon: '🤩', label: 'Partner kann' },
  { key: 'tabu', icon: '🙊', label: 'Tabu' },
  { key: 'begriffetopf', icon: '🫙', label: 'Begriffe-Topf' },
];

export default function RulesPage() {
  const [tab, setTab] = useState<RuleTab>('timeline');

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
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-xl px-2 py-3 text-xs sm:text-sm font-semibold border transition text-center leading-tight ${
                tab === t.key ? 'bg-ink text-inkDark border-ink' : 'border-ink/20 text-ink/70 hover:border-ink/40'
              }`}
            >
              <span className="block text-base mb-0.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
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
                <p><strong className="text-ink">Flex-Button verdienen:</strong> Wer eine Karte korrekt einordnet <em>und</em> zusätzlich Titel, Interpret, Zitatgeber o.Ä. richtig nennt, bekommt einen <strong className="text-ink">Flex-Button</strong> vom Spielleiter gutgeschrieben.</p>
                <p><strong className="text-ink">Flex-Tipp abgeben:</strong> Sobald die aktive Gruppe ihre Position gewählt hat (aber bevor der Spielleiter auswertet), können alle anderen Gruppen einen ihrer Flex-Buttons einsetzen und eine alternative Position tippen.</p>
                <p><strong className="text-ink">First-come-first-served:</strong> Jede Position kann nur einmal getippt werden. Wer zuerst tippt, sichert sich die Position.</p>
                <p><strong className="text-ink">Zeitfenster:</strong> Für Flex-Tipps läuft ein <strong className="text-ink">25-Sekunden-Timer</strong>. Läuft er ab, wertet die App automatisch aus.</p>
                <p><strong className="text-ink">Auswertung:</strong> Liegt die aktive Gruppe falsch, aber ein Flex-Tipp trifft die korrekte Position → diese Gruppe bekommt die Karte. Der eingesetzte Flex-Button ist in jedem Fall verbraucht.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Kategorien</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">Musik</strong> – Song hören, Interpret &amp; Titel nennen</li>
                <li><strong className="text-ink">Berühmte Zitate</strong> – Zitat einer Person oder aus einem Werk zuordnen</li>
                <li><strong className="text-ink">Bilder erkennen</strong> – Was oder wer ist auf dem Bild zu sehen?</li>
                <li><strong className="text-ink">Flaggen erkennen</strong> – Land anhand seiner Flagge erkennen</li>
                <li><strong className="text-ink">Länder am Umriss</strong> – Land anhand der Form erkennen</li>
                <li><strong className="text-ink">Filme &amp; Serien</strong> – Szene, Plakat oder Zitat zuordnen</li>
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
              <h2 className="text-lg font-display font-semibold text-ink">👑 Mit oder ohne Spielleitung</h2>
              <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2">
                <p><strong className="text-ink">Mit Spielleitung:</strong> Ein Gerät/eine Person leitet das Spiel, bewertet Antworten und steuert das Tempo (siehe Ablauf unten).</p>
                <p><strong className="text-ink">Ohne Spielleitung:</strong> Die antwortende Gruppe tippt ihre Antwort direkt ein, alle anderen Gruppen stimmen ab — ab <strong className="text-ink">50 % Zustimmung</strong> gilt die Antwort als richtig. Timeline-Runden laufen in diesem Modus automatisch weiter. Schätzfragen funktionieren wie gewohnt.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf pro Runde</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Jede Gruppe spielt reihum. Die aktive Gruppe sieht eine Frage aus der aktuellen Kategorie.</li>
                <li>Mit Spielleitung: Die Gruppe berät sich und gibt dem Spielleiter ihre Antwort. Ohne Spielleitung: Die Gruppe tippt ihre Antwort ein, die anderen stimmen ab.</li>
                <li>Die Lösung wird aufgedeckt und bewertet: richtig oder falsch.</li>
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
                  <p className="font-semibold text-ink">🥷 STEAL</p>
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
              <p>Wenn beim Erstellen des Spiels aktiviert, darf jede Gruppe vor Spielbeginn reihum eine Kategorie sperren. Gesperrte Kategorien kommen im Spiel nicht vor.</p>
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
                <li>Musik, Berühmte Zitate, Bilder erkennen, Flaggen erkennen, Länder am Umriss</li>
                <li>Filme &amp; Serien, Sport &amp; Freizeit, Fußball, Natur &amp; Technik</li>
                <li>Essen &amp; Trinken, Gaming &amp; eSports, Religion &amp; Glaube</li>
                <li>Geographie &amp; Geschichte, GZSZ</li>
                <li>Schätzfragen (alle Gruppen gleichzeitig)</li>
              </ul>
            </section>
          </div>
        )}

        {/* ─── FAMILIENDUELL ─── */}
        {tab === 'familienduell' && (
          <div className="space-y-6 text-sm leading-relaxed text-ink/80">

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ziel</h2>
              <p>
                Angelehnt an die klassische Fernsehshow: Umfragefragen mit den <strong className="text-ink">Top-5-Antworten</strong> von
                „100 befragten Personen" erraten. Wer am Ende die meisten Punkte hat, gewinnt. Optional wird
                bis zu einem Punktelimit gespielt (Standard: <strong className="text-ink">500 Punkte</strong>).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf pro Frage</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Der Spielleiter liest die Frage vor („Wir haben 100 Leute befragt…") und sieht dabei die Top-5-Antworten mit ihren Punktwerten.</li>
                <li>Die aktive Gruppe nennt Antworten. Für jede genannte Top-5-Antwort hakt der Spielleiter sie per Klick ab — die Punkte gehen sofort an die Gruppe.</li>
                <li>Für jede falsche Nennung gibt es einen <strong className="text-ink">Fehlversuch</strong> (Buzzer).</li>
                <li>Nach <strong className="text-ink">3 Fehlversuchen</strong> ist die Runde für die aktive Gruppe vorbei — es kommt zur Klau-Chance (siehe unten).</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">🕵️ Klau-Chance</h2>
              <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2">
                <p>Nach dem dritten Fehlversuch darf die <strong className="text-ink">nächste Gruppe</strong> einen einzigen Tipp abgeben.</p>
                <p><strong className="text-ink">Treffer:</strong> Nennt sie eine der noch nicht aufgedeckten Top-5-Antworten, klaut sie alle bisher in dieser Runde gesammelten Punkte.</p>
                <p><strong className="text-ink">Fehlversuch:</strong> Liegt sie daneben, bleiben die Punkte bei der ursprünglichen Gruppe.</p>
                <p>Danach ist die nächste Gruppe mit einer neuen Frage dran.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Rahmen</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">2–6 Gruppen</strong>, alle spielen an einem Gerät (Spielleiter-Handy).</li>
                <li>Punktelimit ein- oder ausschaltbar; ohne Limit wird manuell beendet.</li>
                <li>Ein Rückgängig-Button macht die letzte Eingabe des Spielleiters bei Bedarf rückgängig.</li>
              </ul>
            </section>
          </div>
        )}

        {/* ─── PARTNER KANN ─── */}
        {tab === 'partnerkann' && (
          <div className="space-y-6 text-sm leading-relaxed text-ink/80">

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ziel</h2>
              <p>
                Angelehnt an die SAT.1-Show „Mein Mann kann": Paare bieten darauf, wie gut ihr Partner
                oder ihre Partnerin eine messbare Aufgabe erfüllen wird — wie bei einer Auktion. Wer am
                Ende die meisten Punkte hat, gewinnt.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf pro Runde</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Eine zufällige, messbare Aufgabe wird gezogen und laut vorgelesen (z. B. „Wie viele Wäscheklammern kann er/sie in 60 Sekunden anlegen?").</li>
                <li>Alle <strong className="text-ink">nicht antretenden</strong> Paare bieten reihum eine Zahl — „Mein Partner kann mindestens 15…". Wer am höchsten bietet, bekommt den Zuschlag.</li>
                <li>Der antretende Partner bzw. die antretende Partnerin versucht, die gebotene Zahl zu erreichen oder zu übertreffen.</li>
                <li>
                  <strong className="text-ink">Geschafft:</strong> Die bietende Gruppe bekommt <strong className="text-ink">+1 Punkt</strong>.<br />
                  <strong className="text-ink">Nicht geschafft:</strong> Alle anderen Gruppen bekommen je <strong className="text-ink">+1 Punkt</strong>.
                </li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Rahmen</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">2–6 Paare/Gruppen</strong>, alle spielen an einem Gerät.</li>
                <li>Aufgaben lassen sich überspringen, falls eine nicht durchführbar ist.</li>
              </ul>
            </section>
          </div>
        )}

        {/* ─── TABU ─── */}
        {tab === 'tabu' && (
          <div className="space-y-6 text-sm leading-relaxed text-ink/80">

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ziel</h2>
              <p>
                Ein Spieler erklärt seinem Team einen Begriff, ohne dabei den Begriff selbst oder eines
                von <strong className="text-ink">4 Tabu-Wörtern</strong> zu benutzen. Das Team rät gegen die Zeit — für jeden
                richtig erratenen Begriff gibt es einen Punkt. Team mit den meisten Punkten gewinnt.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf pro Runde</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Ein Team ist dran, ein Spieler hält das Handy und liest still den Begriff samt Tabu-Wörtern.</li>
                <li>Auf „Runde starten" tippen: Der Timer läuft (Standard: <strong className="text-ink">60 Sekunden</strong>, einstellbar), der Spieler erklärt so viele Begriffe wie möglich, ohne die Tabu-Wörter zu sagen.</li>
                <li>
                  <strong className="text-ink">Erraten:</strong> „✓ Richtig" tippen (+1 Punkt).<br />
                  <strong className="text-ink">Kommt das Team nicht drauf:</strong> „Passen" — ohne Punkt, nächster Begriff.<br />
                  <strong className="text-ink">Rutscht ein Tabu-Wort raus:</strong> „Tabu!" — ohne Punkt, nächster Begriff.
                </li>
                <li>Wenn die Zeit abläuft, ist das nächste Team dran.</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Rahmen</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">2–6 Teams</strong>, alle spielen an einem Gerät.</li>
                <li>Rundenzeit einstellbar zwischen 30 und 120 Sekunden.</li>
              </ul>
            </section>
          </div>
        )}

        {/* ─── BEGRIFFE-TOPF ─── */}
        {tab === 'begriffetopf' && (
          <div className="space-y-6 text-sm leading-relaxed text-ink/80">

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ziel</h2>
              <p>
                Jede Gruppe reicht vorher eigene Begriffe ein. Danach wird in <strong className="text-ink">3 Runden</strong> geraten
                — mit steigendem Schwierigkeitsgrad. Gruppe mit den meisten erratenen Begriffen gewinnt.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Ablauf</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Jede Gruppe reicht vorab ihre eigenen Begriffe ein — entweder auf eigenen Handys (mehrere Geräte, per PIN/QR-Code) oder nacheinander auf einem einzigen Gerät.</li>
                <li>Reihum ist eine Gruppe dran: eine Person erklärt, der Rundentimer läuft (Standard: <strong className="text-ink">45 Sekunden</strong>, einstellbar).</li>
                <li>Erratene Begriffe werden abgehakt und geben der Gruppe je <strong className="text-ink">+1 Punkt</strong>. Nicht erratene Begriffe kommen zurück in den Topf.</li>
                <li>Ist der Topf für diese Runde leer, startet die nächste Runde mit neuer Regel (siehe unten).</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Die 3 Runden</h2>
              <div className="space-y-3 mt-2">
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">1️⃣ Erklären</p>
                  <p>Beliebig viele Wörter benutzen, um den Begriff zu erklären — nur der Begriff selbst darf nicht fallen.</p>
                </div>
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">2️⃣ Pantomime</p>
                  <p>Nur Gestik und Mimik — kein Wort, kein Laut.</p>
                </div>
                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-4 space-y-1">
                  <p className="font-semibold text-ink">3️⃣ Ein Wort</p>
                  <p>Nur ein einziges Wort darf zur Erklärung benutzt werden.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-ink">Rahmen</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-ink">2–10 Gruppen</strong>.</li>
                <li><strong className="text-ink">Mehrere Geräte:</strong> Über Firebase — Mitspieler treten per PIN oder QR-Code bei, jeder reicht seine Begriffe auf dem eigenen Handy ein.</li>
                <li><strong className="text-ink">Ein Gerät:</strong> Alles läuft auf einem Handy, das reihum weitergegeben wird.</li>
                <li>Rundenzeit einstellbar zwischen 20 und 90 Sekunden.</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
