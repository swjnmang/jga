"use client";

import { useEffect, useState } from 'react';

const DURATION_SECONDS = 180;

type Props = {
  autoStart?: boolean;
};

export function Countdown({ autoStart = true }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [running, setRunning] = useState(autoStart);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (autoStart) {
      setRunning(true);
    }
  }, [autoStart]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl font-display tabular-nums">{minutes}:{seconds}</div>
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          className="rounded-full border border-ink/20 px-3 py-1"
          onClick={() => {
            setSecondsLeft(DURATION_SECONDS);
            setRunning(true);
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-full border border-ink/20 px-3 py-1"
          onClick={() => setRunning((v) => !v)}
        >
          {running ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}
