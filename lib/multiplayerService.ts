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

// Überprüfe ob Firebase verfügbar ist
function checkFirebase() {
  if (!database) {
    throw new Error('Firebase ist nicht konfiguriert. Bitte siehe FIREBASE_SETUP.md für Anweisungen.');
  }
}

// Generiere einen 6-stelligen PIN
function generatePin(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generiere eine eindeutige ID
function generateId(): string {
  checkFirebase();
  return push(ref(database!)).key || Date.now().toString();
}

/**
 * Erstellt ein neues Multiplayer-Spiel
 */
export async function createGame(params: CreateGameParams): Promise<{ pin: string; groupId: string; playerId: string }> {
  checkFirebase();
  
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
    flexButtons: 2,
    score: 0,
    isReady: true,
    flexActive: false
  };

  // Erzeuge eine feste Referenzkarte (1950)
  const referenceCard: Card = {
    id: 'reference-1950',
    title: 'Referenzjahr',
    category: 'schaetzfragen',
    year: 1950,
    cue: 'Referenzjahr',
    answer: 'Referenzjahr',
    difficulty: 'leicht',
    sources: {}
  };
  const actualDeck = params.deck; // Volles Deck verwenden

  const gameSession: GameSession = {
    id: pin,
    hostId: hostGroupId,
    state: 'lobby',
    mode: params.mode,
    settings: params.settings,
    currentCardIndex: 0,
    currentCardId: actualDeck.length > 0 ? actualDeck[0].id : null,
    currentTurnGroupId: null,
    deck: actualDeck.map(card => card.id),
    referenceCard,
    groups: {
      [hostGroupId]: hostGroup
    },
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    maxGroups: params.maxGroups || 8
  };

  // Speichere in Firebase
  await set(ref(database!, `games/${pin}`), gameSession);

  return { pin, groupId: hostGroupId, playerId: hostPlayerId };
}

/**
 * Tritt einem bestehenden Spiel bei
 */
export async function joinGame(params: JoinGameParams): Promise<{ groupId: string; playerId: string }> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${params.pin}`);
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

  // Gäste dürfen beitreten, auch wenn Musik-Kategorien aktiv sind.
  // Die Spotify-Verbindung wird nur vom Host benötigt und geprüft.

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
    flexButtons: 2,
    score: 0,
    isReady: false,
    flexActive: false
  };

  // Füge Gruppe hinzu
  await update(ref(database!, `games/${params.pin}/groups/${newGroupId}`), newGroup);

  return { groupId: newGroupId, playerId: newPlayerId };
}

/**
 * Startet das Spiel (nur Host)
 */
export async function startGame(pin: string, hostGroupId: string): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
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

  // Setze erste Gruppe als aktive Gruppe
  const groupIds = Object.keys(game.groups);
  const firstGroupId = groupIds[0];

  await update(gameRef, {
    state: 'playing',
    startedAt: Date.now(),
    currentCardIndex: 0,
    currentCardId: game.deck[0],
    currentTurnGroupId: firstGroupId
  });
}

/**
 * Markiert eine Gruppe als bereit
 */
export async function setGroupReady(pin: string, groupId: string, ready: boolean): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    isReady: ready
  });
}

/**
 * Aktiviert/Deaktiviert den Flex-Button einer Gruppe
 */
export async function toggleFlexButton(pin: string, groupId: string, active: boolean): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    flexActive: active
  });
}

/**
 * Platziert eine Karte für die aktive Gruppe
 */
export async function placeCardInTimeline(
  pin: string,
  groupId: string,
  card: any, // Card object
  position: number // Index in der Display-Timeline (inklusive Referenzkarte) wo die Karte eingefügt wird
): Promise<boolean> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();
  const group = game.groups[groupId];
  
  if (!group) {
    throw new Error('Gruppe nicht gefunden.');
  }

  const safeTimeline = Array.isArray(group.timeline) ? group.timeline : [];

  // Erstelle Display-Timeline: Referenzkarte + platzierte Karten (zur Validierung)
  const displayTimeline = [];
  if (game.referenceCard) {
    displayTimeline.push(game.referenceCard);
  }
  displayTimeline.push(...safeTimeline);
  // Sortiere für Validierung
  displayTimeline.sort((a, b) => a.year - b.year);
  
  // Validiere die Platzierung basierend auf der Display-Timeline
  let isCorrect = false;
  
  if (position === 0) {
    // Vor alle Karten
    isCorrect = displayTimeline.length === 0 || card.year <= displayTimeline[0].year;
  } else if (position >= displayTimeline.length) {
    // Nach alle Karten
    isCorrect = card.year >= displayTimeline[displayTimeline.length - 1].year;
  } else {
    // Zwischen zwei Karten
    const before = displayTimeline[position - 1];
    const after = displayTimeline[position];
    isCorrect = card.year >= before.year && card.year <= after.year;
  }
  
  // NUR bei korrekter Platzierung wird die Karte zur Timeline hinzugefügt
  let finalTimeline = safeTimeline;
  if (isCorrect) {
    finalTimeline = [...safeTimeline, card];
    // Sortiere Timeline (klein -> groß)
    finalTimeline.sort((a, b) => a.year - b.year);
  }
  
  // Update Gruppe
  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    timeline: finalTimeline,
    score: isCorrect ? finalTimeline.length : group.score
  });

  // Wenn die aktive Gruppe falsch platziert hat, prüfe Flex-Gruppen
  if (game.currentTurnGroupId === groupId && !isCorrect) {
    await handleFlexSteal(pin, card, game);
  }

  return isCorrect;
}

/**
 * Behandelt Flex-Button Karten-Klau-Mechanik
 */
async function handleFlexSteal(pin: string, card: any, game: GameSession): Promise<void> {
  // Finde alle Gruppen mit aktivem Flex-Button
  const flexGroups = Object.entries(game.groups)
    .filter(([gid, g]) => g.flexActive && gid !== game.currentTurnGroupId)
    .map(([gid]) => gid);

  // Für jede Flex-Gruppe: prüfe ob sie die Karte korrekt platzieren würde
  // (Das wird in der UI entschieden, hier nur vorbereiten)
}

/**
 * Geht zur nächsten Gruppe (Rundenende)
 */
export async function nextTurn(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();
  const groupIds = Object.keys(game.groups);
  const currentIndex = groupIds.indexOf(game.currentTurnGroupId || '');
  const nextIndex = (currentIndex + 1) % groupIds.length;
  const nextGroupId = groupIds[nextIndex];

  // Reset alle Flex-Buttons
  const updates: Record<string, any> = {
    currentTurnGroupId: nextGroupId
  };

  groupIds.forEach(gid => {
    updates[`groups/${gid}/flexActive`] = false;
  });

  // Prüfe ob eine Gruppe gewonnen hat (10 Karten korrekt)
  const winner = Object.values(game.groups).find(g => g.score >= 10);
  if (winner) {
    updates.state = 'finished';
    updates.finishedAt = Date.now();
  }

  await update(gameRef, updates);
}

/**
 * Geht zur nächsten Karte
 */
export async function nextCard(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();
  const nextIndex = game.currentCardIndex + 1;

  if (nextIndex >= game.deck.length) {
    // Keine Karten mehr
    await update(gameRef, {
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
 * Aktualisiert Flex Buttons
 */
export async function updateFlexButtons(pin: string, groupId: string, count: number): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    flexButtons: count
  });
}

/**
 * Lauscht auf Änderungen des Spielstatus
 */
export function subscribeToGame(pin: string, callback: (game: GameSession | null) => void): () => void {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  
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
  checkFirebase();
  const playerRef = ref(database!, `games/${pin}/groups/${groupId}/players`);
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
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
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
  await remove(ref(database!, `games/${pin}/groups/${groupId}`));
}

/**
 * Überprüft ob ein PIN existiert
 */
export async function checkPinExists(pin: string): Promise<boolean> {
  checkFirebase();
  const snapshot = await get(ref(database!, `games/${pin}`));
  return snapshot.exists();
}

/**
 * Sendet einen Playback-Befehl (play/pause/stop) an den Host
 */
export async function sendPlaybackControl(
  pin: string,
  groupId: string,
  action: 'play' | 'pause' | 'stop',
  cardId: string
): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), {
    playbackControl: {
      action,
      cardId,
      timestamp: Date.now(),
      requestedBy: groupId
    }
  });
}
