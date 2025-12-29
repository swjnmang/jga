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
              mode === 'zeitstrahl' ? 'border-ink bg-ink text-sand' : 'border-ink/20'
            }`}
          >
            Zeitstrahl
          </button>
          <button
            type="button"
            onClick={() => setMode('trivia')}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              mode === 'trivia' ? 'border-ink bg-ink text-sand' : 'border-ink/20'
            }`}
          >
            Trivia-Quiz
          </button>
        </div>
      </div>

      {mode === 'zeitstrahl' && (
        <section className="card-surface rounded-2xl p-5 space-y-2">
          <h2 className="text-lg font-semibold">Modus: Zeitstrahl (Standard)</h2>
          <p className="text-sm text-ink/70">Ziel: 10 Karten in der korrekten zeitlichen Reihenfolge auslegen.</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
            <li>Jedes Team erhält leere Karten (Front für Lösung, Rückseite für Musterlösung).</li>
            <li>Reihum zeigt die App eine neue Frage/Medienkarte, Timer 3:00 startet.</li>
            <li>Ohne Titel/Interpret zu sehen wird der Inhalt abgespielt/angezeigt.</li>
            <li>Team schreibt seine Lösung auf die Karte und legt sie zeitlich ein.</li>
            <li>Aufdecken/Lösung eintragen: Jahr prüfen. Richtig = behalten, falsch = beiseite.</li>
            <li>Optional: Flex-Fenster für andere Teams (siehe Flex Buttons).</li>
            <li>Nächste Runde, bis jemand 10 korrekt liegende Karten hat.</li>
          </ol>

          <div className="pt-4 space-y-2">
            <h3 className="text-md font-semibold">Flex Buttons</h3>
            <ul className="space-y-1 text-sm text-ink/80">
              <li>Einsatz: Nachdem das aktive Team seinen Zug beendet hat, darf ein anderes Team einen Flex Button werfen.</li>
              <li>Treffer: Flex stimmt (Jahr + Titel/Interpret/Zitatgeber/Objekt) = das flexende Team nimmt die zuletzt gespielte Karte.</li>
              <li>Fehlversuch: Flex stimmt nicht = Flex Button ist verloren.</li>
              <li>Gewinn: In deinem eigenen Zug bekommst du einen Flex Button, wenn du Jahr richtig einordnest und zusätzlich den Titel/Interpret bzw. Name/Zitatgeber korrekt nennst.</li>
            </ul>
          </div>
        </section>
      )}

      {mode === 'trivia' && (
        <section className="card-surface rounded-2xl p-5 space-y-2">
          <h2 className="text-lg font-semibold">Modus: Trivia-Quiz (Trivial Pursuit)</h2>
          <p className="text-sm text-ink/70">
            Ziel: Aus jeder Kategorie einen „Stein" sammeln. Teams halten auf Papier fest, welche Kategorien sie bereits besitzen.
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
            <li>Ein Team wählt oder „würfelt" eine Kategorie (z. B. zufällig ziehen).</li>
            <li>Die App zeigt eine Frage aus dieser Kategorie; das Team beantwortet sie.</li>
            <li>Richtig & Kategorie noch nicht gesammelt: Team notiert den Stein für diese Kategorie.</li>
            <li>Richtig & Kategorie bereits vorhanden: Das Team darf sofort eine neue Kategorie „würfeln" und weitermachen.</li>
            <li>Falsch: Zug endet, nächstes Team ist dran.</li>
            <li>Spielende: Wer zuerst alle Kategorien (alle „Steine") eingesammelt hat, gewinnt.</li>
          </ol>
        </section>
      )}

      <section className="card-surface rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-semibold">Kategorien</h2>
        <ul className="space-y-1 text-sm text-ink/80">
          <li><strong>Musik</strong>: Spotify/YouTube, Titel verdeckt.</li>
          <li><strong>Video</strong>: Clip ohne Titel.</li>
          <li><strong>Quote</strong>: Nur das Zitat, ohne Jahr/Person.</li>
          <li><strong>Bild</strong>: Frage „Wo und wann war das?”</li>
          <li><strong>Länder</strong>: Flagge oder Umriss; Frage: „Zu welchem Land gehört diese Flagge und wann wurde es gegründet?”</li>
          <li><strong>Schwierigkeit</strong>: Karten sind intern als leicht/mittel/schwer einsortiert und können unter Einstellungen angepasst werden.</li>
        </ul>
      </section>
    </main>
  );
}
