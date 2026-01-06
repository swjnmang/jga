import { database } from './firebase';
import { ref, set, get, update, onValue, off, push, serverTimestamp, remove } from 'firebase/database';
import { Card } from './types';
import {
  GameSession,
  GroupData,
  PlayerInfo,
  CreateGameParams,
  JoinGameParams,
  GROUP_COLORS,
  GameState
} from './multiplayerTypes';

// Generiere einen 6-stelligen PIN
function generatePin(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generiere eine eindeutige ID
function generateId(): string {
  return push(ref(database)).key || Date.now().toString();
}

/**
 * Erstellt ein neues Multiplayer-Spiel
 */
export async function createGame(params: CreateGameParams): Promise<{ pin: string; groupId: string; playerId: string }> {
  const pin = generatePin();
  const hostGroupId = generateId();
  const hostPlayerId = generateId();
  
  const hostPlayer: PlayerInfo = {
    id: hostPlayerId,
    name: params.hostPlayerName,
    connected: true,
    lastSeen: Date.now()
  };

  const hostGroup: GroupData = {
    id: hostGroupId,
    name: params.hostGroupName,
    color: GROUP_COLORS[0],
    players: [hostPlayer],
    timeline: [],
    flexButtons: 3,
    score: 0,
    isReady: true
  };

  const gameSession: GameSession = {
    id: pin,
    hostId: hostGroupId,
    state: 'lobby',
    mode: params.mode,
    settings: params.settings,
    currentCardIndex: -1,
    currentCardId: null,
    deck: params.deck.map(card => card.id),
    groups: {
      [hostGroupId]: hostGroup
    },
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    maxGroups: params.maxGroups || 8
  };

  // Speichere in Firebase
  await set(ref(database, `games/${pin}`), gameSession);

  return { pin, groupId: hostGroupId, playerId: hostPlayerId };
}

/**
 * Tritt einem bestehenden Spiel bei
 */
export async function joinGame(params: JoinGameParams): Promise<{ groupId: string; playerId: string }> {
  const gameRef = ref(database, `games/${params.pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden. Bitte überprüfe den PIN.');
  }

  const game: GameSession = snapshot.val();

  if (game.state !== 'lobby') {
    throw new Error('Das Spiel hat bereits begonnen.');
  }

  const groupCount = Object.keys(game.groups).length;
  if (groupCount >= game.maxGroups) {
    throw new Error('Das Spiel ist bereits voll.');
  }

  // Erstelle neue Gruppe
  const newGroupId = generateId();
  const newPlayerId = generateId();

  const newPlayer: PlayerInfo = {
    id: newPlayerId,
    name: params.playerName,
    connected: true,
    lastSeen: Date.now()
  };

  const newGroup: GroupData = {
    id: newGroupId,
    name: params.groupName,
    color: GROUP_COLORS[groupCount % GROUP_COLORS.length],
    players: [newPlayer],
    timeline: [],
    flexButtons: 3,
    score: 0,
    isReady: false
  };

  // Füge Gruppe hinzu
  await update(ref(database, `games/${params.pin}/groups/${newGroupId}`), newGroup);

  return { groupId: newGroupId, playerId: newPlayerId };
}

/**
 * Startet das Spiel (nur Host)
 */
export async function startGame(pin: string, hostGroupId: string): Promise<void> {
  const gameRef = ref(database, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  if (game.hostId !== hostGroupId) {
    throw new Error('Nur der Host kann das Spiel starten.');
  }

  if (game.state !== 'lobby') {
    throw new Error('Das Spiel wurde bereits gestartet.');
  }

  // Überprüfe ob alle Gruppen bereit sind
  const allReady = Object.values(game.groups).every(group => group.isReady);
  if (!allReady) {
    throw new Error('Nicht alle Gruppen sind bereit.');
  }

  await update(gameRef, {
    state: 'playing',
    startedAt: Date.now(),
    currentCardIndex: 0,
    currentCardId: game.deck[0]
  });
}

/**
 * Markiert eine Gruppe als bereit
 */
export async function setGroupReady(pin: string, groupId: string, ready: boolean): Promise<void> {
  await update(ref(database, `games/${pin}/groups/${groupId}`), {
    isReady: ready
  });
}

/**
 * Geht zur nächsten Karte
 */
export async function nextCard(pin: string): Promise<void> {
  const gameRef = ref(database, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();
  const nextIndex = game.currentCardIndex + 1;

  if (nextIndex >= game.deck.length) {
    // Spiel beendet
    await update(gameRef, {
      state: 'finished',
      finishedAt: Date.now(),
      currentCardId: null
    });
  } else {
    await update(gameRef, {
      currentCardIndex: nextIndex,
      currentCardId: game.deck[nextIndex]
    });
  }
}

/**
 * Platziert eine Karte in der Timeline einer Gruppe
 */
export async function placeCard(
  pin: string,
  groupId: string,
  cardId: string,
  year: number,
  correct: boolean
): Promise<void> {
  const placedCard = {
    cardId,
    year,
    correct,
    placedAt: Date.now()
  };

  const timelineRef = ref(database, `games/${pin}/groups/${groupId}/timeline`);
  const snapshot = await get(timelineRef);
  const timeline = snapshot.exists() ? snapshot.val() : [];
  
  timeline.push(placedCard);

  await set(timelineRef, timeline);

  // Update Score wenn korrekt
  if (correct) {
    const groupRef = ref(database, `games/${pin}/groups/${groupId}`);
    const groupSnapshot = await get(groupRef);
    const group: GroupData = groupSnapshot.val();
    
    await update(groupRef, {
      score: group.score + 1
    });
  }
}

/**
 * Aktualisiert Flex Buttons
 */
export async function updateFlexButtons(pin: string, groupId: string, count: number): Promise<void> {
  await update(ref(database, `games/${pin}/groups/${groupId}`), {
    flexButtons: count
  });
}

/**
 * Lauscht auf Änderungen des Spielstatus
 */
export function subscribeToGame(pin: string, callback: (game: GameSession | null) => void): () => void {
  const gameRef = ref(database, `games/${pin}`);
  
  const unsubscribe = onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  // Rückgabe-Funktion zum Abmelden
  return () => off(gameRef);
}

/**
 * Aktualisiert den "Last Seen" Timestamp eines Spielers
 */
export async function updatePlayerPresence(pin: string, groupId: string, playerId: string): Promise<void> {
  const playerRef = ref(database, `games/${pin}/groups/${groupId}/players`);
  const snapshot = await get(playerRef);
  
  if (snapshot.exists()) {
    const players: PlayerInfo[] = snapshot.val();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex !== -1) {
      players[playerIndex].lastSeen = Date.now();
      await set(playerRef, players);
    }
  }
}

/**
 * Verlässt das Spiel
 */
export async function leaveGame(pin: string, groupId: string): Promise<void> {
  const gameRef = ref(database, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    return;
  }

  const game: GameSession = snapshot.val();

  // Wenn Host verlässt und Spiel noch in Lobby, lösche das Spiel
  if (game.hostId === groupId && game.state === 'lobby') {
    await remove(gameRef);
    return;
  }

  // Entferne Gruppe
  await remove(ref(database, `games/${pin}/groups/${groupId}`));
}

/**
 * Überprüft ob ein PIN existiert
 */
export async function checkPinExists(pin: string): Promise<boolean> {
  const snapshot = await get(ref(database, `games/${pin}`));
  return snapshot.exists();
}
