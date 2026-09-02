'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './create.module.css';

const MODES = [
  {
    icon: '🕰️',
    title: 'Timeline Quiz',
    desc: 'Ordne Karten auf der Zeitachse ein',
    href: '/multiplayer?gameMode=timeline',
  },
  {
    icon: '🎮',
    title: 'Trivia Quiz',
    desc: 'Wissensfragen aus allen Kategorien',
    href: '/multiplayer?gameMode=trivia',
  },
  {
    icon: '🎉',
    title: 'Familienduell',
    desc: 'Ein Gerät, ein Spielleiter – Gruppen raten die Top-5-Antworten',
    href: '/familienduell',
  },
  {
    icon: '🤩',
    title: 'Mein Partner/meine Partnerin kann…',
    desc: 'Auktion um messbare Challenges – angelehnt an „Mein Mann kann"',
    href: '/partner-kann',
  },
  {
    icon: '🙊',
    title: 'Tabu',
    desc: 'Begriffe erklären gegen die Zeit – ohne die Tabu-Wörter zu sagen',
    href: '/tabu',
  },
  {
    icon: '🫙',
    title: 'Begriffe-Topf',
    desc: 'Eigene Begriffe einreichen, dann erklären, Pantomime, ein Wort',
    href: '/begriffe-topf',
  },
  {
    icon: '🕵️',
    title: 'Codenames',
    desc: 'Zwei Teams, ein Wortraster – Hinweise geben und die richtigen Begriffe finden',
    href: '/codenames',
  },
] as const;

export default function CreatePage() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>Spiel erstellen</h1>
          <p className={styles.intro}>Wähle einen Spielmodus</p>
        </div>

        <div className={styles.modeList}>
          {MODES.map((mode) => (
            <button
              key={mode.title}
              onClick={() => router.push(mode.href)}
              className={styles.modeCard}
            >
              <span className={styles.modeIcon}>{mode.icon}</span>
              <span className={styles.modeText}>
                <p className={styles.modeTitle}>{mode.title}</p>
                <p className={styles.modeDesc}>{mode.desc}</p>
              </span>
              <span className={styles.modeArrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
