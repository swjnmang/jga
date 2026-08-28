export type WordPotPhase = 'lobby' | 'playing' | 'finished';

export type WordPotRoundNumber = 1 | 2 | 3;

export const ROUND_LABELS: Record<WordPotRoundNumber, string> = {
  1: 'Erklären',
  2: 'Pantomime',
  3: 'Ein Wort',
};

export const ROUND_DESCRIPTIONS: Record<WordPotRoundNumber, string> = {
  1: 'Beliebig viele Wörter benutzen, um den Begriff zu erklären – nur der Begriff selbst darf nicht fallen.',
  2: 'Nur Gestik und Mimik – kein Wort, kein Laut.',
  3: 'Nur ein einziges Wort darf zur Erklärung benutzt werden.',
};

export interface WordPotPlayer {
  id: string;
  name: string;
  groupId: string;
  wordsSubmitted: number;
  joinedAt: number;
}

export interface WordPotGroup {
  id: string;
  name: string;
  score: number;
}

export interface WordPotWord {
  id: string;
  text: string;
  groupId: string;
  playerId: string;
}

export interface WordPotGame {
  pin: string;
  hostPlayerId: string;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;

  wordsPerPlayer: number;
  roundSeconds: number;
  maxGroups: number;

  groups: Record<string, WordPotGroup>;
  groupOrder: string[];
  players: Record<string, WordPotPlayer>;
  words: Record<string, WordPotWord>;

  phase: WordPotPhase;
  round: WordPotRoundNumber;

  potWordIds: string[];
  currentWordId: string | null;
  currentGroupIndex: number;
  explainerPlayerId: string | null;

  turnActive: boolean;
  turnEndsAt: number | null;
  /** true unmittelbar nachdem ein Zug beendet wurde (Timer abgelaufen oder Topf leer), bis "Weiter" geklickt wird. */
  turnJustEnded: boolean;
  /** Nur relevant wenn turnJustEnded true ist: hat dieser Zug den Topf geleert (= Runde komplett)? */
  roundComplete: boolean;
  /** Punkte, die im gerade beendeten Zug erzielt wurden (für die Zusammenfassung). */
  turnScore: number;
}

export interface CreateWordPotParams {
  groupNames: string[];
  wordsPerPlayer: number;
  roundSeconds: number;
  hostPlayerName: string;
  hostGroupIndex: number;
}

export interface JoinWordPotParams {
  pin: string;
  playerName: string;
  groupId: string;
}
