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
    flexButtons: 1,
    score: 0,
    isReady: true,
    flexActive: false,
    isHost: true
  };

  // Erzeuge eine feste Referenzkarte (1990)
  const referenceCard: Card = {
    id: 'reference-1990',
    title: 'Referenzjahr',
    category: 'schaetzfragen',
    year: 1990,
    cue: 'Referenzjahr',
    answer: 'Referenzjahr',
    difficulty: 'leicht',
    sources: {}
  };
  const actualDeck = params.deck; // Volles Deck verwenden

  // Metadaten für alle Modi (für Ban-Phase und Trivia-Gewinnbedingung)
  const deckMeta: Record<string, string> = {};
  const deckCatSet = new Set<string>();
  for (const card of actualDeck) {
    deckMeta[card.id] = card.category;
    deckCatSet.add(card.category);
  }
  const deckCategories = Array.from(deckCatSet);

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
    triviaCategories: deckCategories,
    deckMeta,
    ...(params.mode === 'trivia' ? {
      availableDeck: actualDeck.map(c => c.id),
    } : {
      availableDeck: actualDeck.map(c => c.id), // Timeline also needs availableDeck for category rotation
    }),
    banModeEnabled: params.mode === 'trivia' ? (params.banModeEnabled ?? false) : false,
    triviaWinCondition: params.mode === 'trivia' ? (params.triviaWinCondition ?? 'categories') : 'categories',
    timelineWinTarget: params.mode === 'timeline' ? (params.timelineWinTarget ?? 10) : undefined,
    groups: {
      [hostGroupId]: { ...hostGroup, completedCategories: [] }
    },
    createdAt: Date.now(),
    lastActivity: Date.now(),
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

  // Spiel nach 3 Stunden Inaktivität automatisch schließen
  const STALE_MS = 3 * 60 * 60 * 1000;
  if (Date.now() - (game.lastActivity ?? game.createdAt) > STALE_MS) {
    await remove(gameRef);
    throw new Error('Dieses Spiel ist abgelaufen (mehr als 3 Stunden ohne Aktivität). Bitte erstelle ein neues Spiel.');
  }

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
    flexButtons: 1,
    score: 0,
    isReady: false,
    flexActive: false,
    isHost: false,
    completedCategories: [],
    avatar: params.avatar ?? '',
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

  // Reihenfolge der Gruppen für die Ban-Phase (alle Nicht-Host-Gruppen)
  const nonHostGroupIds = Object.keys(game.groups).filter(id => !game.groups[id].isHost);

  if (nonHostGroupIds.length === 0) {
    throw new Error('Keine Spielgruppen verfügbar.');
  }

  if (game.banModeEnabled && game.mode === 'trivia') {
    // Ban-Phase starten
    await update(gameRef, {
      state: 'banning',
      startedAt: Date.now(),
      lastActivity: Date.now(),
      bannedCategories: [],
      banPhaseGroupOrder: nonHostGroupIds,
      banPhaseCurrentIndex: 0,
    });
  } else {
    // Ban-Phase überspringen → direkt zu playing
    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const availableDeck: string[] = game.availableDeck ?? game.deck ?? [];
    const triviaCategories: string[] = Array.isArray(game.triviaCategories)
      ? game.triviaCategories
      : Object.values(game.triviaCategories ?? {});
    const shuffledCats = shuffleArray([...triviaCategories]);
    let firstCat = '';
    let firstCardId: string | null = null;
    let catQueueStart: string[] = [];
    for (let i = 0; i < shuffledCats.length; i++) {
      const card = availableDeck.find(id => deckMeta[id] === shuffledCats[i]);
      if (card) { firstCat = shuffledCats[i]; firstCardId = card; catQueueStart = shuffledCats.slice(i + 1); break; }
    }
    if (!firstCardId) firstCardId = availableDeck[0] ?? null;
    const firstGroupId = nonHostGroupIds[0];
    const updates: Record<string, unknown> = {
      state: 'playing',
      startedAt: Date.now(),
      lastActivity: Date.now(),
      bannedCategories: [],
      currentCardIndex: 0,
      currentCardId: firstCardId,
      currentTurnGroupId: firstGroupId,
      currentRoundCategory: firstCat,
      categoryRoundQueue: catQueueStart,
      categoryGroupQueue: [...nonHostGroupIds],
      // Kanonische Kategorien-Reihenfolge: einmal zufällig gemischt, danach immer in dieser Reihenfolge rotiert
      triviaCategories: shuffledCats,
    };
    if (game.availableDeck !== undefined || game.mode === 'timeline') {
      updates.availableDeck = availableDeck;
    }
    await update(gameRef, updates);
  }
}

/**
 * Bannt eine Kategorie (oder überspringt die Ban-Runde mit null)
 */
export async function banCategory(pin: string, groupId: string, category: string | null): Promise<void> {
  checkFirebase();

  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (game.state !== 'banning') throw new Error('Nicht in der Ban-Phase.');

  const order = game.banPhaseGroupOrder ?? [];
  const currentIndex = game.banPhaseCurrentIndex ?? 0;
  if (order[currentIndex] !== groupId) throw new Error('Du bist gerade nicht an der Reihe.');

  const newBanned: string[] = [...(game.bannedCategories ?? []), ...(category ? [category] : [])];
  const newIndex = currentIndex + 1;
  const banDone = newIndex >= order.length;

  if (banDone) {
    // Ban-Phase abgeschlossen → Deck filtern und Spiel starten
    const bannedSet = new Set(newBanned);
    const filteredDeck = (game.deck ?? []).filter(cardId => !bannedSet.has((game.deckMeta ?? {})[cardId] ?? ''));
    const filteredAvailable = game.availableDeck
      ? game.availableDeck.filter(cardId => !bannedSet.has((game.deckMeta ?? {})[cardId] ?? ''))
      : undefined;

    // Erste nicht-Host-Gruppe als aktiven Spieler setzen
    const firstGroupId = order[0];

    // Trivia-Rotation initialisieren: zufällig gemischte Kategorien-Runde
    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const deckForLookup = filteredAvailable ?? filteredDeck;
    const filteredCats: string[] = game.triviaCategories
      ? game.triviaCategories.filter(c => !bannedSet.has(c))
      : [];
    const shuffledCats = shuffleArray(filteredCats);
    let firstCat = '';
    let firstCardId: string | null = null;
    let catQueueStart: string[] = [];
    for (let i = 0; i < shuffledCats.length; i++) {
      const card = deckForLookup.find(id => deckMeta[id] === shuffledCats[i]);
      if (card) { firstCat = shuffledCats[i]; firstCardId = card; catQueueStart = shuffledCats.slice(i + 1); break; }
    }
    if (!firstCardId) firstCardId = deckForLookup[0] ?? null;

    const updates: Record<string, unknown> = {
      state: 'playing',
      lastActivity: Date.now(),
      bannedCategories: newBanned,
      banPhaseCurrentIndex: newIndex,
      deck: filteredDeck,
      currentCardIndex: 0,
      currentCardId: firstCardId,
      currentTurnGroupId: firstGroupId,
      currentRoundCategory: firstCat,
      categoryRoundQueue: catQueueStart,
      categoryGroupQueue: [...order],
    };
    if (filteredAvailable !== undefined) {
      updates.availableDeck = filteredAvailable;
    }
    // Auch triviaCategories aktualisieren (gebannte herausfiltern)
    if (game.triviaCategories) {
      updates.triviaCategories = filteredCats;
    }
    await update(gameRef, updates);
  } else {
    await update(gameRef, {
      bannedCategories: newBanned,
      banPhaseCurrentIndex: newIndex,
      lastActivity: Date.now(),
    });
  }
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
  
  // Compute the correct position (first position where card fits chronologically)
  let flexPhaseCorrectPosition = displayTimeline.length; // default: after all
  for (let i = 0; i <= displayTimeline.length; i++) {
    let fits = false;
    if (i === 0) {
      fits = displayTimeline.length === 0 || card.year <= displayTimeline[0].year;
    } else if (i >= displayTimeline.length) {
      fits = card.year >= displayTimeline[displayTimeline.length - 1].year;
    } else {
      fits = card.year >= displayTimeline[i - 1].year && card.year <= displayTimeline[i].year;
    }
    if (fits) { flexPhaseCorrectPosition = i; break; }
  }

  // NUR bei korrekter Platzierung wird die Karte zur Timeline hinzugefügt
  let finalTimeline = safeTimeline;
  if (isCorrect) {
    finalTimeline = [...safeTimeline, card];
    // Sortiere Timeline (klein -> groß)
    finalTimeline.sort((a, b) => a.year - b.year);
  }
  
  // Update Gruppe (Score nur bei korrekter Platzierung)
  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    timeline: finalTimeline,
    score: isCorrect ? (group.score ?? 0) + 1 : (group.score ?? 0)
  });

  // Flex-Phase öffnen (andere Gruppen können tippen)
  await update(gameRef, {
    flexPhaseActive: true,
    flexTips: {},
    activeGroupPlacedPosition: position,
    flexPhaseCorrectPosition,
    flexPhaseCard: card, // Karte für Flex-Gewinner (falls aktive Gruppe falsch lag)
  });

  // KEIN automatischer nextCard/nextTurn hier – die Page steuert das
  // (sonst würde falsche Platzierung doppelt voranschreiten)

  // Prüfe Auto-Win Bedingung bei korrekter Platzierung (Timeline: 10 Karten = Gewinn)
  if (isCorrect) {
    await checkAutoWinTimeline(pin);
  }

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
    lastActivity: Date.now(),
    currentTurnGroupId: nextGroupId
  };

  const allGroupIds = Object.keys(game.groups);
  allGroupIds.forEach(gid => {
    updates[`groups/${gid}/flexActive`] = false;
  });

  // Prüfe ob eine Gruppe gewonnen hat
  const winTarget = game.timelineWinTarget ?? 10;
  const winner = Object.values(game.groups).find(g => g.score >= winTarget);
  if (winner) {
    updates.state = 'finished';
    updates.finishedAt = Date.now();
  }

  await update(gameRef, updates);
}

export async function nextCard(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) {
    throw new Error('Spiel nicht gefunden.');
  }

  const game: GameSession = snapshot.val();

  if (game.mode === 'timeline') {
    // ── Timeline: category-rotation (same as Trivia) ──────────────────────────
    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const triviaCategories: string[] = Array.isArray(game.triviaCategories)
      ? game.triviaCategories
      : Object.values(game.triviaCategories ?? {});
    const prevAvailable: string[] = Array.isArray(game.availableDeck)
      ? game.availableDeck
      : Object.values(game.availableDeck ?? {});
    const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);
    const catGroupQueue: string[] = Array.isArray(game.categoryGroupQueue)
      ? game.categoryGroupQueue
      : Object.values(game.categoryGroupQueue ?? {});
    const catRoundQueue: string[] = Array.isArray(game.categoryRoundQueue)
      ? game.categoryRoundQueue
      : Object.values(game.categoryRoundQueue ?? {});
    const currentRoundCat = game.currentRoundCategory ?? '';
    const playingGroupIds = Object.entries(game.groups)
      .filter(([_, g]) => !g.isHost)
      .map(([id]) => id);

    // In Timeline, all groups are always eligible (no "collect category" mechanic)
    const groupCompletedCats: Record<string, string[]> = {};
    playingGroupIds.forEach(gid => { groupCompletedCats[gid] = []; });

    const next = computeNextTurn(
      playingGroupIds, currentRoundCat, catGroupQueue, catRoundQueue,
      triviaCategories, newAvailable, deckMeta,
      groupCompletedCats, 'points' // 'points' = always eligible
    );

    const updates: Record<string, unknown> = {
      lastActivity: Date.now(),
      availableDeck: newAvailable,
      currentCardId: next.nextCardId,
      currentCardIndex: (game.currentCardIndex ?? 0) + 1,
      currentTurnGroupId: next.nextGroupId,
      currentRoundCategory: next.currentRoundCategory,
      categoryRoundQueue: next.categoryRoundQueue,
      categoryGroupQueue: next.categoryGroupQueue,
      pendingResult: null,
    };

    // Reset flex buttons
    Object.keys(game.groups).forEach(gid => {
      updates[`groups/${gid}/flexActive`] = false;
    });

    // Check win condition
    const winTarget = game.timelineWinTarget ?? 10;
    const winner = Object.values(game.groups).find(g => !g.isHost && g.score >= winTarget);
    if (winner) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
      updates.winnerGroupId = winner.id;
    } else if (!next.nextCardId) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
    }

    await update(gameRef, updates);
    return;
  }

  // ── Legacy sequential path (not used for Timeline anymore) ────────────────

  const deck: string[] = Array.isArray(game.deck)
    ? game.deck
    : Object.values(game.deck ?? {});
  const nextIndex = (game.currentCardIndex ?? 0) + 1;

  if (nextIndex >= deck.length) {
    // Keine Karten mehr
    await update(gameRef, {
      lastActivity: Date.now(),
      currentCardId: null
    });
  } else {
    await update(gameRef, {
      lastActivity: Date.now(),
      currentCardIndex: nextIndex,
      currentCardId: deck[nextIndex]
    });
  }
}

/**
 * Überspringt die aktuelle Karte – gleiche Gruppe bleibt dran, neue Karte wird geladen.
 * Funktioniert in beiden Modi (timeline & trivia).
 */
export async function skipCard(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();

  if (game.mode === 'timeline') {
    // Timeline skip: same group stays active, pick new card from same category
    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const prevAvailable: string[] = Array.isArray(game.availableDeck)
      ? game.availableDeck
      : Object.values(game.availableDeck ?? {});
    const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);
    const currentCat = game.currentRoundCategory ?? (game.currentCardId ? deckMeta[game.currentCardId] : '');
    const catPool = newAvailable.filter(id => deckMeta[id] === currentCat);
    const nextCardId = catPool.length > 0
      ? catPool[Math.floor(Math.random() * catPool.length)]
      : newAvailable[0] ?? null;
    await update(gameRef, {
      lastActivity: Date.now(),
      availableDeck: newAvailable,
      currentCardId: nextCardId,
    });
    return;
  }

  if (game.mode === 'trivia') {
    // Trivia: aktuelle Karte aus availableDeck entfernen, neue Karte gleicher Kategorie oder beliebig
    const prevAvailable: string[] = Array.isArray(game.availableDeck)
      ? game.availableDeck
      : Object.values(game.availableDeck ?? {});
    const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);

    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const currentCat = game.currentRoundCategory ?? (game.currentCardId ? deckMeta[game.currentCardId] : '');
    // Nächste Karte: gleiche Kategorie bevorzugt, sonst beliebige
    const nextCardId =
      newAvailable.find(id => deckMeta[id] === currentCat) ??
      newAvailable[0] ??
      null;

    await update(gameRef, {
      lastActivity: Date.now(),
      availableDeck: newAvailable,
      currentCardId: nextCardId,
    });
  } else {
    // Timeline: nächste Karte im Deck, gleiche Gruppe bleibt aktiv
    const deck: string[] = Array.isArray(game.deck)
      ? game.deck
      : Object.values(game.deck ?? {});
    const nextIndex = (game.currentCardIndex ?? 0) + 1;
    if (nextIndex >= deck.length) {
      await update(gameRef, { lastActivity: Date.now(), currentCardId: null });
    } else {
      await update(gameRef, {
        lastActivity: Date.now(),
        currentCardIndex: nextIndex,
        currentCardId: deck[nextIndex],
      });
    }
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
const STALE_GAME_MS = 3 * 60 * 60 * 1000; // 3 Stunden

export function subscribeToGame(pin: string, callback: (game: GameSession | null) => void): () => void {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  
  const unsubscribe = onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      const game: GameSession = snapshot.val();
      // Abgelaufene Spiele automatisch löschen
      if (Date.now() - (game.lastActivity ?? game.createdAt) > STALE_GAME_MS) {
        remove(gameRef).catch(() => {});
        callback(null);
        return;
      }
      callback(game);
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
 * Sendet die aktuell gewählte (noch nicht eingereichte) Position der aktiven Gruppe
 * an Firebase, damit der Host sie live sieht.
 */
export async function broadcastPendingPosition(pin: string, groupId: string, position: number | null): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}/groups/${groupId}`), { pendingPosition: position ?? null });
}

/**
 * Schreibt das Platzierungsergebnis nach Firebase, damit der Host "Weiter" steuern kann.
 */
export async function broadcastPlacementResult(pin: string, result: 'correct' | 'wrong' | null): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), { pendingResult: result ?? null });
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
 * Gruppe setzt einen Flex-Button ein → neue Karte aus derselben Kategorie, gleiche Gruppe bleibt dran.
 */
export async function spendFlexButton(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  const group = game.groups[groupId];
  if (!group) throw new Error('Gruppe nicht gefunden.');
  if (groupId !== game.currentTurnGroupId) throw new Error('Nur die aktive Gruppe kann Flex einsetzen.');
  if ((group.flexButtons ?? 0) < 1) throw new Error('Keine Flex-Buttons mehr vorhanden.');

  // Flex-Button abziehen
  const newFlex = (group.flexButtons ?? 1) - 1;
  await update(ref(database!, `games/${pin}/groups/${groupId}`), { flexButtons: newFlex });

  // Neue Karte aus gleicher Kategorie (wie skipCard in Timeline-Modus)
  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  const prevAvailable: string[] = Array.isArray(game.availableDeck)
    ? game.availableDeck
    : Object.values(game.availableDeck ?? {});
  const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);
  const currentCat = game.currentRoundCategory ?? (game.currentCardId ? deckMeta[game.currentCardId] : '');
  const catPool = newAvailable.filter(id => deckMeta[id] === currentCat);
  const nextCardId = catPool.length > 0
    ? catPool[Math.floor(Math.random() * catPool.length)]
    : newAvailable[0] ?? null;

  await update(gameRef, {
    lastActivity: Date.now(),
    availableDeck: newAvailable,
    currentCardId: nextCardId,
    pendingResult: null,
    pendingFlexAward: null,
  });
}

/**
 * Nicht-spielende Gruppe setzt einen Flex-Button als Tipp ein (nach Platzierung der aktiven Gruppe).
 * First-come-first-served: Wenn die Position schon belegt ist, wird die Anfrage abgelehnt.
 * Der Flex-Button wird sofort abgezogen.
 */
export async function submitFlexTip(pin: string, groupId: string, position: number): Promise<{ ok: boolean; reason?: string }> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) return { ok: false, reason: 'Spiel nicht gefunden.' };

  const game: GameSession = snapshot.val();
  if (!game.flexPhaseActive) return { ok: false, reason: 'Flex-Phase nicht aktiv.' };
  if (groupId === game.currentTurnGroupId) return { ok: false, reason: 'Die spielende Gruppe kann keinen Flex-Tipp abgeben.' };

  const group = game.groups[groupId];
  if (!group || (group.flexButtons ?? 0) < 1) return { ok: false, reason: 'Kein Flex-Button verfügbar.' };

  // Gesperrte Position: die Position der spielenden Gruppe
  if (position === game.activeGroupPlacedPosition) return { ok: false, reason: 'Diese Position ist gesperrt (von der spielenden Gruppe belegt).' };

  // First-come-first-served: Position darf noch nicht vergeben sein
  const existingTips: Record<string, string> = game.flexTips ?? {};
  if (existingTips[position.toString()]) return { ok: false, reason: 'Diese Position ist bereits von einer anderen Gruppe belegt.' };

  // Flex-Button abziehen + Tipp speichern (atomar)
  await update(ref(database!, `games/${pin}/groups/${groupId}`), {
    flexButtons: (group.flexButtons ?? 1) - 1,
  });
  await update(ref(database!, `games/${pin}/flexTips`), {
    [position.toString()]: groupId,
  });
  return { ok: true };
}

/**
 * Host beendet die Flex-Phase, wertet Tipps aus und geht zur nächsten Karte.
 * - Wenn aktive Gruppe falsch lag UND ein Flex-Tipp die korrekte Position hatte → Karte geht an diese Gruppe.
 * - Alle Gruppen die einen Flex-Tipp abgegeben haben, haben bereits ihren Button verloren (in submitFlexTip).
 */
export async function resolveFlexPhaseAndNext(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  const flexTips: Record<string, string> = game.flexTips ?? {};
  const correctPos = game.flexPhaseCorrectPosition;
  const pendingResult = game.pendingResult;

  // Wenn aktive Gruppe falsch lag: prüfe ob ein Tipp die korrekte Position trifft
  if (pendingResult === 'wrong' && correctPos !== undefined && correctPos !== null) {
    const winnerGroupId = flexTips[correctPos.toString()];
    if (winnerGroupId) {
      const winnerGroup = game.groups[winnerGroupId];
      const currentCardId = game.currentCardId;
      const card = currentCardId ? Object.values(game.groups).flatMap(g =>
        (Array.isArray(g.timeline) ? g.timeline : [])
      ).find(c => c.id === currentCardId) ?? null : null;

      // Karte aus playlistCards/cards holen — wir müssen sie aus dem Deck rekonstruieren
      // Die Karte ist im currentCardId gespeichert, aber nicht direkt im game.
      // Wir übergeben die Karte als Parameter oder holen sie aus dem deckMeta.
      // Einfacher: Wir speichern die aktuelle Karte als Teil der Flex-Phase.
      // Für jetzt: Award +1 Punkt + Karte (falls wir sie haben)
      if (winnerGroup) {
        const updates: Record<string, any> = {
          score: (winnerGroup.score ?? 0) + 1,
        };
        // Karte in Timeline des Gewinners (falls die Karte im flexPhaseCard gespeichert wurde)
        if ((game as any).flexPhaseCard) {
          const safeTimeline = Array.isArray(winnerGroup.timeline) ? winnerGroup.timeline : [];
          const newTimeline = [...safeTimeline, (game as any).flexPhaseCard].sort((a: any, b: any) => a.year - b.year);
          updates.timeline = newTimeline;
        }
        await update(ref(database!, `games/${pin}/groups/${winnerGroupId}`), updates);
        // Auto-Win prüfen
        await checkAutoWinTimeline(pin);
      }
    }
  }

  // Flex-Phase schließen, Ergebnis clearen
  await update(gameRef, {
    flexPhaseActive: false,
    flexTips: null,
    activeGroupPlacedPosition: null,
    flexPhaseCorrectPosition: null,
    flexPhaseCard: null,
    pendingResult: null,
    pendingFlexAward: null,
  });

  // Nächste Karte + nächste Gruppe
  await nextCard(pin);
}

/**
 * Host vergibt einen Flex-Button an eine Gruppe (nach korrekter Antwort auf Titel/Interpret etc.)
 */
export async function awardFlexButton(pin: string, targetGroupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  const group = game.groups[targetGroupId];
  if (!group) throw new Error('Gruppe nicht gefunden.');

  await update(ref(database!, `games/${pin}/groups/${targetGroupId}`), {
    flexButtons: (group.flexButtons ?? 0) + 1,
  });
  await update(gameRef, { pendingFlexAward: null });
}

/**
 * Host lehnt Flex-Vergabe ab (nach Antwortbewertung)
 */
export async function declineFlexAward(pin: string): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), { pendingFlexAward: null });
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
    const tl = Array.isArray(group.timeline)
      ? group.timeline
      : Object.values(group.timeline ?? {});
    const winTarget = game.timelineWinTarget ?? 10;
    if (tl.length >= winTarget) {
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
// ---------------------------------------------------------------------------
// Kategorie-Rotations-Helfer (Trivia)
// ---------------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface NextTurnResult {
  nextGroupId: string;
  nextCardId: string | null;
  currentRoundCategory: string;
  categoryRoundQueue: string[];
  categoryGroupQueue: string[];
}

/**
 * Berechnet den nächsten Spielzustand nach einem Trivia-Zug.
 * - Gleiche Kategorie, nächste Gruppe, falls noch Gruppen übrig (und noch nicht gesammelt).
 * - Nächste Kategorie (zufällig), berechtigte Gruppen spielen, wenn Kategorie-Runde fertig.
 * - Schätzfragen-Ausnahme: alle Gruppen spielen stets mit.
 * - Im Punkte-Modus: keine Kategorie-Filterung.
 */
function computeNextTurn(
  playingGroupIds: string[],
  currentRoundCat: string,
  catGroupQueue: string[],    // [0] = active group, rest = pending
  catRoundQueue: string[],    // remaining categories this round
  triviaCategories: string[], // all categories
  newAvailable: string[],
  deckMeta: Record<string, string>,
  groupCompletedCategories: Record<string, string[]>,  // gid -> completed cats (with updated active group)
  winCondition: string        // 'categories' | 'points'
): NextTurnResult {
  // Eine Gruppe ist für eine Kategorie spielberechtigt wenn:
  // - Modus ist Punkte, ODER
  // - Kategorie ist 'schaetzfragen' (jeder kann immer mitspielen), ODER
  // - Die Gruppe hat diese Kategorie noch nicht gesammelt
  const isEligible = (gid: string, cat: string): boolean => {
    if (winCondition !== 'categories') return true;
    if (cat === 'schaetzfragen') return true;
    return !(groupCompletedCategories[gid] ?? []).includes(cat);
  };

  // Finde die passende Kategorie + Karte für eine Gruppe:
  // Bevorzuge preferredCat, weicht auf nächste unerledigte Kategorie aus.
  const findCardForGroup = (gid: string, preferredCat: string, extraSearchOrder: string[]): { cardId: string; cat: string } | null => {
    if (isEligible(gid, preferredCat)) {
      const matches = newAvailable.filter(id => deckMeta[id] === preferredCat);
      if (matches.length > 0) {
        return { cardId: matches[Math.floor(Math.random() * matches.length)], cat: preferredCat };
      }
    }
    const searchOrder = [...extraSearchOrder, ...triviaCategories.filter(c => !extraSearchOrder.includes(c) && c !== preferredCat)];
    for (const cat of searchOrder) {
      if (!isEligible(gid, cat)) continue;
      const matches = newAvailable.filter(id => deckMeta[id] === cat);
      if (matches.length > 0) {
        return { cardId: matches[Math.floor(Math.random() * matches.length)], cat };
      }
    }
    return null;
  };

  // Verbleibende Gruppen in dieser Kategorie – ALLE behalten (kein Skip!)
  // Gruppen die currentRoundCat schon haben, bekommen eine andere Kategorie.
  const remainingGroups = catGroupQueue.slice(1); // strict round-robin, never skip

  if (remainingGroups.length > 0) {
    const nextGroupId = remainingGroups[0];
    const found = findCardForGroup(nextGroupId, currentRoundCat, catRoundQueue);
    if (found !== null) {
      return {
        nextGroupId,
        nextCardId: found.cardId,
        currentRoundCategory: found.cat,
        categoryRoundQueue: catRoundQueue,
        categoryGroupQueue: remainingGroups,
      };
    }
    // Keine Karte mehr für diese Gruppe → Kategorie-Runde beenden
  }

  // Alle Gruppen fertig → nächste Kategorie
  // Neue Runde startet bei der Gruppe NACH der zuletzt spielenden Gruppe (striktes Round-Robin)
  const lastPlayedGroupId = catGroupQueue[0] ?? '';
  const lastPlayedIdx = playingGroupIds.indexOf(lastPlayedGroupId);
  // Rotierte Gruppen-Reihenfolge: beginnt bei der Gruppe nach der zuletzt spielenden
  const rotatedGroupIds = lastPlayedIdx >= 0
    ? [...playingGroupIds.slice(lastPlayedIdx + 1), ...playingGroupIds.slice(0, lastPlayedIdx + 1)]
    : [...playingGroupIds];

  // Alle Gruppen fertig → nächste Kategorie (striktes Round-Robin: rotiere ab aktueller Kategorie)
  // Nie neu mischen — die einmalig beim Spielstart festgelegte Reihenfolge wird immer wiederholt.
  const nextCatQueue = (() => {
    if (catRoundQueue.length > 0) return catRoundQueue;
    // Queue leer → nächste Runde: starte bei der Kategorie NACH der aktuellen
    const lastCatIdx = triviaCategories.indexOf(currentRoundCat);
    return lastCatIdx >= 0
      ? [...triviaCategories.slice(lastCatIdx + 1), ...triviaCategories.slice(0, lastCatIdx + 1)]
      : [...triviaCategories];
  })();
  const tryQueue = nextCatQueue;
  for (let i = 0; i < tryQueue.length; i++) {
    const nextCat = tryQueue[i];
    const catPool = newAvailable.filter(id => deckMeta[id] === nextCat);
    if (catPool.length === 0) continue;
    const firstGroup = rotatedGroupIds[0];
    // card for firstGroup (may fall back to different category if they completed nextCat)
    const found = findCardForGroup(firstGroup, nextCat, tryQueue.slice(i + 1));
    if (found !== null) {
      return {
        nextGroupId: firstGroup,
        nextCardId: found.cardId,
        currentRoundCategory: nextCat, // keep the round's category consistent for other groups
        categoryRoundQueue: tryQueue.slice(i + 1),
        categoryGroupQueue: [...rotatedGroupIds],
      };
    }
  }

  // Keine Karten mehr überhaupt
  return {
    nextGroupId: rotatedGroupIds[0],
    nextCardId: null,
    currentRoundCategory: currentRoundCat,
    categoryRoundQueue: [],
    categoryGroupQueue: [...rotatedGroupIds],
  };
}

// ---------------------------------------------------------------------------
/**
 * Trivia-Modus: Host bewertet Antwort der aktiven Gruppe.
 * Trivial-Pursuit-Gewinnbedingung: alle Kategorien im Deck korrekt beantwortet.
 */
export async function submitTriviaAnswer(pin: string, correct: boolean): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  const triviaCategories: string[] = Array.isArray(game.triviaCategories)
    ? game.triviaCategories
    : Object.values(game.triviaCategories ?? {});

  const playingGroupIds = Object.entries(game.groups)
    .filter(([_, g]) => !g.isHost)
    .map(([id]) => id);

  const activeGroupId = game.currentTurnGroupId!;

  // completedCategories der aktiven Gruppe
  const prevCompleted: string[] = Array.isArray(game.groups[activeGroupId]?.completedCategories)
    ? game.groups[activeGroupId].completedCategories!
    : Object.values(game.groups[activeGroupId]?.completedCategories ?? {}) as string[];

  const currentCategory = game.currentCardId ? (deckMeta[game.currentCardId] ?? '') : '';
  const newCompleted = correct && currentCategory && !prevCompleted.includes(currentCategory)
    ? [...prevCompleted, currentCategory]
    : prevCompleted;

  // Karte aus availableDeck entfernen
  const prevAvailable: string[] = Array.isArray(game.availableDeck)
    ? game.availableDeck
    : Object.values(game.availableDeck ?? {});
  const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);

  // Kategorie-Rotation
  const catGroupQueue: string[] = Array.isArray(game.categoryGroupQueue)
    ? game.categoryGroupQueue
    : Object.values(game.categoryGroupQueue ?? { 0: activeGroupId });
  const catRoundQueue: string[] = Array.isArray(game.categoryRoundQueue)
    ? game.categoryRoundQueue
    : Object.values(game.categoryRoundQueue ?? {});
  const currentRoundCat = game.currentRoundCategory ?? currentCategory;

  // Gesammelte Kategorien pro Gruppe (für Kategorie-Filterung im categories-Modus)
  const winCondition = game.triviaWinCondition ?? 'categories';
  const groupCompletedCategories: Record<string, string[]> = {};
  Object.entries(game.groups).forEach(([gid, g]) => {
    const completed: string[] = Array.isArray(g.completedCategories)
      ? g.completedCategories
      : Object.values(g.completedCategories ?? {}) as string[];
    // Für die aktive Gruppe: bereits aktualisierte Liste verwenden
    groupCompletedCategories[gid] = gid === activeGroupId ? newCompleted : completed;
  });

  const next = computeNextTurn(
    playingGroupIds, currentRoundCat, catGroupQueue, catRoundQueue, triviaCategories, newAvailable, deckMeta,
    groupCompletedCategories, winCondition
  );

  const updates: Record<string, any> = {
    lastActivity: Date.now(),
    [`groups/${activeGroupId}/score`]: correct
      ? (game.groups[activeGroupId]?.score ?? 0) + 1
      : (game.groups[activeGroupId]?.score ?? 0),
    [`groups/${activeGroupId}/completedCategories`]: newCompleted,
    availableDeck: newAvailable,
    currentTurnGroupId: next.nextGroupId,
    currentRoundCategory: next.currentRoundCategory,
    categoryRoundQueue: next.categoryRoundQueue,
    categoryGroupQueue: next.categoryGroupQueue,
  };

  // Reset flex-active
  Object.keys(game.groups).forEach(gid => {
    updates[`groups/${gid}/flexActive`] = false;
  });

  // Gewinnbedingung prüfen
  if (winCondition === 'categories') {
    // Kategorie-Modus: aktive Gruppe hat alle Kategorien abgehakt?
    if (correct && triviaCategories.length > 0 && newCompleted.length >= triviaCategories.length) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
      updates.winnerGroupId = activeGroupId;
    } else if (!next.nextCardId) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
    } else {
      updates.currentCardId = next.nextCardId;
      updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
    }
  } else {
    // Punkte-Modus: Spiel endet wenn Deck leer, Gewinner = meiste Punkte
    if (!next.nextCardId) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
      const allGroups = Object.entries(game.groups).filter(([_, g]) => !g.isHost);
      // Berücksichtige den soeben aktualisierten Score
      const winnerEntry = allGroups.reduce((best, [id, g]) => {
        const sc = id === activeGroupId ? (correct ? (g.score ?? 0) + 1 : (g.score ?? 0)) : (g.score ?? 0);
        return sc > best.score ? { id, score: sc } : best;
      }, { id: allGroups[0]?.[0] ?? '', score: -1 });
      updates.winnerGroupId = winnerEntry.id;
    } else {
      updates.currentCardId = next.nextCardId;
      updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
    }
  }

  await update(gameRef, updates);
}

// ---------------------------------------------------------------------------
// Helpers für Schätzfragen (client-seitig aufrufbar)
// ---------------------------------------------------------------------------

export function parseGermanNumber(str: string): number {
  // Deutsches Format: Punkt = Tausendertrennzeichen, Komma = Dezimaltrennzeichen
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
}

export function extractNumericFromAnswer(answer: string): number {
  // Match German numbers: digits with optional thousand-dots and/or decimal-comma
  const match = answer.match(/[\d]+(?:[.,][\d]+)*/);
  if (!match) return NaN;
  return parseGermanNumber(match[0]);
}

/**
 * Erkennt "von X bis Y"- oder "X bis Y"- oder "zwischen X und Y"-Antworten
 * und gibt untere/obere Grenze zurück. Sonst null (= konkreter Einzelwert).
 */
export function extractRangeFromAnswer(answer: string): { low: number; high: number } | null {
  // Muster: (von)? Zahl (bis|–|-|und) Zahl, z.B. "von 1.000 bis 2.000" oder "500–1.500"
  const rangeRe = /(?:von\s+)?([\d.,]+)\s*(?:bis|–|-|und)\s*([\d.,]+)/i;
  const m = answer.match(rangeRe);
  if (!m) return null;
  const low = parseGermanNumber(m[1]);
  const high = parseGermanNumber(m[2]);
  if (isNaN(low) || isNaN(high)) return null;
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

export function extractUnitFromAnswer(answer: string): string {
  const match = answer.match(/[\d.,]+\s+([A-Za-zÄÖÜäöüß]+(?:\s+[A-Za-zÄÖÜäöüß]+)?)/);
  return match ? match[1] : '';
}

/**
 * Gruppe reicht ihre Schätzung für eine Schätzfrage ein
 */
export async function submitSchaetzGuess(pin: string, groupId: string, guess: string): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}/groups/${groupId}`), { schaetzSubmission: guess });
}

/**
 * Host wertet Schätzfrage aus.
 * winnerGroupIds: Alle Gruppen die am nächsten dran waren (Unentschieden möglich).
 */
export async function showSchaetzResult(
  pin: string,
  result: { answer: string; winnerIds: string[]; submissions: { groupId: string; groupName: string; value: string; isWinner: boolean; color: string; }[] }
): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), { schaetzResult: result, lastActivity: Date.now() });
}

export async function evaluateSchaetzfrage(pin: string, winnerGroupIds: string[]): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  const triviaCategories: string[] = Array.isArray(game.triviaCategories)
    ? game.triviaCategories
    : Object.values(game.triviaCategories ?? {});

  const playingGroupIds = Object.entries(game.groups)
    .filter(([_, g]) => !g.isHost)
    .map(([id]) => id);

  const activeGroupId = game.currentTurnGroupId!;
  const currentIndex = playingGroupIds.indexOf(activeGroupId);
  const nextGroupId = playingGroupIds[(currentIndex + 1) % playingGroupIds.length];

  const currentCategory = game.currentCardId ? (deckMeta[game.currentCardId] ?? '') : '';

  const prevAvailable: string[] = Array.isArray(game.availableDeck)
    ? game.availableDeck
    : Object.values(game.availableDeck ?? {});
  const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);

  const updates: Record<string, any> = {
    lastActivity: Date.now(),
    availableDeck: newAvailable,
    currentTurnGroupId: nextGroupId,
  };

  // Kategorie-Rotation: Schätzfrage alle Gruppen spielen gleichzeitig
  // → nach Auswertung direkt zur nächsten Kategorie (gesamte Gruppe-Queue verbraucht)
  const catRoundQueue: string[] = Array.isArray(game.categoryRoundQueue)
    ? game.categoryRoundQueue
    : Object.values(game.categoryRoundQueue ?? {});
  const currentRoundCat = game.currentRoundCategory ?? currentCategory;
  const winConditionS = game.triviaWinCondition ?? 'categories';

  // Gesammelte Kategorien pro Gruppe (schon nach Gewinner-Update)
  const groupCompletedCatsS: Record<string, string[]> = {};
  Object.entries(game.groups).forEach(([gid, g]) => {
    const prev: string[] = Array.isArray(g.completedCategories)
      ? g.completedCategories
      : Object.values(g.completedCategories ?? {}) as string[];
    // Gewinnergruppen haben currentCategory jetzt gesammelt
    if (winnerGroupIds.includes(gid) && currentCategory && !prev.includes(currentCategory)) {
      groupCompletedCatsS[gid] = [...prev, currentCategory];
    } else {
      groupCompletedCatsS[gid] = prev;
    }
  });

  // Simulate all groups consumed → pass empty group queue to force category advance
  const next = computeNextTurn(
    playingGroupIds, currentRoundCat, [], catRoundQueue, triviaCategories, newAvailable, deckMeta,
    groupCompletedCatsS, winConditionS
  );

  // Punkte + completedCategories für ALLE Gewinnergruppen (Unentschieden)
  let anyFinished = false;
  let firstWinnerId: string | null = null;
  for (const wid of winnerGroupIds) {
    const prevCompleted: string[] = Array.isArray(game.groups[wid]?.completedCategories)
      ? game.groups[wid].completedCategories!
      : Object.values(game.groups[wid]?.completedCategories ?? {}) as string[];
    const newCompleted = currentCategory && !prevCompleted.includes(currentCategory)
      ? [...prevCompleted, currentCategory]
      : prevCompleted;
    updates[`groups/${wid}/score`] = (game.groups[wid]?.score ?? 0) + 1;
    updates[`groups/${wid}/completedCategories`] = newCompleted;
    if (triviaCategories.length > 0 && newCompleted.length >= triviaCategories.length) {
      anyFinished = true;
      firstWinnerId = firstWinnerId ?? wid;
    }
  }

  updates.currentTurnGroupId = next.nextGroupId;
  updates.currentRoundCategory = next.currentRoundCategory;
  updates.categoryRoundQueue = next.categoryRoundQueue;
  updates.categoryGroupQueue = next.categoryGroupQueue;

  // Schätzungen + Flex-State + Ergebnis-Anzeige zurücksetzen
  updates.schaetzResult = null;
  Object.keys(game.groups).forEach(gid => {
    updates[`groups/${gid}/schaetzSubmission`] = null;
    updates[`groups/${gid}/flexActive`] = false;
  });

  // Gewinnbedingung prüfen (Schätzfrage)
  if (winConditionS === 'categories') {
    if (anyFinished) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
      updates.winnerGroupId = firstWinnerId;
    } else if (!next.nextCardId) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
    } else {
      updates.currentCardId = next.nextCardId;
      updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
    }
  } else {
    // Punkte-Modus
    if (!next.nextCardId) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
      const allGroupsS = Object.entries(game.groups).filter(([_, g]) => !g.isHost);
      const winnerEntryS = allGroupsS.reduce((best, [id, g]) => {
        const sc = winnerGroupIds.includes(id) ? (g.score ?? 0) + 1 : (g.score ?? 0);
        return sc > best.score ? { id, score: sc } : best;
      }, { id: allGroupsS[0]?.[0] ?? '', score: -1 });
      updates.winnerGroupId = winnerEntryS.id;
    } else {
      updates.currentCardId = next.nextCardId;
      updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
    }
  }

  await update(gameRef, updates);
}