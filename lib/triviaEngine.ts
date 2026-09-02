// Reine, synchrone Trivia-Regel-Engine — von der Firebase-gestützten Mehrgeräte-Variante
// (lib/multiplayerService.ts) UND vom rein lokalen Endgeräte-Modus (app/multiplayer/lokal)
// gemeinsam genutzt, damit beide exakt dieselben Spielregeln anwenden.

export interface NextTurnResult {
  nextGroupId: string;
  nextCardId: string | null;
  currentRoundCategory: string;
  categoryRoundQueue: string[];
  categoryGroupQueue: string[];
}

// Fehlversuchs-Schwelle, ab der die nächste Frage einer Kategorie für eine Gruppe
// bevorzugt aus Schwierigkeit "leicht" gezogen wird (Frust-Vermeidung).
const CATEGORY_FAIL_EASY_THRESHOLD = 3;
const EASY_DIFFICULTY = 'leicht';

/**
 * Wählt aus `matches` (bereits auf eine Kategorie gefilterte Karten-IDs) zufällig eine
 * Karte aus. Hat die Gruppe in dieser Kategorie bereits `CATEGORY_FAIL_EASY_THRESHOLD`
 * oder mehr Fehlversuche gesammelt, wird bevorzugt aus den "leicht"-Karten des Pools
 * gezogen — sind keine vorhanden (z.B. weil "leicht" beim Erstellen abgewählt wurde),
 * wird ganz normal aus dem vollen Pool gezogen.
 */
export function pickCardRespectingDifficulty(
  matches: string[],
  gid: string,
  cat: string,
  groupCategoryFails: Record<string, Record<string, number>>,
  difficultyMeta: Record<string, string>
): string | null {
  if (matches.length === 0) return null;
  const fails = groupCategoryFails[gid]?.[cat] ?? 0;
  if (fails >= CATEGORY_FAIL_EASY_THRESHOLD) {
    const easyMatches = matches.filter((id) => difficultyMeta[id] === EASY_DIFFICULTY);
    if (easyMatches.length > 0) {
      return easyMatches[Math.floor(Math.random() * easyMatches.length)];
    }
  }
  return matches[Math.floor(Math.random() * matches.length)];
}

/**
 * Berechnet den nächsten Spielzustand nach einem Trivia-Zug.
 * - Gleiche Kategorie, nächste Gruppe, falls noch Gruppen übrig (und noch nicht gesammelt).
 * - Nächste Kategorie (zufällig), berechtigte Gruppen spielen, wenn Kategorie-Runde fertig.
 * - Schätzfragen-Ausnahme: alle Gruppen spielen stets mit.
 * - Im Punkte-Modus: keine Kategorie-Filterung.
 * - Frust-Vermeidung: hat eine Gruppe in der gezogenen Kategorie ≥3 Fehlversuche,
 *   wird bevorzugt eine "leicht"-Frage gezogen (siehe pickCardRespectingDifficulty).
 */
export function computeNextTurn(
  playingGroupIds: string[],
  currentRoundCat: string,
  catGroupQueue: string[],    // [0] = active group, rest = pending
  catRoundQueue: string[],    // remaining categories this round
  triviaCategories: string[], // all categories
  newAvailable: string[],
  deckMeta: Record<string, string>,
  groupCompletedCategories: Record<string, string[]>,  // gid -> completed cats (with updated active group)
  winCondition: string,       // 'categories' | 'points'
  groupCategoryFails: Record<string, Record<string, number>> = {}, // gid -> cat -> Fehlversuche
  difficultyMeta: Record<string, string> = {} // cardId → difficulty
): NextTurnResult {
  // Eine Gruppe ist für eine Kategorie spielberechtigt wenn:
  // - Modus ist Punkte, ODER
  // - Die Gruppe hat diese Kategorie noch nicht gesammelt
  // Hinweis: Die frühere Schätzfragen-Ausnahme ("immer spielberechtigt") wurde entfernt,
  // da sie eine Endlosschleife verursachte: Gruppen, die Schätzfragen bereits gesammelt
  // hatten, wurden trotzdem immer wieder in Schätzfragen-Runden geschickt und nie zu
  // anderen Kategorien weitergeleitet.
  const isEligible = (gid: string, cat: string): boolean => {
    if (winCondition !== 'categories') return true;
    return !(groupCompletedCategories[gid] ?? []).includes(cat);
  };

  // Finde die passende Kategorie + Karte für eine Gruppe:
  // Bevorzuge preferredCat, weicht auf nächste unerledigte Kategorie aus.
  const findCardForGroup = (gid: string, preferredCat: string, extraSearchOrder: string[]): { cardId: string; cat: string } | null => {
    if (isEligible(gid, preferredCat)) {
      const matches = newAvailable.filter(id => deckMeta[id] === preferredCat);
      const picked = pickCardRespectingDifficulty(matches, gid, preferredCat, groupCategoryFails, difficultyMeta);
      if (picked !== null) {
        return { cardId: picked, cat: preferredCat };
      }
    }
    const searchOrder = [...extraSearchOrder, ...triviaCategories.filter(c => !extraSearchOrder.includes(c) && c !== preferredCat)];
    for (const cat of searchOrder) {
      if (!isEligible(gid, cat)) continue;
      const matches = newAvailable.filter(id => deckMeta[id] === cat);
      const picked = pickCardRespectingDifficulty(matches, gid, cat, groupCategoryFails, difficultyMeta);
      if (picked !== null) {
        return { cardId: picked, cat };
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
        // currentRoundCategory bleibt die Runden-Kategorie — auch wenn eine Gruppe
        // eine Ersatz-Kategorie erhält, spielen die nachfolgenden Gruppen weiterhin
        // aus der Runden-Kategorie.
        currentRoundCategory: currentRoundCat,
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
// Schätzfragen-Injektion: spätestens alle N normalen Fragen (N = Anzahl spielender
// Gruppen) wird zwangsweise eine Schätzfrage eingeschleust, damit dieser Kartentyp
// nicht rein zufällig monatelang ausbleiben kann. Der eigentlich anstehende Zug wird
// dafür beiseitegelegt und nach Auswertung der Schätzfrage wiederhergestellt.
// ---------------------------------------------------------------------------

export interface SchaetzInjectedNext {
  nextCardId: string | null;
  nextGroupId: string;
  currentRoundCategory: string;
  categoryRoundQueue: string[];
  categoryGroupQueue: string[];
}

export interface SchaetzInjectionParams {
  currentCategory: string;
  triviaSchaetzCounter: number;
  playingGroupCount: number;
  newAvailable: string[];
  deckMeta: Record<string, string>;
  currentCardIndex: number;
  next: NextTurnResult;
}

export interface SchaetzInjectionOutcome {
  triviaSchaetzCounter: number;
  schaetzInjected: boolean;
  schaetzInjectedNext: SchaetzInjectedNext | null;
  currentCardId: string | null;
  currentTurnGroupId: string;
  currentRoundCategory: string;
  categoryRoundQueue: string[];
  categoryGroupQueue: string[];
}

export function maybeInjectSchaetzfrage(params: SchaetzInjectionParams): SchaetzInjectionOutcome {
  const { currentCategory, triviaSchaetzCounter, playingGroupCount, newAvailable, deckMeta, currentCardIndex, next } = params;
  const isCurrentSchaetz = currentCategory === 'schaetzfragen';
  const newCounter = isCurrentSchaetz ? 0 : triviaSchaetzCounter + 1;
  // Frühestens alle 5 Fragen, bei mehr Gruppen entsprechend seltener (N = Anzahl
  // spielender Gruppen), damit bei vielen Gruppen weiterhin jede einmal drankommt,
  // bevor eine Schätzfrage dazwischenkommt.
  const schaetzInterval = Math.max(5, playingGroupCount);
  const schaetzPool = newAvailable.filter(id => deckMeta[id] === 'schaetzfragen');
  const firstQuestion = currentCardIndex === 0;

  if (!firstQuestion && newCounter >= schaetzInterval && schaetzPool.length > 0) {
    const injectedCardId = schaetzPool[Math.floor(Math.random() * schaetzPool.length)];
    return {
      triviaSchaetzCounter: 0,
      schaetzInjected: true,
      schaetzInjectedNext: {
        nextCardId: next.nextCardId ?? null,
        nextGroupId: next.nextGroupId,
        currentRoundCategory: next.currentRoundCategory,
        categoryRoundQueue: next.categoryRoundQueue ?? [],
        categoryGroupQueue: next.categoryGroupQueue ?? [],
      },
      currentCardId: injectedCardId,
      currentTurnGroupId: next.nextGroupId,
      currentRoundCategory: next.currentRoundCategory,
      categoryRoundQueue: next.categoryRoundQueue,
      categoryGroupQueue: next.categoryGroupQueue,
    };
  }

  return {
    triviaSchaetzCounter: newCounter >= schaetzInterval ? 0 : newCounter,
    schaetzInjected: false,
    schaetzInjectedNext: null,
    currentCardId: next.nextCardId,
    currentTurnGroupId: next.nextGroupId,
    currentRoundCategory: next.currentRoundCategory,
    categoryRoundQueue: next.categoryRoundQueue,
    categoryGroupQueue: next.categoryGroupQueue,
  };
}
