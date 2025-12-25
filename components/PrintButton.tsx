"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink text-sand px-4 py-2 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition"
    >
      Drucken
    </button>
  );
}
