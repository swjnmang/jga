"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cards, getCategories } from '@/lib/cards';
import { MediaEmbed, MediaEmbedHandle } from '@/components/MediaEmbed';
import { getDefaultSettings, loadSettings, toDecadeTag, TRIVIA_ONLY_CATEGORIES, UserSettings } from '@/lib/userSettings';
import { Card, CardCategory, DecadeTag, Difficulty, GenreTag } from '@/lib/types';

const FALLBACK_PLAYLIST_ID = 'imported-playlist';

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

type GameMode = 'timeline' | 'trivia';

const triviaOnlySet = new Set<CardCategory>(TRIVIA_ONLY_CATEGORIES);

function difficultyLabel(value: Difficulty): string {
  if (value === 'leicht') return 'Leicht';
  if (value === 'mittel') return 'Mittel';
  return 'Schwer';
}

const CATEGORY_META: Record<CardCategory, { label: string; icon: string }> = {
  music: { label: 'Musik', icon: '🎵' },
  quote: { label: 'Zitate', icon: '💬' },
  image: { label: 'Bilder erkennen', icon: '🖼️' },
  country: { label: 'Länder/Flaggen', icon: '🏳️' },
  video: { label: 'Video', icon: '🎬' },
  sportfreizeit: { label: 'Sport & Freizeit', icon: '🏆' },
  religionglaube: { label: 'Religion & Glaube', icon: '✝️' },
  geogeschichte: { label: 'Geographie & Geschichte', icon: '🌍' },
  naturtechnik: { label: 'Natur & Technik', icon: '🔬' },
  filmeserien: { label: 'Filme & Serien', icon: '🎞️' },
  schaetzfragen: { label: 'Schätzfragen', icon: '🎯' }
};

function triviaCue(card: Card): string {
  switch (card.category) {
    case 'music':
      return 'Wer ist der Artist oder wie heißt der Song?';
    case 'quote':
      return 'Von wem stammt dieses Zitat?';
    case 'image':
      return 'Was bzw. welches Ereignis ist auf dem Bild?';
    case 'country':
      return 'Zu welchem Land gehört das Gezeigte?';
    case 'video':
      return 'Was wird hier gezeigt?';
    default:
      return 'Frage beantworten.';
  }
}

function buildWeightedDeck(
  allCards: Card[],
  settings: UserSettings,
  fallbackPlaylistId: string,
  allowedCategories?: CardCategory[]
) {
  const allowed = allowedCategories && allowedCategories.length > 0 ? allowedCategories : settings.categories;
  const activeCategories = settings.categories
    .filter((cat) => (settings.categoryWeights[cat] ?? 0) > 0)
    .filter((cat) => allowed.includes(cat));
  const categoriesToUse = activeCategories.length > 0 ? activeCategories : allowed;

  const genreMatches = (card: Card) => {
    if (card.category !== 'music') return true;
    if (!card.genres || card.genres.length === 0) return true;
    return card.genres.some((g) => settings.genres.includes(g as GenreTag));
  };

  const decadeMatches = (card: Card) => {
    if (card.category !== 'music') return true;
    const year = card.year;
    if (typeof year !== 'number' || Number.isNaN(year)) return true;
    const decade = toDecadeTag(year as number);
    if (!decade) return true;
    return settings.decades.includes(decade);
  };

  const playlistMatches = (card: Card) => {
    if (card.category !== 'music') return true;
    const ids = card.playlists && card.playlists.length > 0 ? card.playlists : [fallbackPlaylistId];
    if (settings.playlists.length === 0) return true;
    return ids.some((id) => settings.playlists.includes(id));
  };

  const filtered = allCards.filter(
    (c) =>
      categoriesToUse.includes(c.category) &&
      settings.difficulties.includes(c.difficulty) &&
      genreMatches(c) &&
      decadeMatches(c) &&
      playlistMatches(c)
  );

  const buckets = new Map<CardCategory, Card[]>(
    categoriesToUse.map((cat) => [cat, shuffle(filtered.filter((c) => c.category === cat))])
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

  let safety = filtered.length * 2 + 10;
  while (deck.length < filtered.length && safety > 0) {
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

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeQuery = searchParams.get('mode');
  const startQuery = searchParams.get('start');
  const preselectedMode: GameMode | null = modeQuery === 'timeline' || modeQuery === 'trivia' ? modeQuery : null;
  const startFlag = startQuery === '1';
  const availableCategories = useMemo(() => getCategories(cards).filter((c) => c !== 'video'), []);
  const availableDecades = useMemo(() => {
    const order: DecadeTag[] = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
    const set = new Set<DecadeTag>();
    cards
      .filter((c) => c.category === 'music' && typeof c.year === 'number')
      .forEach((c) => {
        const d = toDecadeTag(c.year as number);
        if (d) set.add(d);
      });
    return order.filter((d) => set.has(d));
  }, []);
  const availablePlaylists = useMemo(() => {
    const set = new Set<string>();
    cards
      .filter((c) => c.category === 'music')
      .forEach((c) => {
        const ids = c.playlists && c.playlists.length > 0 ? c.playlists : [FALLBACK_PLAYLIST_ID];
        ids.forEach((id) => set.add(id));
      });
    return Array.from(set);
  }, []);
  const defaults = useMemo(
    () => getDefaultSettings(availableCategories, availableDecades, availablePlaylists),
    [availableCategories, availableDecades, availablePlaylists]
  );
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [deckKey, setDeckKey] = useState(0);
  const [blockedCards, setBlockedCards] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<GameMode | null>(preselectedMode && startFlag ? preselectedMode : null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const allowedCategoriesForMode = useMemo(
    () => (mode === 'timeline' ? availableCategories.filter((cat) => !triviaOnlySet.has(cat)) : availableCategories),
    [mode, availableCategories]
  );
  const modeSettings = useMemo(() => {
    const weights = allowedCategoriesForMode.reduce<Record<CardCategory, number>>((acc, cat) => {
      acc[cat] = settings.categoryWeights[cat] ?? 0;
      return acc;
    }, {} as Record<CardCategory, number>);
    const active = allowedCategoriesForMode.filter((cat) => (weights[cat] ?? 0) > 0);
    return { ...settings, categoryWeights: weights, categories: active.length > 0 ? active : allowedCategoriesForMode };
  }, [settings, allowedCategoriesForMode]);
  const playableCards = useMemo(() => {
    const genreAllowed = (card: Card) => {
      if (card.category !== 'music') return true;
      if (!card.genres || card.genres.length === 0) return true;
      return card.genres.some((g) => settings.genres.includes(g as GenreTag));
    };
    const decadeAllowed = (card: Card) => {
      if (card.category !== 'music') return true;
      const year = card.year;
      if (typeof year !== 'number' || Number.isNaN(year)) return true;
      const decade = toDecadeTag(year as number);
      if (!decade) return true;
      return settings.decades.includes(decade);
    };
    const playlistAllowed = (card: Card) => {
      if (card.category !== 'music') return true;
      const ids = card.playlists && card.playlists.length > 0 ? card.playlists : [FALLBACK_PLAYLIST_ID];
      if (settings.playlists.length === 0) return true;
      return ids.some((id) => settings.playlists.includes(id));
    };
    return cards.filter(
      (c) =>
        c.category !== 'video' &&
        !blockedCards.has(c.id) &&
        genreAllowed(c) &&
        decadeAllowed(c) &&
        playlistAllowed(c) &&
        (mode !== 'timeline' || !triviaOnlySet.has(c.category))
    );
  }, [blockedCards, mode, settings.decades, settings.genres, settings.playlists]);
  const filteredDeck = useMemo(
    () => {
      void deckKey; // force recompute when deckKey changes (restart)
      return buildWeightedDeck(playableCards, modeSettings, FALLBACK_PLAYLIST_ID, allowedCategoriesForMode);
    },
    [allowedCategoriesForMode, modeSettings, playableCards, deckKey]
  );
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState<TimerState>({ secondsLeft: settings.timerSeconds, running: false });
  const [blackedOut, setBlackedOut] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  // Start with auth prompt open; will be hidden immediately if session is already valid.
  const [needsSpotifyAuth, setNeedsSpotifyAuth] = useState<boolean>(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
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
    const deck = buildWeightedDeck(cards, stored, FALLBACK_PLAYLIST_ID, availableCategories);
    setTimerForCard(stored.timerSeconds, deck[0]);
    setIndex(0);
  }, [availableCategories, defaults, setTimerForCard]);

  useEffect(() => {
    if (startFlag && preselectedMode) {
      setMode(preselectedMode);
    }
  }, [preselectedMode, startFlag]);

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
    setPlaybackError(null);
  }, [filteredDeck, index, settings.timerSeconds, setTimerForCard]);

  const rememberBlocked = useCallback((set: Set<string>) => {
    localStorage.setItem('blockedCards', JSON.stringify(Array.from(set)));
  }, []);

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
      setShowSolution(true);
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
    if (!showSolution) {
      setShowSolution(true);
      setTimer((prev) => ({ ...prev, running: false }));
      setBlackedOut(false);
      return;
    }

    mediaRef.current?.stop();
    if (index < filteredDeck.length - 1) {
      setIndex((i) => i + 1);
      setShowSolution(false);
    } else {
      setBlackedOut(false);
      setTimer({ secondsLeft: 0, running: false });
      setShowSolution(false);
    }
  }, [filteredDeck.length, index, showSolution]);

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

  const handlePlaybackError = useCallback(
    (_id: string, _reason?: string) => {
      setPlaybackError('Abspielen fehlgeschlagen. Bitte erneut versuchen oder zur nächsten Frage springen.');
      setTimer((prev) => ({ ...prev, running: false }));
      setBlackedOut(false);
    },
    []
  );

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

  const restartGame = useCallback(() => {
    const confirmed = window.confirm('Möchtest du das Spiel wirklich neu starten? Dein aktueller Fortschritt geht verloren.');
    if (!confirmed) return;
    setDeckKey((k) => k + 1);
    setIndex(0);
    setBlackedOut(false);
    setShowSolution(false);
    setMode(null);
  }, []);

  if (!card) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 space-y-6 text-center">
        <h1 className="text-3xl font-display">Keine Karten aktiv</h1>
        <p className="text-ink/70">Aktiviere mindestens eine Kategorie und einen Schwierigkeitsgrad in den Einstellungen.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/settings"
            className="rounded-full bg-ink text-inkDark px-4 py-2 text-sm font-semibold"
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
  const playReturnTo = `/play?mode=${mode ?? preselectedMode ?? 'trivia'}&start=1`;

  // Timer color classes based on time left
  const getTimerColorClass = () => {
    if (timer.secondsLeft <= 10) return 'timer-danger';
    if (timer.secondsLeft <= 30) return 'timer-warning';
    return 'timer-normal';
  };

  if (!mode) {
    const goToSettings = (targetMode: GameMode) => {
      const returnTo = `/play?mode=${targetMode}&start=1`;
      router.push(`/settings?mode=${targetMode}&return=${encodeURIComponent(returnTo)}`);
    };

    if (preselectedMode && !startFlag) {
      return (
        <main className="mx-auto max-w-3xl px-5 py-12 space-y-6 text-center">
          <h1 className="text-3xl font-display">Einstellungen vor dem Start</h1>
          <p className="text-ink/70">Bitte zuerst die {preselectedMode === 'timeline' ? 'Timeline' : 'Trivia'}-Einstellungen abschließen.</p>
          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-full bg-ink text-inkDark px-5 py-3 text-sm font-semibold"
              onClick={() => goToSettings(preselectedMode)}
            >
              Zu den Einstellungen
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-3xl px-5 py-12 space-y-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-display">Modus wählen</h1>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12">
          <button
            type="button"
            className={`rounded-2xl border-2 px-6 sm:px-8 py-6 sm:py-8 transition-all transform active:scale-95 sm:hover:scale-105 ${
              selectedMode === 'timeline'
                ? 'bg-ink text-inkDark border-ink shadow-lg'
                : 'border-ink/30 hover:border-ink/60 hover:bg-sand/5'
            }`}
            onClick={() => setSelectedMode('timeline')}
          >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">⏳</div>
            <div className="text-lg sm:text-xl font-semibold">Timeline</div>
            <div className="text-xs opacity-60 mt-1 sm:mt-2">Ereignisse zeitlich ordnen</div>
          </button>
          <button
            type="button"
            className={`rounded-2xl border-2 px-6 sm:px-8 py-6 sm:py-8 transition-all transform active:scale-95 sm:hover:scale-105 ${
              selectedMode === 'trivia'
                ? 'bg-ink text-inkDark border-ink shadow-lg'
                : 'border-ink/30 hover:border-ink/60 hover:bg-sand/5'
            }`}
            onClick={() => setSelectedMode('trivia')}
          >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🧠</div>
            <div className="text-lg sm:text-xl font-semibold">Trivia</div>
            <div className="text-xs opacity-60 mt-1 sm:mt-2">Wissen testen</div>
          </button>
        </div>

        {selectedMode && (
          <div className="card-surface rounded-2xl p-6 mt-8 space-y-4 text-left">
            {selectedMode === 'timeline' && (
              <>
                <h2 className="text-xl font-semibold text-center">Timeline Spielregeln</h2>
                <p className="text-sm text-ink/70">Ziel: 10 Karten in der korrekten zeitlichen Reihenfolge auslegen.</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
                  <li>Jedes Team erhält leere Karten (Front für Lösung, Rückseite für Musterlösung).</li>
                  <li>Reihum zeigt die App eine neue Frage/Medienkarte, Timer 3:00 startet.</li>
                  <li>Team schreibt seine Lösung auf die Karte und legt sie zeitlich ein.</li>
                  <li>Aufdecken/Lösung eintragen: Jahr prüfen. Richtig = behalten, falsch = beiseite.</li>
                  <li>Optional: Flex-Fenster für andere Teams (siehe Flex Buttons).</li>
                  <li>Nächste Runde, bis jemand 10 korrekt liegende Karten hat.</li>
                </ol>
                
                <div className="pt-2 space-y-2">
                  <h3 className="text-md font-semibold">Flex Buttons</h3>
                  <ul className="space-y-1 text-sm text-ink/80">
                    <li>Einsatz: Nachdem das aktive Team seinen Zug beendet hat, darf ein anderes Team einen Flex Button werfen.</li>
                    <li>Treffer: Flex stimmt (Jahr + Titel/Interpret/Zitatgeber/Objekt) = das flexende Team nimmt die zuletzt gespielte Karte.</li>
                    <li>Fehlversuch: Flex stimmt nicht = Flex Button ist verloren.</li>
                    <li>Gewinn: In deinem eigenen Zug bekommst du einen Flex Button, wenn du Jahr richtig einordnest und zusätzlich den Titel/Interpret bzw. Name/Zitatgeber korrekt nennst.</li>
                  </ul>
                </div>
              </>
            )}

            {selectedMode === 'trivia' && (
              <>
                <h2 className="text-xl font-semibold text-center">Trivia Spielregeln</h2>
                <p className="text-sm text-ink/70">
                  Ziel: Aus jeder Kategorie einen „Stein" sammeln. Teams halten auf Papier fest, welche Kategorien sie bereits besitzen.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
                  <li>Ein Team wählt oder „würfelt" eine Kategorie (z. B. zufällig ziehen).</li>
                  <li>Die App zeigt eine Frage aus dieser Kategorie; das Team beantwortet sie.</li>
                  <li>Richtig & Kategorie noch nicht gesammelt: Team notiert den Stein für diese Kategorie.</li>
                  <li>Richtig & Kategorie bereits vorhanden: Das Team darf sofort eine neue Kategorie „würfeln" und weitermachen.</li>
                  <li>Falsch: Zug endet, nächstes Team ist dran.</li>
                  <li>Spielende: Wer zuerst alle Kategorien (alle „Steine") eingesammelt hat, gewinnt.</li>
                </ol>
              </>
            )}

            <div className="flex justify-center pt-4">
              <button
                type="button"
                className="rounded-full bg-ink text-inkDark px-6 py-3 text-sm font-semibold"
                onClick={() => goToSettings(selectedMode)}
              >
                Einstellungen vornehmen & Spiel starten
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-ink/60 truncate">Frage {index + 1} / {filteredDeck.length}</p>
          <h1 className="text-2xl sm:text-3xl font-display truncate">{mode === 'timeline' ? 'Timeline' : 'Trivia'}</h1>
        </div>
        <div className="text-right space-y-1 flex-shrink-0">
          <p className="text-xs text-ink/60">Timer</p>
          <div className={`text-3xl sm:text-4xl font-display tabular-nums ${getTimerColorClass()}`}>{minutes}:{seconds}</div>
        </div>
      </div>

      <section key={`card-${card.id}`} className={`card-surface rounded-2xl p-4 sm:p-5 space-y-3 animate-slide-up ${
        card.category === 'country' && card.sources.image && card.sources.image.includes('outline') 
          ? 'bg-white text-gray-900 [&_*]:text-gray-900 [&_.text-ink]:!text-gray-900 [&_.text-ink\/60]:!text-gray-600 [&_.text-ink\/70]:!text-gray-700 [&_.text-ink\/80]:!text-gray-800' 
          : ''
      }`}>
        {card.category === 'schaetzfragen' && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 animate-pulse">
            <span className="text-xl">🎯</span>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wide">Schätzfrage</p>
              <p className="text-sm font-semibold">ALLE TEAMS SPIELEN MIT!</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-base">
              {(CATEGORY_META[card.category]?.icon) ?? '❓'}
            </span>
            <div className="text-left leading-tight">
              <p className="text-xs uppercase tracking-wide text-ink/60">Kategorie</p>
              <p className="text-sm font-semibold text-ink">{CATEGORY_META[card.category]?.label ?? card.category}</p>
            </div>
          </div>
          <span className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink/80">
            {difficultyLabel(card.difficulty)}
          </span>
        </div>
        {card.category === 'filmeserien' && (
          <p className="text-sm text-ink/70">
            Film/Serie: <span className="font-semibold text-ink">{card.title}</span>
          </p>
        )}
        {card.category === 'country' && (
          <div className="rounded-lg border border-ink/20 bg-ink/5 px-3 py-2 text-ink/90 text-xs">
            <p className="font-semibold">Hinweis:</p>
            <p>Als Datum gilt das Inkrafttreten der aktuellen Verfassung oder der Zeitpunkt des letzten systemischen Bruchs (z. B. Ende einer Monarchie, Ende einer Besatzung oder Neugründung).</p>
          </div>
        )}
        <p className="text-base sm:text-lg font-semibold text-ink">{mode === 'timeline' ? card.cue : card.cue || triviaCue(card)}</p>
        <MediaEmbed
          ref={mediaRef}
          card={card}
          preference={card.category === 'music' && card.sources.spotify ? 'spotify' : 'auto'}
          concealMetadata
          onPlay={handleMediaPlay}
          onPlaybackError={handlePlaybackError}
        />
        {showSolution && (
          <div className="rounded-xl bg-ink/5 p-3 sm:p-4 space-y-2 text-sm text-ink/80 animate-flip-in">
            <p className="font-semibold text-ink">Lösung</p>
            <p className="text-ink">{mode === 'timeline' ? `${card.year} – ${card.answer}` : card.answer}</p>
          </div>
        )}
      </section>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 pb-4 sm:pb-0">
        <button
          type="button"
          className="rounded-full bg-ink text-inkDark px-4 py-3 text-sm font-semibold w-full sm:flex-1 text-center smooth-transition hover:scale-[1.02] active:scale-[0.98]"
          onClick={nextCard}
        >
          {isLast ? 'Fertig' : showSolution ? 'Zur nächsten Frage →' : 'Lösung anzeigen'}
        </button>
        <button
          type="button"
          className="rounded-full border border-ink/20 px-4 py-3 text-sm w-full sm:w-auto text-center smooth-transition hover:bg-ink/5"
          onClick={restartGame}
        >
          ↻ Neu starten
        </button>
        <button
          type="button"
          className="rounded-full border border-red-400 text-red-200 px-4 py-3 text-sm w-full sm:w-auto text-center smooth-transition hover:bg-red-400/10"
          onClick={endGame}
        >
          ✕ Beenden
        </button>
      </div>

      {playbackError && (
        <div className="rounded-xl bg-red-50 text-red-800 p-3 text-sm border border-red-200">
          {playbackError}
        </div>
      )}

      {blackedOut && (
        <div className="fixed inset-0 z-40 bg-black text-white flex flex-col items-center justify-center gap-4 px-4 animate-slide-up">
          <p className="text-xl sm:text-2xl font-semibold">⏰ Zeit abgelaufen</p>
          {showSolution && (
            <div className="rounded-lg bg-white/10 px-4 py-3 text-sm max-w-md w-full animate-flip-in">
              <p className="font-semibold">Lösung</p>
              <p>{card.year} – {card.answer}</p>
            </div>
          )}
          <button
            type="button"
            className="rounded-full bg-white text-ink px-6 py-3 text-sm font-semibold smooth-transition hover:scale-105 active:scale-95"
            onClick={nextCard}
          >
            {isLast ? 'Fertig' : showSolution ? 'Zur nächsten Frage →' : 'Lösung anzeigen'}
          </button>
        </div>
      )}

      {needsSpotifyAuth && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/90 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-ink/10 p-6 space-y-4 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-semibold">
              Premium benötigt
            </div>
            <h2 className="text-2xl font-semibold text-black">Mit Spotify Premium verbinden</h2>
            <p className="text-sm text-black">
              Vor dem Start bitte mit deinem Spotify-Premium-Account anmelden, damit die Songs ohne Werbung und in voller Länge abgespielt werden können.
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <a
                href={`/api/spotify/authorize?return=${encodeURIComponent(playReturnTo)}`}
                className="rounded-full bg-[#1DB954] hover:bg-[#17a74a] text-white px-5 py-2.5 text-sm font-semibold shadow-md transition-colors"
              >
                Spotify-Login starten
              </a>
              <button
                type="button"
                className="rounded-full border border-ink/20 text-inkDark px-4 py-2.5 text-sm hover:bg-ink/5"
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

export default function PlayPage() {
  return (
    <Suspense>
      <PlayPageContent />
    </Suspense>
  );
}
