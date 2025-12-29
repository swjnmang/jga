"use client";

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@yudiel/react-qr-scanner').then((m) => m.Scanner), {
  ssr: false
});

export default function ScanPage() {
  const [manual, setManual] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback(
    (text: string) => {
      if (!text) return;
      try {
        setError(null);
        if (typeof window !== 'undefined') {
          window.location.href = text;
        }
      } catch (err: unknown) {
        setError('Konnte URL nicht öffnen.');
      }
    },
    []
  );

  return (
    <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Scan</p>
        <h1 className="text-3xl font-display">Spiel starten</h1>
        <p className="text-sm text-ink/70">
          Erlaube den Kamerazugriff, scanne eine Karte und starte den 3-Minuten-Timer automatisch.
        </p>
      </div>

      <div className="card-surface rounded-2xl p-4 space-y-3">
        <QrScanner
          constraints={{ facingMode: 'environment' }}
          components={{ finder: false, torch: true, zoom: true }}
          onScan={(results) => {
            const [first] = results;
            if (first?.rawValue) handleResult(first.rawValue);
          }}
          onError={(err) => setError((err as { message?: string } | undefined)?.message ?? 'Scan-Fehler')}
          styles={{ container: { width: '100%' }, video: { borderRadius: '16px' } }}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="card-surface rounded-2xl p-4 space-y-3">
        <p className="text-sm text-ink/70">Falls der Scanner nicht funktioniert:</p>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="flex-1 rounded-xl border border-ink/20 px-3 py-2"
            placeholder="https://..."
          />
          <button
            type="button"
            className="rounded-xl bg-ink text-sand px-4 py-2"
            onClick={() => handleResult(manual)}
          >
            Öffnen
          </button>
        </div>
      </div>
    </main>
  );
}
