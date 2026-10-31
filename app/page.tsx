'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const lastUpdated = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin'
  }).format(new Date(process.env.NEXT_PUBLIC_BUILD_TIME!));

  const [showImpressum, setShowImpressum] = useState(false);

  return (
    <>
      <main className="fq-table min-h-screen flex items-center justify-center sm:px-6 sm:py-16">
        <div className="w-full max-w-2xl min-h-screen sm:min-h-0 flex flex-col justify-center px-5 py-10 sm:p-10 space-y-8 sm:space-y-10 text-center">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <LogoMark />
              <p className="text-sm font-bold tracking-[0.3em] text-ink/80">FLEX QUIZ</p>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-display text-ink leading-tight">
                Dein Quiz. Deine Regeln.
              </h1>
              <p className="text-lg text-ink/80 max-w-2xl mx-auto">
                Gelangweilt bei „Wer wird Millionär"? „Hitster" zum vierten Mal durchgespielt? Du bist ein echter Quizchamp und brauchst mehr?
              </p>
              <p className="text-base text-ink/90 max-w-2xl mx-auto font-semibold">
                Dann ist Flex Quiz genau das Richtige für dich! Dein Quiz. Deine Regeln.
              </p>
              <p className="text-base font-extrabold text-[#F5B700] mt-4">„Start. Flex. Win."</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/create"
              className="fq-primary sm:col-span-2 !min-h-[60px] !text-xl"
            >
              <span>Spiel erstellen</span>
            </Link>
            <SecondaryButton href="/app-settings" label="Einstellungen" />
            <SecondaryButton href="/rules" label="Spielregeln" />
          </div>

          <div className="flex justify-center">
            <SecondaryButton href="/highscores" label="🏆 Highscores" className="w-full sm:w-auto sm:px-10" />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-ink/60">
              Letzte Versionsänderung: {lastUpdated}
            </div>
            <div>
              <button
                onClick={() => setShowImpressum(true)}
                className="text-xs text-ink/60 hover:text-ink transition underline underline-offset-2"
              >
                Impressum
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Impressum Modal */}
      {showImpressum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowImpressum(false)}>
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#0d1424] border border-white/20 shadow-2xl p-8 text-left"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowImpressum(false)} className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl leading-none">×</button>
            <h2 className="text-xl font-display font-semibold text-white mb-5">Impressum</h2>
            <div className="space-y-4 text-sm text-white/70 leading-relaxed">
              <div>
                <p className="text-white/40 uppercase text-xs tracking-widest mb-1">Angaben gemäß § 5 TMG</p>
                <p className="text-white">Jonathan Mangold</p>
                <p>c/o Schenkenstraße 10</p>
                <p>74544 Michelbach, Deutschland</p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-xs tracking-widest mb-1">Vertreten durch</p>
                <p className="text-white">Jonathan Mangold</p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-xs tracking-widest mb-1">Kontakt</p>
                <p>E-Mail: <a href="mailto:info@wss-digital.de" className="text-cyan-400 hover:underline">info@wss-digital.de</a></p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-xs tracking-widest mb-1">Inhaltlich verantwortlich</p>
                <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Jonathan Mangold (Anschrift wie oben).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SecondaryButton({ href, label, className = '' }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl border-2 border-white/40 text-white font-bold px-5 py-4 bg-black/15 transition hover:border-white/80 hover:bg-black/25 ${className}`}
    >
      <span>{label}</span>
    </Link>
  );
}

function LogoMark() {
  return (
    <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 grid place-items-center backdrop-blur">
      <div className="relative h-8 w-8">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-500 opacity-90" aria-hidden />
        <span className="absolute inset-[6px] rounded-lg bg-white/80 mix-blend-screen" aria-hidden />
        <span className="absolute inset-[3px] rounded-[10px] border border-white/40" aria-hidden />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black tracking-[0.2em] text-ink">
          FQ
        </span>
      </div>
    </div>
  );
}
