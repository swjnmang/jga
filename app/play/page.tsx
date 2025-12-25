"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { cards } from '@/lib/cards';
import { MediaEmbed } from '@/components/MediaEmbed';

const DURATION = 180;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type TimerState = {
  secondsLeft: number;
  running: boolean;
};

export default function PlayPage() {
  const deck = useMemo(() => cards, []);
  const shuffledDeck = useMemo(() => shuffle(deck), [deck]);
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState<TimerState>({ secondsLeft: DURATION, running: true });
  const [blackedOut, setBlackedOut] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [needsSpotifyAuth, setNeedsSpotifyAuth] = useState<boolean | null>(null);
  const requestedFullscreen = useRef(false);

  const card = shuffledDeck[index];
  const isLast = index === shuffledDeck.length - 1;

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

  useEffect(() => {
    const checkSpotify = async () => {
      try {
        const res = await fetch('/api/spotify/session');
        const json = await res.json();
        setNeedsSpotifyAuth(!json.authenticated);
      } catch (_err) {
        setNeedsSpotifyAuth(true);
      }
    };
    checkSpotify();
  }, []);

  // Attempt fullscreen after first user interaction.
  useEffect(() => {
    const handler = () => {
      if (requestedFullscreen.current) return;
      requestedFullscreen.current = true;
      if (document.fullscreenElement) return;
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // ignore user dismissal
        });
      }
    };
    document.addEventListener('pointerdown', handler, { once: true });
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const nextCard = () => {
    if (index < shuffledDeck.length - 1) {
      setIndex((i) => i + 1);
      resetTimer();
      setShowSolution(false);
    } else {
      setBlackedOut(false);
      setTimer({ secondsLeft: 0, running: false });
      setShowSolution(false);
    }
  };

  const resetTimer = () => {
    setTimer({ secondsLeft: DURATION, running: true });
    setBlackedOut(false);
    setShowSolution(false);
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
    <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Frage {index + 1} / {shuffledDeck.length}</p>
          <h1 className="text-3xl font-display">Spielmodus</h1>
          <p className="text-sm text-ink/70">Fragen erscheinen direkt, Teams notieren auf leere Karten. Kein QR, nur Flex Quiz.</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-ink/60">Timer</p>
          <div className="text-3xl font-display tabular-nums">{minutes}:{seconds}</div>
        </div>
      </div>

      <section className="card-surface rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-ink/60">{card.category}</p>
          <span className="text-xs rounded-full bg-ink text-sand px-3 py-1">versteckte Lösung</span>
        </div>
        <p className="text-lg font-semibold">{card.cue}</p>
        <MediaEmbed
          card={card}
          preference={card.category === 'music' && card.sources.spotify ? 'spotify' : 'auto'}
          concealMetadata
        />
        {showSolution && (
          <div className="rounded-xl bg-ink/5 p-4 space-y-2 text-sm text-ink/80">
            <p className="font-semibold text-ink">Lösung</p>
            <p className="text-ink">{card.year} – {card.answer}</p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3 pb-4 sm:pb-0">
        <button
          type="button"
          className="rounded-full bg-ink text-sand px-4 py-3 text-sm font-semibold w-full sm:w-auto text-center"
          onClick={nextCard}
        >
          {isLast ? 'Fertig' : 'Zur nächsten Frage'}
        </button>
        <button
          type="button"
          className="rounded-full border border-ink/20 px-4 py-3 text-sm w-full sm:w-auto text-center"
          onClick={resetTimer}
        >
          Timer neu starten
        </button>
        <button
          type="button"
          className="rounded-full border border-ink/20 px-4 py-3 text-sm w-full sm:w-auto text-center"
          onClick={() => setShowSolution(true)}
        >
          Lösung
        </button>
      </div>

      {blackedOut && (
        <div className="fixed inset-0 z-40 bg-black text-white flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold">Zeit abgelaufen</p>
          {!showSolution && (
            <button
              type="button"
              className="rounded-full border border-white/40 px-4 py-2 text-sm"
              onClick={() => setShowSolution(true)}
            >
              Lösung
            </button>
          )}
          {showSolution && (
            <div className="rounded-lg bg-white/10 px-4 py-3 text-sm">
              <p className="font-semibold">Lösung</p>
              <p>{card.year} – {card.answer}</p>
            </div>
          )}
          <button
            type="button"
            className="rounded-full bg-white text-ink px-4 py-2 text-sm font-semibold"
            onClick={nextCard}
          >
            {isLast ? 'Fertig' : 'Zur nächsten Frage'}
          </button>
        </div>
      )}

      {needsSpotifyAuth && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl bg-sand p-6 space-y-3 shadow-xl text-center">
            <h2 className="text-xl font-semibold text-ink">Mit Spotify Premium verbinden</h2>
            <p className="text-sm text-ink/80">
              Vor dem Start bitte mit deinem Spotify Premium Account anmelden, damit die Songs ohne
              Werbung und in voller Länge abgespielt werden können.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <a
                href="/api/spotify/authorize"
                className="rounded-full bg-ink text-sand px-4 py-2 text-sm font-semibold"
              >
                Spotify Login starten
              </a>
              <button
                type="button"
                className="rounded-full border border-ink/20 px-4 py-2 text-sm"
                onClick={() => setNeedsSpotifyAuth(false)}
              >
                Später
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
