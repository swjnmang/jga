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
  const availableCategories = useMemo(() => getCategories(cards).filter((c) => c !== 'video'), []);
  const defaults = useMemo(() => getDefaultSettings(availableCategories), [availableCategories]);
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
          <h2 className="text-lg font-semibold">Fragen aus den Schwierigkeitsgraden</h2>
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
