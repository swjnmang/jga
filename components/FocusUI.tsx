// Gemeinsame Bausteine des "Fokus"-Designs (Trivia + Timeline):
// Punkteleiste, Timer-Pill, Kategorie-Chip und Joker-Icons.
import React from 'react';

type StripGroup = { id: string; name: string; color?: string };

export function ScoreStrip({
  groups,
  activeGroupId,
  myGroupId,
  value,
}: {
  groups: StripGroup[];
  activeGroupId?: string | null;
  myGroupId?: string | null;
  value: (groupId: string) => React.ReactNode;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
      {groups.map(g => {
        const isActive = g.id === activeGroupId;
        const isMine = g.id === myGroupId;
        return (
          <div
            key={g.id}
            className={`fq-score-chip ${isActive ? 'fq-score-chip--active' : ''}`}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${isActive ? 'text-orange-700' : 'text-ink/55'}`}>
                {isActive ? (isMine ? 'Ihr seid dran' : 'Am Zug') : isMine ? 'Ihr' : 'Punkte'}
              </span>
              <span className="text-lg leading-none font-extrabold tabular-nums">{value(g.id)}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              {g.color && <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: g.color }} aria-hidden="true" />}
              <span className={`truncate text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{g.name}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function TimerPill({ seconds }: { seconds: number }) {
  const urgent = seconds <= 10;
  return (
    <span
      role="timer"
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold tabular-nums ${
        urgent ? 'bg-red-600 text-white animate-pulse' : 'bg-[#1C1C1E] text-white'
      }`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" />
      </svg>
      {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
    </span>
  );
}

export function CategoryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">
      {children}
    </span>
  );
}

export function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-ink/[0.07] px-2.5 py-1 text-xs font-semibold text-ink/70">
      {children}
    </span>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function JokerIcon({ kind, size = 16 }: { kind: 'newQuestion' | 'next' | 'dice' | 'steal' | 'flex'; size?: number }) {
  const p = { ...iconProps, width: size, height: size };
  switch (kind) {
    case 'next':
      return <svg {...p}><path d="M5 5l9 7-9 7zM19 5v14" /></svg>;
    case 'steal':
      return <svg {...p}><path d="M7 7h11l-3-3M17 17H6l3 3" /></svg>;
    case 'newQuestion':
      return <svg {...p}><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4" /></svg>;
    case 'dice':
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle cx="9" cy="9" r="0.9" fill="currentColor" />
          <circle cx="15" cy="15" r="0.9" fill="currentColor" />
        </svg>
      );
    case 'flex':
      return <svg {...p}><path d="M13 3L5 14h6l-1 7 8-11h-6z" /></svg>;
  }
}

/** Kompakter Joker-Button für die Joker-Leiste. */
export function JokerButton({
  kind,
  label,
  available,
  disabled,
  title,
  onClick,
  highlight,
}: {
  kind: 'newQuestion' | 'next' | 'dice' | 'steal' | 'flex';
  label: string;
  available: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={!available || disabled}
      className={`fq-joker ${!available ? 'fq-joker--used' : highlight ? 'fq-joker--hot' : ''}`}
    >
      <JokerIcon kind={kind} />
      <span>{label}</span>
    </button>
  );
}
