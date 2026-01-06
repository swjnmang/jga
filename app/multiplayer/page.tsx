"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createGame, joinGame } from '@/lib/multiplayerService';
import { cards, getCategories } from '@/lib/cards';
import { playlistInfo } from '@/lib/playlistCards';
import { getDefaultSettings, TIMELINE_CATEGORIES } from '@/lib/userSettings';
import { isFirebaseEnabled } from '@/lib/firebase';
import { CardCategory, Difficulty, GenreTag } from '@/lib/types';

export default function MultiplayerLobby() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Game Form
  const [groupName, setGroupName] = useState('');
  const [gameMode, setGameMode] = useState<'timeline' | 'solo'>('timeline');

  // Join Game Form
  const [pin, setPin] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);
  const [spotifyLinked, setSpotifyLinked] = useState(false);
  
  // Settings State
  const availableCategories = useMemo(() => {
    const base = getCategories(cards).filter((c) => c !== 'video');
    if (gameMode === 'timeline') return base.filter((c) => TIMELINE_CATEGORIES.includes(c));
    return base;
  }, [gameMode]);
  
  // Playlists (Music)
  const availablePlaylists = useMemo(() => {
    const set = new Set<string>();
    cards
      .filter((c) => c.category === 'music')
      .forEach((c) => {
        const list = c.playlists && c.playlists.length > 0 ? c.playlists : ['imported-playlist'];
        list.forEach((id) => set.add(id));
      });
    return Array.from(set);
  }, []);

  const playlistNameMap = useMemo(() => {
    return playlistInfo.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});
  }, []);

  const defaultSettings = useMemo(
    () => getDefaultSettings(availableCategories, undefined, availablePlaylists, gameMode),
    [availableCategories, availablePlaylists, gameMode]
  );
  
  const [settings, setSettings] = useState(defaultSettings);
  
  // Update settings when game mode changes
  useEffect(() => {
    setSettings(defaultSettings);
  }, [defaultSettings]);

  // Check Spotify session on mount
  useEffect(() => {
    const checkSpotifySession = async () => {
      try {
        const res = await fetch('/api/spotify/session');
        const data = await res.json();
        setSpotifyLinked(data.authenticated);
      } catch (err) {
        console.error('Failed to check Spotify session:', err);
      }
    };
    checkSpotifySession();
    
    // Re-check when window regains focus (after Spotify login redirect)
    const handleFocus = () => {
      checkSpotifySession();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
    if (!groupName.trim()) {
      setError('Bitte Namen eingeben');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (settings.categories.includes('music') && !spotifyLinked) {
        setError('Bitte zuerst Spotify Premium verbinden (Pflicht für Musik).');
        setLoading(false);
        return;
      }

      // Filter und shuffle Karten basierend auf Settings
      const filteredCards = cards.filter(card => {
        if (!settings.categories.includes(card.category)) return false;
        if (!settings.difficulties.includes(card.difficulty)) return false;
        return true;
      });
      const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
      const deck = shuffled;
      if (deck.length === 0) {
        setError('Keine Karten für die ausgewählten Einstellungen verfügbar');
        setLoading(false);
        return;
      }

      const { pin, groupId, playerId } = await createGame({
        mode: gameMode,
        settings,
        deck,
        hostGroupName: groupName,
        hostPlayerName: groupName
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin,
        groupId,
        playerId,
        groupName,
        playerName: groupName,
        isHost: true
      }));

      router.push(`/multiplayer/${pin}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Spiels');
    } finally {
      setLoading(false);
    }
  };
  
  // Settings Helper Functions
  const toggleDifficulty = (difficulty: Difficulty) => {
    setSettings((prev) => {
      const nextDifficulties = prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter((d) => d !== difficulty)
        : [...prev.difficulties, difficulty];
      if (nextDifficulties.length === 0) return prev;
      return { ...prev, difficulties: nextDifficulties };
    });
  };
  
  const toggleCategory = (category: CardCategory) => {
    setSettings((prev) => {
      const isCurrentlyActive = prev.categoryWeights[category] > 0;
      const nextWeights = { ...prev.categoryWeights };
      
      if (isCurrentlyActive) {
        nextWeights[category] = 0;
      } else {
        nextWeights[category] = 10;
      }

      const active = Object.entries(nextWeights)
        .filter(([_, w]) => (w as number) > 0)
        .map(([cat]) => cat as CardCategory);

      if (active.length === 0) {
        nextWeights[category] = 10;
        active.push(category);
      }

      return {
        ...prev,
        categoryWeights: nextWeights,
        categories: active
      };
    });
  };

  const toggleGenre = (genre: GenreTag) => {
    setSettings((prev) => {
      const nextList = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres: nextList.length > 0 ? nextList : prev.genres };
    });
  };

  const togglePlaylist = (playlistId: string) => {
    setSettings((prev) => {
      const nextList = prev.playlists.includes(playlistId)
        ? prev.playlists.filter((p) => p !== playlistId)
        : [...prev.playlists, playlistId];
      return { ...prev, playlists: nextList };
    });
  };

  const updateTimerMinutes = (value: string) => {
    const minutes = Number.parseFloat(value);
    if (Number.isNaN(minutes)) return;
    const seconds = Math.max(30, Math.round(minutes * 60));
    setSettings((prev) => ({ ...prev, timerSeconds: seconds }));
  };
  
  const updateCategoryWeight = (category: CardCategory, value: number) => {
    const weight = Math.min(100, Math.max(0, Math.round(value)));
    const nextWeights = { ...settings.categoryWeights, [category]: weight } as Record<CardCategory, number>;
    const active = Object.entries(nextWeights)
      .filter(([_, w]) => (w as number) > 0)
      .map(([cat]) => cat as CardCategory);

    if (active.length === 0) {
      nextWeights[category] = 10;
      active.push(category);
    }

    setSettings({
      ...settings,
      categoryWeights: nextWeights,
      categories: active
    });
  };
  
  const categoryLabels: Partial<Record<CardCategory, string>> = {
    quote: 'Berühmte Zitate',
    image: 'Bilder erkennen',
    country: 'Länder erkennen',
    music: 'Musik',
    naturtechnik: 'Natur & Technik',
    filmeserien: 'Filme & Serien',
    religionglaube: 'Religion & Glaube',
    sportfreizeit: 'Sport & Freizeit',
    geogeschichte: 'Geographie & Geschichte'
  };

  const handleJoinGame = async () => {
    if (!pin.trim() || !joinGroupName.trim()) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { groupId, playerId } = await joinGame({
        pin: pin.toUpperCase(),
        groupName: joinGroupName,
        playerName: joinGroupName,
        spotifyLinked: spotifyLinked
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin: pin.toUpperCase(),
        groupId,
        playerId,
        groupName: joinGroupName,
        playerName: joinGroupName,
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
              <div className="grid grid-cols-2 gap-2">
                {(['timeline', 'solo'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setGameMode(m)}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      gameMode === m
                        ? 'border-ink bg-ink text-inkDark'
                        : 'border-ink/30 hover:border-ink/60'
                    }`}
                  >
                    {m === 'timeline' ? '🔢 Timeline' : '👤 Solo'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Name/Gruppenname</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="z.B. Team Rot"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-gray-900 bg-white placeholder:text-gray-400"
                maxLength={20}
              />
            </div>

            {/* Schwierigkeitsgrade */}
            <div>
              <label className="block text-sm font-semibold mb-2">Schwierigkeitsgrade</label>
              <div className="grid grid-cols-3 gap-2">
                {(['leicht', 'mittel', 'schwer'] as Difficulty[]).map((diff) => {
                  const checked = settings.difficulties.includes(diff);
                  return (
                    <button
                      key={diff}
                      onClick={() => toggleDifficulty(diff)}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
                        checked
                          ? 'border-ink bg-ink text-inkDark'
                          : 'border-ink/30 hover:border-ink/60'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kategorien */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Kategorien auswählen & gewichten
              </label>
              <div className="space-y-2">
                {availableCategories.map((cat) => {
                  const weight = settings.categoryWeights[cat] || 0;
                  const isActive = weight > 0;
                  return (
                    <div
                      key={cat}
                      className={`rounded-lg border-2 p-3 transition-colors ${
                        isActive ? 'border-ink/30' : 'border-ink/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => toggleCategory(cat)}
                          className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isActive
                                ? 'border-ink bg-ink'
                                : 'border-ink/30'
                            }`}
                          >
                            {isActive && (
                              <svg className="w-3 h-3 text-inkDark" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {categoryLabels[cat] || cat}
                        </button>
                        {isActive && (
                          <span className="text-xs text-ink/60">{weight}%</span>
                        )}
                      </div>
                      {isActive && (
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="10"
                          value={weight}
                          onChange={(e) => updateCategoryWeight(cat, Number(e.target.value))}
                          className="w-full accent-ink"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Musik-Genres */}
            {settings.categories.includes('music') && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Musik-Genres
                  <span className="text-xs text-ink/60 ml-1">Wirkt nur auf Musikfragen</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['poprock', 'metal', 'hiphop', 'schlagerparty'].map((genre) => {
                    const genreLabel: Record<string, string> = {
                      poprock: 'Pop & Rock',
                      metal: 'Metal',
                      hiphop: 'Hip-Hop',
                      schlagerparty: 'Schlager & Party'
                    };
                    const checked = settings.genres.includes(genre as GenreTag);
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre as GenreTag)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
                          checked
                            ? 'border-ink bg-ink text-inkDark'
                            : 'border-ink/30 hover:border-ink/60'
                        }`}
                      >
                        {genreLabel[genre]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Playlists */}
            {settings.categories.includes('music') && availablePlaylists.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Playlists
                  <span className="text-xs text-ink/60 ml-1">Aktiviere, welche Playlists gespielt werden</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePlaylists.map((playlistId) => {
                    const checked = settings.playlists.includes(playlistId);
                    return (
                      <button
                        key={playlistId}
                        onClick={() => togglePlaylist(playlistId)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
                          checked
                            ? 'border-ink bg-ink text-inkDark'
                            : 'border-ink/30 hover:border-ink/60'
                        }`}
                      >
                        {playlistNameMap[playlistId] || playlistId}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zeit pro Frage */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Zeit pro Frage
                <span className="text-xs text-ink/60 ml-1">Standard: {(settings.timerSeconds / 60).toFixed(1)} min</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  defaultValue={settings.timerSeconds / 60}
                  onChange={(e) => updateTimerMinutes(e.target.value)}
                  className="flex-1 accent-ink"
                />
                <span className="text-sm font-semibold min-w-16 text-right">
                  {(settings.timerSeconds / 60).toFixed(1)} min
                </span>
              </div>
              <div className="text-xs text-ink/60 mt-2">0:30 - 5:00</div>
            </div>

            {/* Spielmodus */}
            <div>
              <label className="block text-sm font-semibold mb-2">Spielmodus</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-ink/30 hover:border-ink/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.multipleChoice}
                    onChange={(e) => setSettings((prev) => ({ ...prev, multipleChoice: e.target.checked }))}
                    className="w-5 h-5 accent-ink"
                  />
                  <span className="text-sm font-medium">Multiple-Choice Antworten anzeigen (4 Optionen)</span>
                </label>
                {gameMode === 'timeline' && (
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-ink/30 hover:border-ink/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.digitalTimelineMode}
                      onChange={(e) => setSettings((prev) => ({ ...prev, digitalTimelineMode: e.target.checked }))}
                      className="w-5 h-5 accent-ink"
                    />
                    <span className="text-sm font-medium">Vollständig digitaler Timeline-Modus (mit Gruppenspiel)</span>
                  </label>
                )}
              </div>
            </div>

            {settings.categories.includes('music') && (
              <div className="rounded-lg border-2 border-ink/20 bg-ink/5 p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/60 mb-2">Spotify</p>
                  <h3 className="text-sm font-semibold mb-1">Spotify Premium erforderlich</h3>
                  <p className="text-sm text-ink/70">Musik-Kategorien benötigen eine aktive Spotify Premium Verbindung.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {spotifyLinked ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                      <span>✓ Verbunden</span>
                    </div>
                  ) : (
                    <a
                      href={`/api/spotify/authorize?return=/multiplayer`}
                      className="rounded-lg bg-[#1DB954] hover:bg-[#17a74a] text-white px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      Spotify-Login starten
                    </a>
                  )}
                </div>
              </div>
            )}

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
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-center text-2xl font-mono tracking-wider text-gray-900 bg-white placeholder:text-gray-400"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Name/Gruppenname</label>
              <input
                type="text"
                value={joinGroupName}
                onChange={(e) => setJoinGroupName(e.target.value)}
                placeholder="z.B. Team Blau"
                className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-gray-900 bg-white placeholder:text-gray-400"
                maxLength={20}
              />
            </div>

            <div className="rounded-lg border-2 border-ink/20 bg-ink/5 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/60 mb-2">Spotify</p>
                <h3 className="text-sm font-semibold mb-1">Spotify Premium erforderlich</h3>
                <p className="text-sm text-ink/70">Falls das Spiel Musik-Kategorien enthält, benötigst du eine Spotify Premium Verbindung.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {spotifyLinked ? (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                    <span>✓ Verbunden</span>
                  </div>
                ) : (
                  <a
                    href={`/api/spotify/authorize?return=/multiplayer`}
                    className="rounded-lg bg-[#1DB954] hover:bg-[#17a74a] text-white px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    Spotify-Login starten
                  </a>
                )}
              </div>
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
