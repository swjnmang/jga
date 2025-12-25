"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CardCategory, Difficulty } from '@/lib/types';

const STORAGE_KEY = 'jga-custom-cards';

type AdminCard = {
  id: string;
  title: string;
  category: CardCategory;
  year: number;
  mediaUrl: string;
  answer: string;
  difficulty: Difficulty;
};

export default function SettingsPage() {
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [draft, setDraft] = useState<AdminCard>({
    id: '',
    title: '',
    category: 'music',
    year: new Date().getFullYear(),
    mediaUrl: '',
    answer: '',
    difficulty: 'leicht'
  });

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        setCards(JSON.parse(raw));
      } catch (err) {
        // ignore
      }
    }
  }, []);

  const save = (next: AdminCard[]) => {
    setCards(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const handleAdd = () => {
    if (!draft.id || !draft.mediaUrl) return;
    const next = [...cards, draft];
    save(next);
    setDraft({ ...draft, id: '', title: '', mediaUrl: '', answer: '' });
  };

  const exportJson = useMemo(() => JSON.stringify(cards, null, 2), [cards]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Einstellungen</p>
        <h1 className="text-3xl font-display">Karten verwalten (lokal)</h1>
        <p className="text-sm text-ink/70">
          Prototyp: Karten werden nur im lokalen Browser-Speicher gesichert. Für gemeinsame Nutzung
          oder QR-Druck müssen diese Daten später in eine echte Datenbank / API übernommen werden.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/print"
            className="rounded-xl bg-ink text-sand px-4 py-2 text-sm font-semibold shadow"
          >
            Alle Karten drucken
          </Link>
        </div>
      </div>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Neue Karte</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm space-y-1">
            <span>ID / Slug</span>
            <input
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.id}
              onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              placeholder="z.B. song-my-track"
            />
          </label>
          <label className="text-sm space-y-1">
            <span>Titel (nur für Rückseite)</span>
            <input
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Songname / Ereignis"
            />
          </label>
          <label className="text-sm space-y-1">
            <span>Kategorie</span>
            <select
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as CardCategory })}
            >
              <option value="music">Musik</option>
              <option value="video">Video</option>
              <option value="quote">Quote</option>
              <option value="image">Bild</option>
              <option value="country">Länder</option>
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span>Jahr</span>
            <input
              type="number"
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.year}
              onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm space-y-1">
            <span>Schwierigkeit</span>
            <select
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.difficulty}
              onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Difficulty })}
            >
              <option value="leicht">Leicht</option>
              <option value="mittel">Mittel</option>
              <option value="schwer">Schwer</option>
            </select>
          </label>
          <label className="text-sm space-y-1 md:col-span-2">
            <span>Medien-URL (Spotify/YouTube/Bild/Text-URL)</span>
            <input
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.mediaUrl}
              onChange={(e) => setDraft({ ...draft, mediaUrl: e.target.value })}
              placeholder="https://open.spotify.com/track/... oder /assets/images/..."
            />
          </label>
          <label className="text-sm space-y-1 md:col-span-2">
            <span>Antwort / Auflösung</span>
            <input
              className="w-full rounded-xl border border-ink/20 px-3 py-2"
              value={draft.answer}
              onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              placeholder="Erläuterung für die Rückseite"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-ink text-sand px-4 py-2 font-semibold"
          >
            Karte speichern (lokal)
          </button>
        </div>
        <p className="text-xs text-ink/60">
          Hinweis: QR-Codes für neue Karten musst du derzeit manuell erzeugen, indem du sie in
          lib/cards.ts hinterlegst oder die Daten in eine echte Datenbank/Backend bringst.
        </p>
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Gespeicherte lokale Karten</h2>
        {cards.length === 0 ? (
          <p className="text-sm text-ink/70">Noch keine Einträge.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {cards.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-ink/10 px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{c.title || 'Ohne Titel'} ({c.category})</p>
                  <p className="text-ink/60">{c.year} · {c.mediaUrl}</p>
                  <p className="text-xs text-ink/60">Schwierigkeit: {c.difficulty}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => save(cards.filter((x) => x.id !== c.id))}
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Export (JSON)</h2>
        <p className="text-sm text-ink/70">Diese Daten kannst du später in eine echte DB importieren.</p>
        <textarea
          className="w-full min-h-[160px] rounded-xl border border-ink/20 px-3 py-2 text-xs font-mono"
          readOnly
          value={exportJson}
        />
      </section>
    </main>
  );
}
