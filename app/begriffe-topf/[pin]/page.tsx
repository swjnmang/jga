'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  subscribeToWordPotGame,
  joinWordPotGame,
  submitWordPotWord,
  startWordPotGame,
  startWordPotTurn,
  markWordPotCorrect,
  putBackWordPotWord,
  endWordPotTurn,
  continueAfterWordPotTurn,
  endWordPotGameEarly,
} from '@/lib/wordPotService';
import { WordPotGame, ROUND_LABELS, ROUND_DESCRIPTIONS } from '@/lib/wordPotTypes';
import { playBuzzerSound } from '@/lib/familienduellSounds';
import styles from '../begriffetopf.module.css';

const STORAGE_KEY = 'wordpot_session';

export default function BegriffeTopfGamePage() {
  const params = useParams();
  const pin = ((params?.pin as string) || '').toUpperCase();

  const [game, setGame] = useState<WordPotGame | null | undefined>(undefined);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  const [joinName, setJoinName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [newWordText, setNewWordText] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [tick, setTick] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { pin?: string; playerId?: string };
        if (saved.pin === pin && saved.playerId) setMyPlayerId(saved.playerId);
      }
    } catch {
      // Kein gespeicherter Spielstand: einfach mit dem Beitritts-Formular starten.
    }
  }, [pin]);

  useEffect(() => {
    if (!pin) return;
    const unsubscribe = subscribeToWordPotGame(pin, setGame);
    return unsubscribe;
  }, [pin]);

  useEffect(() => {
    if (typeof window === 'undefined' || !pin) return;
    const inviteUrl = `${window.location.origin}/begriffe-topf/${pin}`;
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(inviteUrl, { width: 220, margin: 1 }))
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [pin]);

  // Sekunden-Tick treibt die Timer-Anzeige und den Timeout-Watchdog an.
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Verhindert, dass derselbe Ablauf-Zeitpunkt mehrfach den Signalton auslöst
  // (der Watchdog läuft bei jedem Sekunden-Tick, bis der Server turnActive beendet).
  const signaledTurnEndRef = useRef<number | null>(null);

  useEffect(() => {
    if (!game || !game.turnActive || !game.turnEndsAt) return;
    if (Date.now() >= game.turnEndsAt) {
      if (signaledTurnEndRef.current !== game.turnEndsAt) {
        signaledTurnEndRef.current = game.turnEndsAt;
        playBuzzerSound();
      }
      endWordPotTurn(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.turnActive, game?.turnEndsAt, tick, pin]);

  const me = myPlayerId ? game?.players?.[myPlayerId] ?? null : null;
  const hasJoined = Boolean(me);

  const groupList = useMemo(() => {
    if (!game) return [];
    return game.groupOrder.map((id) => game.groups[id]);
  }, [game]);

  const groupMemberCounts = useMemo(() => {
    if (!game) return {};
    const counts: Record<string, number> = {};
    Object.values(game.players || {}).forEach((p) => {
      counts[p.groupId] = (counts[p.groupId] || 0) + 1;
    });
    return counts;
  }, [game]);

  const groupSubmittedCounts = useMemo(() => {
    if (!game) return {};
    const counts: Record<string, number> = {};
    Object.values(game.players || {}).forEach((p) => {
      counts[p.groupId] = (counts[p.groupId] || 0) + p.wordsSubmitted;
    });
    return counts;
  }, [game]);

  const allSubmitted = useMemo(() => {
    if (!game) return false;
    const players = Object.values(game.players || {});
    if (players.length === 0) return false;
    return players.every((p) => p.wordsSubmitted >= game.wordsPerPlayer);
  }, [game]);

  const myWords = useMemo(() => {
    if (!game || !myPlayerId) return [];
    return Object.values(game.words || {}).filter((w) => w.playerId === myPlayerId);
  }, [game, myPlayerId]);

  const activeGroupId = game ? game.groupOrder[game.currentGroupIndex] : null;
  const activeGroup = activeGroupId && game ? game.groups[activeGroupId] : null;
  const isMyGroupActive = Boolean(me && activeGroupId && me.groupId === activeGroupId);
  const isExplainer = Boolean(game && myPlayerId && game.explainerPlayerId === myPlayerId);
  const isHost = Boolean(game && myPlayerId && game.hostPlayerId === myPlayerId);
  const currentWord = game?.currentWordId ? game.words[game.currentWordId] : null;

  const timeLeft = game?.turnEndsAt ? Math.max(0, Math.round((game.turnEndsAt - Date.now()) / 1000)) : 0;

  const ranking = useMemo(() => {
    if (!game) return [];
    return [...groupList].sort((a, b) => b.score - a.score);
  }, [game, groupList]);
  const topScore = ranking[0]?.score ?? 0;

  async function handleJoin() {
    if (!joinName.trim()) {
      setJoinError('Bitte gib deinen Namen ein.');
      return;
    }
    if (!joinGroupId) {
      setJoinError('Bitte wähle eine Gruppe.');
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const { playerId } = await joinWordPotGame({ pin, playerName: joinName, groupId: joinGroupId });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ pin, playerId }));
      setMyPlayerId(playerId);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : 'Beitritt fehlgeschlagen.');
    } finally {
      setJoining(false);
    }
  }

  async function handleSubmitWord() {
    if (!myPlayerId || !me) return;
    const text = newWordText.trim();
    if (!text) return;
    setNewWordText('');
    await submitWordPotWord(pin, myPlayerId, me.groupId, text);
  }

  if (game === undefined) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.spinner}>Lädt …</p>
        </div>
      </main>
    );
  }

  if (game === null) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.headBlock}>
            <Link href="/begriffe-topf" className={styles.back}>
              ← Zurück
            </Link>
            <h1 className={styles.title}>🫙 Begriffe-Topf</h1>
          </div>
          <p className={styles.intro}>Kein Spiel mit dem PIN „{pin}&ldquo; gefunden.</p>
          <Link href="/begriffe-topf" className={styles.secondaryBtn}>
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/begriffe-topf" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>🫙 Begriffe-Topf</h1>
        </div>

        {!hasJoined && game.phase !== 'lobby' && (
          <p className={styles.intro}>Das Spiel läuft bereits – ein Beitritt ist jetzt nicht mehr möglich.</p>
        )}

        {!hasJoined && game.phase === 'lobby' && (
          <>
            <p className={styles.intro}>Gib deinen Namen ein und wähle deine Gruppe, um beizutreten.</p>
            <div className={styles.section}>
              <p className={styles.label}>Dein Name</p>
              <input
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="z.B. Ben"
                className={styles.field}
              />
            </div>
            <div className={styles.section}>
              <p className={styles.label}>Deine Gruppe</p>
              <div className={styles.groupList}>
                {groupList.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setJoinGroupId(g.id)}
                    className={joinGroupId === g.id ? styles.groupOptionActive : styles.groupOption}
                  >
                    <span className={styles.groupOptionName}>{g.name}</span>
                    <span className={styles.groupOptionMeta}>{groupMemberCounts[g.id] || 0} Mitspieler</span>
                  </button>
                ))}
              </div>
            </div>
            {joinError && <p className={styles.errorText}>{joinError}</p>}
            <button onClick={handleJoin} disabled={joining} className={styles.primaryBtn}>
              {joining ? 'Trete bei …' : 'Beitreten →'}
            </button>
          </>
        )}

        {hasJoined && game.phase === 'lobby' && (
          <div className={styles.gameArea}>
            <div className={styles.pinBlock}>
              <span className={styles.pinLabel}>PIN zum Beitreten</span>
              <span className={styles.pinValue}>{pin}</span>
              {qrDataUrl && <img src={qrDataUrl} alt="QR-Code zum Beitreten" className={styles.qrImg} />}
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Fortschritt</p>
              <div className={styles.groupProgressList}>
                {groupList.map((g) => {
                  const submitted = groupSubmittedCounts[g.id] || 0;
                  const target = (groupMemberCounts[g.id] || 0) * game.wordsPerPlayer;
                  const done = target > 0 && submitted >= target;
                  return (
                    <div key={g.id} className={done ? styles.groupProgressRowDone : styles.groupProgressRow}>
                      <span>{g.name}</span>
                      <span className={styles.groupProgressCount}>
                        {submitted}/{target} {done ? '✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>
                Deine Begriffe ({me!.wordsSubmitted}/{game.wordsPerPlayer})
              </p>
              {me!.wordsSubmitted < game.wordsPerPlayer && (
                <div className={styles.submitRow}>
                  <input
                    value={newWordText}
                    onChange={(e) => setNewWordText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitWord()}
                    placeholder="Begriff eingeben …"
                    className={styles.field}
                  />
                  <button onClick={handleSubmitWord} disabled={!newWordText.trim()} className={styles.submitBtn}>
                    +
                  </button>
                </div>
              )}
              {myWords.length > 0 && (
                <div className={styles.myWordsList}>
                  {myWords.map((w, i) => (
                    <div key={w.id} className={styles.myWordRow}>
                      <span>
                        <span className={styles.myWordIndex}>{i + 1}.</span>
                        {w.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isHost && (
              <button onClick={() => startWordPotGame(pin)} disabled={!allSubmitted} className={styles.primaryBtn}>
                {allSubmitted ? 'Spiel starten →' : 'Warte auf alle Begriffe …'}
              </button>
            )}
            {!isHost && (
              <p className={styles.hint}>
                {allSubmitted
                  ? 'Alle Begriffe sind eingereicht – der Spielleiter kann jetzt starten.'
                  : 'Sobald alle ihre Begriffe eingereicht haben, kann der Spielleiter starten.'}
              </p>
            )}
          </div>
        )}

        {hasJoined && game.phase === 'playing' && (
          <div className={styles.gameArea}>
            <div className={styles.roundBanner}>
              <span className={styles.roundBadge}>
                Runde {game.round}/3 · {ROUND_LABELS[game.round]}
              </span>
            </div>
            <p className={styles.roundDesc}>{ROUND_DESCRIPTIONS[game.round]}</p>

            <div className={styles.scoreRow}>
              {groupList.map((g) => (
                <div key={g.id} className={g.id === activeGroupId ? styles.scorePillActive : styles.scorePill}>
                  <span>{g.name}</span>
                  <span className={styles.scoreNum}>{g.score}</span>
                </div>
              ))}
            </div>

            {game.turnJustEnded && (
              <div className={game.roundComplete ? styles.turnEndBoxRound : styles.turnEndBox}>
                <p className={styles.turnEndTitle}>
                  {game.roundComplete
                    ? `Runde ${game.round} komplett! 🎉`
                    : 'Zeit abgelaufen! ⏱️'}
                </p>
                <p className={styles.turnEndSub}>
                  {game.turnScore} Begriff{game.turnScore === 1 ? '' : 'e'} für {activeGroup?.name} in diesem Zug.
                  {game.roundComplete
                    ? game.round < 3
                      ? ` Weiter geht's mit Runde ${game.round + 1}: ${ROUND_LABELS[(game.round + 1) as 1 | 2 | 3]}.`
                      : ' Das war die letzte Runde!'
                    : ''}
                </p>
                <button onClick={() => continueAfterWordPotTurn(pin)} className={styles.primaryBtn}>
                  {game.roundComplete
                    ? game.round < 3
                      ? `Weiter zu Runde ${game.round + 1} →`
                      : 'Endstand anzeigen →'
                    : `Weiter zu ${activeGroup?.name} →`}
                </button>
              </div>
            )}

            {!game.turnJustEnded && !game.turnActive && (
              <div className={styles.startTurnBox}>
                <p className={styles.startTurnTitle}>{activeGroup?.name} ist dran</p>
                {isMyGroupActive ? (
                  <>
                    <p className={styles.startTurnDesc}>
                      Wer erklärt, tippt jetzt auf Los – {game.roundSeconds} Sekunden Zeit.
                    </p>
                    <button onClick={() => myPlayerId && startWordPotTurn(pin, myPlayerId)} className={styles.primaryBtn}>
                      ▶ Los, ich erkläre
                    </button>
                  </>
                ) : (
                  <p className={styles.startTurnDesc}>Gleich geht's los, sobald {activeGroup?.name} bereit ist.</p>
                )}
              </div>
            )}

            {!game.turnJustEnded && game.turnActive && (
              <>
                <p className={timeLeft <= 10 ? styles.timerWarning : styles.timer}>{timeLeft}</p>
                {isExplainer ? (
                  <>
                    <div className={styles.wordCard}>
                      <p className={styles.wordText}>{currentWord?.text}</p>
                    </div>
                    <div className={styles.actionGrid}>
                      <button onClick={() => markWordPotCorrect(pin)} className={styles.correctBtn}>
                        ✓ Erraten
                      </button>
                      <button onClick={() => putBackWordPotWord(pin)} className={styles.backBtn}>
                        ↩ Zurücklegen
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.waitBox}>
                    <p className={styles.waitTitle}>
                      {isMyGroupActive ? 'Euer Team erklärt gerade' : `${activeGroup?.name} erklärt gerade`}
                    </p>
                    <p className={styles.waitDesc}>
                      {isMyGroupActive
                        ? 'Ratet los! Sobald jemand aus eurer Gruppe den Begriff auf dem eigenen Handy sieht, erklärt er/sie ihn euch.'
                        : 'Wartet, bis eure Gruppe an der Reihe ist.'}
                    </p>
                  </div>
                )}
              </>
            )}

            {isHost && (
              <div className={styles.footerRow}>
                {!confirmEnd ? (
                  <button onClick={() => setConfirmEnd(true)} className={styles.endLink}>
                    Spiel beenden
                  </button>
                ) : (
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmText}>Spiel wirklich beenden?</span>
                    <button
                      onClick={() => myPlayerId && endWordPotGameEarly(pin, myPlayerId)}
                      className={styles.confirmYes}
                    >
                      Ja, beenden
                    </button>
                    <button onClick={() => setConfirmEnd(false)} className={styles.confirmNo}>
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {game.phase === 'finished' && (
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
              <Link href="/begriffe-topf" className={styles.primaryBtn}>
                Neues Spiel
              </Link>
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
