"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createGame, joinGame } from '@/lib/multiplayerService';
import { cards } from '@/lib/cards';
import { getDefaultSettings } from '@/lib/userSettings';
import { isFirebaseEnabled } from '@/lib/firebase';

export default function MultiplayerLobby() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Game Form
  const [groupName, setGroupName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState<'timeline' | 'trivia' | 'solo'>('timeline');

  // Join Game Form
  const [pin, setPin] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setFirebaseAvailable(false);
      setError('Firebase ist nicht konfiguriert. Bitte siehe FIREBASE_SETUP.md für Anweisungen.');
    }
  }, []);

  const handleCreateGame = async () => {
    if (!isFirebaseEnabled) {
      setError('Firebase ist nicht konfiguriert. Bitte konfiguriere Firebase zuerst (siehe FIREBASE_SETUP.md).');
      return;
    }
    if (!groupName.trim() || !playerName.trim()) {
      setError('Bitte Gruppen- und Spielername eingeben');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const availableCategories = cards
        .map(c => c.category)
        .filter((c, i, arr) => arr.indexOf(c) === i && c !== 'video');
      
      const settings = getDefaultSettings(availableCategories, undefined, undefined, gameMode);
      
      const { pin, groupId, playerId } = await createGame({
        mode: gameMode,
        settings,
        deck: cards.slice(0, 50), // Erste 50 Karten als Beispiel
        hostGroupName: groupName,
        hostPlayerName: playerName
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin,
        groupId,
        playerId,
        groupName,
        playerName,
        isHost: true
      }));

      router.push(`/multiplayer/${pin}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Spiels');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!pin.trim() || !joinGroupName.trim() || !joinPlayerName.trim()) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { groupId, playerId } = await joinGame({
        pin: pin.toUpperCase(),
        groupName: joinGroupName,
        playerName: joinPlayerName
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin: pin.toUpperCase(),
        groupId,
        playerId,
        groupName: joinGroupName,
        playerName: joinPlayerName,
        isHost: false
      }));

      router.push(`/multiplayer/${pin.toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Beitreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display">Multiplayer</h1>
        <p className="text-ink/70">Spiele gemeinsam mit mehreren Gruppen</p>
      </div>

      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('create')}
            className="card-surface rounded-2xl p-8 space-y-4 hover:bg-ink/5 transition-colors"
          >
            <div className="text-5xl">🎮</div>
            <h2 className="text-xl font-semibold">Spiel erstellen</h2>
            <p className="text-sm text-ink/70">
              Erstelle ein neues Multiplayer-Spiel und erhalte einen PIN
            </p>
          </button>

          <button
            onClick={() => setMode('join')}
            className="card-surface rounded-2xl p-8 space-y-4 hover:bg-ink/5 transition-colors"
          >
            <div className="text-5xl">🔗</div>
            <h2 className="text-xl font-semibold">Spiel beitreten</h2>
            <p className="text-sm text-ink/70">
              Tritt einem bestehenden Spiel mit einem PIN bei
            </p>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="card-surface rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Neues Spiel erstellen</h2>
            <button
              onClick={() => {
                setMode(null);
                setError(null);
              }}
              className="text-ink/60 hover:text-ink"
            >
              Zurück
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Spielmodus</label>
              <div className="grid grid-cols-3 gap-2">
                {(['timeline', 'trivia', 'solo'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setGameMode(m)}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      gameMode === m
                        ? 'border-ink bg-ink text-inkDark'
                        : 'border-ink/30 hover:border-ink/60'
                    }`}
                  >
                    {m === 'timeline' ? '🔢 Timeline' : m === 'trivia' ? '🎓 Trivia' : '👤 Solo'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Gruppenname</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="z.B. Team Rot"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-ink bg-white"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Dein Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="z.B. Anna"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-ink bg-white"
                maxLength={20}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateGame}
              disabled={loading}
              className="w-full bg-ink text-inkDark py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Erstelle Spiel...' : 'Spiel erstellen'}
            </button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="card-surface rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Spiel beitreten</h2>
            <button
              onClick={() => {
                setMode(null);
                setError(null);
              }}
              className="text-ink/60 hover:text-ink"
            >
              Zurück
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Spiel-PIN</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-center text-2xl font-mono tracking-wider text-ink bg-white"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Gruppenname</label>
              <input
                type="text"
                value={joinGroupName}
                onChange={(e) => setJoinGroupName(e.target.value)}
                placeholder="z.B. Team Blau"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-ink bg-white"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Dein Name</label>
              <input
                type="text"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                placeholder="z.B. Max"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-ink bg-white"
                maxLength={20}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleJoinGame}
              disabled={loading}
              className="w-full bg-ink text-inkDark py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Trete bei...' : 'Beitreten'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
