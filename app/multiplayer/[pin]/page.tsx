"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  subscribeToGame,
  setGroupReady,
  startGame,
  leaveGame,
  placeCardInTimeline,
  nextCard,
  nextTurn,
  sendPlaybackControl,
  requestFlexButton,
  confirmFlexButton,
  rejectFlexButton,
  editGroupScore,
  endGame
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
  const [placementResult, setPlacementResult] = useState<'correct' | 'wrong' | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const mediaEmbedRef = useRef<MediaEmbedHandle>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  
  // Host-Funktionen
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<number | null>(null);
  const [showFlexConfirm, setShowFlexConfirm] = useState(false);

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

  const handlePlaceCard = async (position: number) => {
    if (!session || !game || !game.currentCardId || isProcessing) return;
    // Nur die aktive Gruppe darf setzen
    if (game.currentTurnGroupId && game.currentTurnGroupId !== session.groupId) return;

    setIsProcessing(true);
    setPlacementResult(null);
    setPlacementError(null);
    
    try {
      const card = getCardById(game.currentCardId);
      if (!card) {
        setPlacementError('Karte nicht gefunden – bitte Seite neu laden.');
        setIsProcessing(false);
        return;
      }

      const correct = await placeCardInTimeline(pin, session.groupId, card, position);
      setPlacementResult(correct ? 'correct' : 'wrong');

      // Kein automatisches Weiterleiten mehr - Team muss auf "Weiter" klicken
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
    setPlacementError(null); // Reset für nächste Runde
    
    try {
      await nextCard(pin);
      await nextTurn(pin);
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
    if (!session?.isHost || !game?.playbackControl) return;
    
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
  }, [game?.playbackControl, game?.currentCardId, session?.isHost]);
  
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
            onClick={() => router.push('/multiplayer')}
            className="px-6 py-3 bg-ink text-inkDark rounded-lg"
          >
            Zurück zur Lobby
          </button>
        </div>
      </main>
    );
  }

  const currentGroup = game.groups[session.groupId];
  const groupList = Object.values(game.groups).filter(g => !g.isHost); // Spielleiter aus Liste entfernen
  const allReady = groupList.every(g => g.isReady);

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
        {session.isHost && (
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
        {!session.isHost && (
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
    const isActiveTurn = game.currentTurnGroupId === session.groupId && !session.isHost; // Host kann nicht spielen
    const isHostSession = session.isHost;
    const canControlMedia = isActiveTurn || isHostSession;

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
          <p className="text-ink/70">
            Karte {game.currentCardIndex + 1} / {game.deck.length}
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-ink/60">
            <span>PIN: {pin}</span>
            <button onClick={copyPin} className="hover:opacity-70">📋</button>
          </div>
          {game.currentTurnGroupId && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-ink/10 text-ink font-semibold">
              Am Zug: {game.groups[game.currentTurnGroupId]?.name || 'Team'}
            </div>
          )}
        </div>

        {/* Host-Panel: Flex-Bestätigung und Score-Editing */}
        {session.isHost && (
          <div className="card-surface rounded-2xl p-6 space-y-4 border-2 border-green-500/30">
            <h2 className="text-lg font-semibold text-green-700">👑 Host-Steuerung</h2>
            
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
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Spiel beenden
            </button>
          </div>
        )}

        {/* Aktuelle Karte */}
        {currentCard && (
          <div className={`card-surface rounded-2xl p-6 space-y-4 ${(!isActiveTurn && !isHostSession) ? 'opacity-70 pointer-events-none select-none' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Musikfrage</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-ink/10">
                {currentCard.difficulty}
              </span>
            </div>

            <p className="text-lg">{currentCard.cue}</p>

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

          </div>
        )}

        {/* Timeline mit Platzierungs-Optionen */}
        {placementResult === null && currentCard && isActiveTurn && (() => {
          const timeline = currentGroup.timeline || [];
          // Erstelle Display-Timeline: Referenzkarte + platzierte Karten
          const displayTimeline = [];
          if (game.referenceCard) {
            displayTimeline.push(game.referenceCard);
          }
          displayTimeline.push(...timeline);
          // Sortiere chronologisch
          displayTimeline.sort((a, b) => a.year - b.year);
          
          // Wenn nur Referenzkarte: Einfache Vor/Nach Buttons
          if (displayTimeline.length === 1) {
            const ref = displayTimeline[0];
            return (
              <div className="card-surface rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  Platziere die Karte in der Timeline von {currentGroup.name}
                </h3>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => handlePlaceCard(0)}
                    disabled={isProcessing}
                    className="p-4 rounded-xl border-2 border-ink/30 hover:border-ink hover:bg-ink/5 transition-all disabled:opacity-50"
                  >
                    ← Davor
                  </button>
                  <div className="flex-shrink-0 rounded-lg border-2 border-yellow-500 bg-yellow-100 text-inkDark px-4 py-3 min-w-[140px]">
                    <p className="text-xs font-bold">{ref.year}</p>
                    <p className="text-xs text-inkDark/70 truncate">{getShortTimelineLabel(ref.answer || ref.title || '')}</p>
                    <p className="text-xs text-yellow-700 mt-1">Referenz</p>
                  </div>
                  <button
                    onClick={() => handlePlaceCard(1)}
                    disabled={isProcessing}
                    className="p-4 rounded-xl border-2 border-ink/30 hover:border-ink hover:bg-ink/5 transition-all disabled:opacity-50"
                  >
                    Danach →
                  </button>
                </div>
              </div>
            );
          }

          // Timeline mit Karten und Platzierungs-Buttons
          return (
            <div className="card-surface rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-center">
                Platziere die Karte in der Timeline von {currentGroup.name}
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {displayTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    {idx === 0 && (
                      <button
                        type="button"
                        onClick={() => handlePlaceCard(0)}
                        disabled={isProcessing}
                        className="flex-shrink-0 rounded-lg border-2 border-dashed border-ink/30 bg-ink/5 px-3 py-2 text-xs hover:border-ink hover:bg-ink/10 transition-colors mx-1 disabled:opacity-50"
                      >
                        ← Davor
                      </button>
                    )}
                    <div className={`flex-shrink-0 rounded-lg border-2 px-4 py-3 min-w-[120px] ${item.id === game.referenceCard?.id ? 'border-yellow-500 bg-yellow-100 text-inkDark' : 'border-ink bg-ink/10'}`}>
                      <p className={`text-xs font-bold ${item.id === game.referenceCard?.id ? '' : 'text-ink'}`}>{item.year}</p>
                      <p className={`text-xs truncate ${item.id === game.referenceCard?.id ? 'text-inkDark/70' : 'text-ink/70'}`}>{getShortTimelineLabel(item.answer || item.title || '')}</p>
                      {item.id === game.referenceCard?.id && <p className="text-xs text-yellow-700 mt-1">Referenz</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlaceCard(idx + 1)}
                      disabled={isProcessing}
                      className="flex-shrink-0 rounded-lg border-2 border-dashed border-ink/30 bg-ink/5 px-3 py-2 text-xs hover:border-ink hover:bg-ink/10 transition-colors mx-1 disabled:opacity-50"
                    >
                      {idx === displayTimeline.length - 1 ? 'Danach →' : '↔'}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-ink/60">
                Wähle eine Lücke, um die neue Karte korrekt einzuordnen
              </p>
            </div>
          );
        })()}

        {/* Placement error anzeigen */}
        {placementError && (
          <div className="card-surface rounded-2xl p-4 border-2 border-red-500/50 bg-red-50/10">
            <p className="text-red-600 font-semibold">⚠️ {placementError}</p>
            <button
              onClick={() => setPlacementError(null)}
              className="mt-2 text-sm text-red-500 underline"
            >
              Schließen
            </button>
          </div>
        )}

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

          return (
            <div className={`card-surface rounded-2xl p-6 space-y-4 ${isHostSession ? '' : 'opacity-60'}`}>
              <h3 className="text-sm font-semibold text-center">
                {timelineLabel}
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {displayTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    {idx > 0 && <div className="text-ink/30 mx-1">↔</div>}
                    <div className={`flex-shrink-0 rounded-lg border-2 px-4 py-3 min-w-[120px] ${item.id === game.referenceCard?.id ? 'border-yellow-500 bg-yellow-100 text-inkDark' : 'border-ink bg-ink/10'}`}>
                      <p className={`text-xs font-bold ${item.id === game.referenceCard?.id ? '' : 'text-ink'}`}>{item.year}</p>
                      <p className={`text-xs truncate ${item.id === game.referenceCard?.id ? 'text-inkDark/70' : 'text-ink/70'}`}>{getShortTimelineLabel(item.answer || item.title || '')}</p>
                      {item.id === game.referenceCard?.id && <p className="text-xs text-yellow-700 mt-1">Referenz</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Feedback nach Platzierung - NUR für aktives Team */}
        {placementResult && currentCard && isActiveTurn && (
          <div className="card-surface rounded-2xl p-6 space-y-4">
            {placementResult === 'correct' ? (
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="text-6xl">✅</div>
                  <p className="text-xl font-semibold text-green-600">Richtig!</p>
                </div>
                
                {/* Song-Info anzeigen */}
                <div className="border-t-2 border-ink/10 pt-4 space-y-3">
                  <h3 className="text-lg font-semibold text-center">Es war:</h3>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-ink">{currentCard.answer}</p>
                    <div className="text-lg text-ink/70">
                      <span className="font-semibold">{currentCard.year}</span>
                    </div>
                  </div>
                </div>

                {/* Weiter-Button nur für aktives Team */}
                {isActiveTurn && (
                  <button
                    onClick={handleNextCard}
                    disabled={isProcessing}
                    className="w-full mt-4 px-6 py-4 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Weiter zum nächsten Team
                  </button>
                )}
                
                {!isActiveTurn && (
                  <p className="text-center text-sm text-ink/60 mt-4">
                    Warte auf das aktive Team...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-6xl">❌</div>
                  <p className="text-xl font-semibold text-red-600">Leider falsch</p>
                </div>
                
                {/* Lösung anzeigen */}
                <div className="border-t-2 border-ink/10 pt-4 space-y-3">
                  <h3 className="text-lg font-semibold text-center">Lösung:</h3>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-ink">{currentCard.year}</div>
                    <p className="text-lg text-ink/80">{currentCard.answer}</p>
                  </div>
                </div>

                {/* Weiter-Button nur für aktives Team */}
                {isActiveTurn && (
                  <button
                    onClick={handleNextCard}
                    disabled={isProcessing}
                    className="w-full mt-4 px-6 py-4 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Weiter zum nächsten Team
                  </button>
                )}
                
                {!isActiveTurn && (
                  <p className="text-center text-sm text-ink/60 mt-4">
                    Warte auf das aktive Team...
                  </p>
                )}
              </div>
            )}
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
                <span className="text-xl font-bold">{group.score}</span>
              </div>
            ))}
        </div>
      </main>
    );
  }

  // Endbildschirm
  if (game.state === 'finished') {
    const winner = groupList.sort((a, b) => b.score - a.score)[0];
    const isWinner = winner?.id === session.groupId;

    return (
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h1 className="text-4xl font-display">Spiel beendet!</h1>
          {isWinner ? (
            <p className="text-2xl text-green-600 font-semibold">
              🏆 Glückwunsch, ihr habt gewonnen!
            </p>
          ) : (
            <p className="text-xl">
              Gewinner: {winner?.name} 🏆
            </p>
          )}
        </div>

        {/* Endstand */}
        <div className="card-surface rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-center">Endstand</h2>
          {groupList
            .sort((a, b) => b.score - a.score)
            .map((group, index) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: `${group.color}20` }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="text-xl font-semibold">
                    {group.name}
                    {group.id === session.groupId && ' (Du)'}
                  </span>
                </div>
                <span className="text-2xl font-bold">{group.score} Punkte</span>
              </div>
            ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/multiplayer')}
            className="flex-1 px-6 py-4 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90"
          >
            Zurück zur Lobby
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


