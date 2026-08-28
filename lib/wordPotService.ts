import { database } from './firebase';
import { ref, set, get, update, onValue, off, push } from 'firebase/database';
import {
  WordPotGame,
  WordPotGroup,
  WordPotPlayer,
  WordPotWord,
  WordPotRoundNumber,
  CreateWordPotParams,
  JoinWordPotParams,
} from './wordPotTypes';

function checkFirebase() {
  if (!database) {
    throw new Error('Firebase ist nicht konfiguriert.');
  }
}

function generatePin(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateId(): string {
  checkFirebase();
  return push(ref(database!)).key || Date.now().toString();
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function checkPinExists(pin: string): Promise<boolean> {
  checkFirebase();
  const snap = await get(ref(database!, `games/${pin}`));
  return snap.exists();
}

/** Erstellt ein neues Begriffe-Topf-Spiel. Der Ersteller wird direkt als erster Spieler seiner gewählten Gruppe registriert. */
export async function createWordPotGame(
  params: CreateWordPotParams
): Promise<{ pin: string; hostPlayerId: string }> {
  checkFirebase();

  let pin = generatePin();
  let attempts = 0;
  while (await checkPinExists(pin)) {
    pin = generatePin();
    attempts++;
    if (attempts > 10) throw new Error('Konnte keinen freien PIN generieren.');
  }

  const groupIds = params.groupNames.map(() => generateId());
  const groups: Record<string, WordPotGroup> = {};
  groupIds.forEach((id, i) => {
    groups[id] = { id, name: params.groupNames[i].trim() || `Gruppe ${i + 1}`, score: 0 };
  });

  const hostPlayerId = generateId();
  const hostGroupId = groupIds[params.hostGroupIndex] ?? groupIds[0];
  const players: Record<string, WordPotPlayer> = {
    [hostPlayerId]: {
      id: hostPlayerId,
      name: params.hostPlayerName.trim() || 'Spielleiter',
      groupId: hostGroupId,
      wordsSubmitted: 0,
      joinedAt: Date.now(),
    },
  };

  const game: WordPotGame = {
    pin,
    hostPlayerId,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    wordsPerPlayer: params.wordsPerPlayer,
    roundSeconds: params.roundSeconds,
    maxGroups: groupIds.length,
    groups,
    groupOrder: groupIds,
    players,
    words: {},
    phase: 'lobby',
    round: 1,
    potWordIds: [],
    currentWordId: null,
    currentGroupIndex: 0,
    explainerPlayerId: null,
    turnActive: false,
    turnEndsAt: null,
    turnJustEnded: false,
    roundComplete: false,
    turnScore: 0,
  };

  await set(ref(database!, `games/${pin}`), game);
  return { pin, hostPlayerId };
}

export async function joinWordPotGame(params: JoinWordPotParams): Promise<{ playerId: string }> {
  checkFirebase();
  const gameRef = ref(database!, `games/${params.pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) throw new Error('Spiel nicht gefunden.');
  const game = snap.val() as WordPotGame;
  if (game.phase !== 'lobby') throw new Error('Das Spiel läuft bereits.');
  if (!game.groups[params.groupId]) throw new Error('Gruppe nicht gefunden.');

  const playerId = generateId();
  const player: WordPotPlayer = {
    id: playerId,
    name: params.playerName.trim() || 'Spieler',
    groupId: params.groupId,
    wordsSubmitted: 0,
    joinedAt: Date.now(),
  };
  await set(ref(database!, `games/${params.pin}/players/${playerId}`), player);
  return { playerId };
}

export function subscribeToWordPotGame(
  pin: string,
  callback: (game: WordPotGame | null) => void
): () => void {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const listener = onValue(gameRef, (snap) => {
    callback(snap.exists() ? (snap.val() as WordPotGame) : null);
  });
  return () => off(gameRef, 'value', listener);
}

/** Reicht ein Wort ein, sofern der Spieler sein Kontingent noch nicht erreicht hat. */
export async function submitWordPotWord(
  pin: string,
  playerId: string,
  groupId: string,
  text: string
): Promise<void> {
  checkFirebase();
  const trimmed = text.trim();
  if (!trimmed) return;

  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  const player = game.players[playerId];
  if (!player || player.wordsSubmitted >= game.wordsPerPlayer) return;

  const wordId = generateId();
  const word: WordPotWord = { id: wordId, text: trimmed, groupId, playerId };

  await update(ref(database!), {
    [`games/${pin}/words/${wordId}`]: word,
    [`games/${pin}/players/${playerId}/wordsSubmitted`]: player.wordsSubmitted + 1,
  });
}

/** Host startet das Spiel: Topf für Runde 1 wird mit allen eingereichten Wörtern gefüllt. */
export async function startWordPotGame(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (game.phase !== 'lobby') return;

  const wordIds = shuffle(Object.keys(game.words || {}));
  await update(gameRef, {
    phase: 'playing',
    round: 1,
    startedAt: Date.now(),
    potWordIds: wordIds,
    currentGroupIndex: 0,
    currentWordId: null,
    explainerPlayerId: null,
    turnActive: false,
    turnJustEnded: false,
    roundComplete: false,
    turnScore: 0,
  });
}

/** Ein Mitglied der aktiven Gruppe startet den eigenen Zug und wird zum Erklärenden. */
export async function startWordPotTurn(pin: string, playerId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (game.phase !== 'playing' || game.turnActive || game.potWordIds.length === 0) return;

  const nextWordId = game.potWordIds[Math.floor(Math.random() * game.potWordIds.length)];
  await update(gameRef, {
    explainerPlayerId: playerId,
    currentWordId: nextWordId,
    turnActive: true,
    turnEndsAt: Date.now() + game.roundSeconds * 1000,
    turnJustEnded: false,
    turnScore: 0,
  });
}

/** Begriff wurde erraten: Punkt für die aktive Gruppe, Begriff raus aus dem Topf für diese Runde. */
export async function markWordPotCorrect(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (!game.turnActive || !game.currentWordId) return;

  const activeGroupId = game.groupOrder[game.currentGroupIndex];
  const remaining = game.potWordIds.filter((id) => id !== game.currentWordId);
  const newScore = (game.groups[activeGroupId]?.score ?? 0) + 1;
  const newTurnScore = game.turnScore + 1;

  if (remaining.length === 0) {
    // Topf leer: Runde komplett, Zug endet sofort.
    await update(gameRef, {
      [`groups/${activeGroupId}/score`]: newScore,
      potWordIds: remaining,
      currentWordId: null,
      explainerPlayerId: null,
      turnActive: false,
      turnEndsAt: null,
      turnJustEnded: true,
      roundComplete: true,
      turnScore: newTurnScore,
    });
    return;
  }

  const nextWordId = remaining[Math.floor(Math.random() * remaining.length)];
  await update(gameRef, {
    [`groups/${activeGroupId}/score`]: newScore,
    potWordIds: remaining,
    currentWordId: nextWordId,
    turnScore: newTurnScore,
  });
}

/** Begriff wird zurückgelegt: bleibt im Topf, ein neuer (zufällig auch derselbe) Begriff wird gezogen. */
export async function putBackWordPotWord(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (!game.turnActive || game.potWordIds.length === 0) return;

  const nextWordId = game.potWordIds[Math.floor(Math.random() * game.potWordIds.length)];
  await update(gameRef, { currentWordId: nextWordId });
}

/** Timer abgelaufen: Zug endet, nächste Gruppe ist an der Reihe. Von jedem Client aufrufbar (idempotent). */
export async function endWordPotTurn(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (!game.turnActive) return;

  const nextGroupIndex = (game.currentGroupIndex + 1) % game.groupOrder.length;
  await update(gameRef, {
    currentGroupIndex: nextGroupIndex,
    currentWordId: null,
    explainerPlayerId: null,
    turnActive: false,
    turnEndsAt: null,
    turnJustEnded: true,
    roundComplete: false,
  });
}

/** Nach der Zug-/Rundenzusammenfassung: weiter zum nächsten Zug oder zur nächsten Runde/Spielende. */
export async function continueAfterWordPotTurn(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (!game.turnJustEnded) return;

  if (game.roundComplete) {
    if (game.round >= 3) {
      await update(gameRef, {
        phase: 'finished',
        finishedAt: Date.now(),
        turnJustEnded: false,
        roundComplete: false,
      });
      return;
    }
    const nextRound = (game.round + 1) as WordPotRoundNumber;
    const wordIds = shuffle(Object.keys(game.words || {}));
    await update(gameRef, {
      round: nextRound,
      potWordIds: wordIds,
      turnJustEnded: false,
      roundComplete: false,
      turnScore: 0,
    });
    return;
  }

  await update(gameRef, { turnJustEnded: false, turnScore: 0 });
}

/** Host beendet das Spiel manuell vorzeitig. */
export async function endWordPotGameEarly(pin: string, hostPlayerId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as WordPotGame;
  if (game.hostPlayerId !== hostPlayerId || game.phase === 'finished') return;

  await update(gameRef, { phase: 'finished', finishedAt: Date.now() });
}
