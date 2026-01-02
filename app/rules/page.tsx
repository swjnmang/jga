"use client";

import { useState } from 'react';

export default function RulesPage() {
  const [mode, setMode] = useState<'zeitstrahl' | 'trivia'>('zeitstrahl');

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Spielregeln</p>
        <h1 className="text-3xl font-display">Flex Quiz: Spielmodi</h1>
        <p className="text-sm text-ink/70">
          Wähle zwischen zwei Varianten: Zeitstrahl (10 Karten zeitlich ordnen) oder Trivia-Quiz
          inspiriert von Trivial Pursuit.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode('zeitstrahl')}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              mode === 'zeitstrahl' ? 'border-ink bg-ink text-inkDark' : 'border-ink/20'
            }`}
          >
            Zeitstrahl
          </button>
          <button
            type="button"
            onClick={() => setMode('trivia')}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              mode === 'trivia' ? 'border-ink bg-ink text-inkDark' : 'border-ink/20'
            }`}
          >
            Trivia-Quiz
          </button>
        </div>
      </div>

      {mode === 'zeitstrahl' && (
        <section className="card-surface rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Timeline Spielregeln</h2>
            <p className="text-sm text-ink/70 mb-3"><strong>Ziel:</strong> 10 Karten in der korrekten zeitlichen Reihenfolge auslegen.</p>
            <p className="text-sm text-ink/70 mb-4">Das Spiel kann <strong>allein oder im Team</strong> gespielt werden.</p>
          </div>

          <ol className="space-y-3 text-sm text-ink/80">
            <li>
              <strong>1. Vorbereitung:</strong> Du benötigst <strong>leeres Papier und Stifte</strong>. Schneide dir das Papier in gleichgroße Karten, ungefähr auf die Größe eines Bierdeckels zu.
            </li>
            <li>
              <strong>2. App starten:</strong> Klicke auf <strong>„Spiel starten & Einstellungen vornehmen"</strong> und konfiguriere dir <strong>DEIN Flexquiz</strong>. Ohne Spotify-Premium können die Musikfragen leider nicht gespielt werden.
            </li>
            <li>
              <strong>3. Spiel starten:</strong> Speichere die Einstellungen und starte das Spiel.
            </li>
            <li>
              <strong>4. Referenzkarte:</strong> Jeder Spieler oder jedes Team beschriftet eine Karte mit <strong>„1950"</strong> und legt sie vor sich.
            </li>
            <li>
              <strong>5. Fragen beantworten und Karten einordnen:</strong> Dir werden nun Fragen aus deinen gewählten Kategorien in zufälliger Reihenfolge angezeigt. Die <strong>jüngste Person oder das jüngste Team</strong> beginnt und schreibt den <strong>Lösungsvorschlag</strong> (also <strong>Jahreszahl und Lösung</strong>) auf eine leere Karte. Lege diese Karte nun <strong>vor oder nach der Referenzkarte (1950)</strong>. Sobald du oder dein Team fertig seid, sagt ihr <strong>„ich/wir loggen ein"</strong>.
            </li>
            <li>
              <strong>6. Optional:</strong> Flex-Fenster für andere Teams (siehe Flex Buttons).
            </li>
            <li>
              <strong>7. Aufdecken/Lösung:</strong> Wenn die Karte <strong>chronologisch korrekt</strong> eingeordnet wurde, darfst du oder dein Team die Karte behalten. <strong>Die Jahreszahl muss nicht exakt genannt worden sein!</strong> Wenn das Jahr falsch eingeordnet wurde, kommt die Karte weg (Ausnahme: Gegner hat den Flex-Button eingesetzt).
            </li>
            <li>
              <strong>8. Flex-Button verdienen:</strong> Wenn du das Jahr <strong>korrekt eingeordnet</strong> hast und die <strong>Frage korrekt beantwortet</strong> konntest, erhältst du einen <strong>Flex-Button</strong>. (zum Beispiel: Du hattest das Lied „My heart will go on" von Celine Dion nach 1950 gelegt und Titel + Interpret korrekt benannt).
            </li>
            <li>
              <strong>9. Siegbedingung:</strong> Nächste Runde, bis <strong>jemand 10 korrekt liegende Karten</strong> hat.
            </li>
          </ol>

          <div className="pt-4 space-y-3">
            <h3 className="text-md font-semibold">Flex Buttons</h3>
            <ul className="space-y-2 text-sm text-ink/80">
              <li>
                <strong>Einsatz:</strong> Nachdem das aktive Team seinen Zug beendet hat, darf ein anderes Team einen <strong>Flex Button werfen</strong>.
              </li>
              <li>
                <strong>Treffer:</strong> Flex stimmt (<strong>Jahr + Titel/Interpret/Zitatgeber/Objekt</strong>) = das flexende Team <strong>nimmt die zuletzt gespielte Karte</strong>.
              </li>
              <li>
                <strong>Fehlversuch:</strong> Flex stimmt nicht = <strong>Flex Button ist verloren</strong>.
              </li>
              <li>
                <strong>Gewinn:</strong> In deinem eigenen Zug bekommst du einen <strong>Flex Button</strong>, wenn du <strong>Jahr richtig einordnest</strong> und <strong>zusätzlich den Titel/Interpret</strong> bzw. <strong>Name/Zitatgeber korrekt</strong> nennst.
              </li>
              <li>
                <strong>Als spielendes Team:</strong> Du kannst <strong>Flex-Buttons einsetzten</strong>, um dir eine <strong>neue Frage stellen zu lassen</strong>.
              </li>
            </ul>
          </div>
        </section>
      )}

      {mode === 'trivia' && (
        <section className="card-surface rounded-2xl p-5 space-y-2">
          <h2 className="text-lg font-semibold">Modus: Trivia-Quiz (Trivial Pursuit)</h2>
          <p className="text-sm text-ink/70">
            Ziel: Aus jeder Kategorie einen „Stein“ sammeln. Teams halten auf Papier fest, welche Kategorien sie bereits besitzen.
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
            <li>Ein Team wählt oder „würfelt“ eine Kategorie (z. B. zufällig ziehen).</li>
            <li>Die App zeigt eine Frage aus dieser Kategorie; das Team beantwortet sie.</li>
            <li>Richtig & Kategorie noch nicht gesammelt: Team notiert den Stein für diese Kategorie.</li>
            <li>Richtig & Kategorie bereits vorhanden: Das Team darf sofort eine neue Kategorie „würfeln“ und weitermachen.</li>
            <li>Falsch: Zug endet, nächstes Team ist dran.</li>
            <li>Spielende: Wer zuerst alle Kategorien (alle „Steine“) eingesammelt hat, gewinnt.</li>
          </ol>
        </section>
      )}

      <section className="card-surface rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-semibold">Kategorien</h2>
        <ul className="space-y-1 text-sm text-ink/80">
          <li><strong>Musik</strong>: Spotify/YouTube, Titel verdeckt.</li>
          <li><strong>Berühmte Zitate</strong>: Nur das Zitat, ohne Jahr/Person.</li>
          <li><strong>Bilder erkennen</strong>: Frage „Wo und wann war das?”</li>
          <li><strong>Länder erkennen</strong>: Flagge oder Umriss; Frage: „Zu welchem Land gehört diese Flagge und wann wurde es gegründet?”</li>
          <li><strong>Playlists</strong>: Unter Einstellungen kannst du aktive Playlists ein- oder ausschalten.</li>
          <li><strong>Schwierigkeit</strong>: Karten sind als leicht/mittel/schwer einsortiert und können unter Einstellungen ausgewählt werden.</li>
        </ul>
      </section>
    </main>
  );
}
