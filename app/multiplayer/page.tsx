"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createGame, joinGame, subscribeToGame } from '@/lib/multiplayerService';
import { cards, getCategories } from '@/lib/cards';
import { playlistInfo } from '@/lib/playlistCards';
import { getDefaultSettings, TIMELINE_CATEGORIES } from '@/lib/userSettings';
import { isFirebaseEnabled } from '@/lib/firebase';
import { CardCategory, Difficulty, GenreTag } from '@/lib/types';

const GROUP_AVATARS = [
  // Einzeltiere
  '🦁', '🐈', '🐭', '🐢', '🐻', '🐼', '🐺', '🦊', '🐧', '🦄', '🐉', '🐸', '🐎', '🦅', '🦋', '🐬',
  // Gruppen / mehrere Personen
  '👨\u200d👩\u200d👧\u200d👦', '👫', '👬', '👭', '🧑\u200d🤝\u200d🧑', '👯', '🫂', '🎭', '🫶', '🤝',
  // Fun / Sonstiges
  '🎸', '🏆', '🚀', '🎉', '⚽', '🦸',
];

function MultiplayerLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejoinSession, setRejoinSession] = useState<{ pin: string } | null>(null);

  // Create Game Form
  const [groupName, setGroupName] = useState('');
  const [gameMode, setGameMode] = useState<'timeline' | 'trivia'>('timeline');
  const [banMode, setBanMode] = useState(true);
  const [triviaWinCondition, setTriviaWinCondition] = useState<'categories' | 'points'>('categories');
  const [timelineWinTarget, setTimelineWinTarget] = useState(10);

  // Join Game Form
  const [pin, setPin] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');
  const [joinGroupAvatar, setJoinGroupAvatar] = useState('🦁');
  const [takenAvatars, setTakenAvatars] = useState<string[]>([]);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);
  const [spotifyLinked, setSpotifyLinked] = useState(false);
  
  // Build return URL for Spotify login
  const spotifyReturnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/multiplayer';
    const currentPath = '/multiplayer';
    const params = new URLSearchParams(searchParams.toString());
    if (mode) params.set('open', mode); // preserve current mode so it's restored after OAuth
    const query = params.toString();
    const fullUrl = query ? `${currentPath}?${query}` : currentPath;
    return encodeURIComponent(fullUrl);
  }, [searchParams, mode]);
  
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

  // Check for invite link with pin parameter
  useEffect(() => {
    const pinFromUrl = searchParams.get('pin');
    if (pinFromUrl) {
      setPin(pinFromUrl.toUpperCase());
      setMode('join');
    }
    
    // Check for gameMode parameter
    const gameModeFromUrl = searchParams.get('gameMode');
    if (gameModeFromUrl === 'timeline' || gameModeFromUrl === 'trivia') {
      setGameMode(gameModeFromUrl);
    }

    // Restore mode after Spotify OAuth redirect
    const openFromUrl = searchParams.get('open');
    if (openFromUrl === 'create' || openFromUrl === 'join') {
      setMode(openFromUrl);
    }
  }, [searchParams]);

  // Fetch taken avatars when a 6-char PIN is typed
  useEffect(() => {
    if (pin.length !== 6) { setTakenAvatars([]); return; }
    const unsub = subscribeToGame(pin, (game) => {
      if (!game) { setTakenAvatars([]); return; }
      const taken = Object.values(game.groups)
        .filter(g => !g.isHost && g.avatar)
        .map(g => g.avatar as string);
      setTakenAvatars(taken);
    });
    return () => unsub();
  }, [pin]);

  // Wenn Session im localStorage vorhanden → Rejoin-Banner anzeigen (kein stiller Redirect)
  useEffect(() => {
    const sessionStr = localStorage.getItem('multiplayer_session');
    if (!sessionStr) return;
    try {
      const sessionData = JSON.parse(sessionStr);
      if (sessionData?.pin) {
        import('@/lib/multiplayerService').then(({ subscribeToGame }) => {
          const unsub = subscribeToGame(sessionData.pin, (gameData) => {
            unsub();
            if (gameData && (gameData.state === 'playing' || gameData.state === 'lobby')) {
              setRejoinSession({ pin: sessionData.pin });
            } else {
              // Spiel existiert nicht mehr oder ist beendet → aufräumen
              localStorage.removeItem('multiplayer_session');
            }
          });
        });
      }
    } catch {
      localStorage.removeItem('multiplayer_session');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGame = async () => {
    if (!isFirebaseEnabled) {
      setError('Firebase ist nicht konfiguriert. Bitte konfiguriere Firebase zuerst (siehe FIREBASE_SETUP.md).');
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

      // Host hat keinen Gruppennamen, nur Spielleiter-Status
      const hostName = 'Spielleiter';

      const { pin, groupId, playerId } = await createGame({
        mode: gameMode,
        settings,
        deck,
        hostGroupName: hostName,
        hostPlayerName: hostName,
        banModeEnabled: gameMode === 'trivia' ? banMode : false,
        triviaWinCondition: gameMode === 'trivia' ? triviaWinCondition : 'categories',
        timelineWinTarget: gameMode === 'timeline' ? timelineWinTarget : undefined,
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin,
        groupId,
        playerId,
        groupName: hostName,
        playerName: hostName,
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
    flag: 'Flaggen erkennen',
    outline: 'Länder am Umriss erkennen',
    music: 'Musik',
    natur: 'Natur & Technik',
    filmserien: 'Filme & Serien',
    schaetzfragen: 'Schätzfragen',
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
        spotifyLinked: spotifyLinked,
        avatar: joinGroupAvatar,
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin: pin.toUpperCase(),
        groupId,
        playerId,
        groupName: joinGroupName,
        playerName: joinGroupName,
        avatar: joinGroupAvatar,
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

      {/* Rejoin-Banner */}
      {rejoinSession && (
        <div className="rounded-2xl border-2 border-yellow-400 bg-yellow-100/10 p-5 space-y-3">
          <p className="font-semibold text-yellow-700">
            🔄 Du hast noch ein laufendes Spiel (PIN: <span className="font-mono">{rejoinSession.pin}</span>)
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/multiplayer/${rejoinSession.pin}`)}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
            >
              Weiterspielen
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('multiplayer_session');
                setRejoinSession(null);
              }}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-ink/20 hover:border-ink/50 font-semibold"
            >
              Ignorieren
            </button>
          </div>
        </div>
      )}

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

          {/* Host Info – direkt unter Überschrift */}
          <div className="rounded-lg bg-green-100/20 border-2 border-green-500 p-4 space-y-2">
            <p className="text-sm font-semibold text-green-700">👑 Du bist der Spielleiter</p>
            <p className="text-sm text-green-600">
              Als Spielleiter spielst du nicht mit, sondern leitest das Spiel. Du steuerst den Ablauf, bestätigst Flex-Buttons und verwaltest die Punkte.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Spielmodus</label>
              <div className="grid grid-cols-2 gap-2">
                {(['timeline', 'trivia'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setGameMode(m); if (m !== 'trivia') { setBanMode(false); setTriviaWinCondition('categories'); } }}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      gameMode === m
                        ? 'border-ink bg-ink text-inkDark'
                        : 'border-ink/30 hover:border-ink/60'
                    }`}
                  >
                    {m === 'timeline' ? '🔢 Timeline' : '🧠 Trivia'}
                  </button>
                ))}
              </div>
              {/* Modus-Beschreibung */}
              {gameMode === 'trivia' && (
                <>
                  <p className="mt-2 text-sm text-ink/70">
                    🧠 <strong>Trivia</strong> – Klassische Quizfragen aus verschiedenen Kategorien. Jede Gruppe muss mindestens eine Frage pro Kategorie korrekt beantworten, um zu gewinnen. Schätzfragen, Musik, Bilder und mehr warten auf euch.
                  </p>
                  {/* Ban-Modus */}
                  <button
                    type="button"
                    onClick={() => setBanMode(v => !v)}
                    className="mt-3 w-full flex items-start gap-3 rounded-xl border-2 border-ink/20 bg-ink/5 hover:bg-ink/10 transition-colors px-4 py-3 text-left"
                  >
                    <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      banMode ? 'bg-green-600 border-green-600' : 'border-ink/40 bg-transparent'
                    }`}>
                      {banMode && (
                        <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1,5 4.5,9 11,1" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="text-sm font-semibold block">🚫 Ban-Modus aktivieren</span>
                      <span className="text-xs text-ink/60">Wenn der Ban-Modus aktiviert ist, können Gruppen vor Spielbeginn jeweils eine Kategorie sperren.</span>
                    </span>
                  </button>
                  {/* Gewinnbedingung */}
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold">Gewinnbedingung</p>
                    <div className="grid grid-cols-1 gap-2">
                      {(['categories', 'points'] as const).map((wc) => (
                        <button
                          key={wc}
                          type="button"
                          onClick={() => setTriviaWinCondition(wc)}
                          className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                            triviaWinCondition === wc
                              ? 'border-ink bg-ink/10'
                              : 'border-ink/20 bg-ink/5 hover:bg-ink/10'
                          }`}
                        >
                          <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            triviaWinCondition === wc ? 'border-ink' : 'border-ink/40'
                          }`}>
                            {triviaWinCondition === wc && <span className="w-2.5 h-2.5 rounded-full bg-ink block" />}
                          </span>
                          <span>
                            {wc === 'categories' ? (
                              <>
                                <span className="text-sm font-semibold block">🏶 Kategorien sammeln</span>
                                <span className="text-xs text-ink/60">Eine Gruppe gewinnt, sobald sie aus jeder Kategorie mindestens eine Frage korrekt beantwortet hat.</span>
                              </>
                            ) : (
                              <>
                                <span className="text-sm font-semibold block">🏆 Meiste Punkte gewinnen</span>
                                <span className="text-xs text-ink/60">Pro richtige Antwort gibt es einen Punkt. Die Gruppe mit den meisten Punkten am Ende gewinnt.</span>
                              </>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {gameMode === 'timeline' && (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-ink/70">
                    🔢 <strong>Timeline</strong> – Ereignisse und Fakten müssen in die richtige chronologische Reihenfolge gebracht werden. Die erste Gruppe mit <strong>{timelineWinTarget}</strong> korrekt platzierten Karten gewinnt.
                  </p>
                  <div>
                    <label className="block text-sm font-semibold mb-2">🏆 Karten zum Gewinnen: <span className="text-ink">{timelineWinTarget}</span></label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setTimelineWinTarget(v => Math.max(3, v - 1))} className="w-9 h-9 rounded-lg border-2 border-ink/30 text-lg font-bold hover:bg-ink/10 flex items-center justify-center">−</button>
                      <input
                        type="range" min={3} max={30} value={timelineWinTarget}
                        onChange={e => setTimelineWinTarget(Number(e.target.value))}
                        className="flex-1 accent-ink"
                      />
                      <button type="button" onClick={() => setTimelineWinTarget(v => Math.min(30, v + 1))} className="w-9 h-9 rounded-lg border-2 border-ink/30 text-lg font-bold hover:bg-ink/10 flex items-center justify-center">+</button>
                    </div>
                    <div className="flex justify-between text-xs text-ink/40 mt-1 px-1"><span>3</span><span>30</span></div>
                  </div>
                </div>
              )}
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
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink/20 hover:bg-ink/5 transition-colors text-sm"
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        checked ? 'bg-white border-white' : 'border-ink/40 bg-transparent'
                      }`}>
                        {checked && (
                          <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1,5 4.5,9 11,1" />
                          </svg>
                        )}
                      </span>
                      <span>{diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kategorien */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Kategorien auswählen
              </label>
              <div className="grid grid-cols-2 gap-1">
                {availableCategories.map((cat) => {
                  const isActive = (settings.categoryWeights[cat] || 0) > 0;
                  const isDisabled = cat === 'image';
                  if (isDisabled) {
                    return (
                      <div
                        key={cat}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-left w-full opacity-40 cursor-not-allowed"
                        title="Demnächst verfügbar"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded border-2 border-ink/20 bg-transparent flex items-center justify-center" />
                        <span className="text-sm font-medium">{categoryLabels[cat] || cat}</span>
                        <span className="ml-auto text-xs text-ink/50 italic">Demnächst</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-ink/5 transition-colors text-left w-full"
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isActive ? 'bg-white border-white' : 'border-ink/40 bg-transparent'
                      }`}>
                        {isActive && (
                          <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1,5 4.5,9 11,1" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm font-medium">{categoryLabels[cat] || cat}</span>
                    </button>
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
                <div className="grid grid-cols-2 gap-1">
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
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-ink/20 hover:bg-ink/5 transition-colors text-sm text-left"
                      >
                        <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          checked ? 'bg-white border-white' : 'border-ink/40 bg-transparent'
                        }`}>
                          {checked && (
                            <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1,5 4.5,9 11,1" />
                            </svg>
                          )}
                        </span>
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
                <div className="grid grid-cols-2 gap-1">
                  {availablePlaylists.map((playlistId) => {
                    const checked = settings.playlists.includes(playlistId);
                    return (
                      <button
                        key={playlistId}
                        onClick={() => togglePlaylist(playlistId)}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-ink/20 hover:bg-ink/5 transition-colors text-sm text-left"
                      >
                        <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          checked ? 'bg-white border-white' : 'border-ink/40 bg-transparent'
                        }`}>
                          {checked && (
                            <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1,5 4.5,9 11,1" />
                            </svg>
                          )}
                        </span>
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
                      href={`/api/spotify/authorize?return=${spotifyReturnUrl}`}
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

            <div>
              <label className="block text-sm font-semibold mb-2">Gruppen-Avatar wählen</label>
              <div className="grid grid-cols-8 gap-2">
                {GROUP_AVATARS.map((emoji) => {
                  const isTaken = takenAvatars.includes(emoji) && emoji !== joinGroupAvatar;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => !isTaken && setJoinGroupAvatar(emoji)}
                      disabled={isTaken}
                      className={`text-2xl rounded-xl p-2 border-2 transition-all ${
                        joinGroupAvatar === emoji
                          ? 'border-ink bg-ink/10 scale-110 shadow-md'
                          : isTaken
                          ? 'border-red-400/40 opacity-30 cursor-not-allowed'
                          : 'border-ink/20 hover:border-ink/50 hover:bg-ink/5'
                      }`}
                      title={isTaken ? 'Bereits vergeben' : emoji}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
              {joinGroupAvatar && (
                <p className="mt-2 text-sm text-ink/60">Gewählt: <span className="text-base">{joinGroupAvatar}</span> {joinGroupName || '...'}</p>
              )}
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

export default function MultiplayerLobby() {
  return (
    <Suspense fallback={
      <main className="relative mx-auto max-w-4xl px-4 sm:px-5 py-6 sm:py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-display">Multiplayer</h1>
          <p className="text-ink/70">Lade...</p>
        </div>
      </main>
    }>
      <MultiplayerLobbyContent />
    </Suspense>
  );
}
