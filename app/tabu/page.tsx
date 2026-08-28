'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { tabuCards, type TabuCard } from '@/lib/tabuCards';
import styles from './tabu.module.css';

const MIN_GROUPS = 2;
const MAX_GROUPS = 6;
const MIN_SECONDS = 30;
const MAX_SECONDS = 120;
const SECONDS_STEP = 15;
const STORAGE_KEY = 'tabu-game-state';

type Group = {
  id: string;
  name: string;
  score: number;
};

type Phase = 'setup' | 'ready' | 'playing' | 'roundEnd' | 'finished';

type PersistedState = {
  phase: Phase;
  groupCount: number;
  groupNames: string[];
  roundSeconds: number;
  pointLimitEnabled: boolean;
  pointLimit: number;
  groups: Group[];
  currentGroupIndex: number;
  cardQueue: TabuCard[];
  currentCard: TabuCard | null;
  timeLeft: number;
  roundCorrect: number;
  roundPassed: number;
  roundTabu: number;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function TabuPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [groupCount, setGroupCount] = useState(3);
  const [groupNames, setGroupNames] = useState<string[]>(['Team 1', 'Team 2', 'Team 3']);
  const [roundSeconds, setRoundSeconds] = useState(60);
  const [pointLimitEnabled, setPointLimitEnabled] = useState(true);
  const [pointLimit, setPointLimit] = useState(500);

  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [cardQueue, setCardQueue] = useState<TabuCard[]>([]);
  const [currentCard, setCurrentCard] = useState<TabuCard | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundPassed, setRoundPassed] = useState(0);
  const [roundTabu, setRoundTabu] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Gespeicherten Spielstand einmalig beim Laden wiederherstellen.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        if (saved.phase) setPhase(saved.phase);
        if (typeof saved.groupCount === 'number') setGroupCount(saved.groupCount);
        if (Array.isArray(saved.groupNames)) setGroupNames(saved.groupNames);
        if (typeof saved.roundSeconds === 'number') setRoundSeconds(saved.roundSeconds);
        if (typeof saved.pointLimitEnabled === 'boolean') setPointLimitEnabled(saved.pointLimitEnabled);
        if (typeof saved.pointLimit === 'number') setPointLimit(saved.pointLimit);
        if (Array.isArray(saved.groups)) setGroups(saved.groups);
        if (typeof saved.currentGroupIndex === 'number') setCurrentGroupIndex(saved.currentGroupIndex);
        if (Array.isArray(saved.cardQueue)) setCardQueue(saved.cardQueue);
        if (saved.currentCard) setCurrentCard(saved.currentCard);
        if (typeof saved.timeLeft === 'number') setTimeLeft(saved.timeLeft);
        if (typeof saved.roundCorrect === 'number') setRoundCorrect(saved.roundCorrect);
        if (typeof saved.roundPassed === 'number') setRoundPassed(saved.roundPassed);
        if (typeof saved.roundTabu === 'number') setRoundTabu(saved.roundTabu);
      }
    } catch {
      // Beschädigter oder gesperrter Storage: einfach mit dem Standardzustand starten.
    }
    setHydrated(true);
  }, []);

  // Spielstand nach jeder Änderung sichern.
  useEffect(() => {
    if (!hydrated) return;
    const snapshot: PersistedState = {
      phase,
      groupCount,
      groupNames,
      roundSeconds,
      pointLimitEnabled,
      pointLimit,
      groups,
      currentGroupIndex,
      cardQueue,
      currentCard,
      timeLeft,
      roundCorrect,
      roundPassed,
      roundTabu,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage voll oder nicht verfügbar: Spiel läuft trotzdem weiter.
    }
  }, [
    hydrated,
    phase,
    groupCount,
    groupNames,
    roundSeconds,
    pointLimitEnabled,
    pointLimit,
    groups,
    currentGroupIndex,
    cardQueue,
    currentCard,
    timeLeft,
    roundCorrect,
    roundPassed,
    roundTabu,
  ]);

  const currentGroup = groups[currentGroupIndex];
  const nextGroupIndex = (currentGroupIndex + 1) % groups.length;
  const gameOverPending =
    pointLimitEnabled && nextGroupIndex === 0 && groups.some((g) => g.score >= pointLimit);

  // Rundentimer: zählt jede Sekunde herunter, solange phase 'playing' ist.
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setGroups((prev) =>
        prev.map((g, i) => (i === currentGroupIndex ? { ...g, score: g.score + roundCorrect } : g))
      );
      setPhase('roundEnd');
      return;
    }
    const timeout = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, timeLeft, currentGroupIndex, roundCorrect]);

  function updateGroupCount(next: number) {
    const clamped = Math.max(MIN_GROUPS, Math.min(MAX_GROUPS, next));
    setGroupCount(clamped);
    setGroupNames((prev) => {
      const names = [...prev];
      while (names.length < clamped) names.push(`Team ${names.length + 1}`);
      return names.slice(0, clamped);
    });
  }

  function updateGroupName(index: number, name: string) {
    setGroupNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }

  function drawCard(queue: TabuCard[]): [TabuCard, TabuCard[]] {
    if (queue.length === 0) {
      const reshuffled = shuffle(tabuCards);
      return [reshuffled[0], reshuffled.slice(1)];
    }
    return [queue[0], queue.slice(1)];
  }

  function startGame() {
    const initialGroups: Group[] = groupNames.map((name, i) => ({
      id: `group-${i}`,
      name: name.trim() || `Team ${i + 1}`,
      score: 0,
    }));
    const shuffled = shuffle(tabuCards);
    const [card, restQueue] = drawCard(shuffled);

    setGroups(initialGroups);
    setCurrentGroupIndex(0);
    setCardQueue(restQueue);
    setCurrentCard(card);
    setRoundCorrect(0);
    setRoundPassed(0);
    setRoundTabu(0);
    setPhase('ready');
  }

  function beginRound() {
    setTimeLeft(roundSeconds);
    setPhase('playing');
  }

  function advanceCard() {
    const [card, restQueue] = drawCard(cardQueue);
    setCardQueue(restQueue);
    setCurrentCard(card);
  }

  function markCorrect() {
    if (phase !== 'playing') return;
    setRoundCorrect((n) => n + 1);
    advanceCard();
  }

  function markPass() {
    if (phase !== 'playing') return;
    setRoundPassed((n) => n + 1);
    advanceCard();
  }

  function markTabu() {
    if (phase !== 'playing') return;
    setRoundTabu((n) => n + 1);
    advanceCard();
  }

  function nextTurn() {
    const [card, restQueue] = drawCard(cardQueue);
    setCurrentGroupIndex(nextGroupIndex);
    setCardQueue(restQueue);
    setCurrentCard(card);
    setRoundCorrect(0);
    setRoundPassed(0);
    setRoundTabu(0);
    setPhase('ready');
  }

  function endGame() {
    setPhase('finished');
    setConfirmEnd(false);
  }

  function resetToSetup() {
    setPhase('setup');
    setGroups([]);
    setCurrentCard(null);
    setConfirmEnd(false);
  }

  const ranking = useMemo(() => [...groups].sort((a, b) => b.score - a.score), [groups]);
  const topScore = ranking[0]?.score ?? 0;

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>🙊 Tabu</h1>
        </div>

        {phase === 'setup' && (
          <>
            <p className={styles.intro}>
              Ein Spieler erklärt seinem Team einen Begriff, ohne dabei den Begriff selbst oder
              eines von 4 Tabu-Wörtern zu benutzen. Team rät gegen die Zeit – für jeden richtig
              erratenen Begriff gibt es einen Punkt.
            </p>

            <ol className={styles.rules}>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>1</span>
                Ein Team ist dran, ein Spieler hält das Handy und liest still den Begriff samt
                Tabu-Wörtern.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>2</span>
                Auf „Runde starten" tippen: Der Timer läuft, der Spieler erklärt so viele Begriffe
                wie möglich, ohne die Tabu-Wörter zu sagen.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>3</span>
                Erraten: „✓ Richtig" tippen (+1 Punkt). Kommt das Team nicht drauf: „Passen".
                Rutscht dem Erklärenden ein Tabu-Wort raus: „Tabu!" – beides ohne Punkt, nächster
                Begriff.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>4</span>
                Wenn die Zeit abläuft, ist das nächste Team dran.
              </li>
            </ol>

            <div className={styles.section}>
              <p className={styles.label}>Anzahl Teams</p>
              <div className={styles.stepperRow}>
                <button
                  onClick={() => updateGroupCount(groupCount - 1)}
                  disabled={groupCount <= MIN_GROUPS}
                  className={styles.stepperBtn}
                >
                  −
                </button>
                <span className={styles.stepperVal}>{groupCount}</span>
                <button
                  onClick={() => updateGroupCount(groupCount + 1)}
                  disabled={groupCount >= MAX_GROUPS}
                  className={styles.stepperBtn}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Teamnamen</p>
              <div className={styles.fieldList}>
                {groupNames.map((name, i) => (
                  <input
                    key={i}
                    value={name}
                    onChange={(e) => updateGroupName(i, e.target.value)}
                    placeholder={`Team ${i + 1}`}
                    className={styles.field}
                  />
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Rundenzeit</p>
              <div className={styles.stepperRow}>
                <button
                  onClick={() => setRoundSeconds((s) => Math.max(MIN_SECONDS, s - SECONDS_STEP))}
                  disabled={roundSeconds <= MIN_SECONDS}
                  className={styles.stepperBtn}
                >
                  −
                </button>
                <span className={styles.stepperVal}>{roundSeconds}s</span>
                <button
                  onClick={() => setRoundSeconds((s) => Math.min(MAX_SECONDS, s + SECONDS_STEP))}
                  disabled={roundSeconds >= MAX_SECONDS}
                  className={styles.stepperBtn}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Spielende</p>
              <div className={styles.toggleRow}>
                <button
                  onClick={() => setPointLimitEnabled(true)}
                  className={pointLimitEnabled ? styles.toggleBtnOn : styles.toggleBtn}
                >
                  Mit Punktelimit
                </button>
                <button
                  onClick={() => setPointLimitEnabled(false)}
                  className={!pointLimitEnabled ? styles.toggleBtnOn : styles.toggleBtn}
                >
                  Ohne Punktelimit
                </button>
              </div>
              {pointLimitEnabled ? (
                <>
                  <input
                    type="number"
                    min={1}
                    value={pointLimit}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      setPointLimit(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
                    }}
                    className={styles.field}
                  />
                  <p className={styles.hint}>
                    Das Team mit den meisten Punkten gewinnt, sobald das Limit erreicht ist – aber
                    erst, wenn jedes Team gleich oft dran war.
                  </p>
                </>
              ) : (
                <p className={styles.hint}>Das Spiel läuft, bis der Spielleiter es manuell beendet.</p>
              )}
            </div>

            <button
              onClick={startGame}
              disabled={pointLimitEnabled && (!pointLimit || pointLimit <= 0)}
              className={styles.primaryBtn}
            >
              Spiel starten →
            </button>
          </>
        )}

        {(phase === 'ready' || phase === 'playing' || phase === 'roundEnd') && currentGroup && (
          <div className={styles.gameArea}>
            <div className={styles.scoreRow}>
              {groups.map((g, i) => (
                <div key={g.id} className={i === currentGroupIndex ? styles.scorePillActive : styles.scorePill}>
                  <span>{g.name}</span>
                  <span className={styles.scoreNum}>{g.score}</span>
                </div>
              ))}
            </div>

            {phase === 'ready' && (
              <div className={styles.startTurnBox}>
                <p className={styles.turnLabel}>Als Nächstes dran</p>
                <p className={styles.startTurnTitle}>{currentGroup.name}</p>
                <p className={styles.startTurnDesc}>
                  Handy an den Erklärenden übergeben. Sobald ihr bereit seid: Runde starten –
                  {' '}
                  {roundSeconds} Sekunden Zeit.
                </p>
                <button onClick={beginRound} className={styles.primaryBtn}>
                  ▶ Runde starten
                </button>
              </div>
            )}

            {phase === 'playing' && currentCard && (
              <>
                <div className={styles.turnRow}>
                  <span className={styles.turnLabel}>{currentGroup.name} erklärt</span>
                  <span className={styles.turnLabel}>✓ {roundCorrect}</span>
                </div>
                <p className={timeLeft <= 10 ? styles.timerWarning : styles.timer}>{timeLeft}</p>

                <div className={styles.wordCard}>
                  <p className={styles.wordText}>{currentCard.word}</p>
                  <div className={styles.forbiddenList}>
                    {currentCard.forbidden.map((word) => (
                      <span key={word} className={styles.forbiddenItem}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={markCorrect} className={styles.correctBtn}>
                  ✓ Richtig
                </button>
                <div className={styles.actionGrid}>
                  <button onClick={markPass} className={styles.passBtn}>
                    ⏭ Passen
                  </button>
                  <button onClick={markTabu} className={styles.tabuBtn}>
                    ❌ Tabu!
                  </button>
                </div>
              </>
            )}

            {phase === 'roundEnd' && (
              <div className={styles.roundEndBox}>
                <p className={styles.roundTitle}>Zeit abgelaufen! ⏱️</p>
                <p className={styles.roundSub}>
                  {roundCorrect} Punkt{roundCorrect === 1 ? '' : 'e'} für {currentGroup.name} in
                  dieser Runde.
                </p>
                <div className={styles.roundStats}>
                  <span>
                    <b className={styles.roundStatNum}>{roundCorrect}</b>Richtig
                  </span>
                  <span>
                    <b className={styles.roundStatNum}>{roundPassed}</b>Gepasst
                  </span>
                  <span>
                    <b className={styles.roundStatNum}>{roundTabu}</b>Tabu
                  </span>
                </div>
                {gameOverPending ? (
                  <button onClick={endGame} className={styles.primaryBtn}>
                    🏆 Punktelimit erreicht – Endstand anzeigen
                  </button>
                ) : (
                  <button onClick={nextTurn} className={styles.primaryBtn}>
                    Weiter zu {groups[nextGroupIndex].name} →
                  </button>
                )}
              </div>
            )}

            <div className={styles.footerRow}>
              {!confirmEnd ? (
                <button onClick={() => setConfirmEnd(true)} className={styles.endLink}>
                  Spiel beenden
                </button>
              ) : (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Spiel wirklich beenden?</span>
                  <button onClick={endGame} className={styles.confirmYes}>
                    Ja, beenden
                  </button>
                  <button onClick={() => setConfirmEnd(false)} className={styles.confirmNo}>
                    Abbrechen
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'finished' && (
          <>
            <h2 className={styles.finishedTitle}>🏆 Endstand</h2>
            <div className={styles.rankList}>
              {ranking.map((g, i) => (
                <div key={g.id} className={g.score === topScore ? styles.rankRowTop : styles.rankRow}>
                  <span>
                    {i === 0 && g.score === topScore ? '🥇 ' : `${i + 1}. `}
                    {g.name}
                  </span>
                  <span className={styles.rankScore}>{g.score}</span>
                </div>
              ))}
            </div>
            <div className={styles.resultGrid}>
              <button onClick={resetToSetup} className={styles.primaryBtn}>
                Neues Spiel
              </button>
              <Link href="/" className={styles.secondaryBtn}>
                Zur Startseite
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
