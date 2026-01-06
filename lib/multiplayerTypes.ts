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
  timeline: PlacedCard[];
  flexButtons: number;
  score: number;
  isReady: boolean;
}

export interface PlacedCard {
  cardId: string;
  year: number;
  correct: boolean;
  placedAt: number; // timestamp
}

export interface GameSession {
  id: string; // PIN
  hostId: string;
  state: GameState;
  mode: 'timeline' | 'trivia' | 'solo';
  settings: UserSettings;
  currentCardIndex: number;
  currentCardId: string | null;
  deck: string[]; // Array von Card-IDs
  groups: Record<string, GroupData>; // groupId -> GroupData
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  maxGroups: number;
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
