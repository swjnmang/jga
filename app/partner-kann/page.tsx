'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  partnerKannTasks,
  partnerKannCategories,
  partnerKannCategoryLabels,
  partnerKannCategoryIcons,
  getPartnerKannTimerConfig,
  type PartnerKannTask,
  type PartnerKannCategory,
} from '@/lib/partnerKannTasks';
import { playBuzzerSound } from '@/lib/familienduellSounds';
import styles from './partnerkann.module.css';

const MIN_GROUPS = 2;
const MAX_GROUPS = 6;
const STORAGE_KEY = 'partnerkann-game-state';

type Group = {
  id: string;
  name: string;
  score: number;
};

type Phase = 'setup' | 'pickTask' | 'bidding' | 'attempt' | 'roundEnd' | 'finished';

type PersistedState = {
  phase: Phase;
  groupCount: number;
  groupNames: string[];
  groups: Group[];
  usedTaskIds: string[];
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
  const [usedTaskIds, setUsedTaskIds] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<PartnerKannTask | null>(null);
  const [winningGroupIndex, setWinningGroupIndex] = useState<number | null>(null);
  const [bidValueInput, setBidValueInput] = useState('');
  const [confirmedBid, setConfirmedBid] = useState<number | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<'success' | 'fail' | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Timer für zeitbasierte Aufgaben (Countdown mit fester Sekundenzahl, oder
  // Stoppuhr für Aufgaben, deren erzielte Dauer selbst das Ergebnis ist).
  const timerConfig = useMemo(
    () => (currentTask ? getPartnerKannTimerConfig(currentTask.text) : null),
    [currentTask]
  );
  const [timerValue, setTimerValue] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

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
        if (Array.isArray(saved.usedTaskIds)) setUsedTaskIds(saved.usedTaskIds);
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
      usedTaskIds,
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
    usedTaskIds,
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

  // Timer zurücksetzen, sobald eine neue Aufgabe gezogen wird.
  useEffect(() => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimerValue(timerConfig?.mode === 'countdown' ? timerConfig.seconds : 0);
  }, [currentTask?.id, timerConfig]);

  // Countdown: zählt herunter, solange der Timer läuft.
  useEffect(() => {
    if (!timerRunning || timerConfig?.mode !== 'countdown') return;
    if (timerValue <= 0) {
      setTimerRunning(false);
      setTimerDone(true);
      playBuzzerSound();
      return;
    }
    const t = setTimeout(() => setTimerValue((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timerValue, timerConfig]);

  // Stoppuhr: zählt hoch, solange sie läuft.
  useEffect(() => {
    if (!timerRunning || timerConfig?.mode !== 'stopwatch') return;
    const t = setTimeout(() => setTimerValue((v) => v + 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timerValue, timerConfig]);

  function resetTimer() {
    setTimerRunning(false);
    setTimerDone(false);
    setTimerValue(timerConfig?.mode === 'countdown' ? timerConfig.seconds : 0);
  }

  /**
   * Zieht eine Aufgabe aus der gewählten Kategorie (oder "random" für alle
   * Kategorien zusammen) und schließt bereits gestellte Aufgaben aus. Ist der
   * Pool erschöpft, wird nur dessen Historie zurückgesetzt, andere Kategorien
   * bleiben unberührt.
   */
  function pickTask(category: PartnerKannCategory | 'random') {
    const pool = category === 'random' ? partnerKannTasks : partnerKannTasks.filter((t) => t.category === category);
    let available = pool.filter((t) => !usedTaskIds.includes(t.id));
    if (available.length === 0) {
      const poolIds = new Set(pool.map((t) => t.id));
      setUsedTaskIds((prev) => prev.filter((id) => !poolIds.has(id)));
      available = pool;
    }
    const task = shuffle(available)[0];
    setUsedTaskIds((prev) => [...prev, task.id]);
    setCurrentTask(task);
    setWinningGroupIndex(null);
    setBidValueInput('');
    setConfirmedBid(null);
    setRoundOutcome(null);
    setPhase('bidding');
  }

  function goToPickTask() {
    setWinningGroupIndex(null);
    setBidValueInput('');
    setConfirmedBid(null);
    setRoundOutcome(null);
    setPhase('pickTask');
  }

  function startGame() {
    const initialGroups: Group[] = groupNames.map((name, i) => ({
      id: `group-${i}`,
      name: name.trim() || `Paar ${i + 1}`,
      score: 0,
    }));

    setGroups(initialGroups);
    setUsedTaskIds([]);
    setCurrentTask(null);
    setWinningGroupIndex(null);
    setBidValueInput('');
    setConfirmedBid(null);
    setRoundOutcome(null);
    setPhase('pickTask');
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
              Angelehnt an die SAT.1-Show „Mein Mann kann": Eine messbare Aufgabe wird gestellt
              (z.&nbsp;B. „Wie viele Wäscheklammern kann er/sie in 60 Sekunden anlegen?"). Die{' '}
              <strong>nicht antretenden</strong> Partner bieten reihum, wie gut ihr Partner/ihre
              Partnerin abschneiden wird – wie bei einer Auktion. Wer am höchsten bietet, bekommt
              den Zuschlag: Der eigene Partner/die eigene Partnerin muss die Aufgabe jetzt erfüllen
              und mindestens die gebotene Zahl erreichen.
            </p>

            <ol className={styles.rules}>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>1</span>
                Wer das Handy hält, wählt eine Kategorie oder zieht eine zufällige Aufgabe – und
                liest sie laut vor.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>2</span>
                Alle nicht antretenden Partner bieten abwechselnd eine Zahl – „Mein Partner kann
                mindestens 15…". Wer am höchsten bietet, bekommt den Zuschlag.
              </li>
              <li className={styles.rule}>
                <span className={styles.ruleNum}>3</span>
                Der antretende Partner/die antretende Partnerin versucht, die gebotene Zahl zu
                erreichen oder zu übertreffen. Bei zeitbasierten Aufgaben blendet die App direkt
                einen passenden Timer ein.
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

        {(phase === 'pickTask' || phase === 'bidding' || phase === 'attempt' || phase === 'roundEnd') && (
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

            {phase === 'pickTask' && (
              <div className={styles.section}>
                <p className={styles.label}>Kategorie wählen oder zufällig ziehen</p>
                <div className={styles.categoryGrid}>
                  {partnerKannCategories.map((cat) => (
                    <button key={cat} onClick={() => pickTask(cat)} className={styles.categoryBtn}>
                      <span className={styles.categoryIcon}>{partnerKannCategoryIcons[cat]}</span>
                      {partnerKannCategoryLabels[cat]}
                    </button>
                  ))}
                </div>
                <button onClick={() => pickTask('random')} className={styles.primaryBtn}>
                  🎲 Zufällige Aufgabe
                </button>
              </div>
            )}

            {currentTask && (phase === 'bidding' || phase === 'attempt' || phase === 'roundEnd') && (
              <>
                {/* Task card */}
                <div className={styles.taskCard}>
                  <span className={styles.categoryChip}>{partnerKannCategoryLabels[currentTask.category]}</span>
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
                    <button onClick={goToPickTask} className={styles.skipLink}>
                      Andere Aufgabe wählen
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

                    {timerConfig && (
                      <div className={styles.timerBox}>
                        <p className={styles.timerLabel}>
                          {timerConfig.mode === 'countdown' ? 'Countdown' : 'Stoppuhr'}
                        </p>
                        <p
                          className={
                            timerConfig.mode === 'countdown' && timerDone
                              ? styles.timerValueDone
                              : timerConfig.mode === 'countdown' && timerValue <= 10
                              ? styles.timerValueWarning
                              : styles.timerValue
                          }
                        >
                          {Math.floor(timerValue / 60)}:{String(timerValue % 60).padStart(2, '0')}
                        </p>
                        <div className={styles.timerControls}>
                          <button
                            onClick={() => setTimerRunning((r) => !r)}
                            disabled={timerConfig.mode === 'countdown' && timerDone}
                            className={styles.timerBtnPrimary}
                          >
                            {timerRunning ? '⏸ Pause' : '▶ Start'}
                          </button>
                          <button onClick={resetTimer} className={styles.timerBtn}>
                            ↺ Zurücksetzen
                          </button>
                        </div>
                      </div>
                    )}

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
                    <button onClick={goToPickTask} className={styles.primaryBtn}>
                      Nächste Aufgabe →
                    </button>
                  </div>
                )}
              </>
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
