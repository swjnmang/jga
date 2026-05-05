"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cards, getCategories } from '@/lib/cards';
import { MediaEmbed, MediaEmbedHandle } from '@/components/MediaEmbed';
import { getDefaultSettings, loadSettings, toDecadeTag, TRIVIA_ONLY_CATEGORIES, UserSettings } from '@/lib/userSettings';
import { Card, CardCategory, DecadeTag, Difficulty, GenreTag } from '@/lib/types';
import { getMultipleChoiceOptions } from '@/lib/multipleChoice';

// Menu Component für Spielmodus-Auswahl
function PlayMenuContent() {
  return (
    <main className="min-h-screen bg-grid flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl bg-glass border border-white/20 shadow-2xl backdrop-blur-xl p-10 md:p-14 space-y-10 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white leading-tight">
            Spielmodus wählen
          </h1>
          <p className="text-lg text-white/80">
            Wie möchtest du spielen?
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ModeCard 
            href="/app-settings?mode=solo&return=%2Fplay%3Fmode%3Dsolo%26start%3D1"
            label="Solo Modus"
            icon="🎮"
            description="Trainiere allein"
            disabled
          />
          <ModeCard 
            href="/multiplayer?gameMode=timeline"
            label="Timeline Multiplayer"
            icon="📅"
            description="Mit Freunden spielen"
          />
          <ModeCard 
            href="/multiplayer?gameMode=trivia"
            label="Trivia Multiplayer"
            icon="🎯"
            description="Klassisches Quiz"
          />
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="text-white/70 hover:text-white text-sm font-semibold transition"
          >
            ← Zurück zum Hauptmenü
          </Link>
        </div>
      </div>
    </main>
  );
}

function ModeCard({ href, label, icon, description, disabled }: { href: string; label: string; icon: string; description: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="inline-flex flex-col items-center justify-center rounded-2xl border border-white/15 text-white/40 font-semibold px-6 py-6 bg-white/5 backdrop-blur gap-3 cursor-not-allowed opacity-50">
        <span className="text-4xl">{icon}</span>
        <span className="text-lg">{label}</span>
        <span className="text-xs">Demnächst verfügbar</span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="group inline-flex flex-col items-center justify-center rounded-2xl border border-white/30 text-white font-semibold px-6 py-6 bg-white/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20 gap-3"
    >
      <span className="text-4xl">{icon}</span>
      <span className="text-lg">{label}</span>
      <span className="text-xs text-white/60">{description}</span>
    </Link>
  );
}

// Quiz Content Component
function PlayMenuWrapper() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  // If no mode is specified, show the menu
  if (!mode) {
    return <PlayMenuContent />;
  }

  // Otherwise show the quiz
  return <QuizContent />;
}

const FALLBACK_PLAYLIST_ID = 'imported-playlist';
const METRIC_STORAGE_KEY = 'quizMetrics';
const METRIC_FLAGS_KEY = 'quizMetricFlags';
const SESSION_SEEN_KEY = 'sessionSeenCardIds';

type QuizMetric = {
  cardId: string;
  category: CardCategory;
  difficulty: Difficulty;
  mode: GameMode | null;
  correct: boolean | null;
  timeMs: number;
  timerSeconds: number;
  reason: 'answer' | 'timeout' | 'reveal';
  timestamp: number;
};

type QuizMetricFlags = Record<string, { attempts: number; correct: number; flag: 'too-hard' | 'too-easy' | 'outlier' | null }>;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickBalancedOptionOrder(options: string[], correctIndex: number): { options: string[]; correctIndex: number } {
  if (options.length === 0) return { options, correctIndex };
  const lengths = options.map((o) => o.length);
  const sortedLen = [...lengths].sort((a, b) => a - b);
  const mid = Math.floor(sortedLen.length / 2);
  const median = sortedLen.length % 2 === 0 ? (sortedLen[mid - 1] + sortedLen[mid]) / 2 : sortedLen[mid];

  const orderedIndices = options
    .map((opt, idx) => ({ idx, delta: Math.abs(opt.length - median) }))
    .sort((a, b) => a.delta - b.delta)
    .map((item) => item.idx);

  // Random rotate to keep unpredictability
  const rotation = Math.floor(Math.random() * options.length);
  const rotated = orderedIndices.map((_, i) => orderedIndices[(i + rotation) % orderedIndices.length]);

  const balanced = rotated.map((idx) => options[idx]);
  const newCorrectIndex = rotated.indexOf(correctIndex);
  return { options: balanced, correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : correctIndex };
}

function loadSessionSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const raw = sessionStorage.getItem(SESSION_SEEN_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch (_err) {
    return new Set();
  }
}

function persistSessionSeen(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_SEEN_KEY, JSON.stringify(Array.from(ids)));
}

function loadMetrics(): QuizMetric[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(METRIC_STORAGE_KEY) || '[]') as QuizMetric[];
  } catch (_err) {
    return [];
  }
}

function saveMetrics(data: QuizMetric[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(METRIC_STORAGE_KEY, JSON.stringify(data.slice(-200)));
}

function saveMetricFlags(flags: QuizMetricFlags) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(METRIC_FLAGS_KEY, JSON.stringify(flags));
}

function updateMetricFlags(metrics: QuizMetric[]) {
  const flags: QuizMetricFlags = {};
  const grouped = new Map<string, QuizMetric[]>();
  metrics.forEach((m) => {
    const list = grouped.get(m.cardId) ?? [];
    list.push(m);
    grouped.set(m.cardId, list);
  });

  grouped.forEach((list, cardId) => {
    const attempts = list.length;
    const correct = list.filter((m) => m.correct === true).length;
    const p = attempts > 0 ? correct / attempts : 0;
    let flag: QuizMetricFlags[string]['flag'] = null;
    if (attempts >= 5 && p < 0.2) flag = 'too-hard';
    if (attempts >= 5 && p > 0.95) flag = 'too-easy';
    const slowOutliers = list.some((m) => m.timeMs > (m.timerSeconds + 15) * 1000);
    if (!flag && slowOutliers) flag = 'outlier';
    flags[cardId] = { attempts, correct, flag };
  });

  saveMetricFlags(flags);
}

type TimerState = {
  secondsLeft: number;
  running: boolean;
};

type GameMode = 'timeline' | 'trivia' | 'solo';

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
  flag: { label: 'Länder/Flaggen', icon: '🏳️' },
  outline: { label: 'Umrisse', icon: '⬜' },
  video: { label: 'Video', icon: '🎬' },
  sportfreizeit: { label: 'Sport & Freizeit', icon: '🏆' },
  religionglaube: { label: 'Religion & Glaube', icon: '✝️' },
  geogeschichte: { label: 'Geographie & Geschichte', icon: '🌍' },
  natur: { label: 'Natur & Technik', icon: '🔬' },
  filmserien: { label: 'Filme & Serien', icon: '🎞️' },
  schaetzfragen: { label: 'Schätzfragen', icon: '🎯' }
};

function triviaCue(card: Card): string {
  switch (card.category) {
    case 'music':
      return 'Wer ist der Artist oder wie heißt der Song?';
    case 'quote':
      return 'Woher stammt das nachfolgende Zitat (Filme, Lieder, Personen)?';
    case 'image':
      return 'Was bzw. welches Ereignis ist auf dem Bild?';
    case 'flag':
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

  const drawCategory = (availableCats: CardCategory[], prevCat: CardCategory | null) => {
    const weights = availableCats.map((cat) => Math.max(0, settings.categoryWeights[cat] ?? 0));
    const total = weights.reduce((a, b) => a + b, 0);
    const norm = total > 0 ? total : availableCats.length;
    let r = Math.random() * norm;
    for (let i = 0; i < availableCats.length; i += 1) {
      const w = total > 0 ? weights[i] : 1;
      const cat = availableCats[i];
      if (r <= w) {
        if (cat !== prevCat || availableCats.length === 1) return cat;
        // try a different category to improve rotation
        const alt = availableCats.find((c) => c !== prevCat);
        return alt ?? cat;
      }
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
    const prevCat = deck.length > 0 ? deck[deck.length - 1].category : null;
    const chosen = drawCategory(availableCats, prevCat);
    const list = buckets.get(chosen);
    const card = list?.pop();
    if (card) deck.push(card);
  }

  return deck;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeQuery = searchParams.get('mode');
  const startQuery = searchParams.get('start');
  const preselectedMode: GameMode | null = modeQuery === 'timeline' || modeQuery === 'trivia' || modeQuery === 'solo' ? modeQuery : null;
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
  const [sessionSeen, setSessionSeen] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<GameMode | null>(preselectedMode && startFlag ? preselectedMode : null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  
  // Digital Timeline Mode states
  const [showGroupSetup, setShowGroupSetup] = useState(false);
  const [numGroups, setNumGroups] = useState(2);
  const [groupNames, setGroupNames] = useState<string[]>(['Gruppe 1', 'Gruppe 2']);
  const [digitalTimelineStarted, setDigitalTimelineStarted] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [groupTimelines, setGroupTimelines] = useState<Map<number, { year: number; answer: string }[]>>(new Map());
  const [timelinePlacementCorrect, setTimelinePlacementCorrect] = useState<boolean | null>(null);
  
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
    const base = cards.filter(
      (c) =>
        c.category !== 'video' &&
        !blockedCards.has(c.id) &&
        genreAllowed(c) &&
        decadeAllowed(c) &&
        playlistAllowed(c) &&
        (mode !== 'timeline' || !triviaOnlySet.has(c.category))
    );
    const unseen = base.filter((c) => !sessionSeen.has(c.id));
    return unseen.length > 0 ? unseen : base;
  }, [blockedCards, mode, sessionSeen, settings.decades, settings.genres, settings.playlists]);

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
  // Multiple choice state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [mcOptions, setMcOptions] = useState<{ options: string[]; correctIndex: number } | null>(null);
  const mcCacheRef = useRef<Map<number, { options: string[]; correctIndex: number }>>(new Map());
  // Solo mode scoring
  const [score, setScore] = useState(0);
  // Start with auth prompt open; will be hidden immediately if session is already valid.
  const [needsSpotifyAuth, setNeedsSpotifyAuth] = useState<boolean>(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const mediaRef = useRef<MediaEmbedHandle | null>(null);
  const cardStartRef = useRef<number>(0);
  const loggedRef = useRef(false);
  const offlineRef = useRef<boolean>(false);
  const card = filteredDeck[index];
  const isLast = index === filteredDeck.length - 1;

  const logMetric = useCallback(
    (reason: QuizMetric['reason']) => {
      const current = filteredDeck[index];
      if (!current) return;
      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - cardStartRef.current;
      const metrics = loadMetrics();
      const correct = mcOptions && selectedAnswer !== null ? selectedAnswer === mcOptions.correctIndex : null;
      metrics.push({
        cardId: current.id,
        category: current.category,
        difficulty: current.difficulty,
        mode,
        correct,
        timeMs: Math.max(0, elapsed),
        timerSeconds: settings.timerSeconds,
        reason,
        timestamp: Date.now()
      });
      saveMetrics(metrics);
      updateMetricFlags(metrics);
      loggedRef.current = true;
    },
    [filteredDeck, index, mcOptions, mode, selectedAnswer, settings.timerSeconds]
  );

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
    setSessionSeen(loadSessionSeen());
    const deck = buildWeightedDeck(cards, stored, FALLBACK_PLAYLIST_ID, availableCategories);
    setTimerForCard(stored.timerSeconds, deck[0]);
    setIndex(0);
  }, [availableCategories, defaults, setTimerForCard]);

  useEffect(() => {
    if (startFlag && preselectedMode) {
      setMode(preselectedMode);
      // Check if digital timeline mode is enabled - then show group setup
      const stored = loadSettings(defaults);
      if (preselectedMode === 'timeline' && stored.digitalTimelineMode) {
        setShowGroupSetup(true);
      }
    }
  }, [preselectedMode, startFlag, defaults]);

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
    setSelectedAnswer(null);
    loggedRef.current = false;
    cardStartRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    // Generate multiple choice options if enabled
    if (settings.multipleChoice && current) {
      const cached = mcCacheRef.current.get(index);
      if (cached) {
        setMcOptions(cached);
      } else {
        const base = getMultipleChoiceOptions(current);
        const balanced = pickBalancedOptionOrder(base.options, base.correctIndex);
        mcCacheRef.current.set(index, balanced);
        setMcOptions(balanced);
      }
      // Preload next card options
      const nextCard = filteredDeck[index + 1];
      if (nextCard && settings.multipleChoice) {
        const baseNext = getMultipleChoiceOptions(nextCard);
        mcCacheRef.current.set(index + 1, pickBalancedOptionOrder(baseNext.options, baseNext.correctIndex));
      }
    } else {
      setMcOptions(null);
    }
  }, [filteredDeck, index, settings.timerSeconds, settings.multipleChoice, setTimerForCard]);

  useEffect(() => {
    const current = filteredDeck[index];
    if (!current) return;
    setSessionSeen((prev) => {
      if (prev.has(current.id)) return prev;
      const next = new Set(prev);
      next.add(current.id);
      persistSessionSeen(next);
      return next;
    });
  }, [filteredDeck, index]);

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
    if (!showSolution || loggedRef.current) return;
    const reason: QuizMetric['reason'] = timer.secondsLeft === 0 ? 'timeout' : selectedAnswer !== null ? 'answer' : 'reveal';
    logMetric(reason);
  }, [logMetric, selectedAnswer, showSolution, timer.secondsLeft]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOffline = () => {
      offlineRef.current = true;
      setPlaybackError('Offline erkannt – Medienwiedergabe und API-Calls können eingeschränkt sein.');
    };
    const onOnline = () => {
      offlineRef.current = false;
      setPlaybackError(null);
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
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

  const handleMultipleChoiceAnswer = useCallback((answerIndex: number, correctIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowSolution(true);
    setTimer((prev) => ({ ...prev, running: false }));
    
    // Award points in solo mode for correct answers
    if (mode === 'solo' && answerIndex === correctIndex) {
      setScore((prev) => prev + 1);
    }
  }, [mode]);

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
    setScore(0);
    setMode(null);
    setDigitalTimelineStarted(false);
    setGroupTimelines(new Map());
    setCurrentGroupIndex(0);
  }, []);

  const handleDigitalTimelinePlacement = useCallback((position: number) => {
    if (!card || typeof card.year !== 'number') return;
    
    const currentTimeline = groupTimelines.get(currentGroupIndex) || [];
    
    // Check if placement is correct
    // Position 0 = before all cards
    // Position n = after card n-1 (and before card n if it exists)
    let isCorrect = false;
    
    if (position === 0) {
      // Before all cards
      isCorrect = currentTimeline.length === 0 || card.year <= currentTimeline[0].year;
    } else if (position >= currentTimeline.length) {
      // After all cards
      isCorrect = card.year >= currentTimeline[currentTimeline.length - 1].year;
    } else {
      // Between two cards
      const before = currentTimeline[position - 1];
      const after = currentTimeline[position];
      isCorrect = card.year >= before.year && card.year <= after.year;
    }
    
    setTimelinePlacementCorrect(isCorrect);
    
    if (isCorrect) {
      // Insert card at the correct position
      const newEntry = { year: card.year, answer: card.answer };
      const updated = [...currentTimeline];
      updated.splice(position, 0, newEntry);
      const newTimelines = new Map(groupTimelines);
      newTimelines.set(currentGroupIndex, updated);
      setGroupTimelines(newTimelines);
      setScore((s) => s + 1);
    }
    
    setShowSolution(true);
    setTimer((prev) => ({ ...prev, running: false }));
  }, [card, currentGroupIndex, groupTimelines]);

  // Extract short display name from answer (author/band/artist only)
  const getShortTimelineLabel = useCallback((answer: string): string => {
    if (answer === 'Referenzjahr') return 'Referenzjahr';
    
    // For music: extract artist before "—" or before first "."
    const dashMatch = answer.match(/^([^—]+)—/);
    if (dashMatch) return dashMatch[1].trim();
    
    // For quotes: extract name before comma or first period
    const commaMatch = answer.match(/^([^,\.]+)/);
    if (commaMatch) return commaMatch[1].trim();
    
    // Fallback: take first 30 chars
    return answer.substring(0, 30);
  }, []);

  const nextDigitalTimelineCard = useCallback(() => {
    mediaRef.current?.stop();
    setShowSolution(false);
    setTimelinePlacementCorrect(null);
    
    // Move to next group
    const nextGroup = (currentGroupIndex + 1) % numGroups;
    setCurrentGroupIndex(nextGroup);
    
    // Move to next card
    if (index < filteredDeck.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // End game
      setBlackedOut(false);
      setTimer({ secondsLeft: 0, running: false });
    }
  }, [currentGroupIndex, filteredDeck.length, index, numGroups]);

  // Group setup screen for digital timeline mode
  if (showGroupSetup && !digitalTimelineStarted) {
    const startDigitalTimeline = () => {
      // Initialize timelines for each group with 1950 as reference
      const initialTimelines = new Map<number, { year: number; answer: string }[]>();
      for (let i = 0; i < numGroups; i++) {
        initialTimelines.set(i, [{ year: 1950, answer: 'Referenzjahr' }]);
      }
      setGroupTimelines(initialTimelines);
      setDigitalTimelineStarted(true);
      setShowGroupSetup(false);
    };

    return (
      <main className="mx-auto max-w-3xl px-5 py-12 space-y-6">
        <h1 className="text-3xl font-display text-center">Digitaler Timeline-Modus</h1>
        <p className="text-center text-ink/70">Richte dein Gruppenspiel ein</p>

        <section className="card-surface rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">Anzahl der Gruppen</h2>
          <div className="grid grid-cols-3 gap-3">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setNumGroups(n);
                  setGroupNames(Array.from({ length: n }, (_, i) => `Gruppe ${i + 1}`));
                }}
                className={`rounded-xl border-2 px-6 py-4 text-lg font-semibold transition-all ${
                  numGroups === n
                    ? 'bg-ink text-inkDark border-ink'
                    : 'border-ink/20 hover:border-ink/40'
                }`}
              >
                {n} Gruppen
              </button>
            ))}
          </div>
        </section>

        <section className="card-surface rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">Gruppennamen</h2>
          <div className="space-y-3">
            {groupNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-ink/60 w-20">Gruppe {idx + 1}:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const updated = [...groupNames];
                    updated[idx] = e.target.value;
                    setGroupNames(updated);
                  }}
                  className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={`Gruppe ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={startDigitalTimeline}
            className="flex-1 rounded-full bg-ink text-inkDark px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform"
          >
            Spiel starten
          </button>
          <button
            type="button"
            onClick={() => {
              setShowGroupSetup(false);
              setMode(null);
            }}
            className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:bg-ink/5"
          >
            Abbrechen
          </button>
        </div>
      </main>
    );
  }

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
          <p className="text-ink/70">
            Bitte zuerst die {preselectedMode === 'timeline' ? 'Timeline' : preselectedMode === 'solo' ? 'Solo' : 'Trivia'}-Einstellungen abschließen.
          </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 justify-center mt-8 sm:mt-12">
          <button
            type="button"
            className={`rounded-2xl border-2 px-6 sm:px-8 py-6 sm:py-8 transition-all transform active:scale-95 sm:hover:scale-105 ${
              selectedMode === 'timeline'
                ? 'bg-ink text-inkDark border-ink shadow-lg'
                : 'border-ink/30 hover:border-ink/60 hover:bg-sand/5'
            }`}
            onClick={() => setSelectedMode('timeline')}
          >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🔢</div>
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
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🎓</div>
            <div className="text-lg sm:text-xl font-semibold">Trivia</div>
            <div className="text-xs opacity-60 mt-1 sm:mt-2">Wissen testen</div>
          </button>
          <button
            type="button"
            disabled
            className="rounded-2xl border-2 px-6 sm:px-8 py-6 sm:py-8 border-ink/15 opacity-40 cursor-not-allowed relative"
          >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">👤</div>
            <div className="text-lg sm:text-xl font-semibold">Solo</div>
            <div className="text-xs opacity-60 mt-1 sm:mt-2">Demnächst verfügbar</div>
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

            {selectedMode === 'solo' && (
              <>
                <h2 className="text-xl font-semibold text-center">Solo Spielregeln</h2>
                <p className="text-sm text-ink/70">
                  Ziel: Alleine so viele Fragen wie möglich richtig beantworten und Punkte sammeln.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
                  <li>Aktiviere "Multiple-Choice Antworten" in den Einstellungen für automatische Punktezählung.</li>
                  <li>Wähle aus 4 Antwortmöglichkeiten die richtige Antwort.</li>
                  <li>Richtige Antwort = +1 Punkt (grün markiert).</li>
                  <li>Falsche Antwort = 0 Punkte (rot markiert, richtige wird grün gezeigt).</li>
                  <li>Deine Punktzahl wird oben angezeigt und bei jedem Neustart zurückgesetzt.</li>
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
          <h1 className="text-2xl sm:text-3xl font-display truncate">
            {mode === 'timeline' ? 'Timeline' : mode === 'solo' ? 'Solo' : 'Trivia'}
            {mode === 'solo' && settings.multipleChoice && <span className="text-lg ml-3 text-ink/70">• {score} Punkte</span>}
          </h1>
          {digitalTimelineStarted && (
            <p className="text-sm text-ink/70 mt-1">
              Aktuell: <span className="font-semibold text-ink">{groupNames[currentGroupIndex]}</span>
            </p>
          )}
        </div>
        <div className="text-right space-y-1 flex-shrink-0">
          <p className="text-xs text-ink/60">Timer</p>
          <div className={`text-3xl sm:text-4xl font-display tabular-nums ${getTimerColorClass()}`}>{minutes}:{seconds}</div>
        </div>
      </div>

      {digitalTimelineStarted && (
        <section className="card-surface rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">Timelines der Gruppen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: numGroups }).map((_, idx) => {
              const timeline = groupTimelines.get(idx) || [];
              return (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-3 ${
                    idx === currentGroupIndex ? 'border-ink bg-ink/5' : 'border-ink/20'
                  }`}
                >
                  <p className="text-xs font-semibold text-ink/60 mb-2">{groupNames[idx]}</p>
                  <p className="text-sm text-ink">{timeline.length} Karte{timeline.length !== 1 ? 'n' : ''}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section key={`card-${card.id}`} className="card-surface rounded-2xl p-4 sm:p-5 space-y-3 animate-slide-up">
        {card.category === 'schaetzfragen' && mode !== 'solo' && (
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
        {card.category === 'filmserien' && (
          <p className="text-sm text-ink/70">
            Film/Serie: <span className="font-semibold text-ink">{card.title}</span>
          </p>
        )}
        {card.category === 'flag' && (
          <div className="rounded-lg border border-blue-300 bg-blue-100 px-3 py-2 text-blue-900 text-xs">
            <p className="font-semibold">Hinweis:</p>
            <p>Als Datum gilt das Inkrafttreten der aktuellen Verfassung oder der Zeitpunkt des letzten systemischen Bruchs (z. B. Ende einer Monarchie, Ende einer Besatzung oder Neugründung).</p>
          </div>
        )}
        <p className="text-base sm:text-lg font-semibold text-ink">{mode === 'timeline' && card.category === 'quote' ? 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?' : mode === 'timeline' ? card.cue : card.cue || triviaCue(card)}</p>
        <MediaEmbed
          ref={mediaRef}
          card={card}
          preference={card.category === 'music' && card.sources.spotify ? 'spotify' : 'auto'}
          concealMetadata
          onPlay={handleMediaPlay}
          onPlaybackError={handlePlaybackError}
        />
        
        {settings.multipleChoice && mcOptions && !showSolution && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {mcOptions.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleMultipleChoiceAnswer(idx, mcOptions.correctIndex)}
                className="rounded-xl border-2 border-ink/20 px-4 py-3 text-sm text-left hover:border-ink/40 hover:bg-ink/5 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {settings.multipleChoice && mcOptions && showSolution && selectedAnswer !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {mcOptions.options.map((option, idx) => {
              const isCorrect = idx === mcOptions.correctIndex;
              const isSelected = idx === selectedAnswer;
              const bgColor = isCorrect 
                ? 'bg-green-100 border-green-500 text-green-900' 
                : isSelected 
                  ? 'bg-red-100 border-red-500 text-red-900'
                  : 'bg-gray-50 border-gray-300 text-gray-500';
              
              return (
                <div
                  key={idx}
                  className={`rounded-xl border-2 px-4 py-3 text-sm ${bgColor} transition-all animate-flip-in`}
                >
                  {isCorrect && '✓ '}
                  {isSelected && !isCorrect && '✗ '}
                  {option}
                </div>
              );
            })}
          </div>
        )}

        {showSolution && (
          <div className="rounded-xl bg-ink/5 p-3 sm:p-4 space-y-2 text-sm text-ink/80 animate-flip-in">
            <p className="font-semibold text-ink">Lösung</p>
            <p className="text-ink">{mode === 'timeline' ? `${card.year} – ${card.answer}` : card.answer}</p>
          </div>
        )}
      </section>

      {digitalTimelineStarted && !showSolution && (
        <div className="card-surface rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-center">Platziere die Karte in der Timeline von {groupNames[currentGroupIndex]}</h3>
          
          {(() => {
            const currentTimeline = groupTimelines.get(currentGroupIndex) || [];
            
            // If no cards yet, show simple before/after 1950
            if (currentTimeline.length === 0) {
              return (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 text-white px-6 py-4 text-sm font-semibold hover:bg-blue-700 transition-colors"
                    onClick={() => handleDigitalTimelinePlacement(0)}
                  >
                    ← Vor 1950
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-green-600 text-white px-6 py-4 text-sm font-semibold hover:bg-green-700 transition-colors"
                    onClick={() => handleDigitalTimelinePlacement(1)}
                  >
                    Nach 1950 →
                  </button>
                </div>
              );
            }
            
            // Show timeline with gaps for placement
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {currentTimeline.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      {idx === 0 && (
                        <button
                          type="button"
                          onClick={() => handleDigitalTimelinePlacement(0)}
                          className="flex-shrink-0 rounded-lg border-2 border-dashed border-ink/30 bg-ink/5 px-3 py-2 text-xs hover:border-ink hover:bg-ink/10 transition-colors mx-1"
                        >
                          ← Davor
                        </button>
                      )}
                      <div className="flex-shrink-0 rounded-lg border-2 border-ink bg-ink/10 px-4 py-3 min-w-[120px]">
                        <p className="text-xs font-bold text-ink">{item.year}</p>
                        <p className="text-xs text-ink/70 truncate">{getShortTimelineLabel(item.answer)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDigitalTimelinePlacement(idx + 1)}
                        className="flex-shrink-0 rounded-lg border-2 border-dashed border-ink/30 bg-ink/5 px-3 py-2 text-xs hover:border-ink hover:bg-ink/10 transition-colors mx-1"
                      >
                        {idx === currentTimeline.length - 1 ? 'Danach →' : '↔'}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center text-ink/60">
                  Wähle eine Lücke, um die neue Karte zu platzieren
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {digitalTimelineStarted && showSolution && (
        <>
          <div className={`rounded-xl p-4 text-center animate-flip-in ${
            timelinePlacementCorrect
              ? 'bg-green-500/20 border-2 border-green-500'
              : 'bg-red-500/20 border-2 border-red-500'
          }`}>
            <p className={`text-lg font-bold ${
              timelinePlacementCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {timelinePlacementCorrect ? '✓ Richtig!' : '✗ Falsch!'}
            </p>
            <p className="text-sm mt-1 text-ink/80">
              {timelinePlacementCorrect
                ? 'Die Karte wurde korrekt eingeordnet.'
                : 'Die Karte wurde falsch platziert.'}
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-full bg-ink text-inkDark px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform"
            onClick={nextDigitalTimelineCard}
          >
            Nächste Gruppe: {groupNames[(currentGroupIndex + 1) % numGroups]}
          </button>
        </>
      )}

      {!digitalTimelineStarted && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 pb-4 sm:pb-0">
          {(!settings.multipleChoice || showSolution) && (
            <button
              type="button"
              className="rounded-full bg-ink text-black px-4 py-3 text-sm font-semibold w-full sm:flex-1 text-center smooth-transition hover:scale-[1.02] active:scale-[0.98]"
              onClick={nextCard}
            >
              {isLast ? 'Fertig' : showSolution ? 'Zur nächsten Frage →' : 'Lösung anzeigen'}
            </button>
          )}
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
      )}

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
      <PlayMenuWrapper />
    </Suspense>
  );
}
