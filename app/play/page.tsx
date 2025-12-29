"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cards, getCategories } from '@/lib/cards';
import { MediaEmbed, MediaEmbedHandle } from '@/components/MediaEmbed';
import { getDefaultSettings, loadSettings, UserSettings } from '@/lib/userSettings';
import { Card, CardCategory } from '@/lib/types';

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

function buildWeightedDeck(allCards: Card[], settings: UserSettings) {
  const activeCategories = settings.categories.filter((cat) => (settings.categoryWeights[cat] ?? 0) > 0);
  const categoriesToUse = activeCategories.length > 0 ? activeCategories : settings.categories;

  const allowed = allCards.filter(
    (c) => categoriesToUse.includes(c.category) && settings.difficulties.includes(c.difficulty)
  );

  const buckets = new Map<CardCategory, Card[]>(
    categoriesToUse.map((cat) => [cat, shuffle(allowed.filter((c) => c.category === cat))])
  );

  const deck: Card[] = [];

  const drawCategory = (availableCats: CardCategory[]) => {
    const weights = availableCats.map((cat) => Math.max(0, settings.categoryWeights[cat] ?? 0));
    const total = weights.reduce((a, b) => a + b, 0);
    const norm = total > 0 ? total : availableCats.length;
    let r = Math.random() * norm;
    for (let i = 0; i < availableCats.length; i += 1) {
      const w = total > 0 ? weights[i] : 1;
      if (r <= w) return availableCats[i];
      r -= w;
    }
    return availableCats[availableCats.length - 1];
  };

  let safety = allowed.length * 2 + 10;
  while (deck.length < allowed.length && safety > 0) {
    safety -= 1;
    const availableCats = Array.from(buckets.entries())
      .filter(([, list]) => list.length > 0)
      .map(([cat]) => cat);
    if (availableCats.length === 0) break;
    const chosen = drawCategory(availableCats);
    const list = buckets.get(chosen);
    const card = list?.pop();
    if (card) deck.push(card);
  }

  return deck;
}

export default function PlayPage() {
  const router = useRouter();
  const availableCategories = useMemo(() => getCategories(cards).filter((c) => c !== 'video'), []);
  const defaults = useMemo(() => getDefaultSettings(availableCategories), [availableCategories]);
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [blockedCards, setBlockedCards] = useState<Set<string>>(new Set());
  const playableCards = useMemo(
    () => cards.filter((c) => c.category !== 'video' && !blockedCards.has(c.id)),
    [blockedCards]
  );
  const filteredDeck = useMemo(() => buildWeightedDeck(playableCards, settings), [playableCards, settings]);
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState<TimerState>({ secondsLeft: settings.timerSeconds, running: false });
  const [blackedOut, setBlackedOut] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [needsSpotifyAuth, setNeedsSpotifyAuth] = useState<boolean | null>(null);
  const mediaRef = useRef<MediaEmbedHandle | null>(null);
  const card = filteredDeck[index];
  const isLast = index === filteredDeck.length - 1;

  const requiresPlayStart = useCallback((c?: Card) => c?.category === 'music', []);

  const setTimerForCard = useCallback(
    (seconds: number, cardToUse?: Card) => {
      setTimer({ secondsLeft: seconds, running: !requiresPlayStart(cardToUse) });
    },
    [requiresPlayStart]
  );

  useEffect(() => {
    const stored = loadSettings(defaults);
    setSettings(stored);
    const bad = localStorage.getItem('blockedCards');
    if (bad) {
      try {
        const parsed = JSON.parse(bad) as string[];
        setBlockedCards(new Set(parsed));
      } catch (_err) {
        // ignore parse errors
      }
    }
    const deck = buildWeightedDeck(cards, stored);
    setTimerForCard(stored.timerSeconds, deck[0]);
    setIndex(0);
  }, [defaults, setTimerForCard]);

  useEffect(() => {
    setIndex(0);
    setBlackedOut(false);
    setShowSolution(false);
  }, [settings]);

  useEffect(() => {
    const current = filteredDeck[index];
    setTimerForCard(settings.timerSeconds, current);
    setBlackedOut(false);
    setShowSolution(false);
  }, [filteredDeck, index, settings.timerSeconds, setTimerForCard]);

  const rememberBlocked = useCallback((set: Set<string>) => {
    localStorage.setItem('blockedCards', JSON.stringify(Array.from(set)));
  }, []);

  const markCardBlocked = useCallback(
    (id: string) => {
      setBlockedCards((prev) => {
        const next = new Set(prev);
        next.add(id);
        rememberBlocked(next);
        return next;
      });
      if (card?.id === id) {
        nextCard();
      }
    },
    [card?.id, nextCard, rememberBlocked]
  );

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

  const nextCard = useCallback(() => {
    mediaRef.current?.stop();
    if (index < filteredDeck.length - 1) {
      setIndex((i) => i + 1);
      setShowSolution(false);
    } else {
      setBlackedOut(false);
      setTimer({ secondsLeft: 0, running: false });
      setShowSolution(false);
    }
  }, [filteredDeck.length, index]);

  const resetTimer = () => {
    const current = filteredDeck[index];
    setTimerForCard(settings.timerSeconds, current);
    setBlackedOut(false);
    setShowSolution(false);
  };

  const handleMediaPlay = () => {
    const current = filteredDeck[index];
    if (!requiresPlayStart(current)) return;
    setTimer((prev) => (prev.running ? prev : { ...prev, running: true }));
  };

  const endGame = () => {
    const confirmEnd = typeof window === 'undefined' ? true : window.confirm('Möchtest du das Spiel wirklich beenden?');
    if (confirmEnd) {
      router.push('/');
    }
  };

  if (!card) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 space-y-6 text-center">
        <h1 className="text-3xl font-display">Keine Karten aktiv</h1>
        <p className="text-ink/70">Aktiviere mindestens eine Kategorie und einen Schwierigkeitsgrad in den Einstellungen.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/settings"
            className="rounded-full bg-ink text-sand px-4 py-2 text-sm font-semibold"
          >
            Zu den Einstellungen
          </Link>
          <button
            type="button"
            className="rounded-full border border-ink/20 px-4 py-2 text-sm"
            onClick={() => {
              setSettings(defaults);
              setTimer({ secondsLeft: defaults.timerSeconds, running: true });
              setIndex(0);
            }}
          >
            Standard aktivieren
          </button>
        </div>
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
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Frage {index + 1} / {filteredDeck.length}</p>
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
          ref={mediaRef}
          card={card}
          preference={card.category === 'music' && card.sources.spotify ? 'spotify' : 'auto'}
          concealMetadata
          onPlay={handleMediaPlay}
          onPlaybackError={markCardBlocked}
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
        <button
          type="button"
          className="rounded-full border border-red-400 text-red-200 px-4 py-3 text-sm w-full sm:w-auto text-center"
          onClick={endGame}
        >
          Spiel beenden
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
