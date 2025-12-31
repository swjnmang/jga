"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { applyReduceMotion, applyTheme, loadReduceMotion, loadTheme, saveReduceMotion, saveTheme, themes, ThemeId } from '@/lib/theme';

export default function AppSettingsPage() {
  const [theme, setTheme] = useState<ThemeId>('aurora');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const initialTheme = loadTheme('aurora');
    setTheme(initialTheme);
    applyTheme(initialTheme);

    const initialReduce = loadReduceMotion();
    setReduceMotion(initialReduce);
    applyReduceMotion(initialReduce);
  }, []);

  const handleThemeChange = (value: ThemeId) => {
    setTheme(value);
    applyTheme(value);
    saveTheme(value);
  };

  const handleReduceMotion = (value: boolean) => {
    setReduceMotion(value);
    applyReduceMotion(value);
    saveReduceMotion(value);
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Einstellungen</p>
        <h1 className="text-3xl font-display leading-tight">App-Design & Dienste</h1>
        <p className="text-sm text-ink/70">
          Diese Einstellungen gelten für das gesamte UI. Die Spiel-Einstellungen (Kategorien, Timer, Schwierigkeitsgrade)
          findest du weiterhin im Bereich "Neues Spiel starten".
        </p>
      </div>

      <section className="card-surface rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/60">Design</p>
            <h2 className="text-xl font-semibold">Aussehen der App</h2>
          </div>
          <span className="text-xs rounded-full bg-ink/10 px-3 py-1 text-ink/80">3 Themes</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleThemeChange(option.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition card-surface ${
                theme === option.id ? 'border-sand bg-white/10' : 'border-ink/20 hover:border-ink/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{option.name}</span>
                {theme === option.id && <span className="text-xs bg-ink text-sand rounded-full px-2 py-1">Aktiv</span>}
              </div>
              <p className="text-sm text-ink/70 leading-snug">{option.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface rounded-2xl p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-ink/60">Spotify</p>
          <h2 className="text-xl font-semibold">Spotify Premium verknüpfen</h2>
          <p className="text-sm text-ink/70">
            Starte den Login, um Premium-Wiedergabe ohne Werbung zu ermöglichen. Falls bereits eingeloggt, kannst du hier erneut
            verbinden, um die Session aufzufrischen.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/spotify/authorize?return=/app-settings"
            className="rounded-full bg-[#1DB954] hover:bg-[#17a74a] text-white px-5 py-2.5 text-sm font-semibold shadow-md transition-colors"
          >
            Spotify Login starten
          </a>
          <Link
            href="/play"
            className="rounded-full border border-ink/20 px-4 py-2.5 text-sm hover:bg-ink/5"
          >
            Zurück zum Spiel
          </Link>
        </div>
      </section>

      <section className="card-surface rounded-2xl p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-ink/60">Weitere Optionen</p>
          <h2 className="text-xl font-semibold">Komfort</h2>
          <p className="text-sm text-ink/70">Optional: Animationen reduzieren für ruhigere Darstellung.</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-ink/20 p-4">
          <div>
            <p className="font-semibold">Animationen reduzieren</p>
            <p className="text-sm text-ink/70">Deaktiviert Übergänge und Animationen (für empfindliche Spieler).</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <span className="text-ink/70">Aus</span>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => handleReduceMotion(e.target.checked)}
              className="h-5 w-5 rounded border-ink/30 accent-sand"
            />
            <span className="text-ink/70">An</span>
          </label>
        </div>
      </section>
    </main>
  );
}
