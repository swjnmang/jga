'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-grid flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-glass border border-ink/10 shadow-2xl backdrop-blur-xl p-10 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80 transition mb-4"
          >
            ← Zurück
          </Link>
          <h1 className="text-3xl font-display font-semibold text-ink">Spiel erstellen</h1>
          <p className="text-sm text-ink/60">Wähle einen Spielmodus</p>
        </div>

        {/* Mode cards */}
        <div className="space-y-4">
          {/* Timeline Multiplayer */}
          <button
            onClick={() => router.push('/multiplayer?gameMode=timeline')}
            className="group w-full flex items-start gap-4 rounded-2xl border border-ink/10 bg-ink/5 hover:bg-ink/10 hover:border-ink/25 px-6 py-5 transition text-left"
          >
            <span className="text-2xl mt-0.5">🕰️</span>
            <div>
              <p className="font-semibold text-ink group-hover:text-ink/90">Timeline Multiplayer</p>
              <p className="text-sm text-ink/60 mt-0.5">Ordne Karten auf der Zeitachse ein</p>
            </div>
            <span className="ml-auto text-ink/30 group-hover:translate-x-0.5 transition self-center">→</span>
          </button>

          {/* Trivia Multiplayer */}
          <button
            onClick={() => router.push('/multiplayer?gameMode=trivia')}
            className="group w-full flex items-start gap-4 rounded-2xl border border-ink/10 bg-ink/5 hover:bg-ink/10 hover:border-ink/25 px-6 py-5 transition text-left"
          >
            <span className="text-2xl mt-0.5">🎮</span>
            <div>
              <p className="font-semibold text-ink group-hover:text-ink/90">Trivia Multiplayer</p>
              <p className="text-sm text-ink/60 mt-0.5">Wissensfragen aus allen Kategorien</p>
            </div>
            <span className="ml-auto text-ink/30 group-hover:translate-x-0.5 transition self-center">→</span>
          </button>

          {/* Familienduell – lokal, ein Gerät */}
          <Link
            href="/familienduell"
            className="group w-full flex items-start gap-4 rounded-2xl border border-ink/10 bg-ink/5 hover:bg-ink/10 hover:border-ink/25 px-6 py-5 transition text-left"
          >
            <span className="text-2xl mt-0.5">🎉</span>
            <div>
              <p className="font-semibold text-ink group-hover:text-ink/90">Familienduell</p>
              <p className="text-sm text-ink/60 mt-0.5">
                Ein Gerät, ein Spielleiter – Gruppen raten die Top-5-Antworten
              </p>
            </div>
            <span className="ml-auto text-ink/30 group-hover:translate-x-0.5 transition self-center">→</span>
          </Link>

          {/* Mein Partner/meine Partnerin kann – lokal, ein Gerät */}
          <Link
            href="/partner-kann"
            className="group w-full flex items-start gap-4 rounded-2xl border border-ink/10 bg-ink/5 hover:bg-ink/10 hover:border-ink/25 px-6 py-5 transition text-left"
          >
            <span className="text-2xl mt-0.5">🤩</span>
            <div>
              <p className="font-semibold text-ink group-hover:text-ink/90">
                Mein Partner/meine Partnerin kann…
              </p>
              <p className="text-sm text-ink/60 mt-0.5">
                Auktion um messbare Challenges – angelehnt an „Mein Mann kann"
              </p>
            </div>
            <span className="ml-auto text-ink/30 group-hover:translate-x-0.5 transition self-center">→</span>
          </Link>

          {/* Solo – coming soon */}
          <div className="w-full flex items-start gap-4 rounded-2xl border border-ink/5 bg-ink/[0.03] px-6 py-5 opacity-40 cursor-not-allowed select-none">
            <span className="text-2xl mt-0.5">🎯</span>
            <div>
              <p className="font-semibold text-ink">Solo Modus</p>
              <p className="text-sm text-ink/60 mt-0.5">Bald verfügbar</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
