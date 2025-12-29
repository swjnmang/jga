"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cards, getCategories } from '@/lib/cards';
import { CardCategory, Difficulty } from '@/lib/types';
import { getDefaultSettings, loadSettings, saveSettings, UserSettings } from '@/lib/userSettings';

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'schwer', label: 'Schwer' }
];

export default function SettingsPage() {
  const availableCategories = useMemo(() => getCategories(cards), []);
  const defaults = useMemo(() => getDefaultSettings(availableCategories), [availableCategories]);
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadSettings(defaults);
    setSettings(stored);
    setLoaded(true);
  }, [defaults]);

  const updateSettings = (next: UserSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const toggleCategory = (category: CardCategory) => {
    setSettings((prev) => {
      const nextCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      if (nextCategories.length === 0) return prev;
      const updatedWeights = { ...prev.categoryWeights };
      if (!updatedWeights[category]) {
        updatedWeights[category] = defaults.categoryWeights[category] ?? 10;
      }
      const next = { ...prev, categories: nextCategories, categoryWeights: updatedWeights };
      saveSettings(next);
      return next;
    });
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
    const minutes = Number(value);
    if (Number.isNaN(minutes)) return;
    const seconds = Math.max(30, Math.round(minutes * 60));
    updateSettings({ ...settings, timerSeconds: seconds });
  };

  const resetDefaults = () => updateSettings(defaults);

  const updateCategoryWeight = (category: CardCategory, value: number) => {
    const weight = Math.min(100, Math.max(0, Math.round(value)));
    updateSettings({
      ...settings,
      categoryWeights: { ...settings.categoryWeights, [category]: weight }
    });
  };

  const timerMinutes = Math.round(settings.timerSeconds / 60);
  const activeWeightSum = settings.categories.reduce(
    (sum, cat) => sum + (settings.categoryWeights[cat] ?? 0),
    0
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Einstellungen</p>
        <h1 className="text-3xl font-display">Spiel anpassen</h1>
        <p className="text-sm text-ink/70">
          Wähle Schwierigkeitsgrade, Kategorien und die Zeit pro Frage. Diese Einstellungen werden
          lokal im Browser gespeichert und wirken sich sofort im Spielmodus aus.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/play"
            className="rounded-xl bg-ink text-sand px-4 py-2 text-sm font-semibold shadow"
          >
            Zurück zum Spiel
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
          <h2 className="text-lg font-semibold">Schwierigkeitsgrad</h2>
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
          <p className="text-xs text-ink/60">Mindestens eine aktiv, Gewichte steuerbar</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {availableCategories.map((category) => {
            const checked = settings.categories.includes(category);
            return (
              <label
                key={category}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  checked ? 'border-ink bg-ink text-sand' : 'border-ink/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4"
                />
                <span className="capitalize">{category}</span>
              </label>
            );
          })}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Gewichtung der aktiven Kategorien</span>
            <span>Summe aktiv: {activeWeightSum}% (wird automatisch normalisiert)</span>
          </div>
          <div className="space-y-2">
            {availableCategories.map((category) => {
              const value = settings.categoryWeights[category] ?? 0;
              const disabled = !settings.categories.includes(category);
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
                    disabled={disabled}
                    className="accent-ink"
                  />
                </label>
              );
            })}
          </div>
          <p className="text-xs text-ink/60">
            Bei der Ziehung werden die Gewichte relativ zueinander der aktiven Kategorien verwendet. 0%
            bedeutet, dass eine Kategorie praktisch übersprungen wird.
          </p>
        </div>
      </section>

      <section className="card-surface rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Zeit pro Frage</h2>
        <p className="text-sm text-ink/70">Standard: 3 Minuten. Eingabe in Minuten, mindestens 0:30.</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={loaded ? timerMinutes : ''}
            onChange={(e) => handleTimerChange(e.target.value)}
            className="w-28 rounded-xl border border-ink/20 px-3 py-2 text-sm"
          />
          <span className="text-sm text-ink/70">Minuten pro Frage</span>
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
