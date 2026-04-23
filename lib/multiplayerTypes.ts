import { Card } from './types';
import { UserSettings } from './userSettings';

export type GameState = 'lobby' | 'playing' | 'finished';

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
  startedAt: number | null;
  finishedAt: number | null;
  maxGroups: number;
  referenceCard: Card | null; // Die Startkarte für alle Gruppen
  playbackControl?: PlaybackControl; // Remote-Steuerung für Medien (Host führt aus)
  flexPendingGroupId?: string | null; // Welche Gruppe wartet auf Flex-Bestätigung
  winnerGroupId?: string | null; // Erste Gruppe mit 10 Karten (Timeline) oder erste mit X Punkte (Trivia)
}

export interface CreateGameParams {
  mode: 'timeline' | 'trivia' | 'solo';
  settings: UserSettings;
  deck: Card[];
  hostGroupName: string;
  hostPlayerName: string;
  maxGroups?: number;
}

export interface JoinGameParams {
  pin: string;
  groupName: string;
  playerName: string;
  spotifyLinked?: boolean;
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
