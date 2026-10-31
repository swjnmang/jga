"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getHighscores } from '@/lib/multiplayerService';
import { isFirebaseEnabled } from '@/lib/firebase';
import type { HighscoreEntry } from '@/lib/multiplayerTypes';
import GroupAvatar from '@/components/GroupAvatar';

type SortKey = 'points' | 'categories' | 'date';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'points', label: '🏆 Punkte' },
  { key: 'categories', label: '📚 Kategorien' },
  { key: 'date', label: '🕓 Neueste' },
];

const MODE_LABEL: Record<HighscoreEntry['mode'], string> = {
  timeline: '🕰️ Timeline',
  trivia: '🎮 Trivia',
};

export default function HighscoresPage() {
  const [entries, setEntries] = useState<HighscoreEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('points');

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setError('Highscores benötigen eine Firebase-Verbindung, die hier nicht konfiguriert ist.');
      return;
    }
    getHighscores()
      .then(setEntries)
      .catch(err => {
        console.error(err);
        setError('Highscores konnten nicht geladen werden.');
      });
  }, []);

  const sorted = entries ? [...entries].sort((a, b) => {
    if (sortKey === 'points') return b.points - a.points;
    if (sortKey === 'categories') return b.completedCategories - a.completedCategories;
    return b.finishedAt - a.finishedAt;
  }) : [];

  return (
    <main className="fq-table min-h-screen flex items-start justify-center px-4 py-8 sm:px-6 sm:py-14">
      <div className="w-full max-w-2xl space-y-6">

        {/* Back + Header */}
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/80 hover:text-ink transition mb-4">
            ← Zurück
          </Link>
          <h1 className="text-3xl font-display text-ink">🏆 Highscores</h1>
          <p className="text-sm text-ink/85">Alle Gruppen, die bereits eine Runde gewonnen haben.</p>
        </div>

        {/* Sortier-Umschalter */}
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              aria-pressed={sortKey === opt.key}
              className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold border-2 transition ${
                sortKey === opt.key
                  ? 'bg-[#F5B700] text-[#1B1B2F] border-[#1B1B2F] shadow-[0_4px_0_#1B1B2F]'
                  : 'border-white/40 text-white hover:border-white/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Inhalt */}
        {error && (
          <p className="card-surface rounded-xl text-sm text-red-700 text-center py-6">{error}</p>
        )}

        {!error && entries === null && (
          <p className="text-sm text-ink/60 text-center py-8">Lade Highscores…</p>
        )}

        {!error && entries !== null && entries.length === 0 && (
          <p className="text-sm text-ink/60 text-center py-8">
            Noch keine gewonnene Runde aufgezeichnet. Spielt ein Spiel bis zum Ende — der Sieger landet hier!
          </p>
        )}

        {!error && sorted.length > 0 && (
          <ol className="space-y-2">
            {sorted.map((entry, i) => (
              <li
                key={entry.id}
                className="card-surface flex items-center gap-3 rounded-xl px-4 py-3"
              >
                <span className="w-7 text-center text-sm font-bold text-ink/50 flex-shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.groupColor }}
                  aria-hidden
                />
                <GroupAvatar avatar={entry.avatar} size="md" />
                <span className="flex-1 min-w-0 truncate font-semibold text-ink">{entry.groupName}</span>
                <span className="text-xs text-ink/50 flex-shrink-0 hidden sm:inline">{MODE_LABEL[entry.mode]}</span>
                <span className="text-sm font-bold text-ink flex-shrink-0 w-20 text-right">
                  {sortKey === 'categories'
                    ? `${entry.completedCategories} Kat.`
                    : sortKey === 'date'
                    ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' }).format(entry.finishedAt)
                    : `${entry.points} Pkt.`}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
