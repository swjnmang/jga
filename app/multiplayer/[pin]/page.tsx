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
  broadcastPendingPosition,
  broadcastPlacementResult,
  requestFlexButton,
  confirmFlexButton,
  rejectFlexButton,
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
} from '@/lib/multiplayerService';
import { GameSession, GroupData } from '@/lib/multiplayerTypes';
import { getCardById } from '@/lib/cards';
import { MediaEmbed, MediaEmbedHandle } from '@/components/MediaEmbed';

interface SessionInfo {
  pin: string;
  groupId: string;
  playerId: string;
  groupName: string;
  playerName: string;
  isHost: boolean;
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
  const backGuardPushed = useRef(false); // ensures dummy history entry is pushed only once
  const [placementResult, setPlacementResult] = useState<'correct' | 'wrong' | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null); // Gewählte Position vor Bestätigung
  const mediaEmbedRef = useRef<MediaEmbedHandle>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const prevTurnGroupRef = useRef<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  
  // Host-Funktionen
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<number | null>(null);
  const [showFlexConfirm, setShowFlexConfirm] = useState(false);
  const [showTriviaAnswer, setShowTriviaAnswer] = useState(false);
  const [schaetzInput, setSchaetzInput] = useState('');
  const [schaetzSubmitted, setSchaetzSubmitted] = useState(false);

  const [isBanning, setIsBanning] = useState(false);

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
  }, [game?.currentCardIndex, game?.state]);

  // Clear local placement result whenever the card changes (new round)
  // Without this, a previous wrong/correct result reappears when it's the group's turn again
  useEffect(() => {
    setPlacementResult(null);
    setPlacementError(null);
    setSelectedPosition(null);
  }, [game?.currentCardId]);

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

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/multiplayer?pin=${pin}`;
    navigator.clipboard.writeText(inviteUrl);
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
    
    try {
      await broadcastPlacementResult(pin, null); // clear result flag
      await nextCard(pin); // handles card + group rotation (incl. category round-robin for Timeline)
      if (game.mode !== 'timeline') {
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
    const isHost = session.isHost || game.hostId === session.groupId;
    if (!isHost || !game.playbackControl) return;

    const control = game.playbackControl;
    const currentCardId = game.currentCardId;
    
    if (control.cardId !== currentCardId) return; // Ignore old commands
    
    if (control.action === 'play') {
      mediaEmbedRef.current?.play();
      setIsMediaPlaying(true);
    } else if (control.action === 'pause') {
      mediaEmbedRef.current?.pause();
      setIsMediaPlaying(false);
    } else if (control.action === 'stop') {
      mediaEmbedRef.current?.stop();
      setIsMediaPlaying(false);
    }
  }, [game?.playbackControl, game?.currentCardId, session?.isHost, game?.hostId]);

  // Warn host before accidental browser refresh / back navigation
  useEffect(() => {
    if (!game || !session) return;
    const isHost = session.isHost || game.hostId === session.groupId;
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
    const isHost = session.isHost || game.hostId === session.groupId;
    if (!isHost) return;
    if (getCardById(game.currentCardId)) return; // card found – nothing to do
    const t = setTimeout(async () => {
      try { await skipCard(pin); } catch (e) { console.error('auto-skip failed', e); }
    }, 1500);
    return () => clearTimeout(t);
  }, [game?.currentCardId, game?.state, game?.mode, session?.isHost, game?.hostId, session?.groupId, pin]);

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
  const effectiveIsHost = session.isHost || game.hostId === session.groupId;
  const groupList = Object.values(game.groups).filter(g => !g.isHost); // Spielleiter aus Liste entfernen
  const allReady = groupList.every(g => g.isReady);

  const CATEGORY_LABELS: Record<string, string> = {
    quote: 'Berühmte Zitate', image: 'Bilder erkennen', flag: 'Flaggen erkennen',
    outline: 'Länder am Umriss erkennen', music: 'Musik', natur: 'Natur & Technik',
    filmserien: 'Filme & Serien', schaetzfragen: 'Schätzfragen',
    religionglaube: 'Religion & Glaube', sportfreizeit: 'Sport & Freizeit',
    geogeschichte: 'Geographie & Geschichte',
  };

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
      c => !(game.bannedCategories ?? []).includes(c) && c !== 'image'
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
                  🚫 {CATEGORY_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Aktuell an der Reihe */}
        <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-amber-400/40 bg-amber-50/10">
          <p className="text-center font-semibold text-amber-700">
            {isMyTurn
              ? '👉 Du bist dran — wähle eine Kategorie zum Bannen'
              : `⏳ ${currentBanGroup?.name ?? '...'} wählt gerade...`}
          </p>

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
                    🚫 {CATEGORY_LABELS[c] ?? c}
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
                  {g?.avatar && <span className="text-base">{g.avatar}</span>}
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g?.color }} />
                  <span>{g?.name ?? gid}</span>
                  {done && (
                    <span className="ml-auto text-xs">
                      {banned[i] ? `🚫 ${CATEGORY_LABELS[banned[i]] ?? banned[i]}` : '✅ Nichts gebannt'}
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
            onClick={copyInviteLink}
            className="mt-2 inline-flex items-center gap-2 text-sm text-ink/70 hover:text-ink transition-colors"
          >
            <span>🔗</span>
            <span>Einladungslink kopieren</span>
          </button>
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
              <div className="space-y-2">
                <p className="text-sm font-semibold">Spielende Gruppen ({groupList.length}):</p>
                <div className="space-y-1 text-sm">
                  {groupList.map(g => (
                    <div key={g.id} className="flex items-center gap-2">
                      {g.avatar && <span className="text-lg">{g.avatar}</span>}
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
                      {group.avatar && <span className="text-2xl">{group.avatar}</span>}
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

            {!allReady && groupList.length >= 2 && (
              <p className="text-center text-sm text-ink/60">
                Warte darauf, dass der Spielleiter das Spiel startet...
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

      const categoryLabels: Record<string, string> = {
        music: 'Musikfrage', quote: 'Zitat', film: 'Film & Serie', filmserien: 'Film & Serie',
        flag: 'Flagge', outline: 'Umriss', natur: 'Natur & Technik', naturtechnik: 'Natur & Technik',
        triviaextra: 'Trivia', schaetzfragen: 'Schätzfrage', geogeschichte: 'Geo & Geschichte',
        religionglaube: 'Religion & Glaube', sportfreizeit: 'Sport & Freizeit', popkultur: 'Popkultur',
      };
      const categoryLabel = categoryLabels[currentCard.category] ?? currentCard.category;

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

      const catLabel = (cat: string) => ({
        music: 'Musik', quote: 'Zitat', film: 'Film', filmserien: 'Film',
        flag: 'Flagge', outline: 'Umriss', natur: 'Natur', naturtechnik: 'Natur',
        triviaextra: 'Trivia', schaetzfragen: 'Schätzfr.', geogeschichte: 'Geo',
        religionglaube: 'Religion', sportfreizeit: 'Sport', popkultur: 'Popkultur',
      } as Record<string, string>)[cat] ?? cat;

      return (
        <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display">Trivia Multiplayer</h1>
            <p className="text-ink/70">Frage {game.currentCardIndex + 1} / {game.deck.length}</p>
            <div className="inline-flex items-center gap-2 text-sm text-ink/60">
              <span>PIN: {pin}</span>
            </div>
            {activeGroup && (
              <div className="mt-3 w-full px-4 py-3 rounded-xl bg-ink/15 text-ink font-bold text-xl">
                🎮 Am Zug: {activeGroup.name}
              </div>
            )}
          </div>

          {/* Scoreboard mit Kategorien-Fortschritt */}
          <div className="card-surface rounded-2xl p-4 space-y-3">
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
                          {completed.includes(cat) ? '✓ ' : ''}{catLabel(cat)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── SCHÄTZFRAGE: alle Gruppen antworten gleichzeitig ── */}
          {currentCard.category === 'schaetzfragen' ? (() => {
            const playingGroups = groupList.filter(g => !g.isHost);
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
                      <h3 className="text-xl font-bold text-center">🏆 Auswertung Schätzfrage</h3>

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

                      {/* Weiter-Button nur für Host */}
                      {effectiveIsHost && (
                        <button
                          onClick={handleSchaetzWeiter}
                          disabled={isProcessing}
                          className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {isProcessing ? '⏳ Weiter…' : '▶️ Weiter — nächste Frage'}
                        </button>
                      )}
                      {!effectiveIsHost && (
                        <p className="text-center text-sm text-ink/60 animate-pulse">Warte auf Spielleiter…</p>
                      )}
                    </div>
                  );
                })()}

                {/* Normale Anzeige nur wenn kein Ergebnis läuft */}
                {!game.schaetzResult && <>
                {/* Frage-Karte */}
                <div className="card-surface rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm px-3 py-1 rounded-full bg-ink/10 font-semibold">{categoryLabel}</span>
                    {timeLeft !== null && (
                      <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-500/20 text-red-600 animate-pulse' : 'bg-ink/10'}`}>
                        ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-semibold">{triviaDisplayCue(currentCard)}</p>

                  {/* Spieler-Eingabe */}
                  {!effectiveIsHost && (() => {
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

                {/* Host: Übersicht + Auswertung */}
                {effectiveIsHost && (
                  <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30">
                    <h3 className="text-lg font-semibold text-green-700">👑 Spielleitung — Schätzfrage</h3>
                    <p className="text-sm text-ink/60">{submittedCount}/{playingGroups.length} Gruppen haben geantwortet</p>

                    {/* Eingaben der Gruppen */}
                    <div className="space-y-2">
                      {playingGroups.map(g => (
                        <div key={g.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: `${g.color}20` }}>
                          <span className="font-semibold">{g.name}</span>
                          <span className="font-mono font-bold">
                            {g.schaetzSubmission != null && g.schaetzSubmission !== ''
                              ? `${g.schaetzSubmission}${unit ? ` ${unit}` : ''}`
                              : <span className="text-ink/40 italic text-sm">Noch nicht eingereicht</span>}
                          </span>
                        </div>
                      ))}
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
              </>}
            </>
            );
          })() : (
          <>
          {/* ── STANDARD TRIVIA FRAGE ── */}
          <div className="card-surface rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm px-3 py-1 rounded-full bg-ink/10 font-semibold">{categoryLabel}</span>
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
              effectiveIsHost ? (
                <MediaEmbed
                  key="trivia-host-media"
                  ref={mediaEmbedRef}
                  card={currentCard}
                  preference={currentCard.category === 'music' ? 'spotify' : 'youtube'}
                />
              ) : currentCard.category === 'music' ? (
                <div className="rounded-2xl card-surface bg-ink/5 p-6 text-center space-y-3">
                  <div className="text-5xl">🎵</div>
                  <p className="text-sm font-semibold">Der Spielleiter steuert die Musikwiedergabe</p>
                </div>
              ) : (
                <MediaEmbed card={currentCard} preference="youtube" />
              )
            )}

            {isMyTurn && (
              <div className="rounded-xl bg-green-500/10 border-2 border-green-500 px-4 py-3">
                <p className="text-green-700 font-bold">🎤 Ihr seid dran! Beantwortet die Frage laut.</p>
              </div>
            )}
            {!isMyTurn && !effectiveIsHost && (
              <p className="text-sm text-ink/60 text-center">Warte auf die Antwort von {activeGroup?.name ?? 'dem aktiven Team'}…</p>
            )}
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

          {/* Host-Steuerung */}
          {effectiveIsHost && (
            <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30">
              <h3 className="text-lg font-semibold text-green-700">👑 Spielleitung</h3>

              {/* Bewertungs-Buttons */}
              <p className="text-base font-semibold text-center text-ink/80">
                Hat Gruppe <span className="font-bold">&bdquo;{activeGroup?.name ?? '…'}&ldquo;</span> die Frage korrekt beantwortet?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTriviaAnswer(true)}
                  disabled={isProcessing}
                  className="px-4 py-5 bg-green-600 text-white rounded-xl font-bold text-xl hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Richtig
                </button>
                <button
                  onClick={() => handleTriviaAnswer(false)}
                  disabled={isProcessing}
                  className="px-4 py-5 bg-red-600 text-white rounded-xl font-bold text-xl hover:bg-red-700 disabled:opacity-50"
                >
                  ❌ Falsch
                </button>
              </div>
              <p className="text-xs text-ink/50 text-center">Nach Klick: nächste Frage, nächstes Team dran</p>

              {/* Antwort anzeigen */}
              <button
                onClick={() => setShowTriviaAnswer(v => !v)}
                className={`w-full px-4 py-4 rounded-xl font-bold text-lg transition-colors ${
                  showTriviaAnswer
                    ? 'bg-sky-900 text-sky-200 hover:bg-sky-800'
                    : 'bg-sky-700 text-white hover:bg-sky-600'
                }`}
              >
                {showTriviaAnswer ? '🙈 Antwort verbergen' : '👁 Korrekte Antwort anzeigen'}
              </button>
              {showTriviaAnswer && (
                <div className="rounded-xl bg-yellow-100/20 border-2 border-yellow-400 px-4 py-3">
                  <p className="text-sm font-semibold text-yellow-700 mb-1">Korrekte Antwort:</p>
                  <p className="text-xl font-bold">{currentCard.category === 'music' ? currentCard.answer.replace(/ [–—] -?\d+, /, ' — ') : currentCard.answer}</p>
                  {currentCard.year && (
                    <p className="text-sm text-ink/60 mt-1">Jahr: {currentCard.year}</p>
                  )}
                </div>
              )}

              {/* Host-Panel (Score-Editing + Spiel beenden) */}
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
            </div>
          )}
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
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display">Timeline Multiplayer</h1>
          {!effectiveIsHost && (
            <>
              <p className="text-ink/70">
                Karte {game.currentCardIndex + 1} / {game.deck.length}
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-ink/60">
                <span>PIN: {pin}</span>
                <button onClick={copyPin} className="hover:opacity-70">📋</button>
              </div>
            </>
          )}
          {game.currentTurnGroupId && (
            <div className="mt-3 w-full px-4 py-3 rounded-xl bg-ink/15 text-ink font-bold text-xl">
              🎮 Am Zug: {game.groups[game.currentTurnGroupId]?.name || 'Team'}
            </div>
          )}
        </div>

        {/* Host-Panel: Flex-Bestätigung und Score-Editing */}
        {effectiveIsHost && (
          <details className="card-surface rounded-2xl border-2 border-green-500/30 group">
            <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between select-none">
              <span className="text-lg font-semibold text-green-700">👑 Einstellungen</span>
              <span className="text-ink/50 text-sm transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="px-6 pb-6 space-y-4">

              {/* Flex-Button Bestätigung */}
              {game.flexPendingGroupId && (
                <div className="rounded-xl bg-yellow-100/20 border-2 border-yellow-500 p-4 space-y-3">
                  <p className="font-semibold text-yellow-700">
                    {game.groups[game.flexPendingGroupId]?.name} fordert Flex-Button an!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmFlex}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      ✓ Bestätigen (+1 Punkt)
                    </button>
                    <button
                      onClick={handleRejectFlex}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                    >
                      ✗ Ablehnen
                    </button>
                  </div>
                </div>
              )}

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

        {/* Aktuelle Karte */}
        {currentCard && (() => {
          const categoryLabels: Record<string, string> = {
            music: 'Musikfrage',
            quote: 'Zitat',
            film: 'Film & Serie',
            filmserien: 'Film & Serie',
            flag: 'Flagge',
            outline: 'Umriss',
            natur: 'Natur & Technik',
            naturtechnik: 'Natur & Technik',
            triviaextra: 'Trivia',
            schaetzfragen: 'Schätzfrage',
            geogeschichte: 'Geo & Geschichte',
            religionglaube: 'Religion & Glaube',
            sportfreizeit: 'Sport & Freizeit',
            popkultur: 'Popkultur',
          };
          const categoryLabel = categoryLabels[currentCard.category] ?? currentCard.category;
          return (
          <div className={`card-surface rounded-2xl p-6 space-y-4 ${(!isActiveTurn && !isHostSession) ? 'opacity-70 pointer-events-none select-none' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{categoryLabel}</h2>
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

            <p className="text-lg">{currentCard.category === 'quote' ? 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?' : currentCard.category === 'filmserien' ? currentCard.cue + ' – Und in welchem Jahr war das?' : currentCard.cue}</p>

            {currentCard.sources && (
              <div className="relative">
                {/* Host sieht volle Kontrolle */}
                {isHostSession ? (
                  <MediaEmbed 
                    ref={mediaEmbedRef}
                    card={currentCard}
                    preference={currentCard.category === 'music' ? 'spotify' : 'youtube'}
                  />
                ) : (
                  /* Mitspieler: Musik nur Symbol, andere Medien vollständig */
                  currentCard.category === 'music' ? (
                    <div className="rounded-2xl card-surface bg-ink/5 p-8 text-center space-y-4">
                      <div className="text-6xl">🎵</div>
                      <p className="text-lg font-semibold text-ink">
                        Musikfrage
                      </p>
                      <p className="text-sm text-ink/70">
                        Der Host steuert die Musikwiedergabe
                      </p>
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
          </div>
          );
        })()}

        {/* Timeline mit Platzierungs-Optionen */}
        {placementResult === null && currentCard && isActiveTurn && (() => {
          const timeline = Array.isArray(currentGroup.timeline) ? currentGroup.timeline : [];
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
            <div className="card-surface rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-center">
                Wo liegt dieses Lied in der Timeline von <span className="text-ink">{currentGroup.name}</span>?
              </h3>
              <p className="text-xs text-center text-ink/60">
                Wähle eine Position — dann „Ergebnis einreichen"
              </p>

              {/* Timeline + Positions-Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 justify-start">
                {/* Button vor Position 0 */}
                <button
                  type="button"
                  onClick={() => handleSelectPosition(0)}
                  disabled={isProcessing}
                  className={`flex-shrink-0 rounded-lg border-2 px-3 py-3 text-xs font-semibold transition-all disabled:opacity-50 ${
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
                        ? 'border-yellow-500 bg-yellow-100 text-inkDark'
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
                      className={`flex-shrink-0 rounded-lg border-2 px-3 py-3 text-xs font-semibold transition-all disabled:opacity-50 ${
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

              {/* Ausgewählte Position anzeigen */}
              {selectedPosition !== null && (
                <p className="text-center text-sm font-semibold text-ink">
                  Gewählte Position: <span className="text-ink/80">{positionLabel(selectedPosition)}</span>
                </p>
              )}

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
                className="w-full py-4 rounded-xl bg-ink text-inkDark font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Wird geprüft...' : '✅ Ergebnis einreichen'}
              </button>
            </div>
          );
        })()}

        {/* Nicht am Zug - Timeline nur anzeigen */}
        {!isActiveTurn && placementResult === null && (() => {
          // Host zeigt Timeline der aktiven Gruppe (nicht seine eigene)
          const activeGroupId = isHostSession ? game.currentTurnGroupId : session.groupId;
          const displayGroup = activeGroupId ? game.groups[activeGroupId] : currentGroup;
          const timeline = displayGroup?.timeline || [];          
          const timelineLabel = isHostSession
            ? `Timeline von ${displayGroup?.name ?? 'Team'}`
            : 'Deine Timeline';
          // Erstelle Display-Timeline: Referenzkarte + platzierte Karten
          const displayTimeline = [];
          if (game.referenceCard) {
            displayTimeline.push(game.referenceCard);
          }
          displayTimeline.push(...timeline);
          // Sortiere chronologisch
          displayTimeline.sort((a, b) => a.year - b.year);
          
          if (displayTimeline.length === 0) return null;

          const pendingPos = isHostSession ? (displayGroup?.pendingPosition ?? null) : null;

          // Build display with ghost card inserted at pendingPos
          const ghostCard = isHostSession && pendingPos !== null && currentCard ? currentCard : null;

          const renderGhost = () => (
            <div className="flex items-center flex-shrink-0">
              <div className="text-ink/30 mx-1">↔</div>
              <div className="flex-shrink-0 rounded-lg border-2 border-dashed border-blue-400 bg-blue-400/10 px-4 py-3 min-w-[120px] animate-pulse">
                <p className="text-xs font-bold text-blue-400">???</p>
                <p className="text-xs truncate text-blue-400/80">???</p>
                <p className="text-xs truncate text-blue-400/60">???</p>
              </div>
            </div>
          );

          return (
            <div className={`card-surface rounded-2xl p-6 space-y-4 ${isHostSession ? '' : 'opacity-60'}`}>
              <h3 className="text-sm font-semibold text-center">
                {timelineLabel}
                {isHostSession && pendingPos !== null && (
                  <span className="ml-2 text-blue-400 text-xs">(wählt Position…)</span>
                )}
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {/* Ghost before position 0 */}
                {ghostCard && pendingPos === 0 && renderGhost()}
                {displayTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    {idx > 0 && <div className="text-ink/30 mx-1">↔</div>}
                    <div className={`flex-shrink-0 rounded-lg border-2 px-4 py-3 min-w-[120px] ${item.id === game.referenceCard?.id ? 'border-yellow-500 bg-yellow-100 text-inkDark' : 'border-ink bg-ink/10'}`}>
                      <p className={`text-xs font-bold ${item.id === game.referenceCard?.id ? '' : 'text-ink'}`}>{item.year}</p>
                      {item.id === game.referenceCard?.id ? (
                        <p className="text-xs text-yellow-700 mt-1">Referenz</p>
                      ) : (
                        <>
                          <p className="text-xs truncate text-ink/70">{item.hint || ''}</p>
                          <p className="text-xs truncate text-ink/50">{item.title || ''}</p>
                        </>
                      )}
                    </div>
                    {/* Ghost after this card */}
                    {ghostCard && pendingPos === idx + 1 && renderGhost()}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Feedback nach Platzierung — aktives Team sieht Ergebnis, Host hat den "Weiter"-Button */}
        {(placementResult && currentCard && isActiveTurn) && (
          <div className="card-surface rounded-2xl p-6 space-y-4">
            {placementResult === 'correct' ? (
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="text-6xl">✅</div>
                  <p className="text-xl font-semibold text-green-600">Richtig!</p>
                </div>
                <div className="border-t-2 border-ink/10 pt-4 space-y-3">
                  <h3 className="text-lg font-semibold text-center">Es war:</h3>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-ink">
                      {currentCard.category === 'music'
                        ? `${currentCard.hint} — ${currentCard.title}`
                        : currentCard.answer}
                    </p>
                    <div className="text-lg text-ink/70">
                      <span className="font-semibold">{currentCard.year}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-ink/60 mt-4">
                  Warte auf den Spielleiter…
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-6xl">❌</div>
                  <p className="text-xl font-semibold text-red-600">Leider falsch</p>
                </div>
                <div className="border-t-2 border-ink/10 pt-4 space-y-3">
                  <h3 className="text-lg font-semibold text-center">Lösung:</h3>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-ink">{currentCard.year}</div>
                    <p className="text-lg text-ink/80">
                      {currentCard.category === 'music'
                        ? `${currentCard.hint} — ${currentCard.title}`
                        : currentCard.answer}
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-ink/60 mt-4">
                  Warte auf den Spielleiter…
                </p>
              </div>
            )}
          </div>
        )}

        {/* Host-Ansicht: Ergebnis der Platzierung + "Weiter"-Button */}
        {isHostSession && game.pendingResult && currentCard && (
          <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-ink/20">
            {game.pendingResult === 'correct' ? (
              <div className="text-center space-y-2">
                <div className="text-5xl">✅</div>
                <p className="text-lg font-semibold text-green-600">Richtig!</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-5xl">❌</div>
                <p className="text-lg font-semibold text-red-600">Falsch!</p>
              </div>
            )}
            <div className="border-t-2 border-ink/10 pt-4 text-center space-y-1">
              <p className="text-xl font-bold">
                {currentCard.category === 'music'
                  ? `${currentCard.hint} — ${currentCard.title}`
                  : currentCard.answer}
              </p>
              <p className="text-lg text-ink/70 font-semibold">{currentCard.year}</p>
            </div>
            <button
              onClick={handleNextCard}
              disabled={isProcessing}
              className="w-full mt-2 px-6 py-4 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-lg"
            >
              {isProcessing ? '⏳ Bitte warten…' : 'Weiter zum nächsten Team →'}
            </button>
          </div>
        )}

        {/* Live Scoreboard */}
        <div className="card-surface rounded-2xl p-6 space-y-3">
          <h3 className="font-semibold">Live Scoreboard</h3>
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
                <span className="text-xl font-bold">{group.score} / {game.timelineWinTarget ?? 10}</span>
              </div>
            ))}
        </div>
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
      <div className="card-surface rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Scoreboard</h3>
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
    </main>
  );
}


