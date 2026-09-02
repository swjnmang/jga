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
  // Trivia: Fehlversuche pro Kategorie (kumulativ). Ab 3 wird die nächste Frage dieser
  // Kategorie für diese Gruppe auf Schwierigkeit "leicht" gezogen (Frust-Vermeidung).
  // Wird bei einer richtigen Antwort während dieser "leicht"-Phase auf 0 zurückgesetzt.
  categoryFails?: Record<string, number>;
  schaetzSubmission?: string | null; // Trivia Schätzfrage: eingereichte Schätzung
  avatar?: string; // Avatar der Gruppe: Emoji oder Foto als Base64-Data-URL (data:image/...)
  jokers?: { newQuestion: boolean; next: boolean; dice: boolean; steal: boolean; }; // Trivia: verfügbare Joker
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

export interface MusicProgress {
  cardId: string;
  positionMs: number; // Position (ms) zum Zeitpunkt von updatedAt
  durationMs: number; // Track-Gesamtdauer in ms, 0 solange unbekannt
  updatedAt: number;
}

export interface GameSession {
  id: string; // PIN
  hostId: string;
  state: GameState;
  mode: 'timeline' | 'trivia';
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
  musicProgress?: MusicProgress; // Echte Position/Dauer der laufenden Musik, für Fortschrittsanzeige bei allen Spielern
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
  difficultyMeta?: Record<string, string>; // cardId → difficulty (für die "leicht"-Ausweich-Logik)
  availableDeck?: string[];              // Noch nicht gestellte Karten (cardIds)
  // Ban-Phase
  banModeEnabled?: boolean;              // Ob der Ban-Modus aktiviert ist (Gruppen können Kategorien sperren)
  bannedCategories?: string[];           // Von Gruppen gebannte Kategorien
  banPhaseGroupOrder?: string[];         // Reihenfolge der Gruppen in der Ban-Phase
  banPhaseCurrentIndex?: number;         // Index der aktuell bannenden Gruppe
  banPhaseDeadline?: number;             // Unix-Timestamp: wann die aktuelle Ban-Runde abläuft
  // Gewinnbedingung Trivia
  triviaWinCondition?: 'categories' | 'points'; // 'categories' = alle Kats. abgehakt; 'points' = meiste Punkte
  // Kategorie-Rotation (Trivia)
  currentRoundCategory?: string;       // Aktuelle Kategorie, aus der alle Gruppen spielen
  categoryRoundQueue?: string[];       // Noch ausstehende Kategorien in dieser Runde (gemischt)
  categoryGroupQueue?: string[];       // Gruppen, die in der aktuellen Kategorie noch spielen müssen
  // Textantwort-Eingabe (Trivia, mit Spielleitung): Gruppen tippen ihre Antwort ein,
  // die Spielleitung sieht die eingereichte Antwort und entscheidet richtig/falsch.
  // Standardmäßig aktiviert, in den Grundeinstellungen abschaltbar. Im spielleitungslosen
  // Modus (hostless) ist Textantwort ohnehin immer aktiv, unabhängig von diesem Feld.
  hostTextAnswersEnabled?: boolean;
  // Joker-System (Trivia)
  jokersEnabled?: boolean;                  // Ob Joker aktiviert sind
  jokerNextActive?: boolean;                // Joker 2 «NEXT» ist gerade aktiv
  jokerNextOriginGroupId?: string | null;   // Gruppe die den NEXT-Joker genutzt hat
  jokerNextTargetGroupId?: string | null;   // Gruppe die die weitergegebene Frage beantworten muss
  jokerDiceResult?: number | null;          // Letztes Würfelergebnis (1–6)
  jokerDiceGroupId?: string | null;         // Gruppe die zuletzt gewürfelt hat
  jokerDicePending?: boolean | null;        // Würfelergebnis angezeigt, Spielleiter muss bestätigen
  jokerStealActive?: boolean;               // Joker 4 «STEAL» ist gerade aktiv
  jokerStealGroupId?: string | null;        // Gruppe die den STEAL-Joker genutzt hat
  jokerStealFromGroupId?: string | null;    // Gruppe deren Frage geklaut wurde
  jokerStealReturnActive?: boolean;         // Gestohlene Gruppe ist jetzt an der Reihe (Rückgabe-Zug)
  // Joker-Benachrichtigung (transient: Zwischenbildschirm für alle, bis Host bestätigt)
  jokerNotification?: {
    type: 'newQuestion' | 'next' | 'steal';
    byGroupId: string;          // Gruppe die den Joker genutzt hat
    targetGroupId?: string;     // Zielgruppe (NEXT: erhält die Frage; STEAL: wurde geklaut von)
    fromGroupId?: string;       // Gestohlene Gruppe (STEAL only)
    timestamp: number;
  } | null;
  // Gleichstand-Auflösung (Trivia – Kategorien-Modus)
  triviaFinalRound?: boolean;          // Letzter Umlauf läuft (andere Gruppen holen noch auf)
  triviaFinalRoundPending?: string[];  // Gruppen, die noch ihren letzten Zug haben
  triviaLeaders?: string[];           // Gruppen, die bereits alle Kategorien gesammelt haben
  triviaTiebreakerActive?: boolean;   // Stechen-Schätzfrage läuft
  triviaTiebreakerGroupIds?: string[]; // Nur diese Gruppen nehmen am Stechen teil
  // Schätzfragen-Injektion: spätestens alle N normale Fragen (N = Gruppenanzahl)
  triviaSchaetzCounter?: number;          // nicht-Schätzfragen seit letzter Injektion
  schaetzInjected?: boolean;             // true wenn aktuelle Karte eingefügte Schätzfrage ist
  schaetzInjectedNext?: {               // gespeicherter nächster Zug, wird nach Schätzfrage wiederhergestellt
    nextCardId: string | null;
    nextGroupId: string | null;
    currentRoundCategory: string;
    categoryRoundQueue: string[];
    categoryGroupQueue: string[];
  } | null;
  // Schätzfrage-Ergebnis (transient: gesetzt nach Auswertung, gelöscht beim Weiter)
  schaetzResult?: {
    answer: string;
    winnerIds: string[];
    submissions: { groupId: string; groupName: string; value: string; isWinner: boolean; color: string; }[];
    jokerRestores?: { groupId: string; groupName: string; jokerKey: 'newQuestion' | 'next' | 'dice' | 'steal' }[];
  } | null;
  // Endgeräte-Modus (Trivia): alle Gruppen spielen gemeinsam auf einem geteilten Gerät.
  // Der Steal-Joker setzt voraus, dass andere Gruppen unbemerkt auf ihrem eigenen Gerät
  // reagieren können — das entfällt hier, daher wird er in diesem Modus nie vergeben.
  singleDeviceMode?: boolean;
  // ── Spielleitungsloser Modus ──────────────────────────────────────────────
  hostless?: boolean;                    // Spiel läuft ohne aktive Spielleitung (Trivia: Text+Abstimmung, Timeline: Auto-Advance)
  presence?: Record<string, Record<string, boolean>>; // groupId -> playerId -> online (RTDB onDisconnect-Tracking)
  pendingTextAnswer?: {                  // Trivia (hostless): eingereichte Textantwort der aktiven Gruppe, wartet auf Abstimmung
    groupId: string;
    text: string;
    submittedAt: number;
  } | null;
  answerVotes?: Record<string, boolean> | null; // Trivia (hostless): groupId -> Stimme (true = für "richtig")
  textAnswerResult?: {                   // Trivia (hostless): Auswertungs-Reveal, bevor zur nächsten Frage gewechselt wird
    groupId: string;
    text: string;
    correct: boolean;
    correctVotes: number;
    totalVotes: number;
  } | null;
  // Spielleitungsloser Modus: Abstimmung "Spiel jetzt beenden?" — jede Gruppe kann sie starten
  endGameVote?: {
    initiatedBy: string;               // groupId, die die Abstimmung gestartet hat
    votes: Record<string, boolean>;    // groupId -> Stimme (true = beenden)
  } | null;
  // Highscores: true, sobald der Sieg dieser Runde in highscores/ aufgezeichnet wurde
  // (oder feststeht, dass keine Aufzeichnung nötig ist).
  highscoreRecorded?: boolean;
}

// Ein Eintrag in der globalen Highscore-Liste (Firebase-Pfad "highscores/"),
// unabhängig vom Live-Spiel gespeichert, da games/{pin} nach Spielende
// automatisch aufgeräumt wird (siehe subscribeToGame/STALE_GAME_MS).
export interface HighscoreEntry {
  id: string;                    // Firebase Push-Key
  pin: string;                   // PIN des Spiels, zur Referenz
  groupName: string;
  groupColor: string;
  avatar?: string | null;
  mode: 'timeline' | 'trivia';
  points: number;                 // group.score zum Zeitpunkt des Siegs (Timeline: korrekt platzierte Karten, Trivia: Punkte)
  completedCategories: number;    // Trivia (Kategorien-Modus): Anzahl gesammelter Kategorien
  finishedAt: number;
}

export interface CreateGameParams {
  mode: 'timeline' | 'trivia';
  settings: UserSettings;
  deck: Card[];
  hostGroupName: string;
  hostPlayerName: string;
  maxGroups?: number;
  banModeEnabled?: boolean;
  triviaWinCondition?: 'categories' | 'points';
  timelineWinTarget?: number | null;
  jokersEnabled?: boolean;
  singleDeviceMode?: boolean;
  hostless?: boolean;
  hostAvatar?: string;
  hostTextAnswersEnabled?: boolean;
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
