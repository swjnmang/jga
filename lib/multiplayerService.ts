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
    flexActive: false,
    isHost: true
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
    flexActive: false,
    isHost: false
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

  // Setze erste nicht-Host Gruppe als aktive Gruppe
  const groupIds = Object.keys(game.groups);
  const firstGroupId = groupIds.find(id => !game.groups[id].isHost);

  if (!firstGroupId) {
    throw new Error('Keine Spielgruppen verfügbar.');
  }

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

  // Bei falscher Platzierung: gehe zur nächsten Karte und nächsten Gruppe
  if (!isCorrect) {
    await nextCard(pin);
    await nextTurn(pin);
    return false;
  }

  // Prüfe Auto-Win Bedingung bei korrekter Platzierung (Timeline: 10 Karten = Gewinn)
  await checkAutoWinTimeline(pin);

  return isCorrect;
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
  
  // Nur spielende Gruppen (nicht Host)
  const playingGroupIds = Object.entries(game.groups)
    .filter(([_, group]) => !group.isHost)
    .map(([id]) => id);
  
  if (playingGroupIds.length === 0) {
    throw new Error('Keine spielenden Gruppen gefunden.');
  }

  const currentIndex = playingGroupIds.indexOf(game.currentTurnGroupId || '');
  const nextIndex = (currentIndex + 1) % playingGroupIds.length;
  const nextGroupId = playingGroupIds[nextIndex];

  // Reset alle Flex-Buttons
  const updates: Record<string, any> = {
    currentTurnGroupId: nextGroupId
  };

  const allGroupIds = Object.keys(game.groups);
  allGroupIds.forEach(gid => {
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

/**
 * Fordert einen Flex-Button an (von aktiver Gruppe)
 */
export async function requestFlexButton(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();
  const group = game.groups[groupId];

  if (!group || groupId !== game.currentTurnGroupId) {
    throw new Error('Nur die aktive Gruppe kann Flex anfordern.');
  }

  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    flexRequested: true,
    lastFlexRequest: Date.now()
  });

  // Setze flexPendingGroupId in GameSession
  await update(gameRef, {
    flexPendingGroupId: groupId
  });
}

/**
 * Host bestätigt Flex-Button (gibt +1 Punkt)
 */
export async function confirmFlexButton(pin: string, hostGroupId: string, targetGroupId: string): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  if (game.hostId !== hostGroupId) {
    throw new Error('Nur der Host kann Flex bestätigen.');
  }

  const targetGroup = game.groups[targetGroupId];
  if (!targetGroup) {
    throw new Error('Gruppe nicht gefunden.');
  }

  // +1 Punkt für die Gruppe
  await update(ref(database!, `games/${pin}/groups/${targetGroupId}`), {
    score: targetGroup.score + 1,
    flexRequested: false
  });

  // Entferne flexPendingGroupId
  await update(gameRef, {
    flexPendingGroupId: null
  });
}

/**
 * Host lehnt Flex-Button ab
 */
export async function rejectFlexButton(pin: string, hostGroupId: string): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  if (game.hostId !== hostGroupId) {
    throw new Error('Nur der Host kann Flex ablehnen.');
  }

  const pendingGroupId = game.flexPendingGroupId;
  if (pendingGroupId) {
    await update(ref(database!, `games/${pin}/groups/${pendingGroupId}`), {
      flexRequested: false
    });
  }

  await update(gameRef, {
    flexPendingGroupId: null
  });
}

/**
 * Host ändert den Score einer Gruppe
 */
export async function editGroupScore(pin: string, hostGroupId: string, targetGroupId: string, newScore: number): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  if (game.hostId !== hostGroupId) {
    throw new Error('Nur der Host kann Punkte ändern.');
  }

  const targetGroup = game.groups[targetGroupId];
  if (!targetGroup) {
    throw new Error('Gruppe nicht gefunden.');
  }

  const sanitizedScore = Math.max(0, Math.round(newScore));

  await update(ref(database!, `games/${pin}/groups/${targetGroupId}`), {
    score: sanitizedScore
  });
}

/**
 * Host beendet das Spiel (nur Timeline/Trivia, nicht wenn bereits beendet)
 */
export async function endGame(pin: string, hostGroupId: string): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  if (game.hostId !== hostGroupId) {
    throw new Error('Nur der Host kann das Spiel beenden.');
  }

  if (game.state === 'finished') {
    throw new Error('Das Spiel ist bereits beendet.');
  }

  // Finde Gewinner (höchster Score)
  const groups = Object.values(game.groups);
  let winner: GroupData | null = null;
  let maxScore = -1;

  for (const group of groups) {
    if (group.score > maxScore) {
      maxScore = group.score;
      winner = group;
    }
  }

  await update(gameRef, {
    state: 'finished',
    finishedAt: Date.now(),
    winnerGroupId: winner ? winner.id : null
  });
}

/**
 * Prüft Auto-Win Bedingung für Timeline (erste Gruppe mit 10 Karten)
 */
export async function checkAutoWinTimeline(pin: string): Promise<void> {
  checkFirebase();
  
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  // Nur für Timeline-Spiele
  if (game.mode !== 'timeline') {
    return;
  }

  // Prüfe ob eine Gruppe 10 Karten hat
  const groups = Object.values(game.groups);
  let winner: GroupData | null = null;

  for (const group of groups) {
    if (group.timeline.length >= 10) {
      winner = group;
      break;
    }
  }

  if (winner) {
    await update(gameRef, {
      state: 'finished',
      finishedAt: Date.now(),
      winnerGroupId: winner.id
    });
  }
}
