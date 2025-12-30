"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cards, getCategories } from '@/lib/cards';
import { playlistInfo } from '@/lib/playlistCards';
import { CardCategory, DecadeTag, Difficulty, GenreTag } from '@/lib/types';
import { ALL_GENRES, getDefaultSettings, loadSettings, saveSettings, toDecadeTag, UserSettings } from '@/lib/userSettings';

const FALLBACK_PLAYLIST_ID = 'imported-playlist';

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'schwer', label: 'Schwer' }
];

export default function SettingsPage() {
  const availableCategories = useMemo(() => getCategories(cards).filter((c) => c !== 'video'), []);
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

  const toggleDecade = (decade: DecadeTag) => {
    setSettings((prev) => {
      const nextList = prev.decades.includes(decade)
        ? prev.decades.filter((d) => d !== decade)
        : [...prev.decades, decade];
      const ensured = nextList.length > 0 ? nextList : availableDecades;
      const next = { ...prev, decades: ensured };
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

  const activeWeightSum = settings.categories.reduce(
    (sum, cat) => sum + (settings.categoryWeights[cat] ?? 0),
    0
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Einstellungen</p>
        <h1 className="text-3xl font-display">Dein Quiz. Deine Regeln.</h1>
        <p className="text-sm text-ink/70">
          Wähle Schwierigkeitsgrade, Kategorien und die Zeit pro Frage. Diese Einstellungen werden
          lokal im Browser gespeichert und wirken sich sofort im Spielmodus aus.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/"
            className="rounded-xl border border-ink/20 px-4 py-2 text-sm"
          >
            Speichern & zurück zum Hauptmenü
          </Link>
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-xl border border-ink/20 px-4 py-2 text-sm"
          >
            Standard wiederherstellen
          </button>
        </div>
      </div>

      <section className="card-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Fragen aus folgenden Schwierigkeitsstufen:</h2>
          <p className="text-xs text-ink/60">Mehrfachauswahl möglich</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {difficultyOptions.map((option) => {
            const checked = settings.difficulties.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  checked ? 'border-ink bg-ink text-sand' : 'border-ink/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDifficulty(option.value)}
                  className="h-4 w-4"
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
          <p className="text-xs text-ink/60">0% schließt eine Kategorie aus</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Gewichtung der aktiven Kategorien</span>
            <span>Summe aktiv: {activeWeightSum}% (wird automatisch normalisiert)</span>
          </div>
          <div className="space-y-2">
            {availableCategories.map((category) => {
              const value = settings.categoryWeights[category] ?? 0;
              return (
                <label key={category} className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{category}</span>
                    <span className="text-xs text-ink/60">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => updateCategoryWeight(category, Number(e.target.value))}
                    className="accent-ink"
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
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? 'border-ink bg-ink text-sand' : 'border-ink/20'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGenre(g.key as GenreTag)}
                  className="h-4 w-4"
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
            <h2 className="text-lg font-semibold">Spotify-Playlists</h2>
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
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? 'border-ink bg-ink text-sand' : 'border-ink/20'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlaylist(playlistId)}
                    className="h-4 w-4"
                  />
                  <span className="truncate" title={label}>{label}</span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Musik-Jahrzehnte</h2>
          <p className="text-xs text-ink/60">Wirkt nur auf Musik-Fragen</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {availableDecades.map((decade) => {
            const checked = settings.decades.includes(decade);
            return (
              <label
                key={decade}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? 'border-ink bg-ink text-sand' : 'border-ink/20'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDecade(decade)}
                  className="h-4 w-4"
                />
                <span>{decade.replace('0s', '0er')}</span>
              </label>
            );
          })}
        </div>
      </section>

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

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Eigene Fragen ergänzen</h2>
          <span className="rounded-full bg-ink text-sand px-3 py-1 text-xs font-semibold">Coming soon</span>
        </div>
        <p className="text-sm text-ink/70">Eingabe-Formular folgt. Aktuell können nur die vorhandenen Karten gespielt werden.</p>
      </section>
    </main>
  );
}
