"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MediaEmbed, SourcePills } from '@/components/MediaEmbed';
import { ServiceSelector } from '@/components/ServiceSelector';
import { Countdown } from '@/components/Countdown';
import { Card, Difficulty, MediaPreference } from '@/lib/types';

const PREF_KEY = 'jga-media-preference';

type Props = {
  card: Card;
};

function useSavedPreference(defaultValue: MediaPreference) {
  const [value, setValue] = useState<MediaPreference>(defaultValue);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(PREF_KEY) : null;
    if (stored === 'youtube' || stored === 'spotify' || stored === 'auto') {
      setValue(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PREF_KEY, value);
    }
  }, [value]);

  return [value, setValue] as const;
}

export function CardClient({ card }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [preference, setPreference] = useSavedPreference('auto');

  const difficultyLabel = (value: Difficulty) => {
    if (value === 'leicht') return 'Leicht';
    if (value === 'mittel') return 'Mittel';
    return 'Schwer';
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-ink/60">{card.category}</p>
          <h1 className="text-3xl font-display leading-tight">
            {showAnswer ? card.title : 'Verdeckter Inhalt'}
          </h1>
          <SourcePills card={card} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-ink text-sand px-4 py-2 text-sm font-semibold">
            {showAnswer ? card.year : '???'}
          </span>
          <span className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink/80">
            {difficultyLabel(card.difficulty)}
          </span>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-sm text-ink/70">Stoppuhr (3:00) startet nach dem Scannen</p>
        <Countdown autoStart />
      </div>

      <div className="space-y-4 card-surface rounded-2xl p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink/70">Bevorzugter Dienst</p>
          <ServiceSelector value={preference} onChange={setPreference} />
        </div>
        <MediaEmbed card={card} preference={preference} concealMetadata={!showAnswer} />
      </div>

      <div className="card-surface rounded-2xl p-6 space-y-3">
        <p className="text-sm text-ink/70">Aufgabe</p>
        <p className="text-lg font-semibold">{card.cue}</p>
        {card.hint && <p className="text-sm text-ink/70">Hinweis: {card.hint}</p>}
      </div>

      <div className="card-surface rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/70">Lösung</p>
          <button
            type="button"
            onClick={() => setShowAnswer((v) => !v)}
            className="rounded-full bg-ink text-sand px-3 py-1 text-sm font-semibold"
          >
            {showAnswer ? 'Verbergen' : 'Aufdecken'}
          </button>
        </div>
        {showAnswer ? (
          <p className="text-lg font-semibold leading-relaxed">{card.answer}</p>
        ) : (
          <p className="text-sm text-ink/60">Tippe auf "Aufdecken", um die Lösung zu sehen.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-ink/70">
        <Link className="underline" href={`/api/qr/${card.id}`}>
          QR als PNG laden
        </Link>
        <Link className="underline" href="/print">
          Alle Karten drucken
        </Link>
      </div>
    </div>
  );
}
