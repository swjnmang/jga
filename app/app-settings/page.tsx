"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { applyTheme, loadTheme, saveTheme, themes, ThemeId } from '@/lib/theme';

export default function AppSettingsPage() {
  const [theme, setTheme] = useState<ThemeId>('aurora');

  useEffect(() => {
    const initialTheme = loadTheme('aurora');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleThemeChange = (value: ThemeId) => {
    setTheme(value);
    applyTheme(value);
    saveTheme(value);
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
        </div>
      </section>

      <div className="flex justify-center">
        <Link
          href="/"
          className="rounded-full bg-ink text-sand px-6 py-3 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition"
        >
          Speichern und zurück ins Hauptmenü
        </Link>
      </div>
    </main>
  );
}
