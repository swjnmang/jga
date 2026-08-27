'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  familienduellQuestions,
  type FamilienduellQuestion,
} from '@/lib/familienduellQuestions';

const MAX_STRIKES = 3;
const MIN_GROUPS = 2;
const MAX_GROUPS = 6;
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
  ]);

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
    setPhase('playing');
  }

  function toggleAnswer(index: number) {
    if (!currentQuestion || phase !== 'playing') return;
    const points = currentQuestion.answers[index].points;

    if (revealed[index]) {
      // Versehentlich abgehakte Antwort per erneutem Klick rückgängig machen.
      setRevealed((prev) => prev.map((r, i) => (i === index ? false : r)));
      setRoundPoints((prev) => prev - points);
      setGroups((prev) =>
        prev.map((g, i) => (i === currentGroupIndex ? { ...g, score: g.score - points } : g))
      );
      return;
    }

    setRevealed((prev) => prev.map((r, i) => (i === index ? true : r)));
    setRoundPoints((prev) => prev + points);
    setGroups((prev) =>
      prev.map((g, i) => (i === currentGroupIndex ? { ...g, score: g.score + points } : g))
    );

    const nextRevealedCount = revealed.filter(Boolean).length + 1;
    if (nextRevealedCount >= currentQuestion.answers.length) {
      setPhase('roundEnd');
    }
  }

  function registerStrike() {
    if (phase !== 'playing') return;
    const next = strikes + 1;
    setStrikes(next);
    if (next >= MAX_STRIKES) {
      setStealGroupIndex((currentGroupIndex + 1) % groups.length);
      setPhase('steal');
    }
  }

  function stealAnswer(index: number) {
    if (!currentQuestion || revealed[index] || phase !== 'steal' || stealGroupIndex === null) return;
    const points = currentQuestion.answers[index].points;

    setRevealed((prev) => prev.map((r, i) => (i === index ? true : r)));
    setGroups((prev) =>
      prev.map((g, i) => (i === stealGroupIndex ? { ...g, score: g.score + points } : g))
    );
    setStealPoints(points);
    setStealResult('success');
    setPhase('roundEnd');
  }

  function stealMiss() {
    if (phase !== 'steal') return;
    setStealResult('fail');
    setPhase('roundEnd');
  }

  function nextRound() {
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
    setPhase('playing');
  }

  function skipQuestion() {
    const [question, restQueue] = drawQuestion(questionQueue);
    setQuestionQueue(restQueue);
    setCurrentQuestion(question);
    setRevealed(new Array(question.answers.length).fill(false));
    setStrikes(0);
    setRoundPoints(0);
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
  }

  const ranking = useMemo(() => [...groups].sort((a, b) => b.score - a.score), [groups]);
  const topScore = ranking[0]?.score ?? 0;

  return (
    <main className="min-h-screen bg-grid flex items-start justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-2xl rounded-3xl bg-glass border border-ink/10 shadow-2xl backdrop-blur-xl p-6 sm:p-10 space-y-8">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80 transition mb-2"
          >
            ← Zurück
          </Link>
          <h1 className="text-3xl font-display font-semibold text-ink">🎉 Familienduell</h1>
        </div>

        {phase === 'setup' && (
          <div className="space-y-8">
            <p className="text-sm text-ink/70 leading-relaxed">
              Ein Spielleiter liest die Frage vor ("Wir haben 100 Leute befragt…") und sieht dabei
              direkt die Top-5-Antworten. Wird eine Antwort von der Gruppe genannt, hakt der
              Spielleiter sie per Klick ab. Nach 3 falschen Antworten kommt die nächste Gruppe mit
              einer neuen Frage dran.
            </p>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">Anzahl Gruppen</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateGroupCount(groupCount - 1)}
                  disabled={groupCount <= MIN_GROUPS}
                  className="h-11 w-11 rounded-xl border border-ink/20 text-ink text-xl font-semibold disabled:opacity-30 hover:border-ink/40 transition"
                >
                  −
                </button>
                <span className="text-2xl font-display font-semibold text-ink w-8 text-center">
                  {groupCount}
                </span>
                <button
                  onClick={() => updateGroupCount(groupCount + 1)}
                  disabled={groupCount >= MAX_GROUPS}
                  className="h-11 w-11 rounded-xl border border-ink/20 text-ink text-xl font-semibold disabled:opacity-30 hover:border-ink/40 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">Gruppennamen</p>
              <div className="space-y-2">
                {groupNames.map((name, i) => (
                  <input
                    key={i}
                    value={name}
                    onChange={(e) => updateGroupName(i, e.target.value)}
                    placeholder={`Gruppe ${i + 1}`}
                    className="w-full rounded-xl border border-ink/20 bg-ink/5 px-4 py-3 text-ink placeholder:text-ink/40 focus:outline-none focus:border-ink/50 transition"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">Spielende</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPointLimitEnabled(true)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border transition ${
                    pointLimitEnabled
                      ? 'bg-ink text-inkDark border-ink'
                      : 'border-ink/20 text-ink/70 hover:border-ink/40'
                  }`}
                >
                  Mit Punktelimit
                </button>
                <button
                  onClick={() => setPointLimitEnabled(false)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border transition ${
                    !pointLimitEnabled
                      ? 'bg-ink text-inkDark border-ink'
                      : 'border-ink/20 text-ink/70 hover:border-ink/40'
                  }`}
                >
                  Ohne Punktelimit
                </button>
              </div>
              {pointLimitEnabled ? (
                <div className="space-y-1.5">
                  <input
                    type="number"
                    min={1}
                    value={pointLimit}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      setPointLimit(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
                    }}
                    className="w-full rounded-xl border border-ink/20 bg-ink/5 px-4 py-3 text-ink focus:outline-none focus:border-ink/50 transition"
                  />
                  <p className="text-xs text-ink/50">
                    Die Gruppe mit den meisten Punkten gewinnt, sobald das Limit erreicht ist –
                    aber erst, wenn jede Gruppe gleich oft dran war.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-ink/50">
                  Das Spiel läuft, bis der Spielleiter es manuell beendet.
                </p>
              )}
            </div>

            <button
              onClick={startGame}
              disabled={pointLimitEnabled && (!pointLimit || pointLimit <= 0)}
              className="w-full inline-flex items-center justify-center rounded-xl btn-primary text-inkDark font-semibold px-5 py-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-black/20 disabled:opacity-40"
            >
              Spiel starten →
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'steal' || phase === 'roundEnd') && currentQuestion && (
          <div className="space-y-6">
            {/* Scoreboard */}
            <div className="flex flex-wrap gap-2">
              {groups.map((g, i) => (
                <div
                  key={g.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm transition ${
                    i === (phase === 'steal' ? stealGroupIndex : currentGroupIndex)
                      ? 'bg-ink text-inkDark border-ink font-semibold'
                      : 'border-ink/15 text-ink/70'
                  }`}
                >
                  <span>{g.name}</span>
                  <span className="opacity-70">
                    {g.score}
                    {pointLimitEnabled ? ` / ${pointLimit}` : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Question card */}
            <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 space-y-1">
              <p className="text-xs uppercase tracking-widest text-ink/50">
                Wir haben 100 Leute befragt:
              </p>
              <p className="text-lg font-display font-semibold text-ink">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer board */}
            <div className="space-y-2">
              {currentQuestion.answers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => (phase === 'steal' ? stealAnswer(i) : toggleAnswer(i))}
                  disabled={phase === 'steal' ? revealed[i] : phase !== 'playing'}
                  className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition ${
                    revealed[i]
                      ? 'bg-ink/10 border-ink/20'
                      : 'border-ink/15 hover:border-ink/35 hover:bg-ink/5 disabled:hover:bg-transparent'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 h-7 w-7 rounded-full border grid place-items-center text-xs font-semibold transition ${
                      revealed[i]
                        ? 'bg-mint/80 border-mint text-inkDark'
                        : 'bg-ink/10 border-ink/20 text-ink'
                    }`}
                  >
                    {revealed[i] ? '✓' : i + 1}
                  </span>
                  <span
                    className={`flex-1 transition ${
                      revealed[i] ? 'font-semibold text-ink' : 'text-ink/70'
                    }`}
                  >
                    {answer.text}
                  </span>
                  <span
                    className={`font-display font-bold transition ${
                      revealed[i] ? 'text-ink' : 'text-ink/40'
                    }`}
                  >
                    {answer.points}
                  </span>
                </button>
              ))}
            </div>

            {/* Strikes + controls */}
            {phase === 'playing' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-9 w-9 rounded-lg grid place-items-center text-lg font-bold border ${
                          i < strikes
                            ? 'bg-coral/80 border-coral text-inkDark'
                            : 'border-ink/15 text-ink/20'
                        }`}
                      >
                        ✕
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={skipQuestion}
                    className="text-xs text-ink/40 hover:text-ink/70 transition underline underline-offset-2"
                  >
                    Frage überspringen
                  </button>
                </div>
                <button
                  onClick={registerStrike}
                  className="w-full inline-flex items-center justify-center rounded-xl border border-coral/50 text-coral font-semibold px-5 py-3.5 hover:bg-coral/10 transition"
                >
                  ✕ Falsche Antwort
                </button>
              </div>
            )}

            {phase === 'steal' && stealGroup && (
              <div className="space-y-4 rounded-2xl bg-sand/10 border border-sand/30 p-5">
                <p className="text-ink font-semibold">
                  🕵️ Diebstahl-Chance für {stealGroup.name}!
                </p>
                <p className="text-sm text-ink/60">
                  {currentGroup.name} hat nicht alle Antworten gefunden. {stealGroup.name} darf
                  einen der übrigen Begriffe erraten – ein Treffer sichert die Punkte.
                </p>
                <button
                  onClick={stealMiss}
                  className="w-full inline-flex items-center justify-center rounded-xl border border-ink/20 text-ink/70 font-semibold px-5 py-3.5 hover:border-ink/40 transition"
                >
                  Kein Treffer – weiter
                </button>
              </div>
            )}

            {phase === 'roundEnd' && (
              <div className="space-y-4 rounded-2xl bg-ink/5 border border-ink/10 p-5">
                {stealGroup ? (
                  <>
                    <p className="text-ink font-semibold">
                      {stealResult === 'success'
                        ? `${stealGroup.name} hat den Diebstahl geschafft! 🎉`
                        : `${stealGroup.name} konnte nicht stehlen.`}
                    </p>
                    <p className="text-sm text-ink/60">
                      {roundPoints} Punkte für {currentGroup.name}
                      {stealResult === 'success'
                        ? ` · ${stealPoints} Punkte für ${stealGroup.name} (Diebstahl)`
                        : ''}
                      {' '}in dieser Runde.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-ink font-semibold">
                      {boardCleared
                        ? `${currentGroup.name} hat alle Antworten gefunden! 🎉`
                        : `3 falsche Antworten – Runde vorbei.`}
                    </p>
                    <p className="text-sm text-ink/60">
                      {roundPoints} Punkte für {currentGroup.name} in dieser Runde.
                    </p>
                  </>
                )}
                {gameOverPending ? (
                  <button
                    onClick={endGame}
                    className="w-full inline-flex items-center justify-center rounded-xl btn-primary text-inkDark font-semibold px-5 py-3.5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                  >
                    🏆 Punktelimit erreicht – Endstand anzeigen
                  </button>
                ) : (
                  <button
                    onClick={nextRound}
                    className="w-full inline-flex items-center justify-center rounded-xl btn-primary text-inkDark font-semibold px-5 py-3.5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                  >
                    Weiter zu {groups[nextGroupIndex].name} →
                  </button>
                )}
              </div>
            )}

            {/* End game */}
            <div className="pt-2 border-t border-ink/10">
              {!confirmEnd ? (
                <button
                  onClick={() => setConfirmEnd(true)}
                  className="text-xs text-ink/40 hover:text-ink/70 transition"
                >
                  Spiel beenden
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink/60">Spiel wirklich beenden?</span>
                  <button
                    onClick={endGame}
                    className="text-xs font-semibold text-coral hover:underline"
                  >
                    Ja, beenden
                  </button>
                  <button
                    onClick={() => setConfirmEnd(false)}
                    className="text-xs text-ink/40 hover:text-ink/70"
                  >
                    Abbrechen
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'finished' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-semibold text-ink">🏆 Endstand</h2>
            <div className="space-y-2">
              {ranking.map((g, i) => (
                <div
                  key={g.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 border ${
                    g.score === topScore
                      ? 'bg-ink text-inkDark border-ink font-semibold'
                      : 'border-ink/15 text-ink/80'
                  }`}
                >
                  <span>
                    {i === 0 && g.score === topScore ? '🥇 ' : `${i + 1}. `}
                    {g.name}
                  </span>
                  <span className="font-display font-bold">{g.score}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={resetToSetup}
                className="inline-flex items-center justify-center rounded-xl btn-primary text-inkDark font-semibold px-5 py-3.5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
              >
                Neues Spiel
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-ink/30 text-ink font-semibold px-5 py-3.5 hover:border-ink/60 transition"
              >
                Zur Startseite
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
