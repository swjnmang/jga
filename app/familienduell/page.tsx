'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  familienduellQuestions,
  type FamilienduellQuestion,
} from '@/lib/familienduellQuestions';
import { playBuzzerSound, playCorrectSound } from '@/lib/familienduellSounds';
import styles from './familienduell.module.css';

const MAX_STRIKES = 3;
const MIN_GROUPS = 2;
const MAX_GROUPS = 6;
const MIN_QUESTION_TIMER = 5;
const MAX_QUESTION_TIMER = 60;
const QUESTION_TIMER_STEP = 5;
const MIN_STEAL_TIMER = 10;
const MAX_STEAL_TIMER = 90;
const STEAL_TIMER_STEP = 5;
const STORAGE_KEY = 'familienduell-game-state';

type Group = {
  id: string;
  name: string;
  score: number;
};

type Phase = 'setup' | 'playing' | 'steal' | 'roundEnd' | 'finished';

type PersistedState = {
  phase: Phase;
  groupCount: number;
  groupNames: string[];
  pointLimitEnabled: boolean;
  pointLimit: number;
  timerEnabled: boolean;
  questionTimerSeconds: number;
  stealTimerSeconds: number;
  groups: Group[];
  currentGroupIndex: number;
  questionQueue: FamilienduellQuestion[];
  currentQuestion: FamilienduellQuestion | null;
  revealed: boolean[];
  strikes: number;
  roundPoints: number;
  stealGroupIndex: number | null;
  stealResult: 'success' | 'fail' | null;
  stealPoints: number;
  timerRunning: boolean;
  timerSecondsLeft: number;
  lastSnapshot: UndoSnapshot | null;
};

/** Zustand direkt vor der letzten Eingabe des Spielleiters – für den Rückgängig-Button. */
type UndoSnapshot = {
  phase: Phase;
  groups: Group[];
  currentGroupIndex: number;
  questionQueue: FamilienduellQuestion[];
  currentQuestion: FamilienduellQuestion | null;
  revealed: boolean[];
  strikes: number;
  roundPoints: number;
  stealGroupIndex: number | null;
  stealResult: 'success' | 'fail' | null;
  stealPoints: number;
  timerRunning: boolean;
  timerSecondsLeft: number;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FamilienduellPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [groupCount, setGroupCount] = useState(3);
  const [groupNames, setGroupNames] = useState<string[]>(['Gruppe 1', 'Gruppe 2', 'Gruppe 3']);
  const [pointLimitEnabled, setPointLimitEnabled] = useState(true);
  const [pointLimit, setPointLimit] = useState(500);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState(15);
  const [stealTimerSeconds, setStealTimerSeconds] = useState(30);

  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [questionQueue, setQuestionQueue] = useState<FamilienduellQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<FamilienduellQuestion | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [stealGroupIndex, setStealGroupIndex] = useState<number | null>(null);
  const [stealResult, setStealResult] = useState<'success' | 'fail' | null>(null);
  const [stealPoints, setStealPoints] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [lastSnapshot, setLastSnapshot] = useState<UndoSnapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Gespeicherten Spielstand einmalig beim Laden wiederherstellen, damit ein
  // Browser-Refresh die aktive Gruppe nicht aus dem Spiel wirft.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        if (saved.phase) setPhase(saved.phase);
        if (typeof saved.groupCount === 'number') setGroupCount(saved.groupCount);
        if (Array.isArray(saved.groupNames)) setGroupNames(saved.groupNames);
        if (typeof saved.pointLimitEnabled === 'boolean') setPointLimitEnabled(saved.pointLimitEnabled);
        if (typeof saved.pointLimit === 'number') setPointLimit(saved.pointLimit);
        if (typeof saved.timerEnabled === 'boolean') setTimerEnabled(saved.timerEnabled);
        if (typeof saved.questionTimerSeconds === 'number') setQuestionTimerSeconds(saved.questionTimerSeconds);
        if (typeof saved.stealTimerSeconds === 'number') setStealTimerSeconds(saved.stealTimerSeconds);
        if (Array.isArray(saved.groups)) setGroups(saved.groups);
        if (typeof saved.currentGroupIndex === 'number') setCurrentGroupIndex(saved.currentGroupIndex);
        if (Array.isArray(saved.questionQueue)) setQuestionQueue(saved.questionQueue);
        if (saved.currentQuestion) setCurrentQuestion(saved.currentQuestion);
        if (Array.isArray(saved.revealed)) setRevealed(saved.revealed);
        if (typeof saved.strikes === 'number') setStrikes(saved.strikes);
        if (typeof saved.roundPoints === 'number') setRoundPoints(saved.roundPoints);
        if (saved.stealGroupIndex !== undefined) setStealGroupIndex(saved.stealGroupIndex);
        if (saved.stealResult !== undefined) setStealResult(saved.stealResult);
        if (typeof saved.stealPoints === 'number') setStealPoints(saved.stealPoints);
        if (typeof saved.timerRunning === 'boolean') setTimerRunning(saved.timerRunning);
        if (typeof saved.timerSecondsLeft === 'number') setTimerSecondsLeft(saved.timerSecondsLeft);
        if (saved.lastSnapshot !== undefined) setLastSnapshot(saved.lastSnapshot);
      }
    } catch {
      // Beschädigter oder gesperrter Storage: einfach mit dem Standardzustand starten.
    }
    setHydrated(true);
  }, []);

  // Spielstand nach jeder Änderung sichern (erst nachdem die Wiederherstellung
  // abgeschlossen ist, sonst würde der Default-Zustand den Storage überschreiben).
  useEffect(() => {
    if (!hydrated) return;
    const snapshot: PersistedState = {
      phase,
      groupCount,
      groupNames,
      pointLimitEnabled,
      pointLimit,
      timerEnabled,
      questionTimerSeconds,
      stealTimerSeconds,
      groups,
      currentGroupIndex,
      questionQueue,
      currentQuestion,
      revealed,
      strikes,
      roundPoints,
      stealGroupIndex,
      stealResult,
      stealPoints,
      timerRunning,
      timerSecondsLeft,
      lastSnapshot,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage voll oder nicht verfügbar (z.B. privates Fenster): Spiel läuft trotzdem weiter.
    }
  }, [
    hydrated,
    phase,
    groupCount,
    groupNames,
    pointLimitEnabled,
    pointLimit,
    timerEnabled,
    questionTimerSeconds,
    stealTimerSeconds,
    groups,
    currentGroupIndex,
    questionQueue,
    currentQuestion,
    revealed,
    strikes,
    roundPoints,
    stealGroupIndex,
    stealResult,
    stealPoints,
    timerRunning,
    timerSecondsLeft,
    lastSnapshot,
  ]);

  // Timer-Countdown: zählt jede Sekunde herunter, solange er läuft, und bleibt
  // bei 0 stehen (kein automatischer Effekt, nur die rot blinkende Anzeige).
  useEffect(() => {
    if (!timerRunning || timerSecondsLeft <= 0) return;
    const t = setTimeout(() => setTimerSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timerSecondsLeft]);

  const currentGroup = groups[currentGroupIndex];
  const stealGroup = stealGroupIndex !== null ? groups[stealGroupIndex] : null;
  const boardCleared = currentQuestion ? revealed.every(Boolean) : false;
  // Die Diebstahl-Gruppe ist immer die nächste Gruppe in der Reihenfolge (siehe
  // registerStrike). Die neue Frage geht danach ebenfalls an genau diese nächste
  // Gruppe – niemals zurück an die soeben bestohlene Gruppe, auch nicht bei nur
  // zwei Gruppen im Spiel.
  const nextGroupIndex = (currentGroupIndex + 1) % groups.length;
  // Ein Sieger steht erst fest, wenn alle Gruppen gleich oft dran waren: das ist
  // exakt der Moment, in dem der nächste Zug wieder bei Gruppe 0 beginnen würde
  // (= ein voller Rotationszyklus ist abgeschlossen).
  const gameOverPending =
    pointLimitEnabled && nextGroupIndex === 0 && groups.some((g) => g.score >= pointLimit);

  function updateGroupCount(next: number) {
    const clamped = Math.max(MIN_GROUPS, Math.min(MAX_GROUPS, next));
    setGroupCount(clamped);
    setGroupNames((prev) => {
      const names = [...prev];
      while (names.length < clamped) names.push(`Gruppe ${names.length + 1}`);
      return names.slice(0, clamped);
    });
  }

  function updateGroupName(index: number, name: string) {
    setGroupNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }

  /** Merkt sich den Stand direkt vor einer Eingabe, damit sie per Klick rückgängig gemacht werden kann. */
  function captureSnapshot() {
    setLastSnapshot({
      phase,
      groups,
      currentGroupIndex,
      questionQueue,
      currentQuestion,
      revealed,
      strikes,
      roundPoints,
      stealGroupIndex,
      stealResult,
      stealPoints,
      timerRunning,
      timerSecondsLeft,
    });
  }

  function undoLast() {
    if (!lastSnapshot) return;
    setPhase(lastSnapshot.phase);
    setGroups(lastSnapshot.groups);
    setCurrentGroupIndex(lastSnapshot.currentGroupIndex);
    setQuestionQueue(lastSnapshot.questionQueue);
    setCurrentQuestion(lastSnapshot.currentQuestion);
    setRevealed(lastSnapshot.revealed);
    setStrikes(lastSnapshot.strikes);
    setRoundPoints(lastSnapshot.roundPoints);
    setStealGroupIndex(lastSnapshot.stealGroupIndex);
    setStealResult(lastSnapshot.stealResult);
    setStealPoints(lastSnapshot.stealPoints);
    setTimerRunning(lastSnapshot.timerRunning);
    setTimerSecondsLeft(lastSnapshot.timerSecondsLeft);
    setLastSnapshot(null);
  }

  /** Setzt den Timer für eine neue Frage zurück (noch nicht gestartet). */
  function resetTimerForNewQuestion() {
    setTimerRunning(false);
    setTimerSecondsLeft(questionTimerSeconds);
  }

  function startQuestionTimer() {
    if (!timerEnabled) return;
    setTimerRunning(true);
    setTimerSecondsLeft(questionTimerSeconds);
  }

  function drawQuestion(queue: FamilienduellQuestion[]): [FamilienduellQuestion, FamilienduellQuestion[]] {
    if (queue.length === 0) {
      const reshuffled = shuffle(familienduellQuestions);
      return [reshuffled[0], reshuffled.slice(1)];
    }
    return [queue[0], queue.slice(1)];
  }

  function startGame() {
    const initialGroups: Group[] = groupNames.map((name, i) => ({
      id: `group-${i}`,
      name: name.trim() || `Gruppe ${i + 1}`,
      score: 0,
    }));
    const shuffled = shuffle(familienduellQuestions);
    const [question, restQueue] = drawQuestion(shuffled);

    setGroups(initialGroups);
    setCurrentGroupIndex(0);
    setQuestionQueue(restQueue);
    setCurrentQuestion(question);
    setRevealed(new Array(question.answers.length).fill(false));
    setStrikes(0);
    setRoundPoints(0);
    setStealGroupIndex(null);
    setStealResult(null);
    setStealPoints(0);
    setLastSnapshot(null);
    resetTimerForNewQuestion();
    setPhase('playing');
  }

  function toggleAnswer(index: number) {
    if (!currentQuestion || phase !== 'playing') return;
    const points = currentQuestion.answers[index].points;
    captureSnapshot();

    if (revealed[index]) {
      // Versehentlich abgehakte Antwort per erneutem Klick rückgängig machen.
      setRevealed((prev) => prev.map((r, i) => (i === index ? false : r)));
      setRoundPoints((prev) => prev - points);
      setGroups((prev) =>
        prev.map((g, i) => (i === currentGroupIndex ? { ...g, score: g.score - points } : g))
      );
      return;
    }

    playCorrectSound();
    setRevealed((prev) => prev.map((r, i) => (i === index ? true : r)));
    setRoundPoints((prev) => prev + points);
    setGroups((prev) =>
      prev.map((g, i) => (i === currentGroupIndex ? { ...g, score: g.score + points } : g))
    );

    const nextRevealedCount = revealed.filter(Boolean).length + 1;
    if (nextRevealedCount >= currentQuestion.answers.length) {
      setPhase('roundEnd');
      setTimerRunning(false);
    } else if (timerEnabled) {
      // Nach jeder richtig aufgedeckten Antwort startet der Timer automatisch neu.
      setTimerRunning(true);
      setTimerSecondsLeft(questionTimerSeconds);
    }
  }

  function registerStrike() {
    if (phase !== 'playing') return;
    captureSnapshot();
    playBuzzerSound();
    const next = strikes + 1;
    setStrikes(next);
    if (next >= MAX_STRIKES) {
      setStealGroupIndex((currentGroupIndex + 1) % groups.length);
      setPhase('steal');
      // Ausnahme: Die Diebstahl-Chance hat einen eigenen, automatisch startenden Timer.
      if (timerEnabled) {
        setTimerRunning(true);
        setTimerSecondsLeft(stealTimerSeconds);
      }
    } else if (timerEnabled) {
      // Nach jeder falschen Antwort (ohne Diebstahl-Auslösung) startet der
      // Frage-Timer automatisch neu bei der vollen Zeit.
      setTimerRunning(true);
      setTimerSecondsLeft(questionTimerSeconds);
    }
  }

  function stealAnswer(index: number) {
    if (!currentQuestion || revealed[index] || phase !== 'steal' || stealGroupIndex === null) return;
    const points = currentQuestion.answers[index].points;
    captureSnapshot();

    playCorrectSound();
    setRevealed((prev) => prev.map((r, i) => (i === index ? true : r)));
    setGroups((prev) =>
      prev.map((g, i) => (i === stealGroupIndex ? { ...g, score: g.score + points } : g))
    );
    setStealPoints(points);
    setStealResult('success');
    setPhase('roundEnd');
    setTimerRunning(false);
  }

  function stealMiss() {
    if (phase !== 'steal') return;
    captureSnapshot();
    playBuzzerSound();
    setStealResult('fail');
    setPhase('roundEnd');
    setTimerRunning(false);
  }

  function nextRound() {
    captureSnapshot();
    const [question, restQueue] = drawQuestion(questionQueue);
    setCurrentGroupIndex(nextGroupIndex);
    setQuestionQueue(restQueue);
    setCurrentQuestion(question);
    setRevealed(new Array(question.answers.length).fill(false));
    setStrikes(0);
    setRoundPoints(0);
    setStealGroupIndex(null);
    setStealResult(null);
    setStealPoints(0);
    resetTimerForNewQuestion();
    setPhase('playing');
  }

  function skipQuestion() {
    captureSnapshot();
    const [question, restQueue] = drawQuestion(questionQueue);
    setQuestionQueue(restQueue);
    setCurrentQuestion(question);
    setRevealed(new Array(question.answers.length).fill(false));
    setStrikes(0);
    setRoundPoints(0);
    resetTimerForNewQuestion();
  }

  function endGame() {
    setPhase('finished');
    setConfirmEnd(false);
  }

  function resetToSetup() {
    setPhase('setup');
    setGroups([]);
    setCurrentQuestion(null);
    setConfirmEnd(false);
    setLastSnapshot(null);
    setTimerRunning(false);
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
          <h1 className={styles.title}>🎉 Familienduell</h1>
        </div>

        {phase === 'setup' && (
          <>
            <p className={styles.intro}>
              Ein Spielleiter liest die Frage vor (&bdquo;Wir haben 100 Leute befragt…&ldquo;) und
              sieht dabei direkt die Top-5-Antworten. Wird eine Antwort von der Gruppe genannt, hakt
              der Spielleiter sie per Klick ab. Nach 3 falschen Antworten kommt die nächste Gruppe
              mit einer neuen Frage dran.
            </p>

            <div className={styles.section}>
              <p className={styles.label}>Anzahl Gruppen</p>
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
              <p className={styles.label}>Gruppennamen</p>
              <div className={styles.fieldList}>
                {groupNames.map((name, i) => (
                  <input
                    key={i}
                    value={name}
                    onChange={(e) => updateGroupName(i, e.target.value)}
                    placeholder={`Gruppe ${i + 1}`}
                    className={styles.field}
                  />
                ))}
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
                    Die Gruppe mit den meisten Punkten gewinnt, sobald das Limit erreicht ist – aber
                    erst, wenn jede Gruppe gleich oft dran war.
                  </p>
                </>
              ) : (
                <p className={styles.hint}>Das Spiel läuft, bis der Spielleiter es manuell beendet.</p>
              )}
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Timer</p>
              <div className={styles.toggleRow}>
                <button
                  onClick={() => setTimerEnabled(true)}
                  className={timerEnabled ? styles.toggleBtnOn : styles.toggleBtn}
                >
                  Mit Timer
                </button>
                <button
                  onClick={() => setTimerEnabled(false)}
                  className={!timerEnabled ? styles.toggleBtnOn : styles.toggleBtn}
                >
                  Ohne Timer
                </button>
              </div>
              {timerEnabled ? (
                <>
                  <p className={styles.hint}>
                    Der Spielleiter startet den Timer einmal manuell zu Beginn einer Frage. Nach jeder
                    richtig oder falsch gewählten Antwort startet er automatisch neu – außer bei der
                    Diebstahl-Chance, die ihren eigenen Timer bekommt. Läuft die Zeit ab, passiert
                    nichts automatisch, die Anzeige blinkt nur rot.
                  </p>
                  <p className={styles.label}>Zeit pro Frage</p>
                  <div className={styles.stepperRow}>
                    <button
                      onClick={() =>
                        setQuestionTimerSeconds((s) => Math.max(MIN_QUESTION_TIMER, s - QUESTION_TIMER_STEP))
                      }
                      disabled={questionTimerSeconds <= MIN_QUESTION_TIMER}
                      className={styles.stepperBtn}
                    >
                      −
                    </button>
                    <span className={styles.stepperVal}>{questionTimerSeconds}s</span>
                    <button
                      onClick={() =>
                        setQuestionTimerSeconds((s) => Math.min(MAX_QUESTION_TIMER, s + QUESTION_TIMER_STEP))
                      }
                      disabled={questionTimerSeconds >= MAX_QUESTION_TIMER}
                      className={styles.stepperBtn}
                    >
                      +
                    </button>
                  </div>
                  <p className={styles.label}>Zeit für Diebstahl-Chance</p>
                  <div className={styles.stepperRow}>
                    <button
                      onClick={() => setStealTimerSeconds((s) => Math.max(MIN_STEAL_TIMER, s - STEAL_TIMER_STEP))}
                      disabled={stealTimerSeconds <= MIN_STEAL_TIMER}
                      className={styles.stepperBtn}
                    >
                      −
                    </button>
                    <span className={styles.stepperVal}>{stealTimerSeconds}s</span>
                    <button
                      onClick={() => setStealTimerSeconds((s) => Math.min(MAX_STEAL_TIMER, s + STEAL_TIMER_STEP))}
                      disabled={stealTimerSeconds >= MAX_STEAL_TIMER}
                      className={styles.stepperBtn}
                    >
                      +
                    </button>
                  </div>
                </>
              ) : (
                <p className={styles.hint}>Es wird keine Zeit angezeigt oder gemessen.</p>
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

        {(phase === 'playing' || phase === 'steal' || phase === 'roundEnd') && currentQuestion && (
          <div className={styles.gameArea}>
            {/* Scoreboard */}
            <div className={styles.scoreRow}>
              {groups.map((g, i) => (
                <div
                  key={g.id}
                  className={
                    i === (phase === 'steal' ? stealGroupIndex : currentGroupIndex)
                      ? styles.scorePillActive
                      : styles.scorePill
                  }
                >
                  <span>{g.name}</span>
                  <span className={styles.scoreNum}>
                    {g.score}
                    {pointLimitEnabled ? ` / ${pointLimit}` : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Question card */}
            <div className={styles.questionCard}>
              <p className={styles.questionLabel}>Wir haben 100 Leute befragt:</p>
              <p className={styles.questionText}>{currentQuestion.question}</p>
            </div>

            {/* Answer board */}
            <div className={styles.answerList}>
              {currentQuestion.answers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => (phase === 'steal' ? stealAnswer(i) : toggleAnswer(i))}
                  disabled={phase === 'steal' ? revealed[i] : phase !== 'playing'}
                  className={revealed[i] ? styles.answerRowRevealed : styles.answerRow}
                >
                  <span className={revealed[i] ? styles.answerBadgeRevealed : styles.answerBadge}>
                    {revealed[i] ? '✓' : i + 1}
                  </span>
                  <span className={revealed[i] ? styles.answerTextRevealed : styles.answerText}>
                    {answer.text}
                  </span>
                  <span className={revealed[i] ? styles.answerPointsRevealed : styles.answerPoints}>
                    {answer.points}
                  </span>
                </button>
              ))}
            </div>

            {/* Timer */}
            {timerEnabled && phase === 'playing' && (
              <div className={styles.timerBox}>
                <span className={styles.timerLabel}>⏱ Timer</span>
                <div className={styles.timerRight}>
                  <span
                    className={
                      timerRunning && timerSecondsLeft <= 0 ? styles.timerValueExpired : styles.timerValue
                    }
                  >
                    {timerRunning ? timerSecondsLeft : questionTimerSeconds}
                  </span>
                  {!timerRunning && (
                    <button onClick={startQuestionTimer} className={styles.timerStartBtn}>
                      ▶ Timer starten
                    </button>
                  )}
                </div>
              </div>
            )}

            {timerEnabled && phase === 'steal' && (
              <div className={styles.timerBox}>
                <span className={styles.timerLabel}>⏱ Diebstahl-Timer</span>
                <span className={timerSecondsLeft <= 0 ? styles.timerValueExpired : styles.timerValue}>
                  {timerSecondsLeft}
                </span>
              </div>
            )}

            {/* Strikes + controls */}
            {phase === 'playing' && (
              <div className={styles.section}>
                <div className={styles.strikesRow}>
                  <div className={styles.strikes}>
                    {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                      <span key={i} className={i < strikes ? styles.strikeOn : styles.strike}>
                        ✕
                      </span>
                    ))}
                  </div>
                  <button onClick={skipQuestion} className={styles.skipLink}>
                    Frage überspringen
                  </button>
                </div>
                <button onClick={registerStrike} className={styles.buzzBtn}>
                  ✕ Falsche Antwort
                </button>
              </div>
            )}

            {phase === 'steal' && stealGroup && (
              <div className={styles.stealBox}>
                <p className={styles.stealTitle}>🕵️ Diebstahl-Chance für {stealGroup.name}!</p>
                <p className={styles.stealDesc}>
                  {currentGroup.name} hat nicht alle Antworten gefunden. {stealGroup.name} darf einen
                  der übrigen Begriffe erraten – ein Treffer sichert die Punkte.
                </p>
                <button onClick={stealMiss} className={styles.missBtn}>
                  Kein Treffer – weiter
                </button>
              </div>
            )}

            {phase === 'roundEnd' && (
              <div className={styles.roundEndBox}>
                {stealGroup ? (
                  <>
                    <p className={styles.roundTitle}>
                      {stealResult === 'success'
                        ? `${stealGroup.name} hat den Diebstahl geschafft! 🎉`
                        : `${stealGroup.name} konnte nicht stehlen.`}
                    </p>
                    <p className={styles.roundSub}>
                      {roundPoints} Punkte für {currentGroup.name}
                      {stealResult === 'success'
                        ? ` · ${stealPoints} Punkte für ${stealGroup.name} (Diebstahl)`
                        : ''}{' '}
                      in dieser Runde.
                    </p>
                  </>
                ) : (
                  <>
                    <p className={styles.roundTitle}>
                      {boardCleared
                        ? `${currentGroup.name} hat alle Antworten gefunden! 🎉`
                        : `3 falsche Antworten – Runde vorbei.`}
                    </p>
                    <p className={styles.roundSub}>
                      {roundPoints} Punkte für {currentGroup.name} in dieser Runde.
                    </p>
                  </>
                )}
                {gameOverPending ? (
                  <button onClick={endGame} className={styles.primaryBtn}>
                    🏆 Punktelimit erreicht – Endstand anzeigen
                  </button>
                ) : (
                  <button onClick={nextRound} className={styles.primaryBtn}>
                    Weiter zu {groups[nextGroupIndex].name} →
                  </button>
                )}
              </div>
            )}

            {/* End game */}
            <div className={styles.footerRow}>
              <div className={styles.footerActions}>
                <button onClick={undoLast} disabled={!lastSnapshot} className={styles.undoLink}>
                  ↩ Letzte Eingabe rückgängig
                </button>
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
