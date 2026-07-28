"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createGame, joinGame, subscribeToGame } from '@/lib/multiplayerService';
import { cards, getCategories } from '@/lib/cards';
import { getDefaultSettings, TIMELINE_CATEGORIES, toDecadeTag } from '@/lib/userSettings';
import { isFirebaseEnabled } from '@/lib/firebase';
import { CardCategory, DecadeTag, Difficulty, GenreTag } from '@/lib/types';
import { catIcon, catLabel as catLabelMeta } from '@/lib/categoryMeta';
import { compressImageToAvatar, isImageAvatar } from '@/lib/imageAvatar';
import GroupAvatar from '@/components/GroupAvatar';

const GROUP_AVATARS = [
  // Einzeltiere
  '🦁', '🐈', '🐭', '🐢', '🐻', '🐼', '🐺', '🦊', '🐧', '🦄', '🐉', '🐸', '🐎', '🦅', '🦋', '🐬',
  // Gruppen / mehrere Personen
  '👨\u200d👩\u200d👧\u200d👦', '👫', '👬', '👭', '🧑\u200d🤝\u200d🧑', '👯', '🫂', '🎭', '🫶', '🤝',
  // Fun / Sonstiges
  '🎸', '🏆', '🚀', '🎉', '⚽', '🦸',
];

// Avatar-Auswahl mit Umschalter: entweder ein Foto aufnehmen (Kamera öffnet direkt)
// oder ein Emoji wählen. Fotos werden clientseitig komprimiert und als Data-URL
// im avatar-Feld gespeichert.
function AvatarPicker({
  value,
  onChange,
  takenAvatars = [],
  error,
  onError,
}: {
  value: string;
  onChange: (v: string) => void;
  takenAvatars?: string[];
  error: string | null;
  onError: (msg: string | null) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'foto' | 'emoji'>(isImageAvatar(value) ? 'foto' : 'emoji');
  const hasPhoto = isImageAvatar(value);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    onError(null);
    try {
      const dataUrl = await compressImageToAvatar(file);
      onChange(dataUrl);
    } catch {
      onError('Das Bild konnte nicht verarbeitet werden. Bitte versucht ein anderes Foto.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Umschalter Foto / Avatar */}
      <div className="flex rounded-xl border-2 border-ink/30 overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => setTab('foto')}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            tab === 'foto' ? 'bg-ink text-inkDark' : 'bg-transparent hover:bg-ink/5'
          }`}
        >
          📷 Foto
        </button>
        <button
          type="button"
          onClick={() => setTab('emoji')}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            tab === 'emoji' ? 'bg-ink text-inkDark' : 'bg-transparent hover:bg-ink/5'
          }`}
        >
          😀 Avatar
        </button>
      </div>

      {tab === 'foto' ? (
        <div className="space-y-2">
          {/* capture="user" oeffnet auf dem Handy direkt die (Selfie-)Kamera statt der Galerie */}
          <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ink/40 hover:border-ink/70 hover:bg-ink/5 px-4 py-4 transition-all disabled:opacity-50"
          >
            {busy ? (
              <span className="text-3xl animate-pulse">⏳</span>
            ) : hasPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Euer Foto-Avatar" className="w-12 h-12 rounded-full object-cover border border-ink/20" />
            ) : (
              <span className="text-3xl">📷</span>
            )}
            <span className="text-sm font-semibold">
              {busy ? 'Wird verarbeitet…' : hasPhoto ? 'Neues Foto aufnehmen' : 'Foto aufnehmen'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={busy}
            className="w-full text-xs text-ink/60 underline hover:text-ink transition-colors"
          >
            oder Bild aus der Galerie wählen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-2">
          {GROUP_AVATARS.map((emoji) => {
            const isTaken = takenAvatars.includes(emoji) && emoji !== value;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => !isTaken && onChange(emoji)}
                disabled={isTaken}
                className={`text-2xl rounded-xl p-2 border-2 transition-all ${
                  value === emoji
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
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function MultiplayerLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejoinSession, setRejoinSession] = useState<{ pin: string } | null>(null);

  // Create Game Form - Wizard Step (1, 2, oder 3)
  const [createStep, setCreateStep] = useState(1);
  const [gameMode, setGameMode] = useState<'timeline' | 'trivia'>('timeline');
  const [banMode, setBanMode] = useState(true);
  const [triviaWinCondition, setTriviaWinCondition] = useState<'categories' | 'points'>('categories');
  const [jokersEnabled, setJokersEnabled] = useState(true);
  const [timelineWinTarget, setTimelineWinTarget] = useState(10); // range 8–20
  const [hostless, setHostless] = useState(false);
  const [hostTextAnswersEnabled, setHostTextAnswersEnabled] = useState(true);
  const [creatorGroupName, setCreatorGroupName] = useState('');
  const [creatorAvatar, setCreatorAvatar] = useState('🦁');

  // Join Game Form
  const [pin, setPin] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');
  const [joinGroupAvatar, setJoinGroupAvatar] = useState('🦁');
  const [takenAvatars, setTakenAvatars] = useState<string[]>([]);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);
  const [spotifyLinked, setSpotifyLinked] = useState(false);
  
  // Build return URL for Spotify login
  const spotifyReturnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/multiplayer';
    const currentPath = '/multiplayer';
    const params = new URLSearchParams(searchParams.toString());
    if (mode) params.set('open', mode);
    if (createStep) params.set('step', createStep.toString());
    const query = params.toString();
    const fullUrl = query ? `${currentPath}?${query}` : currentPath;
    return encodeURIComponent(fullUrl);
  }, [searchParams, mode, createStep]);
  
  // Settings State
  const availableCategories = useMemo(() => {
    const base = getCategories(cards).filter((c) => c !== 'video');
    if (gameMode === 'timeline') return base.filter((c) => TIMELINE_CATEGORIES.includes(c));
    return base;
  }, [gameMode]);
  
  // Decades (Music)
  const availableDecades = useMemo(() => {
    const order: DecadeTag[] = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
    const set = new Set<DecadeTag>();
    cards
      .filter((c) => c.category === 'music' && typeof c.year === 'number')
      .forEach((c) => {
        const d = toDecadeTag(c.year as number);
        if (d) set.add(d);
      });
    return order.filter((d) => set.has(d));
  }, []);

  const defaultSettings = useMemo(
    () => getDefaultSettings(availableCategories, availableDecades, [], gameMode),
    [availableCategories, availableDecades, gameMode]
  );
  
  const [settings, setSettings] = useState(defaultSettings);
  // Tracks whether settings were just restored from sessionStorage (Spotify-Redirect)
  const restoredFromStorage = useRef(false);

  // Update settings when game mode changes — but not if we just restored from sessionStorage
  useEffect(() => {
    if (restoredFromStorage.current) {
      restoredFromStorage.current = false;
      return;
    }
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
    
    // Check for gameMode parameter — also auto-opens create form
    const gameModeFromUrl = searchParams.get('gameMode');
    if (gameModeFromUrl === 'timeline' || gameModeFromUrl === 'trivia') {
      setGameMode(gameModeFromUrl);
      setMode('create');
    }

    // Restore mode after Spotify OAuth redirect
    const openFromUrl = searchParams.get('open');
    if (openFromUrl === 'create' || openFromUrl === 'join') {
      setMode(openFromUrl);
    }

    // Restore step after Spotify redirect
    const stepFromUrl = searchParams.get('step');
    if (stepFromUrl) {
      setCreateStep(parseInt(stepFromUrl, 10));
    }

    // Restore settings saved before Spotify redirect
    if (openFromUrl === 'create') {
      try {
        const saved = sessionStorage.getItem('jga_draft_settings');
        if (saved) {
          const draft = JSON.parse(saved);
          sessionStorage.removeItem('jga_draft_settings');
          if (draft.gameMode) setGameMode(draft.gameMode);
          if (draft.banMode !== undefined) setBanMode(draft.banMode);
          if (draft.triviaWinCondition) setTriviaWinCondition(draft.triviaWinCondition);
          if (draft.timelineWinTarget) setTimelineWinTarget(draft.timelineWinTarget);
          if (draft.settings) {
            restoredFromStorage.current = true;
            setSettings(draft.settings);
          }
        }
      } catch {
        sessionStorage.removeItem('jga_draft_settings');
      }
    }
  }, [searchParams]);

  // Fetch taken avatars when a 6-char PIN is typed
  useEffect(() => {
    if (pin.length !== 6) { setTakenAvatars([]); return; }
    const unsub = subscribeToGame(pin, (game) => {
      if (!game) { setTakenAvatars([]); return; }
      const taken = Object.values(game.groups)
        .filter(g => !g.isHost && g.avatar && !isImageAvatar(g.avatar))
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

    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter und shuffle Karten basierend auf Settings
      const filteredCards = cards.filter((card: any) => {
        if (!settings.categories.includes(card.category)) return false;
        if (!settings.difficulties.includes(card.difficulty)) return false;
        // Musik-Karten: nach Jahrzehnten und Genres filtern
        if (card.category === 'music') {
          // Jahrzehnte-Filter
          if (typeof card.year === 'number') {
            const decade = toDecadeTag(card.year as number);
            if (decade && settings.decades.length > 0 && !settings.decades.includes(decade)) return false;
          }
          const cardGenres: string[] = card.genres ?? [];
          const hasGenre = cardGenres.length === 0 || settings.genres.length === 0 || cardGenres.some((g: string) => (settings.genres as string[]).includes(g));
          if (!hasGenre) return false;
        }
        return true;
      });
      const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
      const deck = shuffled;
      if (deck.length === 0) {
        setError('Keine Karten für die ausgewählten Einstellungen verfügbar');
        setLoading(false);
        return;
      }

      // Mit Spielleitung: der Ersteller spielt nicht mit, nur Spielleiter-Status.
      // Ohne Spielleitung: der Ersteller ist eine ganz normale spielende Gruppe.
      const hostName = hostless ? (creatorGroupName.trim() || 'Team 1') : 'Spielleiter';

      const { pin, groupId, playerId } = await createGame({
        mode: gameMode,
        settings,
        deck,
        hostGroupName: hostName,
        hostPlayerName: hostName,
        banModeEnabled: gameMode === 'trivia' ? banMode : false,
        triviaWinCondition: gameMode === 'trivia' ? triviaWinCondition : 'categories',
        jokersEnabled: gameMode === 'trivia' ? jokersEnabled : false,
        timelineWinTarget: gameMode === 'timeline' ? timelineWinTarget : undefined,
        hostless,
        hostAvatar: hostless ? creatorAvatar : undefined,
        hostTextAnswersEnabled: gameMode === 'trivia' ? hostTextAnswersEnabled : false,
      });

      // Speichere Session-Infos im localStorage
      localStorage.setItem('multiplayer_session', JSON.stringify({
        pin,
        groupId,
        playerId,
        groupName: hostName,
        playerName: hostName,
        avatar: hostless ? creatorAvatar : undefined,
        isHost: true
      }));

      router.push(`/multiplayer/${pin}?host=1`);
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
    if (category === 'schaetzfragen') return; // always locked
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

  const toggleDecade = (decade: DecadeTag) => {
    setSettings((prev) => {
      const nextList = prev.decades.includes(decade)
        ? prev.decades.filter((d) => d !== decade)
        : [...prev.decades, decade];
      return { ...prev, decades: nextList.length > 0 ? nextList : prev.decades };
    });
  };

  const decadeLabel = (tag: DecadeTag): string => {
    const map: Record<DecadeTag, string> = {
      '1960s': '60er',
      '1970s': '70er',
      '1980s': '80er',
      '1990s': '90er',
      '2000s': '2000er',
      '2010s': '2010er',
      '2020s': '2020er',
    };
    return map[tag] ?? tag;
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
  
  const categoryLabels: Partial<Record<CardCategory, string>> = {} as Record<CardCategory, string>;

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

  // ===== VALIDIERUNG FÜR WIZARD STEPS =====
  const validateStep1 = (): boolean => {
    // Schritt 1: Spielmodus muss gewählt sein; ohne Spielleitung zusätzlich ein Gruppenname für den Ersteller
    if (!gameMode) return false;
    if (hostless && !creatorGroupName.trim()) return false;
    return true;
  };

  const validateStep2 = (): boolean => {
    // Schritt 2: Mindestens eine Kategorie muss ausgewählt sein
    return settings.categories.length > 0;
  };

  const validateStep3 = (): boolean => {
    // Schritt 3: Wenn Musik ausgewählt, dann muss Spotify verbunden sein
    if (settings.categories.includes('music') && !spotifyLinked) {
      setError('Bitte verbinde zuerst Spotify Premium (erforderlich für Musik-Kategorien)');
      return false;
    }
    return true;
  };

  const handleNextStep = (): void => {
    setError(null);
    
    if (createStep === 1 && !validateStep1()) {
      setError(hostless && !creatorGroupName.trim() ? 'Bitte gib einen Gruppennamen für dein Team ein' : 'Bitte wähle einen Spielmodus');
      return;
    }
    if (createStep === 2 && !validateStep2()) {
      setError('Bitte wähle mindestens eine Kategorie');
      return;
    }

    if (createStep < 3) {
      setCreateStep(createStep + 1);
    }
  };

  const handlePrevStep = (): void => {
    setError(null);
    if (createStep > 1) {
      setCreateStep(createStep - 1);
    }
  };

  // ===== RENDER FUNCTIONS FOR WIZARD STEPS =====
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Schritt 1 von 3: Spielmodus & Grundregeln</h2>
      
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
      </div>

      {/* Spielleitung */}
      <div>
        <label className="block text-sm font-semibold mb-2">Spielleitung</label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setHostless(false)}
            className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              !hostless ? 'border-ink bg-ink/10' : 'border-ink/20 bg-ink/5 hover:bg-ink/10'
            }`}
          >
            <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              !hostless ? 'border-ink' : 'border-ink/40'
            }`}>
              {!hostless && <span className="w-2.5 h-2.5 rounded-full bg-ink block" />}
            </span>
            <span>
              <span className="text-sm font-semibold block">👑 Mit Spielleitung</span>
              <span className="text-xs text-ink/60">Du (oder ein Gerät) leitet das Spiel, bewertest Antworten und steuerst das Tempo.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setHostless(true)}
            className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              hostless ? 'border-ink bg-ink/10' : 'border-ink/20 bg-ink/5 hover:bg-ink/10'
            }`}
          >
            <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              hostless ? 'border-ink' : 'border-ink/40'
            }`}>
              {hostless && <span className="w-2.5 h-2.5 rounded-full bg-ink block" />}
            </span>
            <span>
              <span className="text-sm font-semibold block">🗳️ Ohne Spielleitung</span>
              <span className="text-xs text-ink/60">
                Bei Trivia-Fragen tippt die antwortende Gruppe ihre Antwort ein, die anderen Gruppen stimmen ab (≥50% = richtig). Timeline läuft automatisch weiter. Schätzfragen bleiben wie gewohnt.
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Ohne Spielleitung: Ersteller spielt mit und braucht einen Gruppennamen + Avatar */}
      {hostless && (
        <div className="space-y-3 border-t pt-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Euer Gruppenname (ihr spielt selbst mit)</label>
            <input
              type="text"
              value={creatorGroupName}
              onChange={(e) => setCreatorGroupName(e.target.value)}
              placeholder="z.B. Team Rot"
              className="w-full px-4 py-3 rounded-lg border-2 border-ink/30 focus:border-ink outline-none text-gray-900 bg-white placeholder:text-gray-400"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Euer Avatar</label>
            <AvatarPicker
              value={creatorAvatar}
              onChange={setCreatorAvatar}
              error={avatarError}
              onError={setAvatarError}
            />
          </div>
        </div>
      )}

      {/* Modus-Beschreibung & Spezifische Einstellungen */}
      {gameMode === 'trivia' && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm text-ink/70">
            🧠 <strong>Trivia</strong> – Klassische Quizfragen aus verschiedenen Kategorien. Jede Gruppe muss mindestens eine Frage pro Kategorie korrekt beantworten, um zu gewinnen.
          </p>
          
          {/* Ban-Modus */}
          <button
            type="button"
            onClick={() => setBanMode(v => !v)}
            className="w-full flex items-start gap-3 rounded-xl border-2 border-ink/20 bg-ink/5 hover:bg-ink/10 transition-colors px-4 py-3 text-left"
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
              <span className="text-xs text-ink/60">Gruppen können vor Spielbeginn jeweils eine Kategorie sperren.</span>
            </span>
          </button>

          {/* Joker-Modus */}
          <button
            type="button"
            onClick={() => setJokersEnabled(v => !v)}
            className="w-full flex items-start gap-3 rounded-xl border-2 border-ink/20 bg-ink/5 hover:bg-ink/10 transition-colors px-4 py-3 text-left"
          >
            <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              jokersEnabled ? 'bg-green-600 border-green-600' : 'border-ink/40 bg-transparent'
            }`}>
              {jokersEnabled && (
                <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1,5 4.5,9 11,1" />
                </svg>
              )}
            </span>
            <span>
              <span className="text-sm font-semibold block">🃏 Joker aktivieren</span>
              <span className="text-xs text-ink/60">Jede Gruppe erhält 4 Joker: Neue Frage, NEXT, Würfeln und STEAL.</span>
            </span>
          </button>

          {/* Textantwort-Eingabe (nur relevant mit Spielleitung; ohne Spielleitung tippt die Gruppe ohnehin immer) */}
          {!hostless && (
            <button
              type="button"
              onClick={() => setHostTextAnswersEnabled(v => !v)}
              className="w-full flex items-start gap-3 rounded-xl border-2 border-ink/20 bg-ink/5 hover:bg-ink/10 transition-colors px-4 py-3 text-left"
            >
              <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                hostTextAnswersEnabled ? 'bg-green-600 border-green-600' : 'border-ink/40 bg-transparent'
              }`}>
                {hostTextAnswersEnabled && (
                  <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1,5 4.5,9 11,1" />
                  </svg>
                )}
              </span>
              <span>
                <span className="text-sm font-semibold block">✍️ Antwort-Eingabe für Gruppen</span>
                <span className="text-xs text-ink/60">Die antwortende Gruppe tippt ihre Antwort in ein Feld ein. Die Spielleitung sieht die Antwort und entscheidet richtig/falsch.</span>
              </span>
            </button>
          )}

          {/* Gewinnbedingung */}
          <div className="space-y-2">
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
                        <span className="text-xs text-ink/60">Eine Gruppe gewinnt, wenn sie aus jeder Kategorie mindestens eine Frage richtig beantwortet.</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold block">🏆 Meiste Punkte gewinnen</span>
                        <span className="text-xs text-ink/60">Pro richtige Antwort gibt es einen Punkt.</span>
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameMode === 'timeline' && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm text-ink/70">
            🔢 <strong>Timeline</strong> – Ereignisse müssen in die richtige chronologische Reihenfolge gebracht werden.
          </p>
          <div>
            <label className="block text-sm font-semibold mb-2">🏆 Karten zum Gewinnen: <span className="text-ink">{timelineWinTarget}</span></label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setTimelineWinTarget(v => Math.max(8, v - 1))} className="w-9 h-9 rounded-lg border-2 border-ink/30 text-lg font-bold hover:bg-ink/10 flex items-center justify-center">−</button>
              <input
                type="range" min={8} max={20} value={timelineWinTarget}
                onChange={e => setTimelineWinTarget(Number(e.target.value))}
                className="flex-1 accent-ink"
              />
              <button type="button" onClick={() => setTimelineWinTarget(v => Math.min(20, v + 1))} className="w-9 h-9 rounded-lg border-2 border-ink/30 text-lg font-bold hover:bg-ink/10 flex items-center justify-center">+</button>
            </div>
            <div className="flex justify-between text-xs text-ink/40 mt-1 px-1"><span>8</span><span>20</span></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Schritt 2 von 3: Inhalte auswählen</h2>

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
        <div className="grid grid-cols-3 gap-2">
          {availableCategories.map((cat) => {
            const isActive = (settings.categoryWeights[cat] || 0) > 0;
            const isDisabled = cat === 'image';
            const isLocked = cat === 'schaetzfragen';
            
            if (isDisabled) {
              return (
                <div
                  key={cat}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-left w-full opacity-40 cursor-not-allowed"
                  title="Demnächst verfügbar"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded border-2 border-ink/20 bg-transparent flex items-center justify-center" />
                  <span className="text-sm font-medium">{catIcon(cat)} {catLabelMeta(cat)}</span>
                </div>
              );
            }
            
            if (isLocked) {
              return (
                <div
                  key={cat}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-left w-full cursor-not-allowed"
                  title="Schätzfragen sind immer aktiv"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded border-2 bg-white border-white flex items-center justify-center">
                    <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,5 4.5,9 11,1" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium">{catIcon(cat)} {catLabelMeta(cat)}</span>
                  <span className="text-xs font-semibold text-white/70 ml-auto">Pflicht</span>
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
                <span className="text-sm font-medium">{catIcon(cat)} {catLabelMeta(cat)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Musik-Genres */}
      {settings.categories.includes('music') && (
        <div>
          <label className="block text-sm font-semibold mb-2">
            🎵 Musik-Genres
            <span className="text-xs text-ink/60 ml-1">(nur für Musikfragen)</span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { key: 'pop', label: 'Pop' },
              { key: 'rock', label: 'Rock' },
              { key: 'metal', label: 'Metal' },
              { key: 'hiphop', label: 'Hip-Hop' },
              { key: 'rnb', label: 'R&B / Soul' },
              { key: 'electronic', label: 'Electronic' },
              { key: 'schlagerparty', label: 'Schlager & Party' },
            ].map(({ key: genre, label: genreLabel }) => {
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
                  {genreLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Jahrzehnte */}
      {settings.categories.includes('music') && availableDecades.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">
            📅 Jahrzehnte
            <span className="text-xs text-ink/60 ml-1">(welche Jahrzehnte spielen?)</span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {availableDecades.map((decade) => {
              const checked = settings.decades.includes(decade);
              return (
                <button
                  key={decade}
                  onClick={() => toggleDecade(decade)}
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
                  {decadeLabel(decade)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Schritt 3 von 3: Feintuning & Bestätigung</h2>

      {/* Zeit pro Frage */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          ⏱️ Zeit pro Frage
          <span className="text-xs text-ink/60 ml-1">({(settings.timerSeconds / 60).toFixed(1)} min)</span>
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

      {/* Spotify Info & Login */}
      {settings.categories.includes('music') && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50/50 p-4 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-600 mb-2">🎵 Spotify Premium erforderlich</p>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Musik-Kategorien aktiviert</h3>
            <p className="text-sm text-blue-800">Du hast die Kategorie Musik ausgewählt. Dies erfordert eine aktive Spotify Premium Verbindung zum Abspielen von Musikausschnitten.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {spotifyLinked ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold">
                <span>✓ Spotify verbunden</span>
              </div>
            ) : (
              <a
                href={`/api/spotify/authorize?return=${spotifyReturnUrl}`}
                className="rounded-lg bg-[#1DB954] hover:bg-[#17a74a] text-white px-4 py-2 text-sm font-semibold transition-colors"
                onClick={() => {
                  try {
                    sessionStorage.setItem('jga_draft_settings', JSON.stringify({
                      settings,
                      gameMode,
                      banMode,
                      triviaWinCondition,
                      timelineWinTarget,
                      createStep,
                    }));
                  } catch { /* ignore */ }
                }}
              >
                Spotify-Login starten
              </a>
            )}
          </div>
        </div>
      )}

      {/* Zusammenfassung */}
      <div className="rounded-lg border-2 border-ink/20 bg-ink/5 p-4 space-y-2">
        <p className="text-xs uppercase tracking-wide text-ink/60 mb-2">Zusammenfassung</p>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Modus:</span> {gameMode === 'timeline' ? '🔢 Timeline' : '🧠 Trivia'}</div>
          <div><span className="font-semibold">Spielleitung:</span> {hostless ? '🗳️ Ohne Spielleitung' : '👑 Mit Spielleitung'}</div>
          {hostless && (
            <div className="flex items-center gap-1.5"><span className="font-semibold">Eure Gruppe:</span> <GroupAvatar avatar={creatorAvatar} size="sm" /> {creatorGroupName.trim() || 'Team 1'}</div>
          )}
          <div><span className="font-semibold">Kategorien:</span> {settings.categories.map(c => catLabelMeta(c)).join(', ')}</div>
          <div><span className="font-semibold">Schwierigkeit:</span> {settings.difficulties.join(', ')}</div>
          <div><span className="font-semibold">Zeit/Frage:</span> {(settings.timerSeconds / 60).toFixed(1)} min</div>
        </div>
      </div>
    </div>
  );

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
            onClick={() => { setMode('create'); setCreateStep(1); }}
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

      {/* CREATE GAME - 3 STEP WIZARD */}
      {mode === 'create' && (
        <div className="card-surface rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Neues Spiel erstellen</h2>
            <button
              onClick={() => {
                setMode(null);
                setCreateStep(1);
                setError(null);
              }}
              className="text-ink/60 hover:text-ink"
            >
              ✕
            </button>
          </div>

          {/* Host Info */}
          <div className="rounded-lg bg-slate-900/10 border-2 border-orange-500 p-4 space-y-2">
            <p className="text-sm font-semibold text-orange-600">
              {hostless ? '🎮 Du spielst mit' : '👑 Du bist der Spielleiter'}
            </p>
            <p className="text-sm text-gray-700">
              {hostless
                ? 'Im spielleitungslosen Modus bist du eine ganz normale spielende Gruppe. Du startest nur zusätzlich das Spiel, sobald alle bereit sind — die Bewertung der Antworten übernehmen die Gruppen per Abstimmung.'
                : 'Du leitest das Spiel, bestätigst Buttons und verwaltest die Punkte. Du spielst nicht mit, kannst dich aber nachher mit einem anderen Endgerät einklinken.'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step <= createStep ? 'bg-ink' : 'bg-ink/20'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            {createStep === 1 && renderStep1()}
            {createStep === 2 && renderStep2()}
            {createStep === 3 && renderStep3()}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handlePrevStep}
              disabled={createStep === 1}
              className="px-4 py-3 rounded-lg border-2 border-ink/30 hover:border-ink/60 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              ← Zurück
            </button>
            
            {createStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex-1 px-4 py-3 rounded-lg bg-ink text-inkDark font-semibold hover:opacity-90 transition-opacity"
              >
                Weiter →
              </button>
            ) : (
              <button
                onClick={handleCreateGame}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '🔄 Erstelle Spiel...' : '✓ Spiel erstellen'}
              </button>
            )}
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
              ✕
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
              <AvatarPicker
                value={joinGroupAvatar}
                onChange={setJoinGroupAvatar}
                takenAvatars={takenAvatars}
                error={avatarError}
                onError={setAvatarError}
              />
              {joinGroupAvatar && (
                <p className="mt-2 text-sm text-ink/60 flex items-center gap-1.5">Gewählt: <GroupAvatar avatar={joinGroupAvatar} size="sm" /> {joinGroupName || '...'}</p>
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
