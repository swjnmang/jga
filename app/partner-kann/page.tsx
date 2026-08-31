'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { partnerKannTasks, type PartnerKannTask } from '@/lib/partnerKannTasks';
import styles from './partnerkann.module.css';

const MIN_GROUPS = 2;
const MAX_GROUPS = 6;
const STORAGE_KEY = 'partnerkann-game-state';

type Group = {
  id: string;
  name: string;
  score: number;
};

type Phase = 'setup' | 'bidding' | 'attempt' | 'roundEnd' | 'finished';

type PersistedState = {
  phase: Phase;
  groupCount: number;
  groupNames: string[];
  groups: Group[];
  taskQueue: PartnerKannTask[];
  currentTask: PartnerKannTask | null;
  winningGroupIndex: number | null;
  bidValueInput: string;
  confirmedBid: number | null;
  roundOutcome: 'success' | 'fail' | null;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PartnerKannPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [groupCount, setGroupCount] = useState(3);
  const [groupNames, setGroupNames] = useState<string[]>(['Paar 1', 'Paar 2', 'Paar 3']);

  const [groups, setGroups] = useState<Group[]>([]);
  const [taskQueue, setTaskQueue] = useState<PartnerKannTask[]>([]);
  const [currentTask, setCurrentTask] = useState<PartnerKannTask | null>(null);
  const [winningGroupIndex, setWinningGroupIndex] = useState<number | null>(null);
  const [bidValueInput, setBidValueInput] = useState('');
  const [confirmedBid, setConfirmedBid] = useState<number | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<'success' | 'fail' | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Gespeicherten Spielstand einmalig beim Laden wiederherstellen, damit ein
  // Browser-Refresh die laufende Runde nicht aus dem Spiel wirft.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        if (saved.phase) setPhase(saved.phase);
        if (typeof saved.groupCount === 'number') setGroupCount(saved.groupCount);
        if (Array.isArray(saved.groupNames)) setGroupNames(saved.groupNames);
        if (Array.isArray(saved.groups)) setGroups(saved.groups);
        if (Array.isArray(saved.taskQueue)) setTaskQueue(saved.taskQueue);
        if (saved.currentTask) setCurrentTask(saved.currentTask);
        if (saved.winningGroupIndex !== undefined) setWinningGroupIndex(saved.winningGroupIndex);
        if (typeof saved.bidValueInput === 'string') setBidValueInput(saved.bidValueInput);
        if (saved.confirmedBid !== undefined) setConfirmedBid(saved.confirmedBid);
        if (saved.roundOutcome !== undefined) setRoundOutcome(saved.roundOutcome);
      }
    } catch {
      // Beschädigter oder gesperrter Storage: einfach mit dem Standardzustand starten.
    }
    setHydrated(true);
  }, []);

  // Spielstand nach jeder Änderung sichern (erst nach abgeschlossener Wiederherstellung).
  useEffect(() => {
    if (!hydrated) return;
    const snapshot: PersistedState = {
      phase,
      groupCount,
      groupNames,
      groups,
      taskQueue,
      currentTask,
      winningGroupIndex,
      bidValueInput,
      confirmedBid,
      roundOutcome,
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
    groups,
    taskQueue,
    currentTask,
    winningGroupIndex,
    bidValueInput,
    confirmedBid,
    roundOutcome,
  ]);

  const winningGroup = winningGroupIndex !== null ? groups[winningGroupIndex] : null;

  function updateGroupCount(next: number) {
    const clamped = Math.max(MIN_GROUPS, Math.min(MAX_GROUPS, next));
    setGroupCount(clamped);
    setGroupNames((prev) => {
      const names = [...prev];
      while (names.length < clamped) names.push(`Paar ${names.length + 1}`);
      return names.slice(0, clamped);
    });
  }

  function updateGroupName(index: number, name: string) {
    setGroupNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }

  function drawTask(queue: PartnerKannTask[]): [PartnerKannTask, PartnerKannTask[]] {
    if (queue.length === 0) {
      const reshuffled = shuffle(partnerKannTasks);
      return [reshuffled[0], reshuffled.slice(1)];
    }
    return [queue[0], queue.slice(1)];
  }

  function startGame() {
    const initialGroups: Group[] = groupNames.map((name, i) => ({
      id: `group-${i}`,
      name: name.trim() || `Paar ${i + 1}`,
      score: 0,
    }));
    const shuffled = shuffle(partnerKannTasks);
    const [task, restQueue] = drawTask(shuffled);

    setGroups(initialGroups);
    setTaskQueue(restQueue);
    setCurrentTask(task);
    setWinningGroupIndex(null);
    setBidValueInput('');
    setConfirmedBid(null);
    setRoundOutcome(null);
    setPhase('bidding');
  }

  function selectBidder(index: number) {
    if (phase !== 'bidding') return;
    setWinningGroupIndex(index);
  }

  function confirmBid() {
    const parsed = parseInt(bidValueInput, 10);
    if (winningGroupIndex === null || !Number.isFinite(parsed) || parsed <= 0) return;
    setConfirmedBid(parsed);
    setPhase('attempt');
  }

  function markOutcome(success: boolean) {
    if (phase !== 'attempt' || winningGroupIndex === null) return;
    setGroups((prev) =>
      prev.map((g, i) => {
        if (success) return i === winningGroupIndex ? { ...g, score: g.score + 2 } : g;
        return i === winningGroupIndex ? g : { ...g, score: g.score + 1 };
      })
    );
    setRoundOutcome(success ? 'success' : 'fail');
    setPhase('roundEnd');
  }

  function nextTask() {
    const [task, restQueue] = drawTask(taskQueue);
    setTaskQueue(restQueue);
    setCurrentTask(task);
    setWinningGroupIndex(null);
    setBidValueInput('');
    setConfirmedBid(null);
    setRoundOutcome(null);
    setPhase('bidding');
  }

  function skipTask() {
    const [task, restQueue] = drawTask(taskQueue);
    setTaskQueue(restQueue);
    setCurrentTask(task);
    setWinningGroupIndex(null);
    setBidValueInput('');
  }

  function endGame() {
    setPhase('finished');
    setConfirmEnd(false);
  }

  function resetToSetup() {
    setPhase('setup');
    setGroups([]);
    setCurrentTask(null);
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
          <h1 className={styles.title}>🤩 Mein Partner/meine Partnerin kann…</h1>
        </div>

        {phase === 'setup' && (
          <>
            <p className={styles.intro}>
              Angelehnt an die SAT.1-Show „Mein Mann kann": Eine zufällige, messbare Aufgabe wird
              gezogen (z.&nbsp;B. „Wie viele Wäscheklammern kann er/sie in 60 Sekunden anlegen?").
              Die <strong>nicht antretenden</strong> Partner bieten reihum, wie gut ihr Partner/ihre
              Partnerin abschneiden wird – wie bei einer Auktion. Wer am höchsten bietet, bekommt
              den Zuschlag: Der eigene Partner/die eigene Partnerin muss die Aufgabe jetzt erfüllen
              und mindestens die gebotene Zahl erreichen.
            </p>

            <ol className={styles.rules}>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>1</span>
                Aufgabe ziehen und laut vorlesen.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>2</span>
                Alle nicht antretenden Partner bieten abwechselnd eine Zahl – „Mein Partner kann
                mindestens 15…". Wer am höchsten bietet, bekommt den Zuschlag.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>3</span>
                Der antretende Partner/die antretende Partnerin versucht, die gebotene Zahl zu
                erreichen oder zu übertreffen.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>4</span>
                Geschafft: Die bietende Gruppe bekommt 2 Punkte. Nicht geschafft: Alle anderen
                Gruppen bekommen je einen Punkt.
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
                    placeholder={`Paar ${i + 1}`}
                    className={styles.field}
                  />
                ))}
              </div>
            </div>

            <button onClick={startGame} className={styles.primaryBtn}>
              Spiel starten →
            </button>
          </>
        )}

        {(phase === 'bidding' || phase === 'attempt' || phase === 'roundEnd') && currentTask && (
          <div className={styles.gameArea}>
            {/* Scoreboard */}
            <div className={styles.scoreRow}>
              {groups.map((g) => (
                <div key={g.id} className={styles.scorePill}>
                  <span>{g.name}</span>
                  <span className={styles.scoreNum}>{g.score}</span>
                </div>
              ))}
            </div>

            {/* Task card */}
            <div className={styles.taskCard}>
              <p className={styles.taskLabel}>Mein Partner/meine Partnerin kann…</p>
              <p className={styles.taskText}>{currentTask.text}</p>
            </div>

            {phase === 'bidding' && (
              <div className={styles.section}>
                <p className={styles.label}>Wer hat am höchsten geboten?</p>
                <div className={styles.bidderRow}>
                  {groups.map((g, i) => (
                    <button
                      key={g.id}
                      onClick={() => selectBidder(i)}
                      className={i === winningGroupIndex ? styles.bidderPillActive : styles.bidderPill}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
                <p className={styles.label}>Gebotene Zahl</p>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={bidValueInput}
                  onChange={(e) => setBidValueInput(e.target.value)}
                  placeholder="z.B. 15"
                  className={styles.field}
                />
                <button
                  onClick={confirmBid}
                  disabled={winningGroupIndex === null || !bidValueInput || parseInt(bidValueInput, 10) <= 0}
                  className={styles.primaryBtn}
                >
                  Zuschlag bestätigen →
                </button>
                <button onClick={skipTask} className={styles.skipLink}>
                  Aufgabe überspringen
                </button>
              </div>
            )}

            {phase === 'attempt' && winningGroup && (
              <div className={styles.attemptBox}>
                <p className={styles.attemptTitle}>
                  🎯 {winningGroup.name} hat für {confirmedBid} geboten!
                </p>
                <p className={styles.attemptDesc}>
                  Schafft der antretende Partner/die antretende Partnerin mindestens {confirmedBid}?
                </p>
                <div className={styles.attemptBtnRow}>
                  <button onClick={() => markOutcome(true)} className={styles.successBtn}>
                    ✅ Geschafft
                  </button>
                  <button onClick={() => markOutcome(false)} className={styles.failBtn}>
                    ❌ Nicht geschafft
                  </button>
                </div>
              </div>
            )}

            {phase === 'roundEnd' && winningGroup && (
              <div className={roundOutcome === 'success' ? styles.roundEndBoxSuccess : styles.roundEndBoxFail}>
                <p className={styles.roundTitle}>
                  {roundOutcome === 'success'
                    ? `${winningGroup.name} hat es geschafft! 🎉`
                    : `${winningGroup.name} hat die ${confirmedBid} nicht erreicht.`}
                </p>
                <p className={styles.roundSub}>
                  {roundOutcome === 'success'
                    ? `+2 Punkte für ${winningGroup.name}.`
                    : `+1 Punkt für alle anderen Gruppen.`}
                </p>
                <button onClick={nextTask} className={styles.primaryBtn}>
                  Nächste Aufgabe →
                </button>
              </div>
            )}

            {/* End game */}
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
