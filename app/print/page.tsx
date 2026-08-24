import { cards, getCategories } from '@/lib/cards';
import { PrintButton } from '@/components/PrintButton';
import { Difficulty } from '@/lib/types';
import { catLabelWithIcon } from '@/lib/categoryMeta';

// Die gesamte Kartenbibliothek ist mittlerweile zu groß, um sie als eine
// einzige statische Seite vorzurendern (Vercel-ISR-Limit ~19 MB für die
// Fallback-Antwort). Über searchParams wird die Seite automatisch dynamisch
// gerendert, und standardmäßig wird nichts angezeigt, bis Kategorien
// ausgewählt wurden – das hält jede Antwort klein.
export const dynamic = 'force-dynamic';

// Grobe Warnschwelle, ab der eine sehr große Druckauswahl auf mehrere
// Durchgänge aufgeteilt werden sollte (Erfahrungswert: ~3,7 KB HTML pro
// Karte, das alte Limit lag bei ~5200 Karten / 19,4 MB).
const LARGE_SELECTION_WARNING_THRESHOLD = 2000;

function normalizeCategoryParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function PrintPage({
  searchParams
}: {
  searchParams: { cat?: string | string[] };
}) {
  const availableCategories = getCategories(cards).sort((a, b) => a.localeCompare(b));
  const countsByCategory = availableCategories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cards.filter((c) => c.category === cat).length;
    return acc;
  }, {});

  const availableCategorySet = new Set<string>(availableCategories);
  const selectedCategories = normalizeCategoryParam(searchParams.cat).filter((c) =>
    availableCategorySet.has(c)
  );
  const hasSelection = selectedCategories.length > 0;
  const filteredCards = hasSelection ? cards.filter((c) => selectedCategories.includes(c.category)) : [];
  const allCatsQuery = availableCategories.map((c) => `cat=${encodeURIComponent(c)}`).join('&');

  return (
    <main className="px-6 py-10 space-y-6">
      <div className="no-print space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/60">Karten-Druck</p>
            <h1 className="text-3xl font-display">Vorder- und Rückseiten</h1>
            <p className="text-sm text-ink/70">
              Druckfreundliches Layout (A4). Vorderseiten mit QR, Rückseiten mit Lösung.
            </p>
          </div>
          {hasSelection && <PrintButton />}
        </div>

        <form method="get" className="card-surface rounded-2xl p-4 space-y-3 border border-ink/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink/80">Kategorien auswählen ({cards.length} Karten insgesamt)</p>
            <div className="flex gap-3 text-xs">
              <a className="underline" href={`/print?${allCatsQuery}`}>Alle auswählen</a>
              <a className="underline" href="/print">Auswahl leeren</a>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {availableCategories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="cat" value={cat} defaultChecked={selectedCategories.includes(cat)} />
                <span>{catLabelWithIcon(cat)} ({countsByCategory[cat]})</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-full bg-ink text-inkDark px-4 py-2 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition"
          >
            Auswahl anzeigen
          </button>
        </form>

        {hasSelection && (
          <p className="text-sm text-ink/70">
            {filteredCards.length} Karten ausgewählt.
            {filteredCards.length > LARGE_SELECTION_WARNING_THRESHOLD && (
              <span className="text-amber-600">
                {' '}Das ist eine sehr große Auswahl – für stabile Druckergebnisse lieber in mehreren Durchgängen (weniger Kategorien gleichzeitig) drucken.
              </span>
            )}
          </p>
        )}
      </div>

      {hasSelection ? (
        <div className="print-grid gap-6 grid-cols-1 sm:grid-cols-2">
          {filteredCards.map((card) => (
            <div key={card.id} className="space-y-4 print-card">
              <CardFaceFront cardId={card.id} title={card.title} category={card.category} />
              <CardFaceBack
                cardId={card.id}
                title={card.title}
                answer={card.answer}
                year={card.year}
                hint={card.hint}
                difficulty={card.difficulty}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="no-print text-sm text-ink/60">
          Bitte oben mindestens eine Kategorie auswählen, um Karten zum Drucken anzuzeigen.
        </p>
      )}
    </main>
  );
}

type FrontProps = { cardId: string; title: string; category: string };

function CardFaceFront({ cardId }: FrontProps) {
  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3 border border-ink/10 min-h-[260px]">
      <p className="text-xs uppercase tracking-wide text-ink/60">Team-Lösung</p>
      <div className="flex-1 rounded-xl border border-dashed border-ink/20 p-3 text-sm text-ink/50">
        Raum für Antwort / Jahreszahl / Ort
      </div>
      <p className="text-xs text-ink/40">Karten-ID: {cardId}</p>
    </div>
  );
}

type BackProps = { cardId: string; title: string; answer: string; year: number; hint?: string; difficulty: Difficulty };

function CardFaceBack({ cardId, title, answer, year, hint, difficulty }: BackProps) {
  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3 border border-ink/10 min-h-[260px]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink/60">Musterlösung</p>
        <span className="text-xs bg-ink text-inkDark rounded-full px-3 py-1">Jahr + Interpret/Ort</span>
      </div>
      <div className="flex-1 rounded-xl border border-dashed border-ink/20 p-3 text-sm text-ink/50">
        Platz für korrekte Lösung
      </div>
      <p className="text-xs text-ink/40">Karten-ID: {cardId}</p>
      <p className="text-xs text-ink/40">Titel (nur für Leitfaden): {title}</p>
      <p className="text-xs text-ink/40">Offizielle Lösung: {answer}</p>
      {hint && <p className="text-xs text-ink/40">Hinweis: {hint}</p>}
      <p className="text-xs text-ink/40">Schwierigkeitsgrad: {difficulty}</p>
    </div>
  );
}
