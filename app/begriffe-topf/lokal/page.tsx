'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ROUND_LABELS, ROUND_DESCRIPTIONS, WordPotRoundNumber } from '@/lib/wordPotTypes';
import styles from '../begriffetopf.module.css';

const MIN_GROUPS = 2;
const MAX_GROUPS = 10;
const MIN_WORDS = 3;
const MAX_WORDS = 20;
const MIN_SECONDS = 20;
const MAX_SECONDS = 90;
const SECONDS_STEP = 5;
const STORAGE_KEY = 'begriffetopf-lokal-state';

type Group = { id: string; name: string; score: number };
type LocalWord = { id: string; text: string; groupId: string };
type Phase = 'setup' | 'collecting' | 'ready' | 'playing' | 'turnEnd' | 'finished';

type PersistedState = {
  phase: Phase;
  groupCount: number;
  groupNames: string[];
  wordsPerGroup: number;
  roundSeconds: number;
  groups: Group[];
  words: LocalWord[];
  collectingGroupIndex: number;
  round: WordPotRoundNumber;
  potWordIds: string[];
  currentWordId: string | null;
  currentGroupIndex: number;
  timeLeft: number;
  turnScore: number;
  roundComplete: boolean;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function BegriffeTopfLokalPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [groupCount, setGroupCount] = useState(3);
  const [groupNames, setGroupNames] = useState<string[]>(['Gruppe 1', 'Gruppe 2', 'Gruppe 3']);
  const [wordsPerGroup, setWordsPerGroup] = useState(8);
  const [roundSeconds, setRoundSeconds] = useState(45);

  const [groups, setGroups] = useState<Group[]>([]);
  const [words, setWords] = useState<LocalWord[]>([]);
  const [collectingGroupIndex, setCollectingGroupIndex] = useState(0);
  const [newWordText, setNewWordText] = useState('');

  const [round, setRound] = useState<WordPotRoundNumber>(1);
  const [potWordIds, setPotWordIds] = useState<string[]>([]);
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [turnScore, setTurnScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);

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
        if (typeof saved.wordsPerGroup === 'number') setWordsPerGroup(saved.wordsPerGroup);
        if (typeof saved.roundSeconds === 'number') setRoundSeconds(saved.roundSeconds);
        if (Array.isArray(saved.groups)) setGroups(saved.groups);
        if (Array.isArray(saved.words)) setWords(saved.words);
        if (typeof saved.collectingGroupIndex === 'number') setCollectingGroupIndex(saved.collectingGroupIndex);
        if (saved.round === 1 || saved.round === 2 || saved.round === 3) setRound(saved.round);
        if (Array.isArray(saved.potWordIds)) setPotWordIds(saved.potWordIds);
        if (typeof saved.currentWordId === 'string' || saved.currentWordId === null) {
          setCurrentWordId(saved.currentWordId ?? null);
        }
        if (typeof saved.currentGroupIndex === 'number') setCurrentGroupIndex(saved.currentGroupIndex);
        if (typeof saved.timeLeft === 'number') setTimeLeft(saved.timeLeft);
        if (typeof saved.turnScore === 'number') setTurnScore(saved.turnScore);
        if (typeof saved.roundComplete === 'boolean') setRoundComplete(saved.roundComplete);
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
      wordsPerGroup,
      roundSeconds,
      groups,
      words,
      collectingGroupIndex,
      round,
      potWordIds,
      currentWordId,
      currentGroupIndex,
      timeLeft,
      turnScore,
      roundComplete,
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
    wordsPerGroup,
    roundSeconds,
    groups,
    words,
    collectingGroupIndex,
    round,
    potWordIds,
    currentWordId,
    currentGroupIndex,
    timeLeft,
    turnScore,
    roundComplete,
  ]);

  const activeGroup = groups[currentGroupIndex];
  const collectingGroup = groups[collectingGroupIndex];
  const currentWord = currentWordId ? words.find((w) => w.id === currentWordId) ?? null : null;

  const wordsForGroup = useMemo(
    () => (groupId: string) => words.filter((w) => w.groupId === groupId),
    [words]
  );
  const collectingGroupWords = collectingGroup ? wordsForGroup(collectingGroup.id) : [];
  const isLastCollectingGroup = collectingGroupIndex >= groups.length - 1;

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

  function startCollecting() {
    const initialGroups: Group[] = groupNames.map((name, i) => ({
      id: `group-${i}`,
      name: name.trim() || `Gruppe ${i + 1}`,
      score: 0,
    }));
    setGroups(initialGroups);
    setWords([]);
    setCollectingGroupIndex(0);
    setNewWordText('');
    setPhase('collecting');
  }

  function addWord() {
    if (!collectingGroup) return;
    const text = newWordText.trim();
    if (!text || collectingGroupWords.length >= wordsPerGroup) return;
    setWords((prev) => [...prev, { id: generateLocalId(), text, groupId: collectingGroup.id }]);
    setNewWordText('');
  }

  function continueCollecting() {
    if (isLastCollectingGroup) {
      setPotWordIds(shuffle(words.map((w) => w.id)));
      setCurrentGroupIndex(0);
      setRound(1);
      setPhase('ready');
    } else {
      setCollectingGroupIndex((i) => i + 1);
      setNewWordText('');
    }
  }

  function startTurn() {
    if (potWordIds.length === 0) return;
    const nextId = potWordIds[Math.floor(Math.random() * potWordIds.length)];
    setCurrentWordId(nextId);
    setTimeLeft(roundSeconds);
    setTurnScore(0);
    setPhase('playing');
  }

  // Rundentimer: zählt jede Sekunde herunter, solange phase 'playing' ist.
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setCurrentGroupIndex((i) => (i + 1) % groups.length);
      setCurrentWordId(null);
      setRoundComplete(false);
      setPhase('turnEnd');
      return;
    }
    const timeout = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, groups.length]);

  function markCorrect() {
    if (phase !== 'playing' || !currentWordId || !activeGroup) return;
    const remaining = potWordIds.filter((id) => id !== currentWordId);
    setGroups((prev) =>
      prev.map((g, i) => (i === currentGroupIndex ? { ...g, score: g.score + 1 } : g))
    );
    setTurnScore((n) => n + 1);
    setPotWordIds(remaining);

    if (remaining.length === 0) {
      setCurrentWordId(null);
      setRoundComplete(true);
      setPhase('turnEnd');
      return;
    }
    const nextId = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentWordId(nextId);
  }

  function putBack() {
    if (phase !== 'playing' || potWordIds.length === 0) return;
    const nextId = potWordIds[Math.floor(Math.random() * potWordIds.length)];
    setCurrentWordId(nextId);
  }

  function continueAfterTurnEnd() {
    if (roundComplete) {
      if (round >= 3) {
        setPhase('finished');
        return;
      }
      setRound((r) => ((r + 1) as WordPotRoundNumber));
      setPotWordIds(shuffle(words.map((w) => w.id)));
      setTurnScore(0);
      setPhase('ready');
      return;
    }
    setTurnScore(0);
    setPhase('ready');
  }

  function endGame() {
    setPhase('finished');
    setConfirmEnd(false);
  }

  function resetToSetup() {
    setPhase('setup');
    setGroups([]);
    setWords([]);
    setCollectingGroupIndex(0);
    setPotWordIds([]);
    setCurrentWordId(null);
    setCurrentGroupIndex(0);
    setRound(1);
    setTurnScore(0);
    setRoundComplete(false);
    setConfirmEnd(false);
  }

  const ranking = useMemo(() => [...groups].sort((a, b) => b.score - a.score), [groups]);
  const topScore = ranking[0]?.score ?? 0;

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/begriffe-topf" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>🫙 Begriffe-Topf</h1>
        </div>

        {phase === 'setup' && (
          <>
            <p className={styles.intro}>
              Alles läuft auf diesem einen Handy. Jede Gruppe reicht der Reihe nach ihre
              Begriffe ein, danach wird das Handy beim Erklären immer an die aktive Gruppe
              weitergegeben.
            </p>

            <ol className={styles.rules}>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>1</span>
                Jede Gruppe reicht nacheinander ihre eigenen Begriffe auf diesem Handy ein.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>2</span>
                Reihum ist eine Gruppe dran: Handy an die Erklärende Person übergeben, Timer
                starten.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>3</span>
                Erraten wird abgehakt, nicht erratene Begriffe kommen zurück in den Topf.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>4</span>
                Sind alle Begriffe erraten, startet die nächste Runde: erst Erklären, dann
                Pantomime, zuletzt nur ein Wort.
              </li>
            </ol>

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
              <p className={styles.label}>Begriffe pro Gruppe</p>
              <div className={styles.stepperRow}>
                <button
                  onClick={() => setWordsPerGroup((n) => Math.max(MIN_WORDS, n - 1))}
                  disabled={wordsPerGroup <= MIN_WORDS}
                  className={styles.stepperBtn}
                >
                  −
                </button>
                <span className={styles.stepperVal}>{wordsPerGroup}</span>
                <button
                  onClick={() => setWordsPerGroup((n) => Math.min(MAX_WORDS, n + 1))}
                  disabled={wordsPerGroup >= MAX_WORDS}
                  className={styles.stepperBtn}
                >
                  +
                </button>
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

            <button onClick={startCollecting} className={styles.primaryBtn}>
              Weiter zu den Begriffen →
            </button>
          </>
        )}

        {phase === 'collecting' && collectingGroup && (
          <div className={styles.gameArea}>
            <div className={styles.startTurnBox}>
              <p className={styles.startTurnTitle}>{collectingGroup.name} sammelt Begriffe</p>
              <p className={styles.startTurnDesc}>
                Gebt eure Begriffe ein ({collectingGroupWords.length}/{wordsPerGroup}) und
                übergebt das Handy danach an die nächste Gruppe.
              </p>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Fortschritt</p>
              <div className={styles.groupProgressList}>
                {groups.map((g, i) => {
                  const submitted = wordsForGroup(g.id).length;
                  const done = submitted >= wordsPerGroup;
                  const isCurrent = i === collectingGroupIndex;
                  return (
                    <div key={g.id} className={done ? styles.groupProgressRowDone : styles.groupProgressRow}>
                      <span>
                        {g.name}
                        {isCurrent && !done ? ' ✎' : ''}
                      </span>
                      <span className={styles.groupProgressCount}>
                        {submitted}/{wordsPerGroup} {done ? '✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {collectingGroupWords.length < wordsPerGroup && (
              <div className={styles.submitRow}>
                <input
                  value={newWordText}
                  onChange={(e) => setNewWordText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addWord()}
                  placeholder="Begriff eingeben …"
                  className={styles.field}
                />
                <button onClick={addWord} disabled={!newWordText.trim()} className={styles.submitBtn}>
                  +
                </button>
              </div>
            )}

            {collectingGroupWords.length > 0 && (
              <div className={styles.myWordsList}>
                {collectingGroupWords.map((w, i) => (
                  <div key={w.id} className={styles.myWordRow}>
                    <span>
                      <span className={styles.myWordIndex}>{i + 1}.</span>
                      {w.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={continueCollecting}
              disabled={collectingGroupWords.length < wordsPerGroup}
              className={styles.primaryBtn}
            >
              {isLastCollectingGroup
                ? 'Alle Begriffe gesammelt – Spiel starten →'
                : `Weiter, Handy übergeben →`}
            </button>
          </div>
        )}

        {(phase === 'ready' || phase === 'playing' || phase === 'turnEnd') && activeGroup && (
          <div className={styles.gameArea}>
            <div className={styles.roundBanner}>
              <span className={styles.roundBadge}>
                Runde {round}/3 · {ROUND_LABELS[round]}
              </span>
            </div>
            <p className={styles.roundDesc}>{ROUND_DESCRIPTIONS[round]}</p>

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
                <p className={styles.startTurnTitle}>{activeGroup.name} ist dran</p>
                <p className={styles.startTurnDesc}>
                  Handy an den Erklärenden übergeben. Sobald ihr bereit seid: los –{' '}
                  {roundSeconds} Sekunden Zeit.
                </p>
                <button onClick={startTurn} className={styles.primaryBtn}>
                  ▶ Los, {activeGroup.name} erklärt
                </button>
              </div>
            )}

            {phase === 'playing' && currentWord && (
              <>
                <p className={timeLeft <= 10 ? styles.timerWarning : styles.timer}>{timeLeft}</p>
                <div className={styles.wordCard}>
                  <p className={styles.wordText}>{currentWord.text}</p>
                </div>
                <div className={styles.actionGrid}>
                  <button onClick={markCorrect} className={styles.correctBtn}>
                    ✓ Erraten
                  </button>
                  <button onClick={putBack} className={styles.backBtn}>
                    ↩ Zurücklegen
                  </button>
                </div>
              </>
            )}

            {phase === 'turnEnd' && (
              <div className={roundComplete ? styles.turnEndBoxRound : styles.turnEndBox}>
                <p className={styles.turnEndTitle}>
                  {roundComplete ? `Runde ${round} komplett! 🎉` : 'Zeit abgelaufen! ⏱️'}
                </p>
                <p className={styles.turnEndSub}>
                  {turnScore} Begriff{turnScore === 1 ? '' : 'e'} in diesem Zug.
                  {roundComplete
                    ? round < 3
                      ? ` Weiter geht's mit Runde ${round + 1}: ${ROUND_LABELS[(round + 1) as 1 | 2 | 3]}.`
                      : ' Das war die letzte Runde!'
                    : ''}
                </p>
                <button onClick={continueAfterTurnEnd} className={styles.primaryBtn}>
                  {roundComplete
                    ? round < 3
                      ? `Weiter zu Runde ${round + 1} →`
                      : 'Endstand anzeigen →'
                    : `Weiter zu ${activeGroup.name} →`}
                </button>
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
