import { cards } from '@/lib/cards';
import { PrintButton } from '@/components/PrintButton';

export default function PrintPage() {
  return (
    <main className="px-6 py-10 space-y-6">
      <div className="no-print flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">Karten-Druck</p>
          <h1 className="text-3xl font-display">Vorder- und Rückseiten</h1>
          <p className="text-sm text-ink/70">
            Druckfreundliches Layout (A4). Vorderseiten mit QR, Rückseiten mit Lösung.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="print-grid gap-6 grid-cols-1 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.id} className="space-y-4 print-card">
            <CardFaceFront cardId={card.id} title={card.title} category={card.category} />
            <CardFaceBack
              cardId={card.id}
              title={card.title}
              answer={card.answer}
              year={card.year}
              hint={card.hint}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

type FrontProps = { cardId: string; title: string; category: string };

function CardFaceFront({ cardId }: FrontProps) {
  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3 border border-ink/10">
      <div className="flex justify-center">
        <img
          src={`/api/qr/${cardId}`}
          alt="QR-Code"
          className="h-40 w-40 object-contain"
        />
      </div>
    </div>
  );
}

type BackProps = { cardId: string; title: string; answer: string; year: number; hint?: string };

function CardFaceBack({ cardId, title, answer, year, hint }: BackProps) {
  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3 border border-ink/10">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink/60">Lösung</p>
        <span className="text-xs bg-ink text-sand rounded-full px-3 py-1">{year}</span>
      </div>
      <p className="text-lg font-semibold leading-relaxed">{answer}</p>
      {hint && <p className="text-sm text-ink/70">Hinweis: {hint}</p>}
      <p className="text-xs text-ink/60">Karten-ID: {cardId}</p>
      <p className="text-xs text-ink/60">Titel: {title}</p>
    </div>
  );
}
