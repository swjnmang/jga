import Link from 'next/link';
import { cards, getCategories } from '@/lib/cards';

export default function HomePage() {
  const categories = getCategories(cards);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
      <section className="space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-ink/70">Timeline Game</p>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display leading-tight">
            Direkt spielen: abspielen, ordnen, notieren.
          </h1>
          <p className="text-lg text-ink/80">
            Kein QR-Scan mehr: Die Fragen erscheinen direkt. Teams schreiben ihre Lösung auf leere
            Karten und tragen die Musterlösung rückseitig ein.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MenuCard title="Spiel starten" desc="Fragen nacheinander anzeigen" href="/play" accent="bg-ink text-sand" />
          <MenuCard title="Einstellungen" desc="Karten lokal ergänzen" href="/settings" />
          <MenuCard title="Spielregeln" desc="Ablauf & Punkte" href="/rules" />
        </div>

        <div className="card-surface rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Setup</h2>
          <ul className="space-y-2 text-sm text-ink/80">
            <li>1) Drucke leere Karten (Front: Team-Lösung, Back: Musterlösung).</li>
            <li>2) Teams starten mit der Referenzkarte 1900.</li>
            <li>3) In der App „Spiel starten“: Frage erscheint direkt, Timer 3:00 läuft.</li>
          </ul>
          <div className="rounded-xl bg-mint/70 text-ink p-4 text-sm">
            Medien werden direkt gestreamt; keine QR-Codes mehr erforderlich. Eigene Bilder/Zitate
            kannst du unter <span className="font-semibold">public/assets/</span> hosten.
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-ink/70">
            {categories.map((cat) => (
              <span key={cat} className="rounded-full bg-ink/5 px-3 py-1 uppercase tracking-wide">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="karten" className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-display">Beispielkarten</h2>
          <span className="text-sm text-ink/60">(erweiterbar über cards.ts)</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <article key={card.id} className="card-surface rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/60">{card.category}</p>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <span className="text-sm font-semibold bg-ink text-sand rounded-full px-3 py-1">
                  {card.year}
                </span>
              </div>
              <p className="text-sm text-ink/80">{card.cue}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link className="underline" href={`/card/${card.id}`}>
                  Karte öffnen
                </Link>
                <Link className="underline" href={`/api/qr/${card.id}`}>
                  QR als PNG
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

type MenuCardProps = {
  title: string;
  desc: string;
  href: string;
  accent?: string;
};

function MenuCard({ title, desc, href, accent }: MenuCardProps) {
  return (
    <Link
      href={href}
      className={`card-surface rounded-2xl p-4 space-y-1 transition hover:-translate-y-0.5 ${accent ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span aria-hidden>→</span>
      </div>
      <p className="text-sm text-ink/70">{desc}</p>
    </Link>
  );
}
