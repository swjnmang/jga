'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToCodenamesGame,
  joinCodenamesGame,
  startCodenamesGame,
  giveCodenamesClue,
  revealCodenamesCard,
  passCodenamesTurn,
  endCodenamesGameEarly,
} from '@/lib/codenamesService';
import { CodenamesGame, CodenamesTeam, CodenamesRole, CODENAMES_LOCAL_STORAGE_KEY } from '@/lib/codenamesTypes';
import styles from '../codenames.module.css';

const STORAGE_KEY = CODENAMES_LOCAL_STORAGE_KEY;

const TEAM_LABEL: Record<CodenamesTeam, string> = { red: 'Rot', blue: 'Blau' };

export default function CodenamesGamePage() {
  const params = useParams();
  const pin = ((params?.pin as string) || '').toUpperCase();

  const [game, setGame] = useState<CodenamesGame | null | undefined>(undefined);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  const [joinName, setJoinName] = useState('');
  const [joinTeam, setJoinTeam] = useState<CodenamesTeam>('red');
  const [joinRole, setJoinRole] = useState<CodenamesRole>('operative');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [clueWordInput, setClueWordInput] = useState('');
  const [clueNumberInput, setClueNumberInput] = useState(1);
  const [clueSending, setClueSending] = useState(false);

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
    const unsubscribe = subscribeToCodenamesGame(pin, setGame);
    return unsubscribe;
  }, [pin]);

  useEffect(() => {
    if (typeof window === 'undefined' || !pin) return;
    const inviteUrl = `${window.location.origin}/codenames/${pin}`;
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(inviteUrl, { width: 220, margin: 1 }))
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [pin]);

  async function shareInviteLink() {
    const inviteUrl = `${window.location.origin}/codenames/${pin}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Wortagenten – Einladung', text: `Tritt unserer Wortagenten-Runde bei! PIN: ${pin}`, url: inviteUrl });
      } catch {
        // Nutzer hat den Teilen-Dialog abgebrochen.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Zwischenablage nicht verfügbar - Link bleibt über die QR-Anzeige verfügbar.
    }
  }

  const me = myPlayerId ? game?.players?.[myPlayerId] ?? null : null;
  const hasJoined = Boolean(me);
  const isHost = Boolean(game && myPlayerId && game.hostPlayerId === myPlayerId);

  const redPlayers = useMemo(
    () => Object.values(game?.players || {}).filter((p) => p.team === 'red').sort((a, b) => a.joinedAt - b.joinedAt),
    [game]
  );
  const bluePlayers = useMemo(
    () => Object.values(game?.players || {}).filter((p) => p.team === 'blue').sort((a, b) => a.joinedAt - b.joinedAt),
    [game]
  );
  const redHasSpymaster = redPlayers.some((p) => p.role === 'spymaster');
  const blueHasSpymaster = bluePlayers.some((p) => p.role === 'spymaster');

  const canStart = useMemo(() => {
    if (!game) return false;
    const redOk = redPlayers.some((p) => p.role === 'spymaster') && redPlayers.some((p) => p.role === 'operative');
    const blueOk = bluePlayers.some((p) => p.role === 'spymaster') && bluePlayers.some((p) => p.role === 'operative');
    return redOk && blueOk;
  }, [game, redPlayers, bluePlayers]);

  const isSpymaster = me?.role === 'spymaster';
  const isMyTeamActive = Boolean(game && me && me.team === game.currentTeam);
  const canGiveClue = Boolean(game && isSpymaster && isMyTeamActive && game.phase === 'playing' && !game.clueWord);
  const canGuess = Boolean(game && me?.role === 'operative' && isMyTeamActive && game.phase === 'playing' && game.clueWord);
  const canPass = canGuess;

  async function handleJoin() {
    if (!joinName.trim()) {
      setJoinError('Bitte gib deinen Namen ein.');
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const { playerId } = await joinCodenamesGame({ pin, playerName: joinName, team: joinTeam, role: joinRole });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ pin, playerId }));
      setMyPlayerId(playerId);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : 'Beitritt fehlgeschlagen.');
    } finally {
      setJoining(false);
    }
  }

  async function handleStart() {
    if (!myPlayerId) return;
    setStarting(true);
    setStartError(null);
    try {
      await startCodenamesGame(pin, myPlayerId);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Spiel konnte nicht gestartet werden.');
    } finally {
      setStarting(false);
    }
  }

  async function handleGiveClue() {
    if (!myPlayerId || !clueWordInput.trim() || clueSending) return;
    setClueSending(true);
    try {
      await giveCodenamesClue(pin, myPlayerId, clueWordInput, clueNumberInput);
      setClueWordInput('');
      setClueNumberInput(1);
    } finally {
      setClueSending(false);
    }
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
            <Link href="/codenames" className={styles.back}>
              ← Zurück
            </Link>
            <h1 className={styles.title}>🕵️ Wortagenten</h1>
          </div>
          <p className={styles.intro}>Kein Spiel mit dem PIN „{pin}“ gefunden.</p>
          <Link href="/codenames" className={styles.secondaryBtn}>
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const panelClass = game.phase === 'playing' || game.phase === 'finished' ? styles.boardPanel : styles.panel;

  return (
    <main className={styles.page}>
      <div className={panelClass}>
        <div className={styles.headBlock}>
          <Link href="/codenames" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>🕵️ Wortagenten</h1>
        </div>

        {!hasJoined && game.phase !== 'lobby' && (
          <p className={styles.intro}>Das Spiel läuft bereits – ein Beitritt ist jetzt nicht mehr möglich.</p>
        )}

        {!hasJoined && game.phase === 'lobby' && (
          <>
            <p className={styles.intro}>Gib deinen Namen ein, wähle dein Team und deine Rolle, um beizutreten.</p>
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
              <p className={styles.label}>Dein Team</p>
              <div className={styles.teamGrid}>
                <button
                  onClick={() => setJoinTeam('red')}
                  className={joinTeam === 'red' ? styles.teamOptionRedActive : styles.teamOptionRed}
                >
                  🔴 Rot ({redPlayers.length})
                </button>
                <button
                  onClick={() => setJoinTeam('blue')}
                  className={joinTeam === 'blue' ? styles.teamOptionBlueActive : styles.teamOptionBlue}
                >
                  🔵 Blau ({bluePlayers.length})
                </button>
              </div>
            </div>
            <div className={styles.section}>
              <p className={styles.label}>Deine Rolle</p>
              <div className={styles.roleList}>
                <button
                  onClick={() => setJoinRole('spymaster')}
                  disabled={joinTeam === 'red' ? redHasSpymaster : blueHasSpymaster}
                  className={joinRole === 'spymaster' ? styles.roleOptionActive : styles.roleOption}
                >
                  <span className={styles.roleOptionName}>🕵️ Geheimdienstchef</span>
                  <span className={styles.roleOptionDesc}>
                    {(joinTeam === 'red' ? redHasSpymaster : blueHasSpymaster)
                      ? 'Bereits vergeben in diesem Team.'
                      : 'Sieht alle Farben, gibt Hinweise (Wort + Zahl).'}
                  </span>
                </button>
                <button
                  onClick={() => setJoinRole('operative')}
                  className={joinRole === 'operative' ? styles.roleOptionActive : styles.roleOption}
                >
                  <span className={styles.roleOptionName}>🔎 Ermittler</span>
                  <span className={styles.roleOptionDesc}>Tippt anhand der Hinweise die richtigen Begriffe an.</span>
                </button>
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
              <button onClick={shareInviteLink} className={styles.secondaryBtn}>
                {linkCopied ? '✓ Link kopiert' : '🔗 Einladungslink teilen'}
              </button>
            </div>

            <div className={styles.rosterGrid}>
              <div className={styles.rosterCol}>
                <span className={styles.rosterHeadRed}>🔴 Rot ({redPlayers.length})</span>
                {redPlayers.length === 0 && <p className={styles.rosterEmpty}>Noch niemand</p>}
                {redPlayers.map((p) => (
                  <div key={p.id} className={styles.rosterPlayer}>
                    <span className={styles.rosterPlayerName}>{p.name}</span>
                    <span className={styles.rosterPlayerRole}>{p.role === 'spymaster' ? 'Chef' : 'Ermittler'}</span>
                  </div>
                ))}
              </div>
              <div className={styles.rosterCol}>
                <span className={styles.rosterHeadBlue}>🔵 Blau ({bluePlayers.length})</span>
                {bluePlayers.length === 0 && <p className={styles.rosterEmpty}>Noch niemand</p>}
                {bluePlayers.map((p) => (
                  <div key={p.id} className={styles.rosterPlayer}>
                    <span className={styles.rosterPlayerName}>{p.name}</span>
                    <span className={styles.rosterPlayerRole}>{p.role === 'spymaster' ? 'Chef' : 'Ermittler'}</span>
                  </div>
                ))}
              </div>
            </div>

            {!canStart && (
              <p className={styles.hint}>
                Jedes Team braucht mindestens einen Geheimdienstchef und einen Ermittler, bevor gestartet werden kann.
              </p>
            )}
            {startError && <p className={styles.errorText}>{startError}</p>}

            {isHost ? (
              <button onClick={handleStart} disabled={!canStart || starting} className={styles.primaryBtn}>
                {starting ? 'Starte …' : 'Spiel starten →'}
              </button>
            ) : (
              <p className={styles.hint}>Sobald beide Teams bereit sind, kann der Spielleiter starten.</p>
            )}
          </div>
        )}

        {hasJoined && game.phase === 'playing' && (
          <div className={styles.gameArea}>
            <span className={styles.roleBadge}>
              {TEAM_LABEL[me!.team]} · {me!.role === 'spymaster' ? 'Geheimdienstchef' : 'Ermittler'}
            </span>

            <div className={styles.scoreRow}>
              <div className={game.currentTeam === 'red' ? styles.scorePillRedActive : styles.scorePillRed}>
                <span>🔴</span>
                <span className={styles.scoreNum}>{game.redRemaining}</span>
              </div>
              <div className={game.currentTeam === 'blue' ? styles.scorePillBlueActive : styles.scorePillBlue}>
                <span>🔵</span>
                <span className={styles.scoreNum}>{game.blueRemaining}</span>
              </div>
            </div>

            <div className={game.currentTeam === 'red' ? styles.turnBannerRed : styles.turnBannerBlue}>
              <p className={styles.turnBannerTitle}>{TEAM_LABEL[game.currentTeam]} ist dran</p>
              <p className={styles.turnBannerSub}>
                {game.clueWord
                  ? isMyTeamActive
                    ? 'Tippt die passenden Begriffe an oder passt.'
                    : `${TEAM_LABEL[game.currentTeam]} rät gerade.`
                  : isMyTeamActive
                    ? isSpymaster
                      ? 'Gib jetzt euren Hinweis.'
                      : 'Euer Geheimdienstchef überlegt sich einen Hinweis.'
                    : `${TEAM_LABEL[game.currentTeam]}s Geheimdienstchef überlegt sich einen Hinweis.`}
              </p>
            </div>

            {game.clueWord && (
              <div className={styles.clueBox}>
                <p className={styles.clueWord}>{game.clueWord}</p>
                <p className={styles.clueNumber}>Zahl: {game.clueNumber}</p>
                <p className={styles.clueGuesses}>
                  {game.guessesMade}/{game.guessesAllowed} Tipps benutzt
                </p>
              </div>
            )}

            {canGiveClue && (
              <div className={styles.clueForm}>
                <div className={styles.clueInputRow}>
                  <input
                    value={clueWordInput}
                    onChange={(e) => setClueWordInput(e.target.value)}
                    placeholder="Euer Hinweiswort …"
                    className={styles.field}
                  />
                </div>
                <div className={styles.numberStepper}>
                  <button
                    onClick={() => setClueNumberInput((n) => Math.max(0, n - 1))}
                    disabled={clueNumberInput <= 0}
                    className={styles.numberBtn}
                  >
                    −
                  </button>
                  <span className={styles.numberVal}>{clueNumberInput}</span>
                  <button
                    onClick={() => setClueNumberInput((n) => Math.min(9, n + 1))}
                    disabled={clueNumberInput >= 9}
                    className={styles.numberBtn}
                  >
                    +
                  </button>
                </div>
                <p className={styles.numberHint}>0 = unbegrenzt viele Tipps für diesen Hinweis.</p>
                <button onClick={handleGiveClue} disabled={!clueWordInput.trim() || clueSending} className={styles.primaryBtn}>
                  Hinweis geben →
                </button>
              </div>
            )}

            <div className={styles.board}>
              {game.cards.map((card) => {
                const revealed = card.revealed;
                let cls = styles.cardHidden;
                if (revealed) {
                  cls =
                    card.type === 'red'
                      ? styles.cardRevealedRed
                      : card.type === 'blue'
                        ? styles.cardRevealedBlue
                        : card.type === 'assassin'
                          ? styles.cardRevealedAssassin
                          : styles.cardRevealedNeutral;
                } else if (isSpymaster) {
                  cls =
                    card.type === 'red'
                      ? styles.cardHintRed
                      : card.type === 'blue'
                        ? styles.cardHintBlue
                        : card.type === 'assassin'
                          ? styles.cardHintAssassin
                          : styles.cardHintNeutral;
                }
                return (
                  <button
                    key={card.id}
                    onClick={() => myPlayerId && revealCodenamesCard(pin, myPlayerId, card.id)}
                    disabled={!canGuess || revealed}
                    className={cls}
                  >
                    {card.word}
                  </button>
                );
              })}
            </div>

            {isSpymaster && (
              <div className={styles.legend}>
                <span className={styles.legendItem}><span className={styles.legendDotRed} /> Rot</span>
                <span className={styles.legendItem}><span className={styles.legendDotBlue} /> Blau</span>
                <span className={styles.legendItem}><span className={styles.legendDotNeutral} /> Neutral</span>
                <span className={styles.legendItem}><span className={styles.legendDotAssassin} /> Attentäter</span>
              </div>
            )}

            {canPass && (
              <div className={styles.actionRow}>
                <button onClick={() => myPlayerId && passCodenamesTurn(pin, myPlayerId)} className={styles.passBtn}>
                  Zug beenden
                </button>
              </div>
            )}

            {game.log?.length > 0 && (
              <div className={styles.log}>
                {[...game.log].reverse().slice(0, 8).map((entry) => (
                  <p key={entry.id} className={styles.logEntry}>{entry.text}</p>
                ))}
              </div>
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
                      onClick={() => myPlayerId && endCodenamesGameEarly(pin, myPlayerId)}
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
          <div className={styles.gameArea}>
            {game.winner ? (
              <div className={game.winner === 'red' ? styles.winnerBannerRed : styles.winnerBannerBlue}>
                <p className={styles.winnerTitle}>{TEAM_LABEL[game.winner]} gewinnt! 🏆</p>
                <p className={styles.winnerSub}>
                  {game.winReason === 'assassin' ? 'Das andere Team hat den Attentäter aufgedeckt.' : 'Alle eigenen Begriffe gefunden.'}
                </p>
              </div>
            ) : (
              <h2 className={styles.finishedTitle}>Spiel beendet</h2>
            )}

            <div className={styles.board}>
              {game.cards.map((card) => {
                const cls =
                  card.type === 'red'
                    ? styles.cardRevealedRed
                    : card.type === 'blue'
                      ? styles.cardRevealedBlue
                      : card.type === 'assassin'
                        ? styles.cardRevealedAssassin
                        : styles.cardRevealedNeutral;
                return (
                  <button key={card.id} disabled className={cls}>
                    {card.word}
                  </button>
                );
              })}
            </div>

            <div className={styles.resultGrid}>
              <Link href="/codenames" className={styles.primaryBtn}>
                Neues Spiel
              </Link>
              <Link href="/" className={styles.secondaryBtn}>
                Zur Startseite
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
