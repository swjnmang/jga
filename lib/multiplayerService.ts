import { database, isFirebaseEnabled } from './firebase';
import { ref, set, get, update, onValue, off, push, serverTimestamp, remove, onDisconnect, runTransaction } from 'firebase/database';
import { Card } from './types';
import {
  GameSession,
  GroupData,
  PlayerInfo,
  CreateGameParams,
  JoinGameParams,
  GROUP_COLORS,
  GameState,
  HighscoreEntry
} from './multiplayerTypes';
import { NextTurnResult, computeNextTurn, maybeInjectSchaetzfrage, pickCardRespectingDifficulty } from './triviaEngine';

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

  // Im spielleitungslosen Modus ist die erstellende Gruppe eine ganz normale
  // spielende Gruppe (kein separates, nicht-spielendes Spielleiter-Konto).
  // game.hostId identifiziert sie weiterhin — nur noch für den "Spiel starten"-Button.
  const hostGroup: GroupData = {
    id: hostGroupId,
    name: params.hostGroupName,
    color: GROUP_COLORS[0],
    players: [hostPlayer],
    timeline: [],
    flexButtons: 1,
    score: 0,
    isReady: !params.hostless,
    flexActive: false,
    isHost: !params.hostless,
    ...(params.hostless ? { avatar: params.hostAvatar ?? '' } : {}),
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
  const difficultyMeta: Record<string, string> = {};
  const deckCatSet = new Set<string>();
  for (const card of actualDeck) {
    deckMeta[card.id] = card.category;
    difficultyMeta[card.id] = card.difficulty;
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
    difficultyMeta,
    ...(params.mode === 'trivia' ? {
      availableDeck: actualDeck.map(c => c.id),
    } : {
      availableDeck: actualDeck.map(c => c.id), // Timeline also needs availableDeck for category rotation
    }),
    banModeEnabled: params.mode === 'trivia' ? (params.banModeEnabled ?? false) : false,
    triviaWinCondition: params.mode === 'trivia' ? (params.triviaWinCondition ?? 'categories') : 'categories',
    timelineWinTarget: params.mode === 'timeline' ? (params.timelineWinTarget ?? 10) : null,
    jokersEnabled: params.mode === 'trivia' ? (params.jokersEnabled ?? true) : false,
    singleDeviceMode: params.mode === 'trivia' ? (params.singleDeviceMode ?? false) : false,
    hostless: params.hostless ?? false,
    hostTextAnswersEnabled: params.mode === 'trivia' ? (params.hostTextAnswersEnabled ?? true) : false,
    groups: {
      [hostGroupId]: {
        ...hostGroup,
        completedCategories: [],
        ...(params.hostless && params.mode === 'trivia' && (params.jokersEnabled ?? true)
          ? { jokers: { newQuestion: true, next: true, dice: true, steal: !params.singleDeviceMode } }
          : {}),
      }
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

  if (game.jokersEnabled) {
    newGroup.jokers = { newQuestion: true, next: true, dice: true, steal: !game.singleDeviceMode };
  }

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
      banPhaseDeadline: Date.now() + 60000,
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
      const matches = availableDeck.filter(id => deckMeta[id] === shuffledCats[i]);
      if (matches.length > 0) { firstCat = shuffledCats[i]; firstCardId = matches[Math.floor(Math.random() * matches.length)]; catQueueStart = shuffledCats.slice(i + 1); break; }
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
      const matches = deckForLookup.filter(id => deckMeta[id] === shuffledCats[i]);
      if (matches.length > 0) { firstCat = shuffledCats[i]; firstCardId = matches[Math.floor(Math.random() * matches.length)]; catQueueStart = shuffledCats.slice(i + 1); break; }
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
      banPhaseDeadline: Date.now() + 60000,
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

  const safeTimeline = Array.isArray(group.timeline) ? group.timeline : Object.values(group.timeline ?? {}) as any[];

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
    // ── Timeline: Kategorie-pro-Runde via computeNextTurn ─────────────────────
    // Alle Gruppen spielen stets mit (kein Kategorie-Sammeln), daher winCondition='points'.
    // categoryRoundQueue hält die geordnete Abfolge der verbleibenden Kategorien.
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

    // Im Timeline-Modus haben alle Gruppen immer alle Kategorien verfügbar
    const groupCompletedCats: Record<string, string[]> = {};
    playingGroupIds.forEach(gid => { groupCompletedCats[gid] = []; });

    const next = computeNextTurn(
      playingGroupIds, currentRoundCat, catGroupQueue, catRoundQueue,
      triviaCategories, newAvailable, deckMeta,
      groupCompletedCats, 'points' // 'points' = immer spielberechtigt
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

    // Flex-Status zurücksetzen
    Object.keys(game.groups).forEach(gid => {
      updates[`groups/${gid}/flexActive`] = false;
    });

    // Gewinnbedingung prüfen
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
    // Timeline skip: gleiche Gruppe bleibt dran, neue Karte aus SELBER Kategorie
    const prevAvailable: string[] = Array.isArray(game.availableDeck)
      ? game.availableDeck
      : Object.values(game.availableDeck ?? {});
    const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);
    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const roundCat = game.currentRoundCategory ?? '';
    const catPool = newAvailable.filter(id => deckMeta[id] === roundCat);
    const nextCardId = catPool.length > 0
      ? catPool[Math.floor(Math.random() * catPool.length)]
      : (newAvailable.length > 0 ? newAvailable[Math.floor(Math.random() * newAvailable.length)] : null);
    // categoryGroupQueue bleibt unverändert (gleiche Gruppe)
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
    // Nächste Karte: zufällig aus gleicher Kategorie, sonst zufällig beliebige
    const catPool = newAvailable.filter(id => deckMeta[id] === currentCat);
    const nextCardId = catPool.length > 0
      ? catPool[Math.floor(Math.random() * catPool.length)]
      : (newAvailable.length > 0 ? newAvailable[Math.floor(Math.random() * newAvailable.length)] : null);

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
 * Trackt die Online-Präsenz eines Spielers über RTDB onDisconnect.
 * Wird unabhängig vom Host-Status verwendet, u.a. um im spielleitungslosen
 * Modus stimmberechtigte (verbundene) Gruppen zu ermitteln.
 * Gibt eine Cleanup-Funktion zurück.
 */
export function trackPresence(pin: string, groupId: string, playerId: string): () => void {
  if (!database) return () => {};
  const presenceRef = ref(database, `games/${pin}/presence/${groupId}/${playerId}`);
  const connectedRef = ref(database, '.info/connected');

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) return;
    onDisconnect(presenceRef).remove();
    set(presenceRef, true).catch(() => {});
  });

  return () => {
    unsubscribe();
    set(presenceRef, null).catch(() => {});
  };
}

/** Ist mindestens ein Spieler der Gruppe laut Presence-Tracking online? */
function isGroupOnline(game: GameSession, groupId: string): boolean {
  const playerPresence = game.presence?.[groupId];
  if (!playerPresence) return false;
  return Object.values(playerPresence).some(Boolean);
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
  await update(ref(database!, `games/${pin}`), { pendingResult: result ?? null, resultRevealed: false });
}

/**
 * Host klickt "Auswertung" — Ergebnis wird für die spielende Gruppe sichtbar gemacht.
 */
export async function revealResult(pin: string): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), { resultRevealed: true });
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
 * Aktualisiert Position/Dauer der laufenden Musikwiedergabe, damit alle Mitspieler
 * (nicht nur der Spielleiter) eine echte Fortschrittsanzeige sehen.
 */
export async function updateMusicProgress(
  pin: string,
  cardId: string,
  positionMs: number,
  durationMs: number
): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), {
    musicProgress: {
      cardId,
      positionMs,
      durationMs,
      updatedAt: Date.now()
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
    resultRevealed: false,
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

  // Gesperrte Positionen: die Position der spielenden Gruppe + Positionen, die die neue Karte flankieren
  const activeGroup = game.groups[game.currentTurnGroupId!];
  const safeTimeline = Array.isArray(activeGroup?.timeline) ? activeGroup.timeline : Object.values(activeGroup?.timeline ?? {}) as any[];
  const buildDisplay = () => {
    const d: any[] = [];
    if (game.referenceCard) d.push(game.referenceCard);
    d.push(...safeTimeline);
    return d.sort((a, b) => a.year - b.year);
  };
  const displayTimeline = buildDisplay();
  const newCardIdx = game.currentCardId
    ? displayTimeline.findIndex((c: any) => c.id === game.currentCardId)
    : -1;
  const flankedPositions = newCardIdx >= 0
    ? new Set([newCardIdx, newCardIdx + 1])
    : new Set<number>();

  if (position === game.activeGroupPlacedPosition || flankedPositions.has(position)) {
    return { ok: false, reason: 'Diese Position ist gesperrt.' };
  }

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
        (Array.isArray(g.timeline) ? g.timeline : Object.values(g.timeline ?? {}) as any[])
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
          const safeTimeline = Array.isArray(winnerGroup.timeline) ? winnerGroup.timeline : Object.values(winnerGroup.timeline ?? {}) as any[];
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
    resultRevealed: false,
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

// ---------------------------------------------------------------------------
// Spielleitungsloser Modus: Abstimmung "Spiel jetzt beenden?"
// Da es keine Spielleitung gibt, kann jede Gruppe eine Abstimmung starten;
// bei mehr als der Hälfte der spielenden Gruppen dafür wird das Spiel beendet.
// ---------------------------------------------------------------------------

/**
 * Startet eine Abstimmung, ob das Spiel jetzt beendet werden soll. Die
 * startende Gruppe stimmt automatisch mit "Ja".
 */
export async function startEndGameVote(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.hostless) throw new Error('Nur im spielleitungslosen Modus verfügbar.');
  if (game.endGameVote) throw new Error('Es läuft bereits eine Abstimmung.');
  if (!game.groups[groupId] || game.groups[groupId].isHost) throw new Error('Nicht stimmberechtigt.');

  await update(gameRef, {
    endGameVote: { initiatedBy: groupId, votes: { [groupId]: true } },
    lastActivity: Date.now(),
  });
}

/**
 * Gibt eine Stimme in der laufenden "Spiel beenden?"-Abstimmung ab.
 */
export async function castEndGameVote(pin: string, groupId: string, voteToEnd: boolean): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.endGameVote) throw new Error('Keine Abstimmung aktiv.');
  if (!game.groups[groupId] || game.groups[groupId].isHost) throw new Error('Nicht stimmberechtigt.');

  await update(ref(database!, `games/${pin}/endGameVote/votes`), { [groupId]: voteToEnd });
}

/**
 * Bricht die laufende "Spiel beenden?"-Abstimmung ab (keine Mehrheit möglich
 * oder alle haben abgestimmt, ohne dass die Mehrheit erreicht wurde).
 */
export async function cancelEndGameVote(pin: string): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), { endGameVote: null });
}

/**
 * Beendet das Spiel per Mehrheitsentscheid (kein Host-Check, da im
 * spielleitungslosen Modus jede Gruppe dazu berechtigt ist, sobald die
 * Abstimmung eine Mehrheit ergeben hat).
 */
export async function endGameByVote(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (game.state === 'finished') return; // bereits beendet (Race-Schutz)

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
    winnerGroupId: winner ? winner.id : null,
    endGameVote: null,
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

// ---------------------------------------------------------------------------
// Helper: Kategorie-Modus – Gewinner auflösen (Punkte-Tiebreaker → Schätzfragen-Stechen)
// ---------------------------------------------------------------------------
function applyTriviaWinResolution(
  updates: Record<string, any>,
  leaders: string[],             // Gruppen, die alle Kategorien gesammelt haben
  game: GameSession,
  updatedScores: Record<string, number>, // gid → aktueller (ggf. soeben erhöhter) Score
  deckMeta: Record<string, string>,
  newAvailable: string[],
  next: NextTurnResult,
): void {
  // Finalen Runden-State aufräumen
  updates.triviaFinalRound = null;
  updates.triviaFinalRoundPending = null;
  updates.triviaLeaders = null;

  if (leaders.length === 0) {
    updates.state = 'finished';
    updates.finishedAt = Date.now();
    return;
  }

  if (leaders.length === 1) {
    updates.state = 'finished';
    updates.finishedAt = Date.now();
    updates.winnerGroupId = leaders[0];
    return;
  }

  // Mehrere Sieger → Punkte als Tiebreaker
  const maxScore = Math.max(...leaders.map(gid => updatedScores[gid] ?? (game.groups[gid]?.score ?? 0)));
  const pointLeaders = leaders.filter(gid => (updatedScores[gid] ?? (game.groups[gid]?.score ?? 0)) === maxScore);

  if (pointLeaders.length === 1) {
    updates.state = 'finished';
    updates.finishedAt = Date.now();
    updates.winnerGroupId = pointLeaders[0];
    return;
  }

  // Immer noch Gleichstand → Schätzfragen-Stechen
  const schaetzPool = newAvailable.filter(id => deckMeta[id] === 'schaetzfragen');
  const tiebreakerCardId = schaetzPool.length > 0
    ? schaetzPool[Math.floor(Math.random() * schaetzPool.length)]
    : (newAvailable.length > 0 ? newAvailable[Math.floor(Math.random() * newAvailable.length)] : null);

  if (!tiebreakerCardId) {
    // Keine Karten mehr → ersten Punktsieger nehmen (Edge-Case)
    updates.state = 'finished';
    updates.finishedAt = Date.now();
    updates.winnerGroupId = pointLeaders[0];
    return;
  }

  updates.triviaTiebreakerActive = true;
  updates.triviaTiebreakerGroupIds = pointLeaders;
  updates.currentCardId = tiebreakerCardId;
  updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
  // Schätzungs-Eingaben für alle zurücksetzen
  Object.keys(game.groups).forEach(gid => {
    updates[`groups/${gid}/schaetzSubmission`] = null;
    updates[`groups/${gid}/flexActive`] = false;
  });
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

  // ── Joker 2 "NEXT" – Auflösung ────────────────────────────────────────────
  // Die "Ziel"-Gruppe hat die weitergegebene Frage beantwortet.
  // Richtig → niemand bekommt Punkt, Zug geht normal weiter.
  // Falsch  → Ursprungsgruppe bekommt Punkt + Kategorie.
  const isJokerNextResolution = game.jokerNextActive === true;
  const jokerNextOriginId = game.jokerNextOriginGroupId ?? null;
  const isJokerStealResolution = game.jokerStealActive === true;
  const jokerStealFromId = game.jokerStealFromGroupId ?? null;
  const isJokerStealReturn = game.jokerStealReturnActive === true;

  // completedCategories der Gruppe, die den Punkt ggf. bekommt
  const scoringGroupId =
    (isJokerStealResolution && !correct && jokerStealFromId)
      ? jokerStealFromId                                           // STEAL falsch → bestohlen Gruppe bekommt Punkt
      : (isJokerNextResolution && !correct && jokerNextOriginId)
      ? jokerNextOriginId                                          // NEXT falsch → Ursprungsgruppe bekommt Punkt
      : activeGroupId;

  const prevCompleted: string[] = Array.isArray(game.groups[scoringGroupId]?.completedCategories)
    ? game.groups[scoringGroupId].completedCategories!
    : Object.values(game.groups[scoringGroupId]?.completedCategories ?? {}) as string[];

  const currentCategory = game.currentCardId ? (deckMeta[game.currentCardId] ?? '') : '';

  // Punkt und Kategorie nur wenn: (normal korrekt) oder (NEXT-Joker + falsch → Ursprungsgruppe gewinnt) oder (STEAL-Joker: immer jemand)
  const awardPoint = isJokerStealResolution ? true : (isJokerNextResolution ? !correct : correct);
  const newCompleted = awardPoint && currentCategory && !prevCompleted.includes(currentCategory)
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

  // Original-Queues vor computeNextTurn speichern (für STEAL-Rückgabe-Zug-Restaurierung)
  const origCatGroupQueue = catGroupQueue;
  const origCatRoundQueue = catRoundQueue;
  const origCurrentRoundCat = currentRoundCat;

  // Gesammelte Kategorien pro Gruppe (für Kategorie-Filterung im categories-Modus)
  const winCondition = game.triviaWinCondition ?? 'categories';
  const groupCompletedCategories: Record<string, string[]> = {};
  Object.entries(game.groups).forEach(([gid, g]) => {
    const completed: string[] = Array.isArray(g.completedCategories)
      ? g.completedCategories
      : Object.values(g.completedCategories ?? {}) as string[];
    groupCompletedCategories[gid] = gid === scoringGroupId ? newCompleted : completed;
  });

  // Fehlversuche pro Kategorie (Frust-Vermeidung): zählt für die Gruppe, die die Frage
  // tatsächlich beantwortet hat (activeGroupId) — unabhängig davon, wer bei NEXT/STEAL
  // am Ende den Punkt bekommt. Ab 3 Fehlversuchen wird die nächste Frage dieser
  // Kategorie für diese Gruppe bevorzugt aus Schwierigkeit "leicht" gezogen; eine
  // richtige Antwort während dieser Phase setzt den Zähler wieder auf 0.
  const prevFails = game.groups[activeGroupId]?.categoryFails?.[currentCategory] ?? 0;
  const newFails = !currentCategory || currentCategory === 'schaetzfragen'
    ? prevFails
    : correct
    ? (prevFails >= 3 ? 0 : prevFails)
    : prevFails + 1;
  const groupCategoryFails: Record<string, Record<string, number>> = {};
  Object.entries(game.groups).forEach(([gid, g]) => {
    const fails = g.categoryFails ?? {};
    groupCategoryFails[gid] = gid === activeGroupId && currentCategory
      ? { ...fails, [currentCategory]: newFails }
      : fails;
  });

  const next = computeNextTurn(
    playingGroupIds, currentRoundCat, catGroupQueue, catRoundQueue, triviaCategories, newAvailable, deckMeta,
    groupCompletedCategories, winCondition, groupCategoryFails, game.difficultyMeta ?? {}
  );

  const updates: Record<string, any> = {
    lastActivity: Date.now(),
    [`groups/${scoringGroupId}/score`]: awardPoint
      ? (game.groups[scoringGroupId]?.score ?? 0) + 1
      : (game.groups[scoringGroupId]?.score ?? 0),
    [`groups/${scoringGroupId}/completedCategories`]: newCompleted,
    ...(currentCategory && currentCategory !== 'schaetzfragen'
      ? { [`groups/${activeGroupId}/categoryFails/${currentCategory}`]: newFails }
      : {}),
    availableDeck: newAvailable,
    currentTurnGroupId: next.nextGroupId,
    currentRoundCategory: next.currentRoundCategory,
    categoryRoundQueue: next.categoryRoundQueue,
    categoryGroupQueue: next.categoryGroupQueue,
    // Mit-Spielleitung-Textantwort (falls aktiv) ist jetzt bewertet — für die nächste Frage zurücksetzen.
    pendingTextAnswer: null,
  };

  // Reset flex-active; NEXT-Joker-Zustand aufräumen
  Object.keys(game.groups).forEach(gid => {
    updates[`groups/${gid}/flexActive`] = false;
  });
  if (isJokerNextResolution) {
    updates.jokerNextActive = false;
    updates.jokerNextOriginGroupId = null;
    updates.jokerNextTargetGroupId = null;
  }
  if (isJokerStealReturn) {
    updates.jokerStealReturnActive = false;
  }

  // Gewinnbedingung prüfen
  if (winCondition === 'categories') {
    const justCompleted = awardPoint && triviaCategories.length > 0 && newCompleted.length >= triviaCategories.length;
    const isAlreadyFinalRound = game.triviaFinalRound === true;

    // Aktualisierte Punkte-Map für Tiebreaker-Auflösung
    const updatedScores: Record<string, number> = {};
    Object.entries(game.groups).forEach(([gid, g]) => { updatedScores[gid] = g.score ?? 0; });
    if (awardPoint) updatedScores[scoringGroupId] = (game.groups[scoringGroupId]?.score ?? 0) + 1;

    if (justCompleted || isAlreadyFinalRound) {
      // Anführer-Liste aktualisieren
      const prevLeaders: string[] = Array.isArray(game.triviaLeaders)
        ? game.triviaLeaders
        : Object.values(game.triviaLeaders ?? {}) as string[];
      const updatedLeaders = justCompleted && !prevLeaders.includes(scoringGroupId)
        ? [...prevLeaders, scoringGroupId]
        : [...prevLeaders];

      // Gruppen, die noch ihren letzten Zug haben
      const prevPending: string[] = isAlreadyFinalRound
        ? (Array.isArray(game.triviaFinalRoundPending)
            ? game.triviaFinalRoundPending
            : Object.values(game.triviaFinalRoundPending ?? {}) as string[])
        : catGroupQueue.slice(1); // Noch ausstehende Gruppen dieser Kategorie-Runde

      const newPending = prevPending.filter(gid => gid !== scoringGroupId);

      // Nur Gruppen, die noch aufholen können (≤ 1 Kategorie fehlend)
      const canCatchUp = newPending.filter(gid => {
        if (updatedLeaders.includes(gid)) return false;
        const remaining = triviaCategories.length - (groupCompletedCategories[gid] ?? []).length;
        return remaining <= 1;
      });

      if (canCatchUp.length === 0) {
        applyTriviaWinResolution(updates, updatedLeaders, game, updatedScores, deckMeta, newAvailable, next);
      } else {
        updates.triviaFinalRound = true;
        updates.triviaFinalRoundPending = canCatchUp;
        updates.triviaLeaders = updatedLeaders;
        if (!next.nextCardId) {
          applyTriviaWinResolution(updates, updatedLeaders, game, updatedScores, deckMeta, newAvailable, next);
        } else {
          updates.currentCardId = next.nextCardId;
          updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
        }
      }
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
        const sc = id === scoringGroupId ? (awardPoint ? (g.score ?? 0) + 1 : (g.score ?? 0)) : (g.score ?? 0);
        return sc > best.score ? { id, score: sc } : best;
      }, { id: allGroups[0]?.[0] ?? '', score: -1 });
      updates.winnerGroupId = winnerEntry.id;
    } else {
      updates.currentCardId = next.nextCardId;
      updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
    }
  }

  // ── Joker 4 "STEAL" – nach Auflösung: gestohlene Gruppe bekommt Rückgabe-Zug ─
  // Nur wenn das Spiel NICHT gerade beendet wurde.
  if (isJokerStealResolution) {
    updates.jokerStealActive = false;
    updates.jokerStealGroupId = null;
    updates.jokerStealFromGroupId = null;
    if (!updates.state) {
      const returnGroupId = jokerStealFromId!;
      const sameCatPool = newAvailable.filter(id => deckMeta[id] === currentCategory);
      const fallbackPool = newAvailable;
      const returnCardId = sameCatPool.length > 0
        ? sameCatPool[Math.floor(Math.random() * sameCatPool.length)]
        : (fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null);
      if (returnCardId) {
        updates.jokerStealReturnActive = true;
        updates.currentTurnGroupId = returnGroupId;
        updates.currentCardId = returnCardId;
        updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
        updates.currentRoundCategory = origCurrentRoundCat;
        updates.categoryRoundQueue = origCatRoundQueue;
        updates.categoryGroupQueue = origCatGroupQueue;
      }
    }
  }

  // ── Schätzfragen-Injektion: spätestens alle N normale Fragen ─────────────
  // Nur wenn das Spiel nicht gerade endet, kein STEAL läuft und kein Tiebreaker aktiv.
  if (!updates.state && !isJokerStealResolution && !game.triviaTiebreakerActive) {
    const injection = maybeInjectSchaetzfrage({
      currentCategory,
      triviaSchaetzCounter: game.triviaSchaetzCounter ?? 0,
      playingGroupCount: playingGroupIds.length,
      newAvailable,
      deckMeta,
      currentCardIndex: game.currentCardIndex ?? 0,
      next,
    });
    updates.triviaSchaetzCounter = injection.triviaSchaetzCounter;
    if (injection.schaetzInjected) {
      updates.schaetzInjected = true;
      updates.schaetzInjectedNext = injection.schaetzInjectedNext;
      updates.currentCardId = injection.currentCardId;
      updates.currentTurnGroupId = injection.currentTurnGroupId;
      updates.currentRoundCategory = injection.currentRoundCategory;
      updates.categoryRoundQueue = injection.categoryRoundQueue;
      updates.categoryGroupQueue = injection.categoryGroupQueue;
    }
  }

  await update(gameRef, updates);
}

// ---------------------------------------------------------------------------
// Spielleitungsloser Modus (Trivia): Textantwort + Abstimmung der Gruppen
// ---------------------------------------------------------------------------

/**
 * Aktive Gruppe reicht ihre Textantwort ein (spielleitungsloser Modus, keine
 * Schätzfrage). Öffnet die Abstimmungsphase für alle anderen Gruppen.
 */
export async function submitTextAnswer(pin: string, groupId: string, text: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.hostless && !game.hostTextAnswersEnabled) throw new Error('Textantwort-Eingabe ist in diesem Spiel nicht aktiviert.');
  if (game.currentTurnGroupId !== groupId) throw new Error('Nur die aktive Gruppe kann antworten.');
  if (game.pendingTextAnswer) throw new Error('Es liegt bereits eine Antwort vor.');

  await update(gameRef, {
    lastActivity: Date.now(),
    pendingTextAnswer: { groupId, text: text.trim(), submittedAt: Date.now() },
    answerVotes: {},
  });
}

/**
 * Eine nicht-aktive, verbundene Gruppe stimmt über die eingereichte Antwort ab.
 */
export async function castAnswerVote(pin: string, groupId: string, correct: boolean): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.pendingTextAnswer) throw new Error('Keine Antwort zum Abstimmen vorhanden.');
  if (groupId === game.pendingTextAnswer.groupId) throw new Error('Die antwortende Gruppe stimmt nicht ab.');
  const group = game.groups[groupId];
  if (!group || group.isHost) throw new Error('Nicht stimmberechtigt.');

  await update(ref(database!, `games/${pin}/answerVotes`), { [groupId]: correct });
}

/** Alle Gruppen, die über die aktuelle Antwort abstimmen dürfen (verbunden, nicht Host, nicht die antwortende Gruppe). */
function getEligibleVoterIds(game: GameSession, activeGroupId: string): string[] {
  return Object.values(game.groups)
    .filter(g => !g.isHost && g.id !== activeGroupId && isGroupOnline(game, g.id))
    .map(g => g.id);
}

/**
 * Prüft, ob alle stimmberechtigten (verbundenen) Gruppen abgestimmt haben.
 * Rein lesend — für die UI, um den Auflösungs-Zeitpunkt zu bestimmen.
 */
export function isAnswerVoteComplete(game: GameSession): boolean {
  if (!game.pendingTextAnswer) return false;
  const votes = game.answerVotes ?? {};
  const eligible = getEligibleVoterIds(game, game.pendingTextAnswer.groupId);
  if (eligible.length === 0) return true;
  return eligible.every(gid => votes[gid] !== undefined);
}

/**
 * Wertet die Abstimmung aus (≥50% "richtig" zählt als richtig) und schreibt das
 * Ergebnis als Reveal (`textAnswerResult`), damit die antwortende Gruppe (und alle
 * anderen) eine klare Rückmeldung sehen, bevor zur nächsten Frage gewechselt wird.
 * Wendet noch KEINE Punkte an — das übernimmt `applyTextAnswerResult`.
 */
export async function resolveTextAnswerVote(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.pendingTextAnswer) return; // bereits aufgelöst (Race-Schutz)

  const activeGroupId = game.pendingTextAnswer.groupId;
  const answerText = game.pendingTextAnswer.text;
  const votes: Record<string, boolean> = game.answerVotes ?? {};
  const eligible = getEligibleVoterIds(game, activeGroupId);
  const correctVotes = eligible.filter(gid => votes[gid] === true).length;
  const isCorrect = eligible.length === 0 ? false : (correctVotes / eligible.length) >= 0.5;

  await update(gameRef, {
    pendingTextAnswer: null,
    answerVotes: null,
    textAnswerResult: {
      groupId: activeGroupId,
      text: answerText,
      correct: isCorrect,
      correctVotes,
      totalVotes: eligible.length,
    },
  });
}

/**
 * Wendet die bestehende Trivia-Bewertungslogik an (inkl. Joker-Auflösung), nachdem
 * der Reveal-Bildschirm kurz sichtbar war, und schaltet zur nächsten Frage/Gruppe.
 */
export async function applyTextAnswerResult(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.textAnswerResult) return; // bereits angewendet (Race-Schutz)

  const isCorrect = game.textAnswerResult.correct;
  await update(gameRef, { textAnswerResult: null });
  await submitTriviaAnswer(pin, isCorrect);
}

/**
 * Zeitlimit für die Antwort ist abgelaufen, ohne dass eingereicht wurde →
 * automatisch als falsch werten (spielleitungsloser Modus).
 */
export async function timeoutTriviaAnswer(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (game.currentTurnGroupId !== groupId || game.pendingTextAnswer) return; // bereits weiter / Antwort liegt vor
  await submitTriviaAnswer(pin, false);
}

// ---------------------------------------------------------------------------
// Helpers für Schätzfragen (client-seitig aufrufbar)
// ---------------------------------------------------------------------------

export function parseGermanNumber(str: string): number {
  // Deutsches Format: Punkt = Tausendertrennzeichen, Komma = Dezimaltrennzeichen
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
}

/**
 * Parst die von einer Gruppe eingereichte Schätzung (schaetzSubmission).
 * Die Eingabe kommt aus einem nativen <input type="number">, dessen value laut
 * HTML-Standard IMMER einen Punkt als Dezimaltrennzeichen verwendet (nie Komma,
 * nie Tausenderpunkte) – unabhängig von Gerät oder Spracheinstellung.
 * parseGermanNumber ist hier falsch: sie würde den Dezimalpunkt als
 * Tausendertrennzeichen entfernen und z.B. "3.5" zu 35 machen.
 */
export function parseGuessNumber(str: string): number {
  return parseFloat(str.trim());
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
  // Klammer-Inhalte ignorieren: oft nur ein erklärender Zusatz (z.B. "28 Jahre
  // (1961 bis 1989)"), dessen Jahreszahlen sonst fälschlich als die eigentliche
  // Antwort-Spanne erkannt würden statt des führenden Einzelwerts "28".
  const withoutParens = answer.replace(/\([^)]*\)/g, '');
  // Muster: (von)? Zahl (bis|–|-|und) Zahl, z.B. "von 1.000 bis 2.000" oder "500–1.500"
  const rangeRe = /(?:von\s+)?([\d.,]+)\s*(?:bis|–|-|und)\s*([\d.,]+)/i;
  const m = withoutParens.match(rangeRe);
  if (!m) return null;
  const low = parseGermanNumber(m[1]);
  const high = parseGermanNumber(m[2]);
  if (isNaN(low) || isNaN(high)) return null;
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

export function extractUnitFromAnswer(answer: string): string {
  // Optionale Spanne ("X bis Y"/"X–Y"/"X und Y") vor der Einheit mit-überspringen,
  // sonst wird bei Bereichs-Antworten wie "80 bis 100 Milligramm" fälschlich das
  // Wort "bis" als Einheit erkannt statt "Milligramm".
  const match = answer.match(/[\d.,]+(?:\s*(?:bis|–|-|und)\s*[\d.,]+)?\s+([A-Za-zÄÖÜäöüß]+(?:\s+[A-Za-zÄÖÜäöüß]+)?)/i);
  if (!match) return '';
  const unit = match[1];
  // Fällt die Spanne mangels folgendem Einheitswort auf das Bindewort selbst
  // zurück (z.B. "300 bis 500 (meist 336 oder 392)"), lieber keine Einheit zeigen.
  return /^(?:bis|und|von)$/i.test(unit) ? '' : unit;
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
  result: { answer: string; winnerIds: string[]; submissions: { groupId: string; groupName: string; value: string; isWinner: boolean; color: string; }[]; jokerRestores?: { groupId: string; groupName: string; jokerKey: 'newQuestion' | 'next' | 'dice' | 'steal' }[] }
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

  // ── Stechen-Schätzfrage: Spiel direkt beenden ──────────────────────────────
  if (game.triviaTiebreakerActive) {
    const tiebreakerWinner = winnerGroupIds[0] ?? null;
    const tiebreakerUpdates: Record<string, any> = {
      lastActivity: Date.now(),
      state: 'finished',
      finishedAt: Date.now(),
      winnerGroupId: tiebreakerWinner,
      triviaTiebreakerActive: null,
      triviaTiebreakerGroupIds: null,
      triviaFinalRound: null,
      triviaFinalRoundPending: null,
      triviaLeaders: null,
      schaetzResult: null,
    };
    Object.keys(game.groups).forEach(gid => {
      tiebreakerUpdates[`groups/${gid}/schaetzSubmission`] = null;
      tiebreakerUpdates[`groups/${gid}/flexActive`] = false;
    });
    await update(gameRef, tiebreakerUpdates);
    return;
  }
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

  // Bei injizierter Schätzfrage: gespeicherten Zug wiederherstellen statt computeNextTurn
  const savedNext = game.schaetzInjected && game.schaetzInjectedNext ? game.schaetzInjectedNext : null;
  const next: NextTurnResult = savedNext
    ? {
        nextCardId: savedNext.nextCardId,
        nextGroupId: savedNext.nextGroupId ?? playingGroupIds[0],
        currentRoundCategory: savedNext.currentRoundCategory,
        categoryRoundQueue: Array.isArray(savedNext.categoryRoundQueue)
          ? savedNext.categoryRoundQueue
          : Object.values((savedNext as any).categoryRoundQueue ?? []),
        categoryGroupQueue: Array.isArray(savedNext.categoryGroupQueue)
          ? savedNext.categoryGroupQueue
          : Object.values((savedNext as any).categoryGroupQueue ?? []),
      }
    : computeNextTurn(
        playingGroupIds, currentRoundCat, [], catRoundQueue, triviaCategories, newAvailable, deckMeta,
        groupCompletedCatsS, winConditionS,
        Object.fromEntries(Object.entries(game.groups).map(([gid, g]) => [gid, g.categoryFails ?? {}])),
        game.difficultyMeta ?? {}
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
    // Schätzfragen-Bonus: pre-calculated joker restores aus schaetzResult anwenden
    if (game.jokersEnabled) {
      const jokerRestores = (game.schaetzResult as any)?.jokerRestores ?? [];
      for (const restore of jokerRestores as { groupId: string; jokerKey: string }[]) {
        if (restore.groupId && restore.jokerKey) {
          updates[`groups/${restore.groupId}/jokers/${restore.jokerKey}`] = true;
        }
      }
    }
  }

  updates.currentTurnGroupId = next.nextGroupId;
  updates.currentRoundCategory = next.currentRoundCategory;
  updates.categoryRoundQueue = next.categoryRoundQueue;
  updates.categoryGroupQueue = next.categoryGroupQueue;

  // Schätzungen + Flex-State + Ergebnis-Anzeige zurücksetzen
  updates.schaetzResult = null;
  updates.triviaSchaetzCounter = 0; // Schätzfrage gespielt → Counter zurücksetzen
  if (game.schaetzInjected) {
    updates.schaetzInjected = null;
    updates.schaetzInjectedNext = null;
  }
  Object.keys(game.groups).forEach(gid => {
    updates[`groups/${gid}/schaetzSubmission`] = null;
    updates[`groups/${gid}/flexActive`] = false;
  });

  // Gewinnbedingung prüfen (Schätzfrage)
  if (winConditionS === 'categories') {
    const updatedScoresS: Record<string, number> = {};
    Object.entries(game.groups).forEach(([gid, g]) => { updatedScoresS[gid] = g.score ?? 0; });
    winnerGroupIds.forEach(wid => { updatedScoresS[wid] = (game.groups[wid]?.score ?? 0) + 1; });

    const isAlreadyFinalRound = game.triviaFinalRound === true;

    if (anyFinished || isAlreadyFinalRound) {
      // Anführer aufbauen
      const prevLeadersS: string[] = Array.isArray(game.triviaLeaders)
        ? game.triviaLeaders
        : Object.values(game.triviaLeaders ?? {}) as string[];
      const newlyFinished = winnerGroupIds.filter(wid => {
        const wCats = groupCompletedCatsS[wid] ?? [];
        return triviaCategories.length > 0 && wCats.length >= triviaCategories.length && !prevLeadersS.includes(wid);
      });
      const updatedLeadersS = [...prevLeadersS, ...newlyFinished];
      // Schätzfragen sind simultan → alle Gruppen haben gespielt → sofort auflösen
      applyTriviaWinResolution(updates, updatedLeadersS, game, updatedScoresS, deckMeta, newAvailable, next);
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

// ---------------------------------------------------------------------------
// Joker-System (nur Trivia-Modus)
// ---------------------------------------------------------------------------

/**
 * Joker-Benachrichtigung ausblenden (Spielleiter bestätigt, dass alle den Bildschirm gesehen haben).
 */
export async function dismissJokerNotification(pin: string): Promise<void> {
  checkFirebase();
  await update(ref(database!, `games/${pin}`), { jokerNotification: null });
}

/**
 * Joker 1: "Neue Frage" – Aktuelle Karte gegen eine neue Karte gleicher Kategorie tauschen.
 * Die Gruppe bleibt am Zug; der Joker wird als verwendet markiert.
 */
export async function activateJokerNewQuestion(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (game.mode !== 'trivia') throw new Error('Joker nur im Trivia-Modus verfügbar.');
  if (!game.jokersEnabled) throw new Error('Joker sind deaktiviert.');
  if (game.currentTurnGroupId !== groupId) throw new Error('Diese Gruppe ist nicht am Zug.');

  const jokers = game.groups[groupId]?.jokers;
  if (!jokers?.newQuestion) throw new Error('Neue-Frage-Joker bereits verwendet.');

  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  // Use the actual category of the current card, not the round category
  // (they can diverge when a group receives a replacement-category card)
  const currentCat = (game.currentCardId ? deckMeta[game.currentCardId] : null) ?? game.currentRoundCategory ?? '';
  if (currentCat === 'schaetzfragen') throw new Error('Joker bei Schätzfragen nicht verfügbar.');

  const prevAvailable: string[] = Array.isArray(game.availableDeck)
    ? game.availableDeck
    : Object.values(game.availableDeck ?? {});
  const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);

  // Neue Karte: gleiche Kategorie (bevorzugt "leicht" bei ≥3 Fehlversuchen der Gruppe
  // in dieser Kategorie), sonst zufällig beliebig
  const sameCatPool = newAvailable.filter(id => deckMeta[id] === currentCat);
  const nextCardId = sameCatPool.length > 0
    ? pickCardRespectingDifficulty(sameCatPool, groupId, currentCat, { [groupId]: game.groups[groupId]?.categoryFails ?? {} }, game.difficultyMeta ?? {})
    : (newAvailable.length > 0 ? newAvailable[Math.floor(Math.random() * newAvailable.length)] : null);

  await update(gameRef, {
    lastActivity: Date.now(),
    availableDeck: newAvailable,
    currentCardId: nextCardId,
    [`groups/${groupId}/jokers/newQuestion`]: false,
    jokerNotification: { type: 'newQuestion', byGroupId: groupId, timestamp: Date.now() },
  });
}

/**
 * Joker 2: "NEXT" – Frage an die nächste Gruppe weitergeben.
 * Wenn die nächste Gruppe falsch antwortet, bekommt die ursprüngliche Gruppe Punkt + Kategorie.
 * Wenn die nächste Gruppe richtig antwortet, bekommt niemand einen Punkt.
 */
export async function activateJokerNext(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (game.mode !== 'trivia') throw new Error('Joker nur im Trivia-Modus verfügbar.');
  if (!game.jokersEnabled) throw new Error('Joker sind deaktiviert.');
  if (game.currentTurnGroupId !== groupId) throw new Error('Diese Gruppe ist nicht am Zug.');

  const jokers = game.groups[groupId]?.jokers;
  if (!jokers?.next) throw new Error('NEXT-Joker bereits verwendet.');

  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  const currentCat = game.currentRoundCategory ?? (game.currentCardId ? deckMeta[game.currentCardId] : '');
  if (currentCat === 'schaetzfragen') throw new Error('Joker bei Schätzfragen nicht verfügbar.');

  const playingGroupIds = Object.entries(game.groups)
    .filter(([_, g]) => !g.isHost)
    .map(([id]) => id);

  if (playingGroupIds.length < 2) throw new Error('Zu wenige Gruppen für NEXT-Joker.');

  const currentIdx = playingGroupIds.indexOf(groupId);
  const nextGroupId = playingGroupIds[(currentIdx + 1) % playingGroupIds.length];

  await update(gameRef, {
    lastActivity: Date.now(),
    jokerNextActive: true,
    jokerNextOriginGroupId: groupId,
    jokerNextTargetGroupId: nextGroupId,
    currentTurnGroupId: nextGroupId,
    [`groups/${groupId}/jokers/next`]: false,
    jokerNotification: { type: 'next', byGroupId: groupId, targetGroupId: nextGroupId, timestamp: Date.now() },
  });
}

/**
 * Joker 4: "STEAL" – Nicht-aktive Gruppe klaut die aktuelle Frage.
 * First come, first served: wer zuerst drückt, stiehlt.
 * Richtig → Stealer bekommt Punkt + Kategorie.
 * Falsch  → Gestohlene Gruppe bekommt Punkt + Kategorie.
 * Die gestohlene Gruppe erhält anschließend immer eine neue Ersatzfrage.
 */
export async function activateJokerSteal(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);

  // Atomare Transaktion statt get()+update(): verhindert, dass bei zeitgleichem
  // Klick zweier Gruppen beide die Prüfung bestehen und der Joker der
  // "verlierenden" Gruppe verbraucht wird, ohne dass sie stehlen konnte.
  let abortReason: string | null = null;

  const { committed } = await runTransaction(gameRef, (game: GameSession | null) => {
    if (!game) { abortReason = 'Spiel nicht gefunden.'; return game; }
    if (game.mode !== 'trivia') { abortReason = 'Joker nur im Trivia-Modus verfügbar.'; return; }
    if (!game.jokersEnabled) { abortReason = 'Joker sind deaktiviert.'; return; }
    if (game.singleDeviceMode) { abortReason = 'Steal-Joker ist im Endgeräte-Modus nicht verfügbar.'; return; }
    if (game.currentTurnGroupId === groupId) { abortReason = 'Eigene Frage kann nicht geklaut werden.'; return; }
    if (game.jokerStealActive) { abortReason = 'Steal-Joker wurde bereits aktiviert (first come, first served).'; return; }
    if (game.jokerNextActive) { abortReason = 'NEXT-Joker ist gerade aktiv.'; return; }
    if (game.jokerStealReturnActive) { abortReason = 'Stehlen während des Rückgabe-Zugs nicht möglich.'; return; }
    // Sobald eine Antwort eingereicht wurde (Bewertung durch Host oder Abstimmung im
    // hostless-Modus steht aus), darf nicht mehr gestohlen werden — sonst würde der
    // Punkt für die bereits abgegebene Antwort der stehlenden Gruppe zugeschrieben
    // (die Auswertung liest currentTurnGroupId aus, das Steal sofort umbiegt).
    if (game.pendingTextAnswer) { abortReason = 'Antwort liegt bereits vor – Steal ist jetzt gesperrt.'; return; }

    const jokers = game.groups?.[groupId]?.jokers;
    if (!jokers?.steal) { abortReason = 'Steal-Joker bereits verwendet.'; return; }

    const deckMeta: Record<string, string> = game.deckMeta ?? {};
    const currentCat = (game.currentCardId ? deckMeta[game.currentCardId] : null) ?? game.currentRoundCategory ?? '';
    if (currentCat === 'schaetzfragen') { abortReason = 'Joker bei Schätzfragen nicht verfügbar.'; return; }

    const originalTurnGroupId = game.currentTurnGroupId!;

    game.lastActivity = Date.now();
    game.jokerStealActive = true;
    game.jokerStealGroupId = groupId;
    game.jokerStealFromGroupId = originalTurnGroupId;
    game.currentTurnGroupId = groupId;
    jokers.steal = false;
    game.jokerNotification = { type: 'steal', byGroupId: groupId, fromGroupId: originalTurnGroupId, timestamp: Date.now() };

    return game;
  });

  if (!committed) {
    throw new Error(abortReason ?? 'Steal-Joker konnte nicht aktiviert werden.');
  }
}

/**
 * Joker 3: "Würfeln" – Zufälliges Ergebnis 1–6.
 * 5–6: +1 Punkt + aktuelle Kategorie kassieren
 * 2–4: Zug endet ohne Effekt
 * 1: Punkt verlieren (min 0) + zufällige gesammelte Kategorie verlieren
 */
export async function activateJokerDice(pin: string, groupId: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (game.mode !== 'trivia') throw new Error('Joker nur im Trivia-Modus verfügbar.');
  if (!game.jokersEnabled) throw new Error('Joker sind deaktiviert.');
  if (game.currentTurnGroupId !== groupId) throw new Error('Diese Gruppe ist nicht am Zug.');

  const jokers = game.groups[groupId]?.jokers;
  if (!jokers?.dice) throw new Error('Würfel-Joker bereits verwendet.');

  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  const currentCat = game.currentRoundCategory ?? (game.currentCardId ? deckMeta[game.currentCardId] : '');
  if (currentCat === 'schaetzfragen') throw new Error('Joker bei Schätzfragen nicht verfügbar.');

  const roll = Math.floor(Math.random() * 6) + 1;

  const prevCompleted: string[] = Array.isArray(game.groups[groupId]?.completedCategories)
    ? game.groups[groupId].completedCategories!
    : Object.values(game.groups[groupId]?.completedCategories ?? {}) as string[];

  let newCompleted = [...prevCompleted];
  let newScore = game.groups[groupId]?.score ?? 0;

  if (roll >= 5) {
    newScore += 1;
    if (currentCat && !newCompleted.includes(currentCat)) {
      newCompleted.push(currentCat);
    }
  } else if (roll === 1) {
    newScore = Math.max(0, newScore - 1);
    // Zufällige gesammelte Kategorie verlieren
    if (newCompleted.length > 0) {
      const loseIdx = Math.floor(Math.random() * newCompleted.length);
      newCompleted.splice(loseIdx, 1);
    }
  }

  // Effekte sofort anwenden, aber Zug NICHT weiterrücken – Spielleiter bestätigt erst
  await update(gameRef, {
    lastActivity: Date.now(),
    jokerDiceResult: roll,
    jokerDiceGroupId: groupId,
    jokerDicePending: true,
    [`groups/${groupId}/jokers/dice`]: false,
    [`groups/${groupId}/score`]: newScore,
    [`groups/${groupId}/completedCategories`]: newCompleted,
  });
}

/**
 * Spielleiter bestätigt das Würfelergebnis → Zug wird weitergerückt, Pending-State wird gelöscht.
 */
export async function confirmJokerDice(pin: string): Promise<void> {
  checkFirebase();
  const gameRef = ref(database!, `games/${pin}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) throw new Error('Spiel nicht gefunden.');

  const game: GameSession = snapshot.val();
  if (!game.jokerDicePending) throw new Error('Kein ausstehender Würfeljoker.');

  const groupId = game.jokerDiceGroupId!;
  const roll = game.jokerDiceResult!;

  const deckMeta: Record<string, string> = game.deckMeta ?? {};
  const currentCat = game.currentRoundCategory ?? (game.currentCardId ? deckMeta[game.currentCardId] : '');

  const triviaCategories: string[] = Array.isArray(game.triviaCategories)
    ? game.triviaCategories
    : Object.values(game.triviaCategories ?? {});
  const playingGroupIds = Object.entries(game.groups)
    .filter(([_, g]) => !g.isHost)
    .map(([id]) => id);

  const newCompleted: string[] = Array.isArray(game.groups[groupId]?.completedCategories)
    ? game.groups[groupId].completedCategories!
    : Object.values(game.groups[groupId]?.completedCategories ?? {}) as string[];
  const newScore = game.groups[groupId]?.score ?? 0;

  const prevAvailable: string[] = Array.isArray(game.availableDeck)
    ? game.availableDeck
    : Object.values(game.availableDeck ?? {});
  const newAvailable = prevAvailable.filter(id => id !== game.currentCardId);

  const catGroupQueue: string[] = Array.isArray(game.categoryGroupQueue)
    ? game.categoryGroupQueue
    : Object.values(game.categoryGroupQueue ?? { 0: groupId });
  const catRoundQueue: string[] = Array.isArray(game.categoryRoundQueue)
    ? game.categoryRoundQueue
    : Object.values(game.categoryRoundQueue ?? {});
  const currentRoundCat = game.currentRoundCategory ?? currentCat;
  const winCondition = game.triviaWinCondition ?? 'categories';

  const groupCompletedCategories: Record<string, string[]> = {};
  Object.entries(game.groups).forEach(([gid, g]) => {
    const completed: string[] = Array.isArray(g.completedCategories)
      ? g.completedCategories
      : Object.values(g.completedCategories ?? {}) as string[];
    groupCompletedCategories[gid] = completed;
  });

  const next = computeNextTurn(
    playingGroupIds, currentRoundCat, catGroupQueue, catRoundQueue, triviaCategories, newAvailable, deckMeta,
    groupCompletedCategories, winCondition,
    Object.fromEntries(Object.entries(game.groups).map(([gid, g]) => [gid, g.categoryFails ?? {}])),
    game.difficultyMeta ?? {}
  );

  const updates: Record<string, any> = {
    lastActivity: Date.now(),
    jokerDicePending: null,
    jokerDiceResult: null,
    jokerDiceGroupId: null,
    availableDeck: newAvailable,
    currentTurnGroupId: next.nextGroupId,
    currentRoundCategory: next.currentRoundCategory,
    categoryRoundQueue: next.categoryRoundQueue,
    categoryGroupQueue: next.categoryGroupQueue,
  };

  Object.keys(game.groups).forEach(gid => {
    updates[`groups/${gid}/flexActive`] = false;
  });

  if (!next.nextCardId) {
    updates.state = 'finished';
    updates.finishedAt = Date.now();
    if (winCondition === 'points') {
      const allGroups = Object.entries(game.groups).filter(([_, g]) => !g.isHost);
      const winnerEntry = allGroups.reduce((best, [id, g]) => {
        const sc = g.score ?? 0;
        return sc > best.score ? { id, score: sc } : best;
      }, { id: allGroups[0]?.[0] ?? '', score: -1 });
      updates.winnerGroupId = winnerEntry.id;
    } else if (roll >= 5 && triviaCategories.length > 0 && newCompleted.length >= triviaCategories.length) {
      updates.winnerGroupId = groupId;
    }
  } else {
    if (roll >= 5 && winCondition === 'categories' && triviaCategories.length > 0 && newCompleted.length >= triviaCategories.length) {
      updates.state = 'finished';
      updates.finishedAt = Date.now();
      updates.winnerGroupId = groupId;
    } else {
      updates.currentCardId = next.nextCardId;
      updates.currentCardIndex = (game.currentCardIndex ?? 0) + 1;
    }
  }

  await update(gameRef, updates);
}

/**
 * Highscores: wird aufgerufen, sobald ein Client ein beendetes Spiel mit Sieger
 * sieht. Da games/{pin} nach Spielende automatisch aufgeräumt wird (siehe
 * subscribeToGame/STALE_GAME_MS), muss der Sieg separat unter highscores/
 * gespeichert werden. Eine Transaktion auf games/{pin}/highscoreRecorded sorgt
 * dafür, dass bei mehreren gleichzeitig reagierenden Geräten nur einer schreibt
 * (gleiches Muster wie beim Steal-Joker).
 */
export async function recordHighscoreIfNeeded(pin: string): Promise<void> {
  checkFirebase();
  const flagRef = ref(database!, `games/${pin}/highscoreRecorded`);
  const { committed } = await runTransaction(flagRef, (recorded: boolean | null) => (recorded ? undefined : true));
  if (!committed) return;

  const snapshot = await get(ref(database!, `games/${pin}`));
  if (!snapshot.exists()) return;
  const game: GameSession = snapshot.val();
  if (game.state !== 'finished' || !game.winnerGroupId) return;

  const winner = game.groups?.[game.winnerGroupId];
  if (!winner) return;

  const completedCategories = Array.isArray(winner.completedCategories)
    ? winner.completedCategories.length
    : Object.values(winner.completedCategories ?? {}).length;

  const entry: Omit<HighscoreEntry, 'id'> = {
    pin,
    groupName: winner.name,
    groupColor: winner.color,
    avatar: winner.avatar ?? null,
    mode: game.mode,
    points: winner.score ?? 0,
    completedCategories,
    finishedAt: game.finishedAt ?? Date.now(),
  };

  await set(push(ref(database!, 'highscores')), entry);
}

/**
 * Trägt einen Highscore-Eintrag für ein rein lokales Spiel (Endgeräte-Modus, kein
 * `games/{pin}`-Eintrag vorhanden) ein. Best effort: schlägt Firebase fehl oder ist
 * nicht konfiguriert, wird still zurückgekehrt statt zu werfen — das lokale Spiel
 * bleibt auch ohne Firebase vollständig spielbar.
 */
export async function recordLocalHighscore(entry: Omit<HighscoreEntry, 'id'>): Promise<void> {
  if (!isFirebaseEnabled || !database) return;
  try {
    await set(push(ref(database, 'highscores')), entry);
  } catch (error) {
    console.error('Highscore konnte nicht gespeichert werden:', error);
  }
}

/**
 * Liest alle bisher aufgezeichneten Highscore-Einträge (unsortiert).
 */
export async function getHighscores(): Promise<HighscoreEntry[]> {
  checkFirebase();
  const snapshot = await get(ref(database!, 'highscores'));
  if (!snapshot.exists()) return [];
  const val = snapshot.val() as Record<string, Omit<HighscoreEntry, 'id'>>;
  return Object.entries(val).map(([id, entry]) => ({ id, ...entry }));
}