"use client";

import Link from 'next/link';

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-grid flex items-start justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl bg-glass border border-ink/10 shadow-2xl backdrop-blur-xl p-10 space-y-10">
        {/* Back + Header */}
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80 transition mb-4"
          >
            ← Zurück
          </Link>
          <h1 className="text-3xl font-display font-semibold text-ink">📖 Spielregeln</h1>
        </div>

        {/* Timeline */}
        <section className="space-y-5">
          <h2 className="text-xl font-display font-semibold text-ink">🕰️ Timeline Multiplayer</h2>
          <div className="space-y-3 text-ink/80 text-sm leading-relaxed">
            <p><strong className="text-ink">Ziel:</strong> Ordne Karten (Songs, Ereignisse, Fakten) korrekt in einer Zeitachse an. Wer als Erstes <strong className="text-ink">7 Karten</strong> richtig platziert hat, gewinnt.</p>
            <p><strong className="text-ink">Ablauf:</strong> Die aktive Gruppe bekommt eine Karte gezeigt und muss sie an der richtigen Stelle in ihrer persönlichen Zeitreihe einordnen. Liegt die Karte falsch, kommt sie aus dem Spiel und die nächste Gruppe ist dran.</p>
            <p><strong className="text-ink">Kategorien:</strong> Songs, Schätzfragen, Geografie, Filme &amp; Serien u.v.m. wechseln zufällig ab – jede Runde eine Überraschung.</p>

            <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2 mt-2">
              <p className="font-semibold text-ink">⚡ Flex-Tipps <span className="font-normal text-ink/60">(für nicht aktive Gruppen)</span></p>
              <ul className="list-disc list-inside space-y-1 text-ink/70">
                <li>Während die aktive Gruppe überlegt, können alle anderen Gruppen einen <strong className="text-ink">Flex-Tipp</strong> abgeben.</li>
                <li>Ein Flex-Tipp bedeutet: Du tippst, an welcher Position in der Zeitachse der <strong className="text-ink">aktiven Gruppe</strong> die Karte eingeordnet wird.</li>
                <li>Liegt dein Flex-Tipp richtig, bekommst du die Karte gutgeschrieben – auch wenn die aktive Gruppe falsch lag.</li>
                <li>Flex-Tipps können nur abgegeben werden, <strong className="text-ink">bevor</strong> der Host die Auswertung startet.</li>
                <li>Die eigene Platzierung der aktiven Gruppe kann nicht als Flex-Tipp gewählt werden.</li>
              </ul>
            </div>

            <p><strong className="text-ink">Punkte / Kategorien:</strong> Oben in der Übersicht siehst du, welche Kategorien du bereits abgedeckt hast. Es gibt keine Kategoriepflicht – die Reihenfolge ist vollständig zufällig.</p>
          </div>
        </section>

        <hr className="border-ink/10" />

        {/* Trivia */}
        <section className="space-y-5">
          <h2 className="text-xl font-display font-semibold text-ink">🎮 Trivia Multiplayer</h2>
          <div className="space-y-3 text-ink/80 text-sm leading-relaxed">
            <p><strong className="text-ink">Ziel:</strong> Beantworte Wissensfragen aus verschiedenen Kategorien. Die Gruppe mit den meisten richtigen Antworten am Ende gewinnt.</p>
            <p><strong className="text-ink">Ablauf:</strong> Jede Gruppe ist reihum an der Reihe. Die aktive Gruppe sieht die Frage und wählt eine Antwort aus vier Optionen (Multiple Choice). Der Host deckt anschließend die Lösung auf.</p>
            <p><strong className="text-ink">Kategorien:</strong> Sport, Musik, Geografie, Film &amp; Serien, Schätzfragen, Zitate, Religion, Natur &amp; Technik und mehr.</p>

            <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2 mt-2">
              <p className="font-semibold text-ink">⚡ Flex-Tipps <span className="font-normal text-ink/60">(für nicht aktive Gruppen)</span></p>
              <ul className="list-disc list-inside space-y-1 text-ink/70">
                <li>Auch im Trivia-Modus können nicht aktive Gruppen einen <strong className="text-ink">Flex-Tipp</strong> abgeben.</li>
                <li>Du tippst, welche Antwort die aktive Gruppe wählen wird.</li>
                <li>Liegt dein Tipp richtig (d.h. die aktive Gruppe antwortet korrekt und du hast dasselbe gewählt), bekommst du ebenfalls einen Punkt.</li>
                <li>Flex-Tipps müssen vor der Auswertung durch den Host abgegeben werden.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-2 mt-2">
              <p className="font-semibold text-ink">🏆 Schätzfragen</p>
              <ul className="list-disc list-inside space-y-1 text-ink/70">
                <li>Bei Schätzfragen gibt jede Gruppe eine freie Zahl ein.</li>
                <li>Gewonnen hat die Gruppe, deren Schätzung <strong className="text-ink">am nächsten an der richtigen Antwort</strong> liegt.</li>
                <li>Die Einheit ist immer in der Frage angegeben – bitte genau lesen!</li>
              </ul>
            </div>

            <p><strong className="text-ink">Spielende:</strong> Das Spiel endet, wenn alle Fragen gespielt wurden oder der Host das Spiel beendet. Sieger ist die Gruppe mit den meisten Punkten.</p>
          </div>
        </section>
      </div>
    </main>
  );
}