export default function RulesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Spielregeln</p>
        <h1 className="text-3xl font-display">10 Karten zeitlich ordnen</h1>
        <p className="text-sm text-ink/70">
          Ziel: 10 Karten in der korrekten zeitlichen Reihenfolge auslegen. Entscheidend ist nur
          die Jahreszahl.
        </p>
      </div>

      <section className="card-surface rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-semibold">Ablauf</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
          <li>Jedes Team erhält leere Karten (Front für Lösung, Rückseite für Musterlösung).</li>
          <li>Reihum zeigt die App eine neue Frage/Medienkarte, Timer 3:00 startet.</li>
          <li>Ohne Titel/Interpret zu sehen wird der Inhalt abgespielt/angezeigt.</li>
          <li>Team schreibt seine Lösung auf die Karte und legt sie zeitlich ein.</li>
          <li>Aufdecken/Lösung eintragen: Jahr prüfen. Richtig = behalten, falsch = beiseite.</li>
          <li>Nächste Runde, bis jemand 10 korrekt liegende Karten hat.</li>
        </ol>
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-semibold">Kategorien</h2>
        <ul className="space-y-1 text-sm text-ink/80">
          <li><strong>Musik</strong>: Spotify/YouTube, Titel verdeckt.</li>
          <li><strong>Video</strong>: Clip ohne Titel.</li>
          <li><strong>Quote</strong>: Nur das Zitat, ohne Jahr/Person.</li>
          <li><strong>Bild</strong>: Frage „Wo und wann war das?”</li>
        </ul>
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-semibold">Tipps</h2>
        <ul className="space-y-1 text-sm text-ink/80">
          <li>Am Handy spielen: /scan öffnet direkt den QR-Scanner.</li>
          <li>Druck: /print erzeugt Vorder-/Rückseiten mit QR.</li>
          <li>Erweitere Karten in der Einstellungenseite oder direkt in lib/cards.ts.</li>
        </ul>
      </section>
    </main>
  );
}
