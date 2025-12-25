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
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3 border border-ink/10 min-h-[260px]">
      <p className="text-xs uppercase tracking-wide text-ink/60">Team-Lösung</p>
      <div className="flex-1 rounded-xl border border-dashed border-ink/20 p-3 text-sm text-ink/50">
        Raum für Antwort / Jahreszahl / Ort
      </div>
      <p className="text-xs text-ink/40">Karten-ID: {cardId}</p>
    </div>
  );
}

type BackProps = { cardId: string; title: string; answer: string; year: number; hint?: string };

function CardFaceBack({ cardId, title, answer, year, hint }: BackProps) {
  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3 border border-ink/10 min-h-[260px]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink/60">Musterlösung</p>
        <span className="text-xs bg-ink text-sand rounded-full px-3 py-1">Jahr + Interpret/Ort</span>
      </div>
      <div className="flex-1 rounded-xl border border-dashed border-ink/20 p-3 text-sm text-ink/50">
        Platz für korrekte Lösung
      </div>
      <p className="text-xs text-ink/40">Karten-ID: {cardId}</p>
      <p className="text-xs text-ink/40">Titel (nur für Leitfaden): {title}</p>
      <p className="text-xs text-ink/40">Offizielle Lösung: {answer}</p>
      {hint && <p className="text-xs text-ink/40">Hinweis: {hint}</p>}
    </div>
  );
}
