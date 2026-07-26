"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  subscribeToGame,
  setGroupReady,
  startGame,
  banCategory,
  leaveGame,
  placeCardInTimeline,
  nextCard,
  nextTurn,
  sendPlaybackControl,
  updateMusicProgress,
  broadcastPendingPosition,
  broadcastPlacementResult,
  requestFlexButton,
  confirmFlexButton,
  rejectFlexButton,
  spendFlexButton,
  awardFlexButton,
  submitFlexTip,
  resolveFlexPhaseAndNext,
  revealResult,
  editGroupScore,
  endGame,
  skipCard,
  submitTriviaAnswer,
  submitSchaetzGuess,
  evaluateSchaetzfrage,
  showSchaetzResult,
  extractNumericFromAnswer,
  extractRangeFromAnswer,
  extractUnitFromAnswer,
  parseGermanNumber,
  activateJokerNewQuestion,
  activateJokerNext,
  activateJokerDice,
  confirmJokerDice,
  activateJokerSteal,
  dismissJokerNotification,
  trackPresence,
  submitTextAnswer,
  castAnswerVote,
  resolveTextAnswerVote,
  applyTextAnswerResult,
  isAnswerVoteComplete,
  timeoutTriviaAnswer,
  startEndGameVote,
  castEndGameVote,
  endGameByVote,
  cancelEndGameVote,
} from '@/lib/multiplayerService';
import { GameSession, GroupData } from '@/lib/multiplayerTypes';
import { getCardById } from '@/lib/cards';
import type { Card } from '@/lib/types';
import { MediaEmbed, MediaEmbedHandle, MediaProgressInfo } from '@/components/MediaEmbed';
import { catIcon, catLabel as catLabelMeta, catLabelWithIcon, catShortLabel } from '@/lib/categoryMeta';
import GroupAvatar from '@/components/GroupAvatar';

interface SessionInfo {
  pin: string;
  groupId: string;
  playerId: string;
  groupName: string;
  playerName: string;
  isHost: boolean;
}

// Badge für Zitate-Fragen: zeigt an, ob das Zitat aus einem Film, Lied oder von einer Person stammt
function quoteSourceBadge(card: Card | null | undefined) {
  if (!card || card.category !== 'quote' || !card.quoteSourceType) return null;
  const meta = ({
    film: { label: 'Film', icon: '🎬' },
    lied: { label: 'Lied', icon: '🎵' },
    person: { label: 'Person', icon: '🗣️' },
  } as Record<string, { label: string; icon: string }>)[card.quoteSourceType];
  if (!meta) return null;
  return (
    <span className="text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 font-semibold">
      {meta.icon} {meta.label}
    </span>
  );
}

export default function MultiplayerGamePage() {
  const router = useRouter();
  const params = useParams();
  const pin = params?.pin as string;

  const [game, setGame] = useState<GameSession | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Spielzustand
  const [isProcessing, setIsProcessing] = useState(false);
  const [flexJudgmentDone, setFlexJudgmentDone] = useState(false);
  const [flexPhaseEvaluated, setFlexPhaseEvaluated] = useState(false); // Host hat Auswertung gestartet
  const [flexTipPosition, setFlexTipPosition] = useState<number | null>(null); // gewählte Flex-Tipp-Position
  const [flexTipSubmitted, setFlexTipSubmitted] = useState(false); // Tipp bereits eingereicht
  const backGuardPushed = useRef(false); // ensures dummy history entry is pushed only once
  const lastPlaybackTimestampRef = useRef<number>(0); // deduplicate host playback commands
  const [placementResult, setPlacementResult] = useState<'correct' | 'wrong' | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null); // Gewählte Position vor Bestätigung
  const mediaEmbedRef = useRef<MediaEmbedHandle>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [musicElapsed, setMusicElapsed] = useState(0);
  const [musicDurationMs, setMusicDurationMs] = useState(0);
  const prevTurnGroupRef = useRef<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [flexTimer, setFlexTimer] = useState<number | null>(null);

  // Spielleitungsloser Modus: Textantwort + Abstimmung
  const [textAnswerInput, setTextAnswerInput] = useState('');
  const [answerTimedOut, setAnswerTimedOut] = useState(false);
  const [voteResolving, setVoteResolving] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Steal-Joker 20s-Cooldown: Button erst nach 20 Sekunden pro neuer Frage aktiv
  const [stealUnlocked, setStealUnlocked] = useState(false);
  const stealCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const cardId = (game as GameSession | null)?.currentCardId;
    if (!cardId) return;
    setStealUnlocked(false);
    if (stealCooldownRef.current) clearTimeout(stealCooldownRef.current);
    stealCooldownRef.current = setTimeout(() => setStealUnlocked(true), 20000);
    return () => { if (stealCooldownRef.current) clearTimeout(stealCooldownRef.current); };
  }, [(game as GameSession | null)?.currentCardId]);

  // Würfel-Joker Animation
  const [diceAnimating, setDiceAnimating] = useState(false);
  const [diceDisplayFace, setDiceDisplayFace] = useState(1);
  const prevDicePendingRef = useRef(false);
  const diceAnimIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  
  // Host-Funktionen
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<number | null>(null);
  const [showFlexConfirm, setShowFlexConfirm] = useState(false);
  const [showTriviaAnswer, setShowTriviaAnswer] = useState(false);
  const [schaetzInput, setSchaetzInput] = useState('');
  const [schaetzSubmitted, setSchaetzSubmitted] = useState(false);

  const [isBanning, setIsBanning] = useState(false);
  const [banTimeLeft, setBanTimeLeft] = useState<number>(20);
  const banAutoSkippedRef = useRef(false);

  // QR-Code für Einladungslink
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!pin || typeof window === 'undefined') return;
    const inviteUrl = `${window.location.origin}/multiplayer?pin=${pin}`;
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(inviteUrl, {
        width: 256,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).then(setQrCodeUrl).catch(console.error);
    });
  }, [pin]);

  // Joker-Notification Auto-Timer (5 Sek. → dismiss). Gilt auch für den
  // Würfel-Joker, sobald die Würfel-Animation fertig ist und das Ergebnis steht.
  const diceResultShown = !!(
    (game as GameSession | null)?.jokerDicePending &&
    (game as GameSession | null)?.jokerDiceResult != null &&
    !diceAnimating
  );
  const [jokerNotifCountdown, setJokerNotifCountdown] = useState<number>(5);
  const jokerNotifDismissedRef = useRef(false);
  useEffect(() => {
    const notif = (game as GameSession | null)?.jokerNotification;
    const isAutoTimerNotif = notif?.type === 'steal' || notif?.type === 'newQuestion' || notif?.type === 'next' || diceResultShown;
    if (!isAutoTimerNotif) {
      setJokerNotifCountdown(5);
      jokerNotifDismissedRef.current = false;
      return;
    }
    // Reset countdown whenever a fresh notification appears (by timestamp), or
    // when the dice result becomes visible (animation finished)
    setJokerNotifCountdown(5);
    jokerNotifDismissedRef.current = false;
    const interval = setInterval(() => {
      setJokerNotifCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(game as GameSession | null)?.jokerNotification?.timestamp, diceResultShown]);

  // Auto-dismiss wenn Countdown bei 0 — nur Host ruft Firebase-Update auf
  useEffect(() => {
    if (jokerNotifCountdown !== 0) return;
    if (jokerNotifDismissedRef.current) return;
    const notif = (game as GameSession | null)?.jokerNotification;
    if (!notif && !diceResultShown) return;
    jokerNotifDismissedRef.current = true;
    // Nur Host schreibt nach Firebase; im spielleitungslosen Modus übernimmt das die
    // gerade aktive Gruppe (es gibt niemand sonst, der zuverlässig verbunden ist).
    const g = game as GameSession | null;
    const s = session as SessionInfo | null;
    const isEffectiveHost = !!(s?.isHost || g?.hostId === s?.groupId) && !g?.hostless;
    const isActiveGroup = !!s && g?.currentTurnGroupId === s.groupId;
    if (isEffectiveHost || (g?.hostless && isActiveGroup)) {
      if (diceResultShown) {
        confirmJokerDice(pin).catch(console.error);
      } else {
        dismissJokerNotification(pin).catch(console.error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jokerNotifCountdown]);

  // Lade Session-Infos
  useEffect(() => {
    const sessionStr = localStorage.getItem('multiplayer_session');
    if (!sessionStr) {
      router.push('/multiplayer');
      return;
    }

    const sessionData: SessionInfo = JSON.parse(sessionStr);
    if (sessionData.pin !== pin) {
      router.push('/multiplayer');
      return;
    }

    // ?host=1 im URL-Parameter bedeutet: diese Tab ist die Spielleiter-Ansicht.
    // Das bleibt beim F5-Refresh erhalten, anders als reine State-Variablen.
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('host') === '1') {
      sessionData.isHost = true;
    }

    setSession(sessionData);
  }, [pin, router]);

  // Subscribe to game updates
  useEffect(() => {
    if (!pin) return;

    const unsubscribe = subscribeToGame(pin, (gameData) => {
      if (gameData) {
        setGame(gameData);
        setLoading(false);
      } else {
        setError('Spiel nicht gefunden');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pin]);

  // Online-Präsenz tracken (für spielleitungslosen Modus: stimmberechtigte Gruppen ermitteln)
  useEffect(() => {
    if (!pin || !session) return;
    const cleanup = trackPresence(pin, session.groupId, session.playerId);
    return cleanup;
  }, [pin, session?.groupId, session?.playerId]);

  // Timer: Countdown pro Karte
  useEffect(() => {
    if (!game || game.state !== 'playing') return;
    const duration = game.settings?.timerSeconds;
    if (!duration || duration <= 0) { setTimeLeft(null); return; }
    setTimeLeft(duration);
    setShowTriviaAnswer(false);
    setSchaetzInput('');
    setSchaetzSubmitted(false);
    const id = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.currentCardIndex, game?.state, game?.currentCardId, game?.currentTurnGroupId]);

  // Clear local placement result whenever the card changes (new round)
  useEffect(() => {
    setPlacementResult(null);
    setPlacementError(null);
    setSelectedPosition(null);
    setFlexTipPosition(null);
    setFlexTipSubmitted(false);
    setFlexJudgmentDone(false);
    setFlexPhaseEvaluated(false);
    setFlexTimer(null);
    setTextAnswerInput('');
    setAnswerTimedOut(false);
    setVoteResolving(false);
    setAutoAdvanceCountdown(null);
  }, [game?.currentCardId]);

  // Flex-Phase: 15-Sekunden-Countdown → automatische Auswertung
  useEffect(() => {
    if (!game?.flexPhaseActive || !game?.pendingResult || flexPhaseEvaluated || game?.resultRevealed) {
      setFlexTimer(null);
      return;
    }
    setFlexTimer(15);
    const id = window.setInterval(() => {
      setFlexTimer(prev => {
        if (prev === null || prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.flexPhaseActive, game?.pendingResult, flexPhaseEvaluated, game?.resultRevealed]);

  // Auto-Auswertung wenn Flex-Timer abläuft (Host führt revealResult aus; im
  // spielleitungslosen Modus übernimmt das die aktive Gruppe)
  useEffect(() => {
    if (flexTimer !== 0 || flexPhaseEvaluated) return;
    const isActiveGroup = !!session && !!game && game.currentTurnGroupId === session.groupId && !effectiveIsHost;
    if (!effectiveIsHost && !(game?.hostless && isActiveGroup)) return;
    revealResult(pin).catch(console.error);
    setFlexPhaseEvaluated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flexTimer]);

  const handleToggleReady = async () => {
    if (!session || !game) return;
    
    const group = game.groups[session.groupId];
    if (!group) return;

    try {
      await setGroupReady(pin, session.groupId, !group.isReady);
    } catch (err) {
      console.error('Error toggling ready:', err);
    }
  };

  const handleStartGame = async () => {
    if (!session || !game) return;

    try {
      await startGame(pin, session.groupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Starten');
    }
  };

  const handleLeaveGame = async () => {
    if (!session) return;

    try {
      await leaveGame(pin, session.groupId);
      localStorage.removeItem('multiplayer_session');
      router.push('/multiplayer');
    } catch (err) {
      console.error('Error leaving game:', err);
      router.push('/multiplayer');
    }
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
  };

  const shareInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/multiplayer?pin=${pin}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Flex Quiz – Einladung', text: `Tritt unserem Quiz bei! PIN: ${pin}`, url: inviteUrl });
      } catch {
        // user cancelled or share failed – silently ignore
      }
    } else {
      navigator.clipboard.writeText(inviteUrl);
    }
  };

  const handleSelectPosition = (pos: number) => {
    setSelectedPosition(pos);
    if (session && pin) {
      broadcastPendingPosition(pin, session.groupId, pos).catch(() => {});
    }
  };

  const handlePlaceCard = async (position: number) => {
    if (!session || !game || !game.currentCardId || isProcessing) return;
    // Nur die aktive Gruppe darf setzen
    if (game.currentTurnGroupId && game.currentTurnGroupId !== session.groupId) return;

    // Clear pending position preview before submitting
    broadcastPendingPosition(pin, session.groupId, null).catch(() => {});
    setIsProcessing(true);
    setPlacementResult(null);
    setPlacementError(null);
    setSelectedPosition(null);
    
    try {
      const card = getCardById(game.currentCardId);
      if (!card) {
        setPlacementError('Karte nicht gefunden – bitte Seite neu laden.');
        setIsProcessing(false);
        return;
      }

      const correct = await placeCardInTimeline(pin, session.groupId, card, position);
      setPlacementResult(correct ? 'correct' : 'wrong');
      // Write result to Firebase so host can see it and advance
      await broadcastPlacementResult(pin, correct ? 'correct' : 'wrong');
    } catch (err) {
      console.error('Error placing card:', err);
      setPlacementError('Platzierung fehlgeschlagen – bitte nochmal versuchen.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper für Timeline-Label (gekürzt)
  const getShortTimelineLabel = (text: string): string => {
    if (text.length <= 35) return text;
    return text.slice(0, 32) + '...';
  };

  const handleNextCard = async () => {
    if (!session || !game || isProcessing) return;
    
    setIsProcessing(true);
    setPlacementResult(null);
    setPlacementError(null);
    setSelectedPosition(null);
    setFlexJudgmentDone(false);
    setFlexPhaseEvaluated(false);
    
    try {
      if (game.mode === 'timeline') {
        // Flex-Phase auswerten + nächste Karte (alles in einem Schritt)
        await resolveFlexPhaseAndNext(pin);
      } else {
        await broadcastPlacementResult(pin, null); // clear result flag
        await nextCard(pin);
        await nextTurn(pin); // Trivia/solo: group rotation handled separately
      }
    } catch (err) {
      console.error('Error going to next card:', err);
      setError('Fehler beim Wechseln zur nächsten Karte');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle remote playback control (for guests)
  const handleRemotePlay = async () => {
    if (!session || !game || !game.currentCardId) return;
    setIsMediaPlaying(true);
    await sendPlaybackControl(pin, session.groupId, 'play', game.currentCardId);
  };

  const handleRemotePause = async () => {
    if (!session || !game || !game.currentCardId) return;
    setIsMediaPlaying(false);
    await sendPlaybackControl(pin, session.groupId, 'pause', game.currentCardId);
  };

  // Sendet echte Position/Dauer der Musik an alle Mitspieler, damit deren Fortschrittsanzeige
  // stimmt (statt einer Schätzung). Play/Pause/Seek-Ereignisse werden sofort gesendet,
  // laufende Wiedergabe nur alle 2s (um Firebase-Schreibvorgänge gering zu halten).
  const lastMusicProgressSendRef = useRef<number>(0);
  const handleMediaProgress = (info: MediaProgressInfo) => {
    if (!game?.currentCardId) return;
    const now = Date.now();
    if (info.isPlaying && now - lastMusicProgressSendRef.current < 2000) return;
    lastMusicProgressSendRef.current = now;
    updateMusicProgress(pin, game.currentCardId, info.positionMs, info.durationMs).catch(console.error);
  };

  // Host-Funktionen
  const handleConfirmFlex = async () => {
    if (!session || !game?.flexPendingGroupId) return;
    
    try {
      await confirmFlexButton(pin, session.groupId, game.flexPendingGroupId);
      setShowFlexConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Bestätigen');
    }
  };

  const handleRejectFlex = async () => {
    if (!session) return;
    
    try {
      await rejectFlexButton(pin, session.groupId);
      setShowFlexConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Ablehnen');
    }
  };

  const handleUseFlex = async () => {
    if (!session || isProcessing) return;
    setIsProcessing(true);
    try {
      await spendFlexButton(pin, session.groupId);
      setPlacementResult(null);
      setSelectedPosition(null);
      setPlacementError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Flex-Button');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAwardFlex = async (award: boolean) => {
    if (!session || !game?.currentTurnGroupId) return;
    try {
      if (award) {
        await awardFlexButton(pin, game.currentTurnGroupId);
      }
      setFlexJudgmentDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Flex vergeben');
    }
  };

  const handleSubmitFlexTip = async () => {
    if (!session || flexTipPosition === null || flexTipSubmitted || isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await submitFlexTip(pin, session.groupId, flexTipPosition);
      if (result.ok) {
        setFlexTipSubmitted(true);
      } else {
        setError(result.reason ?? 'Fehler beim Flex-Tipp');
        setFlexTipPosition(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Flex-Tipp');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateScore = async (groupId: string) => {
    if (!session || editingScore === null) return;
    
    try {
      await editGroupScore(pin, session.groupId, groupId, editingScore);
      setEditingGroupId(null);
      setEditingScore(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
    }
  };

  const handleEndGame = async () => {
    if (!session) return;
    
    if (!window.confirm('Soll das Spiel wirklich beendet werden?')) return;
    
    try {
      await endGame(pin, session.groupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Beenden');
    }
  };

  const handleRequestFlex = async () => {
    if (!session || !game || game.currentTurnGroupId !== session.groupId) return;
    
    try {
      await requestFlexButton(pin, session.groupId);
      setShowFlexConfirm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Anfordern');
    }
  };

  // Host listens for playback control commands
  useEffect(() => {
    if (!game || !session) return;
    const isEffectiveHost = (session.isHost || game.hostId === session.groupId) && !game.hostless;
    const isActiveGroup = game.currentTurnGroupId === session.groupId;
    const controlsMedia = isEffectiveHost || (game.hostless && isActiveGroup);
    if (!controlsMedia || !game.playbackControl) return;

    const control = game.playbackControl;
    const currentCardId = game.currentCardId;
    
    if (control.cardId !== currentCardId) return; // Ignore old commands
    // Deduplicate: only act when timestamp actually changed (prevents re-fire on unrelated Firebase updates)
    if (control.timestamp === lastPlaybackTimestampRef.current) return;
    lastPlaybackTimestampRef.current = control.timestamp;
    // Host already started playback locally via button click — don’t re-trigger
    const isSelf = session && control.requestedBy === session.groupId;

    if (control.action === 'play') {
      if (!isSelf) mediaEmbedRef.current?.play();
      setIsMediaPlaying(true);
    } else if (control.action === 'pause') {
      if (!isSelf) mediaEmbedRef.current?.pause();
      setIsMediaPlaying(false);
    } else if (control.action === 'stop') {
      if (!isSelf) mediaEmbedRef.current?.stop();
      setIsMediaPlaying(false);
    }
  }, [game?.playbackControl, game?.currentCardId, session?.isHost, game?.hostId]);

  // Track elapsed music time for players
  useEffect(() => {
    const pendingPos = game?.groups?.[game?.currentTurnGroupId ?? '']?.pendingPosition;
    if (pendingPos == null) return;
    // small delay to let React render the ghost element first
    const t = setTimeout(() => {
      document.getElementById('obs-ghost-card')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);
    return () => clearTimeout(t);
  }, [game?.groups?.[game?.currentTurnGroupId ?? '']?.pendingPosition]);

  useEffect(() => {
    if (!game?.resultRevealed) return;
    const t = setTimeout(() => {
      document.getElementById('obs-new-card')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 200);
    return () => clearTimeout(t);
  }, [game?.resultRevealed, game?.currentCardId]);

  // Track elapsed music time for players — basiert auf der vom Spielleiter-Client
  // synchronisierten echten Position (musicProgress), nicht mehr auf einer Schätzung
  // ab dem Play-Timestamp. Fällt auf die alte Schätzung zurück, solange noch kein
  // musicProgress-Update für die aktuelle Karte eingetroffen ist.
  useEffect(() => {
    const control = game?.playbackControl;
    if (!control || control.cardId !== game?.currentCardId) {
      setMusicElapsed(0);
      setMusicDurationMs(0);
      return;
    }
    const progress = game?.musicProgress;
    const hasProgress = progress && progress.cardId === control.cardId;
    const basePositionMs = hasProgress ? progress!.positionMs : 0;
    const baseTs = hasProgress ? progress!.updatedAt : control.timestamp;
    setMusicDurationMs(hasProgress ? progress!.durationMs : 0);

    if (control.action === 'play') {
      const compute = () => Math.floor((basePositionMs + (Date.now() - baseTs)) / 1000);
      setMusicElapsed(compute());
      const id = setInterval(() => setMusicElapsed(compute()), 1000);
      return () => clearInterval(id);
    } else {
      // paused or stopped – freeze at last known position
      setMusicElapsed(Math.floor(basePositionMs / 1000));
    }
  }, [game?.playbackControl, game?.musicProgress, game?.currentCardId]);

  // Warn host before accidental browser refresh / back navigation
  useEffect(() => {
    if (!game || !session) return;
    // Im spielleitungslosen Modus hat niemand während des Spiels eine unersetzliche
    // Sonderrolle mehr (nur der Start-Button in der Lobby) — daher gilt diese Warnung
    // dort nicht speziell für den Ersteller.
    const isHost = (session.isHost || game.hostId === session.groupId) && !game.hostless;
    const activeGame = game.state === 'playing' || game.state === 'banning';
    if (!isHost || !activeGame) {
      backGuardPushed.current = false; // reset so guard re-arms for a new game
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Das Spiel läuft noch. Wenn du die Seite verlässt, kann das Spiel nicht mehr fortgesetzt werden. Wirklich verlassen?';
    };

    // Browser-Back-Button guard: push a dummy history entry ONCE so pressing back
    // only pops to this dummy entry, then we ask for confirmation.
    if (!backGuardPushed.current) {
      history.pushState(null, '', window.location.href);
      backGuardPushed.current = true;
    }
    const handlePopState = () => {
      // Push again so the URL doesn't change
      history.pushState(null, '', window.location.href);
      const leave = window.confirm(
        'Das Spiel läuft noch!\n\nAls Spielleiter kannst du das Spiel nicht fortsetzen, wenn du diese Seite verlässt.\n\nWirklich verlassen?'
      );
      if (leave) {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        router.push('/');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [game?.state, session?.isHost, game?.hostId, session?.groupId, router]);

  // Auto-skip invalid card IDs in Trivia mode (stale Firebase data from old deployments)
  useEffect(() => {
    if (!game || !session) return;
    if (game.state !== 'playing' || game.mode !== 'trivia') return;
    if (!game.currentCardId) return;
    const isEffectiveHost = (session.isHost || game.hostId === session.groupId) && !game.hostless;
    const isActiveGroup = game.currentTurnGroupId === session.groupId;
    if (!isEffectiveHost && !(game.hostless && isActiveGroup)) return;
    if (getCardById(game.currentCardId)) return; // card found – nothing to do
    const t = setTimeout(async () => {
      try { await skipCard(pin); } catch (e) { console.error('auto-skip failed', e); }
    }, 1500);
    return () => clearTimeout(t);
  }, [game?.currentCardId, game?.state, game?.mode, session?.isHost, game?.hostId, session?.groupId, pin]);

  // Ban-Phase Timer: 20 Sekunden pro Gruppe, danach automatisch überspringen
  useEffect(() => {
    if (game?.state !== 'banning') {
      setBanTimeLeft(20);
      return;
    }
    const deadline = game.banPhaseDeadline;
    if (!deadline) return;
    banAutoSkippedRef.current = false;

    const order = game.banPhaseGroupOrder ?? [];
    const currentIndex = game.banPhaseCurrentIndex ?? 0;
    const currentBanGroupId = order[currentIndex];
    const isMyTurn = currentBanGroupId === session?.groupId;

    const tick = () => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      setBanTimeLeft(Math.max(0, remaining));
      if (remaining <= 0 && isMyTurn && !banAutoSkippedRef.current) {
        banAutoSkippedRef.current = true;
        banCategory(pin, session!.groupId, null).catch(console.error);
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [game?.state, game?.banPhaseDeadline, game?.banPhaseCurrentIndex, session?.groupId, pin]);

  // Würfel-Joker Animation: triggert wenn jokerDicePending false→true wird
  useEffect(() => {
    const pending = !!(game?.jokerDicePending);
    const finalRoll = game?.jokerDiceResult ?? null;

    if (pending && !prevDicePendingRef.current && finalRoll != null) {
      prevDicePendingRef.current = true;
      const capturedRoll = finalRoll;
      setDiceAnimating(true);
      setDiceDisplayFace(1);
      let count = 0;
      if (diceAnimIntervalRef.current) clearInterval(diceAnimIntervalRef.current);
      diceAnimIntervalRef.current = setInterval(() => {
        count++;
        if (count >= 15) {
          clearInterval(diceAnimIntervalRef.current!);
          diceAnimIntervalRef.current = null;
          setDiceDisplayFace(capturedRoll);
          setDiceAnimating(false);
        } else {
          setDiceDisplayFace(f => f === 6 ? 1 : f + 1);
        }
      }, 100);
    } else if (!pending) {
      prevDicePendingRef.current = false;
      if (diceAnimIntervalRef.current) {
        clearInterval(diceAnimIntervalRef.current);
        diceAnimIntervalRef.current = null;
      }
      setDiceAnimating(false);
    }
  }, [game?.jokerDicePending, game?.jokerDiceResult]);

  // Spielleitungsloser Modus (Trivia): Antwortzeit abgelaufen, ohne dass die aktive
  // Gruppe eingereicht hat → automatisch als falsch werten.
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || game.mode !== 'trivia' || game.state !== 'playing') return;
    if (game.pendingTextAnswer) return;
    const isActiveGroup = game.currentTurnGroupId === session.groupId;
    if (!isActiveGroup) return;
    const currentCat = game.currentCardId ? (game.deckMeta ?? {})[game.currentCardId] : '';
    if (currentCat === 'schaetzfragen') return;
    if (timeLeft !== 0 || answerTimedOut) return;
    setAnswerTimedOut(true);
    timeoutTriviaAnswer(pin, session.groupId).catch(console.error);
  }, [timeLeft, game?.pendingTextAnswer, game?.hostless, game?.mode, game?.state, game?.currentTurnGroupId, game?.currentCardId, session, answerTimedOut, pin]);

  // Spielleitungsloser Modus (Trivia): sobald alle verbundenen Gruppen abgestimmt
  // haben, löst die aktive Gruppe die Abstimmung sofort auf (schreibt textAnswerResult
  // für den Reveal-Bildschirm — die eigentliche Punktevergabe folgt erst danach).
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || !game.pendingTextAnswer || voteResolving) return;
    const isActiveGroup = game.pendingTextAnswer.groupId === session.groupId;
    if (!isActiveGroup) return;
    if (!isAnswerVoteComplete(game)) return;
    setVoteResolving(true);
    resolveTextAnswerVote(pin).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.answerVotes, game?.pendingTextAnswer, game?.hostless]);

  // Spielleitungsloser Modus (Trivia): Reveal-Bildschirm ("Antwort akzeptiert/abgelehnt")
  // bleibt kurz stehen, dann wendet die antwortende Gruppe das Ergebnis an und es geht weiter.
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || !game.textAnswerResult) return;
    const isActiveGroup = game.textAnswerResult.groupId === session.groupId;
    if (!isActiveGroup) return;
    const t = setTimeout(() => {
      applyTextAnswerResult(pin).catch(console.error);
    }, 3000);
    return () => clearTimeout(t);
  }, [game?.textAnswerResult, game?.hostless, session, pin]);

  // Spielleitungsloser Modus (Timeline): nach Ergebnis-Reveal automatisch weiter
  // (4 Sekunden Pause), ausgelöst von der aktiven Gruppe statt vom Host.
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || game.mode !== 'timeline' || !game.resultRevealed) {
      setAutoAdvanceCountdown(null);
      return;
    }
    const isActiveGroup = game.currentTurnGroupId === session.groupId;
    if (!isActiveGroup) return;
    setAutoAdvanceCountdown(4);
    const id = window.setInterval(() => {
      setAutoAdvanceCountdown(prev => {
        if (prev === null || prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [game?.resultRevealed, game?.hostless, game?.mode, game?.currentTurnGroupId, session]);

  useEffect(() => {
    if (autoAdvanceCountdown !== 0 || !game || !session) return;
    setAutoAdvanceCountdown(null);
    resolveFlexPhaseAndNext(pin).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvanceCountdown]);

  // Spielleitungsloser Modus: Schätzfragen werden automatisch ausgewertet, sobald
  // alle spielenden Gruppen (bzw. beim Stechen: alle Stechen-Teilnehmer) eingereicht
  // haben. Die "kleinste Gruppen-ID" löst deterministisch aus, damit nicht mehrere
  // Clients gleichzeitig auswerten.
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || game.mode !== 'trivia' || !game.currentCardId) return;
    if ((game.deckMeta ?? {})[game.currentCardId] !== 'schaetzfragen') return;
    if (game.schaetzResult) return;

    const isTiebreaker = game.triviaTiebreakerActive === true;
    const tiebreakerIds: string[] = isTiebreaker
      ? (Array.isArray(game.triviaTiebreakerGroupIds) ? game.triviaTiebreakerGroupIds : Object.values(game.triviaTiebreakerGroupIds ?? {}) as string[])
      : [];
    const playingGroups = Object.values(game.groups).filter(g => !g.isHost && (!isTiebreaker || tiebreakerIds.includes(g.id)));
    if (playingGroups.length === 0) return;
    const allSubmitted = playingGroups.every(g => g.schaetzSubmission != null && g.schaetzSubmission !== '');
    if (!allSubmitted) return;

    const resolverGroupId = [...playingGroups].sort((a, b) => a.id.localeCompare(b.id))[0].id;
    if (session.groupId !== resolverGroupId) return;

    const currentCard = getCardById(game.currentCardId);
    if (!currentCard) return;

    const unit = extractUnitFromAnswer(currentCard.answer);
    const correctRange = extractRangeFromAnswer(currentCard.answer);
    const correctNum = correctRange ? null : extractNumericFromAnswer(currentCard.answer);
    const distToCorrect = (val: number) =>
      correctRange
        ? (val >= correctRange.low && val <= correctRange.high
            ? 0
            : Math.min(Math.abs(val - correctRange.low), Math.abs(val - correctRange.high)))
        : Math.abs(val - (correctNum ?? NaN));

    const withSubmissions = playingGroups
      .filter(g => g.schaetzSubmission != null && g.schaetzSubmission !== '')
      .map(g => ({ id: g.id, name: g.name, color: g.color, val: parseGermanNumber(g.schaetzSubmission ?? ''), raw: g.schaetzSubmission ?? '' }))
      .filter(s => isFinite(s.val));
    if (withSubmissions.length === 0) return;
    const distances = withSubmissions.map(s => distToCorrect(s.val));
    if (distances.some(d => isNaN(d))) return;
    const minDist = Math.min(...distances);
    const EPS = 0.001;
    const winners = withSubmissions.filter((s, i) => Math.abs(distances[i] - minDist) < EPS);

    const jokerKeysList = ['newQuestion', 'next', 'dice', 'steal'] as const;
    const jokerRestores: { groupId: string; groupName: string; jokerKey: 'newQuestion' | 'next' | 'dice' | 'steal' }[] = [];
    if (game.jokersEnabled) {
      for (const w of winners) {
        const groupJokers = game.groups[w.id]?.jokers;
        if (groupJokers) {
          const used = jokerKeysList.filter(k => groupJokers[k] === false);
          if (used.length > 0) {
            const restored = used[Math.floor(Math.random() * used.length)];
            jokerRestores.push({ groupId: w.id, groupName: w.name, jokerKey: restored });
          }
        }
      }
    }

    showSchaetzResult(pin, {
      answer: currentCard.answer,
      winnerIds: winners.map(w => w.id),
      submissions: withSubmissions.map((s, i) => ({
        groupId: s.id,
        groupName: s.name,
        value: `${s.raw}${unit ? ` ${unit}` : ''}`,
        isWinner: Math.abs(distances[i] - minDist) < EPS,
        color: s.color,
      })),
      jokerRestores,
    }).catch(console.error);
  }, [game?.hostless, game?.mode, game?.currentCardId, game?.groups, game?.schaetzResult, game?.triviaTiebreakerActive, game?.triviaTiebreakerGroupIds, game?.deckMeta, game?.jokersEnabled, session, pin]);

  // Spielleitungsloser Modus: nach kurzer Reveal-Pause automatisch weiter (entspricht
  // dem bisherigen host-only "Weiter"-Klick nach der Schätzfrage-Auswertung).
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || !game.schaetzResult) return;
    const playingGroups = Object.values(game.groups).filter(g => !g.isHost);
    if (playingGroups.length === 0) return;
    const resolverGroupId = [...playingGroups].sort((a, b) => a.id.localeCompare(b.id))[0].id;
    if (session.groupId !== resolverGroupId) return;
    const winnerIds = game.schaetzResult.winnerIds;
    const t = setTimeout(() => {
      evaluateSchaetzfrage(pin, winnerIds).catch(console.error);
    }, 4000);
    return () => clearTimeout(t);
  }, [game?.hostless, game?.schaetzResult, game?.groups, session, pin]);

  // Spielleitungsloser Modus: "Spiel jetzt beenden?"-Abstimmung automatisch auswerten.
  // Mehr als die Hälfte der spielenden Gruppen dafür → Spiel beenden. Mehr als die
  // Hälfte dagegen (Mehrheit für "Ja" unmöglich) → Abstimmung abbrechen. Ein
  // deterministischer Resolver (kleinste Gruppen-ID) verhindert doppeltes Auflösen.
  useEffect(() => {
    if (!game || !session) return;
    if (!game.hostless || !game.endGameVote) return;
    const playingGroups = Object.values(game.groups).filter(g => !g.isHost);
    if (playingGroups.length === 0) return;
    const resolverGroupId = [...playingGroups].sort((a, b) => a.id.localeCompare(b.id))[0].id;
    if (session.groupId !== resolverGroupId) return;

    const total = playingGroups.length;
    const needed = Math.floor(total / 2) + 1;
    const votes = game.endGameVote.votes ?? {};
    const yesVotes = Object.values(votes).filter(v => v === true).length;
    const noVotes = Object.values(votes).filter(v => v === false).length;

    if (yesVotes >= needed) {
      endGameByVote(pin).catch(console.error);
    } else if (total - noVotes < needed) {
      cancelEndGameVote(pin).catch(console.error);
    }
  }, [game?.hostless, game?.endGameVote, game?.groups, session, pin]);

  if (loading) {
    return (
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10">
        <div className="text-center">
          <p className="text-lg">Lade Spiel...</p>
        </div>
      </main>
    );
  }

  if (error || !game || !session) {
    return (
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600">{error || 'Fehler beim Laden'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-ink text-inkDark rounded-lg"
          >
            Zurück zum Hauptmenü
          </button>
        </div>
      </main>
    );
  }

  const currentGroup = game.groups[session.groupId];
  // Derive host status robustly: cross-check localStorage with Firebase game.hostId
  // so a stale/refreshed session still identifies the host correctly
  // isCreator: hat das Spiel erstellt (PIN-Inhaber) — gilt in beiden Modi.
  // effectiveIsHost: ist die NICHT spielende Spielleitung — gibt es nur im Modus "mit Spielleitung".
  // Im spielleitungslosen Modus ist die erstellende Gruppe selbst eine ganz normale spielende Gruppe;
  // sie behält lediglich über isCreator den "Spiel starten"-Button.
  const isCreator = session.isHost || game.hostId === session.groupId;
  const effectiveIsHost = isCreator && !game.hostless;
  const groupList = Object.values(game.groups).filter(g => !g.isHost); // Spielleiter aus Liste entfernen
  const allReady = groupList.every(g => g.isReady);

  // Kategorie-Label + Icon für Ban-Phase und allgemeine Anzeige
  const CATEGORY_LABEL_WITH_ICON = (cat: string) => catLabelWithIcon(cat);
  const CATEGORY_DISPLAY = (cat: string) => catLabelMeta(cat);

  const handleBanCategory = async (category: string | null) => {
    if (!session || isBanning) return;
    setIsBanning(true);
    try {
      await banCategory(pin, session.groupId, category);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBanning(false);
    }
  };

  // Ban-Phase-Ansicht
  if (game.state === 'banning') {
    const order = game.banPhaseGroupOrder ?? [];
    const currentIndex = game.banPhaseCurrentIndex ?? 0;
    const currentBanGroupId = order[currentIndex];
    const isMyTurn = currentBanGroupId === session?.groupId;
    const currentBanGroup = game.groups[currentBanGroupId];
    const availableCategories = (game.triviaCategories ?? []).filter(
      c => !(game.bannedCategories ?? []).includes(c) && c !== 'image' && c !== 'schaetzfragen'
    );
    const banned = game.bannedCategories ?? [];

    return (
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display">🚫 Kategorie-Ban</h1>
          <p className="text-sm text-ink/60">
            Jede Gruppe kann eine Kategorie aus dem Spiel ausschließen.
          </p>
          <div className="text-sm text-ink/70">
            Runde {Math.min(currentIndex + 1, order.length)} / {order.length}
          </div>
        </div>

        {/* Bereits gebannte Kategorien */}
        {banned.length > 0 && (
          <div className="card-surface rounded-2xl p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-ink/60">Gebannte Kategorien</p>
            <div className="flex flex-wrap gap-2">
              {banned.map(c => (
                <span key={c} className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-300">
                  🚫 {catLabelWithIcon(c)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Aktuell an der Reihe */}
        <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-amber-400/40 bg-amber-50/10">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-amber-700">
              {isMyTurn
                ? '👉 Du bist dran — wähle eine Kategorie zum Bannen'
                : `⏳ ${currentBanGroup?.name ?? '...'} wählt gerade...`}
            </p>
            <span className={`text-2xl font-bold tabular-nums shrink-0 ${
              banTimeLeft <= 5 ? 'text-red-500 animate-pulse' : banTimeLeft <= 10 ? 'text-amber-500' : 'text-amber-700'
            }`}>
              {banTimeLeft}s
            </span>
          </div>

          {isMyTurn && (
            <>
              <p className="text-xs text-ink/60 text-center">Wähle eine Kategorie, die du aus dem Spiel ausschließen möchtest – oder wähle „Nichts bannen".</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableCategories.map(c => (
                  <button
                    key={c}
                    onClick={() => handleBanCategory(c)}
                    disabled={isBanning}
                    className="rounded-xl border-2 border-red-400 bg-red-50 hover:bg-red-100 text-red-800 text-sm font-semibold px-3 py-3 transition disabled:opacity-50"
                  >
                    <span className="block text-lg">{catIcon(c)}</span>
                    <span className="block text-xs mt-0.5">{catLabelMeta(c)}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleBanCategory(null)}
                  disabled={isBanning}
                  className="rounded-xl border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-800 text-sm font-semibold px-3 py-3 transition disabled:opacity-50 col-span-2 sm:col-span-1"
                >
                  ✅ Nichts bannen
                </button>
              </div>
            </>
          )}
        </div>

        {/* Ban-Reihenfolge */}
        <div className="card-surface rounded-2xl p-4 space-y-2">
          <p className="text-xs uppercase tracking-wide text-ink/60">Ban-Reihenfolge</p>
          <div className="space-y-1">
            {order.map((gid, i) => {
              const g = game.groups[gid];
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <div key={gid} className={`flex items-center gap-2 text-sm py-1 ${
                  active ? 'font-bold text-amber-700' : done ? 'text-ink/40 line-through' : 'text-ink/70'
                }`}>
                  <GroupAvatar avatar={g?.avatar} size="sm" />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g?.color }} />
                  <span>{g?.name ?? gid}</span>
                  {done && (
                    <span className="ml-auto text-xs">
                      {banned[i] ? `🚫 ${catLabelMeta(banned[i])}` : '✅ Nichts gebannt'}
                    </span>
                  )}
                  {active && <span className="ml-auto text-xs text-amber-600">👉 dran</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Host-Hinweis */}
        {effectiveIsHost && (
          <div className="card-surface rounded-2xl p-4 border border-green-500/30 bg-green-50/10">
            <p className="text-sm text-green-700">👑 Spielleiter: Das Spiel startet automatisch, wenn alle Gruppen gebannt haben.</p>
          </div>
        )}
      </main>
    );
  }

  // Lobby-Ansicht
  if (game.state === 'lobby') {
    return (
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display">Lobby</h1>
          <div className="inline-flex items-center gap-3 flex-wrap justify-center">
            <div className="inline-flex items-center gap-3 bg-ink text-inkDark px-6 py-3 rounded-xl">
              <span className="text-sm">PIN:</span>
              <span className="text-2xl font-mono font-bold tracking-wider">{pin}</span>
              <button
                onClick={copyPin}
                className="ml-2 hover:opacity-70 transition-opacity"
                title="PIN kopieren"
              >
                📋
              </button>
            </div>
            <button
              onClick={shareInviteLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ink/10 hover:bg-ink/20 font-semibold transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            <span>Einladungslink teilen</span>
          </button>
          </div>
        </div>

        {/* Host-Panel - Nur wenn du der Spielleiter bist */}
        {effectiveIsHost && (
          <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30 bg-green-50/10">
            <h2 className="text-xl font-semibold text-green-700">👑 Spielleiter-Panel</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">PIN zum Beitreten: <span className="font-mono text-lg">{pin}</span></p>
                <p className="text-xs text-ink/60">Spieler können diese PIN eingeben um beizutreten</p>
              </div>

              {/* QR-Code */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <img
                    src={qrCodeUrl}
                    alt={`QR-Code zum Beitreten – PIN ${pin}`}
                    className="w-48 h-48 rounded-xl border-4 border-ink/10"
                  />
                  <p className="text-xs text-ink/50 text-center">QR-Code scannen zum Beitreten</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Spielende Gruppen ({groupList.length}):</p>
                <div className="space-y-1 text-sm">
                  {groupList.map(g => (
                    <div key={g.id} className="flex items-center gap-2">
                      <GroupAvatar avatar={g.avatar} size="md" />
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: g.color }}
                      />
                      <span>{g.name}</span>
                      <span className={g.isReady ? 'text-green-600' : 'text-red-600'}>
                        {g.isReady ? '✓ Bereit' : '✗ Nicht bereit'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Nur Spiel starten / Beenden Buttons für Host */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleLeaveGame}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-ink/30 hover:border-ink/60 transition-colors text-sm"
              >
                Verlassen
              </button>
              <button
                onClick={handleStartGame}
                disabled={!allReady || groupList.length < 2}
                className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Spiel starten
              </button>
            </div>
          </div>
        )}

        {/* Gruppen-Liste - Nur für nicht-Host */}
        {!effectiveIsHost && (
          <>
            {/* Ersteller im spielleitungslosen Modus: PIN/QR teilen + Spiel starten (spielt selbst mit) */}
            {game.hostless && isCreator && (
              <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30 bg-green-50/10">
                <h2 className="text-xl font-semibold text-green-700">🎮 Ihr habt das Spiel erstellt</h2>
                <p className="text-sm text-ink/60">Teilt die PIN mit den anderen Gruppen. Sobald alle bereit sind, könnt ihr starten — ihr spielt selbst mit.</p>
                {qrCodeUrl && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <img
                      src={qrCodeUrl}
                      alt={`QR-Code zum Beitreten – PIN ${pin}`}
                      className="w-40 h-40 rounded-xl border-4 border-ink/10"
                    />
                    <p className="text-xs text-ink/50 text-center">QR-Code scannen zum Beitreten</p>
                  </div>
                )}
                <button
                  onClick={handleStartGame}
                  disabled={!allReady || groupList.length < 2}
                  className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Spiel starten
                </button>
              </div>
            )}

            {/* Andere Gruppen */}
            <div className="card-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                Gruppen ({groupList.length})
              </h2>
              <div className="space-y-3">
                {groupList.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2"
                    style={{ borderColor: group.color }}
                  >
                    <div className="flex items-center gap-3">
                      <GroupAvatar avatar={group.avatar} size="lg" />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <p className="font-semibold">
                          {group.name}
                          {group.id === session.groupId && ' (Du)'}
                        </p>
                        <p className="text-sm text-ink/60">
                          {group.players.map(p => p.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div>
                      {group.isReady ? (
                        <span className="text-green-600 font-semibold">✓ Bereit</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗ Nicht bereit</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spielmodus Info */}
            <div className="card-surface rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Spielmodus</h3>
              <p className="text-lg">
                {game.mode === 'timeline' ? '🔢 Timeline' : game.mode === 'trivia' ? '🎓 Trivia' : '👤 Solo'}
              </p>
            </div>

            {/* Aktionen für Spieler */}
            <div className="flex gap-3">
              <button
                onClick={handleLeaveGame}
                className="flex-1 px-6 py-4 rounded-lg border-2 border-ink/30 hover:border-ink/60 transition-colors"
              >
                Verlassen
              </button>
              
              {currentGroup && (
                <button
                  onClick={handleToggleReady}
                  className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-colors ${
                    currentGroup.isReady
                      ? 'bg-ink/10 border-2 border-ink/30 hover:bg-ink/20'
                      : 'bg-ink text-inkDark hover:opacity-90'
                  }`}
                >
                  {currentGroup.isReady ? 'Nicht mehr bereit' : 'Bereit'}
                </button>
              )}
            </div>

            {!allReady && groupList.length >= 2 && !(game.hostless && isCreator) && (
              <p className="text-center text-sm text-ink/60">
                {game.hostless
                  ? `Warte darauf, dass ${game.groups[game.hostId]?.name ?? 'die erstellende Gruppe'} das Spiel startet...`
                  : 'Warte darauf, dass der Spielleiter das Spiel startet...'}
              </p>
            )}

            {groupList.length < 2 && (
              <p className="text-center text-sm text-ink/60">
                Warte auf weitere Gruppen...
              </p>
            )}
          </>
        )}
      </main>
    );
  }

  // Spielansicht
  if (game.state === 'playing') {
    // Warte bis Karte geladen ist
    if (!game.currentCardId || game.currentCardIndex < 0) {
      return (
        <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display">Timeline Multiplayer</h1>
            <div className="card-surface rounded-2xl p-6">
              <p className="text-lg text-ink/70">Spiel wird vorbereitet...</p>
              {game.currentTurnGroupId && (
                <p className="text-sm text-ink/60 mt-2">
                  Aktuell am Zug: {game.groups[game.currentTurnGroupId]?.name}
                </p>
              )}
            </div>
          </div>
        </main>
      );
    }
    
    const currentCard = getCardById(game.currentCardId);
    const isActiveTurn = game.currentTurnGroupId === session.groupId && !effectiveIsHost; // Host kann nicht spielen
    const isHostSession = effectiveIsHost;
    const canControlMedia = isActiveTurn || isHostSession;
    // Volle Medien-Kontrolle (Player + Play/Pause): normal nur Host, spielleitungslos die aktive Gruppe.
    const showFullMedia = effectiveIsHost || (game.hostless === true && isActiveTurn);

    // ── Spielleitungsloser Modus: "Spiel jetzt beenden?"-Abstimmung ──────────
    const handleStartEndGameVote = async () => {
      if (!session || isProcessing) return;
      setIsProcessing(true);
      try {
        await startEndGameVote(pin, session.groupId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Starten der Abstimmung');
      } finally {
        setIsProcessing(false);
      }
    };

    const handleCastEndGameVote = async (voteToEnd: boolean) => {
      if (!session || isProcessing) return;
      setIsProcessing(true);
      try {
        await castEndGameVote(pin, session.groupId, voteToEnd);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler bei der Abstimmung');
      } finally {
        setIsProcessing(false);
      }
    };

    const renderEndGameVotePanel = () => {
      if (!game.hostless) return null;
      const vote = game.endGameVote;
      if (!vote) {
        return (
          <button
            onClick={handleStartEndGameVote}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-red-400 text-red-600 font-semibold text-sm hover:bg-red-500/10 disabled:opacity-50"
          >
            🗳️ Abstimmung: Spiel beenden starten
          </button>
        );
      }
      const playingGroups = groupList; // schließt Host bereits aus
      const votes = vote.votes ?? {};
      const yesVotes = Object.values(votes).filter(v => v === true).length;
      const votedCount = Object.keys(votes).length;
      const myVote = session ? votes[session.groupId] : undefined;
      const initiatorName = game.groups[vote.initiatedBy]?.name ?? 'Eine Gruppe';
      return (
        <div className="card-surface rounded-2xl p-4 space-y-3 border-2 border-red-400/60 bg-red-500/5">
          <p className="text-sm font-semibold text-center text-red-700">
            🗳️ {initiatorName} möchte das Spiel beenden
          </p>
          <p className="text-xs text-center text-ink/60">
            {yesVotes}/{playingGroups.length} für Beenden ({votedCount}/{playingGroups.length} abgestimmt) — mehr als die Hälfte entscheidet
          </p>
          {myVote !== undefined ? (
            <p className="text-center text-sm text-ink/60">✅ Ihr habt abgestimmt: {myVote ? 'Beenden' : 'Weiterspielen'}. Warte auf die anderen…</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCastEndGameVote(true)}
                disabled={isProcessing}
                className="px-2 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Spiel beenden
              </button>
              <button
                onClick={() => handleCastEndGameVote(false)}
                disabled={isProcessing}
                className="px-2 py-2.5 bg-ink/10 text-ink rounded-xl font-bold text-sm hover:bg-ink/20 disabled:opacity-50"
              >
                Weiterspielen
              </button>
            </div>
          )}
        </div>
      );
    };

    // ──────────────────────────────────────────────────
    // TRIVIA MODUS — Guard ohne currentCard damit Host nie "durchfällt"
    // ──────────────────────────────────────────────────
    if (game.mode === 'trivia') {
      // Karte nicht gefunden → Host kann überbrücken, Clients warten
      if (!currentCard) {
        return (
          <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-display">Trivia Multiplayer</h1>
              <div className="card-surface rounded-2xl p-6">
                <p className="text-lg text-ink/70">Nächste Frage wird geladen…</p>
                {effectiveIsHost && (
                  <button
                    onClick={async () => { try { await skipCard(pin); } catch(e) { console.error(e); } }}
                    className="mt-4 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    ⏭ Frage überspringen
                  </button>
                )}
              </div>
            </div>
          </main>
        );
      }
      const activeGroup = game.currentTurnGroupId ? game.groups[game.currentTurnGroupId] : null;
      const isMyTurn = game.currentTurnGroupId === session.groupId && !effectiveIsHost;

      const categoryLabel = catLabelMeta(currentCard.category);
      const categoryIcon = catIcon(currentCard.category);

      const handleTriviaAnswer = async (correct: boolean) => {
        if (!session || !game || isProcessing) return;
        setIsProcessing(true);
        setShowTriviaAnswer(false);
        try {
          await submitTriviaAnswer(pin, correct);
        } catch (err) {
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      };

      // ── Spielleitungsloser Modus: Textantwort einreichen / abstimmen ──────────
      const handleSubmitTextAnswer = async () => {
        if (!session || !game || isProcessing || !textAnswerInput.trim()) return;
        setIsProcessing(true);
        try {
          await submitTextAnswer(pin, session.groupId, textAnswerInput.trim());
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Fehler beim Einreichen der Antwort');
        } finally {
          setIsProcessing(false);
        }
      };

      const handleCastVote = async (vote: boolean) => {
        if (!session || !game || isProcessing) return;
        setIsProcessing(true);
        try {
          await castAnswerVote(pin, session.groupId, vote);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Fehler bei der Abstimmung');
        } finally {
          setIsProcessing(false);
        }
      };

      // Score-Editing + Spiel beenden — Admin-Panel des (leichten) Spielleiters,
      // in beiden Modi (mit/ohne Spielleitung) identisch verfügbar.
      const renderAdminSettingsPanel = () => (
        <details className="border-t border-ink/10 pt-4">
          <summary className="cursor-pointer text-sm text-ink/60 select-none">⚙️ Weitere Einstellungen</summary>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {groupList.map(group => (
                <div key={group.id}>
                  {editingGroupId === group.id ? (
                    <div className="flex gap-1">
                      <input type="number" value={editingScore ?? group.score}
                        onChange={e => setEditingScore(Number(e.target.value))}
                        className="w-16 rounded border border-ink/30 px-2 py-1 text-sm"
                      />
                      <button onClick={async () => {
                        if (editingScore !== null && session) {
                          await editGroupScore(pin, session.groupId, group.id, editingScore);
                        }
                        setEditingGroupId(null);
                      }} className="text-green-600 font-bold px-1">✓</button>
                      <button onClick={() => setEditingGroupId(null)} className="text-red-600 font-bold px-1">✗</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingGroupId(group.id); setEditingScore(group.score); }}
                      className="w-full px-2 py-1 rounded border-2 border-ink/20 hover:border-ink/60 text-left text-xs">
                      {group.name}: {group.score}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleEndGame}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
              Spiel beenden
            </button>
          </div>
        </details>
      );

      // Cue für Trivia anpassen: Outline immer nur Land-Frage, kein Jahr
      const triviaDisplayCue = (card: typeof currentCard) => {
        if (!card) return '';
        if (card.category === 'outline') return 'Zu welchem Land gehört dieser Umriss?';
        if (card.category === 'flag') return 'Zu welchem Land gehört diese Flagge?';
        if (card.category === 'music') return 'Von wem ist der Song und wie heißt er?';
        if (card.category === 'quote') return 'Woher stammt das nachfolgende Zitat (Filme, Lieder, Personen)?';
        return card.cue;
      };

      const triviaCategories: string[] = Array.isArray(game.triviaCategories)
        ? game.triviaCategories
        : Object.values(game.triviaCategories ?? {});

      const catLabel = (cat: string) => catShortLabel(cat);

      // ── Neue-Frage-Joker: Vollbild-Notification für alle, 5 Sek. Auto-Timer ──
      if (game.jokersEnabled && game.jokerNotification?.type === 'newQuestion') {
        const byGroup = game.groups[game.jokerNotification.byGroupId ?? ''];
        const newCatLabel = catLabelMeta(currentCard?.category ?? '');
        return (
          <main className="relative mx-auto max-w-sm sm:max-w-md px-4 py-6 sm:py-10 flex flex-col items-center justify-center">
            <div className="w-full card-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col items-center gap-3 sm:gap-4 border-4 border-amber-400 bg-amber-500/10">
              {/* Titel */}
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest font-bold text-ink/40">🔄 Joker Neue Frage</p>
                <p className="text-lg sm:text-xl font-bold">
                  <span style={{ color: byGroup?.color ?? undefined }}>{byGroup?.name ?? '?'}</span>
                  {' '}tauscht die Frage!
                </p>
              </div>

              {/* Großes Emoji */}
              <div className="text-5xl sm:text-6xl leading-none select-none">🔄</div>

              {/* Details */}
              <div className="w-full space-y-2">
                <div className="rounded-xl bg-ink/5 border border-ink/10 px-4 py-2 text-center">
                  <p className="text-xs text-ink/50 uppercase tracking-wide mb-0.5">Neue Kategorie</p>
                  <p className="text-base font-bold">{catIcon(currentCard?.category ?? '')} {newCatLabel}</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-400 px-3 py-2 text-xs text-center">
                  <p className="text-amber-800">Die aktuelle Frage wurde gegen eine neue Frage gleicher Kategorie getauscht.</p>
                </div>
              </div>

              {/* Auto-Timer */}
              <div className="flex flex-col items-center gap-1">
                <div className={`text-3xl sm:text-4xl font-black tabular-nums ${jokerNotifCountdown <= 2 ? 'text-amber-600 animate-pulse' : 'text-amber-500'}`}>
                  {jokerNotifCountdown}
                </div>
                <p className="text-xs text-ink/40">Weiter in {jokerNotifCountdown} Sek…</p>
                {effectiveIsHost && (
                  <button
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true);
                      try { await dismissJokerNotification(pin); } catch (e) { console.error(e); } finally { setIsProcessing(false); }
                    }}
                    className="mt-1 px-5 py-1.5 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    ⏩ Überspringen
                  </button>
                )}
              </div>
            </div>
          </main>
        );
      }

      // ── NEXT-Joker: Vollbild-Notification für alle, 5 Sek. Auto-Timer ──
      if (game.jokersEnabled && game.jokerNotification?.type === 'next') {
        const originGroup = game.groups[game.jokerNotification.byGroupId ?? ''];
        const targetGroup = game.groups[game.jokerNotification.targetGroupId ?? ''];
        return (
          <main className="relative mx-auto max-w-sm sm:max-w-md px-4 py-6 sm:py-10 flex flex-col items-center justify-center">
            <div className="w-full card-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col items-center gap-3 sm:gap-4 border-4 border-orange-400 bg-orange-500/10">
              {/* Titel */}
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest font-bold text-ink/40">⚡ Joker NEXT</p>
                <p className="text-lg sm:text-xl font-bold">
                  <span style={{ color: originGroup?.color ?? undefined }}>{originGroup?.name ?? '?'}</span>
                  {' '}gibt die Frage weiter!
                </p>
              </div>

              {/* Großes Emoji */}
              <div className="text-5xl sm:text-6xl leading-none select-none">➡️</div>

              {/* Details */}
              <div className="w-full space-y-2">
                <div className="rounded-xl bg-ink/5 border border-ink/10 px-4 py-2 text-center">
                  <p className="text-xs text-ink/50 uppercase tracking-wide mb-0.5">Frage geht an</p>
                  <p className="text-lg font-black" style={{ color: targetGroup?.color ?? undefined }}>
                    {targetGroup?.name ?? '?'}
                  </p>
                </div>
              </div>

              {/* Regel-Hinweis */}
              <div className="rounded-xl bg-orange-500/10 border border-orange-400 px-3 py-2 text-xs space-y-1 text-center w-full">
                <p className="font-semibold text-orange-800">Wie geht es weiter?</p>
                <p className="text-orange-700">
                  <span className="font-bold" style={{ color: targetGroup?.color ?? undefined }}>{targetGroup?.name ?? '?'}</span> beantwortet jetzt die Frage.
                </p>
                <p className="text-orange-700">Richtig → niemand bekommt einen Punkt.</p>
                <p className="text-orange-700">Falsch → <span className="font-bold" style={{ color: originGroup?.color ?? undefined }}>{originGroup?.name ?? '?'}</span> bekommt Punkt + Kategorie.</p>
              </div>

              {/* Auto-Timer */}
              <div className="flex flex-col items-center gap-1">
                <div className={`text-3xl sm:text-4xl font-black tabular-nums ${jokerNotifCountdown <= 2 ? 'text-orange-600 animate-pulse' : 'text-orange-400'}`}>
                  {jokerNotifCountdown}
                </div>
                <p className="text-xs text-ink/40">Weiter in {jokerNotifCountdown} Sek…</p>
                {effectiveIsHost && (
                  <button
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true);
                      try { await dismissJokerNotification(pin); } catch (e) { console.error(e); } finally { setIsProcessing(false); }
                    }}
                    className="mt-1 px-5 py-1.5 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    ⏩ Überspringen
                  </button>
                )}
              </div>
            </div>
          </main>
        );
      }

      // ── Steal-Joker: Vollbild-Notification für alle, 5 Sek. Auto-Timer ──
      if (game.jokersEnabled && game.jokerNotification?.type === 'steal') {
        const stealerGroup = game.groups[game.jokerNotification.byGroupId ?? ''];
        const stolenFromGroup = game.groups[game.jokerNotification.fromGroupId ?? ''];
        const currentCatLabel = catLabelMeta(currentCard?.category ?? '');
        return (
          <main className="relative mx-auto max-w-sm sm:max-w-md px-4 py-6 sm:py-10 flex flex-col items-center justify-center">
            <div className="w-full card-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col items-center gap-3 sm:gap-4 border-4 border-purple-500 bg-purple-500/10">
              {/* Titel */}
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest font-bold text-ink/40">🥷 Joker STEAL</p>
                <p className="text-lg sm:text-xl font-bold">
                  <span style={{ color: stealerGroup?.color ?? undefined }}>{stealerGroup?.name ?? '?'}</span>
                  {' '}hat eine Frage geklaut!
                </p>
              </div>

              {/* Großes Emoji */}
              <div className="text-5xl sm:text-6xl leading-none select-none">🥷</div>

              {/* Details */}
              <div className="w-full space-y-2">
                <div className="rounded-xl bg-ink/5 border border-ink/10 px-4 py-2 text-center">
                  <p className="text-xs text-ink/50 uppercase tracking-wide mb-0.5">Gestohlene Frage von</p>
                  <p className="text-lg font-black" style={{ color: stolenFromGroup?.color ?? undefined }}>
                    {stolenFromGroup?.name ?? '?'}
                  </p>
                </div>
                <div className="rounded-xl bg-ink/5 border border-ink/10 px-4 py-2 text-center">
                  <p className="text-xs text-ink/50 uppercase tracking-wide mb-0.5">Kategorie</p>
                  <p className="text-base font-bold">{catIcon(currentCard?.category ?? '')} {currentCatLabel}</p>
                </div>
              </div>

              {/* Regel-Hinweis */}
              <div className="rounded-xl bg-purple-500/10 border border-purple-400 px-3 py-2 text-xs space-y-1 text-center w-full">
                <p className="font-semibold text-purple-800">Wie geht es weiter?</p>
                <p className="text-purple-700">
                  <span className="font-bold" style={{ color: stealerGroup?.color ?? undefined }}>{stealerGroup?.name ?? '?'}</span> beantwortet jetzt die Frage.
                </p>
                <p className="text-purple-700">Richtig → <span className="font-bold" style={{ color: stealerGroup?.color ?? undefined }}>{stealerGroup?.name ?? '?'}</span> bekommt Punkt + Kategorie.</p>
                <p className="text-purple-700">Falsch → <span className="font-bold" style={{ color: stolenFromGroup?.color ?? undefined }}>{stolenFromGroup?.name ?? '?'}</span> bekommt Punkt + Kategorie.</p>
              </div>

              {/* Auto-Timer */}
              <div className="flex flex-col items-center gap-1">
                <div className={`text-3xl sm:text-4xl font-black tabular-nums ${jokerNotifCountdown <= 2 ? 'text-purple-600 animate-pulse' : 'text-purple-400'}`}>
                  {jokerNotifCountdown}
                </div>
                <p className="text-xs text-ink/40">Weiter in {jokerNotifCountdown} Sek…</p>
                {effectiveIsHost && (
                  <button
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true);
                      try { await dismissJokerNotification(pin); } catch (e) { console.error(e); } finally { setIsProcessing(false); }
                    }}
                    className="mt-1 px-5 py-1.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    ⏩ Überspringen
                  </button>
                )}
              </div>
            </div>
          </main>
        );
      }

      // ── Würfel-Joker: Vollbild-Screen für alle, bis Spielleiter bestätigt ──
      if (game.jokersEnabled && game.jokerDicePending && game.jokerDiceResult != null) {
        const diceGroup = game.groups[game.jokerDiceGroupId ?? ''];
        const roll = game.jokerDiceResult!;
        const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const isJackpot = roll >= 5;
        const isBad = roll === 1;
        const rollMsg = isJackpot
          ? '🎉 Jackpot! +1 Punkt und aktuelle Kategorie kassiert.'
          : isBad
          ? '💀 Pech! 1 Punkt verloren und eine Kategorie eingebußt.'
          : `Kein Effekt – ${diceGroup?.name ?? '?'} bleibt beim aktuellen Spielstand.`;
        const borderColor = isJackpot ? 'border-green-500' : isBad ? 'border-red-500' : 'border-amber-400';
        const bgGlow = isJackpot ? 'bg-green-500/10' : isBad ? 'bg-red-500/10' : 'bg-amber-500/10';
        const textColor = isJackpot ? 'text-green-700' : isBad ? 'text-red-700' : 'text-amber-800';

        return (
          <main className="relative mx-auto max-w-sm sm:max-w-md px-4 py-6 sm:py-10 flex flex-col items-center justify-center">
            <div className={`w-full card-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col items-center gap-3 sm:gap-4 border-4 ${borderColor} ${bgGlow}`}>
              {/* Gruppe */}
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest font-bold text-ink/40">🎲 Würfel-Joker</p>
                <p className="text-lg sm:text-xl font-bold">
                  <span style={{ color: diceGroup?.color ?? undefined }}>{diceGroup?.name ?? '?'}</span>
                  {' '}hat gewürfelt!
                </p>
              </div>

              {/* Würfelsymbol + Animation */}
              <div className={`text-6xl sm:text-7xl leading-none select-none transition-transform duration-75 ${diceAnimating ? 'animate-bounce scale-110' : 'scale-100'}`}>
                {diceEmojis[diceAnimating ? diceDisplayFace : roll] ?? '🎲'}
              </div>

              {/* Ergebnis */}
              {!diceAnimating && (
                <>
                  <div className="text-center space-y-1">
                    <p className={`text-4xl sm:text-5xl font-black ${textColor}`}>{roll}</p>
                    <p className={`text-sm sm:text-base font-semibold ${textColor}`}>{rollMsg}</p>
                  </div>

                  {/* Neuer Punktestand für die Gruppe */}
                  <div className="rounded-xl bg-ink/5 border border-ink/10 px-5 py-2 text-center">
                    <p className="text-xs text-ink/50 uppercase tracking-wide mb-0.5">Punktestand {diceGroup?.name ?? '?'}</p>
                    <p className="text-2xl font-black">{diceGroup?.score ?? 0} <span className="text-sm font-normal text-ink/50">Pkt.</span></p>
                  </div>

                  {/* Auto-Timer */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`text-3xl sm:text-4xl font-black tabular-nums ${jokerNotifCountdown <= 2 ? 'text-amber-600 animate-pulse' : 'text-amber-500'}`}>
                      {jokerNotifCountdown}
                    </div>
                    <p className="text-xs text-ink/40">Weiter in {jokerNotifCountdown} Sek…</p>
                  </div>

                  {effectiveIsHost ? (
                    <button
                      disabled={isProcessing}
                      onClick={async () => {
                        setIsProcessing(true);
                        try { await confirmJokerDice(pin); } catch (e) { console.error(e); } finally { setIsProcessing(false); }
                      }}
                      className="w-full max-w-xs px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg"
                    >
                      ⏩ Überspringen
                    </button>
                  ) : (
                    <p className="text-sm text-ink/50 italic">{game.hostless ? 'Weiter in Kürze…' : 'Warte auf die Spielleitung…'}</p>
                  )}
                </>
              )}
            </div>
          </main>
        );
      }

      return (
        <main className="relative mx-auto max-w-4xl lg:max-w-6xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            {activeGroup && (
              isActiveTurn ? (
                <div className="mt-3 w-full px-4 py-3 rounded-xl bg-green-500 text-white font-bold text-xl animate-pulse shadow-lg shadow-green-500/30">
                  ⚡ Eure Gruppe ist am Zug!
                </div>
              ) : (
                <div className="mt-3 w-full px-4 py-3 rounded-xl bg-ink/15">
                  <div className="flex flex-wrap items-center justify-center gap-1 text-sm font-semibold">
                    {groupList.map((g, i) => (
                      <span key={g.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-ink/40 text-xs">→</span>}
                        <span
                          className="px-2 py-0.5 rounded-lg"
                          style={g.id === game.currentTurnGroupId
                            ? { backgroundColor: g.color, color: '#000', fontWeight: 700 }
                            : { color: 'var(--ink)', opacity: 0.6 }}
                        >
                          {g.id === game.currentTurnGroupId ? '🎮 ' : ''}{g.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Scoreboard mit Kategorien-Fortschritt */}
          <details className="card-surface rounded-2xl group">
            <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between select-none">
              <span className="font-semibold">🏆 Scoreboard</span>
              <span className="text-ink/50 text-sm transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
            {groupList.map(g => {
              const completed: string[] = Array.isArray(g.completedCategories)
                ? g.completedCategories
                : Object.values(g.completedCategories ?? {}) as string[];
              const isActive = g.id === game.currentTurnGroupId;
              const winCondition = game.triviaWinCondition ?? 'categories';
              return (
                <div key={g.id}
                  className={`rounded-xl p-3 ${isActive ? 'ring-2 ring-ink' : ''}`}
                  style={{ backgroundColor: `${g.color}20` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{g.name} {isActive ? '🎮' : ''}</span>
                    {winCondition === 'categories'
                      ? <span className="font-semibold text-sm">{g.score} Pkt. · {completed.length}/{triviaCategories.length} Kat.</span>
                      : <span className="font-bold text-base">{g.score} Pkt.</span>
                    }
                  </div>
                  {winCondition === 'categories' && triviaCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {triviaCategories.map(cat => (
                        <span key={cat}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            completed.includes(cat)
                              ? 'bg-green-500 text-white'
                              : 'bg-ink/10 text-ink/50'
                          }`}
                        >
                          {catIcon(cat)} {catShortLabel(cat)}{completed.includes(cat) ? ' ✓' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {game.jokersEnabled && !g.isHost && g.jokers && (
                    <div className="flex gap-1 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${g.jokers.newQuestion ? 'bg-amber-200 text-amber-700' : 'bg-ink/10 text-ink/30 line-through'}`}>🔄</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${g.jokers.next ? 'bg-amber-200 text-amber-700' : 'bg-ink/10 text-ink/30 line-through'}`}>➡️</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${g.jokers.dice ? 'bg-amber-200 text-amber-700' : 'bg-ink/10 text-ink/30 line-through'}`}>🎲</span>
                      {/* Steal-Badge nur sichtbar wenn Gruppe nicht die aktive Gruppe ist */}
                      {g.id !== game.currentTurnGroupId && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${g.jokers.steal ? 'bg-purple-200 text-purple-700' : 'bg-ink/10 text-ink/30 line-through'}`}>🥷</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </details>

          {renderEndGameVotePanel()}

          {/* ── Finale-Runde-Banner ── */}
          {game.triviaFinalRound && (() => {
            const pending: string[] = Array.isArray(game.triviaFinalRoundPending)
              ? game.triviaFinalRoundPending
              : Object.values(game.triviaFinalRoundPending ?? {}) as string[];
            const pendingNames = pending.map(gid => game.groups[gid]?.name).filter(Boolean);
            return (
              <div className="rounded-2xl border-2 border-orange-400 bg-orange-100/10 px-4 py-3 space-y-1">
                <p className="font-bold text-orange-600">⏳ Finaler Zug läuft</p>
                <p className="text-sm text-ink/70">
                  Eine Gruppe hat alle Kategorien gesammelt.
                  {pendingNames.length > 0
                    ? ` Noch am Zug: ${pendingNames.join(', ')}`
                    : ' Alle Gruppen haben gespielt — Auswertung folgt.'}
                </p>
              </div>
            );
          })()}

          {/* ── Stechen-Banner ── */}
          {game.triviaTiebreakerActive && (() => {
            const ids: string[] = Array.isArray(game.triviaTiebreakerGroupIds)
              ? game.triviaTiebreakerGroupIds
              : Object.values(game.triviaTiebreakerGroupIds ?? {}) as string[];
            const names = ids.map(gid => game.groups[gid]?.name).filter(Boolean);
            return (
              <div className="rounded-2xl border-2 border-yellow-400 bg-yellow-100/10 px-4 py-3 space-y-1">
                <p className="font-bold text-yellow-600">🏆 Stechen — Schätzfragen-Finale</p>
                <p className="text-sm text-ink/70">
                  Gleichstand in Kategorien und Punkten! Das Stechen entscheidet: <strong>{names.join(' vs. ')}</strong>
                </p>
              </div>
            );
          })()}

          {/* ── SCHÄTZFRAGE: alle Gruppen antworten gleichzeitig ── */}
          {currentCard.category === 'schaetzfragen' ? (() => {
            const isTiebreaker = game.triviaTiebreakerActive === true;
            const tiebreakerIds: string[] = isTiebreaker
              ? (Array.isArray(game.triviaTiebreakerGroupIds)
                  ? game.triviaTiebreakerGroupIds
                  : Object.values(game.triviaTiebreakerGroupIds ?? {}) as string[])
              : [];
            const playingGroups = groupList.filter(g => !g.isHost && (!isTiebreaker || tiebreakerIds.includes(g.id)));
            const isSpectatorInTiebreaker = isTiebreaker && !effectiveIsHost && !tiebreakerIds.includes(session.groupId);
            const unit = extractUnitFromAnswer(currentCard.answer);
            const correctRange = extractRangeFromAnswer(currentCard.answer);
            const correctNum = correctRange ? null : extractNumericFromAnswer(currentCard.answer);
            // Abstandsfunktion: bei Bereichs-Antwort = Abstand zur nächsten Grenze
            const distToCorrect = (val: number) =>
              correctRange
                ? (val >= correctRange.low && val <= correctRange.high
                    ? 0
                    : Math.min(Math.abs(val - correctRange.low), Math.abs(val - correctRange.high)))
                : Math.abs(val - (correctNum ?? NaN));
            const allSubmitted = playingGroups.every(g => g.schaetzSubmission != null && g.schaetzSubmission !== '');
            const submittedCount = playingGroups.filter(g => g.schaetzSubmission != null && g.schaetzSubmission !== '').length;

            // Schätzung einreichen (Spieler)
            const handleSchaetzSubmit = async () => {
              if (!schaetzInput.trim() || schaetzSubmitted || isProcessing) return;
              setIsProcessing(true);
              try {
                await submitSchaetzGuess(pin, session.groupId, schaetzInput.trim());
                setSchaetzSubmitted(true);
              } catch (err) { console.error(err); }
              finally { setIsProcessing(false); }
            };

            // Auswertung (Host): erst Ergebnis anzeigen, dann Weiter-Button löst echte Auswertung aus
            const handleSchaetzEvaluation = async () => {
              if (isProcessing) return;
              const withSubmissions = playingGroups
                .filter(g => g.schaetzSubmission != null && g.schaetzSubmission !== '')
                .map(g => ({
                  id: g.id,
                  name: g.name,
                  color: g.color,
                  val: parseGermanNumber(g.schaetzSubmission ?? ''),
                  raw: g.schaetzSubmission ?? '',
                }))
                .filter(s => isFinite(s.val));
              if (withSubmissions.length === 0) return;
              const distances = withSubmissions.map(s => distToCorrect(s.val));
              if (distances.some(d => isNaN(d))) {
                console.warn('Schätzfrage: Korrekte Antwort konnte nicht geparst werden', currentCard.answer);
                return;
              }
              const minDist = Math.min(...distances);
              const EPS = 0.001;
              const winners = withSubmissions.filter((s, i) => Math.abs(distances[i] - minDist) < EPS);
              setIsProcessing(true);
              try {
                // Pre-calculate joker restores so they can be shown on the result screen
                const jokerKeysList = ['newQuestion', 'next', 'dice', 'steal'] as const;
                const jokerLabel: Record<string, string> = { newQuestion: 'Neue Frage', next: 'NEXT', dice: 'Würfel', steal: '🥷 Steal' };
                const jokerRestores: { groupId: string; groupName: string; jokerKey: 'newQuestion' | 'next' | 'dice' | 'steal' }[] = [];
                if (game.jokersEnabled) {
                  for (const w of winners) {
                    const groupJokers = game.groups[w.id]?.jokers;
                    if (groupJokers) {
                      const used = jokerKeysList.filter(k => groupJokers[k] === false);
                      if (used.length > 0) {
                        const restored = used[Math.floor(Math.random() * used.length)];
                        jokerRestores.push({ groupId: w.id, groupName: w.name, jokerKey: restored });
                      }
                    }
                  }
                }
                await showSchaetzResult(pin, {
                  answer: currentCard.answer,
                  winnerIds: winners.map(w => w.id),
                  submissions: withSubmissions.map((s, i) => ({
                    groupId: s.id,
                    groupName: s.name,
                    value: `${s.raw}${unit ? ` ${unit}` : ''}`,
                    isWinner: Math.abs(distances[i] - minDist) < EPS,
                    color: s.color,
                  })),
                  jokerRestores,
                });
              } catch (err) { console.error(err); }
              finally { setIsProcessing(false); }
            };

            const handleSchaetzWeiter = async () => {
              if (isProcessing) return;
              if (!game.schaetzResult) return;
              const winnerIds = game.schaetzResult.winnerIds;
              setIsProcessing(true);
              try { await evaluateSchaetzfrage(pin, winnerIds); }
              catch (err) { console.error(err); }
              finally { setIsProcessing(false); }
            };

            return (
              <>
                {/* Schätzfrage-Ergebnis: für alle sichtbar wenn Auswertung läuft */}
                {game.schaetzResult && (() => {
                  const res = game.schaetzResult!;
                  const winnerNames = res.winnerIds
                    .map(id => game.groups[id]?.name ?? id)
                    .filter(Boolean);
                  return (
                    <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-yellow-400">
                      <h3 className="text-xl font-bold text-center">{isTiebreaker ? '🏆 Stechen — Schätzfragen-Finale' : '🏆 Auswertung Schätzfrage'}</h3>

                      {/* Korrekte Antwort */}
                      <div className="rounded-xl bg-yellow-100/20 border border-yellow-400 px-4 py-3">
                        <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Korrekte Antwort</p>
                        <p className="text-xl font-bold">{res.answer}</p>
                      </div>

                      {/* Gewinner */}
                      <div className={`rounded-xl px-4 py-3 ${
                        winnerNames.length > 1 ? 'bg-blue-500/20 border border-blue-400' : 'bg-green-500/20 border border-green-500'
                      }`}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1 ${
                          winnerNames.length > 1 ? 'text-blue-700' : 'text-green-700'
                        }">{winnerNames.length > 1 ? '🤝 Gleichstand — Punkt geteilt' : '🏆 Gewinner'}</p>
                        <p className="text-lg font-bold">{winnerNames.join(', ')}</p>
                      </div>

                      {/* Alle Schätzungen */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-ink/60">Übersicht aller Schätzungen:</p>
                        {res.submissions.map(s => (
                          <div key={s.groupId} className={`flex items-center justify-between rounded-lg px-4 py-2 border-2 ${
                            s.isWinner ? 'border-yellow-400 bg-yellow-100/20' : 'border-transparent'
                          }`} style={{ backgroundColor: s.isWinner ? undefined : `${s.color}18` }}>
                            <span className="font-semibold flex items-center gap-2">
                              {s.isWinner && <span>🏆</span>}
                              {s.groupName}
                            </span>
                            <span className="font-mono font-bold">{s.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Joker-Restore */}
                      {res.jokerRestores && res.jokerRestores.length > 0 && (() => {
                        const jokerLabel: Record<string, string> = { newQuestion: '🔄 Neue Frage', next: '⚡ NEXT', dice: '🎲 Würfel', steal: '🥷 Steal' };
                        return (
                          <div className="rounded-xl bg-amber-500/10 border border-amber-400 px-4 py-3 space-y-1">
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">🃏 Joker wiederhergestellt</p>
                            {res.jokerRestores.map(r => (
                              <p key={r.groupId} className="text-sm font-semibold">
                                <span className="font-bold">{r.groupName}</span> erhält Joker <span className="font-bold">{jokerLabel[r.jokerKey] ?? r.jokerKey}</span> zurück
                              </p>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Weiter-Button nur für Host */}
                      {effectiveIsHost && (
                        <button
                          onClick={handleSchaetzWeiter}
                          disabled={isProcessing}
                          className={`w-full py-4 rounded-xl text-white font-bold text-lg disabled:opacity-50 ${isTiebreaker ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                          {isProcessing ? '⏳ Weiter…' : isTiebreaker ? '🏆 Stechen auswerten — Gewinner küren' : '▶️ Weiter — nächste Frage'}
                        </button>
                      )}
                      {!effectiveIsHost && !game.hostless && (
                        <p className="text-center text-sm text-ink/60 animate-pulse">Warte auf Spielleiter…</p>
                      )}
                      {game.hostless && (
                        <p className="text-center text-sm text-ink/60 animate-pulse">⏳ Automatische Auswertung läuft…</p>
                      )}
                    </div>
                  );
                })()}

                {/* Normale Anzeige nur wenn kein Ergebnis läuft */}
                {!game.schaetzResult && <>
                <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start space-y-3 lg:space-y-0">
                <div className="space-y-3">
                {/* Frage-Karte */}
                <div className="card-surface rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm px-3 py-1 rounded-full bg-ink/10 font-semibold">{categoryIcon} {categoryLabel}</span>
                    {timeLeft !== null && (
                      <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-500/20 text-red-600 animate-pulse' : 'bg-ink/10'}`}>
                        ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-semibold">{triviaDisplayCue(currentCard)}</p>

                  {/* Spieler-Eingabe */}
                  {!effectiveIsHost && (() => {
                    // Spektator beim Stechen
                    if (isSpectatorInTiebreaker) {
                      return (
                        <div className="rounded-xl bg-ink/10 border border-ink/20 px-4 py-4 text-center space-y-1">
                          <p className="font-semibold">👀 Du schaust zu</p>
                          <p className="text-sm text-ink/60">Beim Stechen spielen nur die punktgleichen Gruppen. Deine Gruppe ist bereits ausgeschieden.</p>
                        </div>
                      );
                    }
                    const mySubmission = currentGroup?.schaetzSubmission;
                    if (mySubmission) {
                      return (
                        <div className="rounded-xl bg-green-500/10 border-2 border-green-500 px-4 py-3 space-y-1">
                          <p className="text-green-700 font-bold">✅ Eingereicht: <span className="font-mono">{mySubmission}{unit ? ` ${unit}` : ''}</span></p>
                          <p className="text-sm text-ink/60">Warte bis alle Gruppen geantwortet haben…</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-ink/70">Deine Schätzung{unit ? ` (in ${unit})` : ''}:</p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={schaetzInput}
                            onChange={e => setSchaetzInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSchaetzSubmit()}
                            placeholder={unit ? `Zahl in ${unit}` : 'Zahl eingeben'}
                            className="flex-1 rounded-xl border-2 border-ink/20 px-4 py-3 text-lg font-semibold text-gray-900 focus:border-ink/60 outline-none"
                          />
                          {unit && <span className="self-center text-ink/60 font-semibold">{unit}</span>}
                        </div>
                        <button
                          onClick={handleSchaetzSubmit}
                          disabled={!schaetzInput.trim() || isProcessing}
                          className="w-full py-3 rounded-xl bg-ink text-inkDark font-bold text-lg hover:opacity-90 disabled:opacity-40"
                        >
                          📤 Schätzung einreichen
                        </button>
                      </div>
                    );
                  })()}
                </div>
                </div>

                <div className="space-y-3">
                {/* Host: Übersicht + Auswertung */}
                {effectiveIsHost && (
                  <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30">
                    <h3 className="text-lg font-semibold text-green-700">
                      {isTiebreaker ? '👑 Spielleitung — Stechen' : '👑 Spielleitung — Schätzfrage'}
                    </h3>
                    <p className="text-sm text-ink/60">{submittedCount}/{playingGroups.length} Gruppen haben geantwortet</p>

                    {/* Eingaben der Gruppen – nur Status, keine Live-Werte */}
                    <div className="space-y-2">
                      {playingGroups.map(g => {
                        const hasSubmitted = g.schaetzSubmission != null && g.schaetzSubmission !== '';
                        return (
                          <div key={g.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: `${g.color}20` }}>
                            <span className="font-semibold">{g.name}</span>
                            {hasSubmitted
                              ? <span className="text-green-600 font-semibold">✅ Eingereicht</span>
                              : <span className="text-ink/40 italic text-sm">Noch nicht eingereicht</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Korrekte Antwort */}
                    <button onClick={() => setShowTriviaAnswer(v => !v)}
                      className={`w-full px-4 py-3 rounded-xl font-bold text-lg transition-colors ${
                        showTriviaAnswer
                          ? 'bg-sky-900 text-sky-200 hover:bg-sky-800'
                          : 'bg-sky-700 text-white hover:bg-sky-600'
                      }`}>
                      {showTriviaAnswer ? '🙈 Antwort verbergen' : '👁 Korrekte Antwort anzeigen'}
                    </button>
                    {showTriviaAnswer && (
                      <div className="rounded-xl bg-yellow-100/20 border-2 border-yellow-400 px-4 py-3">
                        <p className="text-sm font-semibold text-yellow-700 mb-1">Korrekte Antwort:</p>
                        <p className="text-xl font-bold">{currentCard.answer}</p>
                      </div>
                    )}

                    {/* Auswertungs-Button */}
                    <button
                      onClick={handleSchaetzEvaluation}
                      disabled={isProcessing || submittedCount === 0}
                      className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? '⏳ Wird ausgewertet…' : `🏆 Auswertung Schätzfrage ${allSubmitted ? '' : `(${submittedCount}/${playingGroups.length})`}`}
                    </button>
                    <p className="text-xs text-ink/50 text-center">Die nahestliegende Schätzung gewinnt den Punkt</p>

                    {/* Weitere Einstellungen */}
                    <details className="border-t border-ink/10 pt-4">
                      <summary className="cursor-pointer text-sm text-ink/60 select-none">⚙️ Weitere Einstellungen</summary>
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {groupList.map(group => (
                            <div key={group.id}>
                              {editingGroupId === group.id ? (
                                <div className="flex gap-1">
                                  <input type="number" value={editingScore ?? group.score}
                                    onChange={e => setEditingScore(Number(e.target.value))}
                                    className="w-16 rounded border border-ink/30 px-2 py-1 text-sm" />
                                  <button onClick={async () => { if (editingScore !== null && session) await editGroupScore(pin, session.groupId, group.id, editingScore); setEditingGroupId(null); }} className="text-green-600 font-bold px-1">✓</button>
                                  <button onClick={() => setEditingGroupId(null)} className="text-red-600 font-bold px-1">✗</button>
                                </div>
                              ) : (
                                <button onClick={() => { setEditingGroupId(group.id); setEditingScore(group.score); }} className="w-full px-2 py-1 rounded border-2 border-ink/20 hover:border-ink/60 text-left text-xs">{group.name}: {group.score}</button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={handleEndGame} className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Spiel beenden</button>
                      </div>
                    </details>
                  </div>
                )}
                </div>
                </div>
              </>}
            </>
            );
          })() : (
          <>
          {/* ── STANDARD TRIVIA FRAGE ── */}
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start space-y-3 lg:space-y-0">
          <div className="space-y-3">
          {!isMyTurn && !effectiveIsHost && !game.hostless && (
            <div className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm text-center">
              Gruppe {activeGroup?.name ?? 'dem aktiven Team'} ist am Zug – ihr seid nicht dran
            </div>
          )}
          <div className={`card-surface rounded-2xl p-6 space-y-4 transition-opacity duration-300 ${!isMyTurn && !effectiveIsHost && !game.hostless ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-full bg-ink/10 font-semibold">{categoryIcon} {categoryLabel}</span>
                {quoteSourceBadge(currentCard)}
              </div>
              {timeLeft !== null && (
                <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${
                  timeLeft <= 10 ? 'bg-red-500/20 text-red-600 animate-pulse' : 'bg-ink/10'
                }`}>
                  ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold">{triviaDisplayCue(currentCard)}</p>

            {/* Medien-Einbettung */}
            {currentCard.sources && (
              showFullMedia ? (
                <MediaEmbed
                  key={`trivia-host-media-${currentCard.id}`}
                  ref={mediaEmbedRef}
                  card={currentCard}
                  preference={currentCard.category === 'music' ? 'spotify' : 'youtube'}
                  concealMetadata={currentCard.category === 'music'}
                  onPlay={handleRemotePlay}
                  onPause={handleRemotePause}
                  onProgress={handleMediaProgress}
                />
              ) : currentCard.category === 'music' ? (
                <div className="rounded-2xl card-surface bg-ink/5 p-6 text-center space-y-3">
                  <div className="text-5xl">{game?.playbackControl?.action === 'play' && game.playbackControl.cardId === currentCard.id ? '🎵' : '🎵'}</div>
                  <div className="text-2xl font-mono font-bold text-green-600 tabular-nums">
                    {String(Math.floor(musicElapsed / 60)).padStart(2, '0')}:{String(musicElapsed % 60).padStart(2, '0')}
                    {musicDurationMs > 0 && (
                      <span className="text-ink/40 font-normal"> / {String(Math.floor(musicDurationMs / 60000)).padStart(2, '0')}:{String(Math.floor(musicDurationMs / 1000) % 60).padStart(2, '0')}</span>
                    )}
                  </div>
                  <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((musicElapsed / (musicDurationMs > 0 ? musicDurationMs / 1000 : 240)) * 100, 100)}%`,
                        background: game?.playbackControl?.action === 'play' && game.playbackControl.cardId === currentCard.id
                          ? '#22c55e'
                          : '#6b7280',
                      }}
                    />
                  </div>
                  <p className="text-xs text-ink/50">
                    {game?.playbackControl?.action === 'play' && game.playbackControl.cardId === currentCard.id
                      ? 'Musik läuft'
                      : 'Wartet auf Spielleiter…'}
                  </p>
                </div>
              ) : (
                <MediaEmbed card={currentCard} preference="youtube" />
              )
            )}

            {/* NEXT-Joker: Zielgruppe ist jetzt am Zug */}
            {isMyTurn && game.jokerNextActive && game.jokerNextTargetGroupId === session?.groupId ? (
              <div className="rounded-xl bg-orange-500/15 border-2 border-orange-500 px-4 py-3 space-y-1">
                <p className="text-orange-700 font-bold text-base">⚡ Joker NEXT aktiv – ihr seid dran!</p>
                <p className="text-sm text-orange-700">
                  {game.groups[game.jokerNextOriginGroupId ?? '']?.name ?? 'Eine Gruppe'} hat die Frage an euch weitergegeben.
                </p>
                <p className="text-sm text-orange-600">
                  Richtig → niemand bekommt einen Punkt. Falsch → {game.groups[game.jokerNextOriginGroupId ?? '']?.name ?? 'die andere Gruppe'} bekommt den Punkt.
                </p>
              </div>
            ) : null}

            {/* STEAL-Joker: Stealer ist jetzt am Zug */}
            {isMyTurn && game.jokerStealActive && game.jokerStealGroupId === session?.groupId ? (
              <div className="rounded-xl bg-purple-500/15 border-2 border-purple-500 px-4 py-3 space-y-1">
                <p className="text-purple-700 font-bold text-base">🥷 Joker STEAL aktiv – ihr habt geklaut!</p>
                <p className="text-sm text-purple-700">
                  Ihr habt die Frage von <span className="font-semibold">{game.groups[game.jokerStealFromGroupId ?? '']?.name ?? 'einer Gruppe'}</span> geklaut.
                </p>
                <p className="text-sm text-purple-600">
                  Richtig → ihr bekommt Punkt + Kategorie. Falsch → <span className="font-semibold">{game.groups[game.jokerStealFromGroupId ?? '']?.name ?? 'die andere Gruppe'}</span> bekommt Punkt + Kategorie.
                </p>
              </div>
            ) : null}

            {/* STEAL-Joker: Rückgabe-Zug für die bestohlen Gruppe */}
            {isMyTurn && game.jokerStealReturnActive && session && game.jokerStealFromGroupId !== session.groupId ? null : null}
            {isMyTurn && game.jokerStealReturnActive ? (
              <div className="rounded-xl bg-blue-500/15 border-2 border-blue-400 px-4 py-3 space-y-1">
                <p className="text-blue-700 font-bold text-base">🔄 Rückgabe-Zug – ihr seid nochmal dran!</p>
                <p className="text-sm text-blue-600">
                  Eure Frage wurde geklaut. Ihr erhaltet jetzt einen neuen Zug mit einer Ersatzfrage.
                </p>
              </div>
            ) : null}
            {effectiveIsHost && (
              <button
                onClick={async () => {
                  if (isProcessing) return;
                  setIsProcessing(true);
                  try { await skipCard(pin); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
                }}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-ink/10 text-ink rounded-xl font-semibold text-sm hover:bg-ink/20 disabled:opacity-50"
              >
                ⏭ Frage überspringen (gleiche Gruppe bleibt dran)
              </button>
            )}
          </div>
          </div>

          <div className="space-y-3">
          {/* Joker-Panel – nur für aktive Gruppe, nicht für Host, nicht wenn NEXT-Joker aktiv */}
          {game.jokersEnabled && isMyTurn && session && !game.jokerNextActive && (() => {
            const myJokers = game.groups[session.groupId]?.jokers;
            if (!myJokers) return null;
            const hasAnyJoker = myJokers.newQuestion || myJokers.next || myJokers.dice;
            return (
              <div className="card-surface rounded-2xl p-4 space-y-3 border-2 border-amber-400/40">
                <h3 className="text-sm font-bold text-amber-700">🃏 Joker</h3>
                <div className="grid grid-cols-3 gap-2">
                  {/* Joker 1: Neue Frage */}
                  <button
                    disabled={!myJokers.newQuestion || isProcessing}
                    title="Tauscht die aktuelle Frage gegen eine neue Frage aus derselben Kategorie."
                    onClick={async () => {
                      if (!myJokers.newQuestion || isProcessing) return;
                      setIsProcessing(true);
                      try { await activateJokerNewQuestion(pin, session.groupId); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors border-2 ${
                      myJokers.newQuestion
                        ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900'
                        : 'border-ink/10 bg-ink/5 opacity-40 cursor-not-allowed text-ink/40'
                    }`}
                  >
                    <span className="text-2xl">🔄</span>
                    <span className="text-xs font-semibold leading-tight">Neue Frage</span>
                    {myJokers.newQuestion
                      ? <span className="text-[10px] text-amber-700/70 leading-tight">Gleiche Kategorie</span>
                      : <span className="text-[10px] text-ink/40">Verbraucht</span>
                    }
                  </button>
                  {/* Joker 2: NEXT */}
                  <button
                    disabled={!myJokers.next || isProcessing}
                    title="Gibt die Frage an die nächste Gruppe weiter. Antwortet diese falsch, bekommt ihr den Punkt."
                    onClick={async () => {
                      if (!myJokers.next || isProcessing) return;
                      setIsProcessing(true);
                      try { await activateJokerNext(pin, session.groupId); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors border-2 ${
                      myJokers.next
                        ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900'
                        : 'border-ink/10 bg-ink/5 opacity-40 cursor-not-allowed text-ink/40'
                    }`}
                  >
                    <span className="text-2xl">➡️</span>
                    <span className="text-xs font-semibold leading-tight">NEXT</span>
                    {myJokers.next
                      ? <span className="text-[10px] text-amber-700/70 leading-tight">Frage weitergeben</span>
                      : <span className="text-[10px] text-ink/40">Verbraucht</span>
                    }
                  </button>
                  {/* Joker 3: Würfeln */}
                  <button
                    disabled={!myJokers.dice || isProcessing}
                    title="Würfle eine 6: Punkt + Kategorie kassieren. Eine 1: Punkt + Kategorie verlieren. 2–5: kein Effekt."
                    onClick={async () => {
                      if (!myJokers.dice || isProcessing) return;
                      setIsProcessing(true);
                      try { await activateJokerDice(pin, session.groupId); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors border-2 ${
                      myJokers.dice
                        ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900'
                        : 'border-ink/10 bg-ink/5 opacity-40 cursor-not-allowed text-ink/40'
                    }`}
                  >
                    <span className="text-2xl">🎲</span>
                    <span className="text-xs font-semibold leading-tight">Würfeln</span>
                    {myJokers.dice
                      ? <span className="text-[10px] text-amber-700/70 leading-tight">6=Punkt, 1=Malus</span>
                      : <span className="text-[10px] text-ink/40">Verbraucht</span>
                    }
                  </button>
                </div>
                {!hasAnyJoker && <p className="text-xs text-ink/50 text-center">Alle Joker wurden verbraucht.</p>}
              </div>
            );
          })()}

          {/* Steal-Joker-Panel – nur für NICHT-aktive Gruppen, nicht für Host */}
          {game.jokersEnabled && !isMyTurn && !effectiveIsHost && session && !game.jokerStealActive && !game.jokerNextActive && !game.jokerStealReturnActive && (() => {
            const myJokers = game.groups[session.groupId]?.jokers;
            if (!myJokers) return null;
            const deckMeta: Record<string, string> = (game as any).deckMeta ?? {};
            const currentCat = (game.currentCardId ? deckMeta[game.currentCardId] : null) ?? (game as any).currentRoundCategory ?? '';
            const isSchaetzfrage = currentCat === 'schaetzfragen';
            if (isSchaetzfrage) return null;
            return (
              <div className="card-surface rounded-2xl p-4 space-y-3 border-2 border-purple-400/60 bg-purple-500/5">
                <h3 className="text-sm font-bold text-purple-700">🥷 Steal-Joker</h3>
                <p className="text-xs text-ink/60">
                  Klau die aktuelle Frage von <span className="font-semibold" style={{ color: (game.currentTurnGroupId ? game.groups[game.currentTurnGroupId]?.color : undefined) ?? undefined }}>{game.currentTurnGroupId ? (game.groups[game.currentTurnGroupId]?.name ?? '?') : '?'}</span>!
                  First come, first served.
                </p>
                <button
                  disabled={!myJokers.steal || isProcessing || !stealUnlocked}
                  title="Klau die aktuelle Frage. Richtig → du bekommst Punkt + Kategorie. Falsch → die andere Gruppe bekommt den Punkt."
                  onClick={async () => {
                    if (!myJokers.steal || isProcessing || !stealUnlocked) return;
                    setIsProcessing(true);
                    try { await activateJokerSteal(pin, session.groupId); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
                  }}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center transition-colors border-2 font-semibold ${
                    !myJokers.steal
                      ? 'border-ink/10 bg-ink/5 opacity-40 cursor-not-allowed text-ink/40'
                      : !stealUnlocked
                      ? 'border-ink/10 bg-ink/5 opacity-40 cursor-not-allowed text-ink/40'
                      : 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-900 animate-pulse hover:animate-none'
                  }`}
                >
                  <span className="text-2xl">🥷</span>
                  <span>{!myJokers.steal ? 'Verbraucht' : !stealUnlocked ? 'Frage klauen!' : 'Frage klauen!'}</span>
                </button>
              </div>
            );
          })()}

          {/* Host-Steuerung (nur mit Spielleitung) */}
          {effectiveIsHost && !game.hostless && (
            <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30">
              {/* NEXT-Joker-Hinweis für Host */}
              {game.jokerNextActive && game.jokerNextOriginGroupId && game.jokerNextTargetGroupId && (
                <div className="rounded-xl bg-orange-500/15 border-2 border-orange-400 px-4 py-3 text-sm">
                  <p className="font-bold text-orange-700">⚡ Joker NEXT aktiv</p>
                  <p className="text-orange-600">
                    {game.groups[game.jokerNextOriginGroupId]?.name ?? '?'} hat die Frage an {game.groups[game.jokerNextTargetGroupId]?.name ?? '?'} weitergegeben.
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Richtig → niemand bekommt Punkt. Falsch → {game.groups[game.jokerNextOriginGroupId]?.name ?? '?'} bekommt Punkt.</p>
                </div>
              )}

              {/* STEAL-Joker-Hinweis für Host */}
              {game.jokerStealActive && game.jokerStealGroupId && game.jokerStealFromGroupId && (
                <div className="rounded-xl bg-purple-500/15 border-2 border-purple-400 px-4 py-3 text-sm">
                  <p className="font-bold text-purple-700">🥷 Joker STEAL aktiv</p>
                  <p className="text-purple-600">
                    <span className="font-semibold">{game.groups[game.jokerStealGroupId]?.name ?? '?'}</span> hat die Frage von{' '}
                    <span className="font-semibold">{game.groups[game.jokerStealFromGroupId]?.name ?? '?'}</span> geklaut.
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Richtig → {game.groups[game.jokerStealGroupId]?.name ?? '?'} bekommt Punkt + Kategorie.{' '}
                    Falsch → {game.groups[game.jokerStealFromGroupId]?.name ?? '?'} bekommt Punkt + Kategorie, dann Rückgabe-Zug.
                  </p>
                </div>
              )}

              {/* STEAL-Rückgabe-Zug-Hinweis für Host */}
              {game.jokerStealReturnActive && (
                <div className="rounded-xl bg-blue-500/15 border-2 border-blue-400 px-4 py-3 text-sm">
                  <p className="font-bold text-blue-700">🔄 Rückgabe-Zug aktiv</p>
                  <p className="text-blue-600">
                    <span className="font-semibold">{game.currentTurnGroupId ? (game.groups[game.currentTurnGroupId]?.name ?? '?') : '?'}</span> erhält einen Ersatz-Zug (Frage wurde geklaut).
                  </p>
                </div>
              )}

              {/* Bewertungs-Buttons */}
              <p className="text-base font-semibold text-center text-ink/80">
                Hat Gruppe <span className="font-bold">&bdquo;{activeGroup?.name ?? '…'}&ldquo;</span> die Frage korrekt beantwortet?
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTriviaAnswer(true)}
                  disabled={isProcessing}
                  className="px-2 py-3 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Richtig
                </button>
                <button
                  onClick={() => handleTriviaAnswer(false)}
                  disabled={isProcessing}
                  className="px-2 py-3 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 disabled:opacity-50"
                >
                  ❌ Falsch
                </button>
                <button
                  onClick={() => setShowTriviaAnswer(v => !v)}
                  className={`px-2 py-3 rounded-xl font-bold text-base transition-colors ${
                    showTriviaAnswer
                      ? 'bg-sky-900 text-sky-200 hover:bg-sky-800'
                      : 'bg-sky-700 text-white hover:bg-sky-600'
                  }`}
                >
                  {showTriviaAnswer ? '🙈 Verbergen' : '👁 Antwort'}
                </button>
              </div>
              {showTriviaAnswer && (
                <div className="rounded-xl bg-yellow-100/20 border-2 border-yellow-400 px-4 py-3">
                  <p className="text-sm font-semibold text-yellow-700 mb-1">Korrekte Antwort:</p>
                  <p className="text-xl font-bold">{currentCard.category === 'music' ? currentCard.answer.replace(/ [–—] -?\d+, /, ' — ') : currentCard.answer}</p>
                  {currentCard.year && (
                    <p className="text-sm text-ink/60 mt-1">Jahr: {currentCard.year}</p>
                  )}
                </div>
              )}

              {renderAdminSettingsPanel()}
            </div>
          )}

          {/* ── Spielleitungsloser Modus: Textantwort + Abstimmung ── */}
          {game.hostless && (() => {
            const pending = game.pendingTextAnswer;
            const isAnswerer = !!session && pending?.groupId === session.groupId;
            const myVote = pending && session ? (game.answerVotes ?? {})[session.groupId] : undefined;
            const eligibleVoters = pending
              ? groupList.filter(g => g.id !== pending.groupId && (game.presence?.[g.id] ? Object.values(game.presence[g.id]).some(Boolean) : false))
              : [];
            const votesIn = pending ? Object.keys(game.answerVotes ?? {}).length : 0;
            const correctSoFar = pending ? Object.values(game.answerVotes ?? {}).filter(Boolean).length : 0;

            return (
              <div className="space-y-3">
                {/* Joker-Kontext-Hinweise (informativ, für alle sichtbar) */}
                {game.jokerNextActive && game.jokerNextOriginGroupId && game.jokerNextTargetGroupId && (
                  <div className="rounded-xl bg-orange-500/15 border-2 border-orange-400 px-4 py-3 text-sm">
                    <p className="font-bold text-orange-700">⚡ Joker NEXT aktiv</p>
                    <p className="text-orange-600">
                      {game.groups[game.jokerNextOriginGroupId]?.name ?? '?'} hat die Frage an {game.groups[game.jokerNextTargetGroupId]?.name ?? '?'} weitergegeben.
                    </p>
                  </div>
                )}
                {game.jokerStealActive && game.jokerStealGroupId && game.jokerStealFromGroupId && (
                  <div className="rounded-xl bg-purple-500/15 border-2 border-purple-400 px-4 py-3 text-sm">
                    <p className="font-bold text-purple-700">🥷 Joker STEAL aktiv</p>
                    <p className="text-purple-600">
                      <span className="font-semibold">{game.groups[game.jokerStealGroupId]?.name ?? '?'}</span> hat die Frage von{' '}
                      <span className="font-semibold">{game.groups[game.jokerStealFromGroupId]?.name ?? '?'}</span> geklaut.
                    </p>
                  </div>
                )}
                {game.jokerStealReturnActive && (
                  <div className="rounded-xl bg-blue-500/15 border-2 border-blue-400 px-4 py-3 text-sm">
                    <p className="font-bold text-blue-700">🔄 Rückgabe-Zug aktiv</p>
                  </div>
                )}

                {/* Reveal: Antwort wurde ausgewertet — akzeptiert oder abgelehnt */}
                {game.textAnswerResult && (() => {
                  const result = game.textAnswerResult;
                  const isResultForMe = !!session && result.groupId === session.groupId;
                  return (
                    <div className={`card-surface rounded-2xl p-8 space-y-3 border-4 text-center ${
                      result.correct ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
                    }`}>
                      <div className="text-5xl">{result.correct ? '✅' : '❌'}</div>
                      <p className="text-xl font-bold">
                        {isResultForMe
                          ? (result.correct ? 'Eure Antwort wurde akzeptiert!' : 'Eure Antwort wurde nicht akzeptiert')
                          : `${game.groups[result.groupId]?.name ?? 'Die Gruppe'}s Antwort wurde ${result.correct ? 'akzeptiert' : 'nicht akzeptiert'}`}
                      </p>
                      <p className="text-sm text-ink/60">„{result.text}&ldquo; — {result.correctVotes}/{result.totalVotes} Stimmen für richtig</p>
                    </div>
                  );
                })()}

                {/* Aktive Gruppe: Antwort eingeben */}
                {isMyTurn && !pending && !game.textAnswerResult && (
                  <div className="card-surface rounded-2xl p-6 space-y-3 border-2 border-green-500/30">
                    <p className="text-base font-semibold text-center text-ink/80">Eure Antwort:</p>
                    <input
                      type="text"
                      value={textAnswerInput}
                      onChange={e => setTextAnswerInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmitTextAnswer()}
                      placeholder="Antwort eingeben…"
                      className="w-full rounded-xl border-2 border-ink/20 px-4 py-3 text-lg font-semibold text-gray-900 focus:border-ink/60 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSubmitTextAnswer}
                      disabled={!textAnswerInput.trim() || isProcessing}
                      className="w-full py-3 rounded-xl bg-ink text-inkDark font-bold text-lg hover:opacity-90 disabled:opacity-40"
                    >
                      📤 Antwort einreichen
                    </button>
                  </div>
                )}

                {/* Antwort liegt vor: Anzeige + Abstimmung / Warten */}
                {pending && (
                  <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-blue-400/40">
                    <div className="text-center space-y-1">
                      <p className="text-xs uppercase tracking-wide text-ink/50">Antwort von {game.groups[pending.groupId]?.name ?? '?'}</p>
                      <p className="text-2xl font-bold">{pending.text}</p>
                    </div>
                    <div className="rounded-xl bg-yellow-100/20 border-2 border-yellow-400 px-4 py-3 text-center">
                      <p className="text-xs font-semibold text-yellow-700 mb-1">Korrekte Antwort:</p>
                      <p className="text-lg font-bold">{currentCard.category === 'music' ? currentCard.answer.replace(/ [–—] -?\d+, /, ' — ') : currentCard.answer}</p>
                    </div>

                    {isAnswerer ? (
                      <p className="text-center text-sm text-ink/60">⏳ Warte auf die Abstimmung der anderen Gruppen… ({votesIn}/{eligibleVoters.length})</p>
                    ) : myVote !== undefined ? (
                      <p className="text-center text-sm text-ink/60">✅ Ihr habt abgestimmt: {myVote ? 'Richtig' : 'Falsch'}. Warte auf die anderen… ({votesIn}/{eligibleVoters.length})</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-center text-ink/80">War die Antwort richtig?</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCastVote(true)}
                            disabled={isProcessing}
                            className="px-2 py-3 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 disabled:opacity-50"
                          >
                            ✅ Richtig
                          </button>
                          <button
                            onClick={() => handleCastVote(false)}
                            disabled={isProcessing}
                            className="px-2 py-3 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 disabled:opacity-50"
                          >
                            ❌ Falsch
                          </button>
                        </div>
                      </div>
                    )}

                    {votesIn === eligibleVoters.length && eligibleVoters.length > 0 && (
                      <p className="text-center text-xs text-ink/50">
                        {correctSoFar}/{eligibleVoters.length} für &bdquo;richtig&ldquo; ({correctSoFar / eligibleVoters.length >= 0.5 ? 'gilt als richtig' : 'gilt als falsch'}) → wird gleich ausgewertet…
                      </p>
                    )}
                  </div>
                )}

                {!isMyTurn && !pending && !game.textAnswerResult && (
                  <p className="text-center text-sm text-ink/60">⏳ Warte auf die Antwort von {activeGroup?.name ?? 'der aktiven Gruppe'}…</p>
                )}
              </div>
            );
          })()}
          </div>
          </div>
          </>
          )}
        </main>
      );
    }

    // Wenn keine Karte verfügbar ist, zeige Warnung
    if (!currentCard) {
      return (
        <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display">Timeline Multiplayer</h1>
            <div className="card-surface rounded-2xl p-6">
              <p className="text-lg text-ink/70">Lade Karte...</p>
              <p className="text-sm text-ink/50 mt-2">
                Karte {game.currentCardIndex + 1} / {game.deck.length}
              </p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="relative mx-auto max-w-4xl lg:max-w-6xl px-4 sm:px-5 py-3 sm:py-5 space-y-3">

        {/* ═══════════════════════════════════════════════════════════
            ERGEBNISSEITE — wird angezeigt sobald Host "Auswertung"
            geklickt hat oder der 15s-Timer abläuft (resultRevealed)
            ═══════════════════════════════════════════════════════════ */}
        {game.resultRevealed && game.pendingResult && currentCard && (() => {
          const activeGroupId = game.currentTurnGroupId!;
          const activeGroupName = game.groups[activeGroupId]?.name ?? 'Aktives Team';
          const correctPos = game.flexPhaseCorrectPosition;
          const flexWinnerId = correctPos !== undefined && correctPos !== null
            ? (game.flexTips ?? {})[String(correctPos)]
            : undefined;
          const flexWinnerName = flexWinnerId ? game.groups[flexWinnerId]?.name : undefined;
          const answerLabel = currentCard.category === 'music'
            ? `${currentCard.hint} — ${currentCard.title}`
            : currentCard.answer;
          const tips = game.flexTips ?? {};
          const tipEntries = Object.entries(tips);

          return (
            <div className="space-y-3">
              {/* Korrekte Antwort */}
              <div className="card-surface rounded-2xl p-5 text-center space-y-1">
                <p className="text-sm text-ink/60">Die korrekte Antwort ist:</p>
                <p className="text-4xl font-bold">{currentCard.year}</p>
                <p className="text-base font-semibold text-ink/80">{answerLabel}</p>
              </div>

              {/* Wer erhält die Karte? */}
              {game.pendingResult === 'correct' ? (
                <div className="rounded-2xl bg-green-500/10 border-2 border-green-500/40 p-4 text-center">
                  <p className="text-lg font-bold text-green-500">✅ Team: <span>{activeGroupName}</span> erhält die Karte!</p>
                </div>
              ) : flexWinnerName ? (
                <div className="rounded-2xl bg-blue-500/10 border-2 border-blue-400/40 p-4 text-center">
                  <p className="text-lg font-bold text-blue-400">✅ Team: <span>{flexWinnerName}</span> wusste es besser und hat die Karte gestohlen - nice flex!</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-red-500/10 border-2 border-red-400/40 p-4 text-center">
                  <p className="text-lg font-bold text-red-400">❌ Keine Gruppe erhält die Karte.</p>
                </div>
              )}

              {/* Host: Flex-Button Vergabe (im spielleitungslosen Modus nicht verfügbar) */}
              {isHostSession && !game.hostless && (
                !flexJudgmentDone ? (
                  <div className="card-surface rounded-2xl border-2 border-blue-400/50 p-4 space-y-3">
                    <p className="font-semibold text-center text-sm">
                      Hat <span className="font-bold">{activeGroupName}</span> die Frage korrekt beantwortet (Titel / Person / Film — unabhängig von der Jahreszahl)?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAwardFlex(true)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                      >
                        🔵 Ja — +1 Flex-Button
                      </button>
                      <button
                        onClick={() => handleAwardFlex(false)}
                        className="flex-1 px-4 py-3 bg-ink/20 text-ink rounded-xl font-semibold hover:bg-ink/30 text-sm"
                      >
                        Nein
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-ink/50">Flex-Entscheidung getroffen ✓</p>
                )
              )}

              {/* Eingegangene Flex-Tipps */}
              <div className="card-surface rounded-2xl p-4 space-y-1">
                <p className="text-xs font-semibold text-blue-400">Eingegangene Flex-Tipps:</p>
                {tipEntries.length === 0 ? (
                  <p className="text-xs text-ink/50">Kein Tipp abgegeben</p>
                ) : (
                  tipEntries.map(([pos, gId]) => (
                    <p key={pos} className="text-xs text-ink/80">
                      <span className="font-semibold">{game.groups[gId]?.name ?? gId}</span>: Position {pos}
                      {String(correctPos) === pos ? ' ✅' : ' ❌'}
                    </p>
                  ))
                )}
              </div>

              {/* Host: Weiter-Button (im spielleitungslosen Modus automatisch) */}
              {isHostSession && !game.hostless && (
                <button
                  onClick={handleNextCard}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 bg-ink text-inkDark rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isProcessing ? '⏳ Bitte warten…' : 'Weiter zum nächsten Team →'}
                </button>
              )}

              {/* Nicht-Host: Warte-Meldung */}
              {!isHostSession && !game.hostless && (
                <div className="text-center py-3">
                  <p className="text-sm text-ink/60">⏳ Warte auf den Spielleiter…</p>
                </div>
              )}

              {/* Spielleitungsloser Modus: automatischer Weiter-Countdown */}
              {game.hostless && (
                <div className="text-center py-3">
                  <p className="text-sm text-ink/60">
                    ⏳ Automatisch weiter{autoAdvanceCountdown !== null ? ` in ${autoAdvanceCountdown}s` : '…'}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Normale Spielansicht — nur wenn NICHT im Ergebnis-Modus */}
        {!game.resultRevealed && (<>
        {/* Header */}
        <div className="text-center space-y-1">
          {effectiveIsHost && (
            <h1 className="text-2xl font-display">Timeline Multiplayer</h1>
          )}
          {game.currentTurnGroupId && (
            isActiveTurn ? (
              <div className="mt-1 w-full px-3 py-1.5 rounded-xl bg-green-500 text-white font-bold text-sm animate-pulse shadow-lg shadow-green-500/30">
                ⚡ Eure Gruppe ist am Zug!
              </div>
            ) : (
              <div className="mt-1 w-full px-3 py-2 rounded-xl bg-ink/15">
                <div className="flex flex-wrap items-center justify-center gap-1 text-xs font-semibold">
                  {groupList.map((g, i) => (
                    <span key={g.id} className="flex items-center gap-1">
                      {i > 0 && <span className="text-ink/40">→</span>}
                      <span
                        className="px-2 py-0.5 rounded-lg"
                        style={g.id === game.currentTurnGroupId
                          ? { backgroundColor: g.color, color: '#000', fontWeight: 700 }
                          : { color: 'var(--ink)', opacity: 0.6 }}
                      >
                        {g.id === game.currentTurnGroupId ? '🎮 ' : ''}{g.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start space-y-3 lg:space-y-0">
        <div className="space-y-3">
        {/* Aktuelle Karte */}
        {currentCard && (() => {
          const categoryLabel = catLabelMeta(currentCard.category);
          const categoryIcon = catIcon(currentCard.category);
          return (
          <div className={`card-surface rounded-2xl p-3 sm:p-4 space-y-2 ${(!isActiveTurn && !isHostSession) ? 'opacity-70 pointer-events-none select-none' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span>{categoryIcon} {categoryLabel}</span>
                {quoteSourceBadge(currentCard)}
              </h2>
              <div className="flex items-center gap-2">
                {timeLeft !== null && (
                  <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${
                    timeLeft <= 10 ? 'bg-red-500/20 text-red-600 animate-pulse' : 'bg-ink/10'
                  }`}>
                    ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                )}
                <span className="text-sm px-3 py-1 rounded-full bg-ink/10">
                  {currentCard.difficulty}
                </span>
              </div>
            </div>

            <p className="text-sm">{currentCard.category === 'quote' ? 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?' : currentCard.category === 'filmserien' ? currentCard.cue + ' – Und in welchem Jahr war das?' : currentCard.cue}</p>

            {currentCard.sources && (
              <div className="relative">
                {/* Host (bzw. im spielleitungslosen Modus die aktive Gruppe) sieht volle Kontrolle */}
                {showFullMedia ? (
                  <MediaEmbed
                    key={`timeline-host-media-${currentCard.id}`}
                    ref={mediaEmbedRef}
                    card={currentCard}
                    preference={currentCard.category === 'music' ? 'spotify' : 'youtube'}
                    concealMetadata={currentCard.category === 'music'}
                    onPlay={handleRemotePlay}
                    onPause={handleRemotePause}
                    onProgress={handleMediaProgress}
                  />
                ) : (
                  /* Mitspieler: Musik nur Symbol, andere Medien vollständig */
                  currentCard.category === 'music' ? (
                    <div className="rounded-xl card-surface bg-ink/5 px-4 py-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎵</div>
                        <div className="font-mono font-bold text-green-600 tabular-nums text-lg">
                          {String(Math.floor(musicElapsed / 60)).padStart(2, '0')}:{String(musicElapsed % 60).padStart(2, '0')}
                          {musicDurationMs > 0 && (
                            <span className="text-ink/40 font-normal text-sm"> / {String(Math.floor(musicDurationMs / 60000)).padStart(2, '0')}:{String(Math.floor(musicDurationMs / 1000) % 60).padStart(2, '0')}</span>
                          )}
                        </div>
                        <div className="text-xs text-ink/50 ml-auto">
                          {game?.playbackControl?.action === 'play' && game.playbackControl.cardId === currentCard.id
                            ? 'Musik läuft'
                            : 'Wartet…'}
                        </div>
                      </div>
                      <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min((musicElapsed / (musicDurationMs > 0 ? musicDurationMs / 1000 : 240)) * 100, 100)}%`,
                            background: game?.playbackControl?.action === 'play' && game.playbackControl.cardId === currentCard.id
                              ? '#22c55e'
                              : '#6b7280',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Andere Medien-Typen (Bilder, etc.) für Spieler anzeigen */
                    <MediaEmbed 
                      card={currentCard}
                      preference="youtube"
                    />
                  )
                )}
              </div>
            )}

            {isHostSession && (
              <button
                onClick={async () => {
                  if (isProcessing) return;
                  setIsProcessing(true);
                  try { await skipCard(pin); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
                }}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-ink/10 text-ink rounded-xl font-semibold text-sm hover:bg-ink/20 disabled:opacity-50"
              >
                ⏭ Frage überspringen (gleiche Gruppe bleibt dran)
              </button>
            )}

            {/* Flex-Button einsetzen — in der Kartenbox, nur für aktive Gruppe */}
            {isActiveTurn && (currentGroup?.flexButtons ?? 0) > 0 && (
              <button
                type="button"
                onClick={handleUseFlex}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-xl border-2 border-blue-400 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                🔵 Flex-Button einsetzen — neue Frage aus gleicher Kategorie
                <span className="ml-1 text-xs bg-blue-400/30 px-2 py-0.5 rounded-full">
                  {currentGroup.flexButtons}× verfügbar
                </span>
              </button>
            )}
          </div>
          );
        })()}

        {/* Timeline mit Platzierungs-Optionen */}
        {placementResult === null && currentCard && isActiveTurn && (() => {
          const timeline = Array.isArray(currentGroup.timeline) ? currentGroup.timeline : Object.values(currentGroup.timeline ?? {});
          const displayTimeline: typeof timeline = [];
          if (game.referenceCard) displayTimeline.push(game.referenceCard as any);
          displayTimeline.push(...timeline);
          displayTimeline.sort((a: any, b: any) => a.year - b.year);

          const positionLabel = (idx: number) => {
            if (idx === 0) return '← Davor';
            if (idx === displayTimeline.length) return 'Danach →';
            return '↔ Hier';
          };

          return (
            <div className="card-surface rounded-2xl p-3 sm:p-4 space-y-2 border-2 border-green-500">
              <h3 className="text-sm font-semibold text-center">
                Timeline von Gruppe: <span className="text-ink">{currentGroup.name}</span>
              </h3>

              {/* Timeline + Positions-Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 justify-start">
                {/* Button vor Position 0 */}
                <button
                  type="button"
                  onClick={() => handleSelectPosition(0)}
                  disabled={isProcessing}
                  className={`flex-shrink-0 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    selectedPosition === 0
                      ? 'border-ink bg-ink text-inkDark scale-105'
                      : 'border-dashed border-ink/30 bg-ink/5 hover:border-ink hover:bg-ink/10'
                  }`}
                >
                  ← Davor
                </button>

                {displayTimeline.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 flex-shrink-0">
                    {/* Karte */}
                    <div className={`flex-shrink-0 rounded-lg border-2 px-3 py-2 min-w-[110px] ${
                      item.id === game.referenceCard?.id
                        ? 'border-yellow-500 bg-yellow-100 text-yellow-900'
                        : 'border-ink/60 bg-ink/10'
                    }`}>
                      <p className="text-xs font-bold">{item.year}</p>
                      {item.id === game.referenceCard?.id ? (
                        <p className="text-xs text-yellow-700 mt-0.5">Referenz</p>
                      ) : (
                        <>
                          <p className="text-xs truncate text-ink/70">{item.hint || ''}</p>
                          <p className="text-xs truncate text-ink/50">{item.title || ''}</p>
                        </>
                      )}
                    </div>

                    {/* Button nach dieser Karte */}
                    <button
                      type="button"
                      onClick={() => handleSelectPosition(idx + 1)}
                      disabled={isProcessing}
                      className={`flex-shrink-0 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                        selectedPosition === idx + 1
                          ? 'border-ink bg-ink text-inkDark scale-105'
                          : 'border-dashed border-ink/30 bg-ink/5 hover:border-ink hover:bg-ink/10'
                      }`}
                    >
                      {idx === displayTimeline.length - 1 ? 'Danach →' : '↔'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Platzierungs-Fehler */}
              {placementError && (
                <div className="rounded-xl border-2 border-red-500/50 bg-red-50/10 p-3">
                  <p className="text-red-600 text-sm font-semibold">⚠️ {placementError}</p>
                  <button onClick={() => setPlacementError(null)} className="text-xs text-red-500 underline mt-1">
                    Schließen
                  </button>
                </div>
              )}

              {/* Bestätigen-Button */}
              <button
                onClick={() => selectedPosition !== null && handlePlaceCard(selectedPosition)}
                disabled={selectedPosition === null || isProcessing}
                className="w-full py-2.5 rounded-xl bg-ink text-inkDark font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Wird geprüft...' : '✅ Ergebnis einreichen'}
              </button>
            </div>
          );
        })()}

        {/* Nicht am Zug - Timeline der spielenden Gruppe anzeigen (READ-ONLY oder Flex-Tipp) */}
        {!isActiveTurn && (() => {
          const activeGroupId = game.currentTurnGroupId;
          const activeGroup = activeGroupId ? game.groups[activeGroupId] : null;
          if (!activeGroup) return null;

          const timeline = Array.isArray(activeGroup.timeline) ? activeGroup.timeline : Object.values(activeGroup.timeline ?? {});
          const displayTimeline: any[] = [];
          if (game.referenceCard) displayTimeline.push(game.referenceCard);
          displayTimeline.push(...timeline);
          displayTimeline.sort((a: any, b: any) => a.year - b.year);

          if (displayTimeline.length === 0 && !game.flexPhaseActive) return null;

          // Flex-Phase: Nicht-spielende Gruppen können Tipp abgeben
          const isFlexPhase = Boolean(game.flexPhaseActive && game.pendingResult);
          const blockedPosition = game.activeGroupPlacedPosition ?? null;

          // Fix: Falsch gelegte Karte landet NICHT in activeGroup.timeline (nur korrekte werden dort gespeichert).
          // In der Flex-Phase trotzdem an der gelegten Position als "NEU" anzeigen, damit alle sie sehen.
          if (isFlexPhase && blockedPosition !== null && game.flexPhaseCard &&
              !displayTimeline.some((c: any) => c.id === game.currentCardId)) {
            const insertIdx = Math.max(0, Math.min(blockedPosition, displayTimeline.length));
            displayTimeline.splice(insertIdx, 0, game.flexPhaseCard);
          }

          // Live-Vorschau: pendingPosition der spielenden Gruppe — sichtbar für alle (Host + nicht-spielende Gruppen)
          const pendingPos = activeGroup?.pendingPosition ?? null;
          const ghostCard = pendingPos !== null && currentCard ? currentCard : null;

          const renderGhost = () => (
            <div id="obs-ghost-card" className="flex items-center flex-shrink-0">
              <div className="text-ink/30 mx-1">↔</div>
              <div className="flex-shrink-0 rounded-lg border-2 border-dashed border-blue-400 bg-blue-400/10 px-4 py-3 min-w-[120px] animate-pulse">
                <p className="text-xs font-bold text-blue-400">???</p>
                <p className="text-xs truncate text-blue-400/80">???</p>
              </div>
            </div>
          );

          const myGroup = session ? game.groups[session.groupId] : null;
          // Sobald der Spielleiter „Auswertung" drückt (resultRevealed = true), sind keine
          // neuen Flex-Tipps mehr möglich – erst nach „Nächste Gruppe" wird das Flag gelöscht.
          const canFlex = isFlexPhase && !isHostSession && !isActiveTurn
            && (myGroup?.flexButtons ?? 0) > 0
            && !flexTipSubmitted
            && !game.resultRevealed;
          // Bereits von anderen belegte Positionen
          const takenPositions = new Set(Object.keys(game.flexTips ?? {}).map(Number));
          // Die neue Karte liegt bei Index blockedPosition in der displayTimeline.
          // Beide Slots, die die neue Karte flankieren (links = blockedPosition, rechts = blockedPosition+1),
          // sind gesperrt – denn ein Flex-Button dort würde dieselbe Lücke wie die gespielte Karte bedeuten.
          const isBlocked = (pos: number) =>
            blockedPosition !== null && (pos === blockedPosition || pos === blockedPosition + 1);
          const isTaken = (pos: number) => takenPositions.has(pos) && !isBlocked(pos);

          // Host: Live-Marker für jeden eingereichten Flex-Tipp direkt in der Timeline
          const flexTipsMap: Record<string, string> = (isHostSession && isFlexPhase)
            ? (game.flexTips ?? {})
            : {};
          const renderFlexTipMarker = (pos: number) => {
            const tippingGroupId = flexTipsMap[String(pos)];
            if (!tippingGroupId) return null;
            const tippingGroup = game.groups[tippingGroupId];
            return (
              <div
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg border-2 border-blue-400 bg-blue-500/15 min-w-[52px]"
                title={`Flex-Tipp von ${tippingGroup?.name ?? tippingGroupId}`}
              >
                <span className="text-[10px] font-bold text-blue-400">🔵 FB</span>
                <span
                  className="text-[9px] font-semibold truncate max-w-[48px] text-center"
                  style={{ color: tippingGroup?.color ?? '#60a5fa' }}
                >
                  {tippingGroup?.name ?? '?'}
                </span>
              </div>
            );
          };

          return (
            <div className={`card-surface rounded-2xl p-3 sm:p-4 space-y-2 border-2 ${isActiveTurn ? 'border-green-500' : 'border-red-500'}`}>
              <h3 className="text-sm font-semibold text-center">
                Timeline von <span className="font-bold">{activeGroup.name}</span>
                {isFlexPhase && canFlex && (
                  <span className="ml-2 text-blue-400 text-xs">(Flex-Tipp möglich!)</span>
                )}
                {isFlexPhase && flexTipSubmitted && (
                  <span className="ml-2 text-green-400 text-xs">✓ Tipp eingereicht</span>
                )}
                {isHostSession && pendingPos !== null && (
                  <span className="ml-2 text-blue-400 text-xs">(wählt Position…)</span>
                )}
                {!isHostSession && pendingPos !== null && !isFlexPhase && (
                  <span className="ml-2 text-blue-400 text-xs">(wählt Position…)</span>
                )}
              </h3>

              {/* Flex-Phase Countdown Banner — sichtbar für alle */}
              {isFlexPhase && !game.resultRevealed && flexTimer !== null && (
                <div className={`rounded-xl border-2 px-4 py-3 flex items-center justify-between ${
                  flexTimer <= 5
                    ? 'bg-red-500/15 border-red-500/60 animate-pulse'
                    : 'bg-blue-500/10 border-blue-400/40'
                }`}>
                  <span className={`text-sm font-semibold ${
                    flexTimer <= 5 ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    🔵 Flex-Phase — Jetzt Flex-Button einsetzen!
                  </span>
                  <span className={`font-mono font-bold text-lg ${
                    flexTimer <= 5 ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {flexTimer}s
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {/* Flex-Tipp Button vor Position 0 */}
                {canFlex && !isBlocked(0) && !takenPositions.has(0) && (
                  <button
                    type="button"
                    onClick={() => setFlexTipPosition(p => p === 0 ? null : 0)}
                    className={`flex-shrink-0 rounded-lg border-2 px-2 py-2 text-xs font-semibold transition-all ${
                      flexTipPosition === 0 ? 'border-blue-400 bg-blue-400 text-white scale-105' : 'border-dashed border-blue-400/50 bg-blue-400/10 hover:bg-blue-400/20 text-blue-400'
                    }`}
                  >← FB</button>
                )}
                {canFlex && isBlocked(0) && (
                  <div className="flex-shrink-0 rounded-lg border-2 border-red-400/30 px-2 py-2 text-xs text-red-400/50 cursor-not-allowed">
                    ← ✗
                  </div>
                )}
                {canFlex && isTaken(0) && (
                  <div className="flex-shrink-0 rounded-lg border-2 border-yellow-400/30 px-2 py-2 text-xs text-yellow-400/70 cursor-not-allowed">🔒</div>
                )}

                {/* Flex-Tipp-Marker an Position 0 (Host-Live-Ansicht) */}
                {renderFlexTipMarker(0)}

                {/* Ghost vor Position 0 (Host-Vorschau) */}
                {ghostCard && pendingPos === 0 && renderGhost()}

                {displayTimeline.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 flex-shrink-0">
                    {idx > 0 && <div className="text-ink/30 mx-0.5">↔</div>}
                    <div className="relative">
                      {item.id === game.currentCardId && game.flexPhaseActive && (
                        <span className="absolute -top-2 -right-1 z-10 text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full leading-none">NEU</span>
                      )}
                      {(() => {
                        const isNewCard = item.id === game.currentCardId && game.flexPhaseActive;
                        const masked = isNewCard && !game.resultRevealed;
                        return (
                          <div
                            id={item.id === game.currentCardId ? 'obs-new-card' : undefined}
                            className={`flex-shrink-0 rounded-lg border-2 px-3 py-2 min-w-[110px] ${
                            item.id === game.referenceCard?.id
                              ? 'border-yellow-500 bg-yellow-100 text-yellow-900'
                              : isNewCard
                                ? 'border-green-500 bg-green-500/15 ring-2 ring-green-400/50'
                                : 'border-ink/60 bg-ink/10'
                          }`}>
                            <p className="text-xs font-bold">{masked ? '???' : item.year}</p>
                            {item.id === game.referenceCard?.id ? (
                              <p className="text-xs text-yellow-700 mt-0.5">Referenz</p>
                            ) : masked ? (
                              <>
                                <p className="text-xs text-ink/40 italic">???</p>
                                <p className="text-xs text-green-400 font-semibold mt-0.5">Neu platziert</p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs truncate text-ink/70">{item.hint || ''}</p>
                                <p className="text-xs truncate text-ink/50">{item.title || ''}</p>
                                {isNewCard && <p className="text-xs text-green-400 font-semibold mt-0.5">Neu platziert</p>}
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Ghost nach dieser Karte (Host-Vorschau) */}
                    {ghostCard && pendingPos === idx + 1 && renderGhost()}

                    {/* Flex-Tipp-Marker nach dieser Karte (Host-Live-Ansicht) */}
                    {renderFlexTipMarker(idx + 1)}

                    {/* Flex-Tipp Button nach dieser Karte */}
                    {canFlex && !isBlocked(idx + 1) && !takenPositions.has(idx + 1) && (
                      <button
                        type="button"
                        onClick={() => setFlexTipPosition(p => p === idx + 1 ? null : idx + 1)}
                        className={`flex-shrink-0 rounded-lg border-2 px-2 py-2 text-xs font-semibold transition-all ${
                          flexTipPosition === idx + 1 ? 'border-blue-400 bg-blue-400 text-white scale-105' : 'border-dashed border-blue-400/50 bg-blue-400/10 hover:bg-blue-400/20 text-blue-400'
                        }`}
                      >{idx === displayTimeline.length - 1 ? 'FB →' : 'FB'}</button>
                    )}
                    {canFlex && isBlocked(idx + 1) && (
                      <div className="flex-shrink-0 rounded-lg border-2 border-red-400/30 px-2 py-2 text-xs text-red-400/50 cursor-not-allowed">✗</div>
                    )}
                    {canFlex && isTaken(idx + 1) && (
                      <div className="flex-shrink-0 rounded-lg border-2 border-yellow-400/30 px-2 py-2 text-xs text-yellow-400/70 cursor-not-allowed">🔒</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Flex-Tipp bestätigen */}
              {canFlex && flexTipPosition !== null && (
                <button
                  onClick={handleSubmitFlexTip}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? '⏳…' : `🔵 Flex-Tipp einreichen (Position ${flexTipPosition})`}
                </button>
              )}

              {/* Noch kein Flex möglich */}
              {isFlexPhase && !isHostSession && !isActiveTurn && !flexTipSubmitted && (myGroup?.flexButtons ?? 0) < 1 && (
                <p className="text-center text-xs text-ink/50">Kein Flex-Button verfügbar</p>
              )}
              {isFlexPhase && flexTipSubmitted && (
                <p className="text-center text-sm text-green-400 font-semibold">
                  ✓ Flex-Tipp eingereicht — {game.hostless ? 'warte auf Auswertung' : 'warte auf Spielleiter'}
                </p>
              )}

            </div>
          );
        })()}

        {/* Feedback nach Platzierung — aktives Team sieht Ergebnis, Host hat den "Weiter"-Button */}
        {(placementResult && currentCard && isActiveTurn) && (
          <div className="card-surface rounded-2xl p-6 space-y-4">
            {!game.resultRevealed ? (
              /* Warte auf Spielleiter-Auswertung */
              <div className="text-center space-y-3">
                <div className="text-5xl">⏳</div>
                <p className="text-lg font-semibold">Ergebnis eingereicht!</p>
                <p className="text-sm text-ink/60">
                  {game.hostless ? 'Automatische Auswertung läuft…' : 'Warte auf die Auswertung durch den Spielleiter…'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-ink/10 p-4 text-center space-y-1">
                  <p className="text-sm text-ink/60">Die korrekte Antwort ist:</p>
                  <p className="text-3xl font-bold">{currentCard.year}</p>
                  <p className="text-base font-semibold text-ink/80">
                    {currentCard.category === 'music'
                      ? `${currentCard.hint} — ${currentCard.title}`
                      : currentCard.answer}
                  </p>
                </div>
                {placementResult === 'correct' ? (
                  <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-center">
                    <p className="font-semibold text-green-500">✅ Ihr habt die Karte erhalten!</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-center">
                    <p className="font-semibold text-red-400">❌ Leider falsch — ihr erhaltet die Karte nicht.</p>
                  </div>
                )}
                <p className="text-center text-sm text-ink/60">Warte auf den Spielleiter…</p>
              </div>
            )}
          </div>
        )}
        </div>

        <div className="space-y-3">
        {/* Spielleitungsloser Modus: Auswertung läuft automatisch (Flex-Timer-Effekt) */}
        {game.hostless && game.pendingResult && !flexPhaseEvaluated && currentCard && (
          <div className="card-surface rounded-2xl p-6 space-y-2 border-2 border-ink/20 text-center">
            <div className="text-4xl">⏳</div>
            <p className="text-lg font-semibold">Warte auf Flex-Tipps…</p>
            <p className="text-sm text-ink/60">
              {flexTimer !== null && flexTimer > 0 ? `Automatische Auswertung in ${flexTimer}s` : 'Automatische Auswertung…'}
            </p>
          </div>
        )}

        {/* Host-Ansicht: Ergebnis der Platzierung + Flex-Frage + "Weiter"-Button */}
        {isHostSession && !game.hostless && game.pendingResult && currentCard && (
          <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-ink/20">
            {!flexPhaseEvaluated ? (
              /* Phase 1: Warte auf Flex-Tipps der anderen Gruppen */
              <>
                <div className="text-center space-y-2">
                  <div className="text-4xl">⏳</div>
                  <p className="text-lg font-semibold">Warte auf Flex-Tipps…</p>
                  <p className="text-sm text-ink/60">Andere Gruppen können jetzt noch Flex-Buttons einsetzen</p>
                </div>

                {/* Live Flex-Tipps */}
                {(() => {
                  const tips = game.flexTips ?? {};
                  const tipEntries = Object.entries(tips);
                  return (
                    <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 p-3 space-y-1">
                      <p className="text-xs font-semibold text-blue-400">Flex-Tipps eingereicht:</p>
                      {tipEntries.length === 0 ? (
                        <p className="text-xs text-ink/50">Noch kein Tipp abgegeben</p>
                      ) : (
                        tipEntries.map(([pos, gId]) => (
                          <p key={pos} className="text-xs text-ink/80">
                            <span className="font-semibold">{game.groups[gId]?.name ?? gId}</span>: Position {pos}
                          </p>
                        ))
                      )}
                    </div>
                  );
                })()}

                <button
                  onClick={async () => { await revealResult(pin); setFlexPhaseEvaluated(true); }}
                  className="w-full mt-2 px-6 py-4 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors text-lg"
                >
                  {flexTimer !== null && flexTimer > 0
                    ? `📊 Auswertung (auto in ${flexTimer}s)`
                    : '📊 Auswertung'}
                </button>
              </>
            ) : (
              /* Phase 2: Lösung + wer die Karte erhält + Flex-Vergabe + Weiter */
              <>
                {(() => {
                  const activeGroupName = game.groups[game.currentTurnGroupId!]?.name ?? 'Aktives Team';
                  const correctPos = game.flexPhaseCorrectPosition;
                  const flexWinnerId = correctPos !== undefined && correctPos !== null
                    ? (game.flexTips ?? {})[String(correctPos)]
                    : undefined;
                  const flexWinnerName = flexWinnerId ? game.groups[flexWinnerId]?.name : undefined;
                  const answerLabel = currentCard.category === 'music'
                    ? `${currentCard.hint} — ${currentCard.title}`
                    : currentCard.answer;
                  return (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-ink/10 p-4 text-center space-y-1">
                        <p className="text-sm text-ink/60">Die korrekte Antwort ist:</p>
                        <p className="text-2xl font-bold">{currentCard.year}</p>
                        <p className="text-base font-semibold text-ink/80">{answerLabel}</p>
                      </div>
                      {game.pendingResult === 'correct' ? (
                        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-center">
                          <p className="font-semibold text-green-500">✅ Team: <span className="font-bold">{activeGroupName}</span> erhält die Karte!</p>
                        </div>
                      ) : flexWinnerName ? (
                        <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 p-3 text-center">
                          <p className="font-semibold text-blue-400">✅ Team: <span className="font-bold">{flexWinnerName}</span> wusste es besser und hat die Karte gestohlen - nice flex!</p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-center">
                          <p className="font-semibold text-red-400">❌ Keine Gruppe erhält die Karte.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Flex-Button Vergabe: IMMER anzeigen — Inhalt korrekt beantwortet ist unabhängig von der Jahres-Einordnung */}
                {!flexJudgmentDone ? (
                  <div className="rounded-xl bg-blue-500/10 border-2 border-blue-400/50 p-4 space-y-3">
                    <p className="font-semibold text-center text-sm">
                      Hat <span className="font-bold">{game.groups[game.currentTurnGroupId!]?.name}</span> die Frage korrekt beantwortet (Titel / Person / Film — unabhängig von der Jahreszahl)?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAwardFlex(true)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm"
                      >
                        🔵 Ja — +1 Flex-Button
                      </button>
                      <button
                        onClick={() => handleAwardFlex(false)}
                        className="flex-1 px-4 py-2 bg-ink/20 text-ink rounded-lg font-semibold hover:bg-ink/30 text-sm"
                      >
                        Nein
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-ink/50">Flex-Entscheidung getroffen ✓</p>
                )}

                {/* Flex-Tipps Übersicht (Auswertungsphase) */}
                {game.flexPhaseActive && (() => {
                  const tips = game.flexTips ?? {};
                  const tipEntries = Object.entries(tips);
                  return (
                    <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 p-3 space-y-1">
                      <p className="text-xs font-semibold text-blue-400">Eingegangene Flex-Tipps:</p>
                      {tipEntries.length === 0 ? (
                        <p className="text-xs text-ink/50">Kein Tipp abgegeben</p>
                      ) : (
                        tipEntries.map(([pos, gId]) => (
                          <p key={pos} className="text-xs text-ink/80">
                            <span className="font-semibold">{game.groups[gId]?.name ?? gId}</span>: Position {pos}
                          </p>
                        ))
                      )}
                    </div>
                  );
                })()}

                <button
                  onClick={handleNextCard}
                  disabled={isProcessing}
                  className="w-full mt-2 px-6 py-4 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-lg"
                >
                  {isProcessing ? '⏳ Bitte warten…' : 'Weiter zum nächsten Team →'}
                </button>
              </>
            )}
          </div>
        )}
        </div>
        </div>

        {/* Live Scoreboard */}
        <details className="card-surface rounded-2xl group">
          <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between select-none">
            <span className="font-semibold">🏆 Live Scoreboard</span>
            <span className="text-ink/50 text-sm transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
          {groupList
            .sort((a, b) => b.score - a.score)
            .map((group, index) => (
              <div
                key={group.id}
                className={`flex items-center justify-between p-3 rounded-lg ${group.id === game.currentTurnGroupId ? 'ring-2 ring-ink' : ''}`}
                style={{ backgroundColor: `${group.color}20` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="font-semibold">
                    {group.name}
                    {group.id === session.groupId && ' (Du)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {(group.flexButtons ?? 0) > 0 && (
                    <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      🔵 {group.flexButtons}×FB
                    </span>
                  )}
                  <span className="text-xl font-bold">{group.score} / {game.timelineWinTarget ?? 10}</span>
                </div>
              </div>
            ))}
          </div>
        </details>

        {renderEndGameVotePanel()}

        {/* Host-Panel: Flex-Bestätigung und Score-Editing */}
        {effectiveIsHost && (
          <details className="card-surface rounded-2xl border-2 border-green-500/30 group">
            <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between select-none">
              <span className="text-lg font-semibold text-green-700">👑 Einstellungen</span>
              <span className="text-ink/50 text-sm transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="px-6 pb-6 space-y-4">

              {/* Score-Editing */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Punkte bearbeiten:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {groupList.map(group => (
                    <div key={group.id} className="text-sm">
                      {editingGroupId === group.id ? (
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={editingScore ?? group.score}
                            onChange={(e) => setEditingScore(Number(e.target.value))}
                            className="flex-1 px-2 py-1 rounded border-2 border-ink/30 text-gray-900"
                          />
                          <button
                            onClick={() => handleUpdateScore(group.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingGroupId(null)}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingGroupId(group.id);
                            setEditingScore(group.score);
                          }}
                          className="w-full px-2 py-1 rounded border-2 border-ink/20 hover:border-ink/60 text-left text-xs"
                        >
                          {group.name}: {group.score}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Spiel-Beenden */}
              <button
                onClick={handleEndGame}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Spiel beenden
              </button>
            </div>
          </details>
        )}
        </>)}  {/* Ende !game.resultRevealed */}
      </main>
    );
  }

  // Endbildschirm
  if (game.state === 'finished') {
    const sorted = [...groupList].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    // Podium order: 2nd (left), 1st (centre), 3rd (right)
    const podium = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
    const podiumHeights = ['h-28', 'h-40', 'h-20'];
    const podiumRanks  = ['🥈', '🥇', '🥉'];
    const podiumLabels = ['2', '1', '3'];

    // Confetti particles (generated once)
    const confettiColors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF922B','#F06595','#74C0FC'];
    const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: confettiColors[i % confettiColors.length],
      delay: `${(Math.random() * 3).toFixed(2)}s`,
      duration: `${(2.5 + Math.random() * 2).toFixed(2)}s`,
      size: Math.random() > 0.5 ? 8 : 6,
      rotate: Math.round(Math.random() * 360),
      isCircle: Math.random() > 0.6,
    }));

    return (
      <main className="relative overflow-hidden mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-8">
        {/* Confetti layer */}
        <style>{`
          @keyframes confetti-fall {
            0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
            80%  { opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          @keyframes winner-pulse {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.06); }
          }
          .confetti-piece { position: fixed; top: 0; pointer-events: none; animation: confetti-fall linear infinite; }
          .winner-card    { animation: winner-pulse 1.4s ease-in-out infinite; }
        `}</style>
        {confettiPieces.map(p => (
          <div key={p.id} className="confetti-piece" style={{
            left: p.left,
            width: p.size,
            height: p.isCircle ? p.size : p.size * 1.6,
            borderRadius: p.isCircle ? '50%' : 2,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate}deg)`,
            zIndex: 50,
          }} />
        ))}

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="text-6xl">🎉</div>
          <h1 className="text-4xl font-display">Spiel beendet!</h1>
          <p className="text-2xl font-bold text-yellow-400">{winner?.name} gewinnt! 🏆</p>
        </div>

        {/* Podium */}
        <div className="relative z-10 flex items-end justify-center gap-3 px-4">
          {podium.map((group, i) => (
            <div key={group.id} className="flex flex-col items-center gap-2" style={{ width: '32%' }}>
              {/* Name + score above block */}
              <div className={`text-center ${i === 1 ? 'winner-card' : ''}`}>
                <div className="text-2xl mb-1">{podiumRanks[i]}</div>
                <p className="font-bold text-sm sm:text-base leading-tight">{group.name}</p>
                <p className="text-sm font-semibold text-ink/70">{group.score} Pkt.</p>
              </div>
              {/* Podium block */}
              <div
                className={`w-full ${podiumHeights[i]} rounded-t-xl flex items-center justify-center text-4xl font-black text-white`}
                style={{ backgroundColor: i === 1 ? '#FFD700' : i === 0 ? '#C0C0C0' : '#CD7F32' }}
              >
                {podiumLabels[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Full scoreboard for 4+ teams */}
        {sorted.length > 3 && (
          <div className="relative z-10 card-surface rounded-2xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-ink/60 text-center">Weitere Platzierungen</h3>
            {sorted.slice(3).map((group, i) => (
              <div key={group.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${group.color}20` }}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink/60">{i + 4}.</span>
                  <span className="font-semibold">{group.name}</span>
                </div>
                <span className="font-bold">{group.score} Pkt.</span>
              </div>
            ))}
          </div>
        )}

        <div className="relative z-10">
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-4 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90"
          >
            Zurück zum Hauptmenü
          </button>
        </div>
      </main>
    );
  }

  // Fallback
  return (
    <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-display">Spiel läuft</h1>
        <p className="text-ink/70 mt-2">
          Karte {game.currentCardIndex + 1} / {game.deck.length}
        </p>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <p className="text-center text-lg">
          Spielansicht wird in der nächsten Phase implementiert...
        </p>
        <p className="text-center text-sm text-ink/60 mt-2">
          Aktuell in {game.state} Modus
        </p>
      </div>

      {/* Gruppen-Scoreboard */}
      <details className="card-surface rounded-2xl group">
        <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between select-none">
          <span className="font-semibold">🏆 Scoreboard</span>
          <span className="text-ink/50 text-sm transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="px-6 pb-6 space-y-3">
        {groupList
          .sort((a, b) => b.score - a.score)
          .map((group, index) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                <span className="font-semibold">{group.name}</span>
              </div>
              <span className="text-xl font-bold">{group.score}</span>
            </div>
          ))}
        </div>
      </details>
    </main>
  );
}


