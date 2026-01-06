"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  subscribeToGame,
  setGroupReady,
  startGame,
  leaveGame,
  placeCard,
  nextCard
} from '@/lib/multiplayerService';
import { GameSession, GroupData } from '@/lib/multiplayerTypes';
import { getCardById } from '@/lib/cards';
import { MediaEmbed } from '@/components/MediaEmbed';

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
  const [myPlacement, setMyPlacement] = useState<'before' | 'after' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePlaceCard = async (placement: 'before' | 'after') => {
    if (!session || !game || !game.currentCardId || isProcessing) return;
    
    setIsProcessing(true);
    setMyPlacement(placement);
    
    try {
      if (!game.currentCardId) {
        setError('Keine aktuelle Karte vorhanden');
        return;
      }
      
      const card = getCardById(game.currentCardId);
      if (!card) {
        setError('Karte nicht gefunden');
        return;
      }
      
      const isCorrect = (placement === 'before' && card.year < 1950) || 
                       (placement === 'after' && card.year >= 1950);
      
      await placeCard(pin, session.groupId, card.id, card.year, isCorrect);
    } catch (err) {
      console.error('Error placing card:', err);
      setError('Fehler beim Platzieren der Karte');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleNextCard = async () => {
    if (!session || !game || isProcessing) return;
    
    setIsProcessing(true);
    setShowSolution(false);
    setMyPlacement(null);
    
    try {
      await nextCard(pin);
    } catch (err) {
      console.error('Error going to next card:', err);
      setError('Fehler beim Wechseln zur nächsten Karte');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Check if current group has placed
  const hasPlaced = () => {
    if (!game || !session) return false;
    const group = game.groups[session.groupId];
    if (!group || !game.currentCardId || !group.timeline) return false;
    return group.timeline.some(c => c.cardId === game.currentCardId);
  };

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
  const groupList = Object.values(game.groups);
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
        </div>

        {/* Gruppen-Liste */}
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
                      {group.id === game.hostId && ' 👑'}
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
                    <span className="text-ink/40">Nicht bereit</span>
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

        {/* Aktionen */}
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

          {session.isHost && (
            <button
              onClick={handleStartGame}
              disabled={!allReady || groupList.length < 2}
              className="flex-1 px-6 py-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Spiel starten
            </button>
          )}
        </div>

        {session.isHost && !allReady && groupList.length >= 2 && (
          <p className="text-center text-sm text-ink/60">
            Warte darauf, dass alle Gruppen bereit sind...
          </p>
        )}

        {groupList.length < 2 && (
          <p className="text-center text-sm text-ink/60">
            Warte auf weitere Gruppen...
          </p>
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
            </div>
          </div>
        </main>
      );
    }
    
    const currentCard = getCardById(game.currentCardId);
    const groupPlaced = hasPlaced();
    const allGroupsPlaced = groupList.every(g => 
      g.timeline && g.timeline.some(c => c.cardId === game.currentCardId)
    );

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
        </div>

        {/* Aktuelle Karte */}
        {currentCard && (
          <div className="card-surface rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{currentCard.title}</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-ink/10">
                {currentCard.difficulty}
              </span>
            </div>

            <p className="text-lg">{currentCard.cue}</p>

            {currentCard.sources && (
              <MediaEmbed 
                card={currentCard}
                preference="youtube"
              />
            )}

            {currentCard.hint && (
              <div className="text-sm text-ink/70">
                <span className="font-semibold">Hinweis:</span> {currentCard.hint}
              </div>
            )}
          </div>
        )}

        {/* Platzierungs-Optionen */}
        {!groupPlaced && !showSolution && currentCard && (
          <div className="card-surface rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-center">
              Wo ordnest du dieses Ereignis ein?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePlaceCard('before')}
                disabled={isProcessing}
                className="p-6 rounded-xl border-2 border-ink/30 hover:border-ink hover:bg-ink/5 transition-all disabled:opacity-50"
              >
                <div className="text-3xl mb-2">⬅️</div>
                <div className="font-semibold">Vor 1950</div>
                <div className="text-sm text-ink/60 mt-1">Älter</div>
              </button>
              <button
                onClick={() => handlePlaceCard('after')}
                disabled={isProcessing}
                className="p-6 rounded-xl border-2 border-ink/30 hover:border-ink hover:bg-ink/5 transition-all disabled:opacity-50"
              >
                <div className="text-3xl mb-2">➡️</div>
                <div className="font-semibold">Ab 1950</div>
                <div className="text-sm text-ink/60 mt-1">Neuer</div>
              </button>
            </div>
          </div>
        )}

        {/* Warte-Status */}
        {groupPlaced && !showSolution && (
          <div className="card-surface rounded-2xl p-6 text-center space-y-3">
            <div className="text-4xl">⏳</div>
            <p className="font-semibold">Platzierung gespeichert!</p>
            <p className="text-sm text-ink/60">
              Warte auf andere Gruppen...
            </p>
            <div className="text-sm">
              {groupList.filter(g => g.timeline && g.timeline.some(c => c.cardId === game.currentCardId)).length} / {groupList.length} Gruppen haben platziert
            </div>
            
            {allGroupsPlaced && session.isHost && (
              <button
                onClick={handleShowSolution}
                className="mt-4 px-6 py-3 bg-ink text-inkDark rounded-lg font-semibold hover:opacity-90"
              >
                Lösung zeigen
              </button>
            )}
          </div>
        )}

        {/* Lösung */}
        {showSolution && currentCard && (
          <div className="card-surface rounded-2xl p-6 space-y-4 animate-flip-in">
            <h3 className="text-xl font-semibold text-center">Lösung</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-ink mb-2">{currentCard.year}</div>
              <p className="text-lg">{currentCard.answer}</p>
            </div>

            {/* Gruppen-Ergebnisse */}
            <div className="space-y-2 mt-6">
              <h4 className="font-semibold">Ergebnisse:</h4>
              {groupList.map(group => {
                if (!group.timeline) return null;
                const placement = group.timeline.find(c => c.cardId === game.currentCardId);
                if (!placement) return null;
                
                return (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: `${group.color}20` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-semibold">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {placement.year < 1950 ? '⬅️ Vor 1950' : '➡️ Ab 1950'}
                      </span>
                      <span className="text-xl">
                        {placement.correct ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nächste Karte Button (nur Host) */}
            {session.isHost && (
              <button
                onClick={handleNextCard}
                disabled={isProcessing}
                className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {game.currentCardIndex + 1 >= game.deck.length ? 'Spiel beenden' : 'Nächste Karte'}
              </button>
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
                className="flex items-center justify-between p-3 rounded-lg"
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
