// Gemeinsame Bausteine des "Spieltisch"-Designs (Trivia + Timeline):
// Punkte-Chips, Timer-Pill, Kategorie-Chip, Joker-Karten und Bestätigungsdialog.
import React from 'react';

type StripGroup = { id: string; name: string; color?: string };

export function ScoreStrip({
  groups,
  activeGroupId,
  myGroupId,
  value,
  sub,
}: {
  groups: StripGroup[];
  activeGroupId?: string | null;
  myGroupId?: string | null;
  value: (groupId: string) => React.ReactNode;
  /** Zweite Zeile für nicht aktive Gruppen (z. B. "1 Flex übrig"). */
  sub?: (groupId: string) => React.ReactNode;
}) {
  return (
    <div className="fq-chips" role="list" aria-label="Punktestand">
      {groups.map(g => {
        const isActive = g.id === activeGroupId;
        const isMine = g.id === myGroupId;
        const subline = isActive ? (isMine ? 'Ihr seid dran' : 'Am Zug') : (sub?.(g.id) ?? (isMine ? 'Ihr' : null));
        return (
          <div key={g.id} role="listitem" className={`fq-player ${isActive ? 'fq-player--turn' : ''}`}>
            <span className="fq-chip" style={{ '--c': g.color ?? '#E5484D' } as React.CSSProperties}>{value(g.id)}</span>
            <span className="min-w-0">
              <b>{g.name}{isMine && !isActive ? ' (ihr)' : ''}</b>
              {subline && <span className="fq-player-sub">{subline}</span>}
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
      className={`inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full px-3 text-[15px] font-extrabold tabular-nums ${
        urgent ? 'bg-[#E5484D] text-white animate-pulse' : 'bg-[#1B1B2F] text-white'
      }`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" />
      </svg>
      {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
    </span>
  );
}

export function CategoryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#5B5B70]">
      {children}
    </span>
  );
}

export function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#1B1B2F]/20 px-2 py-0.5 text-xs font-semibold text-[#5B5B70]">
      {children}
    </span>
  );
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function JokerIcon({ kind, size = 20 }: { kind: 'newQuestion' | 'next' | 'dice' | 'steal' | 'flex'; size?: number }) {
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

/** Joker als Spielkarte (Kartenrücken). `waitProgress` (0–1) zeigt eine Sperrzeit als Balken. */
export function JokerButton({
  kind,
  label,
  available,
  disabled,
  title,
  onClick,
  highlight,
  waitProgress,
}: {
  kind: 'newQuestion' | 'next' | 'dice' | 'steal' | 'flex';
  label: string;
  available: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  highlight?: boolean;
  waitProgress?: number;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title ? `${label}: ${title}` : label}
      onClick={onClick}
      disabled={!available || disabled}
      className={`fq-joker ${!available ? 'fq-joker--used' : highlight ? 'fq-joker--hot' : ''}`}
    >
      <JokerIcon kind={kind} />
      <span>{label}</span>
      {waitProgress !== undefined && waitProgress < 1 && (
        <i className="fq-joker-wait" style={{ width: `${Math.round(waitProgress * 100)}%` }} aria-hidden="true" />
      )}
    </button>
  );
}

/** In-App-Bestätigung statt window.confirm (lässt sich auf allen Geräten bedienen und gestalten). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Abbrechen',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fq-dialog-backdrop" onClick={onCancel}>
      <div
        className="fq-dialog space-y-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="fq-dialog-title"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.key === 'Escape' && onCancel()}
      >
        <div className="space-y-1.5">
          <h2 id="fq-dialog-title" className="text-xl font-extrabold">{title}</h2>
          {message && <p className="text-[15px] text-[#5B5B70]">{message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" className="fq-secondary" onClick={onCancel} autoFocus>{cancelLabel}</button>
          <button
            type="button"
            className="min-h-[46px] rounded-xl border-2 border-[#1B1B2F] bg-[#E5484D] px-3 font-extrabold text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
