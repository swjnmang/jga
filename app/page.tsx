import Link from 'next/link';

export default function HomePage() {
  const lastUpdated = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin'
  }).format(new Date());

  return (
    <main className="min-h-screen bg-grid flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl rounded-3xl bg-glass border border-white/20 shadow-2xl backdrop-blur-xl p-10 md:p-14 space-y-10 text-center">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <LogoMark />
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Flex Quiz</p>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-white leading-tight">
              Dein Spiel. Deine Regeln.
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Schnell starten. Smart flexen. Das schnelle Quiz für Teams, die Regeln lieben und brechen.
            </p>
            <p className="text-sm text-white/60 tracking-wide uppercase">„Start. Flex. Win.“</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PrimaryButton href="/play" label="Neues Spiel starten" />
          <SecondaryButton href="/settings" label="Einstellungen" />
          <SecondaryButton href="/rules" label="Spielregeln" />
        </div>

        <div className="text-xs text-white/60">
          Letzte Versionsänderung: {lastUpdated}
        </div>
      </div>
    </main>
  );
}

function PrimaryButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-center rounded-xl bg-white text-[#0b1021] font-semibold px-5 py-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-black/20"
    >
      <span>{label}</span>
      <span className="ml-2 text-ink/60 transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

function SecondaryButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-white/30 text-white font-semibold px-5 py-4 bg-white/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60"
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
