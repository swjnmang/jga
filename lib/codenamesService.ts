import { database } from './firebase';
import { ref, set, get, update, onValue, off, push } from 'firebase/database';
import {
  CodenamesGame,
  CodenamesCard,
  CodenamesCardType,
  CodenamesPlayer,
  CodenamesTeam,
  CodenamesLogEntry,
  CreateCodenamesParams,
  JoinCodenamesParams,
  BOARD_SIZE,
} from './codenamesTypes';
import { CODENAMES_WORDS } from './codenamesWords';

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

function buildBoard(startingTeam: CodenamesTeam): CodenamesCard[] {
  const words = shuffle(CODENAMES_WORDS).slice(0, BOARD_SIZE);
  const otherTeam: CodenamesTeam = startingTeam === 'red' ? 'blue' : 'red';
  const types: CodenamesCardType[] = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(otherTeam),
    ...Array(7).fill('neutral'),
    'assassin',
  ];
  const shuffledTypes = shuffle(types);
  return words.map((word, i) => ({
    id: `c${i}`,
    word,
    type: shuffledTypes[i],
    revealed: false,
    revealedBy: null,
  }));
}

function makeLogEntry(team: CodenamesTeam, type: CodenamesLogEntry['type'], text: string): CodenamesLogEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, team, type, text, at: Date.now() };
}

export async function checkPinExists(pin: string): Promise<boolean> {
  checkFirebase();
  const snap = await get(ref(database!, `games/${pin}`));
  return snap.exists();
}

/** Erstellt ein neues Codenames-Spiel. Der Ersteller wird direkt als erster Spieler registriert. */
export async function createCodenamesGame(
  params: CreateCodenamesParams
): Promise<{ pin: string; hostPlayerId: string }> {
  checkFirebase();

  let pin = generatePin();
  let attempts = 0;
  while (await checkPinExists(pin)) {
    pin = generatePin();
    attempts++;
    if (attempts > 10) throw new Error('Konnte keinen freien PIN generieren.');
  }

  const hostPlayerId = generateId();
  const hostPlayer: CodenamesPlayer = {
    id: hostPlayerId,
    name: params.hostPlayerName.trim() || 'Spielleiter',
    team: params.hostTeam,
    role: params.hostRole,
    joinedAt: Date.now(),
  };

  const game: CodenamesGame = {
    pin,
    hostPlayerId,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    phase: 'lobby',
    players: { [hostPlayerId]: hostPlayer },
    cards: [],
    startingTeam: 'red',
    currentTeam: 'red',
    clueWord: null,
    clueNumber: null,
    guessesMade: 0,
    guessesAllowed: 0,
    redRemaining: 9,
    blueRemaining: 8,
    winner: null,
    winReason: null,
    log: [],
  };

  await set(ref(database!, `games/${pin}`), game);
  return { pin, hostPlayerId };
}

export async function joinCodenamesGame(params: JoinCodenamesParams): Promise<{ playerId: string }> {
  checkFirebase();
  const gameRef = ref(database!, `games/${params.pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) throw new Error('Spiel nicht gefunden.');
  const game = snap.val() as CodenamesGame;
  if (game.phase !== 'lobby') throw new Error('Das Spiel läuft bereits.');

  if (params.role === 'spymaster') {
    const alreadyHasSpymaster = Object.values(game.players || {}).some(
      (p) => p.team === params.team && p.role === 'spymaster'
    );
    if (alreadyHasSpymaster) {
      throw new Error(`Dieses Team hat bereits einen Geheimdienstchef.`);
    }
  }

  const playerId = generateId();
  const player: CodenamesPlayer = {
    id: playerId,
    name: params.playerName.trim() || 'Spieler',
    team: params.team,
    role: params.role,
    joinedAt: Date.now(),
  };
  await set(ref(database!, `games/${params.pin}/players/${playerId}`), player);
  return { playerId };
}

export function subscribeToCodenamesGame(
  pin: string,
  callback: (game: CodenamesGame | null) => void
): () => void {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const listener = onValue(gameRef, (snap) => {
    callback(snap.exists() ? (snap.val() as CodenamesGame) : null);
  });
  return () => off(gameRef, 'value', listener);
}

/** Host startet das Spiel: Brett wird generiert, Startteam zufällig bestimmt. */
export async function startCodenamesGame(pin: string, hostPlayerId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as CodenamesGame;
  if (game.phase !== 'lobby' || game.hostPlayerId !== hostPlayerId) return;

  const players = Object.values(game.players || {});
  const teams: CodenamesTeam[] = ['red', 'blue'];
  for (const team of teams) {
    const teamPlayers = players.filter((p) => p.team === team);
    const hasSpymaster = teamPlayers.some((p) => p.role === 'spymaster');
    const hasOperative = teamPlayers.some((p) => p.role === 'operative');
    if (!hasSpymaster || !hasOperative) {
      throw new Error('Jedes Team braucht mindestens einen Geheimdienstchef und einen Ermittler.');
    }
  }

  const startingTeam: CodenamesTeam = Math.random() < 0.5 ? 'red' : 'blue';
  const cards = buildBoard(startingTeam);

  await update(gameRef, {
    phase: 'playing',
    startedAt: Date.now(),
    cards,
    startingTeam,
    currentTeam: startingTeam,
    clueWord: null,
    clueNumber: null,
    guessesMade: 0,
    guessesAllowed: 0,
    redRemaining: startingTeam === 'red' ? 9 : 8,
    blueRemaining: startingTeam === 'blue' ? 9 : 8,
    winner: null,
    winReason: null,
    log: [makeLogEntry(startingTeam, 'turnEnd', `${startingTeam === 'red' ? 'Rot' : 'Blau'} beginnt.`)],
  });
}

/** Der Geheimdienstchef des aktiven Teams gibt einen Hinweis. */
export async function giveCodenamesClue(
  pin: string,
  playerId: string,
  clueWord: string,
  clueNumber: number
): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as CodenamesGame;
  if (game.phase !== 'playing' || game.clueWord) return;

  const player = game.players[playerId];
  if (!player || player.team !== game.currentTeam || player.role !== 'spymaster') return;

  const trimmed = clueWord.trim();
  if (!trimmed) return;
  const number = Math.max(0, Math.min(9, Math.round(clueNumber)));
  const guessesAllowed = number === 0 ? BOARD_SIZE : number + 1;

  await update(gameRef, {
    clueWord: trimmed,
    clueNumber: number,
    guessesMade: 0,
    guessesAllowed,
    log: [
      ...(game.log || []),
      makeLogEntry(
        game.currentTeam,
        'clue',
        `${player.name} (${game.currentTeam === 'red' ? 'Rot' : 'Blau'}): „${trimmed}“ – ${number}`
      ),
    ],
  });
}

/** Ein Ermittler des aktiven Teams deckt eine Karte auf. */
export async function revealCodenamesCard(pin: string, playerId: string, cardId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as CodenamesGame;
  if (game.phase !== 'playing' || !game.clueWord) return;

  const player = game.players[playerId];
  if (!player || player.team !== game.currentTeam || player.role !== 'operative') return;

  const cardIndex = game.cards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1 || game.cards[cardIndex].revealed) return;

  const card = game.cards[cardIndex];
  const cards = [...game.cards];
  cards[cardIndex] = { ...card, revealed: true, revealedBy: game.currentTeam };

  const teamLabel = (t: CodenamesTeam) => (t === 'red' ? 'Rot' : 'Blau');
  const log = [
    ...(game.log || []),
    makeLogEntry(game.currentTeam, 'reveal', `${player.name} deckt „${card.word}“ auf (${
      card.type === 'assassin' ? 'Attentäter' : card.type === 'neutral' ? 'Neutral' : teamLabel(card.type)
    }).`),
  ];

  // Attentäter: Spiel endet sofort, das andere Team gewinnt.
  if (card.type === 'assassin') {
    await update(gameRef, {
      cards,
      phase: 'finished',
      finishedAt: Date.now(),
      winner: game.currentTeam === 'red' ? 'blue' : 'red',
      winReason: 'assassin',
      log,
    });
    return;
  }

  let redRemaining = game.redRemaining;
  let blueRemaining = game.blueRemaining;
  if (card.type === 'red') redRemaining -= 1;
  if (card.type === 'blue') blueRemaining -= 1;

  // Ein Team gewinnt, sobald alle seine Karten aufgedeckt sind - unabhängig davon, wer zieht.
  if (redRemaining <= 0 || blueRemaining <= 0) {
    await update(gameRef, {
      cards,
      redRemaining,
      blueRemaining,
      phase: 'finished',
      finishedAt: Date.now(),
      winner: redRemaining <= 0 ? 'red' : 'blue',
      winReason: 'allWordsFound',
      log,
    });
    return;
  }

  // Falsche Farbe (Gegner oder Neutral) getroffen: Zug endet sofort.
  if (card.type !== game.currentTeam) {
    const nextTeam: CodenamesTeam = game.currentTeam === 'red' ? 'blue' : 'red';
    await update(gameRef, {
      cards,
      redRemaining,
      blueRemaining,
      currentTeam: nextTeam,
      clueWord: null,
      clueNumber: null,
      guessesMade: 0,
      guessesAllowed: 0,
      log,
    });
    return;
  }

  // Richtige Farbe getroffen.
  const guessesMade = game.guessesMade + 1;
  if (guessesMade >= game.guessesAllowed) {
    const nextTeam: CodenamesTeam = game.currentTeam === 'red' ? 'blue' : 'red';
    await update(gameRef, {
      cards,
      redRemaining,
      blueRemaining,
      currentTeam: nextTeam,
      clueWord: null,
      clueNumber: null,
      guessesMade: 0,
      guessesAllowed: 0,
      log,
    });
    return;
  }

  await update(gameRef, { cards, redRemaining, blueRemaining, guessesMade, log });
}

/** Ein Ermittler des aktiven Teams beendet den Zug freiwillig. */
export async function passCodenamesTurn(pin: string, playerId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as CodenamesGame;
  if (game.phase !== 'playing' || !game.clueWord) return;

  const player = game.players[playerId];
  if (!player || player.team !== game.currentTeam || player.role !== 'operative') return;

  const nextTeam: CodenamesTeam = game.currentTeam === 'red' ? 'blue' : 'red';
  await update(gameRef, {
    currentTeam: nextTeam,
    clueWord: null,
    clueNumber: null,
    guessesMade: 0,
    guessesAllowed: 0,
    log: [
      ...(game.log || []),
      makeLogEntry(game.currentTeam, 'pass', `${player.name} beendet den Zug.`),
    ],
  });
}

/** Host beendet das Spiel manuell vorzeitig. */
export async function endCodenamesGameEarly(pin: string, hostPlayerId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return;
  const game = snap.val() as CodenamesGame;
  if (game.hostPlayerId !== hostPlayerId || game.phase === 'finished') return;

  await update(gameRef, { phase: 'finished', finishedAt: Date.now() });
}
