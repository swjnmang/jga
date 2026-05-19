import { Card } from './types';
import { UserSettings } from './userSettings';

export type GameState = 'lobby' | 'banning' | 'playing' | 'finished';

export interface PlayerInfo {
  id: string;
  name: string;
  connected: boolean;
  lastSeen: number;
}

export interface GroupData {
  id: string;
  name: string;
  color: string;
  players: PlayerInfo[];
  timeline: Card[]; // Vollständige Karten, nicht nur IDs
  flexButtons: number;
  score: number;
  isReady: boolean;
  flexActive: boolean; // Ob Flex-Button für aktuelle Runde aktiviert ist
  isHost: boolean; // Ist diese Gruppe der Spielleiter
  flexRequested?: boolean; // Hat die aktive Gruppe einen Flex-Button angefordert
  lastFlexRequest?: number; // Timestamp des letzten Flex-Requests
  pendingPosition?: number | null; // Live-Vorschau: gewählte Position (noch nicht eingereicht)
  completedCategories?: string[]; // Trivia: bereits korrekt beantwortete Kategorien
  schaetzSubmission?: string | null; // Trivia Schätzfrage: eingereichte Schätzung
  avatar?: string; // Emoji-Avatar der Gruppe
  jokers?: { newQuestion: boolean; next: boolean; dice: boolean; }; // Trivia: verfügbare Joker
}

export interface PlacedCard {
  cardId: string;
  year: number;
  correct: boolean;
  placedAt: number; // timestamp
}

export interface PlaybackControl {
  action: 'play' | 'pause' | 'stop';
  cardId: string;
  timestamp: number;
  requestedBy: string; // groupId
}

export interface GameSession {
  id: string; // PIN
  hostId: string;
  state: GameState;
  mode: 'timeline' | 'trivia' | 'solo';
  settings: UserSettings;
  currentCardIndex: number;
  currentCardId: string | null;
  currentTurnGroupId: string | null; // Welche Gruppe ist am Zug
  deck: string[]; // Array von Card-IDs
  groups: Record<string, GroupData>; // groupId -> GroupData
  createdAt: number;
  lastActivity: number;
  startedAt: number | null;
  finishedAt: number | null;
  maxGroups: number;
  referenceCard: Card | null; // Die Startkarte für alle Gruppen
  playbackControl?: PlaybackControl; // Remote-Steuerung für Medien (Host führt aus)
  flexPendingGroupId?: string | null; // Welche Gruppe wartet auf Flex-Bestätigung
  winnerGroupId?: string | null; // Erste Gruppe mit X Karten (Timeline) oder erste mit X Punkte (Trivia)
  timelineWinTarget?: number | null;    // Anzahl korrekt platzierter Karten zum Gewinnen (Timeline, Default 10)
  pendingResult?: 'correct' | 'wrong' | null; // Letztes Platzierungsergebnis — Host entscheidet wann weiter
  pendingFlexAward?: string | null;  // groupId, die nach korrekter Platzierung auf Flex-Vergabe wartet (Host entscheidet)
  // Flex-Phase (nach Platzierung — andere Gruppen können Tipp abgeben)
  flexPhaseActive?: boolean;                   // Flex-Phase läuft (nicht-spielende Gruppen können tippen)
  resultRevealed?: boolean;                    // Host hat auf "Auswertung" geklickt — Ergebnis wird für alle sichtbar
  flexTips?: Record<string, string>;           // position.toString() → groupId (first-come-first-served)
  activeGroupPlacedPosition?: number | null;   // Position die die spielende Gruppe gewählt hat (für Flex gesperrt)
  flexPhaseCorrectPosition?: number | null;    // Korrekte Position in der Timeline (für Flex-Auswertung)
  flexPhaseCard?: any | null;                  // Die neu gelegte Karte (auch wenn falsch platziert, für Flex-Anzeige)
  // Trivia-Modus
  triviaCategories?: string[];           // Alle Kategorien die im Deck vorhanden sind (einmalig beim Erstellen berechnet)
  deckMeta?: Record<string, string>;     // cardId → category (für Server-seitige Logik)
  availableDeck?: string[];              // Noch nicht gestellte Karten (cardIds)
  // Ban-Phase
  banModeEnabled?: boolean;              // Ob der Ban-Modus aktiviert ist (Gruppen können Kategorien sperren)
  bannedCategories?: string[];           // Von Gruppen gebannte Kategorien
  banPhaseGroupOrder?: string[];         // Reihenfolge der Gruppen in der Ban-Phase
  banPhaseCurrentIndex?: number;         // Index der aktuell bannenden Gruppe
  // Gewinnbedingung Trivia
  triviaWinCondition?: 'categories' | 'points'; // 'categories' = alle Kats. abgehakt; 'points' = meiste Punkte
  // Kategorie-Rotation (Trivia)
  currentRoundCategory?: string;       // Aktuelle Kategorie, aus der alle Gruppen spielen
  categoryRoundQueue?: string[];       // Noch ausstehende Kategorien in dieser Runde (gemischt)
  categoryGroupQueue?: string[];       // Gruppen, die in der aktuellen Kategorie noch spielen müssen
  // Joker-System (Trivia)
  jokersEnabled?: boolean;                  // Ob Joker aktiviert sind
  jokerNextActive?: boolean;                // Joker 2 «NEXT» ist gerade aktiv
  jokerNextOriginGroupId?: string | null;   // Gruppe die den NEXT-Joker genutzt hat
  jokerNextTargetGroupId?: string | null;   // Gruppe die die weitergegebene Frage beantworten muss
  jokerDiceResult?: number | null;          // Letztes Würfelergebnis (1–6)
  jokerDiceGroupId?: string | null;         // Gruppe die zuletzt gewürfelt hat
  // Schätzfrage-Ergebnis (transient: gesetzt nach Auswertung, gelöscht beim Weiter)
  schaetzResult?: {
    answer: string;
    winnerIds: string[];
    submissions: { groupId: string; groupName: string; value: string; isWinner: boolean; color: string; }[];
  } | null;
}

export interface CreateGameParams {
  mode: 'timeline' | 'trivia' | 'solo';
  settings: UserSettings;
  deck: Card[];
  hostGroupName: string;
  hostPlayerName: string;
  maxGroups?: number;
  banModeEnabled?: boolean;
  triviaWinCondition?: 'categories' | 'points';
  timelineWinTarget?: number | null;
  jokersEnabled?: boolean;
}

export interface JoinGameParams {
  pin: string;
  groupName: string;
  playerName: string;
  spotifyLinked?: boolean;
  avatar?: string;
}

// Farben für Gruppen
export const GROUP_COLORS = [
  '#FF6B6B', // Rot
  '#4ECDC4', // Türkis
  '#45B7D1', // Blau
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Gelb
  '#BB8FCE', // Lila
  '#85C1E2'  // Hellblau
] as const;
