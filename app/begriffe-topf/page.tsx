'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createWordPotGame } from '@/lib/wordPotService';
import styles from './begriffetopf.module.css';

const MIN_GROUPS = 2;
const MAX_GROUPS = 10;
const MIN_WORDS = 3;
const MAX_WORDS = 15;
const MIN_SECONDS = 20;
const MAX_SECONDS = 90;
const SECONDS_STEP = 5;

export default function BegriffeTopfLandingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');

  const [groupCount, setGroupCount] = useState(3);
  const [groupNames, setGroupNames] = useState<string[]>(['Gruppe 1', 'Gruppe 2', 'Gruppe 3']);
  const [wordsPerPlayer, setWordsPerPlayer] = useState(5);
  const [roundSeconds, setRoundSeconds] = useState(45);
  const [hostName, setHostName] = useState('');
  const [hostGroupIndex, setHostGroupIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [joinPin, setJoinPin] = useState('');

  function updateGroupCount(next: number) {
    const clamped = Math.max(MIN_GROUPS, Math.min(MAX_GROUPS, next));
    setGroupCount(clamped);
    setGroupNames((prev) => {
      const names = [...prev];
      while (names.length < clamped) names.push(`Gruppe ${names.length + 1}`);
      return names.slice(0, clamped);
    });
    if (hostGroupIndex >= clamped) setHostGroupIndex(0);
  }

  function updateGroupName(index: number, name: string) {
    setGroupNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }

  async function handleCreate() {
    if (!hostName.trim()) {
      setError('Bitte gib deinen Namen ein.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const { pin, hostPlayerId } = await createWordPotGame({
        groupNames,
        wordsPerPlayer,
        roundSeconds,
        hostPlayerName: hostName,
        hostGroupIndex: hostGroupIndex,
      });
      window.localStorage.setItem('wordpot_session', JSON.stringify({ pin, playerId: hostPlayerId }));
      router.push(`/begriffe-topf/${pin}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Spiel konnte nicht erstellt werden.');
      setCreating(false);
    }
  }

  function handleJoin() {
    const pin = joinPin.trim().toUpperCase();
    if (!pin) {
      setError('Bitte gib einen PIN ein.');
      return;
    }
    router.push(`/begriffe-topf/${pin}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>🫙 Begriffe-Topf</h1>
        </div>

        <p className={styles.intro}>
          Jede Gruppe reicht vorher eigene Begriffe ein, die in einem gemeinsamen Topf landen.
          Danach wird in 3 Runden geraten – erst erklären, dann Pantomime, zum Schluss nur ein
          Wort. Jeder Mitspieler tritt mit dem eigenen Handy über einen PIN bei.
        </p>

        <div className={styles.toggleRow}>
          <button onClick={() => setTab('create')} className={tab === 'create' ? styles.toggleBtnOn : styles.toggleBtn}>
            Spiel erstellen
          </button>
          <button onClick={() => setTab('join')} className={tab === 'join' ? styles.toggleBtnOn : styles.toggleBtn}>
            Spiel beitreten
          </button>
        </div>

        {tab === 'create' && (
          <>
            <div className={styles.section}>
              <p className={styles.label}>Anzahl Gruppen</p>
              <div className={styles.stepperRow}>
                <button onClick={() => updateGroupCount(groupCount - 1)} disabled={groupCount <= MIN_GROUPS} className={styles.stepperBtn}>
                  −
                </button>
                <span className={styles.stepperVal}>{groupCount}</span>
                <button onClick={() => updateGroupCount(groupCount + 1)} disabled={groupCount >= MAX_GROUPS} className={styles.stepperBtn}>
                  +
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Gruppennamen</p>
              <div className={styles.fieldList}>
                {groupNames.map((name, i) => (
                  <input
                    key={i}
                    value={name}
                    onChange={(e) => updateGroupName(i, e.target.value)}
                    placeholder={`Gruppe ${i + 1}`}
                    className={styles.field}
                  />
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Begriffe pro Person</p>
              <div className={styles.stepperRow}>
                <button
                  onClick={() => setWordsPerPlayer((n) => Math.max(MIN_WORDS, n - 1))}
                  disabled={wordsPerPlayer <= MIN_WORDS}
                  className={styles.stepperBtn}
                >
                  −
                </button>
                <span className={styles.stepperVal}>{wordsPerPlayer}</span>
                <button
                  onClick={() => setWordsPerPlayer((n) => Math.min(MAX_WORDS, n + 1))}
                  disabled={wordsPerPlayer >= MAX_WORDS}
                  className={styles.stepperBtn}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Rundenzeit</p>
              <div className={styles.stepperRow}>
                <button
                  onClick={() => setRoundSeconds((s) => Math.max(MIN_SECONDS, s - SECONDS_STEP))}
                  disabled={roundSeconds <= MIN_SECONDS}
                  className={styles.stepperBtn}
                >
                  −
                </button>
                <span className={styles.stepperVal}>{roundSeconds}s</span>
                <button
                  onClick={() => setRoundSeconds((s) => Math.min(MAX_SECONDS, s + SECONDS_STEP))}
                  disabled={roundSeconds >= MAX_SECONDS}
                  className={styles.stepperBtn}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Dein Name</p>
              <input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="z.B. Anna"
                className={styles.field}
              />
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Deine Gruppe</p>
              <div className={styles.groupList}>
                {groupNames.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => setHostGroupIndex(i)}
                    className={i === hostGroupIndex ? styles.groupOptionActive : styles.groupOption}
                  >
                    <span className={styles.groupOptionName}>{name.trim() || `Gruppe ${i + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button onClick={handleCreate} disabled={creating} className={styles.primaryBtn}>
              {creating ? 'Erstelle Spiel …' : 'Spiel erstellen →'}
            </button>
          </>
        )}

        {tab === 'join' && (
          <>
            <div className={styles.section}>
              <p className={styles.label}>PIN vom Spielleiter</p>
              <input
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
                placeholder="z.B. AB12CD"
                maxLength={8}
                className={styles.fieldPin}
              />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            <button onClick={handleJoin} className={styles.primaryBtn}>
              Weiter →
            </button>
          </>
        )}
      </div>
    </main>
  );
}
