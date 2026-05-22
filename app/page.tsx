'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const lastUpdated = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin'
  }).format(new Date());

  const router = useRouter();
  const [showRules, setShowRules] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-grid flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl rounded-3xl bg-glass border border-ink/10 shadow-2xl backdrop-blur-xl p-10 md:p-14 space-y-10 text-center">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <LogoMark />
              <p className="text-sm uppercase tracking-[0.3em] text-ink/70">Flex Quiz</p>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-display font-semibold text-ink leading-tight">
                Dein Quiz. Deine Regeln.
              </h1>
              <p className="text-lg text-ink/80 max-w-2xl mx-auto">
                Gelangweilt bei „Wer wird Millionär"? „Hitster" zum vierten Mal durchgespielt? Du bist ein echter Quizchamp und brauchst mehr?
              </p>
              <p className="text-base text-ink/90 max-w-2xl mx-auto font-semibold">
                Dann ist Flex Quiz genau das Richtige für dich! Dein Quiz. Deine Regeln.
              </p>
              <p className="text-sm text-ink/60 tracking-wide uppercase mt-4">„Start. Flex. Win."</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="group inline-flex items-center justify-center rounded-xl btn-primary text-inkDark font-semibold px-5 py-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-black/20"
            >
              <span>Spiel erstellen</span>
              <span className="ml-2 text-inkDark/60 transition group-hover:translate-x-0.5">→</span>
            </button>
            <Link
              href="/multiplayer?open=join"
              className="group inline-flex items-center justify-center rounded-xl btn-primary text-inkDark font-semibold px-5 py-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-black/20"
            >
              <span>Spiel beitreten</span>
              <span className="ml-2 text-inkDark/60 transition group-hover:translate-x-0.5">→</span>
            </Link>
            <SecondaryButton href="/app-settings" label="Einstellungen" />
            <button
              onClick={() => setShowRules(true)}
              className="inline-flex items-center justify-center rounded-xl border border-ink/30 text-ink font-semibold px-5 py-4 bg-ink/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-ink/60"
            >
              Spielregeln
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-ink/60">
              Letzte Versionsänderung: {lastUpdated}
            </div>
            <div>
              <button
                onClick={() => setShowImpressum(true)}
                className="text-xs text-ink/30 hover:text-ink/60 transition underline underline-offset-2"
              >
                Impressum
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Spiel erstellen Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#0d1424] border border-white/20 shadow-2xl p-8 text-left"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl leading-none">×</button>
            <h2 className="text-xl font-display font-semibold text-white mb-2">Spiel erstellen</h2>
            <p className="text-sm text-white/60 mb-6">Wähle einen Spielmodus</p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowCreateModal(false); router.push('/multiplayer?gameMode=timeline'); }}
                className="w-full flex flex-col items-start rounded-xl bg-cyan-500/10 border border-cyan-400/40 hover:border-cyan-400 px-5 py-4 transition text-left"
              >
                <span className="font-bold text-white">🕰️ Timeline Multiplayer</span>
                <span className="text-xs text-white/60 mt-1">Ordne Karten auf der Zeitachse ein</span>
              </button>
              <button
                onClick={() => { setShowCreateModal(false); router.push('/multiplayer?gameMode=trivia'); }}
                className="w-full flex flex-col items-start rounded-xl bg-violet-500/10 border border-violet-400/40 hover:border-violet-400 px-5 py-4 transition text-left"
              >
                <span className="font-bold text-white">🎮 Trivia Multiplayer</span>
                <span className="text-xs text-white/60 mt-1">Wissensfragen aus allen Kategorien</span>
              </button>
              <div className="w-full flex flex-col items-start rounded-xl bg-white/5 border border-white/10 px-5 py-4 opacity-40 cursor-not-allowed">
                <span className="font-bold text-white">🎯 Solo Modus</span>
                <span className="text-xs text-white/60 mt-1">Bald verfügbar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spielregeln Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0d1424] border border-white/20 shadow-2xl p-8 text-left"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl leading-none">×</button>
            <h2 className="text-2xl font-display font-semibold text-white mb-6">📖 Spielregeln</h2>

            <section className="mb-8">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">🕰️ Timeline-Modus</h3>
              <div className="space-y-3 text-white/80 text-sm leading-relaxed">
                <p><strong className="text-white">Ziel:</strong> Ordne Karten (Songs, Ereignisse, Fakten) korrekt in einer Zeitachse an. Wer als Erstes <strong className="text-white">7 Karten</strong> richtig platziert hat, gewinnt.</p>
                <p><strong className="text-white">Ablauf:</strong> Die aktive Gruppe bekommt eine Karte gezeigt und muss sie an der richtigen Stelle in ihrer persönlichen Zeitreihe einordnen. Liegt die Karte falsch, kommt sie aus dem Spiel und die nächste Gruppe ist dran.</p>
                <p><strong className="text-white">Kategorien:</strong> Songs, Schätzfragen, Geografie, Filme & Serien u.v.m. wechseln zufällig ab – jede Runde eine Überraschung.</p>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-2">
                  <p className="font-bold text-yellow-300 mb-2">⚡ Flex-Tipps (für nicht aktive Gruppen)</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Während die aktive Gruppe überlegt, können alle anderen Gruppen einen <strong className="text-white">Flex-Tipp</strong> abgeben.</li>
                    <li>Ein Flex-Tipp bedeutet: Du tippst, an welcher Position in der Zeitachse der <strong className="text-white">aktiven Gruppe</strong> die Karte eingeordnet wird.</li>
                    <li>Liegt dein Flex-Tipp richtig, bekommst du die Karte gutgeschrieben – auch wenn die aktive Gruppe falsch lag.</li>
                    <li>Flex-Tipps können nur abgegeben werden, <strong className="text-white">bevor</strong> der Host die Auswertung startet.</li>
                    <li>Die eigene Platzierung der aktiven Gruppe kann nicht als Flex-Tipp gewählt werden.</li>
                  </ul>
                </div>

                <p><strong className="text-white">Punkte / Kategorien:</strong> Oben in der Übersicht siehst du, welche Kategorien du bereits abgedeckt hast. Es gibt keine Kategoriepflicht – die Reihenfolge ist vollständig zufällig.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-violet-300 mb-3">🎮 Trivia-Modus</h3>
              <div className="space-y-3 text-white/80 text-sm leading-relaxed">
                <p><strong className="text-white">Ziel:</strong> Beantworte Wissensfragen aus verschiedenen Kategorien. Die Gruppe mit den meisten richtigen Antworten am Ende gewinnt.</p>
                <p><strong className="text-white">Ablauf:</strong> Jede Gruppe ist reihum an der Reihe. Die aktive Gruppe sieht die Frage und wählt eine Antwort aus vier Optionen (Multiple Choice). Der Host deckt anschließend die Lösung auf.</p>
                <p><strong className="text-white">Kategorien:</strong> Sport, Musik, Geografie, Film & Serien, Schätzfragen, Zitate, Religion, Natur & Technik und mehr.</p>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-2">
                  <p className="font-bold text-yellow-300 mb-2">⚡ Flex-Tipps (für nicht aktive Gruppen)</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Auch im Trivia-Modus können nicht aktive Gruppen einen <strong className="text-white">Flex-Tipp</strong> abgeben.</li>
                    <li>Du tippst, welche Antwort die aktive Gruppe wählen wird.</li>
                    <li>Liegt dein Tipp richtig (d.h. die aktive Gruppe antwortet korrekt und du hast dasselbe gewählt), bekommst du ebenfalls einen Punkt.</li>
                    <li>Flex-Tipps müssen vor der Auswertung durch den Host abgegeben werden.</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-2">
                  <p className="font-bold text-orange-300 mb-2">🏆 Schätzfragen</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bei Schätzfragen gibt jede Gruppe eine freie Zahl ein.</li>
                    <li>Gewonnen hat die Gruppe, deren Schätzung <strong className="text-white">am nächsten an der richtigen Antwort</strong> liegt.</li>
                    <li>Die Einheit ist immer in der Frage angegeben – bitte genau lesen!</li>
                  </ul>
                </div>

                <p><strong className="text-white">Spielende:</strong> Das Spiel endet, wenn alle Fragen gespielt wurden oder der Host das Spiel beendet. Sieger ist die Gruppe mit den meisten Punkten.</p>
              </div>
            </section>
          </div>
        </div>
      )}

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

function SecondaryButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-ink/30 text-ink font-semibold px-5 py-4 bg-ink/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-ink/60"
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
