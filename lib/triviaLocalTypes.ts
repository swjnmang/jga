import { Card } from './types';

// Übergabe vom Erstellungs-Assistenten (app/multiplayer/page.tsx) an den rein lokalen
// Endgeräte-Modus (app/multiplayer/lokal/page.tsx): das fertig gefilterte/gemischte
// Deck plus die in Schritt 1 gewählten Trivia-Regeln. Gruppen werden erst auf der
// lokalen Seite selbst angelegt (siehe dort).
export const TRIVIA_LOCAL_SETUP_KEY = 'trivia-lokal-setup';

export interface TriviaLocalSetupPayload {
  deck: Card[];
  banModeEnabled: boolean;
  jokersEnabled: boolean;
  triviaWinCondition: 'categories' | 'points';
  hostTextAnswersEnabled: boolean;
}

export const TRIVIA_LOCAL_GAME_KEY = 'trivia-lokal-state';
