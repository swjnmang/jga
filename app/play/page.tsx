"use client";

import { useEffect, useMemo, useState } from 'react';
import { cards } from '@/lib/cards';
import { MediaEmbed } from '@/components/MediaEmbed';

const DURATION = 180;

type TimerState = {
  secondsLeft: number;
  running: boolean;
};

export default function PlayPage() {
  const deck = useMemo(() => cards, []);
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState<TimerState>({ secondsLeft: DURATION, running: true });
  const [blackedOut, setBlackedOut] = useState(false);

  const card = deck[index];
  const isLast = index === deck.length - 1;

  useEffect(() => {
    if (!timer.running) return;
    if (timer.secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setTimer((prev) => ({ ...prev, secondsLeft: Math.max(0, prev.secondsLeft - 1) }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timer.running, timer.secondsLeft]);

  useEffect(() => {
    if (timer.secondsLeft === 0) {
      setBlackedOut(true);
      setTimer((prev) => ({ ...prev, running: false }));
    }
  }, [timer.secondsLeft]);

  const nextCard = () => {
    if (index < deck.length - 1) {
      setIndex((i) => i + 1);
      resetTimer();
    } else {
      setBlackedOut(false);
      setTimer({ secondsLeft: 0, running: false });
    }
  };

  const resetTimer = () => {
    setTimer({ secondsLeft: DURATION, running: true });
    setBlackedOut(false);
  };

  if (!card) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 space-y-6 text-center">
        <h1 className="text-3xl font-display">Alle Fragen durchgespielt</h1>
        <p className="text-ink/70">Du kannst den Durchlauf neu starten.</p>
        <button
          type="button"
          className="rounded-full bg-ink text-sand px-4 py-2 text-sm font-semibold"
          onClick={() => {
            setIndex(0);
            resetTimer();
          }}
        >
          Neustart
        </button>
      </main>
    );
  }

  const minutes = Math.floor(timer.secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timer.secondsLeft % 60).toString().padStart(2, '0');

  return (
    <main className="relative mx-auto max-w-4xl px-5 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Frage {index + 1} / {deck.length}</p>
          <h1 className="text-3xl font-display">Spielmodus</h1>
          <p className="text-sm text-ink/70">Lied/Video/Zitat/Bild erscheint direkt, keine QR-Codes.</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-ink/60">Timer</p>
          <div className="text-3xl font-display tabular-nums">{minutes}:{seconds}</div>
        </div>
      </div>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-ink/60">{card.category}</p>
          <span className="text-xs rounded-full bg-ink text-sand px-3 py-1">versteckte Lösung</span>
        </div>
        <p className="text-lg font-semibold">{card.cue}</p>
        {card.hint && <p className="text-sm text-ink/60">Hinweis: {card.hint}</p>}
        <MediaEmbed
          card={card}
          preference={card.category === 'music' && card.sources.spotify ? 'spotify' : 'auto'}
          concealMetadata
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-ink text-sand px-4 py-2 text-sm font-semibold"
          onClick={nextCard}
        >
          {isLast ? 'Fertig' : 'Zur nächsten Frage'}
        </button>
        <button
          type="button"
          className="rounded-full border border-ink/20 px-4 py-2 text-sm"
          onClick={resetTimer}
        >
          Timer neu starten
        </button>
      </div>

      {blackedOut && (
        <div className="fixed inset-0 z-40 bg-black text-white flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold">Zeit abgelaufen</p>
          <button
            type="button"
            className="rounded-full bg-white text-ink px-4 py-2 text-sm font-semibold"
            onClick={nextCard}
          >
            {isLast ? 'Fertig' : 'Zur nächsten Frage'}
          </button>
        </div>
      )}
    </main>
  );
}
