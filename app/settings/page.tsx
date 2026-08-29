"use client";

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cards, getCategories } from '@/lib/cards';
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
import { catIcon, catLabel as catLabelMeta } from '@/lib/categoryMeta';

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'schwer', label: 'Schwer' }
];

const categoryLabels: Partial<Record<CardCategory, string>> = {} as Record<CardCategory, string>;

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
  const defaults = useMemo(
    () => getDefaultSettings(availableCategories, availableDecades, []),
    [availableCategories, availableDecades]
  );
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [timerInput, setTimerInput] = useState('');
  const startHref = mode ? (returnParam || `/play?mode=${mode}&start=1`) : '/play?start=1';
  const settingsReturn = mode
    ? `/settings?mode=${mode}${returnParam ? `&return=${encodeURIComponent(returnParam)}` : ''}`
    : '/settings';

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

  const toggleCategory = (category: CardCategory) => {
    setSettings((prev) => {
      const isCurrentlyActive = prev.categoryWeights[category] > 0;
      const nextWeights = { ...prev.categoryWeights };
      
      if (isCurrentlyActive) {
        // Deactivate: set to 0
        nextWeights[category] = 0;
      } else {
        // Activate: set to 10
        nextWeights[category] = 10;
      }

      const active = Object.entries(nextWeights)
        .filter(([_, w]) => (w as number) > 0)
        .map(([cat]) => cat as CardCategory);

      // Prevent empty selection: if all zero, set this one to 10
      if (active.length === 0) {
        nextWeights[category] = 10;
        active.push(category);
      }

      const next = {
        ...prev,
        categoryWeights: nextWeights,
        categories: active
      };
      saveSettings(next);
      return next;
    });
  };

  const toggleAllCategories = () => {
    const allActive = availableCategories.every(cat => settings.categoryWeights[cat] > 0);
    const nextWeights = { ...settings.categoryWeights };

    availableCategories.forEach(cat => {
      nextWeights[cat] = allActive ? 0 : 10;
    });

    const active = Object.entries(nextWeights)
      .filter(([_, w]) => (w as number) > 0)
      .map(([cat]) => cat as CardCategory);

    const next = {
      ...settings,
      categoryWeights: nextWeights,
      categories: active
    };
    updateSettings(next);
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
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg bg-ink/5 border border-ink/20">
            <input
              type="checkbox"
              checked={availableCategories.every(cat => settings.categoryWeights[cat] > 0)}
              onChange={toggleAllCategories}
              className="h-5 w-5 accent-sky-700"
            />
            <span className="text-sm font-semibold">Alle an/aus</span>
          </label>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {availableCategories.map((category) => {
              const isActive = settings.categoryWeights[category] > 0;
              const isDisabled = category === 'image';
              if (isDisabled) {
                return (
                  <div key={category} className="flex items-center gap-2 rounded-xl border px-3 py-2 border-ink/20 text-ink opacity-40 cursor-not-allowed" title="Demnächst verfügbar">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      className="h-4 w-4 accent-sky-700 cursor-not-allowed"
                      readOnly
                    />
                    <span className="flex-1">{catIcon(category)} {catLabelMeta(category)}</span>
                    <span className="text-xs italic">Demnächst</span>
                  </div>
                );
              }
              return (
                <label
                  key={category}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${isActive ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-ink/20 text-ink'}`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 accent-sky-700"
                  />
                  <span>{catIcon(category)} {catLabelMeta(category)}</span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      {settings.categoryWeights.music > 0 && (
        <section className="card-surface rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Musik-Genres</h2>
            <p className="text-xs text-ink/60">Wirkt nur auf Musikfragen</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {[
              { key: 'pop', label: 'Pop' },
              { key: 'rock', label: 'Rock' },
              { key: 'metal', label: 'Metal' },
              { key: 'hiphop', label: 'Hip-Hop' },
              { key: 'rnb', label: 'R\u0026B / Soul' },
              { key: 'electronic', label: 'Electronic' },
              { key: 'schlagerparty', label: 'Schlager \u0026 Party' },
            ].map((g) => {
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
      )}

      {settings.categoryWeights.music > 0 && availableDecades.length > 0 && (
        <section className="card-surface rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Jahrzehnte</h2>
            <p className="text-xs text-ink/60">Welche Jahrzehnte sollen gespielt werden?</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {availableDecades.map((decade) => {
              const checked = settings.decades.includes(decade);
              return (
                <label
                  key={decade}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-ink/20 text-ink'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDecade(decade)}
                    className="h-4 w-4 accent-sky-700"
                  />
                  <span>{decadeLabel(decade)}</span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Zeit pro Frage</h2>
        <p className="text-sm text-ink/70">Standard: 2 Minuten. Stelle die Zeit mit dem Regler ein (min. 0:30).</p>
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
        <h2 className="text-lg font-semibold">Spielmodus</h2>
        <p className="text-sm text-ink/70">Wähle, ob du mit oder ohne Antwortmöglichkeiten spielen möchtest.</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.multipleChoice}
            onChange={(e) => updateSettings({ ...settings, multipleChoice: e.target.checked })}
            className="h-5 w-5 accent-sky-700"
          />
          <span className="text-sm">Multiple-Choice Antworten anzeigen (4 Optionen)</span>
        </label>
        {mode === 'timeline' && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.digitalTimelineMode}
              onChange={(e) => updateSettings({ ...settings, digitalTimelineMode: e.target.checked })}
              className="h-5 w-5 accent-sky-700"
            />
            <span className="text-sm">Vollständig digitaler Timeline-Modus (mit Gruppenspiel)</span>
          </label>
        )}
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Spotify</p>
          <h2 className="text-lg font-semibold">Spotify Premium verknüpfen</h2>
          <p className="text-sm text-ink/70">
            Verbinde dich mit Spotify Premium, damit Musikfragen ohne Werbung und mit voller Länge abgespielt werden können.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/spotify/authorize?return=${encodeURIComponent(settingsReturn)}`}
            className="rounded-full bg-[#1DB954] hover:bg-[#17a74a] text-white px-5 py-2.5 text-sm font-semibold shadow-md transition"
          >
            Spotify-Login starten
          </a>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href={startHref}
          className="rounded-xl bg-ink text-inkDark px-4 py-2 text-sm"
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
