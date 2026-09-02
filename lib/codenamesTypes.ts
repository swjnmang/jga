export const CODENAMES_LOCAL_STORAGE_KEY = 'codenames_session';

export type CodenamesPhase = 'lobby' | 'playing' | 'finished';
export type CodenamesTeam = 'red' | 'blue';
export type CodenamesRole = 'spymaster' | 'operative';
export type CodenamesCardType = 'red' | 'blue' | 'neutral' | 'assassin';

export const BOARD_SIZE = 25;

export interface CodenamesCard {
  id: string;
  word: string;
  type: CodenamesCardType;
  revealed: boolean;
  revealedBy: CodenamesTeam | null;
}

export interface CodenamesPlayer {
  id: string;
  name: string;
  team: CodenamesTeam;
  role: CodenamesRole;
  joinedAt: number;
}

export interface CodenamesLogEntry {
  id: string;
  team: CodenamesTeam;
  type: 'clue' | 'reveal' | 'pass' | 'turnEnd';
  text: string;
  at: number;
}

export interface CodenamesGame {
  pin: string;
  hostPlayerId: string;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;

  phase: CodenamesPhase;
  players: Record<string, CodenamesPlayer>;

  cards: CodenamesCard[];
  startingTeam: CodenamesTeam;
  currentTeam: CodenamesTeam;

  clueWord: string | null;
  clueNumber: number | null;
  guessesMade: number;
  guessesAllowed: number;

  redRemaining: number;
  blueRemaining: number;

  winner: CodenamesTeam | null;
  winReason: 'allWordsFound' | 'assassin' | null;

  log: CodenamesLogEntry[];
}

export interface CreateCodenamesParams {
  hostPlayerName: string;
  hostTeam: CodenamesTeam;
  hostRole: CodenamesRole;
}

export interface JoinCodenamesParams {
  pin: string;
  playerName: string;
  team: CodenamesTeam;
  role: CodenamesRole;
}
