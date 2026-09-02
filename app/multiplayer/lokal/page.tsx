'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/lib/types';
import { GROUP_COLORS, HighscoreEntry } from '@/lib/multiplayerTypes';
import {
  TRIVIA_LOCAL_SETUP_KEY,
  TRIVIA_LOCAL_GAME_KEY,
  TriviaLocalSetupPayload,
} from '@/lib/triviaLocalTypes';
import {
  NextTurnResult,
  computeNextTurn,
  maybeInjectSchaetzfrage,
  pickCardRespectingDifficulty,
} from '@/lib/triviaEngine';
import {
  recordLocalHighscore,
  extractNumericFromAnswer,
  extractRangeFromAnswer,
  extractUnitFromAnswer,
  parseGuessNumber,
} from '@/lib/multiplayerService';
import { catIcon, catLabel as catLabelMeta, catLabelWithIcon } from '@/lib/categoryMeta';
import { MediaEmbed } from '@/components/MediaEmbed';

const MIN_GROUPS = 2;
const MAX_GROUPS = 8;

type Phase = 'groups' | 'banning' | 'playing' | 'schaetz' | 'finished';

interface LocalGroup {
  id: string;
  name: string;
  color: string;
  score: number;
  completedCategories: string[];
  // Fehlversuche pro Kategorie (kumulativ). Ab 3 wird die nächste Frage dieser
  // Kategorie für diese Gruppe auf Schwierigkeit "leicht" gezogen (Frust-Vermeidung).
  categoryFails: Record<string, number>;
  jokers: { newQuestion: boolean; next: boolean; dice: boolean };
}

interface SchaetzInjectedNext {
  nextCardId: string | null;
  nextGroupId: string;
  currentRoundCategory: string;
  categoryRoundQueue: string[];
  categoryGroupQueue: string[];
}

interface SchaetzResult {
  answer: string;
  winnerIds: string[];
  submissions: { groupId: string; groupName: string; value: string; isWinner: boolean; color: string }[];
}

interface LocalGame {
  cardsById: Record<string, Card>;
  deckMeta: Record<string, string>;
  difficultyMeta: Record<string, string>;
  triviaCategories: string[];
  bannedCategories: string[];
  banOrder: string[];
  banIndex: number;
  groups: LocalGroup[];
  availableDeck: string[];
  currentCardId: string | null;
  currentCardIndex: number;
  currentTurnGroupId: string | null;
  currentRoundCategory: string;
  categoryRoundQueue: string[];
  categoryGroupQueue: string[];
  triviaSchaetzCounter: number;
  schaetzInjected: boolean;
  schaetzInjectedNext: SchaetzInjectedNext | null;
  jokerNextActive: boolean;
  jokerNextOriginGroupId: string | null;
  jokerNextTargetGroupId: string | null;
  jokerDicePending: boolean;
  jokerDiceResult: number | null;
  jokerDiceGroupId: string | null;
  schaetzCollectingIndex: number;
  schaetzSubmissions: Record<string, string>;
  schaetzResult: SchaetzResult | null;
  pendingTextAnswer: { groupId: string; text: string } | null;
  winnerGroupIds: string[] | null;
}

interface PersistedState {
  setupPayload: TriviaLocalSetupPayload;
  phase: Phase;
  groupCount: number;
  groupNames: string[];
  game: LocalGame | null;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Cue für Trivia anpassen (Umriss/Flagge/Musik/Zitat brauchen eine feste Frage statt
// der rohen `cue`) — identische Logik wie im Firebase-Mehrgeräte-Modus.
function triviaDisplayCue(card: Card): string {
  if (card.category === 'outline') return 'Zu welchem Land gehört dieser Umriss?';
  if (card.category === 'flag') return 'Zu welchem Land gehört diese Flagge?';
  if (card.category === 'music') return 'Von wem ist der Song und wie heißt er?';
  if (card.category === 'quote') return 'Woher stammt das nachfolgende Zitat (Filme, Lieder, Personen)?';
  return card.cue;
}

function quoteSourceBadge(card: Card | null | undefined) {
  if (!card || card.category !== 'quote' || !card.quoteSourceType) return null;
  const meta = ({
    film: { label: 'Film', icon: '🎬' },
    lied: { label: 'Lied', icon: '🎵' },
    person: { label: 'Person', icon: '🗣️' },
  } as Record<string, { label: string; icon: string }>)[card.quoteSourceType];
  if (!meta) return null;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold">
      {meta.icon} {meta.label}
    </span>
  );
}

// Ersten Zug (Kategorie + Karte) für eine frische bzw. nach dem Ban-Modus gefilterte
// Kategorienliste bestimmen — identische Logik wie `startGame`/`banCategory` in
// lib/multiplayerService.ts, nur synchron statt als Firebase-Update.
function computeFirstTurn(
  categories: string[],
  availableDeck: string[],
  deckMeta: Record<string, string>,
  groupIds: string[]
): { shuffledCats: string[]; firstCat: string; firstCardId: string | null; catQueueStart: string[] } {
  const shuffledCats = shuffle(categories);
  let firstCat = '';
  let firstCardId: string | null = null;
  let catQueueStart: string[] = [];
  for (let i = 0; i < shuffledCats.length; i++) {
    const matches = availableDeck.filter((id) => deckMeta[id] === shuffledCats[i]);
    if (matches.length > 0) {
      firstCat = shuffledCats[i];
      firstCardId = matches[Math.floor(Math.random() * matches.length)];
      catQueueStart = shuffledCats.slice(i + 1);
      break;
    }
  }
  if (!firstCardId) firstCardId = availableDeck[0] ?? null;
  void groupIds;
  return { shuffledCats, firstCat, firstCardId, catQueueStart };
}

function winnersByMaxCategoryCount(groups: LocalGroup[]): string[] {
  const max = Math.max(...groups.map((g) => g.completedCategories.length));
  return groups.filter((g) => g.completedCategories.length === max).map((g) => g.id);
}

function winnersByMaxScore(groups: LocalGroup[]): string[] {
  const max = Math.max(...groups.map((g) => g.score));
  return groups.filter((g) => g.score === max).map((g) => g.id);
}

// groupCategoryFails-Map für computeNextTurn bauen, optional mit einem aktualisierten
// Wert für eine Gruppe/Kategorie (z.B. nach einer soeben beantworteten Frage).
function buildGroupCategoryFails(
  groups: LocalGroup[],
  override?: { groupId: string; category: string; value: number }
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  groups.forEach((g) => {
    result[g.id] =
      override && g.id === override.groupId
        ? { ...g.categoryFails, [override.category]: override.value }
        : g.categoryFails;
  });
  return result;
}

export default function TriviaLokalPage() {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [setupPayload, setSetupPayload] = useState<TriviaLocalSetupPayload | null>(null);
  const [missingSetup, setMissingSetup] = useState(false);

  const [phase, setPhase] = useState<Phase>('groups');
  const [groupCount, setGroupCount] = useState(3);
  const [groupNames, setGroupNames] = useState<string[]>(['Gruppe 1', 'Gruppe 2', 'Gruppe 3']);
  const [game, setGame] = useState<LocalGame | null>(null);

  // Ephemere UI-State (nicht persistiert, ergibt sich pro Frage/Zug neu)
  const [showAnswer, setShowAnswer] = useState(false);
  const [textAnswerInput, setTextAnswerInput] = useState('');
  const [schaetzInput, setSchaetzInput] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const highscoreWritten = useRef(false);

  // Gespeicherten Spielstand laden bzw. frisches Setup vom Assistenten übernehmen.
  useEffect(() => {
    try {
      const savedGame = window.localStorage.getItem(TRIVIA_LOCAL_GAME_KEY);
      if (savedGame) {
        const parsed = JSON.parse(savedGame) as PersistedState;
        if (parsed.setupPayload) {
          setSetupPayload(parsed.setupPayload);
          setPhase(parsed.phase ?? 'groups');
          if (typeof parsed.groupCount === 'number') setGroupCount(parsed.groupCount);
          if (Array.isArray(parsed.groupNames)) setGroupNames(parsed.groupNames);
          if (parsed.game) {
            // cardsById wird nicht persistiert (verdoppelt sonst das komplette Deck im
            // Storage und sprengt schnell die localStorage-Quota) — aus setupPayload.deck
            // rekonstruieren, das ohnehin schon gespeichert ist.
            const cardsById: Record<string, Card> = {};
            parsed.setupPayload.deck.forEach((c) => {
              cardsById[c.id] = c;
            });
            setGame({ ...parsed.game, cardsById });
          } else {
            setGame(null);
          }
          setHydrated(true);
          return;
        }
      }
      const freshSetup = window.localStorage.getItem(TRIVIA_LOCAL_SETUP_KEY);
      if (freshSetup) {
        const parsed = JSON.parse(freshSetup) as TriviaLocalSetupPayload;
        setSetupPayload(parsed);
        setHydrated(true);
        return;
      }
    } catch {
      // Beschädigter/gesperrter Storage: wie "kein Setup vorhanden" behandeln.
    }
    setMissingSetup(true);
    setHydrated(true);
  }, []);

  // Ohne Setup (z.B. direkter Aufruf dieser Route) zurück zum Assistenten.
  useEffect(() => {
    if (hydrated && missingSetup) {
      router.replace('/multiplayer?gameMode=trivia');
    }
  }, [hydrated, missingSetup, router]);

  // Spielstand nach jeder Änderung sichern.
  useEffect(() => {
    if (!hydrated || !setupPayload) return;
    // cardsById aussparen (siehe Ladeeffekt oben) — sonst verdoppelt sich das komplette
    // Deck im Storage und die localStorage-Quota wird schnell gesprengt.
    const persistedGame: LocalGame | null = game ? { ...game, cardsById: {} } : null;
    const snapshot: PersistedState = { setupPayload, phase, groupCount, groupNames, game: persistedGame };
    try {
      window.localStorage.setItem(TRIVIA_LOCAL_GAME_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage voll/nicht verfügbar: Spiel läuft trotzdem weiter, nur ohne Reload-Schutz.
    }
  }, [hydrated, setupPayload, phase, groupCount, groupNames, game]);

  function updateGroupCount(next: number) {
    const clamped = Math.max(MIN_GROUPS, Math.min(MAX_GROUPS, next));
    setGroupCount(clamped);
    setGroupNames((prev) => {
      const names = [...prev];
      while (names.length < clamped) names.push(`Gruppe ${names.length + 1}`);
      return names.slice(0, clamped);
    });
  }

  function updateGroupName(index: number, name: string) {
    setGroupNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }

  function confirmGroups() {
    if (!setupPayload) return;
    const trimmedNames = groupNames.map((n, i) => n.trim() || `Gruppe ${i + 1}`);
    const groups: LocalGroup[] = trimmedNames.map((name, i) => ({
      id: `group-${i}`,
      name,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
      score: 0,
      completedCategories: [],
      categoryFails: {},
      jokers: { newQuestion: true, next: true, dice: true },
    }));

    const cardsById: Record<string, Card> = {};
    const deckMeta: Record<string, string> = {};
    const difficultyMeta: Record<string, string> = {};
    const catSet = new Set<string>();
    setupPayload.deck.forEach((c) => {
      cardsById[c.id] = c;
      deckMeta[c.id] = c.category;
      difficultyMeta[c.id] = c.difficulty;
      catSet.add(c.category);
    });
    const triviaCategoriesRaw = Array.from(catSet);
    const availableDeck = setupPayload.deck.map((c) => c.id);
    const groupIds = groups.map((g) => g.id);

    const baseGame: Omit<
      LocalGame,
      | 'triviaCategories'
      | 'currentCardId'
      | 'currentTurnGroupId'
      | 'currentRoundCategory'
      | 'categoryRoundQueue'
      | 'categoryGroupQueue'
      | 'banOrder'
    > = {
      cardsById,
      deckMeta,
      difficultyMeta,
      bannedCategories: [],
      banIndex: 0,
      groups,
      availableDeck,
      currentCardIndex: 0,
      triviaSchaetzCounter: 0,
      schaetzInjected: false,
      schaetzInjectedNext: null,
      jokerNextActive: false,
      jokerNextOriginGroupId: null,
      jokerNextTargetGroupId: null,
      jokerDicePending: false,
      jokerDiceResult: null,
      jokerDiceGroupId: null,
      schaetzCollectingIndex: 0,
      schaetzSubmissions: {},
      schaetzResult: null,
      pendingTextAnswer: null,
      winnerGroupIds: null,
    };

    if (setupPayload.banModeEnabled) {
      setGame({
        ...baseGame,
        triviaCategories: triviaCategoriesRaw,
        banOrder: groupIds,
        currentCardId: null,
        currentTurnGroupId: null,
        currentRoundCategory: '',
        categoryRoundQueue: [],
        categoryGroupQueue: [],
      });
      setPhase('banning');
    } else {
      const { shuffledCats, firstCat, firstCardId, catQueueStart } = computeFirstTurn(
        triviaCategoriesRaw,
        availableDeck,
        deckMeta,
        groupIds
      );
      setGame({
        ...baseGame,
        triviaCategories: shuffledCats,
        banOrder: [],
        currentCardId: firstCardId,
        currentTurnGroupId: groupIds[0],
        currentRoundCategory: firstCat,
        categoryRoundQueue: catQueueStart,
        categoryGroupQueue: [...groupIds],
      });
      setPhase(firstCardId && deckMeta[firstCardId] === 'schaetzfragen' ? 'schaetz' : 'playing');
    }
  }

  function handleBanCategory(category: string | null) {
    if (!game) return;
    const newBanned = category ? [...game.bannedCategories, category] : game.bannedCategories;
    const newIndex = game.banIndex + 1;
    if (newIndex >= game.banOrder.length) {
      const bannedSet = new Set(newBanned);
      const filteredAvailable = game.availableDeck.filter((id) => !bannedSet.has(game.deckMeta[id] ?? ''));
      const filteredCats = game.triviaCategories.filter((c) => !bannedSet.has(c));
      const groupIds = game.groups.map((g) => g.id);
      const { shuffledCats, firstCat, firstCardId, catQueueStart } = computeFirstTurn(
        filteredCats,
        filteredAvailable,
        game.deckMeta,
        groupIds
      );
      setGame({
        ...game,
        bannedCategories: newBanned,
        banIndex: newIndex,
        availableDeck: filteredAvailable,
        triviaCategories: shuffledCats,
        currentCardId: firstCardId,
        currentCardIndex: 0,
        currentTurnGroupId: groupIds[0],
        currentRoundCategory: firstCat,
        categoryRoundQueue: catQueueStart,
        categoryGroupQueue: [...groupIds],
      });
      setPhase(firstCardId && game.deckMeta[firstCardId] === 'schaetzfragen' ? 'schaetz' : 'playing');
    } else {
      setGame({ ...game, bannedCategories: newBanned, banIndex: newIndex });
    }
  }

  function submitTextAnswerLocal() {
    if (!game || !game.currentTurnGroupId || !textAnswerInput.trim()) return;
    setGame({ ...game, pendingTextAnswer: { groupId: game.currentTurnGroupId, text: textAnswerInput.trim() } });
    setTextAnswerInput('');
  }

  function judgeAnswer(correct: boolean) {
    if (!game || !setupPayload || !game.currentCardId || !game.currentTurnGroupId) return;
    const playingGroupIds = game.groups.map((g) => g.id);
    const activeGroupId = game.currentTurnGroupId;
    const isJokerNextResolution = game.jokerNextActive;
    const jokerNextOriginId = game.jokerNextOriginGroupId;
    const scoringGroupId =
      isJokerNextResolution && !correct && jokerNextOriginId ? jokerNextOriginId : activeGroupId;
    const scoringGroup = game.groups.find((g) => g.id === scoringGroupId);
    if (!scoringGroup) return;

    const currentCategory = game.deckMeta[game.currentCardId] ?? '';
    const awardPoint = isJokerNextResolution ? !correct : correct;
    const prevCompleted = scoringGroup.completedCategories;
    const newCompleted =
      awardPoint && currentCategory && !prevCompleted.includes(currentCategory)
        ? [...prevCompleted, currentCategory]
        : prevCompleted;

    const newAvailable = game.availableDeck.filter((id) => id !== game.currentCardId);
    const winCondition = setupPayload.triviaWinCondition;

    const groupCompletedCategories: Record<string, string[]> = {};
    game.groups.forEach((g) => {
      groupCompletedCategories[g.id] = g.id === scoringGroupId ? newCompleted : g.completedCategories;
    });

    // Fehlversuche pro Kategorie (Frust-Vermeidung): zählt für die Gruppe, die die Frage
    // tatsächlich beantwortet hat (activeGroupId) — unabhängig davon, wer bei NEXT den
    // Punkt bekommt. Ab 3 Fehlversuchen wird die nächste Frage dieser Kategorie für
    // diese Gruppe bevorzugt "leicht" gezogen; eine richtige Antwort während dieser
    // Phase setzt den Zähler wieder auf 0.
    const activeGroup = game.groups.find((g) => g.id === activeGroupId);
    const prevFails = activeGroup?.categoryFails[currentCategory] ?? 0;
    const newFails = !currentCategory || currentCategory === 'schaetzfragen'
      ? prevFails
      : correct
      ? (prevFails >= 3 ? 0 : prevFails)
      : prevFails + 1;
    const groupCategoryFails =
      currentCategory && currentCategory !== 'schaetzfragen'
        ? buildGroupCategoryFails(game.groups, { groupId: activeGroupId, category: currentCategory, value: newFails })
        : buildGroupCategoryFails(game.groups);

    const next = computeNextTurn(
      playingGroupIds,
      game.currentRoundCategory,
      game.categoryGroupQueue,
      game.categoryRoundQueue,
      game.triviaCategories,
      newAvailable,
      game.deckMeta,
      groupCompletedCategories,
      winCondition,
      groupCategoryFails,
      game.difficultyMeta
    );

    const newGroups = game.groups.map((g) => {
      let next = g;
      if (g.id === scoringGroupId) {
        next = { ...next, score: awardPoint ? next.score + 1 : next.score, completedCategories: newCompleted };
      }
      if (g.id === activeGroupId && currentCategory && currentCategory !== 'schaetzfragen') {
        next = { ...next, categoryFails: { ...next.categoryFails, [currentCategory]: newFails } };
      }
      return next;
    });

    const base: LocalGame = {
      ...game,
      groups: newGroups,
      availableDeck: newAvailable,
      jokerNextActive: false,
      jokerNextOriginGroupId: null,
      jokerNextTargetGroupId: null,
      pendingTextAnswer: null,
    };

    setShowAnswer(false);
    setTextAnswerInput('');

    // Vereinfachte Gewinnbedingung: die erste Gruppe, die alle Kategorien voll hat,
    // gewinnt sofort (kein Schätzfragen-Stechen bei Gleichstand — strukturell kann das
    // in diesem Zug-für-Zug-Modus ohnehin nur bei einer gemeinsam gewonnenen
    // Schätzfrage passieren, siehe continueAfterSchaetz).
    if (
      winCondition === 'categories' &&
      awardPoint &&
      game.triviaCategories.length > 0 &&
      newCompleted.length >= game.triviaCategories.length
    ) {
      setGame({ ...base, winnerGroupIds: [scoringGroupId] });
      setPhase('finished');
      return;
    }

    if (!next.nextCardId) {
      const winnerGroupIds =
        winCondition === 'points' ? winnersByMaxScore(newGroups) : winnersByMaxCategoryCount(newGroups);
      setGame({ ...base, winnerGroupIds });
      setPhase('finished');
      return;
    }

    const injection = maybeInjectSchaetzfrage({
      currentCategory,
      triviaSchaetzCounter: game.triviaSchaetzCounter,
      playingGroupCount: playingGroupIds.length,
      newAvailable,
      deckMeta: game.deckMeta,
      currentCardIndex: game.currentCardIndex,
      next,
    });

    const resolvedCardId = injection.currentCardId;
    const nextPhase: Phase =
      resolvedCardId && game.deckMeta[resolvedCardId] === 'schaetzfragen' ? 'schaetz' : 'playing';

    setGame({
      ...base,
      triviaSchaetzCounter: injection.triviaSchaetzCounter,
      schaetzInjected: injection.schaetzInjected,
      schaetzInjectedNext: injection.schaetzInjectedNext,
      currentCardId: resolvedCardId,
      currentCardIndex: game.currentCardIndex + 1,
      currentTurnGroupId: injection.currentTurnGroupId,
      currentRoundCategory: injection.currentRoundCategory,
      categoryRoundQueue: injection.categoryRoundQueue,
      categoryGroupQueue: injection.categoryGroupQueue,
      schaetzCollectingIndex: 0,
      schaetzSubmissions: {},
      schaetzResult: null,
    });
    setPhase(nextPhase);
  }

  function activateNewQuestionJoker() {
    if (!game || !game.currentTurnGroupId || !game.currentCardId) return;
    const groupId = game.currentTurnGroupId;
    const group = game.groups.find((g) => g.id === groupId);
    if (!group?.jokers.newQuestion) return;
    const currentCat = game.deckMeta[game.currentCardId] ?? game.currentRoundCategory;
    if (currentCat === 'schaetzfragen') return;

    const newAvailable = game.availableDeck.filter((id) => id !== game.currentCardId);
    const sameCatPool = newAvailable.filter((id) => game.deckMeta[id] === currentCat);
    const nextCardId =
      sameCatPool.length > 0
        ? pickCardRespectingDifficulty(
            sameCatPool,
            groupId,
            currentCat,
            { [groupId]: group.categoryFails },
            game.difficultyMeta
          )
        : newAvailable.length > 0
        ? newAvailable[Math.floor(Math.random() * newAvailable.length)]
        : null;

    const newGroups = game.groups.map((g) =>
      g.id === groupId ? { ...g, jokers: { ...g.jokers, newQuestion: false } } : g
    );
    setGame({ ...game, groups: newGroups, availableDeck: newAvailable, currentCardId: nextCardId });
    setPhase(nextCardId && game.deckMeta[nextCardId] === 'schaetzfragen' ? 'schaetz' : 'playing');
    setShowAnswer(false);
    setTextAnswerInput('');
  }

  function activateNextJoker() {
    if (!game || !game.currentTurnGroupId || !game.currentCardId) return;
    const groupId = game.currentTurnGroupId;
    const group = game.groups.find((g) => g.id === groupId);
    if (!group?.jokers.next) return;
    const currentCat = game.currentRoundCategory || (game.deckMeta[game.currentCardId] ?? '');
    if (currentCat === 'schaetzfragen') return;
    const playingGroupIds = game.groups.map((g) => g.id);
    if (playingGroupIds.length < 2) return;
    const currentIdx = playingGroupIds.indexOf(groupId);
    const nextGroupId = playingGroupIds[(currentIdx + 1) % playingGroupIds.length];

    const newGroups = game.groups.map((g) => (g.id === groupId ? { ...g, jokers: { ...g.jokers, next: false } } : g));
    setGame({
      ...game,
      groups: newGroups,
      jokerNextActive: true,
      jokerNextOriginGroupId: groupId,
      jokerNextTargetGroupId: nextGroupId,
      currentTurnGroupId: nextGroupId,
    });
    setShowAnswer(false);
    setTextAnswerInput('');
  }

  function activateDiceJoker() {
    if (!game || !game.currentTurnGroupId || !game.currentCardId) return;
    const groupId = game.currentTurnGroupId;
    const group = game.groups.find((g) => g.id === groupId);
    if (!group?.jokers.dice) return;
    const currentCat = game.currentRoundCategory || (game.deckMeta[game.currentCardId] ?? '');
    if (currentCat === 'schaetzfragen') return;

    const roll = Math.floor(Math.random() * 6) + 1;
    let newCompleted = [...group.completedCategories];
    let newScore = group.score;
    if (roll >= 5) {
      newScore += 1;
      if (currentCat && !newCompleted.includes(currentCat)) newCompleted.push(currentCat);
    } else if (roll === 1) {
      newScore = Math.max(0, newScore - 1);
      if (newCompleted.length > 0) {
        const loseIdx = Math.floor(Math.random() * newCompleted.length);
        newCompleted.splice(loseIdx, 1);
      }
    }

    const newGroups = game.groups.map((g) =>
      g.id === groupId
        ? { ...g, score: newScore, completedCategories: newCompleted, jokers: { ...g.jokers, dice: false } }
        : g
    );
    setGame({ ...game, groups: newGroups, jokerDicePending: true, jokerDiceResult: roll, jokerDiceGroupId: groupId });
  }

  function confirmDice() {
    if (!game || !setupPayload || !game.jokerDicePending || !game.jokerDiceGroupId || !game.currentCardId) return;
    const groupId = game.jokerDiceGroupId;
    const roll = game.jokerDiceResult ?? 0;
    const group = game.groups.find((g) => g.id === groupId);
    if (!group) return;
    const playingGroupIds = game.groups.map((g) => g.id);
    const winCondition = setupPayload.triviaWinCondition;
    const newAvailable = game.availableDeck.filter((id) => id !== game.currentCardId);
    const groupCompletedCategories: Record<string, string[]> = {};
    game.groups.forEach((g) => {
      groupCompletedCategories[g.id] = g.completedCategories;
    });
    const next = computeNextTurn(
      playingGroupIds,
      game.currentRoundCategory,
      game.categoryGroupQueue,
      game.categoryRoundQueue,
      game.triviaCategories,
      newAvailable,
      game.deckMeta,
      groupCompletedCategories,
      winCondition,
      buildGroupCategoryFails(game.groups),
      game.difficultyMeta
    );

    const base: LocalGame = {
      ...game,
      availableDeck: newAvailable,
      jokerDicePending: false,
      jokerDiceResult: null,
      jokerDiceGroupId: null,
    };

    if (
      roll >= 5 &&
      winCondition === 'categories' &&
      game.triviaCategories.length > 0 &&
      group.completedCategories.length >= game.triviaCategories.length
    ) {
      setGame({ ...base, winnerGroupIds: [groupId] });
      setPhase('finished');
      return;
    }

    if (!next.nextCardId) {
      const winnerGroupIds =
        winCondition === 'points' ? winnersByMaxScore(game.groups) : winnersByMaxCategoryCount(game.groups);
      setGame({ ...base, winnerGroupIds });
      setPhase('finished');
      return;
    }

    setGame({
      ...base,
      currentTurnGroupId: next.nextGroupId,
      currentCardId: next.nextCardId,
      currentCardIndex: game.currentCardIndex + 1,
      currentRoundCategory: next.currentRoundCategory,
      categoryRoundQueue: next.categoryRoundQueue,
      categoryGroupQueue: next.categoryGroupQueue,
    });
    setPhase(next.nextCardId && game.deckMeta[next.nextCardId] === 'schaetzfragen' ? 'schaetz' : 'playing');
    setShowAnswer(false);
    setTextAnswerInput('');
  }

  function submitSchaetzGuessLocal() {
    if (!game || !schaetzInput.trim()) return;
    const idx = game.schaetzCollectingIndex;
    const group = game.groups[idx];
    if (!group) return;
    setGame({
      ...game,
      schaetzSubmissions: { ...game.schaetzSubmissions, [group.id]: schaetzInput.trim() },
      schaetzCollectingIndex: idx + 1,
    });
    setSchaetzInput('');
  }

  function revealSchaetzResult() {
    if (!game || !game.currentCardId) return;
    const currentCard = game.cardsById[game.currentCardId];
    if (!currentCard) return;
    const correctRange = extractRangeFromAnswer(currentCard.answer);
    const correctNum = correctRange ? null : extractNumericFromAnswer(currentCard.answer);
    const distToCorrect = (val: number) =>
      correctRange
        ? val >= correctRange.low && val <= correctRange.high
          ? 0
          : Math.min(Math.abs(val - correctRange.low), Math.abs(val - correctRange.high))
        : Math.abs(val - (correctNum ?? NaN));

    const submissions = game.groups
      .map((g) => ({
        id: g.id,
        name: g.name,
        color: g.color,
        raw: game.schaetzSubmissions[g.id] ?? '',
        val: parseGuessNumber(game.schaetzSubmissions[g.id] ?? ''),
      }))
      .filter((s) => isFinite(s.val));
    if (submissions.length === 0) return;

    const distances = submissions.map((s) => distToCorrect(s.val));
    const minDist = Math.min(...distances);
    const EPS = 0.001;
    const winnerIds = submissions.filter((_, i) => Math.abs(distances[i] - minDist) < EPS).map((s) => s.id);
    const unit = extractUnitFromAnswer(currentCard.answer);

    setGame({
      ...game,
      schaetzResult: {
        answer: currentCard.answer,
        winnerIds,
        submissions: submissions.map((s, i) => ({
          groupId: s.id,
          groupName: s.name,
          value: `${s.raw}${unit ? ` ${unit}` : ''}`,
          isWinner: Math.abs(distances[i] - minDist) < EPS,
          color: s.color,
        })),
      },
    });
  }

  function continueAfterSchaetz() {
    if (!game || !setupPayload || !game.schaetzResult || !game.currentCardId) return;
    const winnerIds = game.schaetzResult.winnerIds;
    const currentCategory = game.deckMeta[game.currentCardId] ?? '';
    const newAvailable = game.availableDeck.filter((id) => id !== game.currentCardId);
    const winCondition = setupPayload.triviaWinCondition;
    const playingGroupIds = game.groups.map((g) => g.id);

    let newGroups = game.groups.map((g) => {
      if (!winnerIds.includes(g.id)) return g;
      const newCompleted =
        currentCategory && !g.completedCategories.includes(currentCategory)
          ? [...g.completedCategories, currentCategory]
          : g.completedCategories;
      return { ...g, score: g.score + 1, completedCategories: newCompleted };
    });

    // Joker-Bonus: Gewinner der Schätzfrage bekommen einen zufälligen verbrauchten Joker zurück.
    if (setupPayload.jokersEnabled) {
      newGroups = newGroups.map((g) => {
        if (!winnerIds.includes(g.id)) return g;
        const usedKeys = (['newQuestion', 'next', 'dice'] as const).filter((k) => !g.jokers[k]);
        if (usedKeys.length === 0) return g;
        const restoreKey = usedKeys[Math.floor(Math.random() * usedKeys.length)];
        return { ...g, jokers: { ...g.jokers, [restoreKey]: true } };
      });
    }

    const groupCompletedCategories: Record<string, string[]> = {};
    newGroups.forEach((g) => {
      groupCompletedCategories[g.id] = g.completedCategories;
    });

    const next: NextTurnResult =
      game.schaetzInjected && game.schaetzInjectedNext
        ? {
            nextCardId: game.schaetzInjectedNext.nextCardId,
            nextGroupId: game.schaetzInjectedNext.nextGroupId,
            currentRoundCategory: game.schaetzInjectedNext.currentRoundCategory,
            categoryRoundQueue: game.schaetzInjectedNext.categoryRoundQueue,
            categoryGroupQueue: game.schaetzInjectedNext.categoryGroupQueue,
          }
        : computeNextTurn(
            playingGroupIds,
            game.currentRoundCategory,
            [],
            game.categoryRoundQueue,
            game.triviaCategories,
            newAvailable,
            game.deckMeta,
            groupCompletedCategories,
            winCondition,
            buildGroupCategoryFails(newGroups),
            game.difficultyMeta
          );

    const base: LocalGame = {
      ...game,
      groups: newGroups,
      availableDeck: newAvailable,
      schaetzInjected: false,
      schaetzInjectedNext: null,
      schaetzCollectingIndex: 0,
      schaetzSubmissions: {},
      schaetzResult: null,
    };

    if (winCondition === 'categories') {
      const finishedWinners = winnerIds.filter((id) => {
        const g = newGroups.find((gr) => gr.id === id);
        return g && game.triviaCategories.length > 0 && g.completedCategories.length >= game.triviaCategories.length;
      });
      if (finishedWinners.length > 0) {
        setGame({ ...base, winnerGroupIds: finishedWinners });
        setPhase('finished');
        return;
      }
    }

    if (!next.nextCardId) {
      const winnerGroupIds =
        winCondition === 'points' ? winnersByMaxScore(newGroups) : winnersByMaxCategoryCount(newGroups);
      setGame({ ...base, winnerGroupIds });
      setPhase('finished');
      return;
    }

    setGame({
      ...base,
      currentTurnGroupId: next.nextGroupId,
      currentCardId: next.nextCardId,
      currentCardIndex: game.currentCardIndex + 1,
      currentRoundCategory: next.currentRoundCategory,
      categoryRoundQueue: next.categoryRoundQueue,
      categoryGroupQueue: next.categoryGroupQueue,
      triviaSchaetzCounter: 0,
    });
    setPhase(next.nextCardId && game.deckMeta[next.nextCardId] === 'schaetzfragen' ? 'schaetz' : 'playing');
  }

  function endGameNow() {
    if (!game || !setupPayload) return;
    const winCondition = setupPayload.triviaWinCondition;
    const winnerGroupIds =
      winCondition === 'points' ? winnersByMaxScore(game.groups) : winnersByMaxCategoryCount(game.groups);
    setGame({ ...game, winnerGroupIds });
    setPhase('finished');
    setConfirmEnd(false);
  }

  function resetToGroups() {
    setGame(null);
    setPhase('groups');
    highscoreWritten.current = false;
  }

  function backToWizard() {
    try {
      window.localStorage.removeItem(TRIVIA_LOCAL_GAME_KEY);
      window.localStorage.removeItem(TRIVIA_LOCAL_SETUP_KEY);
    } catch {
      // ignore
    }
    router.push('/multiplayer?gameMode=trivia');
  }

  // Highscore-Eintrag beim Erreichen des Endstands (einmalig, best effort).
  useEffect(() => {
    if (phase !== 'finished' || !game || !game.winnerGroupIds || game.winnerGroupIds.length === 0) return;
    if (highscoreWritten.current) return;
    highscoreWritten.current = true;
    const winner = game.groups.find((g) => g.id === game.winnerGroupIds![0]);
    if (!winner) return;
    const entry: Omit<HighscoreEntry, 'id'> = {
      pin: 'lokal',
      groupName: winner.name,
      groupColor: winner.color,
      avatar: null,
      mode: 'trivia',
      points: winner.score,
      completedCategories: winner.completedCategories.length,
      finishedAt: Date.now(),
    };
    recordLocalHighscore(entry).catch(() => {});
  }, [phase, game]);

  const ranking = useMemo(() => (game ? [...game.groups].sort((a, b) => b.score - a.score) : []), [game]);

  if (!hydrated || missingSetup || !setupPayload) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-ink/60">Lade…</p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-3xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/multiplayer?gameMode=trivia" className="text-sm text-ink/60 hover:text-ink">
          ← Zurück
        </Link>
        <h1 className="text-xl font-display">🧠 Trivia – Ein Gerät</h1>
        <span className="w-12" />
      </div>

      {phase === 'groups' && (
        <div className="space-y-5">
          <p className="text-sm text-ink/70 text-center">
            Alles läuft auf diesem einen Gerät. Legt fest, wie viele Gruppen mitspielen und wie sie heißen —
            danach geht's los.
          </p>
          <div>
            <p className="text-sm font-semibold mb-2">Anzahl Gruppen</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateGroupCount(groupCount - 1)}
                disabled={groupCount <= MIN_GROUPS}
                className="w-10 h-10 rounded-lg border-2 border-ink/30 text-lg font-bold hover:bg-ink/10 disabled:opacity-40 flex items-center justify-center"
              >
                −
              </button>
              <span className="text-xl font-bold w-8 text-center">{groupCount}</span>
              <button
                onClick={() => updateGroupCount(groupCount + 1)}
                disabled={groupCount >= MAX_GROUPS}
                className="w-10 h-10 rounded-lg border-2 border-ink/30 text-lg font-bold hover:bg-ink/10 disabled:opacity-40 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Gruppennamen</p>
            <div className="space-y-2">
              {groupNames.map((name, i) => (
                <input
                  key={i}
                  value={name}
                  onChange={(e) => updateGroupName(i, e.target.value)}
                  placeholder={`Gruppe ${i + 1}`}
                  className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  maxLength={20}
                />
              ))}
            </div>
          </div>
          <button
            onClick={confirmGroups}
            className="w-full py-3 rounded-xl bg-ink text-inkDark font-bold text-base hover:opacity-90"
          >
            Los geht's →
          </button>
        </div>
      )}

      {phase === 'banning' && game && (() => {
        const currentBanGroupId = game.banOrder[game.banIndex];
        const currentBanGroup = game.groups.find((g) => g.id === currentBanGroupId);
        const availableCategories = game.triviaCategories.filter(
          (c) => !game.bannedCategories.includes(c) && c !== 'image'
        );
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold">🚫 Kategorie-Ban</h2>
              <p className="text-xs text-ink/60">
                Runde {Math.min(game.banIndex + 1, game.banOrder.length)} / {game.banOrder.length}
              </p>
            </div>
            {game.bannedCategories.length > 0 && (
              <div className="card-surface rounded-2xl p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-ink/60">Gebannte Kategorien</p>
                <div className="flex flex-wrap gap-2">
                  {game.bannedCategories.map((c) => (
                    <span
                      key={c}
                      className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-300"
                    >
                      🚫 {catLabelWithIcon(c)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-amber-400/40 bg-amber-50/10">
              <p className="font-semibold text-amber-700 text-center">
                👉 {currentBanGroup?.name ?? '…'} ist dran — wählt eine Kategorie zum Bannen (Handy weitergeben)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleBanCategory(c)}
                    className="rounded-xl border-2 border-red-400 bg-red-50 hover:bg-red-100 text-red-800 text-sm font-semibold px-3 py-3 transition"
                  >
                    <span className="block text-lg">{catIcon(c)}</span>
                    <span className="block text-xs mt-0.5">{catLabelMeta(c)}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleBanCategory(null)}
                  className="rounded-xl border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-800 text-sm font-semibold px-3 py-3 transition col-span-2 sm:col-span-1"
                >
                  ✅ Nichts bannen
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {phase === 'playing' && game && game.currentCardId && (() => {
        const currentCard = game.cardsById[game.currentCardId];
        if (!currentCard) return null;
        const activeGroup = game.groups.find((g) => g.id === game.currentTurnGroupId);
        const categoryIcon = catIcon(currentCard.category);
        const categoryLabel = catLabelMeta(currentCard.category);

        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {game.groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: g.id === game.currentTurnGroupId ? g.color : `${g.color}20`,
                    color: g.id === game.currentTurnGroupId ? '#fff' : undefined,
                  }}
                >
                  <span>{g.name}</span>
                  <span className="opacity-80">{g.score} Pkt</span>
                </div>
              ))}
            </div>

            <div className="card-surface rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-ink/10 font-semibold">
                    {categoryIcon} {categoryLabel}
                  </span>
                  {quoteSourceBadge(currentCard)}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-ink/10">{currentCard.difficulty}</span>
              </div>
              <p className="text-center text-sm font-bold text-ink/80">
                {activeGroup?.name ?? '…'} ist dran
              </p>
              <p className="text-base sm:text-lg font-semibold">{triviaDisplayCue(currentCard)}</p>

              {currentCard.sources && (
                <MediaEmbed
                  key={`local-media-${currentCard.id}`}
                  card={currentCard}
                  preference={currentCard.category === 'music' ? 'spotify' : 'youtube'}
                  concealMetadata={currentCard.category === 'music'}
                />
              )}
            </div>

            {/* Joker-Panel */}
            {setupPayload.jokersEnabled && !game.jokerNextActive && (() => {
              const myJokers = game.groups.find((g) => g.id === game.currentTurnGroupId)?.jokers;
              if (!myJokers) return null;
              const hasAnyJoker = myJokers.newQuestion || myJokers.next || myJokers.dice;
              return (
                <div className="card-surface rounded-2xl p-3 space-y-2 border-2 border-amber-400/40">
                  <h3 className="text-xs font-bold text-amber-700">🃏 Joker</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={!myJokers.newQuestion}
                      onClick={activateNewQuestionJoker}
                      className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-center border-2 ${
                        myJokers.newQuestion
                          ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900'
                          : 'border-ink/10 bg-ink/5 opacity-40 text-ink/40'
                      }`}
                    >
                      <span className="text-lg">🔄</span>
                      <span className="text-[10px] font-semibold">Neue Frage</span>
                    </button>
                    <button
                      disabled={!myJokers.next || game.groups.length < 2}
                      onClick={activateNextJoker}
                      className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-center border-2 ${
                        myJokers.next
                          ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900'
                          : 'border-ink/10 bg-ink/5 opacity-40 text-ink/40'
                      }`}
                    >
                      <span className="text-lg">➡️</span>
                      <span className="text-[10px] font-semibold">NEXT</span>
                    </button>
                    <button
                      disabled={!myJokers.dice || game.jokerDicePending}
                      onClick={activateDiceJoker}
                      className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-center border-2 ${
                        myJokers.dice
                          ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900'
                          : 'border-ink/10 bg-ink/5 opacity-40 text-ink/40'
                      }`}
                    >
                      <span className="text-lg">🎲</span>
                      <span className="text-[10px] font-semibold">Würfeln</span>
                    </button>
                  </div>
                  {!hasAnyJoker && <p className="text-[11px] text-ink/50 text-center">Alle Joker wurden verbraucht.</p>}
                </div>
              );
            })()}

            {game.jokerNextActive && game.jokerNextOriginGroupId && game.jokerNextTargetGroupId && (
              <div className="rounded-xl bg-orange-500/15 border-2 border-orange-400 px-3 py-2 text-xs">
                <p className="font-bold text-orange-700">⚡ Joker NEXT aktiv</p>
                <p className="text-orange-600">
                  {game.groups.find((g) => g.id === game.jokerNextOriginGroupId)?.name} hat die Frage an{' '}
                  {game.groups.find((g) => g.id === game.jokerNextTargetGroupId)?.name} weitergegeben.
                </p>
                <p className="text-orange-600 mt-1">
                  Richtig → niemand bekommt Punkt. Falsch →{' '}
                  {game.groups.find((g) => g.id === game.jokerNextOriginGroupId)?.name} bekommt Punkt.
                </p>
              </div>
            )}

            {game.jokerDicePending && (
              <div className="card-surface rounded-2xl p-4 space-y-2 border-2 border-amber-400 text-center">
                <p className="text-3xl">🎲 {game.jokerDiceResult}</p>
                <p className="text-sm text-ink/70">
                  {game.jokerDiceResult && game.jokerDiceResult >= 5
                    ? 'Jackpot! +1 Punkt & Kategorie kassiert.'
                    : game.jokerDiceResult === 1
                    ? 'Pech! −1 Punkt & eine gesammelte Kategorie verloren.'
                    : 'Kein Effekt.'}
                </p>
                <button
                  onClick={confirmDice}
                  className="w-full py-2 rounded-xl bg-ink text-inkDark font-bold text-sm hover:opacity-90"
                >
                  Weiter →
                </button>
              </div>
            )}

            {!game.jokerDicePending && (
              <div className="card-surface rounded-2xl p-3 space-y-2 border-2 border-green-500/30">
                {setupPayload.hostTextAnswersEnabled && !game.pendingTextAnswer && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-center text-ink/80">Antwort von {activeGroup?.name}:</p>
                    <input
                      type="text"
                      value={textAnswerInput}
                      onChange={(e) => setTextAnswerInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitTextAnswerLocal()}
                      placeholder="Antwort eingeben…"
                      className="w-full rounded-xl border-2 border-ink/20 px-3 py-2 text-base font-semibold text-gray-900 focus:border-ink/60 outline-none"
                    />
                    <button
                      onClick={submitTextAnswerLocal}
                      disabled={!textAnswerInput.trim()}
                      className="w-full py-2 rounded-xl bg-ink text-inkDark font-bold text-base hover:opacity-90 disabled:opacity-40"
                    >
                      📤 Antwort einreichen
                    </button>
                  </div>
                )}
                {setupPayload.hostTextAnswersEnabled && game.pendingTextAnswer && (
                  <div className="rounded-xl bg-blue-500/10 border-2 border-blue-400/40 px-3 py-2 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-ink/50">Eingereichte Antwort</p>
                    <p className="text-base font-bold">{game.pendingTextAnswer.text}</p>
                  </div>
                )}
                {(!setupPayload.hostTextAnswersEnabled || game.pendingTextAnswer) && (
                  <>
                    <p className="text-sm font-semibold text-center text-ink/80">
                      Hat <span className="font-bold">„{activeGroup?.name ?? '…'}“</span> richtig geantwortet?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => judgeAnswer(true)}
                        className="px-2 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700"
                      >
                        ✅ Richtig
                      </button>
                      <button
                        onClick={() => judgeAnswer(false)}
                        className="px-2 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700"
                      >
                        ❌ Falsch
                      </button>
                      <button
                        onClick={() => setShowAnswer((v) => !v)}
                        className={`px-2 py-2 rounded-xl font-bold text-sm transition-colors ${
                          showAnswer ? 'bg-sky-900 text-sky-200 hover:bg-sky-800' : 'bg-sky-700 text-white hover:bg-sky-600'
                        }`}
                      >
                        {showAnswer ? '🙈 Verbergen' : '👁 Antwort'}
                      </button>
                    </div>
                    {showAnswer && (
                      <div className="rounded-xl bg-yellow-100/20 border-2 border-yellow-400 px-3 py-2">
                        <p className="text-xs font-semibold text-yellow-700 mb-0.5">Korrekte Antwort:</p>
                        <p className="text-base font-bold">
                          {currentCard.category === 'music'
                            ? currentCard.answer.replace(/ [–—] -?\d+, /, ' — ')
                            : currentCard.answer}
                        </p>
                        {currentCard.year && <p className="text-xs text-ink/60 mt-0.5">Jahr: {currentCard.year}</p>}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <EndGameFooter confirmEnd={confirmEnd} setConfirmEnd={setConfirmEnd} onEnd={endGameNow} />
          </div>
        );
      })()}

      {phase === 'schaetz' && game && game.currentCardId && (() => {
        const currentCard = game.cardsById[game.currentCardId];
        if (!currentCard) return null;
        const collectingGroup = game.groups[game.schaetzCollectingIndex];
        const allSubmitted = game.schaetzCollectingIndex >= game.groups.length;

        return (
          <div className="space-y-3">
            <div className="card-surface rounded-2xl p-4 space-y-2 border-2 border-blue-400/40">
              <span className="text-xs px-2 py-0.5 rounded-full bg-ink/10 font-semibold">🎯 Schätzfrage</span>
              <p className="text-base sm:text-lg font-semibold">{currentCard.cue}</p>
            </div>

            {!allSubmitted && !game.schaetzResult && collectingGroup && (
              <div className="card-surface rounded-2xl p-4 space-y-2 border-2 border-green-500/30">
                <p className="text-sm font-semibold text-center text-ink/80">
                  {collectingGroup.name} schätzt (Handy nicht zeigen, dann weitergeben)
                </p>
                <div className="space-y-1 text-xs text-ink/50 text-center">
                  {game.schaetzCollectingIndex} / {game.groups.length} eingereicht
                </div>
                <input
                  type="text"
                  value={schaetzInput}
                  onChange={(e) => setSchaetzInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitSchaetzGuessLocal()}
                  placeholder="Eure Schätzung…"
                  className="w-full rounded-xl border-2 border-ink/20 px-3 py-2 text-base font-semibold text-gray-900 focus:border-ink/60 outline-none"
                  autoFocus
                />
                <button
                  onClick={submitSchaetzGuessLocal}
                  disabled={!schaetzInput.trim()}
                  className="w-full py-2 rounded-xl bg-ink text-inkDark font-bold text-base hover:opacity-90 disabled:opacity-40"
                >
                  ✓ Einreichen, Handy weitergeben
                </button>
              </div>
            )}

            {allSubmitted && !game.schaetzResult && (
              <button
                onClick={revealSchaetzResult}
                className="w-full py-3 rounded-xl bg-ink text-inkDark font-bold text-base hover:opacity-90"
              >
                👁 Alle Schätzungen aufdecken
              </button>
            )}

            {game.schaetzResult && (
              <div className="card-surface rounded-2xl p-4 space-y-2 border-2 border-yellow-400">
                <p className="text-xs font-semibold text-yellow-700">Richtige Antwort: {game.schaetzResult.answer}</p>
                <div className="space-y-1.5">
                  {game.schaetzResult.submissions.map((s) => (
                    <div
                      key={s.groupId}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${
                        s.isWinner ? 'bg-green-500/15 border-2 border-green-500 font-bold' : 'bg-ink/5'
                      }`}
                    >
                      <span style={{ color: s.color }}>{s.isWinner ? '🏆 ' : ''}{s.groupName}</span>
                      <span>{s.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={continueAfterSchaetz}
                  className="w-full py-2 rounded-xl bg-ink text-inkDark font-bold text-sm hover:opacity-90"
                >
                  Weiter →
                </button>
              </div>
            )}

            <EndGameFooter confirmEnd={confirmEnd} setConfirmEnd={setConfirmEnd} onEnd={endGameNow} />
          </div>
        );
      })()}

      {phase === 'finished' && game && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display text-center">🏆 Endstand</h2>
          <div className="space-y-2">
            {ranking.map((g, i) => {
              const isWinner = game.winnerGroupIds?.includes(g.id) ?? false;
              return (
                <div
                  key={g.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${
                    isWinner ? 'border-green-500 bg-green-500/10 font-bold' : 'border-ink/15'
                  }`}
                >
                  <span>
                    {isWinner ? '🥇 ' : `${i + 1}. `}
                    {g.name}
                  </span>
                  <span className="text-sm text-ink/60">
                    {g.score} Pkt · {g.completedCategories.length}/{game.triviaCategories.length} Kategorien
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={resetToGroups}
              className="py-3 rounded-xl bg-ink text-inkDark font-bold text-base hover:opacity-90"
            >
              Neues Spiel
            </button>
            <Link
              href="/"
              className="py-3 rounded-xl border-2 border-ink/30 text-center font-bold text-base hover:bg-ink/10"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function EndGameFooter({
  confirmEnd,
  setConfirmEnd,
  onEnd,
}: {
  confirmEnd: boolean;
  setConfirmEnd: (v: boolean) => void;
  onEnd: () => void;
}) {
  return (
    <div className="text-center pt-1">
      {!confirmEnd ? (
        <button onClick={() => setConfirmEnd(true)} className="text-xs text-ink/50 hover:text-ink/80 underline">
          Spiel beenden
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-ink/60">Spiel wirklich beenden?</span>
          <button onClick={onEnd} className="text-red-600 font-semibold hover:underline">
            Ja, beenden
          </button>
          <button onClick={() => setConfirmEnd(false)} className="text-ink/60 hover:underline">
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
