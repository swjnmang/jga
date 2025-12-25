"use client";

import { MediaPreference } from '@/lib/types';

type Props = {
  value: MediaPreference;
  onChange: (value: MediaPreference) => void;
};

const options: { value: MediaPreference; label: string; helper: string }[] = [
  { value: 'auto', label: 'Auto', helper: 'Wählt automatisch verfügbare Quelle' },
  { value: 'youtube', label: 'YouTube', helper: 'Öffnet Embedded Player' },
  { value: 'spotify', label: 'Spotify', helper: 'Für Spotify Premium empfohlen' }
];

export function ServiceSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Medienquelle">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-2 text-left transition card-surface ${
              active ? 'border-ink bg-white' : 'border-transparent bg-white/80'
            }`}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            <div className="text-xs text-ink/60">{option.helper}</div>
          </button>
        );
      })}
    </div>
  );
}
