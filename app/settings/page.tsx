"use client";

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cards, getCategories } from '@/lib/cards';
import { playlistInfo } from '@/lib/playlistCards';
import { CardCategory, DecadeTag, Difficulty, GenreTag } from '@/lib/types';
import {
  ALL_GENRES,
  getDefaultSettings,
  loadSettings,
  saveSettings,
  toDecadeTag,
  TRIVIA_ONLY_CATEGORIES,
  TIMELINE_CATEGORIES,
  UserSettings
} from '@/lib/userSettings';

const FALLBACK_PLAYLIST_ID = 'imported-playlist';

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'schwer', label: 'Schwer' }
];

const categoryLabels: Partial<Record<CardCategory, string>> = {
  quote: 'Berühmte Zitate',
  image: 'Bilder erkennen',
  country: 'Länder erkennen',
  music: 'Musik',
  naturtechnik: 'Natur & Technik',
  filmeserien: 'Film & Serien'
};

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const returnParam = searchParams.get('return');
  const mode: 'timeline' | 'trivia' | null = modeParam === 'timeline' || modeParam === 'trivia' ? modeParam : null;

  const availableCategories = useMemo(() => {
    const base = getCategories(cards).filter((c) => c !== 'video');
    if (mode === 'timeline') return base.filter((c) => TIMELINE_CATEGORIES.includes(c));
    return base;
  }, [mode]);
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
  const availablePlaylists = useMemo(() => {
    const set = new Set<string>();
    cards
      .filter((c) => c.category === 'music')
      .forEach((c) => {
        const ids = c.playlists && c.playlists.length > 0 ? c.playlists : [FALLBACK_PLAYLIST_ID];
        ids.forEach((id) => set.add(id));
      });
    return Array.from(set);
  }, []);
  const playlistNameMap = useMemo(() => new Map(playlistInfo.map((p) => [p.id, p.name])), []);
  const defaults = useMemo(
    () => getDefaultSettings(availableCategories, availableDecades, availablePlaylists),
    [availableCategories, availableDecades, availablePlaylists]
  );
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [timerInput, setTimerInput] = useState('');
  const startHref = mode ? (returnParam || `/play?mode=${mode}&start=1`) : '/play?start=1';

  useEffect(() => {
    const stored = loadSettings(defaults);
    setSettings(stored);
    setTimerInput((stored.timerSeconds / 60).toString());
    setLoaded(true);
  }, [defaults]);

  const updateSettings = (next: UserSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const toggleDifficulty = (difficulty: Difficulty) => {
    setSettings((prev) => {
      const nextDifficulties = prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter((d) => d !== difficulty)
        : [...prev.difficulties, difficulty];
      if (nextDifficulties.length === 0) return prev;
      const next = { ...prev, difficulties: nextDifficulties };
      saveSettings(next);
      return next;
    });
  };

  const handleTimerChange = (value: string) => {
    setTimerInput(value);
    const minutes = Number.parseFloat(value);
    if (Number.isNaN(minutes)) return;
    const seconds = Math.max(30, Math.round(minutes * 60));
    updateSettings({ ...settings, timerSeconds: seconds });
  };

  const resetDefaults = () => {
    updateSettings(defaults);
    setTimerInput((defaults.timerSeconds / 60).toString());
  };

  const toggleGenre = (genre: GenreTag) => {
    setSettings((prev) => {
      const nextList = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      const ensured = nextList.length > 0 ? nextList : ALL_GENRES;
      const next = { ...prev, genres: ensured };
      saveSettings(next);
      return next;
    });
  };

  const togglePlaylist = (playlistId: string) => {
    setSettings((prev) => {
      const nextList = prev.playlists.includes(playlistId)
        ? prev.playlists.filter((p) => p !== playlistId)
        : [...prev.playlists, playlistId];
      const ensured = nextList.length > 0 ? nextList : availablePlaylists;
      const next = { ...prev, playlists: ensured };
      saveSettings(next);
      return next;
    });
  };

  const updateCategoryWeight = (category: CardCategory, value: number) => {
    const weight = Math.min(100, Math.max(0, Math.round(value)));
    const nextWeights = { ...settings.categoryWeights, [category]: weight } as Record<CardCategory, number>;
    const active = Object.entries(nextWeights)
      .filter(([_, w]) => (w as number) > 0)
      .map(([cat]) => cat as CardCategory);

    // Prevent empty selection: if all zero, keep last changed at 10%
    if (active.length === 0) {
      nextWeights[category] = 10;
      active.push(category);
    }

    updateSettings({
      ...settings,
      categoryWeights: nextWeights,
      categories: active
    });
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Einstellungen</p>
        <h1 className="text-3xl font-display">Dein Quiz. Deine Regeln.</h1>
        <p className="text-sm text-ink/70">
          Wähle Schwierigkeitsgrade, Kategorien und die Zeit pro Frage. Diese Einstellungen werden
          lokal im Browser gespeichert und wirken sich sofort im Spielmodus aus.
        </p>
      </div>

      {mode && (
        <div className="card-surface rounded-2xl p-4 text-sm text-ink/80 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Modus gewählt</p>
          <p className="text-base font-semibold">{mode === 'timeline' ? 'Timeline' : 'Trivia'} Einstellungen</p>
          <p>
            Kategorien und Optionen sind auf diesen Modus begrenzt. Um das Spiel zu starten, nutze den Button
            oben „Spiel starten ({mode})“.
          </p>
        </div>
      )}

      <section className="card-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Aus welchen Schwierigkeitsstufen möchtest du Fragen spielen?</h2>
          <p className="text-xs text-ink/60">Mehrfachauswahl möglich</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {difficultyOptions.map((option) => {
            const checked = settings.difficulties.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  checked ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-ink/20 text-ink'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDifficulty(option.value)}
                  className="h-4 w-4 accent-sky-700"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Kategorien</h2>
          <div className="flex flex-col items-end text-xs text-ink/60">
            <p>Links = gar nicht, rechts = viel.</p>
            <p>Kategorien mit Wert 0 werden ausgeblendet.</p>
            <p>Trivia-only Kategorien gelten nur im Trivia-Modus.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            {availableCategories.map((category) => {
              const value = settings.categoryWeights[category] ?? 0;
              const triviaOnly = TRIVIA_ONLY_CATEGORIES.includes(category);
              return (
                <label key={category} className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{categoryLabels[category] ?? category}</span>
                      {triviaOnly && (
                        <span className="rounded-full bg-ink text-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Trivia only</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-ink/60">
                      <span className="uppercase tracking-wide">Gar nicht</span>
                      <div className="h-px w-8 bg-ink/20" aria-hidden />
                      <span className="uppercase tracking-wide">Viel</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => updateCategoryWeight(category, Number(e.target.value))}
                    className="accent-ink"
                    aria-label={`Gewichtung für ${category}: ${value === 0 ? 'gar nicht' : 'viel'}`}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Musik-Genres</h2>
          <p className="text-xs text-ink/60">Wirkt nur auf Musik-Fragen</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {[{ key: 'poprock', label: 'Pop & Rock' }, { key: 'metal', label: 'Metal' }, { key: 'hiphop', label: 'Hip-Hop' }, { key: 'schlagerparty', label: 'Schlager & Party' }].map((g) => {
            const checked = settings.genres.includes(g.key as GenreTag);
            return (
              <label
                key={g.key}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-ink/20 text-ink'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGenre(g.key as GenreTag)}
                  className="h-4 w-4 accent-sky-700"
                />
                <span>{g.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      {availablePlaylists.length > 0 && (
        <section className="card-surface rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Playlists</h2>
            <p className="text-xs text-ink/60">Aktiviere, welche Playlists gespielt werden</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {availablePlaylists.map((playlistId) => {
              const checked = settings.playlists.includes(playlistId);
              const label = playlistNameMap.get(playlistId)
                || (playlistId === FALLBACK_PLAYLIST_ID
                  ? 'Importierte Playlist'
                  : `Playlist ${playlistId.slice(0, 8)}…${playlistId.slice(-4)}`);
              return (
                <label
                  key={playlistId}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-ink/20 text-ink'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlaylist(playlistId)}
                    className="h-4 w-4 accent-sky-700"
                  />
                  <span className="truncate" title={label}>{label}</span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Zeit pro Frage</h2>
        <p className="text-sm text-ink/70">Standard: 2 Minuten. Stell die Zeit mit dem Regler ein (min. 0:30).</p>
        <div className="space-y-2">
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={loaded ? timerInput : '2'}
            onChange={(e) => handleTimerChange(e.target.value)}
            className="w-full accent-ink"
          />
          <div className="flex items-center justify-between text-sm text-ink/70">
            <span>0:30</span>
            <span className="font-semibold text-ink">{loaded ? Number(timerInput).toFixed(1) : '2.0'} min</span>
            <span>5:00</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href={startHref}
          className="rounded-xl bg-ink text-sand px-4 py-2 text-sm"
        >
          Speichern & Spiel starten
        </Link>
        <button
          type="button"
          onClick={resetDefaults}
          className="rounded-xl border border-ink/20 px-4 py-2 text-sm"
        >
          Standard wiederherstellen
        </button>
        <Link
          href="/"
          className="rounded-xl border border-ink/20 px-4 py-2 text-sm"
        >
          Zurück ins Hauptmenü
        </Link>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsPageContent />
    </Suspense>
  );
}
